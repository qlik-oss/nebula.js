import { getFieldKeyboardNavigation, getListboxInlineKeyboardNavigation } from '../listbox-keyboard-navigation';

describe('keyboard navigation', () => {
  let actions;
  let sandbox;
  let handleKeyDownForField;
  let handleKeyDownForListbox;
  let setKeyboardActive;

  before(() => {
    global.document = {};
    sandbox = sinon.createSandbox();
    setKeyboardActive = sandbox.stub();
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
    handleKeyDownForField = getFieldKeyboardNavigation(actions);
    handleKeyDownForListbox = getListboxInlineKeyboardNavigation({ setKeyboardActive });
  });

  describe('handle keyboard navigation on field level', () => {
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
      handleKeyDownForField(event);
      expect(actions.select).calledOnce.calledWithExactly([1]);
      expect(event.preventDefault).calledOnce;
      expect(event.stopPropagation).calledOnce;
    });

    it('confirm selections with Enter', () => {
      const eventConfirm = {
        nativeEvent: { keyCode: 13 },
        preventDefault: sandbox.stub(),
        stopPropagation: sandbox.stub(),
      };
      handleKeyDownForField(eventConfirm);
      expect(actions.confirm).calledOnce;
    });

    it('cancel selections with Escape', () => {
      const eventCancel = {
        nativeEvent: { keyCode: 27 },
        preventDefault: sandbox.stub(),
        stopPropagation: sandbox.stub(),
      };
      handleKeyDownForField(eventCancel);
      expect(actions.cancel).calledOnce;
    });

    it('arrow up should move focus upwards', () => {
      const focus = sandbox.stub();
      const eventArrowUp = {
        nativeEvent: { keyCode: 38 },
        currentTarget: {
          parentElement: {
            previousElementSibling: {
              querySelector: () => ({ focus }),
            },
          },
        },
        preventDefault: sandbox.stub(),
        stopPropagation: sandbox.stub(),
      };
      handleKeyDownForField(eventArrowUp);
      expect(focus).calledOnce;
    });

    it('arrow down should move focus downwards', () => {
      const focus = sandbox.stub();
      const eventArrowDown = {
        nativeEvent: { keyCode: 40 },
        currentTarget: {
          parentElement: {
            nextElementSibling: {
              querySelector: () => ({ focus }),
            },
          },
        },
        preventDefault: sandbox.stub(),
        stopPropagation: sandbox.stub(),
      };
      handleKeyDownForField(eventArrowDown);
      expect(focus).calledOnce;
    });

    it('arrow down with Shift should range select values downwards (current and next element)', () => {
      const focus = sandbox.stub();
      expect(actions.select).not.called;
      const eventArrowDown = {
        nativeEvent: { keyCode: 40, shiftKey: true },
        currentTarget: {
          parentElement: {
            nextElementSibling: {
              querySelector: () => ({ focus, getAttribute: sandbox.stub().withArgs('data-n').returns(2) }),
            },
          },
          getAttribute: sandbox.stub().withArgs('data-n').returns(1),
        },
        preventDefault: sandbox.stub(),
        stopPropagation: sandbox.stub(),
      };
      handleKeyDownForField(eventArrowDown);
      expect(focus).calledOnce;
      expect(actions.select).calledOnce.calledWithExactly([2], true);
    });

    it('arrow up with Shift should range select values upwards (current and previous element)', () => {
      const focus = sandbox.stub();
      expect(actions.select).not.called;
      const eventArrowUp = {
        nativeEvent: { keyCode: 38, shiftKey: true },
        currentTarget: {
          getAttribute: sandbox.stub().withArgs('data-n').returns(2),
          parentElement: {
            previousElementSibling: {
              querySelector: () => ({ focus, getAttribute: sandbox.stub().withArgs('data-n').returns(1) }),
            },
          },
        },
        preventDefault: sandbox.stub(),
        stopPropagation: sandbox.stub(),
      };
      handleKeyDownForField(eventArrowUp);
      expect(focus).calledOnce;
      expect(actions.select).calledOnce.calledWithExactly([1], true);
    });
  });

  describe('handle keyboard navigation on listbox-inline level', () => {
    it('should focus value with Space', () => {
      const element = { focus: sandbox.stub() };
      const event = {
        currentTarget: {
          querySelector: sandbox.stub().withArgs('.value.selector,.value').returns(element),
        },
        target: {
          classList: { contains: (c) => c === 'listbox-container' },
        },
        nativeEvent: { keyCode: 32 },
        preventDefault: sandbox.stub(),
        stopPropagation: sandbox.stub(),
      };
      handleKeyDownForListbox(event);
      expect(element.focus).calledOnce;
      expect(event.preventDefault).calledOnce;
      expect(event.stopPropagation).not.called;
      expect(setKeyboardActive).calledOnce.calledWith(true);
    });

    it('should not focus value with Space when target is not listbox-container', () => {
      const element = { focus: sandbox.stub() };
      const event = {
        currentTarget: {
          querySelector: sandbox.stub().withArgs('.value.selector,.value').returns(element),
        },
        target: {
          classList: { contains: (c) => c === 'listbox-container' },
        },
        nativeEvent: { keyCode: 32 },
        preventDefault: sandbox.stub(),
        stopPropagation: sandbox.stub(),
      };
      handleKeyDownForListbox(event);
      expect(element.focus).calledOnce;
      expect(event.preventDefault).calledOnce;
      expect(event.stopPropagation).not.called;
      expect(setKeyboardActive).calledOnce.calledWith(true);
    });

    it('should focus value with Enter', () => {
      const element = { focus: sandbox.stub() };
      const event = {
        currentTarget: {
          querySelector: sandbox.stub().withArgs('.value.selector,.value').returns(element),
        },
        target: {
          classList: { contains: (c) => c === 'listbox-container' },
        },
        nativeEvent: { keyCode: 13 },
        preventDefault: sandbox.stub(),
        stopPropagation: sandbox.stub(),
      };
      handleKeyDownForListbox(event);
      expect(element.focus).calledOnce;
      expect(event.preventDefault).calledOnce;
      expect(event.stopPropagation).not.called;
      expect(setKeyboardActive).calledOnce.calledWith(true);
    });

    it('should focus container with Escape', () => {
      const element = { focus: sandbox.stub() };
      const event = {
        currentTarget: element,
        nativeEvent: { keyCode: 27 },
        preventDefault: sandbox.stub(),
        stopPropagation: sandbox.stub(),
      };
      handleKeyDownForListbox(event);
      expect(element.focus).calledOnce;
      expect(event.preventDefault).calledOnce;
      expect(event.stopPropagation).not.called;
      expect(setKeyboardActive).calledOnce.calledWith(false);
    });
    it('not matched key should not call event methods', () => {
      const element = { focus: sandbox.stub() };
      const event = {
        currentTarget: element,
        nativeEvent: { keyCode: 99 },
        preventDefault: sandbox.stub(),
        stopPropagation: sandbox.stub(),
      };
      handleKeyDownForListbox(event);
      expect(event.preventDefault).not.called;
      expect(event.stopPropagation).not.called;
      expect(setKeyboardActive).not.called;
    });
  });
});
