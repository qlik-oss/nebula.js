import extend from 'extend';
import isEnabled from '@nebula.js/nucleus/src/flags/flags';
import { findFieldById, initializeField, useMasterNumberFormat } from './utils/field-helper/field-utils';
import { INITIAL_SORT_CRITERIAS } from './utils/constants';
import { notSupportedError } from './utils/hypercube-helper/hypercube-utils';

/**
 * @class DataPropertyHandler
 * @description A class to handle data properties for dimensions and measures in a data model.
 * @export
 */
class DataPropertyHandler {
  /**
   * Creates an instance of DataPropertyHandler.
   * @param {object} opts - Options for the handler.
   */
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

  /**
   * Creates a type of library dimension with a field definition.
   * @param {string} id - Dimension id
   * @param {object | undefined} [defaults] - Default properties for the dimension.
   * @returns {NxDimension} The created dimension object.
   * @description Initializes a dimension and applying default properties and sort criteria.
   */
  createLibraryDimension(id, defaults) {
    const dimension = merge({}, this.dimensionProperties || {}, defaults || {});

    dimension = initializeField(dimension);

    dimension.qLibraryId = id;
    dimension.qDef.autoSort = true;
    dimension.qDef.qSortCriterias = INITIAL_SORT_CRITERIAS;

    delete dimension.qDef.qFieldDefs;
    delete dimension.qDef.qFieldLabels;

    return dimension;
  }

  /**
   * Creates a type of field dimension with a field definition.
   * @param {string} field - The field definition for the dimension.
   * @param {string | undefined} label - The field label for the dimension.
   * @param {object | undefined} defaults - Default properties for the dimension.
   * @returns {NxDimension} The created dimension object.
   * @description Initializes a dimension with field definitions, labels, and default properties.
   */
  createFieldDimension(field, label, defaults) {
    const dimension = merge({}, this.dimensionProperties || {}, defaults || {});

    dimension = initializeField(dimension);

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

  /**
   * Gets the maximum number of dimensions allowed.
   * @param {number} [decrement=0] - The number to decrement from the maximum dimensions.
   * @returns {number} The maximum number of dimensions allowed.
   * @description Checks if the max property is a function and calls it with the current number of measures, or returns a default value.
   */
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

  getMeasure(id) {
    const measures = this.getMeasures();
    const alternativeMeasures = this.getAlternativeMeasures();

    return findFieldById(measures, id) ?? findFieldById(alternativeMeasures, id);
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

    if (isEnabled('MASTER_MEASURE_FORMAT')) {
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

  /**
   * Gets the maximum number of measures allowed.
   * @param {number} [decrement=0] - The number to decrement from the maximum measures.
   * @returns {number} The maximum number of measures allowed.
   * @description Checks if the max property is a function and calls it with the current number of dimensions, or returns a default value.
   */
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
