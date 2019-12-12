const Cell = () => 'Cell';
const [{ default: glue }] = aw.mock(
  [
    [require.resolve('../Cell'), () => Cell],
    [require.resolve('react-dom'), () => ({ createPortal: () => {} })],
  ],
  ['../glue']
);

describe('glue', () => {
  let sandbox;
  let param;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    param = {
      corona: {
        root: {
          add: sandbox.spy(),
          remove: sandbox.spy(),
        },
      },
      element: {},
      model: {
        once: sandbox.spy(),
      },
      initialSnContext: {},
      initialSnOptions: {},
      onMount: () => {},
    };
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('should glue outside world with react world', () => {
    const [dissolve] = glue(param);
    dissolve();
    expect(param.corona.root.add.callCount).to.equal(1);
    expect(param.corona.root.remove.callCount).to.equal(1);
  });
});
