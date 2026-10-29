import fs from 'node:fs';
import path from 'node:path';
import { rolldown } from 'rolldown';
import { rollup } from 'rollup';
import { getBanner } from '../plan.mjs';
import { createRolldownOptions } from '../options.mjs';

export const pkg = { name: '@nebula.js/stardust', version: '9.9.9', license: 'MIT', main: 'index.js' };
export const banner = getBanner(pkg, 2030);

/**
 * Writes a tree of files, `{ 'src/index.js': 'content' }`, to a directory.
 * @param {string} dir
 * @param {Record<string, string>} tree
 */
export const write = (dir, tree) =>
  Object.entries(tree).forEach(([file, content]) => {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  });

/**
 * Builds with the real options and writes to disk, like the build does.
 * @param {string} dir
 * @param {object} bundle
 */
export const buildTo = async (dir, bundle) => {
  const { output, ...input } = createRolldownOptions(bundle, {
    pkg,
    banner,
    rollup,
    checkLocale: false,
    nodeEnv: 'production',
  });
  const b = await rolldown({ ...input, logLevel: 'silent' });
  try {
    await Promise.all(output.map((out) => b.write(out)));
  } finally {
    await b.close();
  }
};
