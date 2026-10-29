// the resolver of ESLint does not read the exports of a package
// eslint-disable-next-line import/no-unresolved
import { parseSync } from 'rolldown/utils';

/**
 * The minifier of Rolldown writes a string as a template literal when that is how it prints it, e.g. `typeof process<\`u\``.
 * That is valid, but not what other tools expect to find. Parcel, for one, only knows that `typeof process == "object"`
 * is a check for the presence of `process`. It adds its `process` polyfill when it sees anything else. This writes the
 * template literals that are plain strings with quotes again.
 *
 * A quote takes the place of a backtick, so the code has the same length and nothing is moved: the source map of the code
 * is still the map of the result.
 *
 * @param {string} code Minified code.
 * @returns {string}
 */
export default function plainStrings(code) {
  const { program, errors } = parseSync('chunk.js', code, { lang: 'js', sourceType: 'unambiguous' });
  if (errors.length) {
    throw new Error(`Cannot parse the code to find template literals: ${errors[0].message}`);
  }

  const replace = [];
  const visit = (node, parent) => {
    if (Array.isArray(node)) {
      node.forEach((child) => visit(child, parent));
      return;
    }
    if (!node || typeof node !== 'object') {
      return;
    }
    if (
      node.type === 'TemplateLiteral' &&
      node.expressions.length === 0 &&
      parent?.type !== 'TaggedTemplateExpression'
    ) {
      const [{ value }] = node.quasis;
      // anything that is escaped, or that is not on one line, stays a template literal
      if (!/[\\\n\r\u2028\u2029]/.test(value.raw) && value.raw === value.cooked) {
        const quote = !value.raw.includes('"') ? '"' : !value.raw.includes("'") && "'";
        if (quote) {
          replace.push([node.start, node.end, quote]);
        }
      }
      return;
    }
    Object.values(node).forEach((child) => {
      if (child && typeof child === 'object') {
        visit(child, node);
      }
    });
  };
  visit(program, null);

  // the offsets are in UTF-16 code units, which is what the characters of a string are
  const out = code.split('');
  replace.forEach(([start, end, quote]) => {
    out[start] = quote;
    out[end - 1] = quote;
  });
  return out.join('');
}
