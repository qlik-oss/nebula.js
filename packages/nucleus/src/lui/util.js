export function camelToKebabCase(value) {
  return value.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function luiClassName(name, opts = {}) {
  const {
    className,
    modifiers = {},
    states = {},
  } = opts;

  const baseClass = `lui-${name}`;
  let resClassName = baseClass;

  Object.keys(modifiers).forEach((key) => {
    // Modifiers can be booleans or key-value pair of strings
    if (typeof modifiers[key] === 'boolean') {
      if (modifiers[key]) {
        resClassName += ` ${baseClass}--${key}`;
      }
    } else if (modifiers[key]) {
      resClassName += ` ${baseClass}--${modifiers[key]}`;
    }
  });

  Object.keys(states).forEach((key) => {
    // States are always booleans
    if (states[key]) {
      resClassName += ` lui-${key}`;
    }
  });

  if (className) {
    resClassName += ` ${className}`;
  }

  return resClassName;
}
