# <%= name %>

A TypeScript-enabled nebula.js visualization with automatic schema and defaults generation.

## Features

- **TypeScript Support**: Define your chart properties using TypeScript interfaces
- **Automatic Schema Generation**: Generate JSON Schema from TypeScript definitions
- **Default Value Extraction**: Automatically extract default values from JSDoc annotations
- **Type Safety**: Full TypeScript support for property definitions

## Getting Started

```bash
npm install
npm start
```

## Using the Spec Command

This template includes a `PropertyDef.ts` file that defines your chart's properties using TypeScript interfaces. You can automatically generate:

1. **JSON Schema** - For property validation and documentation
2. **TypeScript Defaults** - Type-safe default values extracted from JSDoc annotations

### Generate Schema and Defaults

```bash
npm run spec
```

This will:

- Read `src/PropertyDef.ts`
- Generate `generated/<%= name %>-properties.schema.json`
- Generate `generated/generated-default-properties.ts`

### Configuration

The spec command is configured in `nebula.config.js`:

```javascript
module.exports = {
  spec: {
    input: 'src/PropertyDef.ts',
    output: 'generated',
    interface: 'ChartProperties',
  },
};
```

### Using Generated Files

After running `npm run spec`, you can import the generated defaults:

```javascript
import generatedDefaults from './generated/generated-default-properties';

// Use in your chart
export default function supernova(/* env */) {
  return {
    qae: {
      properties: {
        initial: generatedDefaults,
      },
      // ...
    },
  };
}
```

### Property Definition Example

Define properties in `src/PropertyDef.ts` with JSDoc `@default` annotations:

```typescript
export interface ChartProperties {
  /**
   * Chart title
   * @default "My Chart"
   */
  title?: string;

  /**
   * Enable animations
   * @default true
   */
  animated?: boolean;
}
```

The `@default` values will be automatically extracted and used to generate the defaults file.

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build the chart
- `npm run spec` - Generate schema and defaults from TypeScript
- `npm run lint` - Lint source files
- `npm test` - Run e2e tests

## Learn More

- [nebula.js documentation](https://qlik.dev/libraries-and-tools/nebulajs)
- [TypeScript documentation](https://www.typescriptlang.org/)
- [JSON Schema](https://json-schema.org/)
