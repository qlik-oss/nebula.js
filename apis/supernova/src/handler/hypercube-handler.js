// eslint-disable-next-line import/no-relative-packages
import utils from '../../../conversion/src/utils';
import DataPropertyHandler from './data-property-handler';
import { getHyperCube, setFieldProperties } from './handler-helper';

class HyperCubeHandler extends DataPropertyHandler {
  constructor(opts) {
    super(opts);
    this.path = opts.path;
  }

  setProperties(properties) {
    if (!properties) {
      return;
    }

    super.setProperties(properties);

    this.hcProperties = this.path ? utils.getValue(properties, `${this.path}.qHyperCubeDef`) : properties.qHyperCubeDef;

    if (!this.hcProperties) {
      return;
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
}

export default HyperCubeHandler;
