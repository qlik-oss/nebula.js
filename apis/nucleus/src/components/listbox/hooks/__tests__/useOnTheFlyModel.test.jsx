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
        frequencyMode: 'V',
      };
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].qListObjectDef.qFrequencyMode).toBe('V');
    });

    test('should assign qID', async () => {
      const options = {
        frequencyMode: 'V',
      };
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].qInfo.qId).toBeDefined();
    });

    test('should get frequency value if histogram is enabled', async () => {
      const options = {
        frequencyMode: 'N',
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

    test('should use listLayout to construct layoutOptions properly', async () => {
      const options = {};
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].layoutOptions).toEqual({
        dense: false,
        dataLayout: 'singleColumn',
        layoutOrder: 'row',
        maxVisibleColumns: {
          auto: true,
          maxColumns: 3,
        },
        maxVisibleRows: {
          auto: true,
          maxRows: 3,
        },
      });

      options.listLayout = 'horizontal';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].layoutOptions).toEqual({
        dense: false,
        dataLayout: 'grid',
        layoutOrder: 'column',
        maxVisibleColumns: { auto: true, maxColumns: 3 },
        maxVisibleRows: { auto: false, maxRows: 1 },
      });
    });

    test('should add dense option to layoutOptions props', async () => {
      const options = { dense: true };
      const fieldIdentifier = 'Alpha';
      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].layoutOptions).toEqual({
        dense: true,
        dataLayout: 'singleColumn',
        layoutOrder: 'row',
        maxVisibleColumns: {
          auto: true,
          maxColumns: 3,
        },
        maxVisibleRows: {
          auto: true,
          maxRows: 3,
        },
      });
    });
  });

  describe('on the fly library dimension', () => {
    test('should extract fieldDef from app', async () => {
      const options = {
        histogram: true,
      };
      const fieldIdentifier = { qLibraryId: '123' };
      const fakeDimLayout = { qDim: { qFieldDefs: ['Volume'], qGrouping: 'N' } };
      app.getDimension = jest.fn().mockReturnValue({ getLayout: async () => fakeDimLayout });

      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(app.getDimension).toHaveBeenCalledTimes(1);
      expect(useSessionModel.mock.lastCall[0].frequencyMax.qValueExpression.includes('Volume')).toBe(true);
    });
    test('should use title from qDim', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const fakeDimLayout = { qDim: { qFieldDefs: ['Volume'], title: 'Volume title', qGrouping: 'N' } };
      app.getDimension = jest.fn().mockReturnValue({ getLayout: async () => fakeDimLayout });

      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options: { frequencyMode: 'V' } });
      expect(useSessionModel.mock.lastCall[0].title).toBe('Volume title');
    });
    test('should use title from options if provided', async () => {
      const options = { title: 'Options title' };
      const fieldIdentifier = { qLibraryId: '123' };
      const fakeDimLayout = { qDim: { qFieldDefs: ['Volume'], title: 'Volume title', qGrouping: 'N' } };
      app.getDimension = jest.fn().mockReturnValue({ getLayout: async () => fakeDimLayout });

      await render(useOnTheFlyModel, { app, fieldIdentifier, stateName: '$', options });
      expect(useSessionModel.mock.lastCall[0].title).toBe('Options title');
    });
  });
});
