import React, { useMemo } from 'react';

import hcHandler from '@nebula.js/nucleus/src/object/hc-handler';
import loHandler from '@nebula.js/nucleus/src/object/lo-handler';

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
  const createHandler = target.propertyPath.match('/qHyperCube') ? hcHandler : loHandler;
  const handler = useMemo(
    () =>
      createHandler({
        def: target,
        dc: getValue(properties, target.propertyPath, {}),
        properties,
      }),
    [properties]
  );

  const onDimensionAdded = (a) => {
    handler.addDimension(typeof a === 'object' ? { qLibraryId: a.qId } : a);
    setProperties(properties);
  };

  const onDimensionRemoved = (idx) => {
    handler.removeDimension(idx);
    setProperties(properties);
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
        onAdded={onDimensionAdded}
        onRemoved={onDimensionRemoved}
        canAdd={handler.canAddDimension()}
        items={handler.dimensions()}
        type="dimension"
        label="Dimensions"
        addLabel="Add dimension"
      />
      <Fields
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
