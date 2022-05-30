import React from 'react';
import { create, act } from 'react-test-renderer';
import { Badge, IconButton, Grid, Typography, Button, List, ListItem, Box } from '@mui/material';

const Popover = (props) => props.children;
const MockedOneField = () => 'OneField';
const MockedMultiState = () => 'MultiState';

const [{ default: More }] = aw.mock(
  [
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({
        useTheme: () => ({
          palette: { selected: {} },
          shape: { borderRadius: '2px' },
        }),
        makeStyles: () => () => ({}),
      }),
    ],
    [
      require.resolve('@mui/material'),
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
    [require.resolve('../OneField'), () => MockedOneField],
    [require.resolve('../MultiState'), () => MockedMultiState],
  ],
  ['../More']
);

describe('<More />', () => {
  let sandbox;
  let renderer;
  let render;
  let multiStateField;
  let field;
  let api;
  let items;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    multiStateField = {
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
      ],
      states: ['$'],
    };
    api = {
      clearField: sandbox.stub(),
    };
    items = [field, multiStateField];
    render = async (rendererOptions = null) => {
      await act(async () => {
        // eslint-disable-next-line react/jsx-props-no-spreading
        renderer = create(<More items={items} api={api} />, rendererOptions);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render', async () => {
    await render();
    const box = renderer.root.findByType(Box);
    const t = box.findByType(Typography);
    expect(t.props.children).to.eql(['+', 2]);
  });

  it('should show more items', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(async () => grid.props.onClick({ currentTarget: { contains: sandbox.stub().returns(true) } }));
    const popover = renderer.root.findByType(Popover);
    const ms = popover.findAllByType(MockedMultiState);
    const of = popover.findAllByType(MockedOneField);
    expect(ms).to.have.length(1);
    expect(of).to.have.length(1);
  });

  it('should close more items', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(async () => grid.props.onClick({ currentTarget: { contains: sandbox.stub().returns(true) } }));
    const popover = renderer.root.findByType(Popover);
    await act(async () => popover.props.onClose());
    expect(() => renderer.root.findByType(Popover)).to.throw();
  });

  it('should show item <OneField />', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(async () => grid.props.onClick({ currentTarget: { contains: sandbox.stub().returns(true) } }));
    const popover = renderer.root.findByType(Popover);
    const lis = popover.findAllByType(ListItem);
    await act(async () => lis[0].props.onClick({ stopPropagation: sandbox.spy() }));
    renderer.root.findByType(MockedOneField);
    expect(() => renderer.root.findByType(Popover)).to.throw();
    expect(() => popover.findByType(MockedMultiState)).to.throw();
  });

  it('should close item <OneField />', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(async () => grid.props.onClick({ currentTarget: { contains: sandbox.stub().returns(true) } }));
    const popover = renderer.root.findByType(Popover);
    const lis = popover.findAllByType(ListItem);
    await act(async () => lis[0].props.onClick({ stopPropagation: sandbox.spy() }));
    const of = renderer.root.findByType(MockedOneField);
    await act(async () => of.props.onClose());
    expect(() => renderer.root.findByType(MockedOneField)).to.throw();
  });

  it('should show item <MultiState />', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    grid.props.onClick({ currentTarget: { contains: sandbox.stub().returns(true) } });
    const popover = renderer.root.findByType(Popover);
    const lis = popover.findAllByType(ListItem);
    await act(async () => lis[1].props.onClick({ stopPropagation: sandbox.spy() }));
    renderer.root.findByType(MockedMultiState);
    expect(() => renderer.root.findByType(Popover)).to.throw();
    expect(() => popover.findByType(MockedOneField)).to.throw();
  });

  it('should close item <MultiState />', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(async () => grid.props.onClick({ currentTarget: { contains: sandbox.stub().returns(true) } }));
    const popover = renderer.root.findByType(Popover);
    const lis = popover.findAllByType(ListItem);
    await act(async () => lis[1].props.onClick({ stopPropagation: sandbox.spy() }));
    const ms = renderer.root.findByType(MockedMultiState);
    await act(async () => ms.props.onClose());
    expect(() => renderer.root.findByType(MockedMultiState)).to.throw();
  });
});
