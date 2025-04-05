// eslint-disable-next-line import/no-relative-packages
import utils from '../../../conversion/src/utils';
import DataPropertyHandler from './data-property-handler';
import * as hcHelper from './utils/hypercube-helper';
import getAutoSortLibraryDimension from './utils/field-utils/get-sorted-library-field';
import getAutoSortFieldDimension from './utils/field-utils/get-sorted-field';

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

    // Set defaults
    this.hcProperties.qDimensions = this.hcProperties.qDimensions ?? [];
    this.hcProperties.qMeasures = this.hcProperties.qMeasures ?? [];
    this.hcProperties.qInterColumnSortOrder = this.hcProperties.qInterColumnSortOrder ?? [];
    this.hcProperties.qLayoutExclude = this.hcProperties.qLayoutExclude ?? {
      qHyperCubeDef: { qDimensions: [], qMeasures: [] },
    };
    this.hcProperties.qLayoutExclude.qHyperCubeDef = this.hcProperties.qLayoutExclude.qHyperCubeDef ?? {
      qDimensions: [],
      qMeasures: [],
    };
    this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions =
      this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions ?? [];
    this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures =
      this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures ?? [];

    if (
      this.hcProperties.isHCEnabled &&
      this.hcProperties.qDynamicScript.length === 0 &&
      this.hcProperties.qMode === 'S'
    ) {
      // this is only for line chart with forecast
      this.hcProperties.qDynamicScript = [];
    }

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
    const dim = hcHelper.initializeField(dimension);

    if (hcHelper.isDimensionCountedAlt(this, dim, alternative)) {
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

        const dim = hcHelper.initializeField(dimension);

        if (hcHelper.isDimensionCountedAlt(this, alternative)) {
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
    const meas = hcHelper.initializeField(measure);

    if (hcHelper.isMeasureCountedAlt(this, meas, alternative)) {
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

      const meas = hcHelper.initializeId(measure);

      if (hcHelper.isMeasureCountedAlt(this, existingMeasures, alternative)) {
        hcHelper.addAlternativeMeasure(this, meas);
        addedMeasures.push(meas);
      } else if (existingMeasures.length < this.maxMeasures()) {
        await hcHelper.addActiveMeasure(this, meas, existingMeasures, addedMeasures, addedActive);
        addedActive++;
      }
      return true;
    });
    return addedMeasures;

    // const addedMeasures = [];
    // const existingMeasures = this.getMeasures();
    // let addedActive = 0;
    // // await Promise.all(
    // measures.every(async (measure) => {
    //   if (hcHelper.isTotalMeasureExceeded(this, existingMeasures)) {
    //     return false;
    //   }
    //   const meas = hcHelper.initializeId(measure);
    //   // add new measure to excluded layout if this.maxMeasures <= nbr of measures < TOTAL_MAX_MEASURES
    //   if (hcHelper.isMeasureCountedAlt(this, existingMeasures, alternative)) {
    //     await hcHelper.addAlternativeMeasure(this, meas);
    //     addedMeasures.push(meas);
    //   } else if (existingMeasures.length < this.maxMeasures()) {
    //     await hcHelper.addActiveMeasure(this, meas, existingMeasures, addedMeasures, addedActive);
    //     addedActive++;
    //   }
    //   return true;
    // });
    // // );
    // return addedMeasures;
  }
}

export default HyperCubeHandler;
