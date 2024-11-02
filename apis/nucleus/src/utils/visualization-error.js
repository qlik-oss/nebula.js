export default class VisualizationError extends Error {
  constructor(message, originalError) {
    super(message);
    this.originalError = originalError;
    this.name = 'VisualizationError';
  }
}
