/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { IconButton, Divider, Grid, makeStyles } from '@material-ui/core';

const InstanceContext = React.createContext();

const Popover = (props) => props.children || 'popover';

const [{ default: ActionsToolbar }] = aw.mock(
  [
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({
        useTheme: () => ({ spacing: () => {} }),
      }),
    ],
    [require.resolve('../../contexts/InstanceContext'), () => InstanceContext],
    [
      require.resolve('../../hooks/useDefaultSelectionActions'),
      () => () => [{ label: 'clear ' }, { label: 'cancel' }, { label: 'confirm' }],
    ],
    [require.resolve('../ActionsToolbarMore'), () => Popover],
    [
      require.resolve('@material-ui/core'),
      () => ({
        makeStyles,
        IconButton,
        Grid,
        Divider,
        Popover,
      }),
    ],
  ],
  ['../ActionsToolbar']
);

describe('<ActionsToolbar />', () => {
  let sandbox;
  let renderer;
  let render;
  let update;
  let selections;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    selections = {
      show: false,
      api: {
        canClear: sandbox.stub(),
        clear: sandbox.stub(),
        canCancel: sandbox.stub(),
        cancel: sandbox.stub(),
        canConfirm: sandbox.stub(),
        confirm: sandbox.stub(),
      },
      onConfirm: sandbox.spy(),
      onCancel: sandbox.spy(),
    };
    render = async (p) => {
      const props = {
        actions: [],
        ...p,
      };
      await act(async () => {
        renderer = create(
          <InstanceContext.Provider value={{ translator: { get: (s) => s } }}>
            <ActionsToolbar {...props} />
          </InstanceContext.Provider>
        );
      });
    };
    update = async (props) => {
      await act(async () => {
        renderer.update(
          <InstanceContext.Provider value={{ translator: { get: (s) => s } }}>
            <ActionsToolbar {...props} />
          </InstanceContext.Provider>
        );
      });
    };
  });

  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });

  it('should render default', async () => {
    await render();
    expect(renderer.root.props).to.eql({ actions: [] });
  });

  it('should render default selection actions', async () => {
    sandbox.stub(selections, 'show').value(true);
    await render({ selections });
    const selItems = renderer.root.findAllByType(IconButton);
    expect(selItems).to.have.length(3);
  });

  it('should render custom actions', async () => {
    const action = sandbox.spy();
    const actions = [
      {
        key: 'foo',
        label: 'bar',
        enabled: true,
        action,
      },
    ];
    await render({ actions });
    renderer.root.findByType(IconButton);
  });

  it('should not render hidden custom actions', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: sandbox.spy(),
      hidden: true,
    }));
    await render({ actions, selections });
    expect(() => renderer.root.findByType(IconButton)).to.throw();
  });

  it('should render more', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: sandbox.spy(),
    }));
    await render({ actions });
    const items = renderer.root.findAllByType(IconButton);
    const more = items[items.length - 1];
    expect(more.props).to.containSubset({
      title: 'Menu.More',
    });
    expect(items).to.have.length(3);
  });

  it('should render divider', async () => {
    sandbox.stub(selections, 'show').value(true);
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: sandbox.spy(),
    }));
    await render({ actions, selections });
    renderer.root.findByType(Divider);
  });

  it('should render more items', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: sandbox.spy(),
    }));
    await render({ actions });
    const items = renderer.root.findAllByType(IconButton);
    const more = items[items.length - 1];
    more.props.onClick();
    renderer.root.findByType(Popover);
  });

  it('should set spacing', async () => {
    const validate = (cnt) => {
      const items = renderer.root.findAllByType(Grid).filter((i) => i.props.className);
      expect(items).to.have.length(cnt);
      items.forEach((item, ix) => {
        if (ix === 0) {
          expect(item.props.className).to.match(/^makeStyles-firstItemSpacing-\d+$/);
        } else if (ix === items.length - 1) {
          expect(item.props.className).to.match(/^makeStyles-lastItemSpacing-\d+$/);
        } else {
          expect(item.props.className).to.match(/^makeStyles-itemSpacing-\d+$/);
        }
      });
    };

    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      label: key,
      enabled: true,
      action: sandbox.spy(),
    }));
    await render({ actions, selections });
    // 2 custom actions + more
    validate(3);

    sandbox.stub(selections, 'show').value(true);
    await render({ actions, selections });
    // 2 custom actions + more + divider + 3 selection actions
    validate(7);
  });

  it('should render as popover', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: sandbox.spy(),
    }));
    await render({ actions, popover: { show: true } });
    renderer.root.findByType(Popover);
  });

  it('should always start with more menu closed in popover', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: sandbox.spy(),
    }));
    await render({ actions, popover: { show: true } });
    const items = renderer.root.findAllByType(IconButton);
    const more = items[items.length - 1];
    more.props.onClick();
    await update({ actions, popover: { show: false } });
    await update({ actions, popover: { show: true } });
    const popovers = renderer.root.findAllByType(Popover);
    expect(popovers).to.have.length(1);
  });
});
