/* eslint no-param-reassign:0 no-underscore-dangle:0 */

describe('object-selections', () => {
  let create;
  let sandbox;
  let ex;
  let app;
  let model;

  const mixin = api => {
    api.emit = sandbox.stub();
  };

  before(() => {
    sandbox = sinon.createSandbox();
    ex = sandbox.stub();
    [{ default: create }] = aw.mock([['**/event-mixin.js', () => ex]], ['../object-selections.js']);
  });
  afterEach(() => {
    sandbox.reset();
  });
  beforeEach(() => {
    app = {
      _selections: {
        switchModal: sandbox.stub(),
        isModal: sandbox.stub(),
        abortModal: sandbox.stub(),
      },
    };
    model = {
      clearSelections: sandbox.stub(),
      resetMadeSelections: sandbox.stub(),
    };
  });

  it('should initiate with mixin', () => {
    const c = create(model, app);
    expect(ex).to.have.been.calledWithExactly(c);
  });

  it('should cache the instance', () => {
    const c = create(model, app);
    expect(model._selections).to.equal(c);
    expect(ex.callCount).to.equal(1);

    const c2 = create(model, app);
    expect(c2).to.equal(c);
  });

  it('begin() should emit events and swith modal', () => {
    const c = create(model, app);
    mixin(c);
    app._selections.switchModal.returns('switch');

    expect(c.isActive()).to.equal(false);
    expect(c.begin('paths')).to.equal('switch');
    expect(c.emit.firstCall).to.have.been.calledWith('activate');
    expect(c.emit.secondCall).to.have.been.calledWithExactly('activated');
    expect(app._selections.switchModal).to.have.been.calledWithExactly(model, 'paths', true);
    expect(c.isActive()).to.equal(true);
  });

  it('clear() should emit events and reset made selections', () => {
    const c = create(model, app);
    mixin(c);
    app._selections.switchModal.returns('switch');
    model.clearSelections.returns('clear');
    model.resetMadeSelections.returns('reset');

    expect(c.clear()).to.equal('reset');
    expect(c.emit.firstCall).to.have.been.calledWithExactly('cleared');
    expect(model.resetMadeSelections).to.have.been.calledWithExactly();
  });

  it('clear() should emit events and clear selections', () => {
    const c = create(model, app);
    mixin(c);
    app._selections.switchModal.returns('switch');
    model.clearSelections.returns('clear');
    c.setLayout({ qListObject: {} });

    expect(c.clear()).to.equal('clear');
    expect(c.emit.firstCall).to.have.been.calledWithExactly('cleared');
    expect(model.clearSelections).to.have.been.calledWithExactly('/qListObjectDef');
  });

  it('confirm() should emit events and switch modal', () => {
    const c = create(model, app);
    mixin(c);
    app._selections.switchModal.returns('switch');

    expect(c.confirm()).to.equal('switch');
    expect(c.emit.firstCall).to.have.been.calledWithExactly('confirmed');
    expect(c.emit.secondCall).to.have.been.calledWithExactly('deactivated');
    expect(app._selections.switchModal).to.have.been.calledWithExactly(null, null, true);
  });

  it('cancel() should emit events and switch modal', () => {
    const c = create(model, app);
    mixin(c);
    app._selections.switchModal.returns('switch');

    expect(c.cancel()).to.equal('switch');
    expect(c.emit.firstCall).to.have.been.calledWithExactly('canceled');
    expect(c.emit.secondCall).to.have.been.calledWithExactly('deactivated');
    expect(app._selections.switchModal).to.have.been.calledWithExactly(null, null, false, false);
  });

  it('select() should return early if app modality is false', () => {
    const c = create(model, app);
    mixin(c);
    app._selections.isModal.returns(false);
    const begin = sandbox.stub(c, 'begin');
    const b = { then: sandbox.stub() };
    begin.returns(b);

    const s = { params: ['path'] };

    c.select(s);

    expect(begin).to.have.been.calledWithExactly(['path']);
    expect(b.then.callCount).to.equal(0);
  });

  it('select() should apply model selections', async () => {
    const c = create(model, app);
    mixin(c);
    model.myMethod = sandbox.stub();
    app._selections.isModal.returns(true);
    const begin = sandbox.stub(c, 'begin');
    const b = Promise.resolve();
    begin.returns(b);
    model.myMethod.returns(Promise.resolve());

    const s = { method: 'myMethod', params: ['path', 'p'] };

    await c.select(s);

    expect(begin).to.have.been.calledWithExactly(['path']);
    expect(model.myMethod).to.have.been.calledWithExactly('path', 'p');
  });

  it('select() should clear if selection was not successful', async () => {
    const c = create(model, app);
    mixin(c);
    model.myMethod = sandbox.stub();
    app._selections.isModal.returns(true);
    const begin = sandbox.stub(c, 'begin');
    const clear = sandbox.stub(c, 'clear');
    const b = Promise.resolve();
    begin.returns(b);

    model.myMethod.returns(Promise.resolve(false));

    const s = { method: 'myMethod', params: ['path', 'p'] };

    await c.select(s);

    expect(begin).to.have.been.calledWithExactly(['path']);
    expect(clear).to.have.been.calledWithExactly();
  });

  it('canClear should return true when listobject is not locked', () => {
    const c = create(model, app);
    c.setLayout({ qListObject: { qDimensionInfo: { qLocked: true } } });
    expect(c.canClear()).to.equal(false);

    c.setLayout({ qListObject: { qDimensionInfo: { qLocked: false } } });
    expect(c.canClear()).to.equal(true);
  });

  it('canClear should return true when selections have been made', () => {
    const c = create(model, app);
    mixin(c);
    const begin = sandbox.stub(c, 'begin');
    begin.returns({ then: () => {} });
    app._selections.isModal.returns(true);

    c.setLayout({ qSelectionInfo: { qMadeSelections: true } });
    expect(c.canClear()).to.equal(false);

    c.select({ params: [] });
    expect(c.canClear()).to.equal(true);
  });

  it('canConfirm should return true when listobject is not locked', () => {
    const c = create(model, app);
    c.setLayout({ qListObject: { qDimensionInfo: { qLocked: true } } });
    expect(c.canConfirm()).to.equal(false);

    c.setLayout({ qListObject: { qDimensionInfo: { qLocked: false } } });
    expect(c.canConfirm()).to.equal(true);
  });

  it('canConfirm should return true when selections have been made', () => {
    const c = create(model, app);
    mixin(c);
    const begin = sandbox.stub(c, 'begin');
    begin.returns({ then: () => {} });
    app._selections.isModal.returns(true);

    c.setLayout({ qSelectionInfo: { qMadeSelections: true } });
    expect(c.canConfirm()).to.equal(false);

    c.select({ params: [] });
    expect(c.canConfirm()).to.equal(true);
  });

  it('canCancel should return inverse of locked when listobject', () => {
    const c = create(model, app);
    c.setLayout({ qListObject: { qDimensionInfo: { qLocked: true } } });
    expect(c.canCancel()).to.equal(false);

    c.setLayout({ qListObject: { qDimensionInfo: { qLocked: false } } });
    expect(c.canCancel()).to.equal(true);
  });

  it('canCancel should return true when not listobject', () => {
    const c = create(model, app);
    c.setLayout({});
    expect(c.canCancel()).to.equal(true);
  });

  it('isModal should return app isModal', () => {
    const c = create(model, app);
    app._selections.isModal.withArgs(model).returns('maybe');
    expect(c.isModal()).to.equal('maybe');
  });

  it('goModal should switch app modality', () => {
    const c = create(model, app);
    app._selections.switchModal.returns('switch');
    expect(c.goModal('paths')).to.equal('switch');
    expect(app._selections.switchModal).to.have.been.calledWithExactly(model, 'paths', false);
  });

  it('noModal should switch app modality', () => {
    const c = create(model, app);
    app._selections.switchModal.returns('switch');
    expect(c.noModal()).to.equal('switch');
    expect(app._selections.switchModal).to.have.been.calledWithExactly(null, null, false);

    c.noModal(true);
    expect(app._selections.switchModal.secondCall).to.have.been.calledWithExactly(null, null, true);
  });

  it('abortModal should call app abortModal', () => {
    const c = create(model, app);
    app._selections.abortModal.returns('ab');
    expect(c.abortModal()).to.equal('ab');
    expect(app._selections.abortModal).to.have.been.calledWithExactly(true);
  });
});
