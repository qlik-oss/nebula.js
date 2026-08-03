import React from 'react';
import { screen } from '@testing-library/react';
import HubLayout from '../HubLayout';
import { TestRenderer } from '../../../utils';
import { steps } from '../../../constants/connectionSteps';

describe('Should render layout', () => {
  beforeAll(() => {
    // useNavigate is already mocked at module level
  });

  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should render connection steps', () => {
    TestRenderer(<HubLayout />);

    steps.map((step) => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });
});
