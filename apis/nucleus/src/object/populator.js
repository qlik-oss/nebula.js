import hcHandler from './hc-handler';
import loHandler from './lo-handler';
import filterpaneHandler from './filterpane-handler';

function getCreateHandler(propertyPath) {
  if (propertyPath.match('/qListObjectDef')) {
    return loHandler;
  }
  if (propertyPath.match('/qChildListDef')) {
    return filterpaneHandler;
  }
  return hcHandler;
}

/**
 * @interface LibraryField
 * @property {string} qLibraryId
 * @property {'dimension'|'measure'} type
 */

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

export default async function populateData({ sn, properties, fields, children }, halo) {
  if (!fields.length) {
    return;
  }
  const target = sn.qae.data.targets[0];
  if (!target) {
    if (__NEBULA_DEV__) {
      console.warn('Attempting to add fields to an object without a specified data target'); // eslint-disable-line no-console
    }
    return;
  }
  const { propertyPath } = target;

  const parts = propertyPath.split('/');
  let p = properties;
  for (let i = 0; i < parts.length; i++) {
    const s = parts[i];
    p = s ? p[s] : p;
  }

  const createHandler = getCreateHandler(propertyPath);

  const handler = createHandler({
    dc: p,
    def: target,
    properties,
    children,
    halo,
  });

  for (let i = 0; i < fields.length; ++i) {
    const f = fields[i];
    const type = fieldType(f);

    if (type === 'measure') {
      // eslint-disable-next-line no-await-in-loop
      await handler.addMeasure(f);
    } else {
      // eslint-disable-next-line no-await-in-loop
      await handler.addDimension(f);
    }
  }
}
