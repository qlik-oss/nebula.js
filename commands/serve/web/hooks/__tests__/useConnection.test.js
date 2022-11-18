import { renderHook, act } from '@testing-library/react';
import {
  useConnection,
  handleConnectionSuccess,
  handleConnectionFailure,
  handleSessionNotification,
} from '../useConnection';
import * as connectModule from '../../connect';
import { RouterWrapper } from '../../utils';

describe('useConnection Module', () => {
  let connectMock;
  let renderResult;
  let info;
  let glob;
  let getDocList;
  let getConfiguration;
  let cachedConnectionsData;
  let addCachedConnections;

  beforeEach(() => {
    info = {};
    addCachedConnections = jest.fn();
    cachedConnectionsData = { addCachedConnections };

    getDocList = jest.fn();
    getConfiguration = jest.fn().mockResolvedValue({ qFeatures: { qIsDesktop: false } });
    glob = { getDocList, getConfiguration };
    connectMock = jest.fn().mockResolvedValue(glob);

    jest.spyOn(connectModule, 'connect').mockImplementation(connectMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('useConnection()', () => {
    test('should return correct expected values from hook', async () => {
      await act(async () => {
        renderResult = renderHook(() => useConnection({ info, cachedConnectionsData }), { wrapper: RouterWrapper });
      });

      expect(renderResult.result.current).toMatchObject({
        glob: undefined,
        treatAsDesktop: false,
        error: undefined,
        activeStep: 0,

        setGlobal: expect.any(Function),
        setTreatAsDesktop: expect.any(Function),
        setError: expect.any(Function),
        setActiveStep: expect.any(Function),
      });
    });

    test('should not proceed in any flow and NOT cache the provided connection if already was in "/" path', async () => {
      info = { engineUrl: 'someEngineUrl#01' };

      await act(async () => {
        renderResult = renderHook(() => useConnection({ info, cachedConnectionsData }), { wrapper: RouterWrapper });
      });

      expect(addCachedConnections).toHaveBeenCalledTimes(0);
    });

    test('should not proceed in any flow and NOT cache the provided connection if there was no info or engine url', async () => {
      window.location.assign('/some-other-route');

      await act(async () => {
        renderResult = renderHook(() => useConnection({ info, cachedConnectionsData }), { wrapper: RouterWrapper });
      });

      expect(addCachedConnections).toHaveBeenCalledTimes(0);
    });

    test('should not proceed in any flow and NOT cache the provided connection if info was invalid', async () => {
      window.location.assign('/some-other-route');
      info = { engineUrl: 'someEngineUrl#01', invalid: true };

      await act(async () => {
        renderResult = renderHook(() => useConnection({ info, cachedConnectionsData }), { wrapper: RouterWrapper });
      });

      expect(addCachedConnections).toHaveBeenCalledTimes(0);
      expect(renderResult.result.current.error).toEqual({
        message: 'Connection failed',
        hints: ['The WebSocket URL is not valid.'],
      });
    });

    test('should proceed in success flow and cache the provided connection successfully', async () => {
      window.location.assign('/some-other-route');
      info = { engineUrl: 'someEngineUrl#01' };

      await act(async () => {
        renderResult = renderHook(() => useConnection({ info, cachedConnectionsData }), { wrapper: RouterWrapper });
      });

      expect(addCachedConnections).toHaveBeenCalledTimes(1);
      expect(addCachedConnections).toHaveBeenCalledWith({ info });
    });

    test('should proceed in failure flow and dont cache the provided connection', async () => {
      connectMock.mockRejectedValue({ isRejected: true });
      window.location.assign('/some-other-route');
      info = { engineUrl: 'someEngineUrl#01' };

      await act(async () => {
        renderResult = renderHook(() => useConnection({ info, cachedConnectionsData }), { wrapper: RouterWrapper });
      });

      expect(addCachedConnections).toHaveBeenCalledTimes(0);
    });
  });

  describe('utils()', () => {
    let setGlobal;
    let setTreatAsDesktop;
    let setError;

    beforeEach(() => {
      setGlobal = jest.fn();
      setTreatAsDesktop = jest.fn();
      setError = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    describe('handleConnectionSuccess()', () => {
      test('should setGlobal', async () => {
        info = { engineUrl: 'someEngineUrl#01' };
        handleConnectionSuccess({ result: info, setGlobal, setError, setTreatAsDesktop });

        expect(setGlobal).toHaveBeenCalledTimes(1);
        expect(setGlobal).toHaveBeenCalledWith(info);
      });

      test('should return if there was no `getDocList` in info (result in here) object', async () => {
        getConfiguration.mockResolvedValue({ qFeatures: { qIsDesktop: true } });
        info = { engineUrl: 'someEngineUrl#01', getConfiguration };
        await handleConnectionSuccess({ result: info, setGlobal, setError, setTreatAsDesktop });

        expect(setGlobal).toHaveBeenCalledTimes(1);
        expect(setGlobal).toHaveBeenCalledWith(info);
        expect(setTreatAsDesktop).toHaveBeenCalledTimes(0);
      });

      test('should setTreatAsDesktop if `config.qFeatures.qIsDesktop` set to true', async () => {
        getConfiguration.mockResolvedValue({ qFeatures: { qIsDesktop: true } });
        info = {
          engineUrl: 'someEngineUrl#01',
          getConfiguration,
          getDocList: jest.fn(),
        };
        await handleConnectionSuccess({ result: info, setGlobal, setError, setTreatAsDesktop });

        expect(setTreatAsDesktop).toHaveBeenCalledTimes(1);
        expect(setTreatAsDesktop).toHaveBeenCalledWith(true);
      });

      test('should not set setTreatAsDesktop if ther ewas error while tring to get configuration', async () => {
        getConfiguration.mockRejectedValue(undefined);
        info = {
          engineUrl: 'someEngineUrl#01',
          getConfiguration,
          getDocList: jest.fn(),
        };

        try {
          await handleConnectionSuccess({ result: info, setGlobal, setError, setTreatAsDesktop });
        } catch (error) {
          expect(error.message).toBe('Failed to get configuration');
        }
      });
    });

    describe('handleConnectionFailure()', () => {
      test('should setError', async () => {
        const error = new Error('someError#01');
        handleConnectionFailure({ error, setError });

        expect(setError).toHaveBeenCalledTimes(1);
        expect(setError).toHaveBeenCalledWith({
          hints: [],
          message: 'Something went wrong, check the devtools console',
        });
      });

      test('should setError if error was instance of WebSocket', async () => {
        const error = new Error('someError#01');
        error.target = new WebSocket('ws://localhost:1234');
        info = { engineUrl: 'ws://localhost:1234' };
        handleConnectionFailure({ error, info, setError });

        expect(setError).toHaveBeenCalledTimes(1);
        expect(setError).toHaveBeenCalledWith({
          hints: [],
          message: 'Connection failed to ws://localhost:1234',
        });
      });

      test('should setError and add hint if url was for a qlik cloud SDE and there was no web integration id', async () => {
        const error = new Error('someError#01');
        error.target = new WebSocket('wss://some.remote.sde.qlikdev.com');
        info = { engineUrl: 'wss://some.remote.sde.qlikdev.com' };
        handleConnectionFailure({ error, info, setError });

        expect(setError).toHaveBeenCalledTimes(1);
        expect(setError).toHaveBeenCalledWith({
          hints: [
            'If you are connecting to Qlik Cloud Services, make sure to provide a web integration id or client id.',
          ],
          message: 'Connection failed to wss://some.remote.sde.qlikdev.com',
        });
      });
    });

    describe('handleSessionNotification()', () => {
      const sessionOnMock = jest.fn();

      beforeEach(() => {
        info = {
          session: {
            on: sessionOnMock,
          },
        };
      });

      test('should call `session.on` if it was in info object', () => {
        sessionOnMock.mockImplementationOnce((evt, callback) => {
          if (evt === 'notification:OnAuthenticationInformation') {
            callback({ mustAuthenticate: true });
          }
        });
        handleSessionNotification({ result: info, setError, setGlobal });
        expect(sessionOnMock).toHaveBeenCalledTimes(1);
        expect(sessionOnMock).toHaveBeenCalledWith('notification:OnAuthenticationInformation', expect.any(Function));
        expect(setError).toHaveBeenCalledTimes(1);
        expect(setError).toHaveBeenCalledWith({
          message: 'Could not authenticate.',
          hints: [
            `In your virtual proxy advanced settings in the QMC, make sure to whitelist ${window.location.host}, ensure "Has secure attribute" is enabled and that "SameSite attribute" is set to "None".`,
          ],
        });
        expect(setGlobal).toHaveBeenCalledTimes(1);
        expect(setGlobal).toHaveBeenCalledWith(null);
      });
    });
  });
});
