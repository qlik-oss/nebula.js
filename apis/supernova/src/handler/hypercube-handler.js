import { utils, arrayUtil } from '@nebula.js/conversion';
import DataPropertyHandler from './data-property-handler';
import * as hcUtils from './utils/hypercube-helper/hypercube-utils';
import getAutoSortLibraryDimension from './utils/field-helper/get-sorted-library-field';
import getAutoSortDimension from './utils/field-helper/get-sorted-field';
import { initializeDim, initializeId } from './utils/field-helper/field-utils';
import addMainDimension from './utils/hypercube-helper/add-main-dimension';
import addMainMeasure from './utils/hypercube-helper/add-main-measure';
import removeMainDimension from './utils/hypercube-helper/remove-main-dimension';
import removeAlternativeMeasure from './utils/hypercube-helper/remove-alternative-measure';
import removeMainMeasure from './utils/hypercube-helper/remove-main-measure';
import removeAlternativeDimension from './utils/hypercube-helper/remove-alternative-dimension';
import reinsertMainDimension from './utils/hypercube-helper/reinsert-main-dimension';
import reinsertMainMeasure from './utils/hypercube-helper/reinsert-main-measure';

/**
 * HyperCubeHandler for managing hypercube data structure.
 * @private
 * @class HyperCubeHandler
 * @description This class provides methods to handle hypercube properties, dimensions, and measures.
 * @param {object} opts Parameters to add a hypercube handlers
 * @param {qix.Doc} opts.app
 * @param {object} opts.dimensionDefinition
 * @param {object} opts.measureDefinition
 * @param {object} opts.dimensionProperties
 * @param {object} opts.measureProperties
 * @param {object} opts.globalChangeListeners
 * @param {object} opts.path
 * @entry
 * @export
 * @example
 * import { HyperCubeHandler } from '@nebula.js/stardust';
 *
 * class PivotHyperCubeHandler extends HyperCubeHandler {
 *
 *   adjustPseudoDimOrder: (pseudoIdx?: number) => {
 *    const numberOfDims = this.getDimensions().length;
 *    const interColumnSortOrder = this.hcProperties.qInterColumnSortOrder;
 *
 *    if (!interColumnSortOrder) {
 *      return;
 *    }
 *
 *    interColumnSortOrder.splice(pseudoIdx || 0, 1);
 *    interColumnSortOrder.push(numberOfDims);
 *    interColumnSortOrder.splice((pseudoIdx || -1) + 1, 0, -1);
 *  };
 * }
 */
class HyperCubeHandler extends DataPropertyHandler {
  constructor(opts) {
    super(opts);
    this.path = opts.path;
  }

  /**
   * @private
   * @typeof {object} DimensionProp
   * @property {qix.NxDimension} dimension
   * @property {boolean=} alternative - Whether the dimension is an alternative
   * @property {number=} index - Index of the dimension.
   */

  /**
   * @private
   * @typeof {object} MultiDimensionProps
   * @property {qix.NxDimension[]} dimensions
   * @property {boolean=} alternative - Whether the dimension is an alternative
   */

  /**
   * @private
   * @typeof {object} MeasureProps
   * @property {qix.NxMeasure} measure
   * @property {boolean=} alternative - Whether the measure is an alternative
   * @property {number=} index - Index of the measure.
   */

  /**
   * @private
   * @typeof {object} MultiMeasureProps
   * @property {qix.NxMeasure[]} measures
   * @property {boolean=} alternative - Whether the measure is an alternative
   */

  /**
   * @private
   * @typeof {object} Indexes
   * @property {number} fromIndex - The current index of the field.
   * @property {number} toIndex - New index of the field.
   */

  /**
   * @private
   * @typeof {object} MultiFieldsIndexes
   * @property {number[]} indexes - Multiple field indexes.
   * @property {boolean} alternative - Whether the field is an alternative.
   */

  /**
   * @private
   * @param {object=} properties
   * @returns early return if properties is falsy
   */
  setProperties(properties) {
    if (!properties) {
      return;
    }

    super.setProperties(properties);

    this.hcProperties = this.path ? utils.getValue(properties, this.path) : properties;

    if (!this.hcProperties) {
      return;
    }

    hcUtils.setDefaultProperties(this);
    hcUtils.setPropForLineChartWithForecast(this);

    // Set auto-sort property (compatibility 0.85 -> 0.9), can probably be removed in 1.0
    this.hcProperties.qDimensions = hcUtils.setFieldProperties(this.hcProperties.qDimensions);
    this.hcProperties.qMeasures = hcUtils.setFieldProperties(this.hcProperties.qMeasures);
  }

  // ----------------------------------
  // ----------- DIMENSIONS -----------
  // ----------------------------------

  /**
   * @private
   * @returns {qix.NxDimension[]} dimensions
   * @description Returns the dimensions of the hypercube.
   * @memberof HyperCubeHandler
   * @example
   * const dimensions = hyperCubeHandler.getDimensions();
   */
  getDimensions() {
    return this.hcProperties ? this.hcProperties.qDimensions : [];
  }

  /**
   * @private
   * @returns {qix.NxDimension[]} alternative dimensions
   * @description Returns the alternative dimensions of the hypercube.
   * @memberof HyperCubeHandler
   * @example
   * const alternativeDimensions = hyperCubeHandler.getAlternativeDimensions();
   */
  getAlternativeDimensions() {
    return this.hcProperties?.qLayoutExclude?.qHyperCubeDef?.qDimensions ?? [];
  }

  /**
   * @private
   * @param {string} cId
   * @returns {qix.NxDimensionInfo} dimension layout
   * @description Returns the dimension layout of the hypercube for a given cId.
   * @memberof HyperCubeHandler
   * @example
   * const dimensionLayout = hyperCubeHandler.getDimensionLayout(cId);
   */
  getDimensionLayout(cId) {
    return this.getDimensionLayouts().filter((item) => cId === item.cId)[0];
  }

  /**
   * @private
   * @returns {qix.NxDimensionInfo[]} dimension layouts
   * @description Returns the dimension layouts of the hypercube.
   * @memberof HyperCubeHandler
   * @example
   * const dimensionLayouts = hyperCubeHandler.getDimensionLayouts();
   */
  getDimensionLayouts() {
    const hc = hcUtils.getHyperCube(this.layout, this.path);
    return hc ? hc.qDimensionInfo : [];
  }

  /**
   * @private
   * @param {DimensionProps} dimensionProps
   * @returns {qix.NxDimension} dimension
   * @description Adds a dimension to the hypercube and updates the orders of the dimensions.
   * If the dimension is an alternative, it will be added to the alternative dimensions.
   * @memberof HyperCubeHandler
   * @example
   * const dimension = hyperCubeHandler.addDimension(dimension, alternative, idx);
   */
  addDimension(dimensionProps) {
    const dim = initializeDim(dimensionProps.dimension);

    if (hcUtils.isDimensionAlternative(this, dimensionProps.alternative)) {
      return hcUtils.addAlternativeDimension(this, dim, dimensionProps.index);
    }

    return addMainDimension(this, dim, dimensionProps.index);
  }

  /**
   * @private
   * @param {MultiDimensionProps} multiDimensionProps
   * @returns {qix.NxDimension[]} added dimensions
   * @description Adds multiple dimensions to the hypercube.
   * If the dimensions are alternatives, they will be added to the alternative dimensions.
   * If the total number of dimensions exceeds the limit, it will stop adding dimensions.
   * @memberof HyperCubeHandler
   * @example
   * const addedDimensions = await hyperCubeHandler.addDimensions(dimensions, alternative);
   */
  async addDimensions(multiDimensionProps) {
    const existingDimensions = this.getDimensions();
    const initialLength = existingDimensions.length;
    const addedDimensions = [];
    let addedActive = 0;

    const { dimensions } = multiDimensionProps;
    // eslint-disable-next-line no-restricted-syntax
    for await (const dimension of dimensions) {
      if (hcUtils.isTotalDimensionsExceeded(this, existingDimensions)) {
        return addedDimensions;
      }

      const dim = initializeDim(dimension);

      if (hcUtils.isDimensionAlternative(this, multiDimensionProps.alternative || false)) {
        const altDim = await hcUtils.addAlternativeDimension(this, dim);
        addedDimensions.push(altDim);
      } else if (existingDimensions.length < this.maxDimensions()) {
        await hcUtils.addActiveDimension(this, dim, initialLength, existingDimensions, addedDimensions, addedActive);
        addedActive++;
      }
    }

    return addedDimensions;
  }

  /**
   * @private
   * @param {DimensionProps} dimensionProps
   * @description Removes a dimension from the hypercube by index.
   * If the dimension is an alternative, it will be removed from the alternative dimensions.
   * @memberof HyperCubeHandler
   * @example
   * hyperCubeHandler.removeDimension(idx, alternative);
   */
  removeDimension(dimensionProps) {
    const { alternative, index } = dimensionProps;

    if (alternative) {
      removeAlternativeDimension(this, index);
    }

    removeMainDimension(this, index);
  }

  /**
   * @private
   * @param {MultiDimensionProps} multiDimensionProps
   * @returns {qix.NxDimension[]} deleted dimensions
   * @description Removes multiple dimensions from the hypercube by indexes.
   * If the dimensions are alternatives, they will be removed from the alternative dimensions.
   * If the indexes are empty, it will return an empty array.
   * @memberof HyperCubeHandler
   * @example
   * const deletedDimensions = await hyperCubeHandler.removeDimensions(indexes, alternative);
   */
  async removeDimensions(multiDimensionProps) {
    const altDimensions = this.getAlternativeDimensions();
    const dimensions = this.getDimensions();

    if (multiDimensionProps.indexes.length === 0) return [];
    let deletedDimensions = [];
    // Start deleting from the end of the list first otherwise the idx is messed up
    const sortedIndexes = [...multiDimensionProps.indexes].sort((a, b) => b - a);

    if (multiDimensionProps.alternative && altDimensions.length > 0) {
      // Keep the original deleted order
      deletedDimensions = hcUtils.getDeletedFields(altDimensions, multiDimensionProps.indexes);
      // eslint-disable-next-line no-restricted-syntax
      for await (const index of sortedIndexes) {
        await removeAlternativeDimension(this, index);
      }
    } else if (dimensions.length > 0) {
      // Keep the original deleted order
      deletedDimensions = hcUtils.getDeletedFields(dimensions, multiDimensionProps.indexes);
      // eslint-disable-next-line no-restricted-syntax
      for await (const index of sortedIndexes) {
        await removeMainDimension(this, index);
      }
    }

    return deletedDimensions;
  }

  /**
   * Replaces a dimension in the hypercube.
   * @private
   * @param {DimensionProps} dimensionProps
   * @returns {Promise<qix.NxDimension>} replaced dimension.
   * @memberof HyperCubeHandler
   * @example
   * const replacedDimension = await hyperCubeHandler.replaceDimension(index, newDimension);
   */
  replaceDimension(dimensionProps) {
    const { index, dimension } = dimensionProps;
    return this.autoSortDimension(dimension).then(() => hcUtils.replaceDimensionOrder(this, index, dimension));
  }

  /**
   * Reinserts a dimension into the hypercube.
   * @private.
   * @param {DimensionProps} dimensionProps
   * @returns {Promise<qix.NxDimension>} The reinserted dimension.
   * @memberof HyperCubeHandler
   * @example
   * await hyperCubeHandler.reinsertDimension(dimension, alternative, idx);
   */
  reinsertDimension(dimensionProps) {
    const dim = initializeId(dimensionProps.dimension);

    if (hcUtils.isDimensionAlternative(this, dimensionProps.alternative)) {
      return hcUtils.addAlternativeDimension(this, dim, dimensionProps.index).then(() => {
        hcUtils.moveDimensionToColumnOrder(this, dim);
      });
    }

    return reinsertMainDimension(this, dim, dimensionProps.index);
  }

  /**
   * Moves a dimension within the hypercube.
   * @private
   * @param {Indexes} indexes
   * @returns {Promise<qix.NxDimension[]>} updated dimensions.
   * @memberof HyperCubeHandler
   * @example
   * await hyperCubeHandler.moveDimension(fromIndex, toIndex);
   */
  moveDimension(indexes) {
    const dimensions = this.getDimensions();
    const altDimensions = this.getAlternativeDimensions();
    if (indexes.fromIndex < dimensions.length && indexes.toIndex < dimensions.length) {
      return Promise.resolve(arrayUtil.move(dimensions, indexes.fromIndex, indexes.toIndex));
    }

    if (indexes.fromIndex < dimensions.length && indexes.toIndex >= dimensions.length) {
      return hcUtils.moveDimensionFromMainToAlternative(indexes.fromIndex, indexes.toIndex, dimensions, altDimensions);
    }
    if (indexes.fromIndex >= dimensions.length && indexes.toIndex < dimensions.length) {
      return Promise.resolve(
        hcUtils.moveMeasureFromAlternativeToMain(indexes.fromIndex, indexes.toIndex, dimensions, altDimensions)
      );
    }

    return Promise.resolve(
      hcUtils.moveDimensionWithinAlternative(indexes.fromIndex, indexes.toIndex, dimensions, altDimensions)
    );
  }

  /**
   * @private
   * @param {qix.NxDimension} dimension
   * @returns {qix.NxDimension} dimension with auto-sort properties
   * @description Automatically sorts the dimension based on its properties.
   * If the dimension has a qLibraryId, it will use the library dimension auto-sort.
   * Otherwise, it will use the field dimension auto-sort.
   * @memberof HyperCubeHandler
   * @example
   * const sortedDimension = hyperCubeHandler.autoSortDimension(dimension);
   */
  autoSortDimension(dimension) {
    if (dimension.qLibraryId) {
      return getAutoSortLibraryDimension(this, dimension);
    }
    return getAutoSortDimension(this, dimension);
  }

  // ----------------------------------
  // ------------ MEASURES ------------
  // ----------------------------------

  /**
   * @private
   * @returns {qix.NxMeasure[]} measures
   * @description Returns the measures of the hypercube.
   * @memberof HyperCubeHandler
   * @example
   * const measures = hyperCubeHandler.getMeasures();
   */
  getMeasures() {
    return this.hcProperties ? this.hcProperties.qMeasures : [];
  }

  /**
   * @private
   * @returns {qix.NxMeasure[]} alternative measures
   * @description Returns the alternative measures of the hypercube.
   * @memberof HyperCubeHandler
   * @example
   * const alternativeMeasures = hyperCubeHandler.getAlternativeMeasures();
   */
  getAlternativeMeasures() {
    return this.hcProperties?.qLayoutExclude?.qHyperCubeDef?.qMeasures ?? [];
  }

  /**
   * @private
   * @returns {qix.NxMeasureInfo[]} measure layouts
   * @description Returns the measure layouts of the hypercube.
   * @memberof HyperCubeHandler
   * @example
   * const measureLayouts = hyperCubeHandler.getMeasureLayouts();
   */
  getMeasureLayouts() {
    const hc = hcUtils.getHyperCube(this.layout, this.path);
    return hc ? hc.qMeasureInfo : [];
  }

  /**
   * @private
   * @param {string} cId
   * @returns {object} measure layout
   * @description Returns the measure layout of the hypercube for a given cId.
   * @memberof HyperCubeHandler
   * @example
   * const measureLayout = hyperCubeHandler.getMeasureLayout(cId);
   */
  getMeasureLayout(cId) {
    return this.getMeasureLayouts().filter((item) => cId === item.cId)[0];
  }

  /**
   * @private
   * @param {MeasureProps} measureProps
   * @returns {Promise<qix.NxMeasure>} added measure
   * @description Adds a measure to the hypercube.
   * If the measure is an alternative, it will be added to the alternative measures.
   * If the total number of measures exceeds the limit, it will stop adding measures.
   * @memberof HyperCubeHandler
   * @example
   * const measure = hyperCubeHandler.addMeasure(measure, alternative, idx);
   */
  addMeasure(measureProps) {
    const meas = initializeId(measureProps.measure);

    if (hcUtils.isMeasureAlternative(this, measureProps.alternative)) {
      const hcMeasures = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures;
      return hcUtils.addAlternativeMeasure(meas, hcMeasures, measureProps.index);
    }

    return addMainMeasure(this, meas, measureProps.index);
  }

  /**
   * @private
   * @param {qix.NxMeasure} measure
   * @returns {Promise<qix.NxMeasure>} measure with auto-sort properties
   * @description Automatically sorts the measure based on its properties.
   * It sets the qSortByLoadOrder and qSortByNumeric properties.
   * @memberof HyperCubeHandler
   * @example
   * const sortedMeasure = hyperCubeHandler.autoSortMeasure(measure);
   */
  // eslint-disable-next-line class-methods-use-this
  autoSortMeasure(measure) {
    const meas = measure;
    meas.qSortBy = {
      qSortByLoadOrder: 1,
      qSortByNumeric: -1,
    };
    return Promise.resolve(meas);
  }

  /**
   * @private
   * @param {MultiMeasureProps} multiMeasureProps
   * @returns {qix.NxMeasure[]} added measures
   * @description Adds multiple measures to the hypercube.
   * If the measures are alternatives, they will be added to the alternative measures.
   * If the total number of measures exceeds the limit, it will stop adding measures.
   * @memberof HyperCubeHandler
   * @example
   * const addedMeasures = await hyperCubeHandler.addMeasures(measures, alternative);
   */
  addMeasures(multiMeasureProps) {
    const existingMeasures = this.getMeasures();
    const addedMeasures = [];
    let addedActive = 0;

    multiMeasureProps.measures.forEach(async (measure) => {
      if (hcUtils.isTotalMeasureExceeded(this, existingMeasures)) {
        return false;
      }

      const meas = initializeId(measure);

      if (hcUtils.isMeasureAlternative(this, multiMeasureProps.alternative || false)) {
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

  /**
   * @private
   * @param {MeasureProps} measureProps
   * @description Removes a measure from the hypercube by index.
   * If the measure is an alternative, it will be removed from the alternative measures.
   * @memberof HyperCubeHandler
   * @example
   * hyperCubeHandler.removeMeasure(idx, alternative);
   */
  removeMeasure(measureProps) {
    const { index, alternative } = measureProps;

    if (alternative) {
      hcUtils.removeAltMeasureByIndex(this, index);
    }
    removeMainMeasure(this, index);
  }

  /**
   * @private
   * @param {MultiFieldsIndexes} multiFieldsIndexes
   * @returns {Promise<number[]>} deleted measures
   * @description Removes multiple measures from the hypercube by indexes.
   * If the measures are alternatives, they will be removed from the alternative measures.
   * If the indexes are empty, it will return an empty array.
   * @memberof HyperCubeHandler
   * @example
   * const deletedMeasures = await hyperCubeHandler.removeMeasures(indexes, alternative);
   */
  async removeMeasures(multiFieldsIndexes) {
    const measures = this.getMeasures();
    const altMeasures = this.getAlternativeMeasures();
    let deletedMeasures = [];

    if (multiFieldsIndexes.length === 0) return deletedMeasures;

    if (multiFieldsIndexes.alternative && altMeasures.length > 0) {
      // Keep the original deleted order
      deletedMeasures = hcUtils.getDeletedFields(altMeasures, multiFieldsIndexes.indexes);
      removeAlternativeMeasure(this, multiFieldsIndexes.indexes);
    } else if (measures.length > 0) {
      // Keep the original deleted order
      deletedMeasures = hcUtils.getDeletedFields(measures, multiFieldsIndexes.indexes);
      const sortedIndexes = [...multiFieldsIndexes.indexes].sort((a, b) => b - a);

      // eslint-disable-next-line no-restricted-syntax
      for await (const index of sortedIndexes) {
        await removeMainMeasure(this, index);
      }
    }

    return deletedMeasures;
  }

  /**
   * @private
   * @param {MeasureProps} measureProps
   * @returns {Promise<qix.NxMeasure>} replaced measure
   * @description Replaces a measure in the hypercube.
   * @memberof HyperCubeHandler
   * @example
   * const updatedMeasure = await hyperCubeHandler.replaceMeasure(index, measure);
   */
  replaceMeasure(measureProps) {
    const { index, measure } = measureProps;
    return this.autoSortMeasure(measure).then(() => hcUtils.replaceMeasureToColumnOrder(this, index, measure));
  }

  /**
   * @private
   * @param {MeasureProps} measureProps
   * @returns {Promise<qix.NxMeasure>} reinserted measure
   * @description Reinserts a measure into the hypercube.
   * @memberof HyperCubeHandler
   * @example
   * const reinsertedMeasure = await hyperCubeHandler.reinsertMeasure(measure, alternative, idx);
   */
  reinsertMeasure(measureProps) {
    const meas = initializeId(measureProps.measure);

    if (hcUtils.isMeasureAlternative(this, measureProps.alternative)) {
      return hcUtils.addAlternativeMeasure(this, meas, measureProps.index);
    }

    return reinsertMainMeasure(this, meas, measureProps.index);
  }

  /**
   * Moves a measure within the hypercube.
   * @private
   * @param {Indexes} indexes
   * @returns {Promise<void>}
   * @description Move measure from one index to another
   * @memberof HyperCubeHandler
   * @example
   * const result = await hyperCubeHandler.moveMeasure(0, 1);
   */
  moveMeasure(indexes) {
    const measures = this.getMeasures();
    const altMeasures = this.getAlternativeMeasures();

    if (indexes.fromIndex < measures.length && indexes.toIndex < measures.length) {
      // Move within main measures
      return Promise.resolve(arrayUtil.move(measures, indexes.fromIndex, indexes.toIndex));
    }

    if (indexes.fromIndex < measures.length && indexes.toIndex >= measures.length) {
      return hcUtils.moveMeasureFromMainToAlternative(indexes.fromIndex, indexes.toIndex, measures, altMeasures);
    }

    if (indexes.fromIndex >= measures.length && indexes.toIndex < measures.length) {
      return hcUtils.moveMeasureFromAlternativeToMain(indexes.fromIndex, indexes.toIndex, measures, altMeasures);
    }

    return Promise.resolve(
      hcUtils.moveMeasureWithinAlternative(indexes.fromIndex, indexes.toIndex, measures, altMeasures)
    );
  }

  // ----------------------------------
  // ------------ OTHERS---- ----------
  // ----------------------------------

  /**
   * Sets the sorting order for the hypercube.
   * @private
   * @param {number[]} arr - The new sorting order.
   * @memberof HyperCubeHandler
   * @example
   * const newSortingOrder = [2, 0, 1];
   * hyperCubeHandler.setSorting(newSortingOrder);
   */
  setSorting(arr) {
    if (arr && arr.length === this.hcProperties.qInterColumnSortOrder.length) {
      this.hcProperties.qInterColumnSortOrder = arr;
    }
  }

  /**
   * Gets the sorting order for the hypercube.
   * @private
   * @returns {number[]} The current sorting order.
   * @memberof HyperCubeHandler
   * @example
   * const currentSortingOrder = hyperCubeHandler.getSorting();
   */
  getSorting() {
    return this.hcProperties.qInterColumnSortOrder;
  }

  /**
   * Changes the sorting order for the hypercube.
   * @private
   * @param {Indexes} indexes
   * @memberof HyperCubeHandler
   * @example
   * const newSortingOrder = hyperCubeHandler.changeSorting(0, 1);
   */
  changeSorting(indexes) {
    utils.move(this.hcProperties.qInterColumnSortOrder, indexes.fromIndex, indexes.toIndex);
  }

  /**
   * Returns whether the hypercube is in straight mode or pivot mode.
   * @private
   * @returns {string} 'S' for straight mode, 'P' for pivot mode
   * @memberof HyperCubeHandler
   */
  IsHCInStraightMode() {
    return this.hcProperties.qMode === 'S';
  }

  /**
   * @private
   * @param {boolean} value
   * @description This flag indicates whether we enabled HC modifier and have at least one script
   * @memberof HyperCubeHandler
   */
  setHCEnabled(value) {
    if (this.hcProperties) {
      this.hcProperties.isHCEnabled = value;
    }
  }

  /**
   * Gets the dynamic scripts for the hypercube.
   * @private
   * @returns {Array} The dynamic scripts.
   * @memberof HyperCubeHandler
   */
  getDynamicScripts() {
    return this.hcProperties?.qDynamicScript || [];
  }
}

export default HyperCubeHandler;
