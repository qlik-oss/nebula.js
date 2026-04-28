import React from 'react';

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
const info = {
  states: ['$'],
  qField: 'Product',
};
const selections = [
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

function Template(args) {
  const { states, qLocked, ...rest } = args;

  return (
    <OneField
      api={api}
      field={{
        states,
        selections: [{ ...rest, qLocked: !!qLocked }],
      }}
    />
  );
}

export const locked = Template.bind({});
locked.args = {
  ...info,
  ...selections[1],
};

export const none = Template.bind({});
none.args = {
  ...info,
  ...selections[0],
};

export const one = Template.bind({});
one.args = {
  ...info,
  ...selections[2],
};

export const some = Template.bind({});
some.args = {
  ...info,
  ...selections[3],
};

export const all = Template.bind({});
all.args = {
  ...info,
  ...selections[4],
};
