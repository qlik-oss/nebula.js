
const nxDimension = f => ({
  qDef: {
    qFieldDefs: [f],
    qSortCriterias: [{
      qSortByLoadOrder: 1,
      qSortByNumeric: 1,
      qSortByAscii: 1,
    }],
  },
  qOtherTotalSpec: {},
});

const nxMeasure = f => ({
  qDef: {
    qDef: f,
  },
  qSortBy: {
    qSortByLoadOrder: 1,
    qSortByNumeric: -1,
  },
});

export default function populateData({
  sn,
  properties,
  fields,
}) {
  const target = sn.qae.data.targets[0];
  if (!target) {
    return;
  }
  const { path } = target;

  const parts = path.split('/');
  let p = properties;
  for (let i = 0; i < parts.length; i++) {
    const s = parts[i];
    p = s ? p[s] : p;
  }

  const hc = p;

  hc.qInterColumnSortOrder = hc.qInterColumnSortOrder || [];
  fields.forEach((f, i) => {
    let type = 'dimension';
    if ((typeof f === 'string' && f[0] === '=')
      || (typeof f === 'object' && f.qDef.qDef)
      || (typeof f === 'object' && f.qLibraryId && f.qType === 'measure')) {
      type = 'measure';
    }

    hc.qInterColumnSortOrder.push(i);
    if (type === 'measure') {
      hc.qMeasures = hc.qMeasures || [];
      const def = nxMeasure(f);
      hc.qMeasures.push(def);
      target.measures.add.call(null, def, properties);
    } else {
      hc.qDimensions = hc.qDimensions || [];
      const def = nxDimension(f);
      hc.qDimensions.push(def);
      target.dimensions.add.call(null, def, properties);
    }
  });
}
