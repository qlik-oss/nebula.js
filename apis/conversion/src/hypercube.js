/* eslint-disable no-prototype-builtins */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import createExportFormat from './export-format';
import utils from './utils';
import arrayUtils from './array-util';
import helpers from './helpers';

export default {
  /**
   * Exports properties for a chart with a hypercube.
   *
   * @ignore
   * @param propertyTree The properties tree. Must be an object.
   * @param hypercubePath Reference to the qHyperCubeDef.
   */
  exportProperties({ propertyTree, hypercubePath }) {
    const exportFormat = createExportFormat();
    const properties = propertyTree.qProperty;
    const hcdParent = utils.getValue(properties, hypercubePath || '');
    const hcd = hcdParent.qHyperCubeDef;
    const dataGroup = exportFormat.data[0];

    if (!hcd.qInterColumnSortOrder) {
      hcd.qInterColumnSortOrder = [];
    }

    // export dimensions
    dataGroup.dimensions.push(...hcd.qDimensions);

    // excluded dimensions
    if (hcd.qLayoutExclude && hcd.qLayoutExclude.qHyperCubeDef && hcd.qLayoutExclude.qHyperCubeDef.qDimensions) {
      dataGroup.excludedDimensions.push(...hcd.qLayoutExclude.qHyperCubeDef.qDimensions);
    }

    // export measures
    dataGroup.measures.push(...hcd.qMeasures);

    // excluded measures
    if (hcd.qLayoutExclude && hcd.qLayoutExclude.qHyperCubeDef && hcd.qLayoutExclude.qHyperCubeDef.qMeasures) {
      dataGroup.excludedMeasures.push(...hcd.qLayoutExclude.qHyperCubeDef.qMeasures);
    }

    // export sort order
    dataGroup.interColumnSortOrder = hcd.qInterColumnSortOrder.concat();

    // if we have a excluded sort order, try apply that instead
    if (
      hcd.qLayoutExclude &&
      hcd.qLayoutExclude.qHyperCubeDef &&
      hcd.qLayoutExclude.qHyperCubeDef.qInterColumnSortOrder
    ) {
      const order = hcd.qLayoutExclude.qHyperCubeDef.qInterColumnSortOrder.concat();
      // If the exporting sort order hasn't changed compared to the excluded we can apply the full excluded instead
      if (arrayUtils.isOrderedSubset(order, dataGroup.interColumnSortOrder)) {
        dataGroup.interColumnSortOrder = order;
      }
    }

    delete hcd.qLayoutExclude;

    Object.keys(properties).forEach((prop) => {
      exportFormat.properties[prop] = properties[prop];
    });

    if (hypercubePath) {
      exportFormat.properties.qHyperCubeDef = hcdParent.qHyperCubeDef;
      delete hcdParent.qHyperCubeDef;
    }

    if (!properties.qLayoutExclude) {
      properties.qLayoutExclude = {};
    }

    if (properties.qLayoutExclude.disabled) {
      Object.keys(properties.qLayoutExclude.disabled).forEach((prop) => {
        if (!exportFormat.properties.hasOwnProperty(prop)) {
          exportFormat.properties[prop] = properties.qLayoutExclude.disabled[prop];
        }
      });

      delete properties.qLayoutExclude.disabled;
    }

    if (properties.qLayoutExclude.changed) {
      helpers.restoreChangedProperties(properties);
      delete properties.qLayoutExclude.changed;
    }

    if (!properties.qLayoutExclude.quarantine || utils.isEmpty(properties.qLayoutExclude.quarantine)) {
      delete properties.qLayoutExclude;
    }

    return exportFormat;
  },

  /**
   * Imports properties for a chart with a hypercube.
   *
   * @ignore
   * @param exportFormat The export object which is the output of exportProperties.
   */
  importProperties({ exportFormat }) {
    const newPropertyTree = { qChildren: [] };
    newPropertyTree.qProperty = exportFormat.properties;
    return newPropertyTree;
  },
};
