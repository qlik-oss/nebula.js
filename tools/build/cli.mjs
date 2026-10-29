/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { rolldown, watch } from 'rolldown';
import { rollup } from 'rollup';
import { createPlan, createSnapshooterPlan, getBanner } from './plan.mjs';
import { createRolldownOptions } from './options.mjs';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/**
 * Builds the package in the current directory, with Rolldown.
 *
 *   node tools/build/cli.mjs [--watch]
 *
 * NODE_ENV=production minifies the snapshooter client, which is the only bundle where that is not a given.
 */
async function main() {
  const cwd = process.cwd();
  const pkg = readJson(path.join(cwd, 'package.json'));
  const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');
  const corePkgFile = path.join(cwd, 'core', 'package.json');
  const corePkg = fs.existsSync(corePkgFile) ? readJson(corePkgFile) : undefined;

  const isSnapshooter = pkg.name === '@nebula.js/snapshooter';
  const plan = isSnapshooter
    ? createSnapshooterPlan({ cwd, production: process.env.NODE_ENV === 'production' })
    : createPlan({ cwd, pkg, corePkg, watch: isWatch });

  const context = {
    pkg,
    banner: getBanner(pkg, new Date().getFullYear()),
    rollup,
    checkLocale: !isSnapshooter,
    nodeEnv: process.env.NODE_ENV,
  };
  const bundles = plan.map((bundle) => ({ label: bundle.label, options: createRolldownOptions(bundle, context) }));

  if (isWatch) {
    const watcher = watch(bundles.map(({ options }) => options));
    watcher.on('event', (event) => {
      if (event.code === 'BUNDLE_END') {
        console.log(`built ${path.relative(cwd, event.output[0] || cwd)} in ${event.duration}ms`);
        event.result.close();
      } else if (event.code === 'ERROR') {
        console.error(event.error);
        event.result.close();
      } else if (event.code === 'END') {
        console.log('waiting for changes...');
      }
    });
    return;
  }

  await Promise.all(
    bundles.map(async ({ options }) => {
      const { output, ...input } = options;
      const bundle = await rolldown(input);
      try {
        // the outputs share the bundle, but write one after the other
        // eslint-disable-next-line no-restricted-syntax
        for (const out of output) {
          // eslint-disable-next-line no-await-in-loop
          await bundle.write(out);
        }
      } finally {
        await bundle.close();
      }
    })
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
