const doMock = ({ appThemeFn, getObject, createObject }) =>
  aw.mock(
    [
      ['**/locale/app-locale.js', () => () => ({ translator: () => ({ add: () => {} }) })],
      ['**/selections/index.js', () => ({ createAppSelectionAPI: () => ({}) })],
      ['**/components/NebulaApp.jsx', () => () => ({})],
      ['**/components/selections/AppSelections.jsx', () => () => ({})],
      ['**/object/create-object.js', () => createObject],
      ['**/object/get-object.js', () => getObject],
      ['**/sn/types.js', () => ({ create: () => ({}) })],
      ['**/utils/logger.js', () => () => ({})],
      ['**/app-theme.js', () => appThemeFn],
    ],
    ['../index.js']
  );

describe('nucleus', () => {
  it('should wait for theme before creating object', async () => {
    let waited = false;
    const delay = 1000;
    const appThemeFn = () => ({
      setTheme: () =>
        new Promise(resolve => {
          setTimeout(() => {
            waited = true;
            resolve();
          }, delay);
        }),
    });
    const createObject = () => 'created object';

    const [{ default: create }] = doMock({ appThemeFn, createObject });

    const sandbox = sinon.createSandbox({ useFakeTimers: true });

    const nuked = create();
    const prom = nuked.create();
    sandbox.clock.tick(delay + 100);
    const c = await prom;
    sandbox.clock.restore();
    expect(waited).to.equal(true);
    expect(c).to.equal('created object');
  });

  it('should wait for theme before getting object', async () => {
    let waited = false;
    const delay = 1000;
    const appThemeFn = () => ({
      setTheme: () =>
        new Promise(resolve => {
          setTimeout(() => {
            waited = true;
            resolve();
          }, delay);
        }),
    });
    const getObject = () => 'got object';

    const [{ default: create }] = doMock({ appThemeFn, getObject });

    const sandbox = sinon.createSandbox({ useFakeTimers: true });

    const nuked = create();
    const prom = nuked.get();
    sandbox.clock.tick(delay + 100);
    const c = await prom;
    sandbox.clock.restore();
    expect(waited).to.equal(true);
    expect(c).to.equal('got object');
  });
});
