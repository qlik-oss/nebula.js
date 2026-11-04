export default class RenderDebouncer {
  constructor() {
    this.timer = null;
    this.next = null;
    this.running = false;
    this.generation = 0;
  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.scheduleNext();
  }

  scheduleNext() {
    this.timer = setTimeout(() => {
      this.doNext();
    }, 10);
  }

  doNext() {
    const fn = this.next;
    this.next = null;
    if (fn) {
      // do not wait for fn to settle, a render may stay pending (e.g. waiting for data)
      // and must not block newer renders. fn can use isCurrent to ignore stale results
      const generation = ++this.generation;
      fn(() => generation === this.generation);
      this.scheduleNext();
    } else {
      this.idle();
    }
  }

  schedule(fn) {
    this.next = fn;
    this.start();
  }

  stop() {
    // invalidate in-flight renders
    this.generation++;
    this.next = null;
    this.idle();
  }

  idle() {
    if (!this.running) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = null;
    this.running = false;
  }
}
