const translationKeys = new Map();
const extensions = [
  ['auto-chart', 'Object.AutoChart'],
  ['dummy-chart', 'Dummy'],
  ['barchart', 'Object.BarChart'],
  ['combochart', 'Object.ComboChart'],
  ['container', 'Object.Container'],
  ['distributionplot', 'Object.DistributionPlot'],
  ['boxplot', 'Object.BoxPlot'],
  ['filterpane', 'Object.FilterPane'],
  ['gauge', 'Object.Gauge'],
  ['histogram', 'Object.Histogram'],
  ['kpi', 'Object.Kpi'],
  ['linechart', 'Object.LineChart'],
  ['listbox', 'Object.Listbox'],
  ['piechart', 'Object.PieChart'],
  ['pivot-table', 'Object.PivotTable'],
  ['map', 'Object.Map'],
  ['scatterplot', 'Object.ScatterPlot'],
  ['sn-table', 'Object.StraightTable'],
  ['text-image', 'Object.TextImage'],
  ['treemap', 'Object.Treemap'],
  ['waterfallchart', 'Object.WaterfallChart'],
  ['mekkochart', 'Object.MekkoChart'],
  ['action-button', 'Object.ActionButton'],
  ['sn-nav-menu', 'Object.NavMenu'],
  ['bulletchart', 'Object.BulletChart'],
  ['sn-nlg-chart', 'Object.NlgChart'],
  ['sn-analysis-autochart', 'Common.AnalysisTypes'],
  ['sn-tabbed-container', 'Object.TabContainer'],
  ['qlik-sankey-chart-ext', 'Object.SankeyChart'],
  ['qlik-radar-chart', 'Object.RadarChart'],
  ['qlik-funnel-chart-ext', 'Object.FunnelChart'],
  ['sn-grid-chart', 'Object.GridChart'],
];
extensions.forEach(([key, value]) => {
  translationKeys.set(key, value);
});
export default translationKeys;
