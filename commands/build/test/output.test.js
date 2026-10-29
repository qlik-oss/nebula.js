/* eslint-disable import/extensions, no-console */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parse } from 'acorn';

import build from '../lib/build.js';

// What a bundler or a browser that reads our bundles sees: the syntax of the bundles, and guards they have to recognise.

const write = (dir, name, content) => {
  fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
  fs.writeFileSync(path.join(dir, name), content);
};

const walk = (node, visit) => {
  if (!node || typeof node.type !== 'string') {
    return;
  }
  visit(node);
  Object.values(node).forEach((value) =>
    (Array.isArray(value) ? value : [value]).forEach(
      (child) => child && typeof child === 'object' && walk(child, visit)
    )
  );
};

const parseBundle = (file, sourceType) =>
  parse(fs.readFileSync(file, 'utf8'), { ecmaVersion: 2022, sourceType, allowHashBang: true });

describe('the bundles', () => {
  let root;
  let dir;
  const originalLog = console.log;
  const originalWarn = console.warn;

  before(async () => {
    root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-output-')));
    dir = path.join(root, 'project');
    console.log = () => {};
    console.warn = () => {};
    console.time = () => {};
    console.timeEnd = () => {};
    write(
      dir,
      'package.json',
      JSON.stringify({
        name: '@acme/viz',
        version: '1.0.0',
        license: 'MIT',
        main: 'dist/viz.js',
        module: 'dist/viz.esm.js',
        systemjs: 'dist/viz.systemjs.js',
        peerDependencies: { '@nebula.js/stardust': '*' },
      })
    );
    write(
      dir,
      'node_modules/@nebula.js/stardust/package.json',
      JSON.stringify({ name: '@nebula.js/stardust', main: 'index.js' })
    );
    write(dir, 'node_modules/@nebula.js/stardust/index.js', 'exports.x = 1;\n');
    // a library that guards its use of what only exists in some environments, the way many do
    write(dir, 'node_modules/guarded/package.json', JSON.stringify({ name: 'guarded', main: 'index.js' }));
    write(
      dir,
      'node_modules/guarded/index.js',
      `var isNode = typeof process !== 'undefined' && typeof process.versions === 'object';
var hasWindow = typeof window === 'object' && typeof window.document !== 'undefined';
var req = typeof require === 'function';
module.exports = function guarded() { return [isNode, hasWindow, req, typeof Buffer === 'function', 'a string', "it's"]; };
`
    );
    write(
      dir,
      'src/index.ts',
      `import guarded from 'guarded';
export default function supernova(): unknown {
  return { guarded: guarded(), label: \`not \${guarded.name} guard\`, tag: 'plain' };
}
`
    );
    await build({ cwd: dir, typescript: true });
  });

  after(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    fs.rmSync(root, { recursive: true, force: true });
  });

  const outputs = [
    ['viz.js', 'script'],
    ['viz.esm.js', 'module'],
    ['viz.systemjs.js', 'script'],
  ];

  outputs.forEach(([file, sourceType]) => {
    it(`${file} parses as ES2022, the oldest of the browsers we build for`, () => {
      assert.doesNotThrow(() => parseBundle(path.join(dir, 'dist', file), sourceType));
    });

    it(`${file} writes the strings that guard code as strings, so that bundlers recognise typeof process`, () => {
      const code = fs.readFileSync(path.join(dir, 'dist', file), 'utf8');
      assert.match(code, /["']undefined["']\s*!?==?\s*typeof process|typeof process\s*!?==?\s*["']undefined["']/);
      const ast = parseBundle(path.join(dir, 'dist', file), sourceType);
      const quasis = [];
      walk(ast, (node) => {
        // `typeof x === \`string\`` is what makes a bundler lose track of the guard
        if (node.type === 'BinaryExpression' && [node.left, node.right].some((n) => n.type === 'TemplateLiteral')) {
          quasis.push(code.slice(node.start, node.end));
        }
        if (node.type === 'TemplateLiteral' && node.expressions.length === 0 && node.quasis[0].value.cooked !== 'x') {
          // no template without a placeholder that is not in the source, which has one
          quasis.push(code.slice(node.start, node.end));
        }
      });
      assert.deepEqual(quasis, [], `template literals in ${file}`);
    });
  });

  it('keeps the template literal of the source that has a placeholder', () => {
    const code = fs.readFileSync(path.join(dir, 'dist/viz.js'), 'utf8');
    assert.match(code, /`not \$\{/);
  });
});
