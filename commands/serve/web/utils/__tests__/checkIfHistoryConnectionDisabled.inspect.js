import { checkIfHistoryConnectionDisabled } from '../checkIfHistoryConnectionDisabled';

describe('checkIfHistoryConnectionDisabled()', () => {
  let item = '';
  let info = {};

  test('should return false if there was no info', () => {
    info = null;
    item = '';
    expect(checkIfHistoryConnectionDisabled({ item, info })).toBe(false);
  });

  test('should return false if there was no match', () => {
    info = {};
    item = '';
    expect(checkIfHistoryConnectionDisabled({ item, info })).toBe(false);
  });

  test('should return false if connection does not have any client or integeration id', () => {
    item = 'wss://some-random-url.qlikdev.com';
    expect(checkIfHistoryConnectionDisabled({ item, info })).toBe(false);
  });

  test('should return false if client id provided and connection has client id in it', () => {
    item = 'wss://some-random-url.qlikdev.com/qlik-client-id=xxx__client_id__xxx';
    info = { isClientIdProvided: true };
    expect(checkIfHistoryConnectionDisabled({ item, info })).toBe(false);
  });

  test('should return true if client id provided and connection does not has client id in it', () => {
    item = 'wss://some-random-url.qlikdev.com/qlik-web-integration-id=xxx__web_integration_id__xxx';
    info = { isClientIdProvided: true };
    expect(checkIfHistoryConnectionDisabled({ item, info })).toBe(true);
  });

  test('should return false if integration id provided and connection has integration id in it', () => {
    item = 'wss://some-random-url.qlikdev.com/qlik-web-integration-id=xxx__web_integration_id__xxx';
    info = { isWebIntegrationIdProvided: true };
    expect(checkIfHistoryConnectionDisabled({ item, info })).toBe(false);
  });

  test('should return true if integration id provided and connection does not has integration id in it', () => {
    item = 'wss://some-random-url.qlikdev.com/qlik-client-id=xxx__client_id__xxx';
    info = { isWebIntegrationIdProvided: true };
    expect(checkIfHistoryConnectionDisabled({ item, info })).toBe(true);
  });

  test('should disable localhost if any of client or integration id was provided', () => {
    item = 'ws://localhost:9076';
    info = { isWebIntegrationIdProvided: true };
    expect(checkIfHistoryConnectionDisabled({ item, info })).toBe(true);
  });
});
