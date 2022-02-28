import React from 'react';
import { create, act } from 'react-test-renderer';

import Switch from '@material-ui/core/Switch';
import QlikSwitch from '../QlikSwitch';

describe('<QlikSwitch />', () => {
  let sandbox;

  let args;
  let renderer;
  let render;
  let onChange;

  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });
    onChange = sandbox.stub();
  });

  beforeEach(() => {
    args = {
      checked: false,
      onChange,
      iconOn: undefined,
      iconOff: undefined,
    };
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  describe('Check rendering with different options', () => {
    before(() => {
      render = async (overrides) => {
        const c = { ...args, ...overrides };
        await act(async () => {
          renderer = create(
            <QlikSwitch checked={c.checked} onChange={c.onChange} iconOn={c.iconOn} iconOff={c.iconOff} />
          );
        });
      };
    });

    afterEach(() => {
      sandbox.restore();
      renderer.unmount();
    });

    it('should render and call stuff', async () => {
      await render();
      const muiSwitches = renderer.root.findAllByType(Switch);
      expect(muiSwitches).to.have.length(1);
      const [MuiSwitch] = muiSwitches;
      expect(MuiSwitch.props.checked).to.equal(false);
      expect(MuiSwitch.props.onChange).not.called;
    });
  });
});
