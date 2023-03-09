import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';
import useOnTheFlyModel from '../useOnTheFlyModel';
import * as useSessionModelModule from '../../../../hooks/useSessionModel';

const TestHook = forwardRef(({ hook, hookProps }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useExistingModel', () => {
  let sessionModel;
  let useSessionModel;
  let app;
  let renderer;
  let render;
  let ref;

  beforeEach(() => {
    jest.useFakeTimers();

    sessionModel = {
      key: 'session-model',
      lock: jest.fn(),
      unlock: jest.fn(),
    };

    app = {};
    useSessionModel = jest.fn().mockImplementation((def, appModel) => [appModel === null ? undefined : sessionModel]);

    jest.spyOn(useSessionModelModule, 'default').mockImplementation(useSessionModel);

    ref = React.createRef();
    render = async (hook, ...hookProps) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={hook} hookProps={hookProps} />);
      });
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    renderer.unmount();
  });

  describe('from field name', () => {
    test('should use provided frequencyMode', async () => {
      const options = {
        frequencyMode: 'value',
      };
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].qListObjectDef.qFrequencyMode).toBe('V');
    });

    test('should assign qID', async () => {
      const options = {
        frequencyMode: 'value',
      };
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].qInfo.qId).toBeDefined();
    });

    test('should default to none if provided frequencyMode is invalid', async () => {
      const options = {
        frequencyMode: 'invalid value',
      };
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].qListObjectDef.qFrequencyMode).toBe('N');
    });

    test('should get frequency value if histogram is enabled', async () => {
      const options = {
        frequencyMode: 'none',
        histogram: true,
      };
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].qListObjectDef.qFrequencyMode).toBe('V');
    });
    test('should use title from fieldIdentifier', async () => {
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$' });
      expect(useSessionModel.mock.lastCall[0].title).toBe('Alpha');
    });
    test('should use title from options if provided', async () => {
      const options = { title: 'Options title' };
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].title).toBe('Options title');
    });
  });

  describe('on the fly library dimension', () => {
    test('should extract fieldDef from app', async () => {
      const options = {
        histogram: true,
      };
      const fieldIdentifier = { qLibraryId: '123' };
      const fakeDimLayout = { qDim: { qFieldDefs: ['Volume'] } };
      app.getDimension = jest.fn().mockReturnValue({ getLayout: async () => fakeDimLayout });

      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(app.getDimension).toHaveBeenCalledTimes(1);
      expect(useSessionModel.mock.lastCall[0].frequencyMax.qValueExpression.includes('Volume')).toBe(true);
    });
    test('should use title from qDim', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const fakeDimLayout = { qDim: { qFieldDefs: ['Volume'], title: 'Volume title' } };
      app.getDimension = jest.fn().mockReturnValue({ getLayout: async () => fakeDimLayout });

      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$' });
      expect(useSessionModel.mock.lastCall[0].title).toBe('Volume title');
    });
    test('should use title from options if provided', async () => {
      const options = { title: 'Options title' };
      const fieldIdentifier = { qLibraryId: '123' };
      const fakeDimLayout = { qDim: { qFieldDefs: ['Volume'], title: 'Volume title' } };
      app.getDimension = jest.fn().mockReturnValue({ getLayout: async () => fakeDimLayout });

      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].title).toBe('Options title');
    });
  });
});
