import theme from './theme';

import light from './definitions/light';

const cache = {};

export default function (name) {
  if (name !== 'light') {
    throw new Error('No theme');
  }
  if (!cache[name]) {
    cache[name] = theme(light);
  }

  return cache[name];
}
