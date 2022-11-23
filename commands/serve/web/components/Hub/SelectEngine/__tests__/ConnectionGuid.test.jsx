import React from 'react';
import { screen } from '@testing-library/react';
import ConnectionGuid from '../ConnectionGuid';
import { TestRenderer } from '../../../../utils';

describe('<ConnectionGuid />', () => {
  test('should render required titles', () => {
    TestRenderer(<ConnectionGuid />);
    [
      'WebSocket URL',
      'Web integration id format:',
      'OAuth Client ID URL format:',
      'Qlik Cloud Services',
      'Qlik Sense Enterprise on Windows',
      'Qlik Core',
      'Qlik Sense Desktop',
    ].map((title) => {
      expect(screen.queryByText(title)).toBeInTheDocument();
    });
  });

  test('should should render required examples', () => {
    TestRenderer(<ConnectionGuid />);
    [
      'wss://qlik.eu.qlikcloud.com?qlik-web-integration-id=xxx',
      'wss://qlik.eu.qlikcloud.com?qlik-client-id=xxx',
      'wss://mycompany.com/bi',
      'ws://localhost:9076',
    ].map((example) => {
      expect(screen.queryByText(example)).toBeInTheDocument();
    });
  });
});
