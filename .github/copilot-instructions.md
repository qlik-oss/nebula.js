# Nebula.js Development Guide for AI Agents

## Project Overview

Nebula.js is a framework for building and embedding Qlik visualizations. It's a **Lerna monorepo** managing multiple packages under `@nebula.js` npm scope. The core architecture separates visualization authoring (`supernova`) from rendering (`nucleus`) with `stardust` as the public API facade.

## Architecture

### Package Structure

- **`apis/stardust/`** - Public API that exposes `nucleus` and `supernova` APIs. Entry point for consumers.
- **`apis/nucleus/`** - React-based mashup runtime that renders visualizations in web apps
- **`apis/supernova/`** - Hooks-based API for building custom visualizations (the "component" layer)
- **`apis/locale/`** - Translation strings and locale generation (private)
- **`apis/theme/`** - Theme access and consumption (private)
- **`apis/conversion/`** - Conversion utilities for hyperCube extensions (private)
- **`apis/enigma-mocker/`** - Mock enigma app for rendering without Qlik engine
- **`apis/snapshooter/`** - Chart rendering as images
- **`apis/test-utils/`** - Testing utilities
- **`commands/`** - CLI tools (`build`, `serve`, `create`, `sense`) for visualization development
- **`packages/ui/`** - Shared UI components (private)

### Visualization Component Pattern (Supernova)

Visualizations are defined as "supernovas" with this structure:

```js
export default function supernova(galaxy) {
  return {
    qae: {
      properties: {},  // QIX object properties schema
      data: {}        // Data definition (dimensions, measures)
    },
    component() {
      // Hooks-based component using @nebula.js/stardust hooks
      const element = useElement();
      const layout = useLayout();
      
      useEffect(() => {
        // Render logic here
      }, [layout]);
    }
  };
}
```

Key hooks from `@nebula.js/stardust`:
- `useElement()` - Get the DOM element
- `useLayout()` - Get QIX layout object  
- `useModel()` - Access QIX model
- `useStaleLayout()` - Layout that doesn't trigger re-renders
- `useSelections()` - Handle user selections
- `useConstraints()` - Interaction constraints (edit, select, active, passive)
- `useEffect()`, `useState()`, etc. - React-like hooks

See [apis/supernova/src/hooks.js](apis/supernova/src/hooks.js) for complete hook implementations.

### Nucleus Rendering Flow

Nucleus (React-based) orchestrates visualization rendering:
1. `Supernova.jsx` component mounts the visualization element
2. Calls supernova lifecycle: `created()` → `mounted()` → `render()` → `willUnmount()`
3. Passes context (constraints, interactions, theme, appLayout) to component
4. Uses `RenderDebouncer` to batch updates

## Development Workflow

### Setup & Build

```bash
yarn install                    # Install all dependencies
yarn run locale:generate        # Generate translation files (required before build)
yarn run build                  # Build all packages (production UMD + ESM)
yarn run build:dev              # Build with source maps for development
yarn run build:watch            # Watch mode for active development
```

**Critical**: Always run `locale:generate` before building if locale files changed.

### Testing

```bash
yarn test:unit                  # Jest unit tests for all packages
yarn test:component             # Playwright component tests
yarn test:integration           # Playwright integration tests  
yarn test:rendering             # Visual regression tests (Playwright)
yarn test:mashup                # Full mashup integration tests
```

Unit tests use `jest` with `jest-environment-jsdom`. See [jest.config.js](jest.config.js) for coverage and test patterns.

### CLI Commands for Visualizations

When developing a supernova visualization:

```bash
nebula create <name>            # Scaffold new visualization
nebula serve                    # Start dev server with hot reload
nebula build                    # Build visualization for distribution
nebula sense                    # Build as Qlik Sense extension
```

**Dev Server** (`nebula serve`):
- Builds visualization to `/dist` automatically
- Connects to Qlik Associative Engine (default: localhost:9076)
- Supports fixtures for testing without engine connection
- See [commands/serve/README.md](commands/serve/README.md) for options

### Rollup Build Configuration

All packages use shared [rollup.config.js](rollup.config.js):
- **UMD format** for browsers (default export via `unpkg`/`jsdelivr`)
- **ESM format** for bundlers (exposed via `module` field)
- Creates `.dev.js` variants with source maps in development mode
- Validates `main`, `module`, `unpkg`, `jsdelivr` targets in package.json match naming convention

### Lerna Versioning

This project uses Lerna for version management with **conventional commits**:
- Use commit types: `feat:`, `fix:`, `chore:`, `docs:`, etc.
- `lerna version` reads commits to determine semver bump
- All packages are versioned together (see [lerna.json](lerna.json))

## Code Conventions

### ESLint Configuration

- Uses **Airbnb style** with Prettier formatting
- Flat config format ([eslint.config.mjs](eslint.config.mjs))
- Jest environment globals enabled for test files
- Custom rules: `max-len: 0`, `no-plusplus: 0`, React prop-types disabled

### File Naming

- Test files: `*.spec.js`, `*.test.js`, `*.spec.jsx`, `*.test.jsx`
- Stories (Storybook): `**/__stories__/**`
- Built artifacts: `dist/`, `lib/` (git-ignored)

### Private Packages

Packages like `locale`, `theme`, `conversion`, and `ui` are marked private/internal - they're consumed by stardust but not published as standalone packages.

## Common Patterns

### Picasso.js Integration

Many visualizations use Picasso.js for rendering. Standard pattern:

```js
import picassojs from 'picasso.js';
import picassoQ from 'picasso-plugin-q';

const picasso = picassojs();
picasso.use(picassoQ);

// In component:
const instance = picasso.chart({
  element,
  data: [{ type: 'q', key: 'qHyperCube', data: layout.qHyperCube }],
  settings: definition({ layout })
});
```

See [commands/create/templates/sn/picasso/common/src/index.js](commands/create/templates/sn/picasso/common/src/index.js).

### Handling Selections

Use `pic-selections` helper for Picasso-based charts to connect brush selections to QIX selections API. Example in templates.

### Extension Points (`ext`)

Qlik Sense extensions can define `ext` object for Sense-specific customizations (support.export, etc.). Pass `galaxy.anything.sense` to detect Sense environment.

## Key Files to Reference

- [apis/supernova/src/creator.js](apis/supernova/src/creator.js) - Component lifecycle implementation
- [apis/nucleus/src/components/Supernova.jsx](apis/nucleus/src/components/Supernova.jsx) - React wrapper for visualizations
- [apis/supernova/src/hooks.js](apis/supernova/src/hooks.js) - All available hooks
- [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) - Contribution guidelines and git workflow

## Debugging

- **Build issues**: Check locale generation ran, verify package.json targets match rollup config expectations
- **Hook errors**: "Invalid stardust hook call" means hooks called outside component function
- **Visualization not updating**: Check if using `useStaleLayout()` vs `useLayout()` correctly - stale doesn't trigger re-renders
