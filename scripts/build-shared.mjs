// What the builds of the packages share, the libraries (rslib.mjs) and the pages of nebula serve
// (commands/serve/rsbuild.config.mjs). This is build time tooling, it is not part of a package.
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// the browsers that Qlik supports, as the other packages of Qlik do
export const browserList = require('@qlik/browserslist-config');

export const readPackage = (dir) => require(path.join(dir, 'package.json'));

/**
 * The version of a package and a short hash of it, for the code of the bundle that tells which version it is.
 */
export const versionDefines = ({ version }) => ({
  'process.env.NEBULA_VERSION': JSON.stringify(version),
  'process.env.NEBULA_VERSION_HASH': JSON.stringify(crypto.createHash('md5').update(version).digest('hex').slice(0, 4)),
});
