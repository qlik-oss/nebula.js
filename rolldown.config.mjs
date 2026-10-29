import fs from 'node:fs';
import path from 'node:path';
import { rollup } from 'rollup';
import { createPlan, createSnapshooterPlan, getBanner } from './tools/build/plan.mjs';
import { createRolldownOptions } from './tools/build/options.mjs';

// The config of the package in the current directory, `rolldown --config ../../rolldown.config.mjs`. NODE_ENV=production
// minifies the snapshooter client, which is the only bundle where that is not a given.

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const cwd = process.cwd();
const pkg = readJson(path.join(cwd, 'package.json'));
const corePkgFile = path.join(cwd, 'core', 'package.json');
const corePkg = fs.existsSync(corePkgFile) ? readJson(corePkgFile) : undefined;
const isSnapshooter = pkg.name === '@nebula.js/snapshooter';

const plan = isSnapshooter
  ? createSnapshooterPlan({ cwd, production: process.env.NODE_ENV === 'production' })
  : createPlan({ cwd, pkg, corePkg, watch: Boolean(process.env.ROLLDOWN_WATCH) });

const context = {
  pkg,
  banner: getBanner(pkg, new Date().getFullYear()),
  rollup,
  checkLocale: !isSnapshooter,
  nodeEnv: process.env.NODE_ENV,
};

export default plan.map((bundle) => createRolldownOptions(bundle, context));
