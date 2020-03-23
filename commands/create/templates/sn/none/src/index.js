import { useElement } from '@nebula.js/supernova';
import properties from './object-properties';
import data from './data';

export default function supernova() {
  return {
    qae: {
      properties,
      data,
    },
    component() {
      const element = useElement();
      element.innerHTML = '<div>Hello!</div>'; // eslint-disable-line
    },
  };
}
