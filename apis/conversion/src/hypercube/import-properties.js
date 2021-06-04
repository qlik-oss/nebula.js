/* eslint-disable no-param-reassign */
/* eslint-disable no-prototype-builtins */

import utils from '../utils';
import helpers from '../helpers';

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
  const { maxDimensions, minDimensions, maxMeasures, minMeasures } = helpers.getMaxMinDimensionMeasure({
    exportFormat,
    dataDefinition,
  });
  const { defaultDimension = helpers.getDefaultDimension(), defaultMeasure = helpers.getDefaultMeasure() } =
    defaultPropertyValues;

  // empty dimensions and measures of new hypercube
  newHyperCubeDef.qDimensions.length = 0;
  newHyperCubeDef.qMeasures.length = 0;

  // create layout exclude structures if needed
  if (helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })) {
    helpers.initLayoutExclude({
      exportFormat,
      maxDimensions,
      minDimensions,
      maxMeasures,
      minMeasures,
      newHyperCubeDef,
    });
  }

  // and now fill them in.
  helpers.addDefaultDimensions({ exportFormat, maxDimensions, minDimensions, newHyperCubeDef, defaultDimension });
  helpers.addDefaultMeasures({ exportFormat, maxMeasures, minMeasures, newHyperCubeDef, defaultMeasure });

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

  helpers.updateDimensionsOnAdded({ newProperties, dataDefinition, hypercubePath });
  helpers.updateMeasuresOnAdded({ newProperties, dataDefinition, hypercubePath });

  newPropertyTree.qProperty = newProperties;

  return newPropertyTree;
}
