import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from '@rsbuild/core';

import { browserList, readPackage, versionDefines } from '../../scripts/build-shared.mjs';
import fixturesAlias, { fixturesEntry, resolveFixturePath } from './lib/fixtures-alias.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const favicon = path.resolve(moduleDir, '../../docs/assets/njs.png');

const pkg = readPackage(moduleDir);

// the files that the pages of nebula serve ask for have the name of their entry
const fileNames = { js: '[name].js', css: '[name].css' };

/**
 * The config of Rsbuild for the pages of nebula serve: the hub (index.html) and the page that renders a
 * visualization (eRender.html), and in a development build the fixtures that the page can render.
 *
 * This is build time tooling, it is not part of the package. `pnpm build` builds the pages with it, and `pnpm start`
 * serves them from source (see dev.js).
 */
export const pagesConfig = ({ srcDir, distDir, dev = false, serveConfig = {} }) => ({
  mode: dev ? 'development' : 'production',
  root: srcDir,
  source: {
    entry: {
      // the fixtures are in the page that renders only when running nebula serve, as a script of it
      eRender: [path.resolve(srcDir, 'eRender'), ...(dev ? [fixturesEntry(serveConfig.fixturePath)] : [])],
      index: path.resolve(srcDir, 'eHub'),
    },
    define: {
      __NEBULA_DEV__: true,
      __NEBULA_FIXTURE_DIR__: JSON.stringify(resolveFixturePath(serveConfig.fixturePath)),
      ...versionDefines(pkg),
    },
    alias: {
      '@nebula.js/stardust': path.resolve(moduleDir, '../../apis/stardust/src'),
      '@nebula.js/theme': path.resolve(moduleDir, '../../apis/theme/src'),
      '@nebula.js/conversion': path.resolve(moduleDir, '../../apis/conversion/src'),
      '@nebula.js/locale/all.json$': path.resolve(moduleDir, '../../apis/locale/all.json'),
      '@nebula.js/locale': path.resolve(moduleDir, '../../apis/locale/src'),
    },
    // the nucleus source and the icons are jsx, in the package as in the web folder
    include: [srcDir, /nucleus/, /ui[/\\]icons/],
  },
  resolve: {
    extensions: ['.dev.js', '.js', '.jsx'],
  },
  output: {
    target: 'web',
    distPath: { root: distDir, js: '', css: '', html: '' },
    filename: fileNames,
    sourceMap: { js: 'source-map' },
    // the style of a dependency (monaco) is added to the page by the script that imports it
    injectStyles: true,
    legalComments: 'linked',
    browserslist: browserList,
    assetPrefix: '/',
    cleanDistPath: false,
  },
  html: {
    favicon,
    template: ({ entryName }) => path.resolve(srcDir, entryName === 'index' ? 'index.html' : 'eRender.html'),
    // the scripts and style sheets of the configuration are on the page that renders
    tags: (serveConfig.scripts || [])
      .map((src) => ({ tag: 'script', attrs: { src }, append: false }))
      .concat(
        (serveConfig.stylesheets || []).map((href) => ({
          tag: 'link',
          attrs: { rel: 'stylesheet', href },
          append: false,
        }))
      ),
  },
  tools: {
    swc: {
      jsc: { transform: { react: { runtime: 'automatic', development: dev } } },
    },
    rspack: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          '@nebula.js/snapshooter/client': path.resolve(moduleDir, '../../apis/snapshooter/src/renderer'),
          // the context of the fixtures is a request of the bundler, not an import of a module
          ...fixturesAlias(serveConfig.fixturePath),
          ...config.resolve?.alias,
        },
      },
      ignoreWarnings: [/node_modules[/\\]@qlik[/\\]sdk/],
      module: {
        ...config.module,
        // Rspack defaults `exportsPresence` to 'error' (webpack 5 only warns for the same case).
        // web/utils/testRenderer.jsx (pulled into the hub bundle via AppList.jsx/Root.jsx) imports
        // @testing-library/react, which destructures a `React.act` export that this repo's React
        // doesn't expose statically.
        parser: { ...config.module?.parser, javascript: { exportsPresence: 'warn' } },
      },
    }),
  },
});

// the pages of nebula serve, as the package is built
export default defineConfig(
  pagesConfig({
    srcDir: path.resolve(moduleDir, 'web'),
    distDir: path.resolve(moduleDir, 'dist'),
    dev: process.env.NODE_ENV !== 'production',
  })
);
