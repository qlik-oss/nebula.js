# Advanced Chart Template

This folder contains a multi-file React + nebula chart template intended for skill-driven scaffolding.

## Files

- \_package.json
- src/index.jsx
- src/data.js
- src/object-properties.js
- src/ext.js
- src/components/Table.jsx
- src/components/chart.css

## Usage

1. Create a chart project with `@nebula.js/cli`.
2. Copy all files from this folder into that project.
3. Rename `_package.json` to `package.json` if you want to use the template package metadata as-is.
4. Fill in TODO sections in `src/index.jsx` and `src/components/Table.jsx` with your chart-specific data transformation and rendering logic.
5. Keep the `usePromise` flow and React root lifecycle (`createRoot` + `unmount`) intact to avoid memory leaks and print/snapshot issues.

## Notes

- The table component includes sample selections using `useSelections` and `selectHyperCubeValues`.
- Styling is scoped with the `abc-advanced-chart` prefix to avoid global CSS collisions.
