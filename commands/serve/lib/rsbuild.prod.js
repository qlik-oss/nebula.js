import path from 'path';
import { fileURLToPath } from 'url';

import fixturesAlias, { resolveFixturePath, fixturesIgnoreWarnings } from './fixtures-alias.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * The config of Rsbuild for the fixtures of the project that nebula serve is started in. The pages of nebula serve are
 * built with the package, only the fixtures are built when serve starts and are added to the page that renders.
 */
const cfg = ({ srcDir = path.resolve(moduleDir, '../dist'), serveConfig = {} }) => ({
  mode: 'development',
  root: srcDir,
  source: {
    entry: { fixtures: path.resolve(moduleDir, './fixtures.js') },
    define: { __NEBULA_FIXTURE_DIR__: JSON.stringify(resolveFixturePath(serveConfig.fixturePath)) },
  },
  output: {
    target: 'web',
    distPath: { root: path.resolve(srcDir, 'temp'), js: '', html: '' },
    filename: { js: '[name].js' },
    assetPrefix: '/',
    cleanDistPath: false,
  },
  html: {
    // the page that renders, as it was built with the package, with the fixtures added to it
    template: path.resolve(srcDir, 'eRender.html'),
    inject: 'head',
    tags: [
      ...(serveConfig.scripts || []).map((src) => ({ tag: 'script', attrs: { src }, append: false })),
      ...(serveConfig.stylesheets || []).map((href) => ({
        tag: 'link',
        attrs: { rel: 'stylesheet', href },
        append: false,
      })),
    ],
  },
  tools: {
    htmlPlugin: (config) => ({ ...config, filename: 'eRender.html' }),
    rspack: (config) => ({
      ...config,
      devtool: false,
      ignoreWarnings: [...(config.ignoreWarnings || []), ...fixturesIgnoreWarnings],
      resolve: { ...config.resolve, alias: { ...config.resolve?.alias, ...fixturesAlias(serveConfig.fixturePath) } },
      module: {
        ...config.module,
        rules: [...(config.module?.rules || []), { test: /\.m?js$/, resolve: { fullySpecified: false } }],
      },
    }),
  },
});

export default cfg;
