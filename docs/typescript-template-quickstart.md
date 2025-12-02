# Quick Start: TypeScript Template with Spec Command

This guide shows you how to create a nebula.js chart using the new TypeScript template with automatic schema generation.

## Create a New TypeScript Chart

```bash
# Option 1: Use the CLI flag
./commands/cli/lib/index.js create my-typescript-chart --typescript

# Option 2: Interactive (will prompt for TypeScript)
./commands/cli/lib/index.js create my-typescript-chart
```

## What You Get

The TypeScript template includes:

- ✓ TypeScript interface for property definitions (`src/PropertyDef.ts`)
- ✓ Automatic JSON schema generation
- ✓ Automatic defaults extraction from JSDoc annotations
- ✓ Full TypeScript development support
- ✓ Pre-configured `nebula.config.js` for spec command

## Define Your Properties

Edit `src/PropertyDef.ts` and add JSDoc `@default` annotations:

```typescript
/**
 * Main properties interface for the chart
 */
export interface ChartProperties {
  /** Version of the property definition schema */
  version: string;

  /**
   * Chart title
   * @default "My Chart"
   */
  title?: string;

  /**
   * Show chart legend
   * @default true
   */
  showLegend?: boolean;

  /**
   * Color scheme
   * @default "auto"
   */
  colorScheme?: 'auto' | 'single' | 'multi';
}
```

## Generate Schema and Defaults

Run the spec command:

```bash
npm run spec
# or
yarn run spec
```

This generates:

- `generated/<chart-name>-properties.schema.json` - JSON Schema for validation
- `generated/generated-default-properties.ts` - Type-safe defaults

## Use the Generated Defaults

Import the generated defaults in your chart:

```javascript
// src/index.js
import generatedDefaults from '../generated/generated-default-properties';

export default function supernova(/* env */) {
  return {
    qae: {
      properties: {
        initial: generatedDefaults,
      },
      // ... rest of your QAE config
    },
    // ... rest of your chart
  };
}
```

## Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Edit your TypeScript interface
vim src/PropertyDef.ts

# 3. Generate schema and defaults
npm run spec

# 4. Start development server
npm start

# 5. Build for production
npm run build
```

## Example: Adding a New Property

1. **Add to TypeScript interface:**

```typescript
/**
 * Enable animations
 * @default true
 */
enableAnimations?: boolean;
```

2. **Regenerate:**

```bash
npm run spec
```

3. **Use in your chart:**
   The default value is now automatically available in `generatedDefaults.enableAnimations`

## Configuration

The spec command is configured in `nebula.config.js`:

```javascript
module.exports = {
  spec: {
    input: 'src/PropertyDef.ts', // Your interface file
    output: 'generated', // Output directory
    interface: 'ChartProperties', // Interface to generate from
  },
};
```

### Advanced Options

```javascript
module.exports = {
  spec: {
    input: 'src/PropertyDef.ts',
    output: 'generated',
    interface: 'ChartProperties',
    projectName: 'my-chart', // Override auto-detected name
    schemaOnly: false, // Only generate schema
    defaultsOnly: false, // Only generate defaults
  },
};
```

## CLI Usage

```bash
# Generate both schema and defaults
nebula spec

# Generate only schema
nebula spec --schema-only

# Generate only defaults (requires existing schema)
nebula spec --defaults-only

# Custom input/output
nebula spec -i src/Props.ts -o dist --interface MyProps

# Use custom config file
nebula spec -c my-config.js
```

## Testing

The template includes integration test setup:

```bash
# Run e2e tests
npm run test:e2e

# View test report
npm run test:e2e:report
```

## Tips

### ✓ DO

- Use JSDoc `@default` annotations for all optional properties
- Keep property names consistent between interface and defaults
- Regenerate after changing interfaces
- Commit generated files to version control (they're your source of truth)

### ✗ DON'T

- Don't edit generated files manually (they'll be overwritten)
- Don't forget to run `npm run spec` after interface changes
- Don't use complex objects in `@default` without proper JSON formatting

## Common Issues

### "Schema generation failed"

- Check TypeScript syntax in `PropertyDef.ts`
- Ensure `tsconfig.json` is valid
- Verify `ts-json-schema-generator` is installed

### "Defaults not extracted"

- Ensure you're using `@default` in JSDoc comments
- Check that default values are valid JSON
- Use quotes for string defaults: `@default "value"`

### "Type errors in generated file"

- Ensure your interface is exported
- Check import paths in `nebula.config.js`
- Verify TypeScript version compatibility

## Example Projects

Check the test suite for examples:

```bash
# Run the test that creates a TypeScript project
.github/scripts/nebula_create.sh test-chart none false false true true true true

# Inspect the generated project
cd test-chart
cat src/PropertyDef.ts
cat generated/generated-default-properties.ts
```

## Benefits

1. **Type Safety**: Full TypeScript support for your property definitions
2. **Single Source of Truth**: Define properties once, generate schema and defaults
3. **Documentation**: JSON Schema serves as machine-readable documentation
4. **Validation**: Schema can be used for runtime validation
5. **IDE Support**: Better autocomplete and type checking

## Learn More

- [Full Testing Documentation](docs/spec-command-testing.md)
- [Test Architecture](docs/spec-command-test-architecture.md)
- [nebula.js Documentation](https://qlik.dev/libraries-and-tools/nebulajs)
- [JSON Schema Specification](https://json-schema.org/)
