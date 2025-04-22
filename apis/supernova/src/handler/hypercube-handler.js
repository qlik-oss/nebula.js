// eslint-disable-next-line import/no-relative-packages
import utils from '../../../conversion/src/utils';
import DataPropertyHandler from './data-property-handler';
import * as hcHelper from './utils/hypercube-helper';
import getAutoSortLibraryDimension from './utils/field-helper/get-sorted-library-field';
import getAutoSortFieldDimension from './utils/field-helper/get-sorted-field';
import { initializeField, initializeId } from './utils/field-helper/utils';

class HyperCubeHandler extends DataPropertyHandler {
  constructor(opts) {
    super(opts);
    this.path = opts.path;
  }

  setProperties(properties) {
    if (!properties) {
      return undefined;
    }

    super.setProperties(properties);

    this.hcProperties = this.path ? utils.getValue(properties, `${this.path}.qHyperCubeDef`) : properties.qHyperCubeDef;

    if (!this.hcProperties) {
      return undefined;
    }

    hcHelper.setDefaultProperties(this);
    hcHelper.setPropForLineChartWithForecast(this);

    // Set auto-sort property (compatibility 0.85 -> 0.9),
    // can probably be removed in 1.0
    this.hcProperties.qDimensions = hcHelper.setFieldProperties(this.hcProperties.qDimensions);
    this.hcProperties.qMeasures = hcHelper.setFieldProperties(this.hcProperties.qMeasures);
    return undefined;
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
    const hc = hcHelper.getHyperCube(this.layout, this.path);
    return hc ? hc.qDimensionInfo : [];
  }

  addDimension(dimension, alternative, idx) {
    const dim = initializeField(dimension);

    if (hcHelper.isDimensionAlternative(this, dim, alternative)) {
      return hcHelper.addAlternativeDimension(this, dim, idx);
    }

    return hcHelper.addMainDimension(this, dim, idx);
  }

  async addDimensions(dimensions, alternative = false) {
    const existingDimensions = this.getDimensions();
    const addedDimensions = [];
    let addedActive = 0;
    await Promise.all(
      dimensions.map(async (dimension) => {
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
        return addedDimensions;
      })
    );
    return addedDimensions;
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
    const hc = hcHelper.getHyperCube(this.layout, this.path);
    return hc ? hc.qMeasureInfo : [];
  }

  getMeasureLayout(cId) {
    return this.getMeasureLayouts().filter((item) => cId === item.cId)[0];
  }

  addMeasure(measure, alternative, idx) {
    const meas = initializeField(measure);

    if (hcHelper.isMeasureAlternative(this, meas, alternative)) {
      const hcMeasures = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures;
      return hcHelper.addAlternativeMeasure(meas, hcMeasures, idx);
    }

    return hcHelper.addMainMeasure(this, meas, idx);
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
      if (hcHelper.isTotalMeasureExceeded(this, existingMeasures)) {
        return false;
      }

      const meas = initializeId(measure);

      if (hcHelper.isMeasureAlternative(this, existingMeasures, alternative)) {
        hcHelper.addAlternativeMeasure(this, meas);
        addedMeasures.push(meas);
      } else if (existingMeasures.length < this.maxMeasures()) {
        await hcHelper.addActiveMeasure(this, meas, existingMeasures, addedMeasures, addedActive);
        addedActive++;
      }
      return true;
    });
    return addedMeasures;
  }
}

export default HyperCubeHandler;
