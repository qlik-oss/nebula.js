/**
 * Gets a value from a data object structure.
 *
 * @ignore
 * @param data The data object.
 * @param reference Reference to the value.
 * @param defaultValue Default value to return if no value was found.
 * @returns {*} The default value if specified, otherwise undefined.
 */
const getValue = (data, reference, defaultValue) => {
  if (data === undefined || data === null || reference === undefined || reference === null) {
    return defaultValue;
  }
  const steps = reference.split('.');
  let dataContainer = data;
  for (let i = 0; i < steps.length; ++i) {
    const step = steps[i];
    if (step === '') {
      continue; // eslint-disable-line no-continue
    }
    if (dataContainer[step] === undefined || dataContainer[step] === null) {
      return defaultValue;
    }
    dataContainer = dataContainer[step];
  }
  return dataContainer;
};

/**
 * Sets a value in a data object using a dot notated reference to point out the path.
 *
 * Example:
 * If data is an empty object, reference is "my.value" and value the is "x", then
 * the resulting data object will be: { my:	{ value: "x" } }
 *
 * @ignore
 * @param data The data object. Must be an object.
 * @param reference Reference to the value.
 * @param value Arbitrary value to set. If the value is set to undefined, the value property will be removed.
 */
const setValue = (data, reference, value) => {
  if (data === undefined || data === null || reference === undefined || reference === null) {
    return;
  }
  const steps = reference.split('.');
  const propertyName = steps[steps.length - 1];
  let dataContainer = data;

  for (let i = 0; i < steps.length - 1; ++i) {
    const step = steps[i];
    if (dataContainer[step] === undefined || dataContainer[step] === null) {
      dataContainer[step] = Number.isNaN(+steps[i + 1]) ? {} : [];
    }
    dataContainer = dataContainer[step];
  }

  if (typeof value !== 'undefined') {
    dataContainer[propertyName] = value;
  } else {
    delete dataContainer[propertyName];
  }
};

const isEmpty = (object) => {
  return Object.keys(object).length === 0 && object.constructor === Object;
};

export default {
  getValue,
  setValue,
  isEmpty,
};
