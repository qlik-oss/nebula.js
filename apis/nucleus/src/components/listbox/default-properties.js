/**
 * see: https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FValueExpression
 * @name ValueExpression
 * @type object
 * @property {string} qValueExpression.qExpr
 */

/**
 * Extends `ListObjectDef`, see Engine API: `ListObjectDef`.
 * @interface ListObjectDef
 * @extends EngineAPI.IListObjectDef
 * @property {boolean} [frequencyEnabled=false] Show frequency count. also requires qListObjectDef.qFrequencyMode to be set
 */

/**
 * @name ListboxProperties
 * @type object
 */

/**
 * @lends ListboxProperties
 */
const listdef = {
  qInfo: {
    qType: 'njsListbox',
  },
  /**
   * @type {ListObjectDef}
   */
  qListObjectDef: {
    qStateName: '',
    qShowAlternatives: true,
    frequencyEnabled: false,
    qFrequencyMode: 'N',
    qInitialDataFetch: [
      {
        qTop: 0,
        qLeft: 0,
        qWidth: 0,
        qHeight: 0,
      },
    ],
    qDef: {
      qSortCriterias: [
        {
          qSortByState: 1,
          qSortByAscii: 1,
          qSortByNumeric: 1,
          qSortByLoadOrder: 1,
        },
      ],
    },
  },
  /**
   * Show histogram bar.
   * also requires (qListObjectDef.qFrequencyMode 'V' and frequencyMax) or qListObjectDef.qFrequencyMode 'P'
   * @type {boolean=}
   * @default
   */
  histogram: false,
  /**
   * frequencyMax calculation
   * needed for histogram when not using qListObjectDef.qFrequencyMode: 'P'
   * use an expression in the form `Max(AGGR(Count([field]), [field]))` (when needed)
   * or 'fetch' that triggers an extra engine call but needed for library dimension that could change field when using the object
   * @type {('fetch' | ValueExpression)=}
   */
  frequencyMax: undefined,
  /**
   * Show values as checkboxes instead of as fields.
   * @type {boolean=}
   * @default
   */
  checkboxes: false,
  /**
   * enables search.
   * @type {boolean=}
   * @default
   */
  searchEnabled: true,
  /**
   * show title.
   * @type {boolean=}
   * @default
   */
  showTitle: true,
  /**
   * start search with wildcard search.
   * @type {boolean=}
   * @default
   */
  wildCardSearch: false,
  /**
   * layout settings.
   * @type {object=}
   */
  layoutOptions: {
    /**
     * dense mode.
     * @type {boolean=}
     * @default
     */
    dense: false,
    /**
     * layout mode.
     * @type {('singleColumn' | 'grid')=}
     * @default
     */
    dataLayout: 'singleColumn',
    /**
     * layout order.
     * Only used when dataLayout is 'grid'
     * @type {('row' | 'column')=}
     * @default
     */
    layoutOrder: 'row',
    /**
     * max visible columns.
     * Only used when dataLayout is 'grid'
     * and layoutOrder is 'row'
     * @type {object=}
     */
    maxVisibleColumns: {
      /**
       * auto max visible columns. (as many as it can fit)
       * Only used when dataLayout is 'grid'
       * and layoutOrder is 'row'
       * @type {boolean=}
       * @default
       */
      auto: true,
      /**
       * fixed number of max visible columns.
       * Only used when dataLayout is 'grid'
       * layoutOrder is 'row'
       * and auto is false
       * @type {number=}
       * @default
       */
      maxColumns: 3,
    },
    /**
     * max visible rows.
     * Only used when dataLayout is 'grid'
     * and layoutOrder is 'column'
     * @type {object=}
     */
    maxVisibleRows: {
      /**
       * auto max visible rows. (as many as it can fit)
       * Only used when dataLayout is 'grid'
       * and layoutOrder is 'column'
       * @type {boolean=}
       * @default
       */
      auto: true,
      /**
       * fixed number of max visible rows.
       * Only used when dataLayout is 'grid'
       * layoutOrder is 'column'
       * and auto is false
       * @type {number=}
       * @default
       */
      maxRows: 3,
    },
  },
  /**
   * listbox title
   * @type {string=}
   * @default
   */
  title: '',
};
export default listdef;
