/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const generateSchema = async (options) => {
  console.log(chalk.blue('🔄 Generating JSON Schema from TypeScript...'));

  const { createGenerator } = await import('ts-json-schema-generator');

  // Read package.json to get project name
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    throw new Error('package.json not found in current directory');
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const projectName = options.projectName || packageJson.name.split('/').pop().replace(/\./g, '-');

  // Generate schema filename and ID from project name
  const schemaFileName = `${projectName}-properties.schema.json`;
  const schemaId = `https://qlik.com/schemas/${projectName}-properties.schema.json`;

  console.log(`📦 Project: ${packageJson.name}`);
  console.log(`📄 Schema: ${schemaFileName}`);
  console.log(`🆔 Schema ID: ${schemaId}`);

  // Configure the schema generator to extract JSDoc @default tags
  const config = {
    path: options.input,
    tsconfig: 'tsconfig.json',
    type: options.interface,
    schemaId,
    expose: 'export',
    topRef: true,
    jsDoc: 'extended',
    sortProps: true,
    strictTuples: false,
    encodeRefs: true,
    extraTags: ['default'],
  };

  try {
    const generator = createGenerator(config);
    const schema = generator.createSchema(config.type);

    schema.$id = config.schemaId;
    schema.title = `${options.interface.replace(/([A-Z])/g, ' $1').trim()} Schema`;
    schema.description = `Configuration schema for ${packageJson.description || packageJson.name}`;

    // Write schema to output directory
    const outputDir = path.join(process.cwd(), options.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, schemaFileName);
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));

    console.log(chalk.green(`✅ JSON Schema generated: ${outputPath}`));
    console.log(`📊 Schema stats:`);
    console.log(`   • Properties: ${Object.keys(schema.properties || {}).length}`);
    console.log(`   • Definitions: ${Object.keys(schema.definitions || schema.$defs || {}).length}`);

    return { schema, projectName, schemaFileName, outputPath };
  } catch (error) {
    console.error(chalk.red(`❌ Failed to generate schema: ${error.message}`));
    throw error;
  }
};

const extractSchemaInfo = (schema) => {
  const mainRef = schema.$ref;
  if (!mainRef) {
    throw new Error('Schema does not have a main $ref');
  }

  const mainTypeName = mainRef.replace('#/definitions/', '');
  const mainTypeDef = schema.definitions?.[mainTypeName];

  if (!mainTypeDef?.properties) {
    throw new Error(`Could not find ${mainTypeName} definition in schema`);
  }

  const defaults = {};
  Object.entries(mainTypeDef.properties).forEach(([key, prop]) => {
    if (prop.default !== undefined && key !== 'version') {
      defaults[key] = prop.default;
    }
  });

  return { mainTypeName, defaults };
};

const generateTypeScriptDefaults = (mainTypeName, defaults, options) => {
  const baseName = mainTypeName.replace(/Properties$/, '');
  const defaultsObjectName = `${baseName}Defaults`;

  // Determine the relative path to PropertyDef based on output directory
  const relativePath = options.output.includes('src/') ? './PropertyDef.js' : '../src/extension/PropertyDef.js';

  const imports = [`import type { ${mainTypeName} } from "${relativePath}";`];

  const defaultEntries = Object.entries(defaults).map(([key, value]) => {
    const jsonValue = JSON.stringify(value, null, 2);
    if (jsonValue.includes('\n')) {
      const indentedValue = jsonValue
        .split('\n')
        .map((line, index) => (index === 0 ? line : `  ${line}`))
        .join('\n');
      return `  ${key}: ${indentedValue},`;
    }
    return `  ${key}: ${jsonValue},`;
  });

  // Read package.json to get project info for header
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const projectName = packageJson.name.split('/').pop().replace(/\./g, '-');
  const schemaFileName = `${projectName}-properties.schema.json`;

  return `/**
    * Generated TypeScript defaults from JSON Schema
    * 
    * This file is auto-generated from ${schemaFileName}
    * Do not edit manually - regenerate using: nebula spec
    * 
    * Generated at: ${new Date().toISOString()}
    */

    ${imports.join('\n')}

    /**
     * Default property values extracted from schema @default annotations
     */
    const ${defaultsObjectName}: Omit<${mainTypeName}, "version"> = {
    ${defaultEntries.join('\n')}
    };

    export default ${defaultsObjectName};
    `;
};

const generateDefaults = (options, schemaInfo) => {
  console.log(chalk.blue('🔄 Generating TypeScript defaults from JSON Schema...'));

  const { schema } = schemaInfo;

  try {
    // Extract schema metadata
    const { mainTypeName, defaults } = extractSchemaInfo(schema);

    // Generate TypeScript file
    const tsContent = generateTypeScriptDefaults(mainTypeName, defaults, options);

    // Write to output directory
    const outputDir = path.join(process.cwd(), options.output);
    const outputPath = path.join(outputDir, 'generated-default-properties.ts');

    fs.writeFileSync(outputPath, tsContent);

    console.log(chalk.green(`✅ TypeScript defaults generated: ${outputPath}`));
    console.log(`📊 Extracted ${Object.keys(defaults).length} default values from schema`);

    return outputPath;
  } catch (error) {
    console.error(chalk.red(`❌ Failed to generate defaults: ${error.message}`));
    throw error;
  }
};

module.exports = async (argv) => {
  try {
    console.log(chalk.cyan('🚀 Starting spec generation...'));

    // Log if config was loaded
    if (argv.config && argv.config !== 'nebula.config.js') {
      console.log(chalk.gray(`📝 Using config: ${argv.config}`));
    } else if (fs.existsSync('nebula.config.js')) {
      console.log(chalk.gray('📝 Using config: nebula.config.js'));
    }

    const options = {
      input: argv.source || argv.input, // source takes precedence (for config file compatibility)
      output: argv.output,
      interface: argv.interface,
      projectName: argv.projectName,
      schemaOnly: argv.schemaOnly,
      defaultsOnly: argv.defaultsOnly,
    }; // Validate input file exists (only needed if generating schema)
    if (!options.defaultsOnly && !fs.existsSync(options.input)) {
      throw new Error(`Input file not found: ${options.input}`);
    }

    let schemaInfo;

    // Generate schema unless only generating defaults
    if (!options.defaultsOnly) {
      schemaInfo = await generateSchema(options);
    }

    // Generate defaults unless only generating schema
    if (!options.schemaOnly) {
      if (options.defaultsOnly) {
        // If only generating defaults, we need to read the existing schema
        const packagePath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const projectName = options.projectName || packageJson.name.split('/').pop().replace(/\./g, '-');

        const schemaFileName = `${projectName}-properties.schema.json`;
        const schemaPath = path.join(process.cwd(), options.output, schemaFileName);

        if (!fs.existsSync(schemaPath)) {
          throw new Error(`Schema file not found: ${schemaPath}. Run without --defaults-only first.`);
        }

        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        schemaInfo = { schema, projectName, schemaFileName };
      }

      generateDefaults(options, schemaInfo);
    }

    console.log(chalk.green('✅ Spec generation complete!'));
  } catch (error) {
    console.error(chalk.red(`❌ Spec generation failed: ${error.message}`));
    process.exit(1);
  }
};
