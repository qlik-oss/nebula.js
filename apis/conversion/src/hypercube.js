/* eslint-disable no-prototype-builtins */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import createExportFormat from './export-format';
import utils from './utils';
import arrayUtils from './array-util';
import helpers from './helpers';

export default {
  exportProperties({ propertyTree, hypercubePath = 'qHyperCubeDef' }) {
    const exportFormat = createExportFormat();
    const properties = propertyTree.qProperty;
    const hcd = utils.getValue(properties, hypercubePath);
    const dataGroup = exportFormat.data[0];
    let i;

    if (!hcd.qInterColumnSortOrder) {
      hcd.qInterColumnSortOrder = [];
    }

    // export dimensions
    for (i = 0; i < hcd.qDimensions.length; ++i) {
      dataGroup.dimensions.push(hcd.qDimensions[i]);
    }

    // excluded dimensions
    if (hcd.qLayoutExclude && hcd.qLayoutExclude.qHyperCubeDef && hcd.qLayoutExclude.qHyperCubeDef.qDimensions) {
      for (i = 0; i < hcd.qLayoutExclude.qHyperCubeDef.qDimensions.length; ++i) {
        dataGroup.excludedDimensions.push(hcd.qLayoutExclude.qHyperCubeDef.qDimensions[i]);
      }
    }

    // export measures
    for (i = 0; i < hcd.qMeasures.length; ++i) {
      dataGroup.measures.push(hcd.qMeasures[i]);
    }

    // excluded measures
    if (hcd.qLayoutExclude && hcd.qLayoutExclude.qHyperCubeDef && hcd.qLayoutExclude.qHyperCubeDef.qMeasures) {
      for (i = 0; i < hcd.qLayoutExclude.qHyperCubeDef.qMeasures.length; ++i) {
        dataGroup.excludedMeasures.push(hcd.qLayoutExclude.qHyperCubeDef.qMeasures[i]);
      }
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
      exportFormat.properties.qHyperCubeDef = utils.getValue(properties, hypercubePath);
      delete utils.getValue(properties, hypercubePath);
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
  importProperties({ exportFormat }) {
    const newPropertyTree = { qChildren: [] };
    newPropertyTree.qProperty = exportFormat.properties;
    return newPropertyTree;
  },
};
