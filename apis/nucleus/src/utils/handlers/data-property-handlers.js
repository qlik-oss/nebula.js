import { getFieldById } from './handlers-helpers';

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

  // ----------------DIMENSION----------------

  static getDimensions() {
    return [];
  }

  /**
   * @param {string} id
   * @returns dimension or alternative dimension array or null
   */
  getDimension(id) {
    const dimensions = this.getDimensions();
    const alternativeDimensions = this.getAlternativeDimensions();

    const dim = getFieldById(dimensions, id);
    const altDim = getFieldById(alternativeDimensions, id);

    return dim ?? altDim;
  }

  static getAlternativeDimensions() {
    throw new Error('Method not implemented.');
  }

  // ----------------MEASURE----------------

  /**
   * Get the measure by its ID from the given measures array.
   * @param {string} id
   * @returns measure or alternative measure array or null
   */
  getMeasure(id) {
    const measures = this.getMeasures();
    const alternativeMeasures = this.getAlternativeMeasures();

    const meas = getFieldById(measures, id);
    const altMeas = getFieldById(alternativeMeasures, id);

    return meas ?? altMeas;
  }

  static getMeasures() {
    return [];
  }

  static getAlternativeMeasures() {
    throw new Error('Method not implemented.');
  }
}

export default DataPropertyHandler;
