import React, { useEffect, useState } from 'react';

import { Grid } from '@nebula.js/ui/components';

import { useTheme } from '@nebula.js/ui/theme';

import OneField from './OneField';
import MultiState from './MultiState';

function collect(qSelectionObject, fields, state = '$') {
  qSelectionObject.qSelections.forEach(selection => {
    const name = selection.qField;
    const field = fields[name] = fields[name] || { name, states: [], selections: [] }; // eslint-disable-line
    if (field.states.indexOf(state) === -1) {
      field.states.push(state);
      field.selections.push(selection);
    }
  });
}

function getItems(layout) {
  if (!layout) {
    return [];
  }
  const fields = {};
  if (layout.qSelectionObject) {
    collect(layout.qSelectionObject, fields);
  }
  if (layout.alternateStates) {
    layout.alternateStates.forEach(s => collect(s.qSelectionObject, fields, s.stateName));
  }
  return Object.keys(fields).map(key => fields[key]);
}

export default function SelectedFields({ api }) {
  const [state, setState] = useState({
    items: getItems(api.layout()),
  });

  const theme = useTheme();

  useEffect(() => {
    if (!api) {
      return undefined;
    }
    const onChange = () =>
      setState({
        items: getItems(api.layout()),
      });
    api.on('changed', onChange);
    return () => {
      api.removeListener('changed', onChange);
    };
  }, [api]);

  return (
    <Grid container spacing={0} wrap="nowrap">
      {state.items.map(s => (
        <Grid
          item
          key={`${s.states.join('::')}::${s.name}`}
          style={{
            position: 'relative',
            maxWidth: '240px',
            minWidth: '120px',
            background: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          {s.states.length > 1 ? <MultiState field={s} /> : <OneField field={s} api={api} />}
        </Grid>
      ))}
    </Grid>
  );
}
