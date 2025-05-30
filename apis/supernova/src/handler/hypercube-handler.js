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
import reinsertMainDimension from './utils/hypercube-helper/reinsert-main-dimension';
import reinsertMainMeasure from './utils/hypercube-helper/reinsert-main-measure';
// eslint-disable-next-line import/no-relative-packages
import arrayUtil from '../../../conversion/src/array-util';

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
    return this.autoSortDimension(dimension).then(() => hcUtils.replaceDimensionOrder(this, index, dimension));
  }

  reinsertDimension(dimension, alternative, idx) {
    const dim = initializeId(dimension);

    if (hcUtils.isDimensionAlternative(this, alternative)) {
      return hcUtils.addAlternativeDimension(this, dim, idx).then(() => {
        hcUtils.moveDimensionToColumnOrder(this, dim);
      });
    }

    return reinsertMainDimension(this, dim, idx);
  }

  moveDimension(fromIndex, toIndex) {
    const dimensions = this.getDimensions();
    const altDimensions = this.getAlternativeDimensions();

    if (fromIndex < dimensions.length && toIndex < dimensions.length) {
      // Move within main dimensions
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
    const measures = this.getAlternativeMeasure();
    const meas = initializeId(measure);

    if (hcUtils.isMeasureAlternative(this, measures, alternative)) {
      return hcUtils.addAlternativeMeasure(this, meas, idx);
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

  reinsertMeasure(measure, alternative, idx) {
    const measures = this.getAlternativeMeasures();
    const meas = initializeId(measure);

    if (hcUtils.isMeasureAlternative(this, measures, alternative)) {
      return hcUtils.addAlternativeMeasure(this, meas, idx);
    }

    return reinsertMainMeasure(this, meas, idx);
  }

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
}

export default HyperCubeHandler;
