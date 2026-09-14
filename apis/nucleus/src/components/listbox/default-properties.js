/**
 * see: https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FValueExpression
 * @name ValueExpression
 * @type object
 * @property {string} qValueExpression.qExpr
 */

/**
 * Extends `ListObjectDef`, see Engine API: `ListObjectDef`.
 * @interface ListObjectDef
 * @extends qix.ListObjectDef
 * @property {boolean} [frequencyEnabled=false] Show frequency count. also requires qListObjectDef.qFrequencyMode to be set
 */

/**
 * Representation settings for the dimension values, set on the listbox object root `representation`
 * (a sibling of `qListObjectDef`, alongside `layoutOptions`).
 *
 * Notes on image representation:
 * -   * When `type` is `'image'` the values are rendered as images. Image metadata is resolved from
 * list-object expressions (`qListObjectDef.qExpressions`) using their `qLabel` keys.
 *
 * @interface Representation
 * @property {('text'|'image')} [type='text'] How the dimension values are presented.
 * @property {ValueExpression} [imageUrl] Per-value image URL expression. Only used when `type` is 'image' and `imageSetting` is 'url'. Stored in qExpressions with qLabel='imageUrl'.
 * @property {ValueExpression} [imageLabel] Per-value image label expression. Only used when `type` is 'image' and `imageSetting` is 'label'. Stored in qExpressions with qLabel='imageLabel'.
 * @property {('url'|'label')} [imageSetting='label'] When `type` is 'image', choose whether the
 *   per-value expression (qExpressions.qLabel='imageUrl'/'imageLabel') provides the image URL
 *   (`'url'`) or the image label (`'label'`).
 * @property {('alwaysFit'|'fitWidth'|'fitHeight'|'stretch'|'alwaysFill')} [imageSize='alwaysFit'] Image sizing mode. Only used when `type` is 'image'.
 * @property {string} [imagePosition='topCenter'] Image position within the cell. Only used when `type` is 'image' and `imageSize` is not 'stretch'.
 * @property {string} [titlePosition='top-center'] Overlay text alignment as `{vertical}-{horizontal}` (e.g. 'top-left', 'center-center', 'bottom-right'). Only used when `type` is 'image'.
 *  @property {boolean} [textOverlay=true] Whether to render the title/subtitle overlay text. Only used when `type` is 'image'.
 * @property {boolean} [titleBackground=true] Draw a background behind the title text for legibility. Only used when `type` is 'image'.
 * @property {number} [gridGap=0.5] Spacing between image grid cells, as a percentage of the grid width. Only used when `type` is 'image'.
 * @property {number} [cornerRadius=4] Corner radius of the image cell in pixels. Only used when `type` is 'image'.
 * @property {number} [borderWidth=0] Cell border width in px. Only used when `type` is 'image'.
 * @property {string} [borderColor='#d9d9d9'] Cell border color. Only used when `type` is 'image' and `borderWidth` > 0.
 * @property {('single'|'expression')} [cellBgColorMode='single'] Cell background color mode. Only used when `type` is 'image'.
 * @property {(string|object|ValueExpression)} [cellBgColor] Cell background color (hex string or color object when cellBgColorMode='single') or expression (when cellBgColorMode='expression'). Only used when `type` is 'image'.
 * @property {ValueExpression} [subtitle] Per-value subtitle expression. Only used when `type` is 'image' and `textOverlay` is not false.
 * @property {ValueExpression} [tooltip] Per-value tooltip expression. Only used when `type` is 'image'.
 * @property {boolean} [showSelected=true] When `type` is 'image', show only selected values once a selection is applied (while selecting, all values stay visible). Set to false to keep unselected values visible.
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
   * Enables search.
   * @type {boolean=}
   * @default
   */
  searchEnabled: true,
  /**
   * Show title.
   * @type {boolean=}
   * @default
   */
  showTitle: true,
  /**
   * Pre-fill search input field with wildcard characters.
   * @type {boolean=}
   * @default
   */
  wildCardSearch: false,
  /**
   * Automatically confirm selections when clicking outside a listbox, without showing the selections toolbar.
   * @type {boolean=}
   * @default
   */
  autoConfirm: false,
  /**
   * Layout settings.
   * @type {object=}
   */
  layoutOptions: {
    /**
     * Dense mode.
     * @type {boolean=}
     * @default
     */
    dense: false,
    /**
     * Layout mode.
     * @type {('singleColumn' | 'grid')=}
     * @default
     */
    dataLayout: 'singleColumn',
    /**
     * Layout order.
     * Only used when dataLayout is 'grid'
     * @type {('row' | 'column')=}
     * @default
     */
    layoutOrder: 'row',
    /**
     * Max visible columns.
     * Only used when dataLayout is 'grid'
     * and layoutOrder is 'row'
     * @type {object=}
     */
    maxVisibleColumns: {
      /**
       * Automatically fit as many columns as possible.
       * Only used when dataLayout is 'grid'
       * and layoutOrder is 'row'
       * @type {boolean=}
       * @default
       */
      auto: true,
      /**
       * Fixed number of max visible columns.
       * Only used when dataLayout is 'grid'
       * layoutOrder is 'row'
       * and auto is false
       * @type {number=}
       * @default
       */
      maxColumns: 3,
    },
    /**
     * Max visible rows.
     * Only used when dataLayout is 'grid'
     * and layoutOrder is 'column'
     * @type {object=}
     */
    maxVisibleRows: {
      /**
       * Automatically fits as many rows as possible.
       * Only used when dataLayout is 'grid'
       * and layoutOrder is 'column'
       * @type {boolean=}
       * @default
       */
      auto: true,
      /**
       * Fixed number of max visible rows.
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
   * Representation settings for the dimension values.
   * @type {Representation}
   */
  representation: {
    /**
     * How the dimension values are presented.
     * @type {('text'|'image')=}
     * @default
     */
    type: 'text',
    /**
     * Per-value image URL expression. Only used when `type` is 'image' and `imageSetting` is 'url'.
     * Stored in qListObjectDef.qExpressions with qLabel='imageUrl'.
     * @type {ValueExpression=}
     */
    imageUrl: '',
    /**
     * Per-value image label expression. Only used when `type` is 'image' and `imageSetting` is 'label'.
     * Stored in qListObjectDef.qExpressions with qLabel='imageLabel'.
     * @type {ValueExpression=}
     */
    imageLabel: '',
    /**
     * When `type` is 'image', choose whether the per-value expression provides the image URL or label.
     * @type {('url'|'label')=}
     * @default
     */
    imageSetting: 'label',
    /**
     * Image sizing mode. Only used when `type` is 'image'.
     * @type {('alwaysFit'|'fitWidth'|'fitHeight'|'stretch'|'alwaysFill')=}
     * @default
     */
    imageSize: 'alwaysFit',
    /**
     * Image position within the cell. Only used when `type` is 'image' and `imageSize` is not 'stretch'.
     * @type {string=}
     * @default
     */
    imagePosition: 'top-center',
    /**
     * Overlay text alignment as `{vertical}-{horizontal}`. Only used when `type` is 'image'.
     * @type {string=}
     * @default
     */
    titlePosition: 'top-center',
    /**
     * Whether to render the title/subtitle overlay text. Only used when `type` is 'image'.
     * @type {boolean=}
     * @default
     */
    textOverlay: true,
    /**
     * Draw a background behind the title text for legibility. Only used when `type` is 'image'.
     * @type {boolean=}
     * @default
     */
    titleBackground: true,
    /**
     * Spacing between image grid cells, as a percentage of the grid width. Only used when `type` is 'image'.
     * @type {number=}
     * @default
     */
    gridGap: 0.5,
    /**
     * Corner radius of the image cell in pixels. Only used when `type` is 'image'.
     * @type {number=}
     * @default
     */
    cornerRadius: 4,
    /**
     * Cell border width in px. Only used when `type` is 'image'.
     * @type {number=}
     * @default
     */
    borderWidth: 0,
    /**
     * Cell border color. Only used when `type` is 'image' and `borderWidth` > 0.
     * @type {string=}
     * @default
     */
    borderColor: '#d9d9d9',
    /**
     * Cell background color mode: 'single' for a fixed color, 'expression' for per-value expression. Only used when `type` is 'image'.
     * @type {('single'|'expression')=}
     * @default
     */
    cellBgColorMode: 'single',
    /**
     * Cell background color (when cellBgColorMode is 'single') or expression (when 'expression'). Only used when `type` is 'image'.
     * @type {(string|object|ValueExpression)=}
     * @default
     */
    cellBgColor: '#ffffff',
    /**
     * Per-value subtitle expression. Only used when `type` is 'image' and `textOverlay` is not false.
     * @type {ValueExpression=}
     */
    subtitle: '',
    /**
     * Per-value tooltip expression. Only used when `type` is 'image'.
     * @type {ValueExpression=}
     */
    tooltip: '',
    /**
     * When `type` is 'image', show only selected values once a selection is applied.
     * @type {boolean=}
     * @default
     */
    showSelected: true,
  },
  /**
   * Listbox title
   * @type {string=}
   * @default
   */
  title: '',
};
export default listdef;
