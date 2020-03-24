import React from 'react';
import { create, act } from 'react-test-renderer';
import { Badge, IconButton, Grid, Typography, Button, List, ListItem, Box } from '@material-ui/core';

const Popover = props => props.children;
const ListBoxPopover = () => null;
const OneField = sinon.stub().returns('one-field');

const InstanceContext = React.createContext();
const [{ default: MultiState }] = aw.mock(
  [
    [require.resolve('../../../contexts/InstanceContext'), () => InstanceContext],
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({
        useTheme: () => ({
          palette: { selected: {} },
        }),
        makeStyles: () => () => ({}),
      }),
    ],
    [
      require.resolve('@material-ui/core'),
      () => ({
        Badge,
        IconButton,
        Grid,
        Typography,
        Popover,
        Button,
        List,
        ListItem,
        Box,
      }),
    ],
    [require.resolve('../OneField'), () => OneField],
    [require.resolve('../../listbox/ListBoxPopover'), () => ListBoxPopover],
  ],
  ['../MultiState']
);

describe('<MultiState />', () => {
  let sandbox;
  let renderer;
  let render;
  let field;
  let api;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    field = {
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
        {
          qField: 'my-field',
          qTotal: 12,
          qStateCounts: {
            qSelected: 1,
            qLocked: 5,
            qExcluded: 0,
            qLockedExcluded: 3,
            qSelectedExcluded: 3,
            qAlternative: 0,
          },
        },
      ],
      states: ['$', 'foo'],
    };
    api = {
      clearField: sandbox.stub(),
    };
    render = async (rendererOptions = null) => {
      await act(async () => {
        // eslint-disable-next-line react/jsx-props-no-spreading
        renderer = create(
          <InstanceContext.Provider value={{ translator: { get: () => '' } }}>
            <MultiState field={field} api={api} />
          </InstanceContext.Provider>,
          rendererOptions
        );
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render', async () => {
    await render();
    expect(renderer.root.props).to.eql({ field, api });
    const res = renderer.root.findAllByType(Badge);
    expect(res).to.have.length(1);
  });

  it('should show fields', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    grid.props.onClick({ currentTarget: { contains: sandbox.stub().returns(true) } });
    const popover = renderer.root.findByType(Popover);
    const items = popover.findAllByType(ListItem);
    expect(items).to.have.length(3);
  });

  it('should close show fields', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    grid.props.onClick({ currentTarget: { contains: sandbox.stub().returns(true) } });
    const popover = renderer.root.findByType(Popover);
    popover.props.onClose();
    expect(() => renderer.root.findByType(Popover)).to.throw();
  });

  it('should show field state', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    grid.props.onClick({ currentTarget: { contains: sandbox.stub().returns(true) } });
    const popover = renderer.root.findByType(Popover);
    const items = popover.findAllByType(ListItem);
    // Show foo state
    items[2].props.onClick({ stopPropagation: sandbox.spy() }, 1);
    const listboxPopover = renderer.root.findByType(ListBoxPopover);
    expect(listboxPopover.props.stateName).to.equal('foo');
  });

  it('should close show field state', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    grid.props.onClick({ currentTarget: { contains: sandbox.stub().returns(true) } });
    const popover = renderer.root.findByType(Popover);
    const items = popover.findAllByType(ListItem);
    // Show foo state
    items[2].props.onClick({ stopPropagation: sandbox.spy() }, 1);
    const listboxPopover = renderer.root.findByType(ListBoxPopover);
    // Close foo state
    listboxPopover.props.close();
    expect(() => renderer.root.findByType(ListBoxPopover)).to.throw();
  });
});
