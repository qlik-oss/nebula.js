import spy from './spy';
import { getPropValue, getPropFn } from './prop';

function GetObjectMock(fixture) {
  // TODO Add more validations
  if (!fixture.getLayout) {
    throw new Error('Fixture is missing "getLayout"');
  }

  const {
    id,
    session,
    getEffectiveProperties,
    getLayout,
    selectHyperCubeValues,
    rangeSelectHyperCubeValues,
    beginSelections,
    resetMadeSelections,
    getHyperCubeTreeData,
    getHyperCubeData,
    getHyperCubeReducedData,
    getHyperCubeContinuousData,
    getHyperCubeStackData,
    ...rest
  } = fixture;

  return {
    id: getPropValue(id, { defaultValue: `object - ${+Date.now()}` }),
    session: getPropValue(session, { defaultValue: true }),
    on: () => {},
    once: () => {},
    getEffectiveProperties: getPropFn(getEffectiveProperties, { defaultValue: {} }),
    getLayout: getPropFn(getLayout),
    selectHyperCubeValues: getPropFn(selectHyperCubeValues, { defaultValue: true }),
    rangeSelectHyperCubeValues: getPropFn(rangeSelectHyperCubeValues, { defaultValue: true }),
    beginSelections: getPropFn(beginSelections, { defaultValue: true }),
    resetMadeSelections: getPropFn(resetMadeSelections, { defaultValue: true }),
    getHyperCubeTreeData: getPropFn(getHyperCubeTreeData, { defaultValue: [] }),
    getHyperCubeData: getPropFn(getHyperCubeData, { defaultValue: [] }),
    getHyperCubeReducedData: getPropFn(getHyperCubeReducedData),
    getHyperCubeContinuousData: getPropFn(getHyperCubeContinuousData),
    getHyperCubeStackData: getPropFn(getHyperCubeStackData),
    ...rest,
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
        id: props?.qInfo?.qId ? props.qInfo.qId : `sel - ${+Date.now()}`,
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
