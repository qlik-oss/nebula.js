import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
// the resolver of ESLint does not read the exports of a package
// eslint-disable-next-line import/no-unresolved
import { parseSync } from 'rolldown/utils';
import { buildTo, write } from './helpers.mjs';

// What a consumer of the bundles can trip on. Parcel, for one, adds its `process` polyfill, and then fails to resolve
// it, when it does not recognise `typeof process == "object"` as a check for `process`: it wants a string literal.

const templatesWithoutExpressions = (code) => {
  const found = [];
  const visit = (node, parent) => {
    if (Array.isArray(node)) return node.forEach((n) => visit(n, parent));
    if (!node || typeof node !== 'object') return undefined;
    if (
      node.type === 'TemplateLiteral' &&
      node.expressions.length === 0 &&
      parent?.type !== 'TaggedTemplateExpression'
    ) {
      found.push(code.slice(node.start, node.end));
    }
    return Object.values(node).forEach((c) => c && typeof c === 'object' && visit(c, node));
  };
  visit(parseSync('a.js', code, { lang: 'js', sourceType: 'unambiguous' }).program, null);
  return found;
};

// `typeof x == "string"`, in the order in which the minifier writes it. The minifier of Rolldown writes
// `typeof x < "u"` for a check of "undefined", which Parcel recognises as long as "u" is a string and not a template.
const guard = (expression, type) => {
  const x = `typeof ${expression.replace('.', '\\.')}`;
  const short = type === 'undefined' ? `|${x}<"u"|"u">${x}\\b` : '';
  return new RegExp(`${x}(==|===|!=|!==)"${type}"|"${type}"(==|===|!=|!==)${x}\\b${short}`);
};

describe('bundles for consumers', () => {
  let dir;

  before(() => {
    dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'consumers-test-')));
    write(dir, {
      'src/index.js': [
        `import legacy from './legacy.cjs';`,
        `export const isNode = typeof process !== 'undefined' && !!process.version;`,
        `export const hasEmit = typeof process === 'object' && typeof process.emit === 'function';`,
        `export const label = 'plain';`,
        `export { legacy };`,
        ``,
      ].join('\n'),
      // like react-dom, in CommonJS and requires a peer
      'src/legacy.cjs': `const react = require('react');\nmodule.exports = () => react.name;\n`,
    });
  });

  after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const bundle = (outputs, inline = true) => ({
    label: 'test',
    debug: false,
    minify: true,
    sourcemap: true,
    define: true,
    input: path.join(dir, 'src', 'index'),
    external: ['react'],
    inlineDynamicImports: inline,
    outputs,
  });

  const outputs = {
    umd: { format: 'umd', file: 'umd/stardust.js', exports: 'named', name: 'stardust', globals: { react: 'React' } },
    es: { format: 'es', file: 'es/stardust.js', exports: 'named' },
    system: { format: 'system', dir: 'sys', entryFileName: 'stardust.systemjs.js', exports: 'named' },
  };

  Object.entries(outputs).forEach(([name, output]) => {
    test(`${name}: minified code has no template literals for plain strings, and guards process with strings`, async () => {
      const out = {
        ...output,
        ...(output.file ? { file: path.join(dir, output.file) } : { dir: path.join(dir, output.dir) }),
      };
      await buildTo(dir, bundle([out], name !== 'system'));
      const file = output.file ? path.join(dir, output.file) : path.join(dir, output.dir, output.entryFileName);
      const code = fs.readFileSync(file, 'utf8');
      assert.deepEqual(templatesWithoutExpressions(code), []);
      assert.match(code, guard('process', 'undefined'));
      assert.match(code, guard('process', 'object'));
      assert.match(code, guard('process.emit', 'function'));
    });
  });

  ['es', 'system'].forEach((name) => {
    test(`${name}: a CommonJS module that requires a peer gets an import, not a require function`, async () => {
      const output = outputs[name];
      const out = {
        ...output,
        ...(output.file
          ? { file: path.join(dir, `peer-${output.file}`) }
          : { dir: path.join(dir, `peer-${output.dir}`) }),
      };
      await buildTo(dir, bundle([out], name !== 'system'));
      const file = output.file ? out.file : path.join(out.dir, output.entryFileName);
      const code = fs.readFileSync(file, 'utf8');
      assert.ok(!/__require|typeof require/.test(code), 'no require shim');
      assert.match(
        code,
        name === 'es' ? /import\s*\*\s*as \w+ from\s*"react"/ : /System\.register\(\[[^\]]*['"]react['"]/
      );
    });
  });

  test('the es bundle runs where there is no require', async () => {
    write(dir, {
      'node_modules/react/package.json': '{ "name": "react", "type": "module", "exports": "./index.js" }',
      'node_modules/react/index.js': `export const name = 'React';\n`,
      'peer-es/package.json': '{ "type": "module" }',
    });
    const { legacy } = await import(pathToFileURL(path.join(dir, 'peer-es/stardust.js')));
    assert.equal(legacy(), 'React');
  });
});
