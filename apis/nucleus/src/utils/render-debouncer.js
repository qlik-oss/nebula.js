export default class RenderDebouncer {
  constructor() {
    this.timer = null;
    this.next = null;
    this.running = false;
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

  async doNext() {
    const fn = this.next;
    this.next = null;
    if (fn) {
      await fn();
      this.scheduleNext();
    } else {
      this.stop();
    }
  }

  schedule(fn) {
    this.next = fn;
    this.start();
  }

  stop() {
    if (!this.running) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = null;
    this.running = false;
  }
}
