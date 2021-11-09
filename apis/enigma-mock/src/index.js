import spy from './spy';

/**
 * Get value for a fixture property.
 *
 * The value is either static (e.g. pass a string / object / similar) or dynamic when passing a function.
 *
 * It falls back to the default value in case the fixture has no value specified.
 *
 * @param {any} value Fixture value. Either a static value (string / object / boolean / ...) or a function invoked when the value is needed.
 * @param {object} options Options.
 * @param {Array<any>} options.args Arguments used to invoke value function
 * @param {any} options.defaultValu Default value in case value in fixture is undefined.
 *
 * @returns The value.
 */
const getValue = (value, { args = [], defaultValue } = {}) => {
  if (typeof value === 'function') {
    return value(...args);
  }
  if (value !== undefined) {
    return value;
  }
  return defaultValue;
};

function GetObjectMock(fixture) {
  // TODO Add more validations
  if (!fixture.getLayout) {
    throw new Error('Fixture is missing "getLayout"');
  }

  return {
    id: getValue(fixture.id, { defaultValue: `object - ${+Date.now()}` }),
    on: () => {},
    once: () => {},
    getEffectiveProperties: (...args) =>
      Promise.resolve(getValue(fixture.getEffectiveProperties, { args, defaultValue: {} })),
    session: getValue(fixture.session, { defaultValue: true }),
    getLayout: (...args) => Promise.resolve(getValue(fixture.getLayout, args)),
    selectHyperCubeValues: (...args) =>
      Promise.resolve(getValue(fixture.selectHyperCubeValues, { args, defaultValue: true })),
    rangeSelectHyperCubeValues: (...args) =>
      Promise.resolve(getValue(fixture.rangeSelectHyperCubeValues, { args, defaultValue: true })),
    beginSelections: (...args) => Promise.resolve(getValue(fixture.beginSelections, { args, defaultValue: true })),
    resetMadeSelections: (...args) =>
      Promise.resolve(getValue(fixture.resetMadeSelections, { args, defaultValue: true })),
    getHyperCubeTreeData: (...args) =>
      Promise.resolve(getValue(fixture.getHyperCubeTreeData, { args, defaultValue: [] })),
    getHyperCubeData: (...args) => Promise.resolve(getValue(fixture.getHyperCubeData, { args, defaultValue: [] })),
    getHyperCubeReducedData: (...args) => Promise.resolve(getValue(fixture.getHyperCubeReducedData, { args })),
    getHyperCubeContinuousData: (...args) => Promise.resolve(getValue(fixture.getHyperCubeContinuousData, { args })),
    getHyperCubeStackData: (...args) => Promise.resolve(getValue(fixture.getHyperCubeStackData, { args })),
  };
}

export default (fixture) => {
  if (!fixture) {
    throw new Error('No "fixture" specified');
  }

  const getObjectMock = new GetObjectMock(fixture);

  const app = {
    id: `app - ${+Date.now()}`,
    session: {
      getObjectApi() {
        return Promise.resolve({
          id: `sessapi - ${+Date.now()}`,
        });
      },
    },
    createSessionObject(props) {
      return Promise.resolve({
        on: () => {},
        once: () => {},
        getLayout: () => Promise.resolve({}),
        id: props && props.qInfo && props.qInfo.qId ? props.qInfo.qId : `sel - ${+Date.now()}`,
        ...props,
      });
    },
    getObject() {
      return Promise.resolve(spy(getObjectMock));
    },
    getAppLayout() {
      return Promise.resolve({ id: 'app-layout' });
    },
  };

  return Promise.resolve({ app, spy });
};
