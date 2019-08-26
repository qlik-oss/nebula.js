/* eslint import/prefer-default-export: 0 */

export const prefixer = list => {
  const arr = Array.isArray(list) ? list : list.split(/\s+/);
  return arr
    .map(s => {
      if (s[0] === '-' || s[0] === '_') {
        return `nucleus${s}`;
      }
      return `nucleus-${s}`;
    })
    .join(' ');
};
