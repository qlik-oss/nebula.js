/* eslint react/jsx-no-constructed-context-values: 0 */
import React from 'react';
import renderer from 'react-test-renderer';
import { IconButton, Typography } from '@material-ui/core';

const InstanceContext = React.createContext();
const [{ default: OneField }] = aw.mock(
  [
    [require.resolve('../../../contexts/InstanceContext'), () => InstanceContext],
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({
        useTheme: () => ({
          palette: {
            selected: {
              main: '#009845',
              alternative: '#E4E4E4',
              excluded: '#BEBEBE',
            },
          },
        }),
        makeStyles: () => () => ({}),
      }),
    ],
  ],
  ['../OneField']
);

describe('<OneField />', () => {
  it('should have `ALL`', () => {
    const field = {
      selections: [
        {
          qField: 'my-field',
          qTotal: 12,
          qStateCounts: {
            qSelected: 3,
            qLocked: 3,
            qExcluded: 0,
            qLockedExcluded: 3,
            qSelectedExcluded: 3,
            qAlternative: 0,
          },
        },
      ],
      states: ['$'],
    };
    const testRenderer = renderer.create(
      <InstanceContext.Provider value={{ translator: { get: () => 'ALL' } }}>
        <OneField field={field} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(Typography);
    expect(types).to.have.length(2);
    expect(types[0].props).to.deep.equal({
      noWrap: true,
      style: { fontSize: '12px', lineHeight: '16px', fontWeight: 600 },
      children: 'my-field',
    });
    expect(types[1].props).to.deep.equal({
      noWrap: true,
      style: { fontSize: '12px', opacity: 0.55, lineHeight: '16px' },
      children: 'ALL',
    });
  });
  it('should have `Of`', () => {
    const field = {
      selections: [
        {
          qField: 'my-field',
          qTotal: 13,
          qStateCounts: {
            qSelected: 3,
            qLocked: 3,
            qExcluded: 0,
            qLockedExcluded: 3,
            qSelectedExcluded: 3,
            qAlternative: 0,
          },
        },
      ],
      states: ['$'],
    };
    const testRenderer = renderer.create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Of' } }}>
        <OneField field={field} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(Typography);
    expect(types).to.have.length(2);
    expect(types[0].props).to.deep.equal({
      noWrap: true,
      style: { fontSize: '12px', lineHeight: '16px', fontWeight: 600 },
      children: 'my-field',
    });
    expect(types[1].props).to.deep.equal({
      noWrap: true,
      style: { fontSize: '12px', opacity: 0.55, lineHeight: '16px' },
      children: 'Of',
    });
  });
  it('should have a clear button', () => {
    const field = {
      selections: [
        {
          qField: 'my-field',
          qSelectedFieldSelectionInfo: [],
        },
      ],
      states: ['$'],
    };
    const testRenderer = renderer.create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Clear' } }}>
        <OneField field={field} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(IconButton);
    expect(types).to.have.length(1);
    expect(types[0].props.title).to.equal('Clear');
  });
  it('should have a lock button', () => {
    const field = {
      selections: [
        {
          qField: 'my-field',
          qLocked: true,
          qSelectedFieldSelectionInfo: [],
        },
      ],
      states: ['$'],
    };
    const testRenderer = renderer.create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Lock' } }}>
        <OneField field={field} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(IconButton);
    expect(types).to.have.length(1);
  });
});
