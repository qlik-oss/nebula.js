import { merge } from 'lodash';
import isEnabled from '../flags/flags';
import translator from '../../../locale/src/translator';

const notSupportedError = new Error('Not supported in this object, need to implement in subclass.');

class DataPropertyHandler {
  constructor(opts) {
    const options = opts || {};

    this.dimensionDefinition = options.dimensionDefinition || { max: 0 };
    this.measureDefinition = options.measureDefinition || { max: 0 };

    if (options.dimensionDefinition) {
      this.dimensionProperties = options.dimensionProperties || {};
    }
    if (options.measureDefinition) {
      this.measureProperties = options.measureProperties || {};
    }
    if (options.globalChangeListeners) {
      this.globalChangeListeners = options.globalChangeListeners;
    }

    this.app = options.app;
  }

  setProperties(properties) {
    this.properties = properties;
    this.isAnalysisType = this.properties?.metaData?.isAnalysisType;
  }

  setGlobalChangeListeners(arr) {
    this.globalChangeListeners = arr;
  }

  setLayout(layout) {
    this.layout = layout;
  }

  static type() {
    throw new Error('Must override this method');
  }

  static getDimensions() {
    return [];
  }

  getDimension(id) {
    const dimensions = this.getDimensions();
    const alternativeDimensions = this.getAlternativeDimensions();
    let i = 0;
    for (i; i < dimensions.length; ++i) {
      if (dimensions[i].qDef?.cId === id) {
        return dimensions[i];
      }
    }
    for (i = 0; i < alternativeDimensions.length; ++i) {
      if (alternativeDimensions[i].qDef?.cId === id) {
        return alternativeDimensions[i];
      }
    }
    return null;
  }

  static getAlternativeDimensions() {
    throw new Error('Method not implemented.');
  }

  minDimensions() {
    if (typeof this.dimensionDefinition.min === 'function') {
      return this.dimensionDefinition.min.call(null, this.properties, this);
    }
    return this.dimensionDefinition.min || 0;
  }

  maxDimensions(decrement) {
    const decr = decrement || 0;
    const measureLength = this.getMeasures().length - decr;
    const dimParams = isEnabled('PS_21371_ANALYSIS_TYPES') ? [measureLength, this.properties] : [measureLength];
    if (typeof this.dimensionDefinition.max === 'function') {
      return this.dimensionDefinition.max.apply(null, dimParams);
    }
    return Number.isNaN(+this.dimensionDefinition.max) ? 10000 : this.dimensionDefinition.max;
  }

  canAddDimension() {
    return this.getDimensions().length < this.maxDimensions();
    //			return this.getDimensions().length < 10000;
  }

  minMeasures() {
    if (typeof this.measureDefinition.min === 'function') {
      return this.measureDefinition.min.call(null, this.properties, this);
    }
    return this.measureDefinition.min || 0;
  }

  maxMeasures(decrement) {
    const decr = decrement || 0;
    if (typeof this.measureDefinition.max === 'function') {
      const dimLength = this.getDimensions().length - decr;
      const measureParams = isEnabled('PS_21371_ANALYSIS_TYPES') ? [dimLength, this.properties] : [dimLength];
      return this.measureDefinition.max.apply(null, measureParams);
    }
    return Number.isNaN(+this.measureDefinition.max) ? 10000 : this.measureDefinition.max;
  }

  canAddMeasure() {
    return this.getMeasures().length < this.maxMeasures();
    //			return this.getMeasures().length < 10000;
  }

  static getMeasures() {
    return [];
  }

  static getLabels() {
    return [];
  }

  getMeasure(id) {
    const measures = this.getMeasures();
    const alternativeMeasures = this.getAlternativeMeasures();
    let i = 0;
    for (i; i < measures.length; ++i) {
      if (measures[i].qDef.cId === id) {
        return measures[i];
      }
    }
    for (i = 0; i < alternativeMeasures.length; ++i) {
      if (alternativeMeasures[i].qDef.cId === id) {
        return alternativeMeasures[i];
      }
    }
    return null;
  }

  static getAlternativeMeasures() {
    throw new Error('Method not implemented.');
  }

  static addDimension(dimension, alternative) {
    throw notSupportedError;
  }

  static addDimensions(dimensions, alternative) {
    throw notSupportedError;
  }

  static getSorting() {
    throw notSupportedError;
  }

  addFieldDimension(field, label, defaults) {
    const dimension = this.createFieldDimension(field, label, defaults);
    return this.addDimension(dimension);
  }

  addFieldDimensions(args) {
    const dimensions = args.map(({ field, label, defaults }) => this.createFieldDimension(field, label, defaults));
    console.log('🚀 ~ DataPropertyHandler ~ addFieldDimensions ~ dimensions:', dimensions);
    return this.addDimensions(dimensions);
  }

  addLibraryDimension(id, defaults) {
    const dimension = this.createLibraryDimension(id, defaults);
    return this.addDimension(dimension);
  }

  addLibraryDimensions(args) {
    const dimensions = args.map(({ id, defaults }) => this.createLibraryDimension(id, defaults));
    const result = this.addDimensions(dimensions);
    console.log('🚀 ~ DataPropertyHandler ~ addLibraryDimensions ~ dimensions:', dimensions);
    console.log('🚀 ~ DataPropertyHandler ~ addLibraryDimensions ~ result:', result);
    return result;
  }

  static addMeasure(measure, alternative) {
    throw notSupportedError;
  }

  static addMeasures(measures, alternative) {
    throw notSupportedError;
  }

  addExpressionMeasure(expression, label, defaults) {
    const measure = this.createExpressionMeasure(expression, label, defaults);
    return this.addMeasure(measure);
  }

  /**
   * @param {*} args list of objects containing expression, label and defaults
   */
  addExpressionMeasures(args) {
    const measures = args.map(({ expression, label, defaults }) =>
      this.createExpressionMeasure(expression, label, defaults)
    );
    return this.addMeasures(measures);
  }

  addLibraryMeasure(id, defaults) {
    const measure = this.createLibraryMeasure(id, defaults);
    return this.addMeasure(measure);
  }

  addLibraryMeasures(args) {
    const measures = args.map(({ id, defaults }) => this.createLibraryMeasure(id, defaults));
    return this.addMeasures(measures);
  }

  async addAltLibraryDimensions(args) {
    const dimensions = args.map(({ id }) => this.createLibraryDimension(id));
    return this.addDimensions(dimensions, true);
  }

  async addAltFieldDimensions(args) {
    const dimensions = args.map(({ field }) => this.createFieldDimension(field));
    return this.addDimensions(dimensions, true);
  }

  addAltLibraryMeasures(args) {
    const measures = args.map(({ id }) => this.createLibraryMeasure(id));
    return this.addMeasures(measures, true);
  }

  addAltExpressionMeasures(args) {
    const measures = args.map(({ expression }) => this.createExpressionMeasure(expression));
    return this.addMeasures(measures, true);
  }

  addAlternativeFieldDimension(field, label, defaults) {
    const dimension = this.createFieldDimension(field, label, defaults);
    return this.addDimension(dimension, true);
  }

  addAlternativeLibraryDimension(id, defaults) {
    const dimension = this.createLibraryDimension(id, defaults);
    return this.addDimension(dimension, true);
  }

  addAlternativeExpressionMeasure(expression, label, defaults) {
    const measure = this.createExpressionMeasure(expression, label, defaults);
    return this.addMeasure(measure, true);
  }

  addAlternativeLibraryMeasure(id, defaults) {
    const measure = this.createLibraryMeasure(id, defaults);
    return this.addMeasure(measure, true);
  }

  static replaceDimension() {
    throw notSupportedError;
  }

  static replaceMeasure() {
    throw notSupportedError;
  }

  static autoSortDimension(dimension) {
    throw notSupportedError;
  }

  static autoSortMeasure() {
    throw notSupportedError;
  }

  createFieldDimension(field, label, defaults) {
    const dimension = Object.assign(true, {}, this.dimensionProperties || {}, defaults || {});

    if (!dimension.qDef) {
      dimension.qDef = {};
    }
    if (!dimension.qOtherTotalSpec) {
      dimension.qOtherTotalSpec = {};
    }

    if (field) {
      dimension.qDef.qFieldDefs = [field];
      if (label) {
        dimension.qDef.qFieldLabels = [label];
      } else {
        dimension.qDef.qFieldLabels = [''];
      }
      dimension.qDef.qSortCriterias = [
        {
          qSortByLoadOrder: 1,
          qSortByNumeric: 1,
          qSortByAscii: 1,
        },
      ];
    } else {
      dimension.qDef.qFieldDefs = [];
      dimension.qDef.qFieldLabels = [];
      dimension.qDef.qSortCriterias = [];
    }

    dimension.qDef.autoSort = true;

    return dimension;
  }

  createLibraryDimension(id, defaults) {
    const dimension = merge({}, this.dimensionProperties || {}, defaults || {});
    if (!dimension.qDef) {
      dimension.qDef = {};
    }
    if (!dimension.qOtherTotalSpec) {
      dimension.qOtherTotalSpec = {};
    }

    dimension.qLibraryId = id;
    dimension.qDef.qSortCriterias = [
      {
        qSortByLoadOrder: 1,
        qSortByNumeric: 1,
        qSortByAscii: 1,
      },
    ];
    dimension.qDef.autoSort = true;

    delete dimension.qDef.qFieldDefs;
    delete dimension.qDef.qFieldLabels;

    return dimension;
  }

  createExpressionMeasure(expression, label, defaults) {
    const measure = Object.assign(true, {}, this.measureProperties || {}, defaults || {});

    if (!measure.qDef) {
      measure.qDef = {};
    }
    if (!measure.qDef.qNumFormat) {
      measure.qDef.qNumFormat = {};
    }

    measure.qDef.qDef = expression;
    measure.qDef.qLabel = label;
    measure.qDef.autoSort = true;

    // TODO move defaults here

    return measure;
  }

  createLibraryMeasure(id, defaults) {
    const measure = Object.assign(true, {}, this.measureProperties || {}, defaults || {});

    if (!measure.qDef) {
      measure.qDef = {};
    }
    if (!measure.qDef.qNumFormat) {
      measure.qDef.qNumFormat = {};
    }
    // if (isEnabled('MASTER_MEASURE_FORMAT')) {
    //   NumberFormatUtil.useMasterNumberFormat(measure.qDef);
    // }

    measure.qLibraryId = id;
    measure.qDef.autoSort = true;

    delete measure.qDef.qDef;
    delete measure.qDef.qLabel;

    return measure;
  }

  updateGlobalChangeListeners(layout) {
    if (this.globalChangeListeners) {
      (this.globalChangeListeners || []).forEach((func) => {
        if (func && typeof func === 'function') {
          func(this.properties, this, { layout });
        }
      });
    }
  }

  static removeDimension() {
    throw notSupportedError;
  }

  static removeDimensions() {
    throw notSupportedError;
  }

  static removeMeasure() {
    throw notSupportedError;
  }

  static removeMeasures() {
    throw notSupportedError;
  }

  static moveDimension() {
    throw notSupportedError;
  }

  static moveMeasure() {
    throw notSupportedError;
  }

  static changeSorting() {
    throw notSupportedError;
  }

  static getAddDimensionLabel() {
    return translator.get('Visualization.Requirements.AddDimension');
  }
}

export default DataPropertyHandler;
