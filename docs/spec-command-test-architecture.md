# Spec Command Test Architecture

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CI Workflow (ci.yml)                        │
│                                                                      │
│  ┌────────────┐  ┌──────────┐  ┌─────────────────┐  ┌────────────┐ │
│  │   build    │→│ validate │  │ test-integration│  │test-create │ │
│  └────────────┘  └──────────┘  └─────────────────┘  └──────┬─────┘ │
│                                                             │       │
└─────────────────────────────────────────────────────────────┼───────┘
                                                              │
                                                              ▼
                        ┌─────────────────────────────────────────────┐
                        │       nebula_create.sh Script               │
                        │                                             │
                        │  Parameters:                                │
                        │  • PROJECT_NAME                             │
                        │  • PICASSO_TEMPLATE                         │
                        │  • MASHUP                                   │
                        │  • INSTALL                                  │
                        │  • BUILD                                    │
                        │  • TEST                                     │
                        │  • TYPESCRIPT ← New!                        │
                        │  • TEST_SPEC  ← New!                        │
                        └──────────────┬──────────────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
                ▼                                             ▼
    ┌───────────────────────┐                   ┌───────────────────────────┐
    │  Existing Templates   │                   │  TypeScript Template      │
    │                       │                   │  (NEW!)                   │
    │  • picasso/none       │                   │                           │
    │  • picasso/barchart   │                   │  Files:                   │
    │  • mashup             │                   │  • PropertyDef.ts         │
    └───────────────────────┘                   │  • nebula.config.js       │
                                                │  • tsconfig.json          │
                                                │  • package.json           │
                                                └─────────┬─────────────────┘
                                                          │
                                                          ▼
                                        ┌─────────────────────────────────┐
                                        │   Spec Command Test Flow        │
                                        │                                 │
                                        │  1. Create project              │
                                        │  2. Link packages               │
                                        │  3. Run: yarn run spec          │
                                        │  4. Validate generated files    │
                                        │  5. Run: yarn run build         │
                                        │  6. Run: yarn run test:e2e      │
                                        │  7. Upload artifacts            │
                                        └─────────┬───────────────────────┘
                                                  │
                        ┌─────────────────────────┼─────────────────────────┐
                        │                         │                         │
                        ▼                         ▼                         ▼
            ┌──────────────────┐    ┌──────────────────────┐   ┌──────────────────┐
            │  Schema File     │    │  Defaults File       │   │  Validation      │
            │  Generated       │    │  Generated           │   │  Results         │
            │                  │    │                      │   │                  │
            │  <name>-         │    │  generated-          │   │  • File exists   │
            │  properties.     │    │  default-            │   │  • Has $id       │
            │  schema.json     │    │  properties.ts       │   │  • Has defs      │
            │                  │    │                      │   │  • Valid TS      │
            └────────┬─────────┘    └───────────┬──────────┘   └────────┬─────────┘
                     │                          │                       │
                     └──────────────────────────┴───────────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │  CI Artifacts         │
                                    │  Uploaded             │
                                    │                       │
                                    │  typescript-spec-     │
                                    │  generated/           │
                                    └───────────────────────┘
```

## Data Flow

```
TypeScript Interface (PropertyDef.ts)
         │
         │ Contains JSDoc @default annotations
         │
         ▼
┌─────────────────────────────────┐
│   nebula spec command           │
│                                 │
│   Uses:                         │
│   • ts-json-schema-generator    │
│   • nebula.config.js settings   │
│   • tsconfig.json               │
└────────┬────────────────────────┘
         │
         ├──────────────┬────────────────┐
         │              │                │
         ▼              ▼                ▼
    Parse TS       Extract JSDoc    Generate Schema
    Interface      @default tags    Definitions
         │              │                │
         └──────┬───────┴────────────────┘
                │
                ├─────────────────┬─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
         JSON Schema         Defaults File     Console Output
         (validation)        (TypeScript)      (logs)
                │                 │                 │
                └─────────┬───────┴─────────────────┘
                          │
                          ▼
                    Test Validation
                          │
                          ├─── File existence checks
                          ├─── Structure validation
                          ├─── Content validation
                          └─── Build verification
                          │
                          ▼
                    ✓ Tests Pass
```

## Test Execution Flow

```
GitHub Push/PR
      │
      ▼
┌─────────────────┐
│  build job      │  ← Builds all packages
│  yarn build     │
└────────┬────────┘
         │
         ├─── Upload workspace artifact
         │
         ▼
┌─────────────────┐
│ test-create job │  ← Downloads workspace
└────────┬────────┘
         │
         ├─── Test 1: Picasso none template
         │    └─ create, link, build, test
         │
         ├─── Test 2: Picasso barchart template
         │    └─ create, link, build, test
         │
         ├─── Test 3: TypeScript template (NEW!)
         │    └─ create, link, spec, validate, build, test
         │
         └─── Test 4: Mashup template
              └─ create, link, build
```

## File Structure

```
nebula.js/
├── .github/
│   ├── workflows/
│   │   └── ci.yml ...................... Updated: Added TypeScript test step
│   └── scripts/
│       └── nebula_create.sh ............ Updated: Added spec testing logic
│
├── commands/
│   ├── create/
│   │   ├── command.js .................. Updated: Added --typescript option
│   │   ├── lib/
│   │   │   └── create.js ............... Updated: TypeScript template logic
│   │   └── templates/
│   │       └── sn/
│   │           ├── picasso/ ............ Existing templates
│   │           ├── none/ ............... Existing template
│   │           └── typescript/ ......... NEW! Complete template
│   │               ├── src/
│   │               │   ├── PropertyDef.ts
│   │               │   ├── index.js
│   │               │   ├── object-properties.js
│   │               │   └── meta.json
│   │               ├── test/
│   │               │   └── integration/
│   │               ├── _package.json
│   │               ├── tsconfig.json
│   │               ├── nebula.config.js
│   │               ├── _eslintrc.json
│   │               ├── _gitignore
│   │               └── README.md
│   │
│   └── spec/ ........................... Existing spec command
│       ├── command.js
│       └── lib/
│           ├── spec.js
│           └── init-config.js
│
├── docs/
│   └── spec-command-testing.md ......... NEW! Testing documentation
│
└── SPEC_TESTING_SUMMARY.md ............. NEW! Implementation summary
```

## Validation Points

```
┌─────────────────────────────────────────────────────────────┐
│                    Validation Checklist                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✓ Template Creation                                       │
│    └─ All template files copied correctly                  │
│                                                             │
│  ✓ Dependencies Installation                               │
│    ├─ yarn install succeeds                                │
│    └─ All @nebula.js packages linked                       │
│                                                             │
│  ✓ Spec Command Execution                                  │
│    ├─ yarn run spec completes without errors              │
│    └─ No TypeScript compilation errors                     │
│                                                             │
│  ✓ Generated Files                                         │
│    ├─ generated-default-properties.ts exists              │
│    ├─ <name>-properties.schema.json exists                │
│    ├─ Schema has required "$id" field                      │
│    ├─ Schema has "definitions" object                      │
│    └─ Defaults file has TypeScript const declaration       │
│                                                             │
│  ✓ Build Process                                           │
│    ├─ yarn run build succeeds                             │
│    └─ Dist files created                                   │
│                                                             │
│  ✓ Test Execution                                          │
│    └─ yarn run test:e2e passes                            │
│                                                             │
│  ✓ Artifacts                                               │
│    └─ Generated files uploaded to CI                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Integration Points

```
┌──────────────────────────────────────────────────────────────┐
│                  Existing Infrastructure                     │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ nebula create    │◄─────┤ New typescript   │            │
│  │ command          │      │ option           │            │
│  └──────────────────┘      └──────────────────┘            │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ Template system  │◄─────┤ TypeScript       │            │
│  │                  │      │ template folder  │            │
│  └──────────────────┘      └──────────────────┘            │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ nebula_create.sh │◄─────┤ Spec test logic  │            │
│  │ test script      │      │ & validation     │            │
│  └──────────────────┘      └──────────────────┘            │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ CI test-create   │◄─────┤ New test step    │            │
│  │ job              │      │ & artifacts      │            │
│  └──────────────────┘      └──────────────────┘            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```
