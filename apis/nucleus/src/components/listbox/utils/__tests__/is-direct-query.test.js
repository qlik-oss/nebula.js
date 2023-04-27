const { default: isDirectQueryEnabled } = require('../is-direct-query');

describe('isDirectQuery', () => {
  const appLayout = { qIsDirectQueryMode: false };

  test('should return false since app is not a DQ app', async () => {
    const dq = isDirectQueryEnabled({ appLayout });
    expect(dq).toEqual(false);
  });

  test('should return true since it is a DQ app', async () => {
    appLayout.qIsDirectQueryMode = true;
    const dq = isDirectQueryEnabled({ appLayout });
    expect(dq).toEqual(true);
  });
});
