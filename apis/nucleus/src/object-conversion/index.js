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
  const sourceQae = cellRef.current.getQae();
  const propertyTree = await model.getFullPropertyTree();
  const exportedPropertyTree = sourceQae.exportProperties ? sourceQae.exportProperties(propertyTree) : propertyTree;
  const targetSnType = await getType({ halo, name: newType });
  const targetQae = targetSnType.qae;
  const convertedPropertyTree = targetQae.importProperties
    ? targetQae.importProperties(exportedPropertyTree)
    : exportedPropertyTree;
  convertedPropertyTree.qProperty.visualization = newType;
  return convertedPropertyTree;
};

export default { convertTo };
