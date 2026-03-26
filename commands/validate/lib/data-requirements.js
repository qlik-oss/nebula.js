import fs from 'fs';

import { exists } from './utils/file-system.js';

export const inferDataRequirements = ({ argv, entry, type }) => {
  if (argv.dataProfile === 'mekko' || /mekko/i.test(type || '')) {
    return { dimensions: 2, measures: 1, rows: 8 };
  }

  const defaults = { dimensions: 1, measures: 1, rows: 6 };
  if (!entry || !exists(entry)) {
    return defaults;
  }

  const content = fs.readFileSync(entry, 'utf-8');
  const dimMatch = content.match(/dimensions\s*:\s*\{[^}]*min\s*:\s*(\d+)/m);
  const measureMatch = content.match(/measures\s*:\s*\{[^}]*min\s*:\s*(\d+)/m);

  return {
    dimensions: Number(dimMatch?.[1] || defaults.dimensions),
    measures: Number(measureMatch?.[1] || defaults.measures),
    rows: defaults.rows,
  };
};
