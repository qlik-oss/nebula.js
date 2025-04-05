// eslint-disable-next-line import/no-relative-packages
import utils from '../../../conversion/src/utils';
import DataPropertyHandler from './data-property-handler';
import * as hypercubeUtils from './utils/hypercube-helper/hypercube-utils';
import getAutoSortLibraryDimension from './utils/field-helper/get-sorted-library-field';
import getAutoSortFieldDimension from './utils/field-helper/get-sorted-field';
import { initializeField, initializeId } from './utils/field-helper/field-utils';
import addMainDimension from './utils/hypercube-helper/add-main-dimension';
import addMainMeasure from './utils/hypercube-helper/add-main-measure';
import removeMainDimension from './utils/hypercube-helper/remove-main-dimension';
import removeAlternativeMeasure from './utils/hypercube-helper/remove-alternative-measure';

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

    hypercubeUtils.setDefaultProperties(this);
    hypercubeUtils.setPropForLineChartWithForecast(this);

    // Set auto-sort property (compatibility 0.85 -> 0.9),
    // can probably be removed in 1.0
    this.hcProperties.qDimensions = hypercubeUtils.setFieldProperties(this.hcProperties.qDimensions);
    this.hcProperties.qMeasures = hypercubeUtils.setFieldProperties(this.hcProperties.qMeasures);
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
    const hc = hypercubeUtils.getHyperCube(this.layout, this.path);
    return hc ? hc.qDimensionInfo : [];
  }

  addDimension(dimension, alternative, idx) {
    const dim = initializeField(dimension);

    if (hypercubeUtils.isDimensionAlternative(this, dim, alternative)) {
      return hypercubeUtils.addAlternativeDimension(this, dim, idx);
    }

    return addMainDimension(this, dim, idx);
  }

  async addDimensions(dimensions, alternative = false) {
    const existingDimensions = this.getDimensions();
    const addedDimensions = [];
    let addedActive = 0;

    // eslint-disable-next-line no-restricted-syntax
    for await (const dimension of dimensions) {
      if (hcHelper.isTotalDimensionsExceeded(this, existingDimensions)) {
        return addedDimensions;
      }

      const dim = initializeField(dimension);

      if (hcHelper.isDimensionAlternative(this, alternative)) {
        const altDim = await hcHelper.addAlternativeDimension(this, dim);
        addedDimensions.push(altDim);
      } else if (existingDimensions.length < this.maxDimensions()) {
        await hcHelper.addActiveDimension(this, dim, existingDimensions, addedDimensions, addedActive);
        addedActive++;
      }
    }

    return addedDimensions;
  }

  removeDimension(idx, alternative) {
    if (alternative) {
      hypercubeUtils.removeAlternativeDimension(this, idx);
    }

    removeMainDimension(this, idx).then(() => true);
  }

  async removeDimensions(indexes, alternative) {
    if (indexes.length === 0) return [];
    let deleted = [];
    // Start deleting from the end of the list first otherwise the idx is messed up
    const sortedIndexes = [...indexes].sort((a, b) => b - a);

    if (alternative) {
      // Keep the original deleted order
      deleted = this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.filter((_, idx) => indexes.includes(idx));
      sortedIndexes.forEach(async (idx) => {
        await hypercubeUtils.removeAlternativeDimension(this, idx);
      });
    }

    // Keep the original deleted order
    deleted = this.hcProperties.qDimensions.filter((_, idx) => indexes.includes(idx));
    sortedIndexes.forEach(async (idx) => {
      await removeMainDimension(this, idx);
    });

    return deleted;
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
    const hc = hypercubeUtils.getHyperCube(this.layout, this.path);
    return hc ? hc.qMeasureInfo : [];
  }

  getMeasureLayout(cId) {
    return this.getMeasureLayouts().filter((item) => cId === item.cId)[0];
  }

  addMeasure(measure, alternative, idx) {
    const meas = initializeField(measure);

    if (hypercubeUtils.isMeasureAlternative(this, meas, alternative)) {
      const hcMeasures = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures;
      return hypercubeUtils.addAlternativeMeasure(meas, hcMeasures, idx);
    }

    return addMainMeasure(this, meas, idx);
  }

  // eslint-disable-next-line class-methods-use-this
  autoSortMeasure(measure) {
    const meas = { ...measure };
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
      if (hypercubeUtils.isTotalMeasureExceeded(this, existingMeasures)) {
        return false;
      }

      const meas = initializeId(measure);

      if (hypercubeUtils.isMeasureAlternative(this, existingMeasures, alternative)) {
        hypercubeUtils.addAlternativeMeasure(this, meas);
        addedMeasures.push(meas);
      } else if (existingMeasures.length < this.maxMeasures()) {
        await hypercubeUtils.addActiveMeasure(this, meas, existingMeasures, addedMeasures, addedActive);
        addedActive++;
      }
      return true;
    });
    return addedMeasures;
  }

  removeMeasure(idx, alternative) {
    if (alternative) {
      hypercubeUtils.removeAltMeasureByIndex(this, idx);
    }
    hypercubeUtils.removeMeasureFromColumnSortOrder(this, idx);
    hypercubeUtils.removeMeasureFromColumnOrder(this, idx).then(() => true);
  }

  async removeMeasures(indexes, alternative) {
    if (indexes.length === 0) return [];
    let deleted = [];

    if (alternative) {
      return removeAlternativeMeasure(this, indexes);
    }

    // Keep the original deleted order
    deleted = indexes.map((idx) => this.hcProperties.qMeasures[idx]).filter(Boolean);

    // Start deleting from the end of the list, otherwise the idx is messed up
    indexes
      .slice()
      .sort((a, b) => b - a)
      .forEach(async (idx) => {
        hypercubeUtils.removeMeasureFromColumnSortOrder(this, idx);
        await hypercubeUtils.removeMeasureFromColumnOrder(this, idx);
      });

    return deleted;
  }

  // ----------------------------------
  // ------------ OTHERS---- ----------
  // ----------------------------------

  getFilters() {
    return this.properties?.filters ?? [];
  }

  getFilter(id) {
    const filters = this.getFilters();
    return filters.find((filter) => filter.id === id);
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
