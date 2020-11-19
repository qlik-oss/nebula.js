import hypercube from './hypercube';

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
  return qae && qae.data && qae.data.targets && qae.data.targets[0] && qae.data.targets[0].propertyPath;
};

const getDefaultExportPropertiesFnc = (path) => {
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
  return getDefaultExportPropertiesFnc(path);
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

const convertTo = async ({ halo, model, cellRef, newType }) => {
  const propertyTree = await model.getFullPropertyTree();
  const sourceQae = cellRef.current.getQae();
  const exportProperties = getExportPropertiesFnc(sourceQae);
  const targetSnType = await getType({ halo, name: newType });
  const targetQae = targetSnType.qae;
  const importProperties = getImportPropertiesFnc(targetQae);
  const exportFormat = exportProperties({ propertyTree });
  const newPropertyTree = importProperties({ exportFormat });
  newPropertyTree.qProperty.visualization = newType;
  return newPropertyTree;
};

export default { convertTo, hypercube };
