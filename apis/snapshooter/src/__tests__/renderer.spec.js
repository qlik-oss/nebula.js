import renderer from '../renderer';

describe('snapshooter', () => {
  let sandbox;
  let nucleus;
  let nebbie;
  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    nucleus = sandbox.stub();
    nucleus.config = {
      snapshot: {
        get: sandbox.stub(),
      },
    };

    nebbie = {
      render: sandbox.stub().returns(Promise.resolve()),
    };
    nucleus.returns(nebbie);

    nucleus.config.snapshot.get.returns(
      Promise.resolve({
        meta: { theme: 'dark', language: 'sv' },
        layout: {
          cube: 'c',
          qInfo: {
            qId: 'xyz',
          },
        },
      })
    );
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should get snapshot with id "abc"', async () => {
    await renderer({ nucleus, snapshot: 'abc' });
    expect(nucleus.config.snapshot.get).to.have.been.calledWithExactly('abc');
  });

  it('should catch snapshot get errors and render the error', async () => {
    nucleus.config.snapshot.get.throws(new Error('meh'));
    const element = {
      setAttribute: sandbox.stub(),
    };
    try {
      await renderer({ nucleus, element, snapshot: '' });
      expect(1).to.equal('a'); // just to make sure this test fails if error is not trown
    } catch (e) {
      /* */
    }
    expect(element.setAttribute).to.have.been.calledWithExactly('data-njs-error', 'meh');
    expect(element.innerHTML).to.eql('<p>meh</p>');
  });

  it('should call nucleus with context theme and language', async () => {
    await renderer({ nucleus, snapshot: '' });
    expect(nucleus.firstCall.args[1]).to.eql({
      context: {
        theme: 'dark',
        language: 'sv',
      },
    });
  });

  it('should mock an app that returns a mocked model', async () => {
    await renderer({ nucleus, snapshot: '' });
    const app = nucleus.firstCall.args[0];
    const model = await app.getObject('xyz');
    expect(model.getLayout).to.be.a('function');
    expect(model.on).to.be.a('function');
    expect(model.once).to.be.a('function');
  });

  it('the mocked model should return the snapshot as layout', async () => {
    await renderer({ nucleus, snapshot: '' });
    const app = nucleus.firstCall.args[0];
    const model = await app.getObject('xyz');
    const ly = await model.getLayout();
    expect(ly).to.eql({
      cube: 'c',
      qInfo: {
        qId: 'xyz',
      },
    });
  });

  it('should reject mocked getObject when id is not matching qId', async () => {
    await renderer({ nucleus, snapshot: '' });
    const app = nucleus.firstCall.args[0];
    try {
      await app.getObject('unknown');
      expect(1).to.equal(0); // should never reach this point
    } catch (e) {
      expect(e.message).to.equal('Could not find an object with id: unknown');
    }
  });

  it('should call nebbie.render() with id when qInfo.qId is truthy', async () => {
    const el = 'el';
    await renderer({ nucleus, element: el, snapshot: '' });
    expect(nebbie.render).to.have.been.calledWithExactly({
      id: 'xyz',
      element: el,
    });
  });

  it('should call nebbie.render() with type when qInfo is falsy', async () => {
    const el = 'el';
    await renderer({
      nucleus,
      element: el,
      snapshot: { meta: {}, layout: { myProp: 'yes', visualization: 'legendary' } },
    });
    expect(nebbie.render).to.have.been.calledWithExactly({
      type: 'legendary',
      element: el,
      properties: { myProp: 'yes', visualization: 'legendary' },
    });
  });

  it('should render error when nebbie.render() throws', async () => {
    const el = {
      setAttribute: sandbox.stub(),
    };
    nebbie.render.throws(new Error('aaaaaaah!'));
    try {
      await renderer({ nucleus, element: el, snapshot: '' });
    } catch (e) {
      expect(e.message).to.eql('aaaaaaah!');
    }
    expect(el.setAttribute).to.have.been.calledWithExactly('data-njs-error', 'aaaaaaah!');
  });
});
