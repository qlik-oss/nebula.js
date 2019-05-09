import React, {
  useMemo,
} from 'react';

import hcHandler from '@nebula.js/nucleus/src/object/hc-handler';

import {
  Typography,
} from '@nebula.js/ui/components';

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


export default function HyperCube({
  model,
  target,
  properties,
}) {
  const handler = useMemo(() => hcHandler({
    def: target,
    hc: getValue(properties, target.path),
  }), [properties]);

  const onDimensionAdded = (a) => {
    handler.addDimension(a);
    model.setProperties(properties);
  };

  const onDimensionRemoved = (idx) => {
    handler.removeDimension(idx);
    model.setProperties(properties);
  };

  const onMeasureAdded = (a) => {
    handler.addMeasure(a);
    model.setProperties(properties);
  };

  const onMeasureRemoved = (idx) => {
    handler.removeMeasure(idx);
    model.setProperties(properties);
  };

  return (
    <div style={{ width: '100%' }}>
      <Typography color="textSecondary" style={{ fontFamily: 'Monaco, monospace', fontSize: '0.7rem' }}>{target.path}</Typography>
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
