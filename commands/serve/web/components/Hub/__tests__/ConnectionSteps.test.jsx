import React from 'react';
import { screen } from '@testing-library/react';
import { useNavigate } from 'react-router';
import { TestRenderer } from '../../../utils';
import ConnectionSteps from '../ConnectionSteps';

import { steps } from '../../../constants/connectionSteps';

describe('<ConnectionSteps />', () => {
  let setErrorMock;
  let navigateMock;

  beforeAll(() => {
    setErrorMock = jest.fn();
    navigateMock = jest.fn();
    jest.mocked(useNavigate).mockReturnValue(navigateMock);
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should render all steps correctly', () => {
    TestRenderer(<ConnectionSteps />);

    steps.map((step) => {
      expect(screen.queryByText(step)).toBeInTheDocument();
    });
  });

  test('should be able to click on first step to go back', async () => {
    const { userEvents } = TestRenderer(<ConnectionSteps />, { activeStep: 2, setError: setErrorMock });

    await userEvents.click(screen.queryByText(steps[0]));

    expect(useNavigate).toHaveBeenCalledTimes(1);
    expect(setErrorMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  test('should not call navigate and setError if there was no glob or error', async () => {
    const { userEvents } = TestRenderer(<ConnectionSteps />, {
      glob: null,
      error: null,
      activeStep: 2,
      setError: setErrorMock,
    });

    await userEvents.click(screen.queryByText(steps[0]));

    expect(setErrorMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
