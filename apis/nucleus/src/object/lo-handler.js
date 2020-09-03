/* eslint no-param-reassign:0 */

import uid from './uid';

const nxDimension = (f) => ({
  qDef: {
    qFieldDefs: [f],
  },
});

export default function loHandler({ h, def, properties }) {
  h.qInitialDataFetch = h.qInitialDataFetch || [];

  const objectProperties = properties;

  const handler = {
    dimensions() {
      if (!h.qDef || !h.qDef.qFieldDefs || h.qDef.qFieldDefs.length === 0) return [];
      return [h];
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

      dimension.qDef.qSortCriterias = dimension.qDef.qSortCriterias || [
        {
          qSortByState: 1,
          qSortByLoadOrder: 1,
          qSortByNumeric: 1,
          qSortByAscii: 1,
        },
      ];
      Object.keys(dimension).forEach((k) => {
        h[k] = dimension[k];
      });
      def.dimensions.added(dimension, objectProperties);
    },
    removeDimension(idx) {
      const dimension = h;
      Object.keys(dimension).forEach((k) => {
        delete h[k];
      });
      def.dimensions.removed(dimension, objectProperties, idx);
    },
    addMeasure() {},
    removeMeasure() {},

    maxDimensions() {
      return 1;
    },
    maxMeasures() {
      return 0;
    },
    canAddDimension() {
      return h.qDef && h.qDef.qFieldDefs ? h.qDef.qFieldDefs.length === 0 : !h.qDef;
    },
    canAddMeasure() {
      return false;
    },
  };

  return handler;
}
