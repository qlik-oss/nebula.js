import hcHandler from './hc-handler';

export function fieldType(f) {
  if (
    // a string starting with '=' is just a convention we use
    (typeof f === 'string' && f[0] === '=') ||
    // based on NxMeasure and NxInlineMeasureDef
    (typeof f === 'object' && f.qDef && f.qDef.qDef) ||
    // use 'type' instead of 'qType' since this is not a real property
    (typeof f === 'object' && f.qLibraryId && f.type === 'measure')
  ) {
    return 'measure';
  }
  return 'dimension';
}

export default function populateData({ sn, properties, fields }, context) {
  if (!fields.length) {
    return;
  }
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
    properties,
  });

  fields.forEach(f => {
    const type = fieldType(f);

    if (type === 'measure') {
      hc.addMeasure(f);
    } else {
      hc.addDimension(f);
    }
  });
}
