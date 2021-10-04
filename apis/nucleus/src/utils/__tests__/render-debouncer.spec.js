import RenderDebouncer from '../render-debouncer';

function waitForPromise() {
  return new Promise((resolve) => {
    resolve();
  });
}

describe('RenderDebouncer', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.useFakeTimers();
  });
  afterEach(() => {
    sandbox.restore();
  });

  // tick the time in 10 ms steps and run resolved promises in between
  // workaround for using an old sinon.js that do not support clock.tickAsync
  async function tick(time) {
    for (let i = 0; i < time / 10; ++i) {
      sandbox.clock.tick(Math.min(time - i * 10, 10));
      // eslint-disable-next-line no-await-in-loop
      await waitForPromise();
    }
  }

  it('should call scheduled function', async () => {
    const fn = sinon.stub().resolves();
    const debouncer = new RenderDebouncer();
    debouncer.schedule(fn);
    sandbox.clock.tick(50);
    await waitForPromise();
    expect(fn).to.be.called;
  });

  it('should only call second scheduled function if two are scheduled soon after each other', async () => {
    const fn1 = sinon.stub().resolves();
    const fn2 = sinon.stub().resolves();
    const debouncer = new RenderDebouncer();
    debouncer.schedule(fn1);
    await tick(1);
    debouncer.schedule(fn2);
    await tick(50);
    expect(fn1).to.not.be.called;
    expect(fn2).to.be.called;
  });

  it('should both scheduled function if two are scheduled with some time between', async () => {
    const fn1 = sinon.stub().resolves();
    const fn2 = sinon.stub().resolves();
    const debouncer = new RenderDebouncer();
    debouncer.schedule(fn1);
    await tick(50);
    debouncer.schedule(fn2);
    await tick(50);
    expect(fn1).to.be.called;
    expect(fn2).to.be.called;
  });

  it('should both scheduled function if two are scheduled with some time between and the first take a long time to run', async () => {
    let resolve;
    const promise = new Promise((r) => {
      resolve = r;
    });
    const fn1 = sinon.stub().callsFake(() => promise);
    const fn2 = sinon.stub().resolves();
    const debouncer = new RenderDebouncer();
    debouncer.schedule(fn1);
    await tick(50);
    debouncer.schedule(fn2);
    await tick(50);
    resolve();
    await tick(50);
    expect(fn1).to.be.called;
    expect(fn2).to.be.called;
  });
});
