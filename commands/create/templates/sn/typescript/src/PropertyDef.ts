/**
 * Chart Properties Interface
 *
 * This interface defines the structure of the chart's property panel.
 * Use JSDoc @default annotations to specify default values that will be
 * extracted by the spec command.
 */

/**
 * Main properties interface for the chart
 */
export interface ChartProperties {
  /** Version of the property definition schema */
  version: string;

  /**
   * Configuration for the hypercube data structure
   * @default { "qDimensions": [], "qMeasures": [], "qInitialDataFetch": [{ "qWidth": 2, "qHeight": 5000 }], "qSuppressZero": false, "qSuppressMissing": true }
   */
  qHyperCubeDef?: HyperCubeDef;

  /**
   * Whether to show titles on the chart
   * @default true
   */
  showTitles?: boolean;

  /**
   * Main chart title
   * @default ""
   */
  title?: string;

  /**
   * Chart subtitle
   * @default ""
   */
  subtitle?: string;

  /**
   * Chart footnote
   * @default ""
   */
  footnote?: string;

  /**
   * Color scheme for the chart
   * @default "auto"
   */
  color?: 'auto' | 'single' | 'byDimension';

  /**
   * Enable data point selection
   * @default true
   */
  enableSelection?: boolean;
}

/**
 * HyperCube definition structure
 */
export interface HyperCubeDef {
  qDimensions?: unknown[];
  qMeasures?: unknown[];
  qInitialDataFetch?: Array<{ qWidth: number; qHeight: number }>;
  qSuppressZero?: boolean;
  qSuppressMissing?: boolean;
}
