import React from 'react';
import { screen, act } from '@testing-library/react';
import { TestRenderer } from '../../../../utils/testRenderer';
import ConnectionOptions from '../ConnectionOptions';
import { OptionsToConnect } from '../../../../constants/optionsToConnect';
import * as utilsModule from '../../../../utils';

jest.mock('../../../../utils', () => ({
  __esModule: true,
  ...jest.requireActual('../../../../utils'),
}));

describe('<ConnectionOptions />', () => {
  let detectDefaultConnectionStepMock;

  beforeAll(() => {
    detectDefaultConnectionStepMock = jest.fn();
    jest.spyOn(utilsModule, 'detectDefaultConnectionStep').mockImplementation(detectDefaultConnectionStepMock);
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should render properly', () => {
    TestRenderer(<ConnectionOptions />, { error: null });

    expect(screen.queryByText('New connection with:')).toBeInTheDocument();
    OptionsToConnect.map((opt) => {
      expect(screen.queryByText(opt.label)).toBeInTheDocument();
    });
    expect(screen.getAllByRole('button').length).toBe(1);
    expect(screen.getByPlaceholderText('Engine WebSocket URL')).toBeInTheDocument();
  });

  test('should render webIntegration form properly', async () => {
    const { userEvents } = TestRenderer(<ConnectionOptions />, { error: null });

    await act(() => userEvents.click(screen.queryByText(OptionsToConnect[1].label)));

    // only one engine url input
    expect(screen.queryAllByPlaceholderText(OptionsToConnect[0].formFields[0]).length).toBe(1);

    // integration form inputs
    OptionsToConnect[1].formFields.map((field) => {
      expect(screen.queryByPlaceholderText(field)).toBeInTheDocument();
    });

    // no client id inputs
    expect(screen.queryByPlaceholderText(OptionsToConnect[2].formFields[1])).not.toBeInTheDocument();
  });

  test('should render client id form properly', async () => {
    const { userEvents } = TestRenderer(<ConnectionOptions />, { error: null });

    await act(() => userEvents.click(screen.queryByText(OptionsToConnect[2].label)));

    // only one engine url input
    expect(screen.queryAllByPlaceholderText(OptionsToConnect[0].formFields[0]).length).toBe(1);

    // no integration inputs
    expect(screen.queryByPlaceholderText(OptionsToConnect[1].formFields[1])).not.toBeInTheDocument();

    // client id form inputs
    OptionsToConnect[2].formFields.map((field) => {
      expect(screen.queryByPlaceholderText(field)).toBeInTheDocument();
    });
  });

  test('should detect default Connection step if it was provided from `info`', () => {
    const info = { isWebIntegrationIdProvided: true };
    TestRenderer(<ConnectionOptions />, { error: null, info });

    expect(detectDefaultConnectionStepMock).toHaveBeenCalledTimes(1);
    expect(detectDefaultConnectionStepMock).toHaveBeenLastCalledWith(info);
  });
});
