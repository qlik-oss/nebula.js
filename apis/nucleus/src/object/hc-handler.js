/* eslint no-param-reassign:0 */

import uid from './uid';

function addIndex(array, index) {
  for (let i = 0; i < array.length; ++i) {
    if (array[i] >= 0 && array[i] >= index) {
      ++array[i];
    }
  }
  array.push(index);
}
function removeIndex(array, index) {
  let removeIdx = 0;
  for (let i = 0; i < array.length; ++i) {
    if (array[i] > index) {
      --array[i];
    } else if (array[i] === index) {
      removeIdx = i;
    }
  }
  array.splice(removeIdx, 1);
  return removeIdx;
}

const nxDimension = (f) => ({
  qDef: {
    qFieldDefs: [f],
  },
});

const nxMeasure = (f) => ({
  qDef: {
    qDef: f,
  },
});

export default function hcHandler({ dc: hc, def, properties }) {
  hc.qDimensions = hc.qDimensions || [];
  hc.qMeasures = hc.qMeasures || [];
  hc.qInterColumnSortOrder = hc.qInterColumnSortOrder || [];
  hc.qInitialDataFetch = hc.qInitialDataFetch || [];
  hc.qColumnOrder = hc.qColumnOrder || [];
  hc.qExpansionState = hc.qExpansionState || [];

  const objectProperties = properties;

  const handler = {
    dimensions() {
      return hc.qDimensions;
    },
    measures() {
      return hc.qMeasures;
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

      // ====== add default objects and arrays for NxDimension =====

      // TODO - apply autosort properties based on tags
      dimension.qDef.qSortCriterias = dimension.qDef.qSortCriterias || [
        {
          qSortByLoadOrder: 1,
          qSortByNumeric: 1,
          qSortByAscii: 1,
        },
      ];

      dimension.qOtherTotalSpec = dimension.qOtherTotalSpec || {};
      dimension.qAttributeExpressions = dimension.qAttributeExpressions || [];
      dimension.qAttributeDimensions = dimension.qAttributeDimensions || [];
      // ========= end defaults =============

      if (hc.qDimensions.length < handler.maxDimensions()) {
        hc.qDimensions.push(dimension);
        addIndex(hc.qInterColumnSortOrder, hc.qDimensions.length - 1);
        def.dimensions.added(dimension, objectProperties);
      } else {
        hc.qLayoutExclude = hc.qLayoutExclude || {};
        hc.qLayoutExclude.qHyperCubeDef = hc.qLayoutExclude.qHyperCubeDef || {};
        hc.qLayoutExclude.qHyperCubeDef.qDimensions = hc.qLayoutExclude.qHyperCubeDef.qDimensions || [];
        hc.qLayoutExclude.qHyperCubeDef.qMeasures = hc.qLayoutExclude.qHyperCubeDef.qMeasures || [];

        hc.qLayoutExclude.qHyperCubeDef.qDimensions.push(dimension);
      }
      return dimension;
    },
    removeDimension(idx) {
      const dimension = hc.qDimensions.splice(idx, 1)[0];
      removeIndex(hc.qInterColumnSortOrder, idx);
      def.dimensions.removed(dimension, objectProperties, idx);
      return dimension;
    },
    addMeasure(m) {
      const measure =
        typeof m === 'string'
          ? nxMeasure(m)
          : {
              ...m,
              qDef: m.qDef || {},
            };
      measure.qDef.cId = measure.qDef.cId || uid();

      // ====== add default objects and arrays for NxMeasure =====
      measure.qSortBy = measure.qSortBy || {
        qSortByLoadOrder: 1,
        qSortByNumeric: -1,
      };

      measure.qAttributeDimensions = measure.qAttributeDimensions || [];
      measure.qAttributeExpressions = measure.qAttributeExpressions || [];

      if (hc.qMeasures.length < handler.maxMeasures()) {
        hc.qMeasures.push(measure);
        addIndex(hc.qInterColumnSortOrder, hc.qDimensions.length + hc.qMeasures.length - 1);
        def.measures.added(measure, objectProperties);
      } else {
        hc.qLayoutExclude = hc.qLayoutExclude || {};
        hc.qLayoutExclude.qHyperCubeDef = hc.qLayoutExclude.qHyperCubeDef || {};
        hc.qLayoutExclude.qHyperCubeDef.qDimensions = hc.qLayoutExclude.qHyperCubeDef.qDimensions || [];
        hc.qLayoutExclude.qHyperCubeDef.qMeasures = hc.qLayoutExclude.qHyperCubeDef.qMeasures || [];

        hc.qLayoutExclude.qHyperCubeDef.qMeasures.push(measure);
      }
    },
    removeMeasure(idx) {
      const measure = hc.qMeasures.splice(idx, 1)[0];
      removeIndex(hc.qInterColumnSortOrder, hc.qDimensions.length + idx);
      def.measures.removed(measure, objectProperties, idx);
    },

    maxDimensions() {
      return def.dimensions.max(hc.qMeasures.length);
    },
    maxMeasures() {
      return def.measures.max(hc.qDimensions.length);
    },
    canAddDimension() {
      return hc.qDimensions.length < handler.maxDimensions();
    },
    canAddMeasure() {
      return hc.qMeasures.length < handler.maxMeasures();
    },
  };

  return handler;
}
