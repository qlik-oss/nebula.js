import MagicString from 'magic-string';
// the resolver of ESLint does not read the exports of a package
// eslint-disable-next-line import/no-unresolved
import { parseSync } from 'rolldown/utils';

const REQUIRE = '__require';

/**
 * A CommonJS module that requires one of the externals of the bundle, like react-dom does with react, is made to call
 * a `__require` function in an ES bundle. That function needs a global `require`, which a browser does not have, and a
 * bundler that consumes the bundle has no way to find the module that is meant. Rollup made those requires imports.
 * This does the same: the calls are replaced with the namespace of an import of the external.
 *
 * @param {string} code ES module code, before it is minified.
 * @param {string[]} externals The modules that are not part of the bundle.
 * @returns {{ code: string, map: object } | null} Null when there is nothing to replace.
 */
export default function importExternalRequires(code, externals) {
  const { program, errors } = parseSync('chunk.js', code, { lang: 'js', sourceType: 'module' });
  if (errors.length) {
    throw new Error(`Cannot parse the code to find requires: ${errors[0].message}`);
  }

  const calls = [];
  let references = 0;
  const declarations = [];
  const visit = (node) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== 'object') {
      return;
    }
    if (node.type === 'Identifier' && node.name === REQUIRE) {
      references += 1;
    }
    if (
      node.type === 'VariableDeclaration' &&
      node.declarations.length === 1 &&
      node.declarations[0].id.name === REQUIRE
    ) {
      declarations.push(node);
    }
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      node.callee.name === REQUIRE &&
      node.arguments.length === 1 &&
      node.arguments[0].type === 'Literal' &&
      externals.includes(node.arguments[0].value)
    ) {
      calls.push(node);
    }
    Object.values(node).forEach((child) => child && typeof child === 'object' && visit(child));
  };
  visit(program);

  if (!calls.length) {
    return null;
  }

  const s = new MagicString(code);
  const specifiers = [...new Set(calls.map((call) => call.arguments[0].value))];
  const names = new Map(specifiers.map((specifier, i) => [specifier, `__external${i}`]));
  calls.forEach((call) => s.overwrite(call.start, call.end, names.get(call.arguments[0].value)));

  // the function is not needed when it has no other callers, the declaration is the only other mention of it
  if (references === calls.length + declarations.length) {
    declarations.forEach((declaration) => s.remove(declaration.start, declaration.end));
  }

  s.prepend(
    specifiers.map((specifier) => `import * as ${names.get(specifier)} from ${JSON.stringify(specifier)};\n`).join('')
  );
  return { code: s.toString(), map: s.generateMap({ hires: 'boundary' }) };
}
