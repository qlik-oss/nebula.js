# Spec Command Testing Implementation Summary

## Overview

This implementation adds comprehensive testing for the `nebula spec` command through a new TypeScript template and integration with the existing `nebula create` test infrastructure.

## Files Created

### 1. TypeScript Template (`commands/create/templates/sn/typescript/`)

A complete project template that demonstrates TypeScript property definitions with spec command support:

- **`src/PropertyDef.ts`** - Sample TypeScript interface with JSDoc `@default` annotations
- **`src/index.js`** - Chart entry point
- **`src/object-properties.js`** - Initial property defaults (to be replaced by generated file)
- **`src/meta.json`** - Chart metadata
- **`_package.json`** - Package config with TypeScript and spec dependencies
- **`tsconfig.json`** - TypeScript compiler configuration
- **`nebula.config.js`** - Spec command configuration
- **`_eslintrc.json`** - ESLint configuration
- **`_gitignore`** - Git ignore patterns including generated files
- **`README.md`** - Documentation on using the spec command
- **`test/integration/example.spec.js`** - Placeholder integration test
- **`test/integration/playwright.config.js`** - Playwright configuration

### 2. Documentation

- **`docs/spec-command-testing.md`** - Comprehensive testing documentation

## Files Modified

### 1. `commands/create/command.js`

Added `--typescript` option:

```javascript
yargs.option('typescript', {
  type: 'boolean',
  description: 'Use TypeScript template with spec command support',
  default: false,
});
```

### 2. `commands/create/lib/create.js`

- Added TypeScript template prompt
- Added logic to use `sn/typescript` folder when `--typescript` flag is set
- Updated template selection to prioritize TypeScript over Picasso when both options are available

### 3. `.github/scripts/nebula_create.sh`

Added spec command testing capability:

- New parameters: `TYPESCRIPT` and `TEST_SPEC`
- Logic to create TypeScript projects with `--typescript` flag
- Spec command execution and validation:
  - Verifies `generated-default-properties.ts` is created
  - Verifies JSON schema file is created
  - Validates schema structure (`$id`, `definitions`)
  - Validates defaults file structure
  - Comprehensive error messages

### 4. `.github/workflows/ci.yml`

- Added new test step: "Create Nebula TypeScript project with spec command test"
- Added artifact upload for generated spec files
- Test runs alongside existing Picasso and mashup template tests

## Test Flow

```
1. CI Job: test-create
   ↓
2. Create TypeScript project
   ./commands/cli/lib/index.js create typescript-chart --typescript
   ↓
3. Link local packages
   (stardust, cli, build, serve)
   ↓
4. Run spec command
   yarn run spec
   ↓
5. Validate generated files
   - generated-default-properties.ts
   - <name>-properties.schema.json
   ↓
6. Validate file structure
   - Schema has $id and definitions
   - Defaults has proper TypeScript structure
   ↓
7. Build project
   yarn run build
   ↓
8. Run e2e tests
   yarn run test:e2e
   ↓
9. Upload artifacts
   (generated files for inspection)
```

## Usage Examples

### Create TypeScript Project Locally

```bash
# Using CLI directly
./commands/cli/lib/index.js create my-chart --typescript

# Using create command interactively
./commands/cli/lib/index.js create my-chart
# Will prompt for TypeScript option
```

### Run Tests Locally

```bash
# Build monorepo
yarn build

# Run create test with spec validation
.github/scripts/nebula_create.sh test-chart none false false true true true true
#                                 ↑          ↑    ↑     ↑     ↑    ↑    ↑    ↑
#                                 name       pic  mash  inst  bld  tst  ts   spec

# Check generated files
ls -la test-chart/generated/
cat test-chart/generated/generated-default-properties.ts
```

### CI Testing

The TypeScript template test runs automatically in the `test-create` job:

```yaml
- name: Create Nebula TypeScript project with spec command test
  run: .github/scripts/nebula_create.sh generated/typescript-chart none false false true true true true
```

## Validation Checks

The test validates:

### 1. File Creation

✓ `generated/generated-default-properties.ts` exists  
✓ `generated/*-properties.schema.json` exists

### 2. Schema Structure

✓ Contains `"$id"` field  
✓ Contains `"definitions"` object  
✓ Valid JSON format

### 3. Defaults Structure

✓ Contains TypeScript const declaration  
✓ Proper syntax: `const <Name>Defaults: ...`

### 4. Build Success

✓ Project builds without errors  
✓ E2E tests pass

## Integration with Existing Tests

The spec command test is integrated into the existing `test-create` CI job, which already tests:

- Picasso template (none)
- Picasso template (barchart)
- Mashup template

Now also includes:

- **TypeScript template with spec command**

All tests run in parallel as part of the same job, sharing the built workspace artifact.

## Benefits

1. **Comprehensive Coverage**: Tests the entire spec command workflow end-to-end
2. **Real-World Usage**: Uses actual template generation and package linking
3. **Validation**: Ensures generated files have correct structure
4. **CI Integration**: Runs automatically on every PR and push
5. **Artifacts**: Generated files uploaded for manual inspection
6. **Documentation**: Complete docs for future maintenance

## Future Enhancements

Potential improvements:

- Add unit tests for spec command logic
- Test with more complex TypeScript interfaces
- Validate JSON schema compliance with standards
- Test defaults file type-checking
- Add snapshot testing for generated content
- Test error cases (invalid TypeScript, missing annotations, etc.)

## Commands for Testing

```bash
# Local development
yarn build
.github/scripts/nebula_create.sh test-ts none false false true true true true

# CI (automatic)
# Runs as part of test-create job on every PR

# Manual spec command in generated project
cd generated/typescript-chart
yarn run spec
ls -la generated/

# View generated defaults
cat generated/generated-default-properties.ts

# View generated schema
cat generated/*-properties.schema.json | jq '.'
```

## Notes

- Template uses JSDoc `@default` annotations for default value extraction
- Generated files are gitignored by default
- TypeScript is a devDependency only (runtime uses JavaScript)
- Spec command is optional - charts can still use manual property definitions
- Compatible with all existing nebula.js workflows (serve, build, sense)
