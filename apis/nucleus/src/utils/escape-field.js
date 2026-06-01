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
