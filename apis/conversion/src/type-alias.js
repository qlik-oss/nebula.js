const toSplitForm = {
  // Sense client names -> Theme
  barchart: ['bar', 'chart'],
  boxplot: ['box', 'plot'],
  bulletchart: ['bullet', 'chart'],
  // 'action-button': ['action','button'],
  combochart: ['combo', 'chart'],
  // container: ['container'],
  distributionplot: ['distribution', 'plot'],
  filterpane: ['filter', 'pane'],
  listbox: ['list', 'box'],
  // gauge:
  // histogram
  // kpi
  linechart: ['line', 'chart'],
  map: ['map', 'chart'],
  mapchart: ['map', 'chart'],
  mekkochart: ['mekko', 'chart'],
  piechart: ['pie', 'chart'],
  // 'pivot-table': ['pivot','table'],
  pivottable: ['pivot', 'table'],
  scatterplot: ['scatter', 'plot'],
  straightable: ['straight', 'table'],
  table: ['straight', 'table'],
  // 'text-image': ['text','Image'],
  treemap: ['treemap'],
  waterfallchart: ['waterfall', 'chart'],

  datacolors: ['data', 'colors'],
  referenceline: ['reference', 'line'],
};

function split(s) {
  if (s.indexOf('-') !== -1) {
    return s.split('-');
  }
  if (s.indexOf('_') !== -1) {
    return s.split('_');
  }

  const camelOrPascalSplit = s.match(/([A-Z]?[^A-Z]*)/g).slice(0, -1);
  if (camelOrPascalSplit.length > 1) {
    return camelOrPascalSplit;
  }
  return false;
}

export default function getMatch(type, list) {
  // Convert to known format
  const inLowerCase = type.toLowerCase();
  const inSplitForm = split(inLowerCase) || toSplitForm[inLowerCase];

  const possibleForms = [type];
  if (inSplitForm) {
    // Kebab-case
    possibleForms.push(inSplitForm.join('-'));
    // nocase
    possibleForms.push(inSplitForm.join(''));
    // camelCase
    possibleForms.push(inSplitForm.map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1))).join(''));
  } else {
    possibleForms.push(inLowerCase);
  }
  const target = possibleForms.find((s) => list.indexOf(s) !== -1);
  return target;
}
