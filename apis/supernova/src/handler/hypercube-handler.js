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
   * @param {object=} properties
   * @returns early return if properties is falsy
   */
  setProperties(properties) {
    if (!properties) {
      return;
    }

    super.setProperties(properties);

    this.hcProperties = this.path ? utils.getValue(properties, `${this.path}.qHyperCubeDef`) : properties.qHyperCubeDef;

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
   * const dimensionLayout = hyperCubeHandler.getDimensionLayout('cId');
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
   * @param {qix.NxDimension} dimension
   * @param {boolean} alternative
   * @param {number=} idx
   * @returns {qix.NxDimension} dimension
   * @description Adds a dimension to the hypercube and updates the orders of the dimensions.
   * If the dimension is an alternative, it will be added to the alternative dimensions.
   * @memberof HyperCubeHandler
   * @example
   * const dimension = hyperCubeHandler.addDimension({qDef :{ cId: 'id', qSortCriterias: [{qSortByLoadOrder: 1}]}}, true, 1);
   */
  addDimension(dimension, alternative, idx) {
    const dim = initializeDim(dimension);

    if (hcUtils.isDimensionAlternative(this, alternative)) {
      return hcUtils.addAlternativeDimension(this, dim, idx);
    }

    return addMainDimension(this, dim, idx);
  }

  /**
   * @private
   * @param {qix.NxDimension[]} dimensions
   * @param {boolean} alternative
   * @returns {qix.NxDimension[]} added dimensions
   * @description Adds multiple dimensions to the hypercube.
   * If the dimensions are alternatives, they will be added to the alternative dimensions.
   * If the total number of dimensions exceeds the limit, it will stop adding dimensions.
   * @memberof HyperCubeHandler
   * @example
   * const addedDimensions = await hyperCubeHandler.addDimensions([{qDef :{ cId: 'id01'}}, {qDef :{ cId: 'id02'}}], false);
   */
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

      const dim = initializeDim(dimension);

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

  /**
   * @private
   * @param {number} index
   * @param {boolean} alternative
   * @description Removes a dimension from the hypercube by index.
   * If the dimension is an alternative, it will be removed from the alternative dimensions.
   * @memberof HyperCubeHandler
   * @example
   * hyperCubeHandler.removeDimension(0, true);
   */
  removeDimension(index, alternative) {
    if (alternative) {
      return removeAlternativeDimension(this, index);
    }

    return removeMainDimension(this, index);
  }

  /**
   * @private
   * @param {number[]} indexes
   * @param {boolean} alternative
   * @returns {qix.NxDimension[]} deleted dimensions
   * @description Removes multiple dimensions from the hypercube by indexes.
   * If the dimensions are alternatives, they will be removed from the alternative dimensions.
   * If the indexes are empty, it will return an empty array.
   * @memberof HyperCubeHandler
   * @example
   * const deletedDimensions = await hyperCubeHandler.removeDimensions({1, 0}, false);
   */
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

  /**
   * Replaces a dimension in the hypercube.
   * @private
   * @param {number} index - The index of the dimension to replace.
   * @param {qix.NxDimension} dimension - The new dimension to replace the old one.
   * @returns {Promise<qix.NxDimension>} replaced dimension.
   * @memberof HyperCubeHandler
   * @example
   * const replacedDimension = await hyperCubeHandler.replaceDimension(2, {qDef :{ cId: 'id'}});
   */
  replaceDimension(index, dimension) {
    return this.autoSortDimension(dimension).then(() => hcUtils.replaceDimensionOrder(this, index, dimension));
  }

  /**
   * Reinserts a dimension into the hypercube.
   * @private.
   * @param {qix.NxDimension} dimension - The dimension to reinsert.
   * @param {boolean} alternative - Whether the dimension is an alternative.
   * @param {number} index - The index to insert the dimension at.
   * @returns {Promise<qix.NxDimension>} The reinserted dimension.
   * @memberof HyperCubeHandler
   * @example
   * await hyperCubeHandler.reinsertDimension({qDef :{ cId: 'id'}}, false, 2);
   */
  reinsertDimension(dimension, alternative, index) {
    const dim = initializeId(dimension);

    if (hcUtils.isDimensionAlternative(this, alternative)) {
      return hcUtils.addAlternativeDimension(this, dim, index).then(() => {
        hcUtils.moveDimensionToColumnOrder(this, dim);
      });
    }

    return reinsertMainDimension(this, dim, index);
  }

  /**
   * Moves a dimension within the hypercube.
   * @private
   * @param {number} fromIndex - The current index of the dimension.
   * @param {number} toIndex - The new index of the dimension.
   * @returns {Promise<qix.NxDimension[]>} updated dimensions.
   * @memberof HyperCubeHandler
   * @example
   * await hyperCubeHandler.moveDimension(2, 1);
   */
  moveDimension(fromIndex, toIndex) {
    const dimensions = this.getDimensions();
    const altDimensions = this.getAlternativeDimensions();
    if (fromIndex < dimensions.length && toIndex < dimensions.length) {
      return Promise.resolve(arrayUtil.move(dimensions, fromIndex, toIndex));
    }

    if (fromIndex < dimensions.length && toIndex >= dimensions.length) {
      return hcUtils.moveDimensionFromMainToAlternative(fromIndex, toIndex, dimensions, altDimensions);
    }
    if (fromIndex >= dimensions.length && toIndex < dimensions.length) {
      return Promise.resolve(hcUtils.moveMeasureFromAlternativeToMain(fromIndex, toIndex, dimensions, altDimensions));
    }

    return Promise.resolve(hcUtils.moveDimensionWithinAlternative(fromIndex, toIndex, dimensions, altDimensions));
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
   * const sortedDimension = hyperCubeHandler.autoSortDimension({qDef :{ cId: 'id'}});
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
   * const measureLayout = hyperCubeHandler.getMeasureLayout('cid');
   */
  getMeasureLayout(cId) {
    return this.getMeasureLayouts().filter((item) => cId === item.cId)[0];
  }

  /**
   * @private
   * @param {qix.NxMeasure} measure
   * @param {boolean} alternative
   * @param {number=} index
   * @returns {Promise<qix.NxMeasure>} added measure
   * @description Adds a measure to the hypercube.
   * If the measure is an alternative, it will be added to the alternative measures.
   * If the total number of measures exceeds the limit, it will stop adding measures.
   * @memberof HyperCubeHandler
   * @example
   * const measure = hyperCubeHandler.addMeasure({qDef :{ cId: 'id'}}, true, 0);
   */
  addMeasure(measure, alternative, index) {
    const meas = initializeId(measure);

    if (hcUtils.isMeasureAlternative(this, alternative)) {
      return hcUtils.addAlternativeMeasure(this, meas, index);
    }

    return addMainMeasure(this, meas, index);
  }

  /**
   * @private
   * @param {qix.NxMeasure} measure
   * @returns {Promise<qix.NxMeasure>} measure with auto-sort properties
   * @description Automatically sorts the measure based on its properties.
   * It sets the qSortByLoadOrder and qSortByNumeric properties.
   * @memberof HyperCubeHandler
   * @example
   * const sortedMeasure = hyperCubeHandler.autoSortMeasure({qDef :{ cId: 'id'}});
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
   * @param {qix.NxMeasure[]} measures
   * @param {boolean} alternative
   * @returns {qix.NxMeasure[]} added measures
   * @description Adds multiple measures to the hypercube.
   * If the measures are alternatives, they will be added to the alternative measures.
   * If the total number of measures exceeds the limit, it will stop adding measures.
   * @memberof HyperCubeHandler
   * @example
   * const addedMeasures = await hyperCubeHandler.addMeasures([{qDef :{ cId: 'id01'}}, {qDef :{ cId: 'id02'}}], true);
   */
  addMeasures(measures, alternative = false) {
    const existingMeasures = this.getMeasures();
    const addedMeasures = [];
    let addedActive = 0;

    measures.forEach(async (measure) => {
      if (hcUtils.isTotalMeasureExceeded(this, existingMeasures)) {
        return false;
      }

      const meas = initializeId(measure);

      if (hcUtils.isMeasureAlternative(this, alternative || false)) {
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
   * @param {number} index
   * @param {boolean} alternative
   * @description Removes a measure from the hypercube by index.
   * If the measure is an alternative, it will be removed from the alternative measures.
   * @memberof HyperCubeHandler
   * @example
   * hyperCubeHandler.removeMeasure(0, false);
   */
  removeMeasure(index, alternative) {
    if (alternative) {
      return hcUtils.removeAltMeasureByIndex(this, index);
    }
    return removeMainMeasure(this, index);
  }

  /**
   * @private
   * @param {number[]} indexes
   * @param {boolean} alternative
   * @returns {Promise<number[]>} deleted measures
   * @description Removes multiple measures from the hypercube by indexes.
   * If the measures are alternatives, they will be removed from the alternative measures.
   * If the indexes are empty, it will return an empty array.
   * @memberof HyperCubeHandler
   * @example
   * const deletedMeasures = await hyperCubeHandler.removeMeasures({0,1}, true);
   */
  async removeMeasures(indexes, alternative) {
    const measures = this.getMeasures();
    const altMeasures = this.getAlternativeMeasures();
    let deletedMeasures = [];

    if (indexes.length === 0) return deletedMeasures;

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

  /**
   * @private
   * @param {number} index
   * @param {qix.NxMeasure} measure
   * @returns {Promise<qix.NxMeasure>} replaced measure
   * @description Replaces a measure in the hypercube.
   * @memberof HyperCubeHandler
   * @example
   * const updatedMeasure = await hyperCubeHandler.replaceMeasure(0, {qDef :{ cId: 'id'}});
   */
  replaceMeasure(index, measure) {
    return this.autoSortMeasure(measure).then(() => hcUtils.replaceMeasureToColumnOrder(this, index, measure));
  }

  /**
   * @private
   * @param {qix.NxMeasure} measure
   * @param {boolean} alternative
   * @param {number} index
   * @returns {Promise<qix.NxMeasure>} reinserted measure
   * @description Reinserts a measure into the hypercube.
   * @memberof HyperCubeHandler
   * @example
   * const reinsertedMeasure = await hyperCubeHandler.reinsertMeasure({qDef :{ cId: 'id'}}, true, 0);
   */
  reinsertMeasure(measure, alternative, index) {
    const meas = initializeId(measure);

    if (hcUtils.isMeasureAlternative(this, alternative)) {
      return hcUtils.addAlternativeMeasure(this, meas, index);
    }

    return reinsertMainMeasure(this, meas, index);
  }

  /**
   * Moves a measure within the hypercube.
   * @private
   * @param {number} fromIndex
   * @param {number} toIndex
   * @returns {Promise<void>}
   * @description Move measure from one index to another
   * @memberof HyperCubeHandler
   * @example
   * const result = await hyperCubeHandler.moveMeasure(0, 1);
   */
  moveMeasure(fromIndex, toIndex) {
    const measures = this.getMeasures();
    const altMeasures = this.getAlternativeMeasures();

    if (fromIndex < measures.length && toIndex < measures.length) {
      // Move within main measures
      return Promise.resolve(arrayUtil.move(measures, fromIndex, toIndex));
    }

    if (fromIndex < measures.length && toIndex >= measures.length) {
      return hcUtils.moveMeasureFromMainToAlternative(fromIndex, toIndex, measures, altMeasures);
    }

    if (fromIndex >= measures.length && toIndex < measures.length) {
      return hcUtils.moveMeasureFromAlternativeToMain(fromIndex, toIndex, measures, altMeasures);
    }

    return Promise.resolve(hcUtils.moveMeasureWithinAlternative(fromIndex, toIndex, measures, altMeasures));
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
   * @param {number} fromIdx - The index to move from.
   * @param {number} toIdx - The index to move to.
   * @memberof HyperCubeHandler
   * @example
   * const newSortingOrder = hyperCubeHandler.changeSorting(0, 1);
   */
  changeSorting(fromIdx, toIdx) {
    utils.move(this.hcProperties.qInterColumnSortOrder, fromIdx, toIdx);
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
