// eslint-disable-next-line import/no-unresolved -- @rspack/core is resolvable at runtime; the lint resolver doesn't know about it
import { rspack } from '@rspack/core';

// a notice that has to stay with the code: @license and @preserve comments and /*! comments
const LEGAL = /@license|@preserve|^\/\*!/;
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;

const normalise = (comment) => comment.replace(/\s+/g, ' ').trim();

/**
 * Keeps the legal comments of the bundled code in the minified output.
 *
 * Rollup's terser kept them. rspack's minifier drops a comment together with the code it is attached to when it
 * folds or removes that code, which loses notices such as the license of a dependency whose function got inlined.
 * So collect the comments before the bundle is minified and put them back, once, at the top of it afterwards,
 * below the `banner` when there is one.
 */
export default class LegalCommentsPlugin {
  constructor({ name = 'LegalCommentsPlugin', banner = '' } = {}) {
    this.name = name;
    this.banner = banner;
  }

  apply(compiler) {
    const { Compilation, sources } = rspack;
    const { name, banner } = this;

    compiler.hooks.compilation.tap(name, (compilation) => {
      const collected = new Map();

      compilation.hooks.processAssets.tap(
        { name, stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE - 1 },
        (assets) => {
          Object.keys(assets)
            .filter((file) => /\.[cm]?js$/.test(file))
            .forEach((file) => {
              const seen = new Map();
              (String(assets[file].source()).match(BLOCK_COMMENT) || [])
                .filter((comment) => LEGAL.test(comment))
                .forEach((comment) => seen.set(normalise(comment), comment));
              collected.set(file, [...seen.values()]);
            });
        }
      );

      // after the banner plugin, which is applied at the stage before this one
      compilation.hooks.processAssets.tap(
        { name, stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 2 },
        (assets) => {
          Object.keys(assets).forEach((file) => {
            const comments = collected.get(file) || [];
            const text = String(assets[file].source());
            const missing = comments.filter((comment) => !text.includes(comment));
            if (!missing.length) {
              return;
            }
            // the banner is followed by an empty line
            const position = banner && text.startsWith(`${banner}\n`) ? banner.length + 1 : 0;
            compilation.updateAsset(file, (old) => {
              const edited = new sources.ReplaceSource(old);
              edited.insert(position, `${missing.join('\n')}\n`);
              return edited;
            });
          });
        }
      );
    });
  }
}
