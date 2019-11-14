/* eslint no-param-reassign:0 */

const idGen = [
  [10, 31],
  [0, 31],
  [0, 31],
  [0, 31],
  [0, 31],
  [0, 31],
];
function toChar([min, max]) {
  return (min + ((Math.random() * (max - min)) | 0)).toString(32);
}

function uid() {
  return idGen.map(toChar).join('');
}

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

const nxDimension = f => ({
  qDef: {
    qFieldDefs: [f],
    qSortCriterias: [
      {
        qSortByLoadOrder: 1,
        qSortByNumeric: 1,
        qSortByAscii: 1,
      },
    ],
  },
  qOtherTotalSpec: {},
});

const nxMeasure = f => ({
  qDef: {
    qDef: f,
  },
  qSortBy: {
    qSortByLoadOrder: 1,
    qSortByNumeric: -1,
  },
});

export default function hcHandler({ hc, def }) {
  hc.qDimensions = hc.qDimensions || [];
  hc.qMeasures = hc.qMeasures || [];
  hc.qInterColumnSortOrder = hc.qInterColumnSortOrder || [];

  const objectProperties = {};

  const h = {
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
      dimension.qOtherTotalSpec = dimension.qOtherTotalSpec || {};
      if (!dimension.qDef.cId) {
        dimension.qDef.cId = uid();
      }

      if (hc.qDimensions.length < h.maxDimensions()) {
        // TODO - apply autosort properties based on tags
        hc.qDimensions.push(dimension);
        addIndex(hc.qInterColumnSortOrder, hc.qDimensions.length - 1);
        // TODO - rename 'add' to 'added' since the callback is run after the dimension has been added
        def.dimensions.add(dimension, objectProperties);
      } else {
        console.log('Should add dimension to layout exclude');
        // add to layout exclude
      }
    },
    removeDimension(idx) {
      const dimension = hc.qDimensions.splice(idx, 1)[0];
      removeIndex(hc.qInterColumnSortOrder, idx);
      def.dimensions.remove(dimension, objectProperties, idx);
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
      if (!measure.qDef.cId) {
        measure.qDef.cId = uid();
      }

      if (hc.qMeasures.length < h.maxMeasures()) {
        hc.qMeasures.push(measure);
        addIndex(hc.qInterColumnSortOrder, hc.qDimensions.length + hc.qMeasures.length - 1);

        def.measures.add(measure, objectProperties);
      } else {
        console.log('Should add measure to layout exclude');
        // add to layout exclude
      }
    },
    removeMeasure(idx) {
      const measure = hc.qMeasures.splice(idx, 1)[0];
      removeIndex(hc.qInterColumnSortOrder, hc.qDimensions.length + idx);
      def.dimensions.remove(measure, objectProperties, idx);
    },

    maxDimensions() {
      return def.dimensions.max(hc.qMeasures.length);
    },
    maxMeasures() {
      return def.measures.max(hc.qDimensions.length);
    },
    canAddDimension() {
      return hc.qDimensions.length < h.maxDimensions();
    },
    canAddMeasure() {
      return hc.qMeasures.length < h.maxMeasures();
    },
  };

  return h;
}
