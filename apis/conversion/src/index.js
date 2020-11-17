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

const convertTo = async ({ halo, model, cellRef, newType }) => {
  const propertyTree = await model.getFullPropertyTree();
  const sourceQae = cellRef.current.getQae();
  if (!sourceQae.exportProperties) {
    throw new Error(
      `Converting from ${propertyTree.qProperty.visualization} is not supported since there is no exportProperties method.`
    );
  }
  const targetSnType = await getType({ halo, name: newType });
  const targetQae = targetSnType.qae;
  if (!targetQae.importProperties) {
    throw new Error(`Converting to ${newType} is not supported since there is no importProperties method.`);
  }
  const exportFormat = sourceQae.exportProperties({ propertyTree });
  const newPropertyTree = targetQae.importProperties({ exportFormat });
  newPropertyTree.qProperty.visualization = newType;
  return newPropertyTree;
};

export default { convertTo, hypercube };
