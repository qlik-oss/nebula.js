import React from 'react';
import { create, act } from 'react-test-renderer';
import QlikSwitchWithLabel from '../QlikSwitchWithLabel';
import QlikSwitchButton from '..';

describe('<QlikSwitchButton />', () => {
  let sandbox;

  let args;
  let renderer;
  let render;
  let setOptions;
  let setOptionsResponse;

  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });
    setOptions = sandbox.stub().callsFake((func) => {
      setOptionsResponse = func({ checkboxes: false, dense: false });
    });
  });

  beforeEach(() => {
    setOptionsResponse = undefined;
    args = {
      config: {
        option: 'checkboxes',
        onChange: undefined,
        label: 'The label',
        helperText: 'Helper text',
        startOn: false,
        iconOn: 'iconOn',
        iconOff: 'iconOff',
      },
      setOptions,
    };
  });

  afterEach(() => {
    sandbox.restore();
    sandbox.reset();
    renderer.unmount();
  });

  describe('Check rendering with different options', () => {
    before(() => {
      render = async (configOverrides = {}) => {
        const config = { ...args.config, ...configOverrides };
        await act(async () => {
          renderer = create(<QlikSwitchButton config={config} setOptions={args.setOptions} />);
        });
      };
    });

    it('should initialize and toggle the set option', async () => {
      await render();
      const switchesWithLabels = renderer.root.findAllByType(QlikSwitchWithLabel);
      expect(switchesWithLabels).to.have.length(1);
      const switchProps = switchesWithLabels[0].props;
      expect(switchProps.label).to.equal('The label');
      expect(switchProps.helperText).to.equal('Helper text');
      expect(switchProps.startOn).to.equal(false);
      expect(switchProps.styling.iconOn).to.equal('iconOn');
      expect(switchProps.styling.iconOff).to.equal('iconOff');
      expect(switchProps.styling.iconOff).to.equal('iconOff');
      expect(switchProps.onChange).to.be.a('function');
      expect(setOptions).not.called;

      expect(setOptionsResponse).to.equal(undefined);
      switchProps.onChange(true);
      expect(setOptions).calledOnce;
      expect(setOptionsResponse).to.deep.equal({
        checkboxes: true,
        dense: false,
      });
      switchProps.onChange(false);
      expect(setOptionsResponse).to.deep.equal({
        checkboxes: false,
        dense: false,
      });
    });

    it('should not toggle unsupported options', async () => {
      await render({
        option: 'notSupportedOption',
      });
      const switchesWithLabels = renderer.root.findAllByType(QlikSwitchWithLabel);
      const switchProps = switchesWithLabels[0].props;
      expect(setOptionsResponse).to.equal(undefined);
      expect(() => switchProps.onChange(true)).to.throw(
        'Setting these Listbox option(s) is disallowed: notSupportedOption.'
      );
    });

    it('should toggle inverted', async () => {
      await render({
        option: 'checkboxes',
        invert: true,
      });
      const switchesWithLabels = renderer.root.findAllByType(QlikSwitchWithLabel);
      const switchProps = switchesWithLabels[0].props;
      switchProps.onChange(true);
      expect(setOptionsResponse, 'switch on -> false (inverted)').to.deep.equal({
        checkboxes: false,
        dense: false,
      });
      switchProps.onChange(false, 'switch off -> true (inverted)');
      expect(setOptionsResponse).to.deep.equal({
        checkboxes: true,
        dense: false,
      });
    });

    it('should toggle multiple options through the onChange function', async () => {
      setOptions.reset();
      await render({
        option: undefined,
        onChange(value, { setOptions: setOpts }) {
          setOpts({
            checkboxes: true,
            search: true,
          });
        },
      });
      const switchesWithLabels = renderer.root.findAllByType(QlikSwitchWithLabel);
      const switchProps = switchesWithLabels[0].props;
      expect(setOptions).not.called;

      switchProps.onChange(true);
      expect(setOptions).calledOnce;
      expect(setOptions.args[0][0]()).to.deep.equal({
        checkboxes: true,
        search: true,
      });
    });

    it('should toggle multiple options through both option and the onChange function', async () => {
      setOptions.reset();
      await render({
        option: 'dense',
        invert: false,
        onChange(value, { setOptions: setOpts }) {
          setOpts({
            checkboxes: true,
            search: true,
          });
        },
      });
      const switchesWithLabels = renderer.root.findAllByType(QlikSwitchWithLabel);
      const switchProps = switchesWithLabels[0].props;
      expect(setOptions).not.called;

      switchProps.onChange(true);
      expect(setOptions).calledTwice;
      expect(setOptions.args[0][0](), 'first call through defined option dense').to.deep.equal({
        dense: true,
      });
      expect(setOptions.args[1][0](), 'second call through onChange with a call to setOptions()').to.deep.equal({
        checkboxes: true,
        search: true,
      });
    });
  });
});
