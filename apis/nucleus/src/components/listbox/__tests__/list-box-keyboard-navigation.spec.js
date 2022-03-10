import getKeyboardNavigation from '../listbox-keyboard-navigation';

describe('keyboard navigation', () => {
  let actions;
  let sandbox;
  let handleKeyDown;

  before(() => {
    global.document = {};
    sandbox = sinon.createSandbox();
    actions = {
      select: sandbox.stub(),
      cancel: sandbox.stub(),
      confirm: sandbox.stub(),
    };
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    handleKeyDown = getKeyboardNavigation(actions);
  });

  it('select values with Space', () => {
    expect(actions.select).not.called;
    expect(actions.confirm).not.called;
    expect(actions.cancel).not.called;

    // Space should select values
    const event = {
      nativeEvent: { keyCode: 32 },
      currentTarget: { getAttribute: sandbox.stub().withArgs('data-n').returns(1) },
      preventDefault: sandbox.stub(),
      stopPropagation: sandbox.stub(),
    };
    handleKeyDown(event);
    expect(actions.select).calledOnce.calledWithExactly([1]);
    expect(event.preventDefault).calledOnce;
    expect(event.stopPropagation).not.called;
  });

  it('confirm selections with Enter', () => {
    const eventConfirm = {
      nativeEvent: { keyCode: 13 },
      preventDefault: sandbox.stub(),
    };
    handleKeyDown(eventConfirm);
    expect(actions.confirm).calledOnce;
  });

  it('cancel selections with Escape', () => {
    const eventCancel = {
      nativeEvent: { keyCode: 27 },
      preventDefault: sandbox.stub(),
    };
    const blur = sandbox.stub();
    global.document.activeElement = { blur };
    handleKeyDown(eventCancel);
    expect(actions.cancel).calledOnce;
    expect(blur).calledOnce;
  });

  it('arrow up should move focus upwards', () => {
    const focus = sandbox.stub();
    const eventArrowUp = {
      nativeEvent: { keyCode: 38 },
      currentTarget: { previousElementSibling: { focus } },
      preventDefault: sandbox.stub(),
    };
    handleKeyDown(eventArrowUp);
    expect(focus).calledOnce;
  });

  it('arrow down should move focus downwards', () => {
    const focus = sandbox.stub();
    const eventArrowDown = {
      nativeEvent: { keyCode: 40 },
      currentTarget: { nextElementSibling: { focus } },
      preventDefault: sandbox.stub(),
    };
    handleKeyDown(eventArrowDown);
    expect(focus).calledOnce;
  });

  it('arrow down with Shift should range select values downwards (current and next element)', () => {
    const focus = sandbox.stub();
    expect(actions.select).not.called;
    const eventArrowDown = {
      nativeEvent: { keyCode: 40, shiftKey: true },
      currentTarget: {
        nextElementSibling: { focus, getAttribute: sandbox.stub().withArgs('data-n').returns(2) },
        getAttribute: sandbox.stub().withArgs('data-n').returns(1),
      },
      preventDefault: sandbox.stub(),
    };
    handleKeyDown(eventArrowDown);
    expect(focus).calledOnce;
    expect(actions.select).calledOnce.calledWithExactly([2], true);
  });

  it('arrow up with Shift should range select values upwards (current and previous element)', () => {
    const focus = sandbox.stub();
    expect(actions.select).not.called;
    const eventArrowUp = {
      nativeEvent: { keyCode: 38, shiftKey: true },
      currentTarget: {
        previousElementSibling: { focus, getAttribute: sandbox.stub().withArgs('data-n').returns(1) },
        getAttribute: sandbox.stub().withArgs('data-n').returns(2),
      },
      preventDefault: sandbox.stub(),
    };
    handleKeyDown(eventArrowUp);
    expect(focus).calledOnce;
    expect(actions.select).calledOnce.calledWithExactly([1], true);
  });
});
