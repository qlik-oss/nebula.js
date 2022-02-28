import React from 'react';
import { create, act } from 'react-test-renderer';

import Switch from '@material-ui/core/Switch';
import QlikSwitchWithLabel from '../QlikSwitchWithLabel';

describe('<QlikSwitchWithLabel />', () => {
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
      label: 'the label',
      helperText: 'the helper text',
      startOn: false,
      onChange,
      iconOn: 'iconOn',
      iconOff: 'iconOff',
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
            <QlikSwitchWithLabel
              label={c.label}
              helperText={c.helperText}
              startOn={c.startOn}
              onChange={c.onChange}
              styling={{
                iconOn: c.iconOn,
                iconOff: c.iconOff,
              }}
            />
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
      const switchesWithLabels = renderer.root.findAllByType(Switch);
      expect(switchesWithLabels).to.have.length(1);
      expect(renderer.root.props.onChange).not.called;

      const labels = renderer.root.findAllByType('label');
      expect(labels).to.have.length(1);
      const [toggle, switchLabel] = labels[0].props.children;
      expect(switchLabel.props.children.props.children).to.equal('the label');

      const p = renderer.root.findByType('p');
      expect(p.props.children.props.children).to.equal('the helper text');

      expect(toggle.props).to.have.keys(['checked', 'onChange', 'iconOn', 'iconOff', 'disabled']);
      expect(toggle.props.checked).to.equal(false);
      await act(() => {
        toggle.props.onChange({ target: { checked: true } });
      });
      expect(renderer.root.props.onChange).calledOnce;
    });
  });
});
