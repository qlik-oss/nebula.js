// Puts the css that css-loader produced into a <style> element in the document head when the bundle is loaded.
//
// This is what rollup-plugin-postcss did (it inlined the css into the bundle with a tiny helper), kept on
// purpose instead of style-loader:
// - nothing happens when there is no document, so a bundle can still be required in node (tests, ssr)
// - no extra runtime modules in the bundle
//
// The module's default export is the class name map for css modules (`import styles from './a.module.css'`)
// and the css text for plain css, as it was with rollup-plugin-postcss.

module.exports = function injectStyleLoader() {};

module.exports.pitch = function pitch(remainingRequest) {
  const request = JSON.stringify(this.utils.contextify(this.context, `!!${remainingRequest}`));
  return `
import content from ${request};
var css = String(content);
if (css && typeof document !== 'undefined') {
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
export default content && content.locals ? content.locals : css;
`;
};
