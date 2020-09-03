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

export default function hcHandler({ h, def, properties }) {
  h.qDimensions = h.qDimensions || [];
  h.qMeasures = h.qMeasures || [];
  h.qInterColumnSortOrder = h.qInterColumnSortOrder || [];
  h.qInitialDataFetch = h.qInitialDataFetch || [];
  h.qColumnOrder = h.qColumnOrder || [];
  h.qExpansionState = h.qExpansionState || [];

  const objectProperties = properties;

  const handler = {
    dimensions() {
      return h.qDimensions;
    },
    measures() {
      return h.qMeasures;
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

      if (h.qDimensions.length < handler.maxDimensions()) {
        h.qDimensions.push(dimension);
        addIndex(h.qInterColumnSortOrder, h.qDimensions.length - 1);
        def.dimensions.added(dimension, objectProperties);
      } else {
        h.qLayoutExclude = h.qLayoutExclude || {};
        h.qLayoutExclude.qHyperCubeDef = h.qLayoutExclude.qHyperCubeDef || {};
        h.qLayoutExclude.qHyperCubeDef.qDimensions = h.qLayoutExclude.qHyperCubeDef.qDimensions || [];
        h.qLayoutExclude.qHyperCubeDef.qMeasures = h.qLayoutExclude.qHyperCubeDef.qMeasures || [];

        h.qLayoutExclude.qHyperCubeDef.qDimensions.push(dimension);
      }
    },
    removeDimension(idx) {
      const dimension = h.qDimensions.splice(idx, 1)[0];
      removeIndex(h.qInterColumnSortOrder, idx);
      def.dimensions.removed(dimension, objectProperties, idx);
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

      if (h.qMeasures.length < handler.maxMeasures()) {
        h.qMeasures.push(measure);
        addIndex(h.qInterColumnSortOrder, h.qDimensions.length + h.qMeasures.length - 1);
        def.measures.added(measure, objectProperties);
      } else {
        h.qLayoutExclude = h.qLayoutExclude || {};
        h.qLayoutExclude.qHyperCubeDef = h.qLayoutExclude.qHyperCubeDef || {};
        h.qLayoutExclude.qHyperCubeDef.qDimensions = h.qLayoutExclude.qHyperCubeDef.qDimensions || [];
        h.qLayoutExclude.qHyperCubeDef.qMeasures = h.qLayoutExclude.qHyperCubeDef.qMeasures || [];

        h.qLayoutExclude.qHyperCubeDef.qMeasures.push(measure);
      }
    },
    removeMeasure(idx) {
      const measure = h.qMeasures.splice(idx, 1)[0];
      removeIndex(h.qInterColumnSortOrder, h.qDimensions.length + idx);
      def.measures.removed(measure, objectProperties, idx);
    },

    maxDimensions() {
      return def.dimensions.max(h.qMeasures.length);
    },
    maxMeasures() {
      return def.measures.max(h.qDimensions.length);
    },
    canAddDimension() {
      return h.qDimensions.length < handler.maxDimensions();
    },
    canAddMeasure() {
      return h.qMeasures.length < handler.maxMeasures();
    },
  };

  return handler;
}
