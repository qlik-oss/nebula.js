import React from 'react';
import { screen } from '@testing-library/react';
import AppList from '../AppList';
import { TestRenderer } from '../../../utils';
import * as useAppListModule from '../../../hooks/useAppList';
import * as utilsModule from '../../../utils';

jest.mock('../../../utils', () => ({
  __esModule: true,
  ...jest.requireActual('../../../utils'),
}));

describe('<AppList />', () => {
  let useAppListMock;
  let getAppLinkMock;

  beforeAll(() => {
    useAppListMock = jest.fn();
    getAppLinkMock = jest.fn();

    jest.spyOn(useAppListModule, 'useAppList').mockImplementation(useAppListMock);
    jest.spyOn(utilsModule, 'getAppLink').mockImplementation(getAppLinkMock);
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should render `Select an App` heading', () => {
    useAppListMock.mockReturnValue({ loading: false });
    TestRenderer(<AppList />);
    expect(screen.queryByText('Select an app')).toBeInTheDocument();
  });

  test('should render loading while getting app list', () => {
    useAppListMock.mockReturnValue({ loading: true });

    TestRenderer(<AppList />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render `No apps found!` if there was no apps in target tenant', () => {
    useAppListMock.mockReturnValue({ loading: false, appList: [] });

    TestRenderer(<AppList />);
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByText('No apps found!')).toBeInTheDocument();
  });

  test('should render app list if there was any app', () => {
    const appList = [
      { qDocName: 'doc#01', qTitle: 'app#01', qDocId: 'id#01' },
      { qDocName: 'doc#02', qTitle: 'app#02', qDocId: 'id#02' },
      { qDocName: 'doc#03', qTitle: 'app#03', qDocId: 'id#03' },
    ];
    useAppListMock.mockReturnValue({ loading: false, appList });

    TestRenderer(<AppList />);

    expect(screen.queryByText('Select an app')).toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    appList.map(({ qDocId, qTitle }) => {
      expect(screen.getByText(qTitle)).toBeInTheDocument();
      expect(screen.getByText(qDocId)).toBeInTheDocument();
    });
  });

  test('should be able to click on app and navigate to it', async () => {
    const appList = [{ qDocName: 'doc#01', qTitle: 'app#01', qDocId: 'id#01' }];
    useAppListMock.mockReturnValue({ loading: false, appList });

    const info = { myInfoObj: true };
    const { userEvents } = TestRenderer(<AppList />, { info });

    await userEvents.click(screen.queryByText(appList[0].qTitle));

    expect(getAppLinkMock).toHaveBeenCalledTimes(1);
    expect(getAppLinkMock).toHaveBeenCalledWith({
      info,
      targetApp: appList[0].qDocId,
      navigate: expect.any(Function),
      location: expect.any(Object),
    });
  });

  test('should choose `qDocName` if `treatAsDesktop` was true while clicking on app name', async () => {
    const appList = [{ qDocName: 'doc#01', qTitle: 'app#01', qDocId: 'id#01' }];
    useAppListMock.mockReturnValue({ loading: false, appList });

    const info = { myInfoObj: true };
    const { userEvents } = TestRenderer(<AppList />, { info, treatAsDesktop: true });

    await userEvents.click(screen.queryByText(appList[0].qTitle));

    expect(getAppLinkMock).toHaveBeenCalledTimes(1);
    expect(getAppLinkMock).toHaveBeenCalledWith(
      expect.objectContaining({
        targetApp: appList[0].qDocName,
      })
    );
  });
});
