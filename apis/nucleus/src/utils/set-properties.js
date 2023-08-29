/* eslint-disable no-underscore-dangle */
const setProperties = (model, newProperties) => {
  if (model.__snInterceptor) {
    return model.__snInterceptor.setProperties.call(model, newProperties);
  }
  return model.setProperties(newProperties);
};

export default setProperties;
