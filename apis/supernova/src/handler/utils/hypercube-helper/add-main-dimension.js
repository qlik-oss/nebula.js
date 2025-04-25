import { insertMainDimension } from './hypercube-utils';

export default function addMainDimension(self, dimension, index) {
  const dimensions = self.getDimensions();
  const idx = index ?? dimensions.length;

  if (dimensions.length < self.maxDimensions()) {
    return insertMainDimension(self, dimension, dimensions, idx);
  }

  return Promise.resolve();
}
