/* eslint no-param-reassign:0 */

import uid from './uid';

const nxDimension = (f) => ({
  qDef: {
    qFieldDefs: [f],
  },
});

export default function loContainerHandler({ dc: loc, def, properties, dimensions }) {
  const objectProperties = properties;

  const handler = {
    dimensions() {
      return dimensions;
    },
    measures() {
      return [];
    },
    addDimension(d) {
      const dimension =
        typeof d === 'string'
          ? nxDimension(d)
          : {
              ...d,
              qDef: d.qDef || {},
            };

      dimension.qDef.cId = dimension.qDef.cId || uid();
      dimension.qDef.qSortCriterias = (loc && loc.qDef.qSortCriterias) || [
        {
          qSortByState: 1,
          qSortByLoadOrder: 1,
          qSortByNumeric: 1,
          qSortByAscii: 1,
        },
      ];

      def.dimensions.added(dimension, objectProperties);
      return dimension;
    },
    removeDimension(idx) {
      const dimension = dimensions[idx];
      def.dimensions.removed(dimension, objectProperties, idx);
      return dimension;
    },
    // addMeasure() {},
    // removeMeasure() {},

    maxDimensions() {
      const { max } = def.dimensions || {};
      const maxDims = typeof max === 'function' ? max() : max;
      return maxDims || 0;
    },
    maxMeasures() {
      return 0;
    },
    canAddDimension() {
      return handler.dimensions().length < handler.maxDimensions();
    },
    canAddMeasure() {
      return false;
    },
  };

  return handler;
}
