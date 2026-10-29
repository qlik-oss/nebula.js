import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import postcss from 'postcss';
import postcssModules from 'postcss-modules';
import loadPostcssConfig from 'postcss-load-config';

const STYLE_FILE = /\.(css|scss|sass|less)$/;
// a file that is a CSS module: `style.module.css`, `style.module.scss`
const MODULE_FILE = /\.module\.[a-z]{2,6}$/;
const INJECT_ID = '\0nebula-style-inject';

// the stylesheet is put into the head of the document when the bundle is loaded, nothing happens without a document
const INJECT_CODE = `export default function styleInject(css) {
  if (!css || typeof document === 'undefined') {
    return;
  }
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  head.appendChild(style);
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}
`;

// the sass and less of the project that is built, these are not dependencies of the build
const loadFromProject = (name, cwd) => {
  try {
    return createRequire(path.join(cwd, 'package.json'))(name);
  } catch (e) {
    return null;
  }
};

const sassImporter = (file) => ({
  // `~package/file`, a path in node_modules, the way webpack's sass-loader reads it
  findFileUrl(url) {
    if (!/^~([a-z\d]|@)/i.test(url)) {
      return null;
    }
    const spec = url.slice(1);
    let dir = path.dirname(file);
    for (;;) {
      const candidate = path.join(dir, 'node_modules', spec);
      const { dir: parent, base } = path.parse(candidate);
      const found = ['', '.scss', '.sass', '.css'].some(
        (ext) => fs.existsSync(`${candidate}${ext}`) || fs.existsSync(path.join(parent, `_${base}${ext}`))
      );
      if (found) {
        return pathToFileURL(candidate);
      }
      const up = path.dirname(dir);
      if (up === dir) {
        return null;
      }
      dir = up;
    }
  },
});

const compileSass = async (sass, file) => {
  if (typeof sass.compileAsync !== 'function') {
    throw new Error('Sass files can be built with Dart Sass 1.45 or later, update "sass" in the project.');
  }
  const { css, loadedUrls } = await sass.compileAsync(file, { importers: [sassImporter(file)] });
  return { css, dependencies: loadedUrls.filter((url) => url.protocol === 'file:').map((url) => url.pathname) };
};

const compileLess = async (less, file, code) => {
  const { css, imports } = await less.render(code, { filename: file });
  return { css, dependencies: imports };
};

const loadPostcss = async (file) => {
  try {
    return await loadPostcssConfig(
      {
        file: { extname: path.extname(file), dirname: path.dirname(file), basename: path.basename(file) },
        options: {},
      },
      path.dirname(file)
    );
  } catch (e) {
    // a project does not have to have a configuration of PostCSS
    if (String(e.message).includes('No PostCSS Config found')) {
      return {};
    }
    throw e;
  }
};

/**
 * Reads stylesheets (`.css`, `.scss`, `.sass` and `.less`) as modules of the bundle.
 *
 * The stylesheet is put into a `<style>` element in the head of the document when the bundle is loaded. The default export
 * of the module is the stylesheet as a string, or the map from the class names to the generated ones for a CSS module
 * (`*.module.css`, class names are `[name]_[local]__[hash:base64:5]`). The stylesheet is also the named export `stylesheet`.
 * The stylesheets go through PostCSS, with the plugins of the postcss config of the project.
 *
 * @param {object} options
 * @param {string} options.cwd The directory of the project, `sass` and `less` are loaded from there.
 * @returns {import('rolldown').Plugin}
 */
export default function cssPlugin({ cwd }) {
  return {
    name: 'nebula-css',
    resolveId(id) {
      return id === INJECT_ID ? id : null;
    },
    load: {
      filter: { id: { include: [STYLE_FILE, new RegExp(`^${INJECT_ID}$`)] } },
      async handler(id) {
        if (id === INJECT_ID) {
          return { code: INJECT_CODE, moduleType: 'js' };
        }
        const file = id.replace(/[?#].*$/, '');
        const source = await fs.promises.readFile(file, 'utf8');
        let code = source;
        if (/\.s[ac]ss$/.test(file)) {
          const sass = loadFromProject('sass', cwd);
          if (!sass) {
            throw new Error('You need to install "sass" in order to process Sass files');
          }
          const compiled = await compileSass(sass, file);
          code = compiled.css;
          compiled.dependencies.forEach((dependency) => this.addWatchFile(dependency));
        } else if (/\.less$/.test(file)) {
          const less = loadFromProject('less', cwd);
          if (!less) {
            throw new Error('You need to install "less" in order to process Less files');
          }
          const compiled = await compileLess(less, file, source);
          code = compiled.css;
          compiled.dependencies.forEach((dependency) => this.addWatchFile(dependency));
        }

        const config = await loadPostcss(file);
        const isModule = MODULE_FILE.test(file);
        let classNames;
        const plugins = [
          ...(isModule
            ? [
                postcssModules({
                  generateScopedName: '[name]_[local]__[hash:base64:5]',
                  getJSON: (filepath, json) => {
                    classNames = json;
                  },
                }),
              ]
            : []),
          ...(config.plugins || []),
        ];
        const result = await postcss(plugins).process(code, { ...config.options, from: file, to: file, map: false });
        result.warnings().forEach((warning) => this.warn(warning.toString()));
        result.messages
          .filter((message) => message.type === 'dependency')
          .forEach((message) => this.addWatchFile(message.file));

        return {
          code: [
            `var css = ${JSON.stringify(result.css)};`,
            `export default ${isModule ? JSON.stringify(classNames || {}) : 'css'};`,
            `export var stylesheet = css;`,
            `import styleInject from ${JSON.stringify(INJECT_ID)};`,
            `styleInject(css);`,
          ].join('\n'),
          moduleType: 'js',
        };
      },
    },
  };
}
