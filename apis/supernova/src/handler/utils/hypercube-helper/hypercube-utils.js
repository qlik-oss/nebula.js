// eslint-disable-next-line import/no-relative-packages
import getValue from '../../../../../conversion/src/utils';
// eslint-disable-next-line import/no-relative-packages
import arrayUtil from '../../../../../conversion/src/array-util';
import { TOTAL_MAX } from '../constants';

export const notSupportedError = new Error('Not supported in this object, need to implement in subclass.');

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

export function setDefaultProperties(self) {
  const current = self;
  current.hcProperties.qDimensions = current.hcProperties.qDimensions ?? [];
  current.hcProperties.qMeasures = current.hcProperties.qMeasures ?? [];
  current.hcProperties.qInterColumnSortOrder = current.hcProperties.qInterColumnSortOrder ?? [];
  current.hcProperties.qLayoutExclude = current.hcProperties.qLayoutExclude ?? {
    qHyperCubeDef: { qDimensions: [], qMeasures: [] },
  };
  current.hcProperties.qLayoutExclude.qHyperCubeDef = current.hcProperties.qLayoutExclude.qHyperCubeDef ?? {
    qDimensions: [],
    qMeasures: [],
  };
  current.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions =
    current.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions ?? [];
  current.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures =
    current.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures ?? [];
}

export function setPropForLineChartWithForecast(self) {
  const current = self;
  if (
    current.hcProperties.isHCEnabled &&
    current.hcProperties.qDynamicScript.length === 0 &&
    current.hcProperties.qMode === 'S'
  ) {
    current.hcProperties.qDynamicScript = [];
  }
}

export function getDeletedFields(fields, indexes) {
  // Keep the original deleted order
  return fields.filter((_, idx) => indexes.includes(idx));
}

export function getRemainedFields(fields, indexes) {
  return fields.filter((_, idx) => !indexes.includes(idx));
}

// ----------------------------------
// ----------- DIMENSIONS -----------
// ----------------------------------

export function addAlternativeDimension(self, dimension, index = undefined) {
  const dimensions = self.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions;
  const idx = index ?? dimensions.length;
  dimensions.splice(idx, 0, dimension);
  return Promise.resolve(dimension);
}

export function addDimensionToColumnSortOrder(self, dimensions, index) {
  arrayUtil.indexAdded(self.hcProperties.qInterColumnSortOrder, index ?? dimensions.length - 1);
}

export function addDimensionToColumnOrder(self, dimension) {
  if (typeof self.dimensionDefinition.add === 'function') {
    return Promise.resolve(self.dimensionDefinition.add.call(null, dimension, self.properties, self)).then(
      () => dimension
    );
  }
  return undefined;
}

export function removeDimensionFromColumnSortOrder(self, index) {
  arrayUtil.indexRemoved(self.hcProperties.qInterColumnSortOrder, index);
}

export function removeDimensionFromColumnOrder(self, index) {
  const [dimension] = self.hcProperties.qDimensions.splice(index, 1);
  if (dimension && typeof self.dimensionDefinition.remove === 'function') {
    return Promise.resolve(self.dimensionDefinition.remove.call(null, dimension, self.properties, self, index));
  }

  return undefined;
}

export function isTotalDimensionsExceeded(self, dimensions) {
  const altDimensions = self.getAlternativeDimensions();
  return altDimensions.length + dimensions.length >= TOTAL_MAX.DIMENSIONS;
}

export function isDimensionAlternative(self, alternative) {
  const dimensions = self.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions;
  return alternative || (self.maxDimensions() <= dimensions.length && dimensions.length < TOTAL_MAX.DIMENSIONS);
}

export async function addActiveDimension(
  self,
  dimension,
  initialLength,
  existingDimensions,
  addedDimensions,
  addedActive
) {
  await self.autoSortDimension(dimension);

  // Update sorting order
  arrayUtil.indexAdded(self.hcProperties.qInterColumnSortOrder, initialLength + addedActive);

  existingDimensions.push(dimension);
  addedDimensions.push(dimension);

  if (typeof self.dimensionDefinition.add === 'function') {
    self.dimensionDefinition.add.call(self, dimension, self.properties, self);
  }
}

// ----------------------------------
// ------------ MEASURES ------------
// ----------------------------------

export function addAlternativeMeasure(self, measure, index = undefined) {
  const measures = self.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures;
  const idx = index ?? measures.length;
  measures.splice(idx, 0, measure);
  return Promise.resolve(measure);
}

export function addMeasureToColumnSortOrder(self, measures) {
  arrayUtil.indexAdded(self.hcProperties.qInterColumnSortOrder, self.getDimensions().length + measures.length - 1);
}

export function addMeasureToColumnOrder(self, measure) {
  if (typeof self.measureDefinition.add === 'function') {
    return Promise.resolve(self.measureDefinition.add.call(null, measure, self.properties, self));
  }
  return undefined;
}

export function isTotalMeasureExceeded(self, measures) {
  // Adding more measures than TOTAL_MAX_MEASURES is not allowed and we expect this.maxMeasures() to always be <= TOTAL_MAX_MEASURES
  const altMeasures = self.getAlternativeMeasures();
  return altMeasures.length + measures.length >= TOTAL_MAX.MEASURES;
}

export function isMeasureAlternative(self, measures, alternative) {
  return alternative || (self.maxMeasures() <= measures.length && measures.length < TOTAL_MAX.MEASURES);
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

  return Promise.resolve(addedMeasures);
}

export function removeMeasureFromColumnSortOrder(self, index) {
  arrayUtil.indexRemoved(self.hcProperties.qInterColumnSortOrder, self.getDimensions().length + index);
}

export function removeMeasureFromColumnOrder(self, index) {
  const [measure] = self.hcProperties.qMeasures.splice(index, 1);
  if (measure && typeof self.measureDefinition.remove === 'function') {
    return Promise.resolve(self.measureDefinition.remove.call(null, measure, self.properties, self, index));
  }
  return undefined;
}

export function removeAltMeasureByIndex(self, index) {
  return self.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.splice(index, 1);
}
