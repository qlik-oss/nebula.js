import extend from 'extend';
import { findFieldById, initializeDim, useMasterNumberFormat } from './utils/field-helper/field-utils';
import { INITIAL_SORT_CRITERIAS } from './utils/constants';
import { notSupportedError } from './utils/hypercube-helper/hypercube-utils';

/**
 
 * @class DataPropertyHandler
 * @description A class to handle data properties for dimensions and measures in a data model.
 * @param {object} opts - Parameters to add a hypercube handlers
 * @param {qix.Doc} opts.app
 * @param {object} opts.dimensionDefinition
 * @param {object} opts.measureDefinition
 * @param {object} opts.dimensionProperties
 * @param {object} opts.measureProperties
 * @param {object} opts.globalChangeListeners
 * @entry
 * @export
 * @example
 * import DataPropertyHandler from '@nebula.js/stardust';
 *
 * class PivotHyperCubeHandler extends DataPropertyHandler {
 *
 *   addDimensionAsFirstRow: (hypercube: HyperCubeDef, dimension: NxDimension) => {
 *     const dimensions = this.getDimensions().length;
 *     const { qInterColumnSortOrder } = hypercube;
 *
 *     if(dimensions !== 0 && dimensions < this.maxDimensions()) {
 *       hypercube.qNoOfLeftDims = 1;
 *       qInterColumnSortOrder?.unshift(dimensions);
 *       dimensions.splice(0, 0, dimension);
 *     }
 *   }
 * }
 */
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

  /**
   * @export
   * @interface LibraryDimension
   * @property {string} id
   * @property {qix.NxDimension=} defaults
   */

  /**
   * @export
   * @interface FieldDimension
   * @property {string} field
   * @property {string=} label
   * @property {qix.NxDimension=} defaults
   */

  /**
   * @export
   * @interface LibraryMeasure
   * @property {string} id
   * @property {qix.NxMeasure=} defaults
   */

  /**
   * @export
   * @interface ExpressionMeasure
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
  // eslint-disable-next-line class-methods-use-this
  type() {
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
  // eslint-disable-next-line class-methods-use-this
  getDimensions() {
    return [];
  }

  /**
   * Gets a dimension by id from dimensions or alternative dimensions.
   
   * @param {LibraryDimension} libraryDimension
   * @returns {qix.NxDimension} - The found dimension.
   * @description Searches for a dimension by id in both main and alternative dimensions.
   * @memberof DataPropertyHandler
   * @example
   * const dim = handler.getDimension({ id: 'dimId' });
   */
  getDimension(libraryDimension) {
    const dimensions = this.getDimensions();
    const alternativeDimensions = this.getAlternativeDimensions();

    return findFieldById(dimensions, libraryDimension.id) ?? findFieldById(alternativeDimensions, libraryDimension.id);
  }

  /**
   * Throws an error indicating the method must be implemented in subclasses.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  getAlternativeDimensions() {
    throw new Error('Method not implemented.');
  }

  /**
   * Throws an error indicating addDimension is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  addDimension() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating addDimensions is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  addDimensions() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating removeDimension is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  removeDimension() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating removeDimensions is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  removeDimensions() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating autoSortDimension is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  autoSortDimension() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating replaceDimension is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  replaceDimension() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating getSorting is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  getSorting() {
    throw notSupportedError;
  }

  /**
   * Creates a type of library dimension with a field definition.
   
   * @param {LibraryDimension} libraryDimension
   * @returns {qix.NxDimension} The created dimension object.
   * @description Initializes a dimension and applying default properties and sort criteria.
   * @memberof DataPropertyHandler
   * @example
   * const dim = handler.createLibraryDimension({ id:'dimId', { qDef: { cId: 'dim1' } }});
   */
  createLibraryDimension(libraryDimension) {
    let dimension = extend(true, {}, this.dimensionProperties || {}, libraryDimension.defaults || {});

    dimension = initializeDim(dimension);

    dimension.qLibraryId = libraryDimension.id;
    dimension.qDef.autoSort = true;
    dimension.qDef.qSortCriterias = INITIAL_SORT_CRITERIAS;

    delete dimension.qDef.qFieldDefs;
    delete dimension.qDef.qFieldLabels;

    return dimension;
  }

  /**
   * Creates a type of field dimension with a field definition.
   
   * @param {FieldDimension} fieldDimension
   * @returns {qix.NxDimension} The created dimension object.
   * @description Initializes a dimension with field definitions, labels, and default properties.
   * @memberof DataPropertyHandler
   * @example
   * handler.createFieldDimension({field: 'currentField', label: 'label'});
   */
  createFieldDimension(fieldDimension) {
    let dimension = extend(true, {}, this.dimensionProperties || {}, fieldDimension.defaults || {});

    dimension = initializeDim(dimension);

    if (!fieldDimension.field) {
      dimension.qDef.qFieldDefs = [];
      dimension.qDef.qFieldLabels = [];
      dimension.qDef.qSortCriterias = [];
    }

    dimension.qDef.qFieldDefs = [fieldDimension.field];
    dimension.qDef.qFieldLabels = fieldDimension.label ? [fieldDimension.label] : [''];
    dimension.qDef.qSortCriterias = INITIAL_SORT_CRITERIAS;
    dimension.qDef.autoSort = true;

    return dimension;
  }

  /**
   * Adds a field dimension to the handler.
   
   * @param {FieldDimension} fieldDimension
   * @returns {Promise<qix.NxDimension=>} The result of addDimension.
   * @description Creates and adds a field dimension.
   * @memberof DataPropertyHandler
   * @example
   * handler.addFieldDimension({field: 'currentField', label: 'label'});
   */
  addFieldDimension(fieldDimension) {
    const dimension = this.createFieldDimension(fieldDimension);
    return this.addDimension(dimension);
  }

  /**
   
   * @param {FieldDimension[]} fieldDimensions - Array of field dimension.
   * @returns {Promise<qix.NxDimension[]>} The result of addDimensions.
   * @description Creates and adds multiple field dimensions.
   * @memberof DataPropertyHandler
   * @example
   * handler.addFieldDimensions([{ field: 'A', label: 'AA' }, { field: 'B', label: 'BB' }]);
   */
  addFieldDimensions(fieldDimensions) {
    const dimensions = fieldDimensions.map((fieldDimension) => this.createFieldDimension(fieldDimension));
    return this.addDimensions(dimensions);
  }

  /**
   * Adds a library dimension to the handler.
   
   * @param {LibraryDimension} libraryDimension
   * @returns {Promise<qix.NxDimension=>} The result of addDimension.
   * @description Creates and adds a library dimension.
   * @memberof DataPropertyHandler
   * @example
   * handler.addLibraryDimension({ id: 'A'});
   */
  addLibraryDimension(libraryDimension) {
    const dimension = this.createLibraryDimension(libraryDimension);
    return this.addDimension(dimension);
  }

  /**
   * Adds multiple library dimensions to the handler.
   
   * @param {LibraryDimension[]} libraryDimensions - Array of library dimension.
   * @returns {Promise<qix.NxDimension[]>} The result of addDimensions.
   * @description Creates and adds multiple library dimensions.
   * @memberof DataPropertyHandler
   * @example
   * handler.addLibraryDimensions([{ id: 'A' }, { id: 'B', defaults: { ... } }]);
   */
  addLibraryDimensions(libraryDimensions) {
    const dimensions = libraryDimensions.map((libraryDimension) => this.createLibraryDimension(libraryDimension));
    const result = this.addDimensions(dimensions);
    return result;
  }

  /**
   * Adds multiple alternative library dimensions to the handler.
   
   * @param {LibraryDimension[]} libraryDimensions - Array of library dimension.
   * @returns {Promise<qix.NxDimension[]>} The result of addDimensions.
   * @description Creates and adds multiple alternative library dimensions.
   * @memberof DataPropertyHandler
   * @example
   * await handler.addAltLibraryDimensions([{ id: 'A' }, { id: 'B', defaults: { ... } }]);
   */
  async addAltLibraryDimensions(libraryDimensions) {
    const dimensions = libraryDimensions.map((libraryDimension) => this.createLibraryDimension(libraryDimension));
    return this.addDimensions(dimensions, true);
  }

  /**
   * Adds multiple alternative field dimensions to the handler.
   
   * @param {FieldDimension[]} fieldDimensions - Array of field dimension.
   * @returns {Promise<qix.NxDimension[]>} The result of addDimensions.
   * @description Creates and adds multiple alternative field dimensions.
   * @memberof DataPropertyHandler
   * @example
   * await handler.addAltFieldDimensions([{ field: 'A', label: 'Label A' }, { field: 'B', label: 'Label B' }]);
   */
  async addAltFieldDimensions(fieldDimensions) {
    const dimensions = fieldDimensions.map((fieldDimension) => this.createFieldDimension(fieldDimension));
    return this.addDimensions(dimensions, true);
  }

  /**
   * Adds an alternative field dimension to the handler.
   
   * @param {FieldDimension} fieldDimension
   * @returns {Promise<qix.NxDimension=>} The result of addDimension.
   * @description Creates and adds an alternative field dimension.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAlternativeFieldDimension({ field: 'A', label: 'Label A' });
   */
  addAlternativeFieldDimension(fieldDimension) {
    const dimension = this.createFieldDimension(fieldDimension);
    return this.addDimension(dimension, true);
  }

  /**
   * Adds an alternative library dimension to the handler.
   
   * @param {LibraryDimension} libraryDimension
   * @returns {Promise<qix.NxDimension=>} The result of addDimension.
   * @description Creates and adds an alternative library dimension.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAlternativeLibraryDimension([{ id: 'A' }, { id: 'B', defaults: { ... } }]);
   */
  addAlternativeLibraryDimension(libraryDimension) {
    const dimension = this.createLibraryDimension(libraryDimension);
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
   
   * @param {number} [decrement=0] - The number to decrement from the current number of measures.
   * @returns {number} The maximum number of dimensions allowed.
   * @description Checks if the max property is a function and calls it with the current number of measures, or returns a default value.
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
  // eslint-disable-next-line class-methods-use-this
  getMeasures() {
    return [];
  }

  /**
   * Throws an error indicating the method must be implemented in subclasses.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  getAlternativeMeasures() {
    throw new Error('Method not implemented.');
  }

  /**
   * Throws an error indicating addMeasure is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  addMeasure() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating addMeasures is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  addMeasures() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating removeMeasure is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  removeMeasure() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating removeMeasures is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  removeMeasures() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating autoSortMeasure is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  autoSortMeasure() {
    throw notSupportedError;
  }

  /**
   * Throws an error indicating replaceMeasure is not supported in the base class.
   
   * @throws {Error}
   * @memberof DataPropertyHandler
   */
  // eslint-disable-next-line class-methods-use-this
  replaceMeasure() {
    throw notSupportedError;
  }

  /**
   * Gets a measure by id from measures or alternative measures.
   
   * @param {string} libraryDimension - The measure id to find.
   * @returns {qix.NxMeasure} The found measure or undefined.
   * @description Searches for a measure by id in both main and alternative measures.
   * @memberof DataPropertyHandler
   * @example
   * const measure = handler.getMeasure('measId');
   */
  getMeasure(libraryDimension) {
    const measures = this.getMeasures();
    const alternativeMeasures = this.getAlternativeMeasures();

    return findFieldById(measures, libraryDimension.id) ?? findFieldById(alternativeMeasures, libraryDimension.id);
  }

  /**
   * Creates an expression measure.
   
   * @param {ExpressionMeasure} expressionMeasure
   * @returns {Promise<qix.NxMeasure=>} The created measure object.
   * @description Initializes a measure with an expression, label, and default properties.
   * @memberof DataPropertyHandler
   * @example
   * const meas = handler.createExpressionMeasure({ expression: 'Sum(Sales)', label: 'Total Sales' });
   */
  createExpressionMeasure(expressionMeasure) {
    const measure = extend(true, {}, this.measureProperties || {}, expressionMeasure.defaults || {});

    measure.qDef = measure.qDef ?? {};
    measure.qDef.qNumFormat = measure.qDef.qNumFormat ?? {};

    measure.qDef.qDef = expressionMeasure.expression;
    measure.qDef.qLabel = expressionMeasure.label;
    measure.qDef.autoSort = true;

    return measure;
  }

  /**
   * Adds an expression measure to the handler.
   
   * @param {ExpressionMeasure} expressionMeasure
   * @returns {Promise<qix.NxMeasure=>} The result of addMeasure.
   * @description Creates and adds an expression measure.
   * @memberof DataPropertyHandler
   * @example
   * handler.addExpressionMeasure({ expression: 'Sum(Sales)', label: 'Total Sales' });
   */
  addExpressionMeasure(expressionMeasure) {
    const measure = this.createExpressionMeasure(expressionMeasure);
    return this.addMeasure(measure);
  }

  /**
   * Adds multiple expression measures to the handler.
   
   * @param {ExpressionMeasure[]} expressionMeasures - Array of expression measure.
   * @returns {Promise<qix.NxMeasure[]>} The result of addMeasures.
   * @description Creates and adds multiple expression measures.
   * @memberof DataPropertyHandler
   * @example
   * handler.addExpressionMeasures([{ expression: 'Sum(A)' }, { expression: 'Sum(B)', label: 'B' }]);
   */
  addExpressionMeasures(expressionMeasures) {
    const measures = expressionMeasures.map((expressionMeasure) => this.createExpressionMeasure(expressionMeasure));
    return this.addMeasures(measures);
  }

  /**
   * Creates a library measure.
   
   * @param {LibraryMeasure} libraryMeasure
   * @returns {qix.NxMeasure} The created measure object.
   * @description Initializes a library measure with default properties.
   * @memberof DataPropertyHandler
   * @example
   * const meas = handler.createLibraryMeasure({ id: 'measId', defaults: { qDef: { ... } } });
   */
  createLibraryMeasure(libraryMeasure) {
    const measure = extend(true, {}, this.measureProperties || {}, libraryMeasure.defaults || {});

    measure.qDef = measure.qDef ?? {};
    measure.qDef.qNumFormat = measure.qDef.qNumFormat ?? {};

    useMasterNumberFormat(measure.qDef);

    measure.qLibraryId = libraryMeasure.id;
    measure.qDef.autoSort = true;

    delete measure.qDef.qDef;
    delete measure.qDef.qLabel;

    return measure;
  }

  /**
   * Adds a library measure to the handler.
   
   * @param {LibraryMeasure} libraryMeasure
   * @returns {Promise<qix.NxMeasure=>} The result of addMeasure.
   * @description Creates and adds a library measure.
   * @memberof DataPropertyHandler
   * @example
   * handler.addLibraryMeasure({ id: 'measId', defaults: { qDef: { ... } } });
   */
  addLibraryMeasure(libraryMeasure) {
    const measure = this.createLibraryMeasure(libraryMeasure);
    return this.addMeasure(measure);
  }

  /**
   * Adds multiple library measures to the handler.
   
   * @param {LibraryMeasure[]} libraryMeasures - Array of library measure.
   * @returns {Promise<qix.NxMeasure[]>} The result of addMeasures.
   * @description Creates and adds multiple library measures.
   * @memberof DataPropertyHandler
   * @example
   * handler.addLibraryMeasures([{ id: 'A' }, { id: 'B', defaults: { qDef: { ... } } }]);
   */
  addLibraryMeasures(libraryMeasures) {
    const measures = libraryMeasures.map((libraryMeasure) => this.createLibraryMeasure(libraryMeasure));
    return this.addMeasures(measures);
  }

  /**
   * Adds multiple alternative library measures to the handler.
   
   * @param {LibraryMeasure[]} libraryMeasures - Array of library measure.
   * @returns {Promise<qix.NxMeasure[]>} The result of addMeasures.
   * @description Creates and adds multiple alternative library measures.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAltLibraryMeasures([{ id: 'A' }, { id: 'B' }]);
   */
  addAltLibraryMeasures(libraryMeasures) {
    const measures = libraryMeasures.map((libraryMeasure) => this.createLibraryMeasure(libraryMeasure));
    return this.addMeasures(measures, true);
  }

  /**
   * Adds multiple alternative expression measures to the handler.
   
   * @param {ExpressionMeasure[]} expressionMeasures - Array of expression measure.
   * @returns {Promise<qix.NxMeasure[]>} The result of addMeasures.
   * @description Creates and adds multiple alternative expression measures.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAltExpressionMeasures([{ expression: 'Sum(A)' }, { expression: 'Sum(B)' }]);
   */
  addAltExpressionMeasures(libraryMeasures) {
    const measures = libraryMeasures.map((expressionMeasure) => this.createExpressionMeasure(expressionMeasure));
    return this.addMeasures(measures, true);
  }

  /**
   * Adds an alternative expression measure to the handler.
   
   * @param {ExpressionMeasure} expressionMeasure
   * @returns {Promise<qix.NxMeasure=>} The result of addMeasure.
   * @description Creates and adds an alternative expression measure.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAlternativeExpressionMeasure({ expression: 'Sum(Sales)', label: 'Total Sales'});
   */
  addAlternativeExpressionMeasure(expressionMeasure) {
    const measure = this.createExpressionMeasure(expressionMeasure);
    return this.addMeasure(measure, true);
  }

  /**
   * Adds an alternative library measure to the handler.
   
   * @param {LibraryMeasure} libraryMeasure
   * @returns {qix.NxMeasure=} The result of addMeasure.
   * @description Creates and adds an alternative library measure.
   * @memberof DataPropertyHandler
   * @example
   * handler.addAlternativeLibraryMeasure({ id: 'measId', defaults: { qDef: { ... } } });
   */
  addAlternativeLibraryMeasure(libraryMeasure) {
    const measure = this.createLibraryMeasure(libraryMeasure);
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
   
   * @param {number} [decrement=0] - The number to decrement from the current number of dimensions.
   * @returns {number} The maximum number of measures allowed.
   * @description Checks if the max property is a function and calls it with the current number of dimensions, or returns a default value.
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
