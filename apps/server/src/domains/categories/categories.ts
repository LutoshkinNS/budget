import type { preValidationAsyncHookHandler } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import Category from '#s/Category.js';
import CategoryCreate from '#s/CategoryCreate.js';
import CategoryIconKey from '#s/CategoryIconKey.js';
import CategoryUpdate from '#s/CategoryUpdate.js';
import ConflictError from '#s/ConflictError.js';
import idObj from '#s/idObj.js';
import NotFoundError from '#s/NotFoundError.js';
import ValidationError from '#s/ValidationError.js';
import { FastifyApp } from '#src/appInit.js';

import { normalizeCategoryName } from './categoryName.js';

type IconKey = (typeof CategoryIconKey.enum)[number];

function isIconKey(value: unknown): value is IconKey {
  return CategoryIconKey.enum.some((key) => key === value);
}

function hasInvalidIconKey(body: unknown) {
  return (
    typeof body === 'object' &&
    body !== null &&
    'iconKey' in body &&
    body.iconKey !== null &&
    !isIconKey(body.iconKey)
  );
}

// Проверяем исходное значение: AJV может превратить пустую строку в null.
const validateIconKey: preValidationAsyncHookHandler = async (req, reply) => {
  if (hasInvalidIconKey(req.body)) {
    return reply.code(400).send({
      code: 'VALIDATION_ERROR',
      message: 'Invalid category icon key',
      statusCode: 400
    });
  }
};

function serializeCategory(category: {
  id: number;
  accountId: number;
  type: string;
  name: string;
  iconKey: string | null;
}): FromSchema<typeof Category> {
  if (category.type !== 'income' && category.type !== 'expense') {
    throw new Error('Invalid category type');
  }

  return {
    id: category.id,
    accountId: category.accountId,
    type: category.type,
    name: category.name,
    iconKey: isIconKey(category.iconKey) ? category.iconKey : null
  };
}

export default async function categoriesModule(app: FastifyApp) {
  app.addHook('preHandler', app.authenticate);

  app.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['income', 'expense'] }
          },
          additionalProperties: false
        },
        response: { 200: { type: 'array', items: Category } }
      }
    },
    async function (req) {
      const categories = await this.prisma.transactionCategory.findMany({
        where: {
          accountId: req.user.accountId,
          deletedAt: null,
          ...(req.query.type === undefined ? {} : { type: req.query.type })
        }
      });

      return categories.map(serializeCategory);
    }
  );

  app.get(
    '/:id',
    {
      schema: {
        params: idObj,
        response: { 200: Category }
      }
    },
    async function (req) {
      const category = await this.prisma.transactionCategory.findFirstOrThrow({
        where: {
          id: req.params.id,
          accountId: req.user.accountId,
          deletedAt: null
        }
      });

      return serializeCategory(category);
    }
  );

  app.post(
    '/',
    {
      preValidation: validateIconKey,
      schema: {
        body: CategoryCreate,
        response: { 200: Category, 400: ValidationError, 409: ConflictError }
      }
    },
    async function (req, reply) {
      const accountId = req.user.accountId;
      const name = req.body.name.trim();
      const normalizedName = normalizeCategoryName(req.body.name);

      const existingCategory = await this.prisma.transactionCategory.findFirst({
        where: {
          accountId,
          deletedAt: null,
          type: req.body.type,
          nameNormalized: normalizedName
        }
      });

      if (existingCategory) {
        return reply.code(409).send({
          code: 'CATEGORY_ALREADY_EXISTS',
          message: 'Category already exists',
          statusCode: 409
        });
      }

      const category = await this.prisma.transactionCategory.create({
        data: {
          name,
          nameNormalized: normalizedName,
          type: req.body.type,
          iconKey: req.body.iconKey ?? null,
          accountId
        }
      });

      return serializeCategory(category);
    }
  );

  app.patch(
    '/:id',
    {
      preValidation: validateIconKey,
      schema: {
        params: idObj,
        body: CategoryUpdate,
        response: {
          200: Category,
          400: ValidationError,
          404: NotFoundError,
          409: ConflictError
        }
      }
    },
    async function (req, reply) {
      const name = req.body.name?.trim();
      if (
        (name === undefined && req.body.iconKey === undefined) ||
        name === ''
      ) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: 'Provide a non-empty name or an icon key',
          statusCode: 400
        });
      }
      const where = {
        id: req.params.id,
        accountId: req.user.accountId,
        deletedAt: null
      };
      const existing = await this.prisma.transactionCategory.findFirst({
        where
      });
      if (!existing) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Category not found or access denied',
          statusCode: 404
        });
      }
      const nameNormalized =
        name === undefined ? undefined : normalizeCategoryName(name);
      const conflict = () =>
        reply.code(409).send({
          code: 'CATEGORY_ALREADY_EXISTS',
          message: 'Category already exists',
          statusCode: 409
        });
      if (nameNormalized !== undefined) {
        const duplicate = await this.prisma.transactionCategory.findFirst({
          where: {
            accountId: req.user.accountId,
            type: existing.type,
            deletedAt: null,
            nameNormalized,
            id: { not: existing.id }
          }
        });
        if (duplicate) return conflict();
      }
      let result;
      try {
        result = await this.prisma.transactionCategory.updateMany({
          where,
          data: {
            ...(name === undefined || nameNormalized === undefined
              ? {}
              : { name, nameNormalized }),
            ...(req.body.iconKey === undefined
              ? {}
              : { iconKey: req.body.iconKey })
          }
        });
      } catch (error) {
        // Уникальный индекс защищает также от одновременных переименований.
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'P2002'
        ) {
          return conflict();
        }
        throw error;
      }
      const category =
        result.count > 0
          ? await this.prisma.transactionCategory.findFirst({ where })
          : null;

      if (!category) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Category not found or access denied',
          statusCode: 404
        });
      }

      return serializeCategory(category);
    }
  );

  app.delete(
    '/:id',
    {
      schema: {
        params: idObj,
        response: { 204: { type: 'null' } }
      }
    },
    async function (req, reply) {
      await this.prisma.transactionCategory.updateMany({
        where: {
          id: req.params.id,
          accountId: req.user.accountId,
          deletedAt: null
        },
        data: {
          deletedAt: new Date()
        }
      });

      return reply.code(204).send(null);
    }
  );
}
