/* eslint no-underscore-dangle:0 */
import extend from 'extend';

import baseRawJSON from './themes/base.json';
import lightRawJSON from './themes/light.json';
import darkRawJSON from './themes/dark.json';
import baseInheritRawJSON from './themes/base_inherit.json';

export default function setTheme(t, resolve) {
  const colorRawJSON = t.type === 'dark' ? darkRawJSON : lightRawJSON;
  let baseInherit = baseInheritRawJSON;
  if (t._inherit === false || t._inherit === 'false') {
    baseInherit = {};
  }
  const root = extend(true, {}, baseInherit, baseRawJSON, colorRawJSON);
  // avoid merging known array objects as it could cause issues if they are of different types (pyramid vs class) or length
  const rawThemeJSON = extend(true, {}, root, { scales: null, palettes: { data: null, ui: null } }, t);
  if (!rawThemeJSON.palettes.data || !rawThemeJSON.palettes.data.length) {
    rawThemeJSON.palettes.data = root.palettes.data;
  }
  if (!rawThemeJSON.palettes.ui || !rawThemeJSON.palettes.ui.length) {
    rawThemeJSON.palettes.ui = root.palettes.ui;
  }
  if (!rawThemeJSON.scales || !rawThemeJSON.scales.length) {
    rawThemeJSON.scales = root.scales;
  }

  const resolvedThemeJSON = resolve(rawThemeJSON);

  return resolvedThemeJSON;
}
