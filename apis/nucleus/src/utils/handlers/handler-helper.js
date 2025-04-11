import getValue from '@nebula.js/conversion/src/utils';
import arrayUtil from '@nebula.js/conversion/src/array-util';
import uid from '../../object/uid';
import { findField, findLibraryItem, setAutoSort, TOTAL_MAX } from './handler-utils';

export const getFieldById = (fields, id) => fields.find((field) => field.qDef?.cId === id) || null;

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

export const getHyperCube = (layout, path) => {
  if (!layout) {
    return undefined;
  }
  return path && getValue(layout, path) ? getValue(layout, path).qHyperCube : layout.qHyperCube;
};

export const initializeId = (field) => ({
  ...field,
  qDef: {
    ...field.qDef,
    cId: field.qDef?.cId ?? uid(),
  },
});

export const initializeField = (field) => ({
  ...initializeId(field),
  qOtherTotalSpec: field.qOtherTotalSpec ?? {},
});

export function addAlternativeMeasure(self, measure, index = undefined) {
  const measures = self.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures;
  const idx = index ?? measures.length;
  measures.splice(idx, 0, measure);
}

export function addAlternativeDimension(self, dimension, index = undefined) {
  const dimensions = self.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions;
  const idx = index ?? dimensions.length;
  dimensions.splice(idx, 0, dimension);
  return Promise.resolve(dimension);
}

function updateInterColumnSortOrder(self, fields) {
  arrayUtil.indexAdded(self.hcProperties.qInterColumnSortOrder, self.getDimensions().length + fields.length - 1);
}

function callDimensionDefinitionAdd(self, dimension) {
  return Promise.when(self.dimensionDefinition.add.call(null, dimension, self.properties, self));
}

function insertMainDimension(self, dimension, dimensions, idx) {
  dimensions.splice(idx, 0, dimension);

  return self.autoSortDimension(dimension).then(() => {
    updateInterColumnSortOrder(dimensions);

    if (typeof self.dimensionDefinition.add === 'function') {
      return callDimensionDefinitionAdd(dimension).then(() => dimension);
    }

    return dimension;
  });
}

export function addMainDimension(self, dimension, index) {
  const dimensions = self.getDimensions();
  const idx = index ?? dimensions.length;

  if (dimensions.length < self.maxDimensions()) {
    return insertMainDimension(self, dimension, dimensions, idx);
  }

  if (dimensions.length < TOTAL_MAX.DIMENSIONS) {
    return addAlternativeDimension(dimension);
  }

  return Promise.resolve();
}

function callMeasureDefinitionAdd(self, measure) {
  return Promise.when(self.measureDefinition.add.call(null, measure, self.properties, self));
}

function insertMainMeasure(self, measure, measures, idx) {
  measures.splice(idx, 0, measure);

  return self.autoSortMeasure(measure).then(() => {
    updateInterColumnSortOrder(measures);

    if (typeof self.measureDefinition.add === 'function') {
      return callMeasureDefinitionAdd(measure).then(() => measure);
    }

    return measure;
  });
}

export function addMainMeasure(self, measure, index) {
  const measures = self.getMeasures();
  const idx = index ?? measures.length;

  if (measures.length < self.maxMeasures()) {
    return insertMainMeasure(measure, measures, idx);
  }

  if (measures.length < TOTAL_MAX.MEASURES) {
    return addAlternativeMeasure(measure);
  }

  return Promise.resolve();
}

export function insertDimensionAtIndex(self, dimension, alternative, currentDimensions, index = undefined) {
  const dimensions = self.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions;
  const idx = index ?? dimensions.length;
  dimensions.splice(idx, 0, dimension);
  return Promise.resolve(dimension);
}

export function insertFieldAtIndex(self, field, alternative, currentFields, index = undefined) {
  if (alternative || (self.maxDimensions() <= currentFields.length && currentFields.length < TOTAL_MAX.DIMENSIONS)) {
    const fields = self.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions;
    const idx = index ?? fields.length;
    fields.splice(idx, 0, field);
    return Promise.resolve(field);
  }
  return undefined;
}

export function addSortedDimension(self, dimension, dimensions, idx) {
  const dimIdx = idx ?? dimensions.length;
  dimensions.splice(dimIdx, 0, dimension);

  return self.autoSortDimension(dimension).then(() => {
    arrayUtil.indexAdded(self.hcProperties.qInterColumnSortOrder, dimIdx ?? dimensions.length - 1);

    return self.dimensionDefinition.add?.call(self, dimension, self.properties, self) || Promise.resolve(dimension);
  });
}

export function isTotalDimensionsExceeded(self, dimensions) {
  const altDimensions = self.getAlternativeDimensions();
  return altDimensions.length + dimensions.length >= TOTAL_MAX.DIMENSIONS;
}

export function isTotalMeasureExceeded(self, measures) {
  const altMeasures = self.getAlternativeMeasures();
  return altMeasures.length + measures.length >= TOTAL_MAX.MEASURES;
}

export function isDimensionAlternative(self, dimensions, alternative) {
  return alternative || (self.maxDimensions() <= dimensions.length && dimensions.length < TOTAL_MAX.DIMENSIONS);
}

export function isMeasureAlternative(self, measures, alternative) {
  return alternative || (self.maxMeasures() <= measures.length && measures.length < TOTAL_MAX.MEASURES);
}

export async function addActiveDimension(self, dimension, existingDimensions, addedDimensions, addedActive) {
  const initialLength = existingDimensions.length;
  await self.autoSortDimension(dimension);

  // Update sorting order
  arrayUtil.indexAdded(self.hcProperties.qInterColumnSortOrder, initialLength + addedActive);

  existingDimensions.push(dimension);
  addedDimensions.push(dimension);

  if (typeof self.dimensionDefinition.add === 'function') {
    self.dimensionDefinition.add.call(self, dimension, self.properties, self);
  }
}

export function addActiveMeasure(self, measure, existingMeasures, addedMeasures, addedActive) {
  const dimensions = self.getDimensions();
  const meas = { ...measure };
  meas.qSortBy = {
    qSortByLoadOrder: 1,
    qSortByNumeric: -1,
  };

  arrayUtil.indexAdded(
    self.hcProperties.qInterColumnSortOrder,
    dimensions.length + existingMeasures.length + addedActive
  );

  existingMeasures.push(meas);
  addedMeasures.push(meas);
  if (typeof self.measureDefinition.add === 'function') {
    self.measureDefinition.add.call(null, meas, self.properties, self);
  }
}

export function autoSortLibraryDimension(self, dimension) {
  return self.app.getDimensionList().then((dimensionList) => {
    const libDim = findLibraryItem(dimension.qLibraryId, dimensionList);
    if (libDim) {
      setAutoSort(libDim.qData.info, dimension, self);
    }
    return dimension;
  });
}

export function autoSortFieldDimension(self, dimension) {
  return self.app.getFieldList().then((fieldList) => {
    const field = findField(dimension.qDef.qFieldDefs[0], fieldList);
    if (field) {
      setAutoSort([field], dimension, self);
    }
    return dimension;
  });
}
