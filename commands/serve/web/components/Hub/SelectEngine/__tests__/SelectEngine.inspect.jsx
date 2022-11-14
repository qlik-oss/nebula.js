import React from 'react';
import { screen } from '@testing-library/react';
import { TestRenderer } from '../../../../utils/testRenderer';
import SelectEngine from '../SelectEngine';
import { OptionsToConnect } from '../../../../constants/optionsToConnect';

describe('<SelectEngine />', () => {
  test('should render properly', () => {
    TestRenderer(<SelectEngine />, { error: null });

    expect(1).toBe(1);
    expect(screen.queryByText('Connect to an engine')).toBeInTheDocument();
    OptionsToConnect.map((opt) => {
      expect(screen.queryByText(opt.label)).toBeInTheDocument();
    });
  });

  test('should render Connection Guid if there was no item in connection history', () => {
    TestRenderer(<SelectEngine />, { error: null, cachedConnectionsData: { cachedConnections: [] } });

    // only check for headings
    [
      'WebSocket URL',
      'Web integration id format:',
      'OAuth Client ID URL format:',
      'Qlik Cloud Services',
      'Qlik Sense Enterprise on Windows',
      'Qlik Core',
      'Qlik Sense Desktop',
    ].map((title) => {
      expect(screen.queryByText(title)).toBeVisible();
    });
  });

  test('should not render Connection Guid if there was item in connection history', () => {
    TestRenderer(<SelectEngine />, {
      error: null,
      cachedConnectionsData: { cachedConnections: ['ws://localhost:9000/cachedConnection#01'] },
    });

    // only check for headings
    [
      'WebSocket URL',
      'Web integration id format:',
      'OAuth Client ID URL format:',
      'Qlik Cloud Services',
      'Qlik Sense Enterprise on Windows',
      'Qlik Core',
      'Qlik Sense Desktop',
    ].map((title) => {
      expect(screen.queryByText(title)).not.toBeVisible();
    });
  });
});
