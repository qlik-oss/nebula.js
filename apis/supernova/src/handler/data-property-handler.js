import extend from 'extend';
// eslint-disable-next-line import/no-relative-packages
import isEnabled from '../../../nucleus/src/flags/flags';
import { findFieldById, useMasterNumberFormat } from './utils/field-helper/field-utils';
import { INITIAL_SORT_CRITERIAS } from './utils/constants';
import { notSupportedError } from './utils/hypercube-helper/hypercube-utils';

class DataPropertyHandler {
  constructor(opts) {
    const options = opts || {};

    this.dimensionDefinition = options.dimensionDefinition || { max: 0 };
    this.measureDefinition = options.measureDefinition || { max: 0 };

    this.dimensionProperties = options.dimensionProperties ?? {};
    this.measureProperties = options.measureProperties ?? {};
    this.globalChangeListeners = options.globalChangeListeners;
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

  // ---------------------------------------
  // ---------------DIMENSION---------------
  // ---------------------------------------

  static getDimensions() {
    return [];
  }

  getDimension(id) {
    const dimensions = this.getDimensions();
    const alternativeDimensions = this.getAlternativeDimensions();

    return findFieldById(dimensions, id) ?? findFieldById(alternativeDimensions, id);
  }

  static getAlternativeDimensions() {
    throw new Error('Method not implemented.');
  }

  static addDimension() {
    throw notSupportedError;
  }

  static addDimensions() {
    throw notSupportedError;
  }

  static removeDimension() {
    throw notSupportedError;
  }

  static removeDimensions() {
    throw notSupportedError;
  }

  static autoSortDimension() {
    throw notSupportedError;
  }

  static replaceDimension() {
    throw notSupportedError;
  }

  static getSorting() {
    throw notSupportedError;
  }

  createLibraryDimension(id, defaults) {
    const dimension = extend(true, {}, this.dimensionProperties || {}, defaults || {});

    dimension.qDef = dimension.qDef ?? {};
    dimension.qOtherTotalSpec = dimension.qOtherTotalSpec ?? {};

    dimension.qLibraryId = id;
    dimension.qDef.autoSort = true;
    dimension.qDef.qSortCriterias = INITIAL_SORT_CRITERIAS;

    delete dimension.qDef.qFieldDefs;
    delete dimension.qDef.qFieldLabels;

    return dimension;
  }

  createFieldDimension(field, label, defaults) {
    const dimension = extend(true, {}, this.dimensionProperties || {}, defaults || {});

    dimension.qDef = dimension.qDef ?? {};
    dimension.qOtherTotalSpec = dimension.qOtherTotalSpec ?? {};

    if (!field) {
      dimension.qDef.qFieldDefs = [];
      dimension.qDef.qFieldLabels = [];
      dimension.qDef.qSortCriterias = [];
    }

    dimension.qDef.qFieldDefs = [field];
    dimension.qDef.qFieldLabels = label ? [label] : [''];
    dimension.qDef.qSortCriterias = INITIAL_SORT_CRITERIAS;

    dimension.qDef.autoSort = true;

    return dimension;
  }

  addFieldDimension(field, label, defaults) {
    const dimension = this.createFieldDimension(field, label, defaults);
    return this.addDimension(dimension);
  }

  addFieldDimensions(args) {
    const dimensions = args.map(({ field, label, defaults }) => this.createFieldDimension(field, label, defaults));
    return this.addDimensions(dimensions);
  }

  addLibraryDimension(id, defaults) {
    const dimension = this.createLibraryDimension(id, defaults);
    return this.addDimension(dimension);
  }

  addLibraryDimensions(args) {
    const dimensions = args.map(({ id, defaults }) => this.createLibraryDimension(id, defaults));
    const result = this.addDimensions(dimensions);
    return result;
  }

  async addAltLibraryDimensions(args) {
    const dimensions = args.map(({ id }) => this.createLibraryDimension(id));
    return this.addDimensions(dimensions, true);
  }

  async addAltFieldDimensions(args) {
    const dimensions = args.map(({ field }) => this.createFieldDimension(field));
    return this.addDimensions(dimensions, true);
  }

  addAlternativeFieldDimension(field, label, defaults) {
    const dimension = this.createFieldDimension(field, label, defaults);
    return this.addDimension(dimension, true);
  }

  addAlternativeLibraryDimension(id, defaults) {
    const dimension = this.createLibraryDimension(id, defaults);
    return this.addDimension(dimension, true);
  }

  minDimensions() {
    if (typeof this.dimensionDefinition.min === 'function') {
      return this.dimensionDefinition.min.call(null, this.properties, this);
    }

    return this.dimensionDefinition.min || 0;
  }

  maxDimensions(decrement = 0) {
    const measureLength = this.getMeasures().length - decrement;

    if (typeof this.dimensionDefinition.max === 'function') {
      const dimParams = isEnabled('PS_21371_ANALYSIS_TYPES') ? [measureLength, this.properties] : [measureLength];
      return this.dimensionDefinition.max?.apply(null, dimParams);
    }

    return Number.isNaN(+this.dimensionDefinition.max) ? 10000 : this.dimensionDefinition.max;
  }

  canAddDimension() {
    return this.getDimensions().length < this.maxDimensions();
  }

  // ---------------------------------------
  // ----------------MEASURE----------------
  // ---------------------------------------

  getMeasure(id) {
    const measures = this.getMeasures();
    const alternativeMeasures = this.getAlternativeMeasures();

    return findFieldById(measures, id) ?? findFieldById(alternativeMeasures, id);
  }

  static getMeasures() {
    return [];
  }

  static getAlternativeMeasures() {
    throw new Error('Method not implemented.');
  }

  static addMeasure() {
    throw notSupportedError;
  }

  static addMeasures() {
    throw notSupportedError;
  }

  static removeMeasure() {
    throw notSupportedError;
  }

  static removeMeasures() {
    throw notSupportedError;
  }

  static autoSortMeasure() {
    throw notSupportedError;
  }

  static replaceMeasure() {
    throw notSupportedError;
  }

  createExpressionMeasure(expression, label, defaults) {
    const measure = extend(true, {}, this.measureProperties || {}, defaults || {});

    measure.qDef = measure.qDef ?? {};
    measure.qDef.qNumFormat = measure.qDef.qNumFormat ?? {};

    measure.qDef.qDef = expression;
    measure.qDef.qLabel = label;
    measure.qDef.autoSort = true;

    return measure;
  }

  addExpressionMeasure(expression, label, defaults) {
    const measure = this.createExpressionMeasure(expression, label, defaults);
    return this.addMeasure(measure);
  }

  addExpressionMeasures(args) {
    const measures = args.map(({ expression, label, defaults }) =>
      this.createExpressionMeasure(expression, label, defaults)
    );
    return this.addMeasures(measures);
  }

  createLibraryMeasure(id, defaults) {
    const measure = extend(true, {}, this.measureProperties || {}, defaults || {});
    measure.qDef = measure.qDef ?? {};
    measure.qDef.qNumFormat = measure.qDef.qNumFormat ?? {};

    if (isEnabled('MASTER_measureURE_FORMAT')) {
      useMasterNumberFormat(measure.qDef);
    }

    measure.qLibraryId = id;
    measure.qDef.autoSort = true;

    delete measure.qDef.qDef;
    delete measure.qDef.qLabel;

    return measure;
  }

  addLibraryMeasure(id, defaults) {
    const measure = this.createLibraryMeasure(id, defaults);
    return this.addMeasure(measure);
  }

  addLibraryMeasures(args) {
    const measures = args.map(({ id, defaults }) => this.createLibraryMeasure(id, defaults));
    return this.addMeasures(measures);
  }

  addAltLibraryMeasures(args) {
    const measures = args.map(({ id }) => this.createLibraryMeasure(id));
    return this.addMeasures(measures, true);
  }

  addAltExpressionMeasures(args) {
    const measures = args.map(({ expression }) => this.createExpressionMeasure(expression));
    return this.addMeasures(measures, true);
  }

  addAlternativeExpressionMeasure(expression, label, defaults) {
    const measure = this.createExpressionMeasure(expression, label, defaults);
    return this.addMeasure(measure, true);
  }

  addAlternativeLibraryMeasure(id, defaults) {
    const measure = this.createLibraryMeasure(id, defaults);
    return this.addMeasure(measure, true);
  }

  minMeasures() {
    if (typeof this.measureDefinition.min === 'function') {
      return this.measureDefinition.min.call(null, this.properties, this);
    }
    return this.measureDefinition.min || 0;
  }

  maxMeasures(decrement = 0) {
    if (typeof this.measureDefinition.max === 'function') {
      const dimLength = this.getDimensions().length - decrement;
      const measureParams = isEnabled('PS_21371_ANALYSIS_TYPES') ? [dimLength, this.properties] : [dimLength];
      return this.measureDefinition.max.apply(null, measureParams);
    }
    return Number.isNaN(+this.measureDefinition.max) ? 10000 : this.measureDefinition.max;
  }

  canAddMeasure() {
    return this.getMeasures().length < this.maxMeasures();
    //			return this.getMeasures().length < 10000;
  }

  // ---------------------------------------
  // ---------------OTHERS------------------
  // ---------------------------------------

  updateGlobalChangeListeners(layout) {
    if (this.globalChangeListeners) {
      (this.globalChangeListeners || []).forEach((func) => {
        if (func && typeof func === 'function') {
          func(this.properties, this, { layout });
        }
      });
    }
  }
}

export default DataPropertyHandler;
