/* eslint-disable no-underscore-dangle */
import extend from 'extend';
import { JSONPatch } from '@nebula.js/supernova';

const saveSoftProperties = (model, prevEffectiveProperties, effectiveProperties) => {
  if (!model) {
    return Promise.resolve();
  }

  let patches = JSONPatch.generate(prevEffectiveProperties, effectiveProperties);
  extend(true, prevEffectiveProperties, effectiveProperties);

  if (patches && patches.length) {
    patches = patches.map((p) => ({
      qOp: p.op,
      qValue: JSON.stringify(p.value),
      qPath: p.path,
    }));
    if (model.__snInterceptor) {
      return model.__snInterceptor.applyPatches.call(model, patches, true);
    }
    return model.applyPatches(patches, true);
  }
  return Promise.resolve();
};

export default saveSoftProperties;
