/**
 * Escape a script field name. Will add surrounding brackets if the field name contains special characters.
 * Examples:
 * Field1 -> Field1
 * My field -> [My field]
 * My] field -> [My]] field]
 *
 * @param field
 * @returns {*}
 */
const escapeField = (field) => {
  if (!field || field === ']') {
    return field;
  }
  if (/^[A-Za-z][A-Za-z0-9_]*$/.test(field)) {
    return field;
  }
  return `[${field.replace(/\]/g, ']]')}]`;
};

export default escapeField;
