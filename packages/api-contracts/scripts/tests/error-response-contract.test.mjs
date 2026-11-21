import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const OPEN_API_PATH = new URL(
  "../../generated/@typespec/openapi3/openapi.json",
  import.meta.url,
);
const JSON_CONTENT_TYPE = "application/json";
const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";
const PUBLIC_CLIENT_EVENT = "Auth_clientEvent";
const METHODS_WITH_BODY = new Set(["post", "patch", "delete"]);
const ERROR_SCHEMAS = new Map([
  [400, "ValidationError"],
  [401, "UnauthorizedError"],
  [413, "PayloadTooLargeError"],
  [415, "UnsupportedMediaTypeError"],
  [500, "InternalServerError"],
]);
const MESSAGE_DEFAULTS = {
  ValidationError: "Некорректные параметры запроса.",
  NotFoundError: "Запрошенный ресурс не найден.",
  InternalServerError: "Внутренняя ошибка сервера.",
  PayloadTooLargeError: "Размер запроса превышает допустимый.",
  UnsupportedMediaTypeError: "Неподдерживаемый формат данных запроса.",
  UnauthorizedError: "Требуется действительная авторизация.",
};
const BUSINESS = {
  category: {
    schema: "CategoryAlreadyExistsError",
    code: "CATEGORY_ALREADY_EXISTS",
    status: 409,
  },
  invitation: {
    schema: "InvitationNotFoundError",
    code: "INVITATION_NOT_FOUND",
    status: 404,
  },
};
const EXPECTED_OPERATIONS = [
  "Accounts_list",
  "Accounts_listMembers",
  "Accounts_createInvitation",
  "Accounts_redeemInvitation",
  "Accounts_update",
  "Categories_list",
  "Categories_get",
  "Categories_create",
  "Categories_update",
  "Categories_delete",
  "CategorySubcategories_list",
  "CategorySubcategories_get",
  "CategorySubcategories_create",
  "CategorySubcategories_delete",
  "Transactions_list",
  "Transactions_categorySummary",
  "Transactions_summary",
  "Transactions_get",
  "Transactions_create",
  "Transactions_update",
  "Transactions_delete",
  PUBLIC_CLIENT_EVENT,
  "Auth_login",
  "Auth_refresh",
  "Auth_logout",
  "Auth_me",
];

function resolveSchema(contract, schema) {
  if (schema.$ref)
    return resolveSchema(
      contract,
      contract.components.schemas[
        schema.$ref.slice(SCHEMA_REFERENCE_PREFIX.length)
      ],
    );
  if (!schema.allOf) return schema;
  const parts = schema.allOf.map((part) => resolveSchema(contract, part));
  return {
    ...schema,
    properties: Object.assign(
      {},
      ...parts.map((part) => part.properties ?? {}),
      schema.properties ?? {},
    ),
    required: [
      ...new Set([
        ...parts.flatMap((part) => part.required ?? []),
        ...(schema.required ?? []),
      ]),
    ],
  };
}

async function loadContract() {
  return JSON.parse(await readFile(OPEN_API_PATH, "utf8"));
}

test("auth login retains an unauthorized response without a technical business code", async () => {
  const contract = await loadContract();
  const response = contract.paths["/api/v1/auth/login"].post.responses[401];
  assert.ok(response);
  const schema = resolveSchema(
    contract,
    response.content[JSON_CONTENT_TYPE].schema,
  );
  assert.ok(schema.required.includes("message"));
  assert.ok(schema.required.includes("statusCode"));
  assert.equal(schema.required.includes("code"), false);
});

test("infrastructure messages remain required free text with TypeSpec defaults", async () => {
  const contract = await loadContract();
  for (const [name, expectedDefault] of Object.entries(MESSAGE_DEFAULTS)) {
    const schema = resolveSchema(contract, contract.components.schemas[name]);
    assert.ok(schema, `Missing generated schema ${name}`);
    assert.ok(schema.required.includes("message"));
    assert.equal(schema.required.includes("code"), false);
    assert.deepEqual(schema.properties.message, {
      type: "string",
      default: expectedDefault,
    });
  }
});

test("business errors retain exact code and HTTP status while technical token schemas disappear", async () => {
  const contract = await loadContract();
  for (const { schema: name, code, status } of Object.values(BUSINESS)) {
    const schema = resolveSchema(contract, contract.components.schemas[name]);
    assert.ok(schema.required.includes("code"));
    assert.deepEqual(schema.properties.code.enum, [code]);
    assert.deepEqual(schema.properties.statusCode.enum, [status]);
    assert.ok(schema.required.includes("message"));
  }
  assert.equal(
    Object.hasOwn(contract.components.schemas, "MissingTokenError"),
    false,
  );
  assert.equal(
    Object.hasOwn(contract.components.schemas, "InvalidTokenError"),
    false,
  );
});

test("every published operation describes its reachable framework and authentication errors", async () => {
  const contract = await loadContract();
  const operations = Object.values(contract.paths).flatMap((path) =>
    Object.entries(path).map(([method, operation]) => ({
      method,
      ...operation,
    })),
  );
  assert.deepEqual(
    operations.map(({ operationId }) => operationId).sort(),
    [...EXPECTED_OPERATIONS].sort(),
  );
  for (const operation of operations) {
    const statuses = [400, 500];
    if (operation.operationId !== PUBLIC_CLIENT_EVENT) statuses.push(401);
    if (METHODS_WITH_BODY.has(operation.method)) statuses.push(413, 415);
    for (const status of statuses) {
      const response = operation.responses[status];
      assert.ok(response, `${operation.operationId} is missing HTTP${status}`);
      assert.deepEqual(response.content[JSON_CONTENT_TYPE].schema, {
        $ref: SCHEMA_REFERENCE_PREFIX + ERROR_SCHEMAS.get(status),
      });
      const body = resolveSchema(
        contract,
        response.content[JSON_CONTENT_TYPE].schema,
      );
      assert.ok(body.required.includes("message"));
      assert.ok(body.required.includes("statusCode"));
      assert.equal(body.required.includes("code"), false);
      assert.equal(body.properties.statusCode.type, "number");
      assert.equal(body.properties.message.type, "string");
    }
  }
});
