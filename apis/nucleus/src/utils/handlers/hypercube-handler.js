import utils from '@nebula.js/conversion/src/utils';
import DataPropertyHandler from './data-property-handler';
import {
  getHyperCube,
  setFieldProperties,
  addActiveDimension,
  addAlternativeDimension,
  addAlternativeMeasure,
  addMainDimension,
  addMainMeasure,
  autoSortLibraryDimension,
  initializeField,
  initializeId,
  isDimensionAlternative,
  isMeasureAlternative,
  isTotalDimensionsExceeded,
  isTotalMeasureExceeded,
  addActiveMeasure,
} from './handler-helper';

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
    this.hcProperties.qDimensions = setFieldProperties(this.hcProperties.qDimensions);
    this.hcProperties.qMeasures = setFieldProperties(this.hcProperties.qMeasures);
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
    const hc = getHyperCube(this.layout, this.path);
    return hc ? hc.qDimensionInfo : [];
  }

  addDimension(dimension, alternative, idx) {
    const dim = initializeField(dimension);

    if (alternative) {
      const hcDimensions = this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions;
      return addAlternativeDimension(dim, hcDimensions, idx);
    }

    return addMainDimension(this, dim, idx);
  }

  async addDimensions(dimensions, alternative = false) {
    const existingDimensions = this.getDimensions();
    const addedDimensions = [];
    let addedActive = 0;
    await Promise.all(
      dimensions.map(async (dimension) => {
        if (isTotalDimensionsExceeded(this, existingDimensions)) {
          return addedDimensions;
        }

        const dim = initializeField(dimension);

        if (isDimensionAlternative(this, existingDimensions, alternative)) {
          const altDim = await addAlternativeDimension(this, dim);
          addedDimensions.push(altDim);
        } else if (existingDimensions.length < this.maxDimensions()) {
          await addActiveDimension(this, dim, existingDimensions, addedDimensions, addedActive);
          addedActive++;
        }
        return addedDimensions;
      })
    );
    return addedDimensions;
  }

  autoSortDimension(dimension) {
    if (dimension.qLibraryId) {
      return autoSortLibraryDimension(this, dimension);
    }
    return autoSortLibraryDimension(this, dimension);
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
    const hc = getHyperCube(this.layout, this.path);
    return hc ? hc.qMeasureInfo : [];
  }

  getMeasureLayout(cId) {
    return this.getMeasureLayouts().filter((item) => cId === item.cId)[0];
  }

  addMeasure(measure, alternative, idx) {
    const meas = initializeField(measure);

    if (alternative) {
      const hcMeasures = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures;
      return addAlternativeMeasure(meas, hcMeasures, idx);
    }

    return addMainMeasure(this, meas, idx);
  }

  addMeasures(measures, alternative = false) {
    const existingMeasures = this.getMeasures();
    const addedMeasures = [];
    let addedActive = 0;
    measures.every((measure) => {
      // Adding more measures than TOTAL_MAX_MEASURES is not allowed and we expect this.maxMeasures() to always be <= TOTAL_MAX_MEASURES
      if (isTotalMeasureExceeded(this, existingMeasures)) {
        return false;
      }

      const meas = initializeId(measure);

      // add new measure to excluded layout if this.maxMeasures <= nbr of measures < TOTAL_MAX_MEASURES
      if (isMeasureAlternative(this, existingMeasures, alternative)) {
        addAlternativeMeasure(this, meas);
        addedMeasures.push(meas);
      } else if (existingMeasures.length < this.maxMeasures()) {
        addActiveMeasure(this, meas, existingMeasures, addedMeasures, addedActive);
        addedActive++;
      }
      return true;
    });
    return addedMeasures;
  }
}

export default HyperCubeHandler;
