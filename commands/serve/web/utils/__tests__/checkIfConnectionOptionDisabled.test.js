import { checkIfConnectionOptionDisabled } from '../checkIfConnectionOptionDisabled';

describe('checkIfConnectionOptionDisabled()', () => {
  let label = '';
  let info = {};

  test('should return false if there was no info', () => {
    info = null;
    label = 'some-label';
    expect(checkIfConnectionOptionDisabled({ label, info })).toBe(false);
  });

  test('should return false if none of isWebIntegrationIdProvided or isClientIdProvided provided', () => {
    info = {};
    label = 'some-label';
    expect(checkIfConnectionOptionDisabled({ label, info })).toBe(false);
  });

  describe('isWebIntegrationIdProvided', () => {
    test('should return false if labelKey was web-integration-id', () => {
      label = 'Web Integration Id';
      info = { isWebIntegrationIdProvided: true };

      expect(checkIfConnectionOptionDisabled({ label, info })).toBe(false);
    });

    test('should return true otherwise', () => {
      label = 'Some Other Key';
      info = { isWebIntegrationIdProvided: true };

      expect(checkIfConnectionOptionDisabled({ label, info })).toBe(true);
    });
  });

  describe('isClientIdProvided', () => {
    test('should return false if labelKey was web-integration-id', () => {
      label = 'Client Id';
      info = { isClientIdProvided: true };

      expect(checkIfConnectionOptionDisabled({ label, info })).toBe(false);
    });

    test('should return true otherwise', () => {
      label = 'Some Other Key';
      info = { isClientIdProvided: true };

      expect(checkIfConnectionOptionDisabled({ label, info })).toBe(true);
    });
  });
});
