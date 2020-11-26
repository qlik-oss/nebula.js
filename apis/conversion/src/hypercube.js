/* eslint-disable no-prototype-builtins */
import extend from 'extend';

import createExportFormat from './export-format';
import utils from './utils';
import arrayUtils from './array-util';
import helpers from './helpers';

const MAX_SAFE_INTEGER = 2 ** 53 - 1;

export default {
  /**
   * Exports properties for a chart with a hypercube.
   *
   * @ignore
   * @param propertyTree The properties tree. Must be an object.
   * @param hypercubePath Reference to the qHyperCubeDef.
   * @returns {ExportFormat}
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
   * @param {ExportFormat} exportFormat The export object which is the output of exportProperties.
   * @returns {Object} A properties tree
   */
  importProperties({ exportFormat, initialProperties, dataDefinition, defaultPropertyValues = {}, hypercubePath }) {
    const newPropertyTree = { qChildren: [] };
    let newProperties = {};
    const dataGroup = exportFormat.data[0];
    let i;

    const {
      defaultDimension = helpers.getDefaultDimension(),
      defaultMeasure = helpers.getDefaultMeasure(),
    } = defaultPropertyValues;

    const dimensionDef = dataDefinition.dimensions || { max: 0 };
    const measureDef = dataDefinition.measures || { max: 0 };

    const maxMeasures = helpers.resolveValue(measureDef.max, dataGroup.dimensions.length, MAX_SAFE_INTEGER);
    const minMeasures = helpers.resolveValue(measureDef.min, dataGroup.dimensions.length, 0);
    const maxDimensions = helpers.resolveValue(dimensionDef.max, maxMeasures, MAX_SAFE_INTEGER);
    const minDimensions = helpers.resolveValue(dimensionDef.min, minMeasures, 0);

    if (!newProperties.qLayoutExclude) {
      newProperties.qLayoutExclude = {};
    }

    newProperties.qLayoutExclude.disabled = {};
    newProperties.qLayoutExclude.quarantine = {};

    Object.keys(exportFormat.properties).forEach((key) => {
      if (key === 'qLayoutExclude') {
        if (exportFormat.properties[key].quarantine) {
          newProperties.qLayoutExclude.quarantine = extend(true, {}, exportFormat.properties[key].quarantine);
        }
      } else if (key === 'qHyperCubeDef' && hypercubePath) {
        // handle later
      } else if (initialProperties.hasOwnProperty(key) || helpers.isMasterItemPropperty(key)) {
        // todo: qExtendsId ??
        newProperties[key] = exportFormat.properties[key];
      } else {
        newProperties.qLayoutExclude.disabled[key] = exportFormat.properties[key];
      }
    });

    if (hypercubePath && exportFormat.properties.qHyperCubeDef) {
      newProperties[hypercubePath] = newProperties[hypercubePath] || {};
      newProperties[hypercubePath].qHyperCubeDef = exportFormat.properties.qHyperCubeDef;
    }

    newProperties = extend(true, {}, initialProperties, newProperties);
    if (newProperties.components === null) {
      newProperties.components = [];
    }

    // empty hypercube arrays
    const initHyperCubeDef = utils.getValue(initialProperties, hypercubePath || '').qHyperCubeDef;
    const newHyperCubeDef = utils.getValue(newProperties, hypercubePath || '').qHyperCubeDef;
    newHyperCubeDef.qDimensions.length = 0;
    newHyperCubeDef.qMeasures.length = 0;

    // create layout exclude structures if needed
    if (
      (dataGroup.dimensions.length > maxDimensions && maxDimensions > 0) ||
      (dataGroup.measures.length > maxMeasures && maxMeasures > 0) ||
      (dataGroup.excludedDimensions.length &&
        dataGroup.dimensions.length + dataGroup.excludedDimensions.length > minDimensions) ||
      (dataGroup.excludedMeasures.length &&
        dataGroup.measures.length + dataGroup.excludedMeasures.length > minMeasures) ||
      (!maxMeasures && dataGroup.measures.length) ||
      (!maxDimensions && dataGroup.dimensions.length)
    ) {
      if (!newHyperCubeDef.qLayoutExclude) {
        newHyperCubeDef.qLayoutExclude = {};
      }

      if (!newHyperCubeDef.qLayoutExclude.qHyperCubeDef) {
        newHyperCubeDef.qLayoutExclude.qHyperCubeDef = {};
      }

      if (
        (dataGroup.dimensions.length > maxDimensions && maxDimensions > 0) ||
        (dataGroup.excludedDimensions &&
          dataGroup.excludedDimensions.length &&
          dataGroup.dimensions.length + dataGroup.excludedDimensions.length > minDimensions)
      ) {
        if (!newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions) {
          newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions = [];
        }
      }

      if (
        (dataGroup.measures.length > maxMeasures && maxMeasures > 0) ||
        (dataGroup.excludedMeasures &&
          dataGroup.excludedMeasures.length &&
          dataGroup.measures.length + dataGroup.excludedMeasures.length > minMeasures)
      ) {
        if (!newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures) {
          newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures = [];
        }
      }

      if (!maxMeasures && dataGroup.measures.length) {
        // if the object don't support measures put them in alternative measures instead
        if (!newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures) {
          newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures = [];
        }
      }

      if (!maxDimensions && dataGroup.dimensions.length) {
        // if the object don't support dimensions put them in alternative dimensions instead
        if (!newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions) {
          newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions = [];
        }
      }
    }

    // and now fill them in.
    if (maxDimensions > 0) {
      for (i = 0; i < dataGroup.dimensions.length; ++i) {
        if (newHyperCubeDef.qDimensions.length < maxDimensions) {
          newHyperCubeDef.qDimensions.push(helpers.createDefaultDimension(dataGroup.dimensions[i], defaultDimension));
        } else {
          newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions.push(
            helpers.createDefaultDimension(dataGroup.dimensions[i], defaultDimension)
          );
        }
      }
    } else if (dataGroup.dimensions.length) {
      for (i = 0; i < dataGroup.dimensions.length; ++i) {
        newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions.push(
          helpers.createDefaultDimension(dataGroup.dimensions[i], defaultDimension)
        );
      }
    }

    if (dataGroup.excludedDimensions.length) {
      for (i = 0; i < dataGroup.excludedDimensions.length; ++i) {
        if (newHyperCubeDef.qDimensions.length < minDimensions) {
          newHyperCubeDef.qDimensions.push(
            helpers.createDefaultDimension(dataGroup.excludedDimensions[i], defaultDimension)
          );
        } else {
          newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions.push(
            helpers.createDefaultDimension(dataGroup.excludedDimensions[i], defaultDimension)
          );
        }
      }
    }

    if (maxMeasures > 0) {
      for (i = 0; i < dataGroup.measures.length; ++i) {
        if (newHyperCubeDef.qMeasures.length < maxMeasures) {
          newHyperCubeDef.qMeasures.push(helpers.createDefaultMeasure(dataGroup.measures[i], defaultMeasure));
        } else {
          newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures.push(
            helpers.createDefaultMeasure(dataGroup.measures[i], defaultMeasure)
          );
        }
      }
    } else if (dataGroup.measures.length) {
      for (i = 0; i < dataGroup.measures.length; ++i) {
        newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures.push(
          helpers.createDefaultMeasure(dataGroup.measures[i], defaultMeasure)
        );
      }
    }

    if (dataGroup.excludedMeasures.length) {
      for (i = 0; i < dataGroup.excludedMeasures.length; ++i) {
        if (newHyperCubeDef.qMeasures.length < minMeasures) {
          newHyperCubeDef.qMeasures.push(helpers.createDefaultMeasure(dataGroup.excludedMeasures[i], defaultMeasure));
        } else {
          newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures.push(
            helpers.createDefaultMeasure(dataGroup.excludedMeasures[i], defaultMeasure)
          );
        }
      }
    }

    // have to make sure qInterFieldSortOrder is correct
    const nCols = newHyperCubeDef.qDimensions.length + newHyperCubeDef.qMeasures.length;
    newHyperCubeDef.qInterColumnSortOrder = dataGroup.interColumnSortOrder.concat();

    i = newHyperCubeDef.qInterColumnSortOrder.length;
    if (i !== nCols) {
      if (newHyperCubeDef.qLayoutExclude) {
        // Store them if needed
        newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qInterColumnSortOrder = dataGroup.interColumnSortOrder.concat();
      }
      while (i !== nCols) {
        if (i < nCols) {
          arrayUtils.indexAdded(newHyperCubeDef.qInterColumnSortOrder, i);
          ++i;
        } else {
          --i;
          arrayUtils.indexRemoved(newHyperCubeDef.qInterColumnSortOrder, i);
        }
      }
    }

    helpers.copyPropertyIfExist('qMaxStackedCells', initHyperCubeDef, newHyperCubeDef);
    helpers.copyPropertyIfExist('qNoOfLeftDims', initHyperCubeDef, newHyperCubeDef);

    helpers.copyPropertyOrSetDefault('qInitialDataFetch', initHyperCubeDef, newHyperCubeDef, [
      { qTop: 0, qLeft: 0, qWidth: 0, qHeight: 0 },
    ]);
    helpers.copyPropertyOrSetDefault('qMode', initHyperCubeDef, newHyperCubeDef, 'S');
    helpers.copyPropertyOrSetDefault('qReductionMode', initHyperCubeDef, newHyperCubeDef, 'N');
    helpers.copyPropertyOrSetDefault('qSortbyYValue', initHyperCubeDef, newHyperCubeDef);
    helpers.copyPropertyOrSetDefault('qIndentMode', initHyperCubeDef, newHyperCubeDef);
    helpers.copyPropertyOrSetDefault('qShowTotalsAbove', initHyperCubeDef, newHyperCubeDef);

    // always copy type and visualization
    helpers.importCommonProperties(newProperties, exportFormat, initialProperties);

    newPropertyTree.qProperty = newProperties;

    return newPropertyTree;
  },
};
