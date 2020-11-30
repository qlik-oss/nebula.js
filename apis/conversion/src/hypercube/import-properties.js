/* eslint-disable no-param-reassign */
/* eslint-disable no-prototype-builtins */

import utils from '../utils';
import helpers from '../helpers';

function checkForLayoutExclude({ dataGroup, maxDimensions, minDimensions, maxMeasures, minMeasures }) {
  return (
    (dataGroup.dimensions.length > maxDimensions && maxDimensions > 0) ||
    (dataGroup.measures.length > maxMeasures && maxMeasures > 0) ||
    (dataGroup.excludedDimensions.length &&
      dataGroup.dimensions.length + dataGroup.excludedDimensions.length > minDimensions) ||
    (dataGroup.excludedMeasures.length &&
      dataGroup.measures.length + dataGroup.excludedMeasures.length > minMeasures) ||
    (!maxMeasures && dataGroup.measures.length) ||
    (!maxDimensions && dataGroup.dimensions.length)
  );
}

function initHyerCubeLayoutExclude({
  dataGroup,
  maxDimensions,
  minDimensions,
  maxMeasures,
  minMeasures,
  newHyperCubeDef,
}) {
  if (checkForLayoutExclude({ dataGroup, maxDimensions, minDimensions, maxMeasures, minMeasures })) {
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
}

function addDefaultDimensions({ dataGroup, maxDimensions, minDimensions, newHyperCubeDef, defaultDimension }) {
  let i;
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
}

function addDefaultMeasures({ dataGroup, maxMeasures, minMeasures, newHyperCubeDef, defaultMeasure }) {
  let i;
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
}

/**
 * Imports properties for a chart with a hypercube.
 *
 * @ignore
 * @param {ExportFormat} exportFormat The export object which is the output of exportProperties.
 * @param initialProperties Initial properties of the target chart.
 * @param dataDefinition Data definition of the target chart.
 * @param defaultPropertyValues Default values for a number of properties of the target chart.
 * @param hypercubePath Reference to the qHyperCubeDef.
 * @returns {Object} A properties tree
 */
export default function importProperties({
  exportFormat,
  initialProperties = {},
  dataDefinition = {},
  defaultPropertyValues = {},
  hypercubePath,
}) {
  const newPropertyTree = { qChildren: [] };
  const newProperties = helpers.createNewProperties({ exportFormat, initialProperties, hypercubePath });
  const initHyperCubeDef = utils.getValue(initialProperties, hypercubePath || '').qHyperCubeDef;
  const newHyperCubeDef = utils.getValue(newProperties, hypercubePath || '').qHyperCubeDef;
  const dataGroup = exportFormat.data[0];
  const { maxDimensions, minDimensions, maxMeasures, minMeasures } = helpers.getMaxMinDimensionMeasure({
    exportFormat,
    dataDefinition,
  });
  const {
    defaultDimension = helpers.getDefaultDimension(),
    defaultMeasure = helpers.getDefaultMeasure(),
  } = defaultPropertyValues;

  // empty dimensions and measures of new hypercube
  newHyperCubeDef.qDimensions.length = 0;
  newHyperCubeDef.qMeasures.length = 0;

  // create layout exclude structures if needed
  initHyerCubeLayoutExclude({
    dataGroup,
    maxDimensions,
    minDimensions,
    maxMeasures,
    minMeasures,
    newHyperCubeDef,
  });

  // and now fill them in.
  addDefaultDimensions({ dataGroup, maxDimensions, minDimensions, newHyperCubeDef, defaultDimension });
  addDefaultMeasures({ dataGroup, maxMeasures, minMeasures, newHyperCubeDef, defaultMeasure });

  helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });

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
}
