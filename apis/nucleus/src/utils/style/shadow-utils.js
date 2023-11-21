const MULTI_REG = /,(?![^(]*\))/;
const SINGLE_REG = /\s(?![^(]*\))/;
const LENGTH_REG = /^[0-9]+[a-zA-Z%]+?$/;
const PREDEFINED_STRINGS = ['none', 'inset', 'initial', 'inherit'];
const isLength = (v) => v === '0' || LENGTH_REG.test(v);

export const getColor = (singleShadowString) => {
  if (!singleShadowString) return undefined;
  const parts = singleShadowString.split(SINGLE_REG).filter((part) => !PREDEFINED_STRINGS.includes(part.toLowerCase()));
  const last = parts.at(-1);
  const color = last && !isLength(last) && !PREDEFINED_STRINGS.includes(last.toLowerCase()) ? last : undefined;
  return color;
};

export const getShadows = (shadowString) => {
  if (!shadowString) return [];
  return shadowString.split(MULTI_REG).map((s) => s.trim());
};

/**
 * Combine box shadow with box shadow color.
 * @ignore
 * @param {string} boxShadow - Box shadow which may include color
 * @param {string} themeBoxShadow - Box shadow from theme which may include color
 * @param {string | undefined} boxShadowColor - Box shadow color
 * @returns {string} Returns the combined box shadow and box shadow color
 *
 * If boxShadow is a single shadow and has a color then this color will be replaced by boxShadowColor and then
 * returned as the result,otherwise boxShadowColor will be added to boxShadow and then returned as the result.
 * If boxShadow is multiple shadows or an empty string then it will be returned as the result.
 *
 * @example getFullBoxShadow('none', '', 'red') returns 'none'
 *
 * @example getFullBoxShadow('initial', '', 'red') returns 'initial'
 *
 * @example getFullBoxShadow('inherit', '', 'red') returns 'inherit'
 *
 * @example getFullBoxShadow('', '', 'red') returns ''
 *
 * @example getFullBoxShadow('1px 2px blue, 3px 6px green', '', 'red') returns '1px 2px blue, 3px 6px green'
 *
 * @example getFullBoxShadow('1px 2px blue', '', 'red') returns '1px 2px red'
 *
 * @example getFullBoxShadow('1px 2px', '', 'red') returns '1px 2px red'
 *
 * @example getFullBoxShadow('1px 2px', '2px 5px green', undefined) returns '1px 2px green'
 *
 * @example getFullBoxShadow('1px 2px', '2px 5px', undefined) returns '1px 2px'
 */
export const getFullBoxShadow = (boxShadow, themeBoxShadow, boxShadowColor) => {
  if (boxShadow && PREDEFINED_STRINGS.includes(boxShadow.toLowerCase())) return boxShadow.toLowerCase();
  const shadowArray = getShadows(boxShadow);
  if (shadowArray.length !== 1) return boxShadow;
  let shadowColor = boxShadowColor;
  if (!shadowColor) {
    const themeShadowArray = getShadows(themeBoxShadow);
    if (themeShadowArray.length !== 1) return boxShadow;
    shadowColor = getColor(themeShadowArray[0]);
  }
  if (!shadowColor) return boxShadow;
  const color = getColor(shadowArray[0]);
  if (color) return boxShadow.replace(color, shadowColor);
  return `${boxShadow} ${shadowColor}`;
};
