import React from 'react';
import { Grid } from '@mui/material';
import { text, boolean } from '@storybook/addon-knobs'; // eslint-disable-line
import OneField from '../OneField';

export default {
  title: 'Selections|One field',
  component: OneField,
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
    info: 'One locked',
    qTotal: 20,
    qLocked: true,
    qStateCounts: { qSelected: 1, qLocked: 0, qAlternative: 0, qExcluded: 0, qSelectedExcluded: 0, qLockedExcluded: 0 },
    qSelectedFieldSelectionInfo: [{ qName: 'Candy' }],
  },
  {
    info: 'One',
    qTotal: 20,
    qStateCounts: { qSelected: 1, qLocked: 0, qAlternative: 0, qExcluded: 0, qSelectedExcluded: 0, qLockedExcluded: 0 },
    qSelectedFieldSelectionInfo: [{ qName: 'Candy' }],
  },
  {
    info: 'Some',
    qTotal: 20,
    qStateCounts: { qSelected: 5, qLocked: 4, qAlternative: 3, qExcluded: 2, qSelectedExcluded: 0, qLockedExcluded: 0 },
  },
  {
    info: 'All',
    qTotal: 20,
    qStateCounts: {
      qSelected: 10,
      qLocked: 4,
      qAlternative: 2,
      qExcluded: 0,
      qSelectedExcluded: 3,
      qLockedExcluded: 1,
    },
  },
];

const stateFn = (state) => (
  <OneField
    api={api}
    field={{
      states: [text('State', '$')],
      selections: [{ qField: text('Field', 'Product'), ...state, qLocked: !!state.qLocked }],
    }}
  />
);

export const fields = () => (
  <Grid container spacing={1} wrap="nowrap">
    <Grid item>{stateFn(states[0])}</Grid>
    <Grid item>{stateFn(states[1])}</Grid>
    <Grid item>{stateFn(states[2])}</Grid>
    <Grid item>{stateFn(states[3])}</Grid>
    <Grid item>{stateFn(states[4])}</Grid>
  </Grid>
);

export const none = () => stateFn(states[0]);
export const locked = () => stateFn(states[1]);
export const one = () => stateFn(states[2]);
export const some = () => stateFn(states[3]);
export const all = () => stateFn(states[4]);
