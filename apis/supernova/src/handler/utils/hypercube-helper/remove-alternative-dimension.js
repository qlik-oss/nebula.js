function removeAlternativeDimension(self, index) {
  const [dimension] = self.getAlternativeDimensions().splice(index, 1);
  if (typeof self.dimensionDefinition.remove === 'function' && dimension) {
    dimension.isAlternative = true;

    return Promise.resolve(self.dimensionDefinition.remove.call(null, dimension, self.properties, self, index)).then(
      () => {
        delete dimension.isAlternative;
      }
    );
  }
  return undefined;
}

export default removeAlternativeDimension;
