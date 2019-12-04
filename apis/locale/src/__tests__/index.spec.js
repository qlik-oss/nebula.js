describe('locale', () => {
  let translator;
  let sandbox;
  let localeFn;
  before(() => {
    sandbox = sinon.createSandbox();
    translator = sandbox.stub();
    [{ default: localeFn }] = aw.mock([['**/translator.js', () => translator]], ['../index.js']);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should initiate translator with en-US locale by default', () => {
    localeFn();
    expect(translator).to.have.been.calledWithExactly({ initial: 'en-US', fallback: 'en-US' });
  });

  it('should initiate translator with custom locale', () => {
    localeFn({ initial: 'sv-SE', fallback: 'en-UK' });
    expect(translator).to.have.been.calledWithExactly({ initial: 'sv-SE', fallback: 'en-UK' });
  });

  it('should return object containing translator', () => {
    translator.returns('t');
    expect(localeFn()).to.eql({
      translator: 't',
    });
  });
});
