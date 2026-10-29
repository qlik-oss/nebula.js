import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
// the resolver of ESLint does not read the exports of a package
// eslint-disable-next-line import/no-unresolved
import { parseSync } from 'rolldown/utils';
import plainStrings from '../plain-strings.mjs';
import importExternalRequires from '../external-requires.mjs';
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

describe('plainStrings', () => {
  test('writes template literals without expressions as strings, and does not change the length', () => {
    const code = 'var a=`x`+`it\'s`+`say "hi"`+`é`;typeof q==`object`&&typeof q.emit<`u`';
    const out = plainStrings(code);
    assert.equal(out, 'var a="x"+"it\'s"+\'say "hi"\'+"é";typeof q=="object"&&typeof q.emit<"u"');
    assert.equal(out.length, code.length);
  });

  test('leaves what is not a plain string', () => {
    // eslint-disable-next-line no-template-curly-in-string
    const code = 'var a=tag`y`+`z${1}`+`a\\nb`+`two\nlines`+`both \' and "`;';
    assert.equal(plainStrings(code), code);
  });

  test('does not touch templates in comments and strings', () => {
    const code = 'var a="`b`";/* `c` */var d=`e`;';
    assert.equal(plainStrings(code), 'var a="`b`";/* `c` */var d="e";');
  });
});

describe('importExternalRequires', () => {
  const code = [
    `var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : x)(function(id) { throw Error(id); });`,
    `var React = __require("react");`,
    `var Dom = __require("react-dom");`,
    `var Other = __require("not-external");`,
    `export { React, Dom, Other };`,
  ].join('\n');

  test('replaces the requires of externals with imports, and keeps the others', () => {
    const { code: out } = importExternalRequires(code, ['react', 'react-dom']);
    assert.match(out, /import \* as __external0 from "react";/);
    assert.match(out, /import \* as __external1 from "react-dom";/);
    assert.match(out, /var React = __external0;/);
    assert.match(out, /var Other = __require\("not-external"\);/);
    // there is a caller left, so the function stays
    assert.match(out, /var __require =/);
  });

  test('removes the function when nothing calls it any more', () => {
    const { code: out } = importExternalRequires(code.replace(/var Other.*\n/, ''), ['react', 'react-dom']);
    assert.ok(!out.includes('__require'));
    assert.ok(!out.includes('typeof require'));
  });

  test('has nothing to do without a require of an external', () => {
    assert.equal(importExternalRequires(code, ['other']), null);
  });
});

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
      assert.match(code, /typeof process(<|!==|!=)["']u(ndefined)?["']/);
      assert.match(code, /typeof process(==|===)"object"/);
      assert.match(code, /typeof process\.emit(==|===)"function"/);
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
