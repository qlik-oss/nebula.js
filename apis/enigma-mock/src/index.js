import spy from './spy';

function getHyperCubeData(key, pages, meta) {
  if (/qAttributeDimensions/.test(key)) {
    return meta.attrDimDataPages;
  }

  return meta.layout.qHyperCube.qDataPages;
}

export default function createEnigmaMock(fixture, { overrides } = {}) {
  if (!fixture) {
    throw new Error('No "fixture" specified');
  }
  const { layout, reducedDataPages } = fixture;

  const redPages = reducedDataPages && reducedDataPages.length > 0 ? reducedDataPages : layout.qHyperCube.qDataPages;

  const base = {
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
      return Promise.resolve(
        spy({
          id: `object - ${+Date.now()}`,
          on: () => {},
          once: () => {},
          getEffectiveProperties: () => Promise.resolve({}),
          session: true,
          getHyperCubeTreeData: () => Promise.resolve(layout.qHyperCube.qTreeDataPages),
          getHyperCubeData: (key, pages) => Promise.resolve(getHyperCubeData(key, pages, fixture)),
          getHyperCubeReducedData: () => Promise.resolve(redPages),
          getHyperCubeContinuousData: () =>
            Promise.resolve({ qAxisData: layout.qHyperCube.qAxisData, qDataPages: layout.qHyperCube.qDataPages }),
          getHyperCubeStackData: () => Promise.resolve(layout.qHyperCube.qStackedDataPages),
          getLayout: () => Promise.resolve(layout),
          selectHyperCubeValues: () => Promise.resolve(true),
          rangeSelectHyperCubeValues: () => Promise.resolve(true),
          beginSelections: () => Promise.resolve(true),
          resetMadeSelections: () => Promise.resolve(true),
        })
      );
    },
    getAppLayout() {
      return Promise.resolve({ id: 'app-layout' });
    },
  };

  const appOverrides = overrides({ fixture, base });
  const app = { ...base, ...appOverrides };

  return Promise.resolve({ app, spy });
}
