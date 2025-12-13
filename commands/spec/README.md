# @nebula.js/cli-spec

Generate TypeScript interfaces and JSON schemas from property definitions with JSDoc @default annotations.

## Installation

This command is part of the nebula.js CLI suite and is installed as a peer dependency when you install `@nebula.js/cli`.

## Usage

### Basic Usage

Generate both JSON schema and TypeScript defaults:

```bash
nebula spec
```

This uses default settings:

- Input: `src/PropertyDef.ts`
- Output: `generated/`
- Interface: `WordCloudProperties`

### Custom Options

```bash
nebula spec -i src/MyProps.ts -o dist --interface MyProperties
```

### Generate Only Schema

```bash
nebula spec --schema-only
```

### Generate Only Defaults

```bash
nebula spec --defaults-only
```

### Custom Project Name

```bash
nebula spec --projectName my-custom-name
```

## CLI Options

| Option            | Alias | Description                                             | Default               |
| ----------------- | ----- | ------------------------------------------------------- | --------------------- |
| `--config`        | `-c`  | Path to JavaScript config file                          | `nebula.config.js`    |
| `--input`         | `-i`  | Path to TypeScript interface file                       | `src/PropertyDef.ts`  |
| `--output`        | `-o`  | Output directory for generated files                    | `generated`           |
| `--interface`     |       | Name of TypeScript interface to process                 | `WordCloudProperties` |
| `--projectName`   | `-p`  | Project name (reads from package.json if not specified) |                       |
| `--schema-only`   |       | Generate only JSON schema                               | `false`               |
| `--defaults-only` |       | Generate only defaults file                             | `false`               |

## Configuration File

You can specify default options in your `nebula.config.js` file under the `spec` section:

```javascript
module.exports = {
  spec: {
    source: 'src/extension/PropertyDef.ts', // equivalent to --input
    output: 'schema', // equivalent to --output
    interface: 'MyProperties', // equivalent to --interface
    projectName: 'my-project', // equivalent to --projectName
    schemaOnly: false, // equivalent to --schema-only
    defaultsOnly: false, // equivalent to --defaults-only
  },
};
```

**Note**: The `source` property is an alias for `input` to maintain compatibility with existing configurations.

CLI options will override config file settings:

```bash
# Uses config file settings, but overrides output directory
nebula spec -o dist
```

## Input Format

Your TypeScript interface should use JSDoc @default annotations:

```typescript
export interface WordCloudProperties {
  /**
   * Minimum font size for words
   * @default 20
   */
  MinSize: number;

  /**
   * Color scale for word cloud
   * @default ["#FEE391", "#FEC44F", "#FE9929"]
   */
  ScaleColor: string[];

  /**
   * Enable custom color range
   * @default false
   */
  customRange: boolean;
}
```

## Output Files

### JSON Schema

Generated as `{project-name}-properties.schema.json`:

```json
{
  "$id": "https://qlik.com/schemas/my-project-properties.schema.json",
  "title": "Word Cloud Properties Schema",
  "type": "object",
  "properties": {
    "MinSize": {
      "type": "number",
      "default": 20
    },
    "ScaleColor": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["#FEE391", "#FEC44F", "#FE9929"]
    }
  }
}
```

### TypeScript Defaults

Generated as `default-properties.ts`:

```typescript
export const WordCloudDefaults = {
  MinSize: 20,
  ScaleColor: ['#FEE391', '#FEC44F', '#FE9929'],
  customRange: false,
} as const;

export function getDefaultValue<K extends keyof typeof WordCloudDefaults>(key: K): (typeof WordCloudDefaults)[K] {
  return WordCloudDefaults[key];
}
```

## Integration with Build Process

Add to your package.json scripts:

```json
{
  "scripts": {
    "spec:generate": "nebula spec",
    "spec:schema": "nebula spec --schema-only",
    "spec:defaults": "nebula spec --defaults-only"
  }
}
```

## Example Workflow

1. **Define Properties**: Create TypeScript interface with JSDoc @default annotations
2. **Generate Schema**: Run `nebula spec` to create JSON schema and defaults
3. **Use in Code**: Import generated defaults in your visualization code
4. **Version Control**: Commit generated files or regenerate during build

```typescript
// In your visualization code
import { WordCloudDefaults, getDefaultValue } from './generated/default-properties';

// Use defaults
const defaultSize = getDefaultValue('MinSize'); // 20
const allDefaults = WordCloudDefaults;
```

## Requirements

- TypeScript project with valid `tsconfig.json`
- Input file must exist (unless using `--defaults-only`)
- For `--defaults-only`: corresponding schema file must exist
