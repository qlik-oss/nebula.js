import { getAppLink } from '../appLinkManager';

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
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should call navigate to correct engine url from localhost', () => {
    info = { engineUrl: 'ws://localhost:1234', enigma: { secure: false, host: 'localhost', port: 1234 } };
    location.search = `engine_url=${info.engineUrl}`;
    getAppLink({ navigate, location, info, targetApp });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(`/dev/engine_url=${info.engineUrl}/app/${targetApp}`);
  });

  test('should call navigate to correct engine url from remote SDE', () => {
    info = {
      engineUrl: 'wss://some-remote.sde.in.eu.qlikdev.com',
      enigma: { secure: true, host: 'some-remote.sde.in.eu.qlikdev.com' },
    };
    location.search = `engine_url=${info.engineUrl}`;
    getAppLink({ navigate, location, info, targetApp });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(`/dev/engine_url=${info.engineUrl}/app/${targetApp}`);
  });

  test('should remove `shouldFetchAppList` if it was in search', () => {
    info = {
      engineUrl: 'wss://some-remote.sde.in.eu.qlikdev.com',
      enigma: { secure: true, host: 'some-remote.sde.in.eu.qlikdev.com' },
    };
    location.search = `engine_url=${info.engineUrl}&shouldFetchAppList=true`;
    getAppLink({ navigate, location, info, targetApp });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(`/dev/engine_url=${info.engineUrl}/app/${targetApp}`);
  });
});
