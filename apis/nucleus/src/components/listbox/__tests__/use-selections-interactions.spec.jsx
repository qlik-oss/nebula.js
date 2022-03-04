import * as React from 'react';
import { create, act } from 'react-test-renderer';
import * as listboxSelections from '../listbox-selections';

import useSelectionsInteractions from '../useSelectionsInteractions';

const TestHook = React.forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  React.useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('use-listbox-interactions', () => {
  let sandbox;
  let layout;
  let selections;
  let pages;
  let selectDisabled;
  let ref;
  let render;
  let getUniques;
  let selectValues;
  let applySelectionsOnPages;
  let fillRange;
  let getSelectedValues;
  let getElemNumbersFromPages;

  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });

    getUniques = sandbox.stub(listboxSelections, 'getUniques');
    selectValues = sandbox.stub(listboxSelections, 'selectValues');
    applySelectionsOnPages = sandbox.stub(listboxSelections, 'applySelectionsOnPages');
    fillRange = sandbox.stub(listboxSelections, 'fillRange');
    getSelectedValues = sandbox.stub(listboxSelections, 'getSelectedValues');
    getElemNumbersFromPages = sandbox.stub(listboxSelections, 'getElemNumbersFromPages');
  });

  beforeEach(() => {
    global.document = {
      addEventListener: sandbox.stub(),
      removeEventListener: sandbox.stub(),
    };

    getUniques.callsFake((input) => input);
    selectValues.resolves();
    applySelectionsOnPages.returns([]);
    fillRange.callsFake((arr) => arr);
    getSelectedValues.returns([]);
    getElemNumbersFromPages.returns([]);

    layout = {
      qListObject: { qDimensionInfo: { qIsOneAndOnlyOne: false } },
    };
    selections = { key: 'selections' };
    pages = [];
    selectDisabled = () => false;

    ref = React.createRef();
    render = async (overrides = {}) => {
      await act(async () => {
        create(
          <TestHook
            ref={ref}
            hook={useSelectionsInteractions}
            hookProps={[
              { layout, selections, rangeSelect: false, pages, selectDisabled, doc: global.document, ...overrides },
            ]}
          />
        );
      });
    };
  });

  afterEach(() => {
    sandbox.reset();
    delete global.document;
  });

  after(() => {
    sandbox.restore();
  });

  describe('it should behave without range select', () => {
    describe('should return expected listeners', () => {
      it('Without range', async () => {
        await render();
        const arg0 = ref.current.result;
        expect(Object.keys(arg0).sort()).to.deep.equal(['instantPages', 'interactionEvents']);
        expect(arg0.instantPages).to.deep.equal([]);
        expect(Object.keys(arg0.interactionEvents).sort()).to.deep.equal(['onMouseDown', 'onMouseUp']);
      });
      it('With range', async () => {
        await render({ rangeSelect: true });
        const arg0 = ref.current.result;
        expect(Object.keys(arg0).sort()).to.deep.equal(['instantPages', 'interactionEvents']);
        expect(arg0.instantPages).to.deep.equal([]);
        expect(Object.keys(arg0.interactionEvents).sort()).to.deep.equal(['onMouseDown', 'onMouseEnter', 'onMouseUp']);
      });
      it('With checkboxes', async () => {
        await render({ checkboxes: true });
        const arg0 = ref.current.result;
        expect(Object.keys(arg0).sort()).to.deep.equal(['instantPages', 'interactionEvents']);
        expect(arg0.instantPages).to.deep.equal([]);
        expect(Object.keys(arg0.interactionEvents).sort()).to.deep.equal(['onClick']);
      });
    });

    it('should select a value', async () => {
      await render();
      const arg0 = ref.current.result;

      expect(applySelectionsOnPages).not.called;
      const [eventName, docMouseUpListener] = global.document.addEventListener.args[0];
      expect(eventName).to.equal('mouseup');
      expect(global.document.removeEventListener).not.called;

      expect(listboxSelections.selectValues).not.called;

      await act(() => {
        arg0.interactionEvents.onMouseDown({
          currentTarget: {
            getAttribute: sandbox.stub().withArgs('data-n').returns(23),
          },
        });
      });

      const arg1 = ref.current.result;

      expect(listboxSelections.selectValues, 'since mouseup has not been called yet').not.called;
      expect(arg1.instantPages).to.deep.equal([]);

      await act(() => {
        docMouseUpListener(); // trigger doc mouseup listener to set mouseDown => false
      });

      const arg2 = ref.current.result;

      expect(listboxSelections.selectValues).calledOnce.calledWithExactly({
        selections: { key: 'selections' },
        elemNumbers: [23],
        isSingleSelect: false,
      });
      expect(applySelectionsOnPages).calledOnce;
      expect(applySelectionsOnPages.args[0]).to.deep.equal([[], [23]]);
      expect(arg2.instantPages).to.deep.equal([]);
    });

    it('should unselect a value', async () => {
      getSelectedValues.returns([24]); // mock element nbr 24 as already selected
      await render();
      const arg0 = ref.current.result;

      await act(() => {
        arg0.interactionEvents.onMouseDown({
          currentTarget: {
            getAttribute: sandbox.stub().withArgs('data-n').returns(24), // fake mousedown on element nbr 24
          },
        });
      });

      expect(applySelectionsOnPages).calledOnce;
      expect(applySelectionsOnPages.args[0]).to.deep.equal([[], [24]]);
      expect(listboxSelections.selectValues, 'should only preselect - not select - while mousedown').not.called;
      const [, docMouseUpListener] = global.document.addEventListener.args[0];

      await act(() => {
        docMouseUpListener();
      });

      expect(listboxSelections.selectValues).calledOnce.calledWithExactly({
        selections: { key: 'selections' },
        elemNumbers: [24],
        isSingleSelect: false,
      });

      expect(applySelectionsOnPages, 'should not set instant pages again (after mouseup)').calledOnce;
    });
  });

  describe('it should behave with range select', () => {
    it('should return expected stuff', async () => {
      await render({ rangeSelect: true });
      const arg0 = ref.current.result;
      expect(Object.keys(arg0)).to.deep.equal(['instantPages', 'interactionEvents']);
      expect(arg0.instantPages).to.deep.equal([]);
      expect(Object.keys(arg0.interactionEvents).sort()).to.deep.equal(['onMouseDown', 'onMouseEnter', 'onMouseUp']);
    });

    it('should select a range (in theory)', async () => {
      getElemNumbersFromPages.returns([24, 25, 26, 27, 28, 29, 30, 31]);

      await render({ rangeSelect: true });

      expect(applySelectionsOnPages.callCount).to.equal(0);

      // Simulate a typical select range scenario.
      await act(() => {
        ref.current.result.interactionEvents.onMouseDown({
          currentTarget: {
            getAttribute: sandbox.stub().withArgs('data-n').returns(24),
          },
        });
      });
      expect(applySelectionsOnPages.callCount).to.equal(1);
      await act(() => {
        ref.current.result.interactionEvents.onMouseEnter({
          currentTarget: {
            getAttribute: sandbox.stub().withArgs('data-n').returns(25),
          },
        });
      });
      expect(applySelectionsOnPages.callCount).to.equal(2);
      await act(() => {
        ref.current.result.interactionEvents.onMouseEnter({
          currentTarget: {
            getAttribute: sandbox.stub().withArgs('data-n').returns(28),
          },
        });
      });
      await act(() => {
        ref.current.result.interactionEvents.onMouseUp({
          currentTarget: {
            getAttribute: sandbox.stub().withArgs('data-n').returns(30),
          },
        });
      });
      await act(() => {
        const [, docMouseUpListener] = global.document.addEventListener.args.pop();
        docMouseUpListener();
      });

      expect(applySelectionsOnPages.callCount, 'should pre-select once for each new value').to.equal(4);
      expect(listboxSelections.selectValues).calledOnce.calledWithExactly({
        selections: { key: 'selections' },
        elemNumbers: [24, 25, 28, 30], // without mocking fillRange this range would be filled
        isSingleSelect: false,
      });

      // Should pre-select "cumulative", once for each new value
      expect(applySelectionsOnPages.args[0]).to.deep.equal([[], [24]]);
      expect(applySelectionsOnPages.args[1]).to.deep.equal([[], [24, 25]]);
      expect(applySelectionsOnPages.args[2]).to.deep.equal([[], [24, 25, 28]]);
      expect(applySelectionsOnPages.args[3]).to.deep.equal([[], [24, 25, 28, 30]]);
    });

    it('Should "toggle" checkboxes', async () => {
      await render({ checkboxes: true });
      const startCallCount = applySelectionsOnPages.callCount;
      await act(() => {
        ref.current.result.interactionEvents.onClick({
          currentTarget: {
            getAttribute: sandbox.stub().withArgs('data-n').returns(24),
          },
        });
      });
      expect(applySelectionsOnPages.callCount).to.equal(startCallCount + 1);
      expect(applySelectionsOnPages.args[startCallCount]).to.deep.equal([[], [24]]);
      await act(() => {
        ref.current.result.interactionEvents.onClick({
          currentTarget: {
            getAttribute: sandbox.stub().withArgs('data-n').returns(24),
          },
        });
      });
      expect(applySelectionsOnPages.args[startCallCount + 1]).to.deep.equal([[], [24]]);
    });
  });
});
