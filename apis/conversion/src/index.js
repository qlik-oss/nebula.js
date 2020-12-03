import hypercube from './hypercube';
import utils from './utils';
import helpers from './helpers';

const getType = async ({ halo, name, version }) => {
  const { types } = halo;
  const SN = await types
    .get({
      name,
      version,
    })
    .supernova();
  return SN;
};

const getPath = (qae) => {
  return utils.getValue(qae, 'data.targets.0.propertyPath');
};

const getDefaultExportPropertiesFn = (path) => {
  const steps = path.split('/');
  if (steps.indexOf('qHyperCubeDef') > -1) {
    return hypercube.exportProperties;
  }
  return undefined; // TODO: add listbox and other
};

const getExportPropertiesFnc = (qae) => {
  if (qae.exportProperties) {
    return qae.exportProperties;
  }
  const path = getPath(qae);
  return getDefaultExportPropertiesFn(path);
};

const getDefaultImportPropertiesFnc = (path) => {
  const steps = path.split('/');
  if (steps.indexOf('qHyperCubeDef') > -1) {
    return hypercube.importProperties;
  }
  return undefined; // TODO: add listbox and other
};

const getImportPropertiesFnc = (qae) => {
  if (qae.importProperties) {
    return qae.importProperties;
  }
  const path = getPath(qae);
  return getDefaultImportPropertiesFnc(path);
};

export const convertTo = async ({ halo, model, cellRef, newType }) => {
  const [propertyTree, targetSnType] = await Promise.all([
    model.getFullPropertyTree(),
    getType({ halo, name: newType }),
  ]);
  const sourceQae = cellRef.current.getQae();
  const exportProperties = getExportPropertiesFnc(sourceQae);
  const targetQae = targetSnType.qae;
  const importProperties = getImportPropertiesFnc(targetQae);
  const exportFormat = exportProperties({
    propertyTree,
    hypercubePath: helpers.getHypercubePath(sourceQae),
  });
  const dimensionList = cellRef.current.getLibraryList('dimension');
  const measureList = cellRef.current.getLibraryList('measure');
  helpers.checkLibraryObjects({ exportFormat, dimensionList, measureList });
  const initial = utils.getValue(targetQae, 'properties.initial', {});
  const initialProperties = {
    qInfo: {
      qType: newType,
    },
    visualization: newType,
    ...initial,
  };
  const newPropertyTree = importProperties({
    exportFormat,
    initialProperties,
    dataDefinition: utils.getValue(targetQae, 'data.targets.0.', {}),
    hypercubePath: helpers.getHypercubePath(targetQae),
  });
  return newPropertyTree;
};

export default { hypercube };
