import { detectDefaultConnectionStep } from '../detectDefaultConnectionStep';

describe('detectDefaultConnectionStep()', () => {
  let info = {};

  test('should return 0 if there was no info', () => {
    expect(detectDefaultConnectionStep(null)).toBe(0);
  });

  test('should return 0 if none of integration id or client id was provided', () => {
    info = {};
    expect(detectDefaultConnectionStep(info)).toBe(0);
  });

  test('should return 1 if there was `isWebIntegrationIdProvided`', () => {
    info = { isWebIntegrationIdProvided: true };
    expect(detectDefaultConnectionStep(info)).toBe(1);
  });

  test('should return 2 if there was `isClientIdProvided`', () => {
    info = { isClientIdProvided: true };
    expect(detectDefaultConnectionStep(info)).toBe(2);
  });
});
