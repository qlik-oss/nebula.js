import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

const TestHook = forwardRef(({ hook, hookProps }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useExistingModel', () => {
  let sandbox;
  let useOnTheFlyModel;
  let sessionModel;
  let useSessionModel;
  let app;
  let renderer;
  let render;
  let ref;

  beforeEach(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });

    sessionModel = {
      key: 'session-model',
      lock: sandbox.stub(),
      unlock: sandbox.stub(),
    };

    app = {};
    useSessionModel = sandbox.stub().callsFake((def, appModel) => [appModel === null ? undefined : sessionModel]);

    [{ default: useOnTheFlyModel }] = aw.mock(
      [[require.resolve('../../../../hooks/useSessionModel'), () => useSessionModel]],
      ['../useOnTheFlyModel']
    );

    ref = React.createRef();
    render = async (hook, ...hookProps) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={hook} hookProps={hookProps} />);
      });
    };
  });

  afterEach(() => {
    sandbox.reset();
    renderer.unmount();
  });

  describe('from field name', () => {
    it('should use provided frequencyMode', async () => {
      const options = {
        frequencyMode: 'value',
      };
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.args[0][0].qListObjectDef.qFrequencyMode).to.equal('V');
    });

    it('should default to none if provided frequencyMode is invalid', async () => {
      const options = {
        frequencyMode: 'invalid value',
      };
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.args[0][0].qListObjectDef.qFrequencyMode).to.equal('N');
    });

    it('should get frequency value if histogram is enabled', async () => {
      const options = {
        frequencyMode: 'none',
        histogram: true,
      };
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.args[0][0].qListObjectDef.qFrequencyMode).to.equal('V');
    });
  });

  describe('on the fly library dimension', () => {
    it('should extract fieldDef from app', async () => {
      const options = {
        histogram: true,
      };
      const fieldIdentifier = { qLibraryId: '123' };
      const fakeDimLayout = { qDim: { qFieldDefs: ['Volume'] } };
      app.getDimension = sinon.stub().returns({ getLayout: async () => fakeDimLayout });

      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(app.getDimension.callCount).to.equal(1);
      const listdef = useSessionModel.args.pop()[0];
      expect(listdef.frequencyMax.qValueExpression.includes('Volume')).to.be.true;
    });
  });
});
