import React from 'react';
import { Grid } from '@mui/material';
import { text, boolean } from '@storybook/addon-knobs'; // eslint-disable-line
import { AppSelections } from '../AppSelections';

export default {
  title: 'Selections|App selections',
  component: AppSelections,
  decorators: [(story) => <div style={{ backgroundColor: '#ccc', padding: '16px' }}>{story()}</div>],
};

const selectionObject = (num = 0) => ({
  qSelectionObject: {
    qSelections: [...Array(num).keys()].map((i) => ({
      qField: `Products-${i}`,
      qTotal: 20,
      qStateCounts: {
        qSelected: 1,
        qLocked: 0,
        qAlternative: 0,
        qExcluded: 0,
        qSelectedExcluded: 0,
        qLockedExcluded: 0,
      },
      qSelectedFieldSelectionInfo: [{ qName: 'Candy' }],
    })),
  },
});

let obj = 0;
const objectModel = (props, num) => {
  ++obj;
  const type = props.qInfo && props.qInfo.qType ? props.qInfo.qType : obj;
  const id = props.qInfo && props.qInfo.qId ? props.qInfo.qId : `${+new Date()}-${type}-${obj}`;
  return {
    id,
    on() {},
    once() {},
    removeListener() {},
    async getLayout() {
      const v = props.qSelectionObjectDef ? selectionObject(num) : {};
      return {
        ...props,
        qInfo: {
          qId: id,
          ...props.qInfo,
        },
        ...v,
      };
    },
  };
};

let count = 0;
const app = (numSelectedFields = 0) => ({
  id: `my-app-${++count}`,
  on() {},
  removeListener() {},
  session: {},
  async createSessionObject(props) {
    return objectModel(props, numSelectedFields);
  },
  async getAppLayout() {
    return {};
  },
});

const stateFn = (numSelectedFields = 0) => <AppSelections app={app(numSelectedFields)} />;

export const variations = () => (
  <Grid container gap={2} direction="column">
    <Grid item>{stateFn(0)}</Grid>
    <Grid item>{stateFn(2)}</Grid>
    <Grid item>{stateFn(15)}</Grid>
  </Grid>
);
