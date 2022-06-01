/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-no-constructed-context-values */

import React from 'react';
import { create, act } from 'react-test-renderer';
import { IconButton, Divider, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

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
    [require.resolve('@mui/material/styles'), () => ({ styled })],
    [
      require.resolve('@mui/material'),
      () => ({
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
          <InstanceContext.Provider value={{ translator: { get: (s) => s }, keyboardNavigation: true }}>
            <ActionsToolbar {...props} />
          </InstanceContext.Provider>
        );
      });
    };
    update = async (props) => {
      await act(async () => {
        renderer.update(
          <InstanceContext.Provider value={{ translator: { get: (s) => s }, keyboardNavigation: true }}>
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

  it.skip('should set spacing', async () => {
    const validate = (cnt) => {
      const items = renderer.root.findAllByType(Grid).filter((i) => i.props.className);
      expect(items).to.have.length(cnt);
      items.forEach((item, ix) => {
        if (ix === 0) {
          expect(item.props.className).to.match(/^makeStyles-firstItemSpacing-\d+$/);
        }
        if (ix === items.length - 1) {
          expect(item.props.className).to.match(/^makeStyles-lastItemSpacing-\d+$/);
        }
        if (ix !== 0 && ix !== items.length - 1) {
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

    // 1 custom action
    await render({ actions: [actions[0]] });
    expect(renderer.root.findAllByType(Grid).filter((i) => i.props.className)).to.have.length(0);
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

  describe('keyboard navigation', () => {
    let buttonsMock;
    let focusHandler;
    let actions;
    let focusCallbacks;
    const actionsRefMock = { querySelectorAll: () => buttonsMock };

    beforeEach(() => {
      focusCallbacks = {};
      buttonsMock = ['target-0', 'target-1'];
      focusHandler = {
        refocusContent: sandbox.spy(),
        on: (name, cb) => {
          focusCallbacks[name] = cb;
        },
      };
      actions = [1, 2].map((key) => ({
        key,
        enabled: true,
        action: sandbox.spy(),
      }));
    });

    it('should call focusHandler.refocusContent when tabbing from last button', async () => {
      await render({ actions, focusHandler, actionsRefMock, popover: { show: true } });
      const container = renderer.root.findAllByType(Grid).find((i) => i.props && i.props.container);
      const tabEvent = {
        key: 'Tab',
        preventDefault: sandbox.spy(),
        stopPropagation: sandbox.spy(),
        target: buttonsMock[1], // last button
      };
      container.props.onKeyDown(tabEvent);

      expect(focusHandler.refocusContent).to.have.been.calledOnce;
      expect(tabEvent.preventDefault).to.have.been.calledOnce;
      expect(tabEvent.stopPropagation).to.have.been.calledOnce;
    });

    it('should call focusHandler.refocusContent when shift tabbing from first button', async () => {
      await render({ actions, focusHandler, actionsRefMock, popover: { show: true } });
      const container = renderer.root.findAllByType(Grid).find((i) => i.props && i.props.container);
      const tabEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: sandbox.spy(),
        stopPropagation: sandbox.spy(),
        target: buttonsMock[0], // first button
      };
      container.props.onKeyDown(tabEvent);

      expect(focusHandler.refocusContent).to.have.been.calledOnce;
      expect(tabEvent.preventDefault).to.have.been.calledOnce;
      expect(tabEvent.stopPropagation).to.have.been.calledOnce;
    });

    it('should not call focusHandler.refocusContent when shift tabbing from last button', async () => {
      await render({ actions, focusHandler, actionsRefMock, popover: { show: true } });
      const container = renderer.root.findAllByType(Grid).find((i) => i.props && i.props.container);
      const tabEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: sandbox.spy(),
        stopPropagation: sandbox.spy(),
        target: buttonsMock[1], // first button
      };
      container.props.onKeyDown(tabEvent);

      expect(focusHandler.refocusContent).to.not.have.been.called;
      expect(tabEvent.preventDefault).to.not.have.been.called;
      expect(tabEvent.stopPropagation).to.not.have.been.called;
    });

    it('should add event listeners to focusHandler, with callbacks that focus buttons', async () => {
      buttonsMock = [{ focus: sandbox.spy() }, { focus: sandbox.spy() }];
      await render({ actions, focusHandler, actionsRefMock, popover: { show: true } });
      focusCallbacks.focus_toolbar_first();
      focusCallbacks.focus_toolbar_last();

      expect(buttonsMock[0].focus).to.have.been.calledOnce;
      expect(buttonsMock[1].focus).to.have.been.calledOnce;
    });
  });
});
