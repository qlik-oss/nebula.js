import hcHandler from './hc-handler';

export default function populateData({ sn, properties, fields }, context) {
  const target = sn.qae.data.targets[0];
  if (!target) {
    context.logger.warn('Attempting to add fields to an object without a specified data target');
    return;
  }
  const { propertyPath } = target;

  const parts = propertyPath.split('/');
  let p = properties;
  for (let i = 0; i < parts.length; i++) {
    const s = parts[i];
    p = s ? p[s] : p;
  }

  const hc = hcHandler({
    hc: p,
    def: target,
  });

  fields.forEach(f => {
    let type = 'dimension';
    if (
      (typeof f === 'string' && f[0] === '=') ||
      (typeof f === 'object' && f.qDef.qDef) ||
      (typeof f === 'object' && f.qLibraryId && f.qType === 'measure')
    ) {
      type = 'measure';
    }

    if (type === 'measure') {
      hc.addMeasure(f);
    } else {
      hc.addDimension(f);
    }
  });
}
