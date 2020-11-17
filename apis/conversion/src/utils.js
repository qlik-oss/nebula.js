import libraryUtils from './library-utils';

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
  const steps = reference.split('/');
  let dataContainer = data;
  if (dataContainer === undefined || dataContainer === null) {
    return defaultValue;
  }
  for (let i = 0; i < steps.length; ++i) {
    if (steps[i] === '') {
      continue; // eslint-disable-line no-continue
    }
    if (dataContainer[steps[i]] === undefined || dataContainer[steps[i]] === null) {
      return defaultValue;
    }
    dataContainer = dataContainer[steps[i]];
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
  if (!reference) {
    return;
  }
  const steps = reference.split('.');
  let dataContainer = data;
  const dataName = steps[steps.length - 1];
  let i;

  for (i = 0; i < steps.length - 1; ++i) {
    if (dataContainer[steps[i]] == null) {
      dataContainer[steps[i]] = Number.isNaN(+steps[i + 1]) ? {} : [];
    }
    dataContainer = dataContainer[steps[i]];
  }

  if (typeof value !== 'undefined') {
    dataContainer[dataName] = value;
  } else {
    delete dataContainer[dataName];
  }
};

const isEmpty = (object) => {
  return Object.keys(object).length === 0 && object.constructor === Object;
};

const checkLibraryObjects = (exportFormat, dimensionList, measureList) => {
  let i;
  let j;
  let dim;
  let meas;
  let libDim;
  let libMeas;
  for (i = 0; i < exportFormat.data.length; ++i) {
    for (j = 0; j < exportFormat.data[i].dimensions.length; ++j) {
      dim = exportFormat.data[i].dimensions[j];
      if (dim.qLibraryId) {
        libDim = libraryUtils.findLibraryDimension(dim.qLibraryId, dimensionList);
        if (libDim) {
          dim.title = libDim.qData.title;
        }
      }
    }
    for (j = 0; j < exportFormat.data[i].measures.length; ++j) {
      meas = exportFormat.data[i].measures[j];
      if (meas.qLibraryId) {
        libMeas = libraryUtils.findLibraryMeasure(meas.qLibraryId, measureList);
        if (libMeas) {
          meas.title = libMeas.qData.title;
        }
      }
    }
    for (j = 0; j < exportFormat.data[i].excludedDimensions.length; ++j) {
      dim = exportFormat.data[i].excludedDimensions[j];
      if (dim.qLibraryId) {
        libDim = libraryUtils.findLibraryDimension(dim.qLibraryId, dimensionList);
        if (libDim) {
          dim.title = libDim.qData.title;
        }
      }
    }
    for (j = 0; j < exportFormat.data[i].excludedMeasures.length; ++j) {
      meas = exportFormat.data[i].excludedMeasures[j];
      if (meas.qLibraryId) {
        libMeas = libraryUtils.findLibraryMeasure(meas.qLibraryId, measureList);
        if (libMeas) {
          meas.title = libMeas.qData.title;
        }
      }
    }
  }
};

export default {
  getValue,
  setValue,
  isEmpty,
  checkLibraryObjects,
};
