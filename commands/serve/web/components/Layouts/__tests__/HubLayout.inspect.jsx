import React from 'react';
import { screen } from '@testing-library/react';
import * as RouterModule from 'react-router-dom';
import HubLayout from '../HubLayout';
import { TestRenderer } from '../../../utils/testRenderer';
import { steps } from '../../../constants/connectionSteps';

jest.mock('react-router-dom', () => ({ ...jest.requireActual('react-router-dom') }));

describe('Should render layout', () => {
  let useNavigateMock;

  beforeAll(() => {
    useNavigateMock = jest.fn().mockReturnValue('navigate');
    jest.spyOn(RouterModule, 'useNavigate').mockImplementation(useNavigateMock);
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
