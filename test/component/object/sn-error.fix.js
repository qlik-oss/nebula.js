import { createGenericObject } from '../generic-object-util';

export default function fixture() {
  return {
    type: 'error-sn',
    sn() {
      throw new Error('hahaha');
    },
    genericObjects: [createGenericObject('error-sn')],
  };
}
