const { default: isDirectQueryEnabled } = require('../is-direct-query');

describe('isDirectQuery', () => {
  const flags = { isEnabled: jest.fn(() => false) };
  const appLayout = { qIsDirectQueryMode: false };

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('should return false since neither app nor flag supports direct query', async () => {
    const dq = isDirectQueryEnabled({ flags, appLayout });
    expect(dq).toEqual(false);
  });

  test('should return false since app is not DQ', async () => {
    flags.isEnabled.mockReturnValue(true);
    const dq = isDirectQueryEnabled({ flags, appLayout });
    expect(dq).toEqual(false);
  });

  test('should return false since flag is off', async () => {
    appLayout.qIsDirectQueryMode = true;
    const dq = isDirectQueryEnabled({ flags, appLayout });
    expect(dq).toEqual(false);
  });

  test('should return true since both flag and app supports direct query', async () => {
    flags.isEnabled.mockReturnValue(true);
    appLayout.qIsDirectQueryMode = true;
    const dq = isDirectQueryEnabled({ flags, appLayout });
    expect(dq).toEqual(true);
  });
});
