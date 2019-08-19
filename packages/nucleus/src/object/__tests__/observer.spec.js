import {
  observe,
  unObserve,
  cache,
} from '../observer';

describe('observer', () => {
  beforeEach(() => {
    Object.keys(cache).forEach((key) => delete cache[key]);
  });

  describe('observe', () => {
    it('should initiate observer once', () => {
      const spy = sinon.spy();
      const model = {
        id: 'a',
        on: sinon.spy(),
        once: sinon.spy(),
        getLayout: () => Promise.resolve(),
      };
      observe(model, spy);
      observe(model, spy);
      observe(model, spy);
      expect(model.on.callCount).to.equal(1);
      expect(model.once.callCount).to.equal(1);
    });

    it('should run changed handler on init', async () => {
      const getLayout = sinon.stub().returns(Promise.reject());
      const model = {
        id: 'a',
        on: sinon.spy(),
        once: sinon.spy(),
        getLayout,
      };
      observe(model, null);
      expect(getLayout.callCount).to.equal(1);
    });

    it('should call callback using cached value when state is VALID', () => {
      const spy = sinon.spy();
      cache.a = {
        props: {
          layout: {
            value: 'cached',
            callbacks: [],
            state: 1,
          },
        },
      };
      const model = {
        id: 'a',
        getLayout: sinon.spy(),
      };
      observe(model, spy);
      expect(model.getLayout.callCount).to.equal(0);
      expect(spy).to.have.been.calledWithExactly('cached');
    });

    it('should not call callbacks if model state is CLOSED, CLOSING or CANCELLED', async () => {
      const cb = sinon.spy();
      let onChanged;
      const layoutPromise0 = new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      const layoutPromise1 = new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      const layoutPromise2 = new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      const layoutPromise3 = new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      const model = {
        id: 'a',
        on(e, onChangedHandler) {
          onChanged = onChangedHandler;
        },
        once: sinon.spy(),
        getLayout: sinon.stub(),
      };
      model.getLayout.onCall(0).returns(layoutPromise0);
      model.getLayout.onCall(1).returns(layoutPromise1);
      model.getLayout.onCall(2).returns(layoutPromise2);
      model.getLayout.onCall(3).returns(layoutPromise3);
      observe(model, cb);
      await layoutPromise0;
      expect(cb.callCount).to.equal(1);

      onChanged();
      expect(cache.a.props.layout.state).to.equal(3);
      cache.a.props.layout.state = 5;
      await layoutPromise1;

      onChanged();
      expect(cache.a.props.layout.state).to.equal(3);
      cache.a.props.layout.state = 6;
      await layoutPromise2;

      onChanged();
      expect(cache.a.props.layout.state).to.equal(3);
      cache.a.props.layout.state = 7;
      await layoutPromise3;

      expect(cb.callCount).to.equal(1);
    });

    it('should remove onChanged handler and cached item when model is closed', () => {
      const cb = sinon.spy();
      let onChanged;
      let onClosed;
      const model = {
        id: 'a',
        on(e, onChangedHandler) {
          onChanged = onChangedHandler;
        },
        once(e, onClosedHandler) {
          onClosed = onClosedHandler;
        },
        removeListener: sinon.spy(),
        getLayout: () => Promise.reject(),
      };

      observe(model, cb);
      onClosed();
      expect(model.removeListener).to.have.been.calledWithExactly('changed', onChanged);
      expect(cache.a).to.be.undefined;
    });
  });

  describe('unObserve', () => {
    it('should remove handler', () => {
      const callback = sinon.spy();
      const model = {
        id: 'a',
      };
      cache.a = {
        props: {
          layout: {
            callbacks: [0, 1, callback, 3, 4],
          },
        },
      };
      unObserve(model, callback);
      expect(cache.a.props.layout.callbacks).to.eql([0, 1, 3, 4]);
    });
  });
});
