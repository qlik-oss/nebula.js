import extend from 'extend';
import { findFieldById, initializeField } from './utils/field-helper/field-utils';
import { INITIAL_SORT_CRITERIAS } from './utils/constants';
import { notSupportedError } from './utils/hypercube-helper/hypercube-utils';

/**
 * @class DataPropertyHandler
 * @description A class to handle data properties for dimensions and measures in a data model.
 * @param {object} opts - Parameters to add a hypercube handlers
 * @entry
 * @export
 * @example
 * const handler = new DataPropertyHandler({
 *   app: qlikApp,
 *   dimensionDefinition: { max: 2, min: 1 },
 *   measureDefinition: { max: 3, min: 1 },
 *   dimensionProperties: { foo: 'bar' },
 *   measureProperties: { bar: 'baz' },
 * });
 * // Get the maximum number of measures allowed
 * const max = handler.maxMeasures();
 */
class DataPropertyHandler {
  /**
   * Creates an instance of DataPropertyHandler.
   * @param {object} opts - Options for the handler.
   * opts: {
   *  app,
   *  path,
   *  dimensionDefinition,
   *  measureDefinition,
   *  dimensionProperties,
   *  measureDefinition,
   *  globalChangeListeners,
   * }
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

  /**
   * @typeof {object} LibraryDimensions
   * @property {string} id
   * @property {qix.NxDimension=} defaults
   */

  /**
   * @typeof {object} FieldDimensions
   * @property {string} field
   * @property {string=} label
   * @property {qix.NxDimension=} defaults
   */

  /**
   * @typeof {object} LibraryMeasures
   * @property {string} id
   * @property {qix.NxMeasure=} defaults
   */

  /**
   * @typeof {object} ExpressionMeasures
   * @property {string} expression
   * @property {string=} label
   * @property {qix.NxMeasure=} defaults
   */

  /**
   * Sets the properties for the handler.
   * @param {object=} properties - The properties object to set.
   * @description Updates the handler's properties and analysis type flag.
   * @memberof DataPropertyHandler
   * @example
   * handler.setProperties({ metaData: { isAnalysisType: true } });
   */
  setProperties(properties) {
    this.properties = properties;
    this.isAnalysisType = this.properties?.metaData?.isAnalysisType;
  }

  /**
   * Sets the global change listeners.
   * @param {Function[]} arr - Array of listener functions.
   * @description Assigns global change listeners to the handler.
   * @memberof DataPropertyHandler
   * @example
   * handler.setGlobalChangeListeners([listener1, listener2]);
   */
  setGlobalChangeListeners(arr) {
    this.globalChangeListeners = arr;
  }

  /**
   * @param {object=} layout - The layout object to set.
   * @description Sets the layout for the handler.
   * @memberof DataPropertyHandler
   * @example
   * handler.setLayout(layoutObj);
   */
  setLayout(layout) {
    this.layout = layout;
  }

  /**
   * @throws {Error}
   * @description Throws an error indicating the method must be overridden.
   * @memberof DataPropertyHandler
   * @example
   * DataPropertyHandler.type(); // Throws error
   */
  static type() {
    throw new Error('Must override this method');
  }

  // ---------------------------------------
  // ---------------DIMENSION---------------
  // ---------------------------------------

  /**
   * @returns {Array} Empty array.
   * @description Returns the default dimension array.
   * @memberof DataPropertyHandler
   */
  static getDimensions() {
    return [];
  }

  /**
   * Gets a dimension by id from dimensions or alternative dimensions.
   * @param {string} id - The dimension id.
   * @returns {qix.NxDimension} - The found dimension.
   * @description Searches for a dimension by id in both main and alternative dimensions.
   * @memberof DataPropertyHandler
   * @example
   * const dim = handler.getDimension('dimId');
   */
  getDimension(id) {
    const dimensions = this.getDimensions();
    const alternativeDimensions = this.getAlternativeDimensions();

    return findFieldById(dimensions, id) ?? findFieldById(alternativeDimensions, id);
  }

  /**
   * Throws an error indicating the method must be implemented in subclasses.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static getAlternativeDimensions() {
    throw new Error('Method not implemented.');
  }

  /**
   * Throws an error indicating addDimension is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static addDimension() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating addDimensions is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static addDimensions() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating removeDimension is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static removeDimension() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating removeDimensions is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static removeDimensions() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating autoSortDimension is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static autoSortDimension() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating replaceDimension is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static replaceDimension() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating getSorting is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static getSorting() {
    throw notSupportedError;
  }

  /**
   * Creates a type of library dimension with a field definition.
   * @param {string} id - Dimension id
   * @param {qix.NxDimension=} [defaults] - Default properties for the dimension.
   * @returns {qix.NxDimension} The created dimension object.
   * @description Initializes a dimension and applying default properties and sort criteria.
   * @memberof DataPropertyHandler
   * @example
   * const dim = handler.createLibraryDimension('dimId', { qDef: { cId: 'dim1' } });
   */
  createLibraryDimension(id, defaults) {
    let dimension = extend(true, {}, this.dimensionProperties || {}, defaults || {});

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
   * @param {string=} label - The field label for the dimension.
   * @param {qix.NxDimension=} defaults - Default properties for the dimension.
   * @returns {qix.NxDimension} The created dimension object.
   * @description Initializes a dimension with field definitions, labels, and default properties.
   * @memberof DataPropertyHandler
   * @example
   * handler.addFieldDimension('currentField', 'label');
   */
  createFieldDimension(field, label, defaults) {
    let dimension = extend({}, this.dimensionProperties || {}, defaults || {});

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

  /**
   * Adds a field dimension to the handler.
   * @param {string} field - The field definition for the dimension.
   * @param {string=} label - The field label for the dimension.
   * @param {qix.NxDimension=} defaults - Default properties for the dimension.
   * @returns {Promise<qix.NxDimension=>} The result of addDimension.
   * @description Creates and adds a field dimension.
   * @memberof DataPropertyHandler
   * @example
   * handler.addFieldDimension('A', 'AA');
   */
  addFieldDimension(field, label, defaults) {
    const dimension = this.createFieldDimension(field, label, defaults);
    return this.addDimension(dimension);
  }

  /**
   * @param {FieldDimensions[]} args - Array of field dimension args.
   * @returns {Promise<qix.NxDimension[]>} The result of addDimensions.
   * @description Creates and adds multiple field dimensions.
   * @memberof DataPropertyHandler
   * @example
   * handler.addFieldDimensions([{ field: 'A', label: 'AA' }, { field: 'B', label: 'BB' }]);
   */
  addFieldDimensions(args) {
    const dimensions = args.map(({ field, label, defaults }) => this.createFieldDimension(field, label, defaults));
    return this.addDimensions(dimensions);
  }

  /**
   * Adds a library dimension to the handler.
   * @param {string} id - The library dimension id.
   * @param {qix.NxDimension=} defaults - Default properties for the dimension.
   * @returns {Promise<qix.NxDimension=>} The result of addDimension.
   * @description Creates and adds a library dimension.
   * @memberof DataPropertyHandler
   * @example
   * handler.addLibraryDimension('A');
   */
  addLibraryDimension(id, defaults) {
    const dimension = this.createLibraryDimension(id, defaults);
    return this.addDimension(dimension);
  }

  /**
   * Adds multiple library dimensions to the handler.
   * @param {LibraryDimensions[]} args - Array of library dimension args.
   * @returns {Promise<qix.NxDimension[]>} The result of addDimensions.
   * @description Creates and adds multiple library dimensions.
   * @memberof DataPropertyHandler
   * @example
   * handler.addLibraryDimensions([{ id: 'A' }, { id: 'B', defaults: { ... } }]);
   */
  addLibraryDimensions(args) {
    const dimensions = args.map(({ id, defaults }) => this.createLibraryDimension(id, defaults));
    const result = this.addDimensions(dimensions);
    return result;
  }

  /**
   * Adds multiple alternative library dimensions to the handler.
   * @param {LibraryDimensions[]} args - Array of library dimension args.
   * @returns {Promise<qix.NxDimension[]>} The result of addDimensions.
   * @description Creates and adds multiple alternative library dimensions.
   * @memberof DataPropertyHandler
   * @example
   * await handler.addAltLibraryDimensions([{ id: 'A' }, { id: 'B', defaults: { ... } }]);
   */
  async addAltLibraryDimensions(args) {
    const dimensions = args.map(({ id, defaults }) => this.createLibraryDimension(id, defaults));
    return this.addDimensions(dimensions, true);
  }

  /**
   * Adds multiple alternative field dimensions to the handler.
   * @param {FieldDimensions[]} args - Array of field dimension args.
   * @returns {Promise<qix.NxDimension[]>} The result of addDimensions.
   * @description Creates and adds multiple alternative field dimensions.
   * @memberof DataPropertyHandler
   * @example
   * await handler.addAltFieldDimensions([{ field: 'A' }, { field: 'B' }]);
   */
  async addAltFieldDimensions(args) {
    const dimensions = args.map(({ field }) => this.createFieldDimension(field));
    return this.addDimensions(dimensions, true);
  }

  /**
   * Adds an alternative field dimension to the handler.
   * @param {string} field - The field definition for the dimension.
   * @param {string=} label - The field label for the dimension.
   * @param {qix.NxDimension=} defaults - Default properties for the dimension.
   * @returns {Promise<qix.NxDimension=>} The result of addDimension.
   * @description Creates and adds an alternative field dimension.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAlternativeFieldDimension('A', 'AA');
   */
  addAlternativeFieldDimension(field, label, defaults) {
    const dimension = this.createFieldDimension(field, label, defaults);
    return this.addDimension(dimension, true);
  }

  /**
   * Adds an alternative library dimension to the handler.
   * @param {string} id - The library dimension id.
   * @param {qix.NxDimension=} defaults - Default properties for the dimension.
   * @returns {Promise<qix.NxDimension=>} The result of addDimension.
   * @description Creates and adds an alternative library dimension.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAlternativeLibraryDimension([{ id: 'A' }, { id: 'B', defaults: { ... } }]);
   */
  addAlternativeLibraryDimension(id, defaults) {
    const dimension = this.createLibraryDimension(id, defaults);
    return this.addDimension(dimension, true);
  }

  /**
   * Gets the minimum number of dimensions allowed.
   * @returns {number} The minimum number of dimensions.
   * @description Returns the minimum number of dimensions allowed by the handler.
   * @memberof DataPropertyHandler
   * @example
   * const min = handler.minDimensions();
   */
  minDimensions() {
    if (typeof this.dimensionDefinition.min === 'function') {
      return this.dimensionDefinition.min.call(null, this.properties, this);
    }
    return this.dimensionDefinition.min || 0;
  }

  /**
   * Gets the maximum number of dimensions allowed.
   * @param {number} [decrement=0] - The number to decrement from the current number of dimensions.
   * @returns {number} The maximum number of dimensions allowed.
   * @description Checks if the max property is a function and calls it with the current number of dimensions, or returns a default value.
   * @memberof DataPropertyHandler
   * @example
   * const max = handler.maxDimensions();
   */
  maxDimensions(decrement = 0) {
    const measureLength = this.getMeasures().length - decrement;

    if (typeof this.dimensionDefinition.max === 'function') {
      const dimParams = [measureLength];
      return this.dimensionDefinition.max?.apply(null, dimParams);
    }

    return Number.isNaN(+this.dimensionDefinition.max) ? 10000 : this.dimensionDefinition.max;
  }

  /**
   * Checks if a new dimension can be added.
   * @returns {boolean} True if a new dimension can be added, false otherwise.
   * @description Returns whether the handler can add another dimension.
   * @memberof DataPropertyHandler
   * @example
   * if (handler.canAddDimension()) { handler.addFieldDimension('A'); }
   */
  canAddDimension() {
    return this.getDimensions().length < this.maxDimensions();
  }

  // ---------------------------------------
  // ----------------MEASURE----------------
  // ---------------------------------------

  /**
   * @returns {Array} Empty array.
   * @description Returns the default measure array.
   * @memberof DataPropertyHandler
   */
  static getMeasures() {
    return [];
  }

  /**
   * Throws an error indicating the method must be implemented in subclasses.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static getAlternativeMeasures() {
    throw new Error('Method not implemented.');
  }

  /**
   * Throws an error indicating addMeasure is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static addMeasure() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating addMeasures is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static addMeasures() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating removeMeasure is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static removeMeasure() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating removeMeasures is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static removeMeasures() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating autoSortMeasure is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static autoSortMeasure() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating replaceMeasure is not supported in the base class.
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  static replaceMeasure() {
    throw notSupportedError;
  }

  /**
   * Gets a measure by id from measures or alternative measures.
   * @param {string} id - The measure id to find.
   * @returns {qix.NxMeasure} The found measure or undefined.
   * @description Searches for a measure by id in both main and alternative measures.
   * @memberof DataPropertyHandler
   * @example
   * const measure = handler.getMeasure('measId');
   */
  getMeasure(id) {
    const measures = this.getMeasures();
    const alternativeMeasures = this.getAlternativeMeasures();

    return findFieldById(measures, id) ?? findFieldById(alternativeMeasures, id);
  }

  /**
   * Creates an expression measure.
   * @param {string} expression - The expression for the measure.
   * @param {string=} label - The label for the measure.
   * @param {qix.NxMeasure=} defaults - Default properties for the measure.
   * @returns {Promise<qix.NxMeasure=>} The created measure object.
   * @description Initializes a measure with an expression, label, and default properties.
   * @memberof DataPropertyHandler
   * @example
   * const meas = handler.createExpressionMeasure('Sum(Sales)', 'Total Sales');
   */
  createExpressionMeasure(expression, label, defaults) {
    const measure = extend(true, {}, this.measureProperties || {}, defaults || {});

    measure.qDef = measure.qDef ?? {};
    measure.qDef.qNumFormat = measure.qDef.qNumFormat ?? {};

    measure.qDef.qDef = expression;
    measure.qDef.qLabel = label;
    measure.qDef.autoSort = true;

    return measure;
  }

  /**
   * Adds an expression measure to the handler.
   * @param {string} expression - The expression for the measure.
   * @param {string=} label - The label for the measure.
   * @param {qix.NxMeasure=} defaults - Default properties for the measure.
   * @returns {Promise<qix.NxMeasure=>} The result of addMeasure.
   * @description Creates and adds an expression measure.
   * @memberof DataPropertyHandler
   * @example
   * handler.addExpressionMeasure('Sum(Sales)', 'Total Sales');
   */
  addExpressionMeasure(expression, label, defaults) {
    const measure = this.createExpressionMeasure(expression, label, defaults);
    return this.addMeasure(measure);
  }

  /**
   * Adds multiple expression measures to the handler.
   * @param {ExpressionMeasures[]} args - Array of expression measure args.
   * @returns {Promise<qix.NxMeasure[]>} The result of addMeasures.
   * @description Creates and adds multiple expression measures.
   * @memberof DataPropertyHandler
   * @example
   * handler.addExpressionMeasures([{ expression: 'Sum(A)' }, { expression: 'Sum(B)', label: 'B' }]);
   */
  addExpressionMeasures(args) {
    const measures = args.map(({ expression, label, defaults }) =>
      this.createExpressionMeasure(expression, label, defaults)
    );
    return this.addMeasures(measures);
  }

  /**
   * Creates a library measure.
   * @param {string} id - The library measure id.
   * @param {qix.NxMeasure=} defaults - Default properties for the measure.
   * @returns {qix.NxMeasure} The created measure object.
   * @description Initializes a library measure with default properties.
   * @memberof DataPropertyHandler
   * @example
   * const meas = handler.createLibraryMeasure('measId', { qDef: { ... } });
   */
  createLibraryMeasure(id, defaults) {
    const measure = extend(true, {}, this.measureProperties || {}, defaults || {});
    measure.qDef = measure.qDef ?? {};
    measure.qDef.qNumFormat = measure.qDef.qNumFormat ?? {};

    measure.qLibraryId = id;
    measure.qDef.autoSort = true;

    delete measure.qDef.qDef;
    delete measure.qDef.qLabel;

    return measure;
  }

  /**
   * Adds a library measure to the handler.
   * @param {string} id - The library measure id.
   * @param {qix.NxMeasure=} defaults - Default properties for the measure.
   * @returns {Promise<qix.NxMeasure=>} The result of addMeasure.
   * @description Creates and adds a library measure.
   * @memberof DataPropertyHandler
   * @example
   * handler.addLibraryMeasure('measId', { qDef: { ... } });
   */
  addLibraryMeasure(id, defaults) {
    const measure = this.createLibraryMeasure(id, defaults);
    return this.addMeasure(measure);
  }

  /**
   * Adds multiple library measures to the handler.
   * @param {LibraryMeasures[]} args - Array of library measure args.
   * @returns {Promise<qix.NxMeasure[]>} The result of addMeasures.
   * @description Creates and adds multiple library measures.
   * @memberof DataPropertyHandler
   * @example
   * handler.addLibraryMeasures([{ id: 'A' }, { id: 'B', defaults: { qDef: { ... } } }]);
   */
  addLibraryMeasures(args) {
    const measures = args.map(({ id, defaults }) => this.createLibraryMeasure(id, defaults));
    return this.addMeasures(measures);
  }

  /**
   * Adds multiple alternative library measures to the handler.
   * @param {LibraryMeasures[]} args - Array of library measure args.
   * @returns {Promise<qix.NxMeasure[]>} The result of addMeasures.
   * @description Creates and adds multiple alternative library measures.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAltLibraryMeasures([{ id: 'A' }, { id: 'B' }]);
   */
  addAltLibraryMeasures(args) {
    const measures = args.map(({ id }) => this.createLibraryMeasure(id));
    return this.addMeasures(measures, true);
  }

  /**
   * Adds multiple alternative expression measures to the handler.
   * @param {ExpressionMeasures[]} args - Array of expression measure args.
   * @returns {Promise<qix.NxMeasure[]>} The result of addMeasures.
   * @description Creates and adds multiple alternative expression measures.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAltExpressionMeasures([{ expression: 'Sum(A)' }, { expression: 'Sum(B)' }]);
   */
  addAltExpressionMeasures(args) {
    const measures = args.map(({ expression }) => this.createExpressionMeasure(expression));
    return this.addMeasures(measures, true);
  }

  /**
   * Adds an alternative expression measure to the handler.
   * @param {string} expression - The expression for the measure.
   * @param {string=} label - The label for the measure.
   * @param {qix.NxMeasure=} defaults - Default properties for the measure.
   * @returns {Promise<qix.NxMeasure=>} The result of addMeasure.
   * @description Creates and adds an alternative expression measure.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAlternativeExpressionMeasure('Sum(Sales)', 'Total Sales');
   */
  addAlternativeExpressionMeasure(expression, label, defaults) {
    const measure = this.createExpressionMeasure(expression, label, defaults);
    return this.addMeasure(measure, true);
  }

  /**
   * Adds an alternative library measure to the handler.
   * @param {string} id - The library measure id.
   * @param {qix.NxMeasure=} defaults - Default properties for the measure.
   * @returns {qix.NxMeasure=} The result of addMeasure.
   * @description Creates and adds an alternative library measure.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAlternativeLibraryMeasure('measId', { qDef: { ... } });
   */
  addAlternativeLibraryMeasure(id, defaults) {
    const measure = this.createLibraryMeasure(id, defaults);
    return this.addMeasure(measure, true);
  }

  /**
   * Gets the minimum number of measures allowed.
   * @returns {number} The minimum number of measures.
   * @description Returns the minimum number of measures allowed by the handler.
   * @memberof DataPropertyHandler
   * @example
   * const min = handler.minMeasures();
   */
  minMeasures() {
    if (typeof this.measureDefinition.min === 'function') {
      return this.measureDefinition.min.call(null, this.properties, this);
    }
    return this.measureDefinition.min || 0;
  }

  /**
   * Gets the maximum number of measures allowed.
   * @param {number} [decrement=0] - The number to decrement from the current number of measures.
   * @returns {number} The maximum number of measures allowed.
   * @description Checks if the max property is a function and calls it with the current number of measures, or returns a default value.
   * @memberof DataPropertyHandler
   * @example
   * const max = handler.maxMeasures();
   */
  maxMeasures(decrement = 0) {
    if (typeof this.measureDefinition.max === 'function') {
      const dimLength = this.getDimensions().length - decrement;
      const measureParams = [dimLength];
      return this.measureDefinition.max.apply(null, measureParams);
    }
    return Number.isNaN(+this.measureDefinition.max) ? 10000 : this.measureDefinition.max;
  }

  /**
   * Checks if a new measure can be added.
   * @returns {boolean} True if a new measure can be added, false otherwise.
   * @description Returns whether the handler can add another measure.
   * @memberof DataPropertyHandler
   * @example
   * if (handler.canAddMeasure()) { handler.addExpressionMeasure('Sum(A)'); }
   */
  canAddMeasure() {
    return this.getMeasures().length < this.maxMeasures();
  }

  // ---------------------------------------
  // ---------------OTHERS------------------
  // ---------------------------------------

  /**
   * Calls all global change listeners with the current properties, handler, and layout.
   * @param {object} layout - The layout object to pass to listeners.
   * @description Invokes all registered global change listeners.
   * @memberof DataPropertyHandler
   * @example
   * handler.updateGlobalChangeListeners(layoutObj);
   */
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
