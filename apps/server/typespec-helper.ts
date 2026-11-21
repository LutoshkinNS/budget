import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { $RefParser } from '@apidevtools/json-schema-ref-parser';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const contractsRoot = path.resolve(
  serverDirectory,
  '../../packages/api-contracts/generated/@typespec'
);
const serverRoot = path.join(serverDirectory, 'generated', '@typespec');
const from = path.join(contractsRoot, 'openapi3', 'openapi.json');
const components = path.join(serverRoot, 'components');
const to = path.join(serverRoot, 'ts-schemas');
const obsoleteRuntimeErrorCodeArtifacts = [
  path.resolve(
    serverDirectory,
    '../../packages/api-contracts/generated/runtime/error-codes.ts'
  ),
  path.join(to, 'error-codes.ts')
];

if (process.argv.includes('--generateTsSchemas')) {
  await extractEntitiesFromOpenApi();
} else {
  console.log(
    'What do you want? Add --generateTsSchemas to generate typescript schemas'
  );
}

async function extractEntitiesFromOpenApi() {
  await mkdir(components, { recursive: true });
  await mkdir(to, { recursive: true });

  const openApi = JSON.parse((await readFile(from)).toString('utf8'));
  const files: string[] = [];
  const activeSchemaNames = new Set(Object.keys(openApi.components.schemas));

  await removeObsoleteSchemas(components, activeSchemaNames, '.json');
  await removeObsoleteSchemas(to, activeSchemaNames, '.ts');

  for (const name in openApi.components.schemas) {
    const componentPath = path.join(components, `${name}.json`);
    files.push(`${name}.json`);

    const schema = openApi.components.schemas[name];

    if (JSON.stringify(schema.unevaluatedProperties) == '{"not":{}}') {
      delete schema.unevaluatedProperties;
      schema.additionalProperties = false;
    }

    if (schema.discriminator) {
      delete schema.discriminator.mapping;
    }

    await writeFile(
      componentPath,
      JSON.stringify(openApi.components.schemas[name], null, 2).replace(
        /"#\/components\/schemas\/(.+?)"/g,
        (_, m) => {
          return `"${m}.json"`;
        }
      )
    );
  }

  await generateTsSchemas(files, components, to);
  await Promise.all(
    obsoleteRuntimeErrorCodeArtifacts.map((artifactPath) =>
      rm(artifactPath, { force: true })
    )
  );
}

async function removeObsoleteSchemas(
  directory: string,
  activeSchemaNames: Set<string>,
  extension: string
) {
  const existingNames = await readdir(directory);
  await Promise.all(
    existingNames
      .filter((fileName) => fileName.endsWith(extension))
      .filter((fileName) => !activeSchemaNames.has(fileName.slice(0, -extension.length)))
      .map((fileName) => rm(path.join(directory, fileName), { force: true }))
  );
}

async function generateTsSchemas(
  files: string[],
  components: string,
  to: string
) {
  for (const file of files) {
    const parsedSchema = await $RefParser.dereference(
      path.join(components, file)
    );

    const parts = file.split('.');
    parts.pop();
    const name = parts.join('.');
    const constName = parts.pop();

    await writeFile(
      path.join(to, `${name}.ts`),
      `const ${constName} = ${JSON.stringify(parsedSchema, null, 2)} as const;\n\nexport default ${constName};`
    );
    console.log(`done ${file}`);
  }
}
