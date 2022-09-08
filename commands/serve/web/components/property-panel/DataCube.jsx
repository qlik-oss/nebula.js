import React, { useMemo, useState } from 'react';

import hcHandler from '@nebula.js/nucleus/src/object/hc-handler';
import loHandler from '@nebula.js/nucleus/src/object/lo-handler';
import loContainerHandler from '@nebula.js/nucleus/src/object/lo-container-handler';

import { Typography } from '@mui/material';

import Fields from './Fields';

const getValue = (data, reference, defaultValue) => {
  const steps = reference.split('/');
  let dataContainer = data;
  if (dataContainer === undefined) {
    return defaultValue;
  }
  for (let i = 0; i < steps.length; ++i) {
    if (steps[i] === '') {
      continue; // eslint-disable-line no-continue
    }
    if (typeof dataContainer[steps[i]] === 'undefined') {
      return defaultValue;
    }
    dataContainer = dataContainer[steps[i]];
  }

  return dataContainer;
};

export default function DataCube({ setProperties, target, properties }) {
  // Store dimensions outside of handler to support filterpanes or other containers
  // holding list objects, which do not store dimensions in an array (like hc.qDimensions).
  const [dimensions, setDimensions] = useState([]);

  const supportsMultipleDims = target.dimensions && target.dimensions.max && target.dimensions.max() > 1;
  const listBoxHandler = supportsMultipleDims ? loContainerHandler : loHandler;

  const createHandler = target.propertyPath.match('/qHyperCube') ? hcHandler : listBoxHandler;
  const handler = useMemo(
    () =>
      createHandler({
        def: target,
        dc: getValue(properties, target.propertyPath),
        properties,
        dimensions,
      }),
    [properties]
  );

  const onDimensionAdded = (a) => {
    const dim = typeof a === 'object' ? { qLibraryId: a.qId } : { qDef: { qFieldDefs: [a] } };
    handler.addDimension(dim);
    setProperties(properties);
    setDimensions([...dimensions, dim]);
  };

  const onDimensionRemoved = (idx) => {
    handler.removeDimension(idx);
    setProperties(properties);
    setDimensions([...dimensions.slice(0, idx), ...dimensions.slice(idx + 1)]);
  };

  const onMeasureAdded = (a) => {
    handler.addMeasure(typeof a === 'object' ? { qLibraryId: a.qId } : a);
    setProperties(properties);
  };

  const onMeasureRemoved = (idx) => {
    handler.removeMeasure(idx);
    setProperties(properties);
  };

  return (
    <div style={{ width: '100%' }}>
      <Typography color="textSecondary" style={{ fontFamily: 'Monaco, monospace', fontSize: '0.7rem' }}>
        {target.propertyPath}
      </Typography>
      <Fields
        key="dimensions"
        onAdded={onDimensionAdded}
        onRemoved={onDimensionRemoved}
        canAdd={handler.canAddDimension()}
        items={handler.dimensions()}
        type="dimension"
        label="Dimensions"
        addLabel="Add dimension"
      />
      <Fields
        key="measures"
        onAdded={onMeasureAdded}
        onRemoved={onMeasureRemoved}
        canAdd={handler.canAddMeasure()}
        items={handler.measures()}
        type="measure"
        label="Measures"
        addLabel="Add measures"
      />
    </div>
  );
}
