import getValue from '@nebula.js/conversion/src/utils';
/**
 * Get the field by its ID from the given fields array.
 * @param {Array} fields
 * @param {string} id
 * returns {Object|null} - The Dimension or Measure if found, otherwise null.
 */
export const getFieldById = (fields, id) => fields.find((field) => field.qDef?.cId === id) || null;

/**
 * Updates the field properties for measures in hcProperties.
 *
 * @param {Array} hcProperties - The hypercube properties object.
 * @returns {Array} - A new object with updated field (dimension or measure).
 */
export const setFieldProperties = (hcFieldProperties) => {
  if (!hcFieldProperties) {
    return [];
  }
  const updatedProperties = [...hcFieldProperties];

  return updatedProperties.map((field) => {
    if (field.qDef?.autoSort && field.autoSort !== undefined) {
      return {
        ...field,
        qDef: {
          ...field.qDef,
          autoSort: field.autoSort,
        },
        autoSort: undefined,
      };
    }
    return field;
  });
};

/**
 * Get the hypercube from the layout object.
 *
 * @param {Object} layout - The layout object.
 * @param {string} path - The path to the hypercube in the layout object.
 * @returns {object} - The hypercube object.
 */
export const getHyperCube = (layout, path) => {
  if (!layout) {
    return undefined;
  }
  return path && getValue(layout, path) ? getValue(layout, path).qHyperCube : layout.qHyperCube;
};
