import RenderDebouncer from '../render-debouncer';

function waitForPromise() {
  return new Promise((resolve) => {
    resolve();
  });
}

describe('RenderDebouncer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  // tick the time in 10 ms steps and run resolved promises in between
  // workaround for using an old sinon.js that do not support clock.tickAsync
  async function tick(time) {
    for (let i = 0; i < time / 10; ++i) {
      jest.advanceTimersByTime(Math.min(time - i * 10, 10));
      // eslint-disable-next-line no-await-in-loop
      await waitForPromise();
    }
  }

  test('should call scheduled function', async () => {
    const fn = jest.fn().mockResolvedValue();
    const debouncer = new RenderDebouncer();
    debouncer.schedule(fn);
    jest.advanceTimersByTime(50);
    await waitForPromise();
    expect(fn).toHaveBeenCalled();
  });

  test('should only call second scheduled function if two are scheduled soon after each other', async () => {
    const fn1 = jest.fn().mockResolvedValue();
    const fn2 = jest.fn().mockResolvedValue();
    const debouncer = new RenderDebouncer();
    debouncer.schedule(fn1);
    jest.advanceTimersByTime(1);
    debouncer.schedule(fn2);
    await tick(50);
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
  });

  test('should both scheduled function if two are scheduled with some time between', async () => {
    const fn1 = jest.fn().mockResolvedValue();
    const fn2 = jest.fn().mockResolvedValue();
    const debouncer = new RenderDebouncer();
    debouncer.schedule(fn1);
    await tick(50);
    debouncer.schedule(fn2);
    await tick(50);
    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
  });

  test('should both scheduled function if two are scheduled with some time between and the first take a long time to run', async () => {
    let resolve;
    const promise = new Promise((r) => {
      resolve = r;
    });
    const fn1 = jest.fn().mockImplementationOnce(() => promise);
    const fn2 = jest.fn().mockResolvedValue();
    const debouncer = new RenderDebouncer();
    debouncer.schedule(fn1);
    await tick(50);
    debouncer.schedule(fn2);
    await tick(50);
    resolve();
    await tick(50);
    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
  });
});
