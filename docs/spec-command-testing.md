# Spec Command Testing Setup

## Overview

This document describes the testing infrastructure for the `nebula spec` command, which generates JSON schemas and TypeScript defaults from TypeScript interface definitions.

## Test Strategy

The spec command is tested as part of the `test-create` CI job, which validates that:

1. The TypeScript template can be created successfully
2. The spec command runs without errors
3. Generated files have the correct structure and content
4. The generated files are valid TypeScript/JSON

## Template Structure

### TypeScript Template (`commands/create/templates/sn/typescript/`)

The TypeScript template includes:

- **`src/PropertyDef.ts`** - TypeScript interface with JSDoc `@default` annotations
- **`nebula.config.js`** - Configuration for the spec command
- **`tsconfig.json`** - TypeScript compiler configuration
- **`_package.json`** - Includes `ts-json-schema-generator` and TypeScript dependencies

### Key Files

#### PropertyDef.ts

Defines chart properties with JSDoc annotations:

```typescript
export interface ChartProperties {
  /**
   * Chart title
   * @default ""
   */
  title?: string;
}
```

#### nebula.config.js

Configures the spec command:

```javascript
module.exports = {
  spec: {
    input: 'src/PropertyDef.ts',
    output: 'generated',
    interface: 'ChartProperties',
  },
};
```

## Test Flow

### 1. Template Creation

The test script creates a TypeScript visualization project:

```bash
.github/scripts/nebula_create.sh generated/typescript-chart none false false true true true true
```

Parameters:

- `PROJECT_NAME`: generated/typescript-chart
- `PICASSO_TEMPLATE`: none
- `MASHUP`: false
- `INSTALL`: false
- `BUILD`: true
- `TEST`: true
- `TYPESCRIPT`: true (enables TypeScript template)
- `TEST_SPEC`: true (enables spec command testing)

### 2. Spec Command Execution

The script runs:

```bash
cd generated/typescript-chart
yarn run spec
```

### 3. Validation

The test validates:

#### File Creation

- `generated/generated-default-properties.ts` exists
- `generated/*-properties.schema.json` exists (name derived from package.json)

#### Schema Structure

- Contains `$id` field
- Contains `definitions` object
- Valid JSON format

#### Defaults Structure

- Contains TypeScript const declaration
- Proper type annotations
- Imports from PropertyDef

### 4. CI Artifacts

Generated files are uploaded as artifacts:

```yaml
- name: Store TypeScript spec generated files
  uses: actions/upload-artifact@v5
  with:
    name: typescript-spec-generated
    path: generated/typescript-chart/generated
```

## Test Script (`nebula_create.sh`)

### Spec-Specific Logic

```bash
if [ "$TEST_SPEC" = "true" ]; then
  echo "Running spec command..."
  yarn run spec

  # Verify generated files exist
  if [ ! -f "generated/generated-default-properties.ts" ]; then
    echo "ERROR: generated-default-properties.ts was not created"
    exit 1
  fi

  # Find schema file dynamically
  SCHEMA_FILE=$(find generated -name "*-properties.schema.json" | head -n 1)
  if [ -z "$SCHEMA_FILE" ]; then
    echo "ERROR: JSON schema file was not created"
    exit 1
  fi

  # Validate schema structure
  if ! grep -q '"$id"' "$SCHEMA_FILE"; then
    echo "ERROR: Schema file missing $id field"
    exit 1
  fi

  # Validate defaults structure
  if ! grep -q "const.*Defaults.*:" "generated/generated-default-properties.ts"; then
    echo "ERROR: Defaults file has incorrect structure"
    exit 1
  fi
fi
```

## CI Workflow

### Test-Create Job

```yaml
- name: Create Nebula TypeScript project with spec command test
  run: .github/scripts/nebula_create.sh generated/typescript-chart none false false true true true true
```

This step:

1. Creates a TypeScript template project
2. Links local @nebula.js packages
3. Runs the spec command
4. Validates generated files
5. Builds the project
6. Runs e2e tests

## Extending the Tests

### Adding More Validations

To add more validation steps, edit `.github/scripts/nebula_create.sh`:

```bash
# Example: Verify specific default values
if ! grep -q '"showTitles": true' "generated/generated-default-properties.ts"; then
  echo "ERROR: Default value for showTitles not found"
  exit 1
fi

# Example: Validate schema definitions
if ! jq -e '.definitions.ChartProperties' "$SCHEMA_FILE" > /dev/null; then
  echo "ERROR: ChartProperties definition not found in schema"
  exit 1
fi
```

### Testing Different Configurations

Create additional test runs with different configurations:

```yaml
- name: Test spec with custom config
  run: |
    cd generated/typescript-chart
    echo 'module.exports = { spec: { schemaOnly: true } };' > nebula.config.js
    yarn run spec
    # Validate only schema was generated
```

## Local Testing

To test locally:

```bash
# Build the monorepo
yarn build

# Run the test script
.github/scripts/nebula_create.sh test-project none false false true true true true

# Check generated files
ls -la test-project/generated/
cat test-project/generated/generated-default-properties.ts
```

## Troubleshooting

### Common Issues

1. **Missing dependencies**: Ensure `ts-json-schema-generator` is installed
2. **Invalid TypeScript**: Check `PropertyDef.ts` syntax
3. **Schema generation fails**: Verify `tsconfig.json` is valid
4. **Defaults not extracted**: Ensure `@default` JSDoc tags are present

### Debug Output

Add debugging to the test script:

```bash
if [ "$TEST_SPEC" = "true" ]; then
  echo "=== Debug: Running spec command ==="
  yarn run spec --verbose

  echo "=== Debug: Generated files ==="
  ls -lah generated/

  echo "=== Debug: Schema content ==="
  cat generated/*-properties.schema.json | jq '.'
fi
```

## Future Enhancements

Potential improvements to the testing setup:

1. **Unit tests**: Add Jest tests for the spec command itself
2. **Snapshot testing**: Compare generated files against snapshots
3. **Multiple templates**: Test with different TypeScript configurations
4. **Integration tests**: Verify generated files work in actual charts
5. **Performance testing**: Measure generation time for large interfaces
