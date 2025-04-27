import addDimensionOrders from './add-dimension-orders';

export default function addMainDimension(self, dimension, index) {
  const dimensions = self.getDimensions();
  const idx = index ?? dimensions.length;

  if (idx && dimensions.length < self.maxDimensions()) {
    return addDimensionOrders(self, dimension, idx);
  }

  return Promise.resolve();
}
