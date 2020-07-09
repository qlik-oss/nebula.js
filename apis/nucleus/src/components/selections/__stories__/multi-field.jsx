import React from 'react';
import { Grid } from '@material-ui/core';
import { text, boolean } from '@storybook/addon-knobs'; // eslint-disable-line
import MultiState from '../MultiState';

export default {
  title: 'Selections|Multi state',
  component: MultiState,
  decorators: [(story) => <div style={{ backgroundColor: '#eee', padding: '16px' }}>{story()}</div>],
};

const api = {
  on() {},
  removeListener() {},
  layout() {
    return {};
  },
  canGoForward() {
    return true;
  },
  canGoBack() {
    return false;
  },
  canClear() {
    return false;
  },
};

const states = [
  { info: 'None', qTotal: 0 },
  {
    info: 'One',
    qTotal: 20,
    qStateCounts: { qSelected: 1, qLocked: 0, qAlternative: 0, qExcluded: 0, qSelectedExcluded: 0, qLockedExcluded: 0 },
    qSelectedFieldSelectionInfo: [{ qName: 'Candy' }],
  },
];

const stateFn = (state = {}, num = 0) => (
  <MultiState
    api={api}
    field={{
      name: 'Product',
      states: [...Array(num).keys()].map((i) => (i ? `Another ${i}` : '$')),
      selections: [...Array(num).keys()].map(() => ({ qField: 'Product', ...state, qLocked: state && state.qLocked })),
    }}
  />
);

export const fields = () => (
  <Grid container spacing={1} wrap="nowrap">
    <Grid item>{stateFn()}</Grid>
    <Grid item>{stateFn(states[1], 5)}</Grid>
    <Grid item>{stateFn(states[1], 23)}</Grid>
  </Grid>
);

export const none = () => stateFn();
export const locked = () => stateFn(states[1], 5);
export const one = () => stateFn(states[1], 23);
