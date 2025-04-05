import { merge } from 'lodash';
// eslint-disable-next-line import/no-relative-packages
import isEnabled from '../../../nucleus/src/flags/flags';
import { findFieldById, useMasterNumberFormat } from './utils/field-utils/utils';
import { initializeField } from './utils/hypercube-helper';
import { INITIAL_SORT_CRITERIAS, notSupportedError } from './utils/constants';

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

  static autoSortDimension() {
    throw notSupportedError;
  }

  createLibraryDimension(id, defaults) {
    const dimension = merge({}, this.dimensionProperties || {}, defaults || {});

    const dim = initializeField(dimension);

    dim.qLibraryId = id;
    dim.qDef.autoSort = true;
    dim.qDef.qSortCriterias = INITIAL_SORT_CRITERIAS;

    delete dim.qDef.qFieldDefs;
    delete dim.qDef.qFieldLabels;

    return dim;
  }

  createFieldDimension(field, label, defaults) {
    const dimension = merge({}, this.dimensionProperties || {}, defaults || {});

    const dim = initializeField(dimension);

    if (!field) {
      dim.qDef.qFieldDefs = [];
      dim.qDef.qFieldLabels = [];
      dim.qDef.qSortCriterias = [];
    }

    dim.qDef.qFieldDefs = [field];
    dim.qDef.qFieldLabels = label ? [label] : [''];
    dim.qDef.qSortCriterias = INITIAL_SORT_CRITERIAS;

    dim.qDef.autoSort = true;

    return dim;
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

  maxDimensions(decrement) {
    const decr = decrement || 0;
    const measureLength = this.getMeasures().length - decr;

    if (typeof this.dimensionDefinition.max === 'function') {
      const dimParams = isEnabled('PS_21371_ANALYSIS_TYPES') ? [measureLength, this.properties] : [measureLength];
      return this.dimensionDefinition.max?.apply(null, dimParams);
    }

    return Number.isNaN(+this.dimensionDefinition.max) ? 10000 : this.dimensionDefinition.max;
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

  static autoSortMeasure() {
    throw notSupportedError;
  }

  createExpressionMeasure(expression, label, defaults) {
    const measure = merge({}, this.measureProperties || {}, defaults || {});

    const meas = { ...measure };

    meas.qDef = meas.qDef ?? {};
    meas.qDef.qNumFormat = meas.qDef.qNumFormat ?? {};

    meas.qDef.qDef = expression;
    meas.qDef.qLabel = label;
    meas.qDef.autoSort = true;

    return meas;
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
    const measure = merge({}, this.measureProperties || {}, defaults || {});

    const meas = { ...measure };
    meas.qDef = meas.qDef ?? {};
    meas.qDef.qNumFormat = meas.qDef.qNumFormat ?? {};

    if (isEnabled('MASTER_MEASURE_FORMAT')) {
      useMasterNumberFormat(meas.qDef);
    }

    meas.qLibraryId = id;
    meas.qDef.autoSort = true;

    delete meas.qDef.qDef;
    delete meas.qDef.qLabel;

    return meas;
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

  maxMeasures(decrement) {
    const decr = decrement || 0;
    if (typeof this.measureDefinition.max === 'function') {
      const dimLength = this.getDimensions().length - decr;
      const measureParams = isEnabled('PS_21371_ANALYSIS_TYPES') ? [dimLength, this.properties] : [dimLength];
      return this.measureDefinition.max.apply(null, measureParams);
    }
    return Number.isNaN(+this.measureDefinition.max) ? 10000 : this.measureDefinition.max;
  }
}

export default DataPropertyHandler;
