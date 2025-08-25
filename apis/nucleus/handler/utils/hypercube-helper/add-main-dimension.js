import updateDimensionOrders from './update-dimension-orders';

function addMainDimension(self, dimension, index) {
  const dimensions = self.getDimensions();
  const idx = index ?? dimensions.length;

  if (dimensions.length < self.maxDimensions()) {
    return updateDimensionOrders(self, dimension, idx);
  }

  return Promise.resolve(dimension);
}

export default addMainDimension;
