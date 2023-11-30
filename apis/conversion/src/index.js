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

const getPath = (qae) => utils.getValue(qae, 'data.targets.0.propertyPath');

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

export const convertTo = async ({ halo, model, cellRef, newType, properties, viewDataMode = false }) => {
  const propertyTree = properties ? { qProperty: properties } : await model.getFullPropertyTree();
  const sourceQae = cellRef.current.getQae();
  const exportProperties = getExportPropertiesFnc(sourceQae);
  if (!exportProperties) {
    throw new Error('Source chart does not support conversion');
  }
  const targetSnType = await getType({ halo, name: newType });
  const targetQae = targetSnType.qae;
  const importProperties = getImportPropertiesFnc(targetQae);
  if (!importProperties) {
    throw new Error('Target chart does not support conversion');
  }
  const exportFormat = exportProperties({
    propertyTree,
    hypercubePath: helpers.getHypercubePath(sourceQae),
    viewDataMode,
  });
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
    viewDataMode,
  });
  return newPropertyTree;
};
/**
 * @interface ConversionType
 * @since 1.1.0
 * @property {importProperties} importProperties
 * @property {exportProperties} exportProperties
 */

/**
 * @entry
 * @namespace
 * @alias Conversion
 * @since 1.1.0
 * @description Provides conversion functionality to extensions.
 * @example
 * import { conversion } from '@nebula.js/stardust';
 *
 * export default function() {
 *   return {
 *     qae: {
 *       ...
 *       importProperties: ( exportFormat, initialProperties ) =>  conversion.hyperCube.importProperties(exportFormat, initialProperties),
 *       exportProperties: ( fullPropertyTree ) => conversion.hyperCube.exportProperties(fullPropertyTree)
 *     },
 *     ...
 *   };
 * }
 *
 */
const conversion = {
  /**
   * @type {hyperCubeConversion}
   * @since 1.1.0
   * @description Provides conversion functionality to extensions with hyperCubes.
   */
  hypercube,
};
export default conversion;
