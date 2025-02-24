import { getAppLink } from '../appLinkManager';
import * as getCsrfToken from '../getCsrfToken';

jest.mock('../getCsrfToken', () => jest.fn());

describe('getAppLink()', () => {
  let navigate;
  let location;
  let targetApp;
  let info;

  beforeEach(() => {
    info = {};
    navigate = jest.fn();
    location = { search: '' };
    targetApp = 'targetAppId';
    getCsrfToken.mockResolvedValue('A-CSRF-TOKEN');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should call navigate to correct engine url from localhost', async () => {
    info = { engineUrl: 'ws://localhost:1234', enigma: { secure: false, host: 'localhost', port: 1234 } };
    location.search = `engine_url=${info.engineUrl}`;
    await getAppLink({ navigate, location, info, targetApp });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(
      `/dev/engine_url=${info.engineUrl}/app/${targetApp}&qlik-csrf-token=A-CSRF-TOKEN`
    );
  });

  test('should call navigate to correct engine url from localhost without prefix', async () => {
    info = {
      engineUrl: 'ws://localhost:1234',
      enigma: { secure: false, host: 'localhost', port: 1234, prefix: undefined },
    };

    getCsrfToken.mockResolvedValue(null);
    location.search = `engine_url=${info.engineUrl}`;
    await getAppLink({ navigate, location, info, targetApp });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(`/dev/engine_url=${info.engineUrl}/app/${targetApp}`);
  });

  test('should call navigate to correct engine url with prefix', async () => {
    info = {
      engineUrl: 'ws://localhost:1234/prefix',
      enigma: { secure: false, host: 'localhost', port: 1234, prefix: 'prefix' },
    };
    location.search = `engine_url=${info.engineUrl}`;
    await getAppLink({ navigate, location, info, targetApp });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(
      `/dev/engine_url=${info.engineUrl}/app/${targetApp}&qlik-csrf-token=A-CSRF-TOKEN`
    );
  });

  test('should call navigate to correct engine url from remote SDE', async () => {
    info = {
      engineUrl: 'wss://some-remote.sde.in.eu.qlikdev.com',
      enigma: { secure: true, host: 'some-remote.sde.in.eu.qlikdev.com' },
    };
    getCsrfToken.mockResolvedValue(null);
    location.search = `engine_url=${info.engineUrl}`;
    await getAppLink({ navigate, location, info, targetApp });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(`/dev/engine_url=${info.engineUrl}/app/${targetApp}`);
  });

  test('should remove `shouldFetchAppList` if it was in search', async () => {
    info = {
      engineUrl: 'wss://some-remote.sde.in.eu.qlikdev.com',
      enigma: { secure: true, host: 'some-remote.sde.in.eu.qlikdev.com' },
    };
    getCsrfToken.mockResolvedValue(null);
    location.search = `engine_url=${info.engineUrl}&shouldFetchAppList=true`;
    await getAppLink({ navigate, location, info, targetApp });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(`/dev/engine_url=${info.engineUrl}/app/${targetApp}`);
  });
});
