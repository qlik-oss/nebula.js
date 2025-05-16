// eslint-disable-next-line import/no-relative-packages
import utils from '../../../conversion/src/utils';
import DataPropertyHandler from './data-property-handler';
import * as hcUtils from './utils/hypercube-helper/hypercube-utils';
import getAutoSortLibraryDimension from './utils/field-helper/get-sorted-library-field';
import getAutoSortFieldDimension from './utils/field-helper/get-sorted-field';
import { initializeField, initializeId } from './utils/field-helper/field-utils';
import addMainDimension from './utils/hypercube-helper/add-main-dimension';
import addMainMeasure from './utils/hypercube-helper/add-main-measure';
import removeMainDimension from './utils/hypercube-helper/remove-main-dimension';
import removeAlternativeMeasure from './utils/hypercube-helper/remove-alternative-measure';
import removeMainMeasure from './utils/hypercube-helper/remove-main-measure';
import removeAlternativeDimension from './utils/hypercube-helper/remove-alternative-dimension';
import replaceDimensionOrder from './utils/hypercube-helper/replace-dimension-order';

class HyperCubeHandler extends DataPropertyHandler {
  constructor(opts) {
    super(opts);
    this.path = opts.path;
  }

  setProperties(properties) {
    if (!properties) {
      return {};
    }

    super.setProperties(properties);

    this.hcProperties = this.path ? utils.getValue(properties, `${this.path}.qHyperCubeDef`) : properties.qHyperCubeDef;

    if (!this.hcProperties) {
      return {};
    }

    hcUtils.setDefaultProperties(this);
    hcUtils.setPropForLineChartWithForecast(this);

    // Set auto-sort property (compatibility 0.85 -> 0.9), can probably be removed in 1.0
    this.hcProperties.qDimensions = hcUtils.setFieldProperties(this.hcProperties.qDimensions);
    this.hcProperties.qMeasures = hcUtils.setFieldProperties(this.hcProperties.qMeasures);
    return {};
  }

  // canColorBy(hyperCube, colorByExplicit) {
  //   // TODO: don't fake hypercube. After || is for combochart context
  //   const fakeHyperCube = hyperCube || { qHyperCubeDef: this.hcProperties || this.properties.qHyperCubeDef };

  //   const visualization = this.layout ? this.layout.visualization : null;
  //   const req =
  //     fakeHyperCube.qHyperCubeDef.qDimensions.length >= this.minDimensions() &&
  //     fakeHyperCube.qHyperCubeDef.qMeasures.length >= this.minMeasures();

  //   if (this.colorSupport.colorBy.isSupported(visualization) || colorByExplicit) {
  //     return req && this.layout && this.layout.color ? HyperCubeHandler.canColorBy(fakeHyperCube, visualization) : {};
  //   }
  //   return false;
  // }

  // ----------------------------------
  // ----------- DIMENSIONS -----------
  // ----------------------------------

  getDimensions() {
    return this.hcProperties ? this.hcProperties.qDimensions : [];
  }

  getAlternativeDimensions() {
    return this.hcProperties?.qLayoutExclude?.qHyperCubeDef?.qDimensions ?? [];
  }

  getDimensionLayout(cId) {
    return this.getDimensionLayouts().filter((item) => cId === item.cId)[0];
  }

  getDimensionLayouts() {
    const hc = hcUtils.getHyperCube(this.layout, this.path);
    return hc ? hc.qDimensionInfo : [];
  }

  addDimension(dimension, alternative, idx) {
    const dim = initializeField(dimension);

    if (hcUtils.isDimensionAlternative(this, alternative)) {
      return hcUtils.addAlternativeDimension(this, dim, idx);
    }

    return addMainDimension(this, dim, idx);
  }

  async addDimensions(dimensions, alternative = false) {
    const existingDimensions = this.getDimensions();
    const initialLength = existingDimensions.length;
    const addedDimensions = [];
    let addedActive = 0;

    // eslint-disable-next-line no-restricted-syntax
    for await (const dimension of dimensions) {
      if (hcUtils.isTotalDimensionsExceeded(this, existingDimensions)) {
        return addedDimensions;
      }

      const dim = initializeField(dimension);

      if (hcUtils.isDimensionAlternative(this, alternative)) {
        const altDim = await hcUtils.addAlternativeDimension(this, dim);
        addedDimensions.push(altDim);
      } else if (existingDimensions.length < this.maxDimensions()) {
        await hcUtils.addActiveDimension(this, dim, initialLength, existingDimensions, addedDimensions, addedActive);
        addedActive++;
      }
    }

    return addedDimensions;
  }

  removeDimension(idx, alternative) {
    if (alternative) {
      removeAlternativeDimension(this, idx);
    }

    removeMainDimension(this, idx);
  }

  async removeDimensions(indexes, alternative) {
    const altDimensions = this.getAlternativeDimensions();
    const dimensions = this.getDimensions();

    if (indexes.length === 0) return [];
    let deletedDimensions = [];
    // Start deleting from the end of the list first otherwise the idx is messed up
    const sortedIndexes = [...indexes].sort((a, b) => b - a);

    if (alternative && altDimensions.length > 0) {
      // Keep the original deleted order
      deletedDimensions = hcUtils.getDeletedFields(altDimensions, indexes);
      // eslint-disable-next-line no-restricted-syntax
      for await (const index of sortedIndexes) {
        await removeAlternativeDimension(this, index);
      }
    } else if (dimensions.length > 0) {
      // Keep the original deleted order
      deletedDimensions = hcUtils.getDeletedFields(dimensions, indexes);
      // eslint-disable-next-line no-restricted-syntax
      for await (const index of sortedIndexes) {
        await removeMainDimension(this, index);
      }
    }

    return deletedDimensions;
  }

  replaceDimension(index, dimension) {
    return this.autoSortDimension(dimension).then(() => replaceDimensionOrder(this, index, dimension));
  }

  // reinsertDimension(dimension, alternative, idx) {
  //   const dimensions = this.getDimensions();
  //   const self = this;

  //   if (!dimension.qDef.cId) {
  //     dimension.qDef.cId = util.generateId();
  //   }
  //   if (alternative) {
  //     idx = idx !== undefined ? idx : this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.length;
  //     this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.splice(idx, 0, dimension);

  //     if (typeof self.dimensionDefinition.move === 'function') {
  //       return Deferred.when(self.dimensionDefinition.move.call(self, dimension, self.properties, self)).then(
  //         () => dimension
  //       );
  //     }
  //   } else if (dimensions.length < this.maxDimensions()) {
  //     idx = idx !== undefined ? idx : dimensions.length;
  //     dimensions.splice(idx, 0, dimension);

  //     arrayUtils.indexAdded(
  //       self.hcProperties.qInterColumnSortOrder,
  //       typeof idx !== 'undefined' ? idx : dimensions.length - 1
  //     );

  //     if (typeof self.dimensionDefinition.move === 'function') {
  //       return Deferred.when(self.dimensionDefinition.move.call(self, dimension, self.properties, self)).then(
  //         () => dimension
  //       );
  //     }
  //   } else if (dimensions.length < TOTAL_MAX_DIMENSIONS) {
  //     idx = this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.length;
  //     this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.splice(idx, 0, dimension);
  //   }
  //   return Deferred.resolve(dimension);
  // }

  // moveDimension(fromIndex, toIndex) {
  //   const dimensions = this.getDimensions();
  //   const disabledDimensions = this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions;
  //   let disabledFromIdx;
  //   let disabledToIdx;
  //   let dimension;

  //   if (fromIndex < dimensions.length && toIndex < dimensions.length) {
  //     // Moving within enabled measures
  //     arrayUtils.move(dimensions, fromIndex, toIndex);
  //   } else if (fromIndex < dimensions.length && toIndex >= dimensions.length) {
  //     // Moving from enabled to disabled
  //     disabledToIdx = toIndex - dimensions.length;

  //     dimension = disabledDimensions.splice(0, 1)[0];
  //     dimensions.push(dimension);

  //     dimension = dimensions.splice(fromIndex, 1)[0];
  //     disabledDimensions.splice(disabledToIdx, 0, dimension);
  //   } else if (fromIndex >= dimensions.length && toIndex < dimensions.length) {
  //     // Moving from disabled to enabled
  //     disabledFromIdx = fromIndex - dimensions.length;

  //     dimension = dimensions.splice(dimensions.length - 1, 1)[0];
  //     disabledDimensions.splice(0, 0, dimension);

  //     dimension = disabledDimensions.splice(disabledFromIdx + 1, 1)[0];
  //     dimensions.splice(toIndex, 0, dimension);
  //   } else {
  //     // Moving within disabled
  //     disabledFromIdx = fromIndex - dimensions.length;
  //     disabledToIdx = toIndex - dimensions.length;
  //     arrayUtils.move(disabledDimensions, disabledFromIdx, disabledToIdx);
  //   }

  //   return Deferred.resolve(dimension);
  // }

  autoSortDimension(dimension) {
    if (dimension.qLibraryId) {
      return getAutoSortLibraryDimension(this, dimension);
    }
    return getAutoSortFieldDimension(this, dimension);
  }

  // ----------------------------------
  // ------------ MEASURES ------------
  // ----------------------------------

  getMeasures() {
    return this.hcProperties ? this.hcProperties.qMeasures : [];
  }

  getAlternativeMeasures() {
    return this.hcProperties?.qLayoutExclude?.qHyperCubeDef?.qMeasures ?? [];
  }

  getMeasureLayouts() {
    const hc = hcUtils.getHyperCube(this.layout, this.path);
    return hc ? hc.qMeasureInfo : [];
  }

  getMeasureLayout(cId) {
    return this.getMeasureLayouts().filter((item) => cId === item.cId)[0];
  }

  addMeasure(measure, alternative, idx) {
    const meas = initializeField(measure);

    if (hcUtils.isMeasureAlternative(this, meas, alternative)) {
      const hcMeasures = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures;
      return hcUtils.addAlternativeMeasure(meas, hcMeasures, idx);
    }

    return addMainMeasure(this, meas, idx);
  }

  // eslint-disable-next-line class-methods-use-this
  autoSortMeasure(measure) {
    const meas = measure;
    meas.qSortBy = {
      qSortByLoadOrder: 1,
      qSortByNumeric: -1,
    };
    return Promise.resolve(meas);
  }

  addMeasures(measures, alternative = false) {
    const existingMeasures = this.getMeasures();
    const addedMeasures = [];
    let addedActive = 0;
    measures.forEach(async (measure) => {
      if (hcUtils.isTotalMeasureExceeded(this, existingMeasures)) {
        return false;
      }

      const meas = initializeId(measure);

      if (hcUtils.isMeasureAlternative(this, existingMeasures, alternative)) {
        hcUtils.addAlternativeMeasure(this, meas);
        addedMeasures.push(meas);
      } else if (existingMeasures.length < this.maxMeasures()) {
        await hcUtils.addActiveMeasure(this, meas, existingMeasures, addedMeasures, addedActive);
        addedActive++;
      }
      return true;
    });
    return addedMeasures;
  }

  removeMeasure(idx, alternative) {
    if (alternative) {
      hcUtils.removeAltMeasureByIndex(this, idx);
    }
    removeMainMeasure(this, idx);
  }

  async removeMeasures(indexes, alternative) {
    const measures = this.getMeasures();
    const altMeasures = this.getAlternativeMeasures();

    if (indexes.length === 0) return [];
    let deletedMeasures = [];

    if (alternative && altMeasures.length > 0) {
      // Keep the original deleted order
      deletedMeasures = hcUtils.getDeletedFields(altMeasures, indexes);
      removeAlternativeMeasure(this, indexes);
    } else if (measures.length > 0) {
      // Keep the original deleted order
      deletedMeasures = hcUtils.getDeletedFields(measures, indexes);
      const sortedIndexes = [...indexes].sort((a, b) => b - a);

      // eslint-disable-next-line no-restricted-syntax
      for await (const index of sortedIndexes) {
        await removeMainMeasure(this, index);
      }
    }

    return deletedMeasures;
  }

  replaceMeasure(index, measure) {
    return this.autoSortMeasure(measure).then(() => hcUtils.replaceMeasureToColumnOrder(this, index, measure));
  }

  // reinsertMeasure(measure, alternative, idx) {
  //   const measures = this.getMeasures();
  //   const self = this;

  //   if (!measure.qDef.cId) {
  //     measure.qDef.cId = util.generateId();
  //   }

  //   if (alternative) {
  //     idx = idx !== undefined ? idx : this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.length;
  //     this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.splice(idx, 0, measure);
  //   } else {
  //     idx = idx !== undefined ? idx : measures.length;
  //     if (measures.length < this.maxMeasures()) {
  //       measures.splice(idx, 0, measure);
  //       arrayUtils.indexAdded(
  //         self.hcProperties.qInterColumnSortOrder,
  //         self.getDimensions().length + measures.length - 1
  //       );
  //       if (typeof self.measureDefinition.move === 'function') {
  //         return Deferred.when(self.measureDefinition.move.call(null, measure, self.properties, self, true)).then(
  //           () => measure
  //         );
  //       }
  //     } else if (measures.length < TOTAL_MAX_MEASURES) {
  //       idx = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.length;
  //       this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.splice(idx, 0, measure);
  //     }
  //   }
  //   return Deferred.resolve(measure);
  // }

  // moveMeasure(fromIndex, toIndex) {
  //   const measures = this.getMeasures();
  //   const disabledMeasures = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures;
  //   let disabledFromIdx;
  //   let disabledToIdx;
  //   let measure;

  //   if (fromIndex < measures.length && toIndex < measures.length) {
  //     // Moving within enabled measures
  //     arrayUtils.move(measures, fromIndex, toIndex);
  //   } else if (fromIndex < measures.length && toIndex >= measures.length) {
  //     // Moving from enabled to disabled
  //     disabledToIdx = toIndex - measures.length;

  //     measure = disabledMeasures.splice(0, 1)[0];
  //     measures.push(measure);

  //     measure = measures.splice(fromIndex, 1)[0];
  //     disabledMeasures.splice(disabledToIdx, 0, measure);
  //   } else if (fromIndex >= measures.length && toIndex < measures.length) {
  //     // Moving from disabled to enabled
  //     disabledFromIdx = fromIndex - measures.length;

  //     measure = measures.splice(measures.length - 1, 1)[0];
  //     disabledMeasures.splice(0, 0, measure);

  //     measure = disabledMeasures.splice(disabledFromIdx + 1, 1)[0];
  //     measures.splice(toIndex, 0, measure);
  //   } else {
  //     // Moving within disabled
  //     disabledFromIdx = fromIndex - measures.length;
  //     disabledToIdx = toIndex - measures.length;
  //     arrayUtils.move(disabledMeasures, disabledFromIdx, disabledToIdx);
  //   }

  //   return Deferred.resolve(measure);
  // }

  // ----------------------------------
  // ------------ OTHERS---- ----------
  // ----------------------------------

  setSorting(ar) {
    if (ar && ar.length === this.hcProperties.qInterColumnSortOrder.length) {
      this.hcProperties.qInterColumnSortOrder = ar;
    }
  }

  getSorting() {
    return this.hcProperties.qInterColumnSortOrder;
  }

  changeSorting(fromIdx, toIdx) {
    utils.move(this.hcProperties.qInterColumnSortOrder, fromIdx, toIdx);
  }

  IsHCInStraightMode() {
    return this.hcProperties.qMode === 'S';
  }

  setHCEnabled(value) {
    // this flag indicate whether we enabled HC modifier and have at least one script
    if (this.hcProperties) {
      this.hcProperties.isHCEnabled = value;
    }
  }

  getDynamicScripts() {
    return this.hcProperties?.qDynamicScript || [];
  }

  getFilters() {
    return this.properties?.filters ?? [];
  }

  getFilter(id) {
    const filters = this.getFilters();
    return filters.find((filter) => filter.id === id);
  }

  removeFilterField(idx) {
    const filters = this.getFilters();
    filters.splice(idx, 1);
    if (this.properties) {
      this.properties.qHyperCubeDef.qContextSetExpression = this.gener;
    }
    return filters;
  }

  removeFilters(indexes) {
    if (indexes.length === 0) return [];
    let deleted = [];
    // Start deleting from the end of the list first otherwise the idx is messed up
    const sortedIndexes = [...indexes].sort((a, b) => b - a);
    const filters = this.getFilters();
    // Keep the original deleted order
    deleted = filters.filter((_, idx) => indexes.includes(idx));
    sortedIndexes.forEach(async (idx) => {
      this.removeFilterField(idx);
    });

    return deleted;
  }
}

export default HyperCubeHandler;
