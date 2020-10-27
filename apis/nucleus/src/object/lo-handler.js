/* eslint no-param-reassign:0 */

import uid from './uid';

const nxDimension = (f) => ({
  qDef: {
    qFieldDefs: [f],
  },
});

export default function loHandler({ dc: lo, def, properties }) {
  lo.qInitialDataFetch = lo.qInitialDataFetch || [];

  const objectProperties = properties;

  const handler = {
    dimensions() {
      if (!lo.qDef || !lo.qDef.qFieldDefs || lo.qDef.qFieldDefs.length === 0) return [];
      return [lo];
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
        lo[k] = dimension[k];
      });
      def.dimensions.added(dimension, objectProperties);
    },
    removeDimension(idx) {
      const dimension = lo;
      Object.keys(dimension).forEach((k) => {
        delete lo[k];
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
      return lo.qDef && lo.qDef.qFieldDefs ? lo.qDef.qFieldDefs.length === 0 : !lo.qDef;
    },
    canAddMeasure() {
      return false;
    },
  };

  return handler;
}
