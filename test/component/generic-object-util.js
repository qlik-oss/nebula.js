/* eslint-disable import/prefer-default-export */
export function createGenericObject(visualization, config = {}) {
  return {
    ...config,
    getLayout: {
      qInfo: { qId: +Date.now() },
      visualization,
      ...(typeof config.getLayout === 'function' ? config.getLayout() : config.getLayout),
    },
  };
}
