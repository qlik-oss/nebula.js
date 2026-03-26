import path from 'path';

import { DEFAULT_STEPS, SUPPORTED_STEPS } from './constants.js';
import { exists } from './utils/file-system.js';

export const resolveEntry = ({ cwd, pkg, explicitEntry }) => {
  const packageEntry = pkg.nebula?.validate?.entry || pkg.nebula?.entry || pkg.source || pkg.module || pkg.main;
  const candidates = [
    explicitEntry,
    packageEntry,
    'src/index.tsx',
    'src/index.ts',
    'src/index.jsx',
    'src/index.js',
    'index.tsx',
    'index.ts',
    'index.jsx',
    'index.js',
  ].filter(Boolean);

  const entry = candidates
    .map((candidate) => path.resolve(cwd, candidate))
    .find((candidatePath) => exists(candidatePath));

  return {
    entry,
    candidates,
  };
};

export const inferType = ({ argv, pkg, entry }) => {
  if (argv.type) {
    return argv.type;
  }
  if (pkg.nebula?.type) {
    return pkg.nebula.type;
  }
  if (entry) {
    const parsed = path.parse(entry);
    if (parsed.name && parsed.name !== 'index') {
      return parsed.name;
    }
  }
  if (pkg.name) {
    return pkg.name.split('/').pop();
  }
  return 'validated-chart';
};

export const parseSteps = (value) => {
  const parsed = (value || '')
    .split(',')
    .map((step) => step.trim().toLowerCase())
    .filter(Boolean);

  if (!parsed.length) {
    return [...DEFAULT_STEPS];
  }

  return parsed.filter((step) => SUPPORTED_STEPS.has(step));
};
