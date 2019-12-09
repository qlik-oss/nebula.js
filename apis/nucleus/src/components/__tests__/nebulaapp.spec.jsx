const mockedReactDOM = { render: sinon.stub() };
const [{ default: boot }] = aw.mock([[require.resolve('react-dom'), () => mockedReactDOM]], ['../NebulaApp']);

describe('<NebulaApp />', () => {
  let sandbox;

  beforeEach(() => {
    mockedReactDOM.render.reset();
    sandbox = sinon.createSandbox();
    const mockedElement = {
      style: {},
      setAttribute: sandbox.spy(),
      appendChild: sandbox.spy(),
    };
    global.document = {
      createElement: sandbox.stub().returns(mockedElement),
      body: mockedElement,
    };
  });
  afterEach(() => {
    sandbox.restore();
    delete global.document;
  });

  it('should render default', () => {
    boot({ app: { id: 'foo' } });
    expect(mockedReactDOM.render.callCount).to.equal(1);
  });
  it('should return api', () => {
    const api = boot({ app: { id: 'foo' } });
    expect(api.add).to.be.a('function');
    expect(api.remove).to.be.a('function');
    expect(api.theme).to.be.a('function');
    expect(api.direction).to.be.a('function');
  });
  it('should add', () => {
    const app = { id: 'foo' };
    const translator = {};
    const api = boot({ app, translator });
    api.add('foo');
    expect(mockedReactDOM.render).to.have.been.calledWith(
      sinon.match({
        props: {
          app,
          translator,
          children: ['foo'],
        },
      })
    );
  });
  it('should remove', () => {
    const app = { id: 'foo' };
    const translator = {};
    const api = boot({ app, translator });
    api.add('foo');
    expect(mockedReactDOM.render).to.have.been.calledWith(
      sinon.match({
        props: {
          app,
          translator,
          children: ['foo'],
        },
      })
    );
    api.remove('bar');
    expect(mockedReactDOM.render).to.have.been.calledWith(
      sinon.match({
        props: {
          app,
          translator,
          children: ['foo'],
        },
      })
    );
    api.remove('foo');
    expect(mockedReactDOM.render).to.have.been.calledWith(
      sinon.match({
        props: {
          app,
          translator,
          children: [],
        },
      })
    );
  });
  it('should theme', () => {
    const app = { id: 'foo' };
    const translator = {};
    const api = boot({ app, translator });
    api.add('foo');
    expect(mockedReactDOM.render).to.have.been.calledWith(
      sinon.match({
        props: {
          app,
          translator,
          children: ['foo'],
          themeName: 'light',
        },
      })
    );
    mockedReactDOM.render.reset();
    api.theme('baz');
    expect(mockedReactDOM.render).to.have.been.calledWith(
      sinon.match({
        props: {
          app,
          translator,
          children: ['foo'],
          themeName: 'baz',
        },
      })
    );
  });
  it('should direction', () => {
    const app = { id: 'foo' };
    const translator = {};
    const api = boot({ app, translator });
    api.add('foo');
    expect(mockedReactDOM.render).to.have.been.calledWith(
      sinon.match({
        props: {
          app,
          translator,
          children: ['foo'],
          direction: undefined,
        },
      })
    );
    mockedReactDOM.render.reset();
    api.direction('rtl');
    expect(mockedReactDOM.render).to.have.been.calledWith(
      sinon.match({
        props: {
          app,
          translator,
          children: ['foo'],
          direction: 'rtl',
        },
      })
    );
  });
});
