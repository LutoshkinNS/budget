import { $RefParser } from "@apidevtools/json-schema-ref-parser";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";

const root = './generated/@typespec';
const from = `${root}/openapi3/openapi.json`;
const components = `${root}/components`;
const to = `${root}/ts-schemas`;

if(process.argv.includes('--generateTsSchemas')){
    extractEntitiesFromOpenApi();
}else{
    console.log('What do you want? Add --generateTsSchemas to generate typescript schemas');
}

async function extractEntitiesFromOpenApi(){
    if(!existsSync(components)){ await mkdir(components); }
    if(!existsSync(to)){ await mkdir(to); }

    const openApi = JSON.parse((await readFile(from)).toString('utf8'));
    const files: string[] = [];

    for(const name in openApi.components.schemas){
        const path = `${components}/${name}.json`;
        files.push(`${name}.json`);

        const schema = openApi.components.schemas[name];

        if(JSON.stringify(schema.unevaluatedProperties) == '{"not":{}}'){
            delete schema.unevaluatedProperties;
            schema.additionalProperties = false;
        }

        if(schema.discriminator){
            delete schema.discriminator.mapping;
        }

        await writeFile(
            path,
            JSON.stringify(openApi.components.schemas[name], null, 2)
                .replace(/"#\/components\/schemas\/(.+?)"/g, (_, m) => {
                    return `"${m}.json"`;
                })
        );
    }

    await generateTsSchemas(files, components, to);
}

async function generateTsSchemas(files: string[], components: string, to: string) {
    try {
        for(const file of files){
            const parsedSchema = await $RefParser.dereference(`${components}/${file}`,);

            const parts = file.split('.');
            parts.pop();
            const name = parts.join('.');
            const constName = parts.pop();

            await writeFile(`${to}/${name}.ts`, `const ${constName} = ${JSON.stringify(parsedSchema, null, 2)} as const;\n\nexport default ${constName};`)
            console.log(`done ${file}`)
        }
    }
    catch(e){
        console.log(e);
        console.log('error')
    }
}
