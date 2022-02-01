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
  let ref;
  let render;
  let getUniques;
  let selectValues;
  let applySelectionsOnPages;

  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });

    getUniques = sandbox.stub(listboxSelections, 'getUniques');
    selectValues = sandbox.stub(listboxSelections, 'selectValues');
    applySelectionsOnPages = sandbox.stub(listboxSelections, 'applySelectionsOnPages');
  });

  beforeEach(() => {
    global.document = {
      addEventListener: sandbox.stub(),
      removeEventListener: sandbox.stub(),
    };

    getUniques.callsFake((input) => input);
    selectValues.resolves();
    applySelectionsOnPages.returns('instant pages');

    layout = {
      qListObject: { qDimensionInfo: { qIsOneAndOnlyOne: false } },
    };
    selections = { key: 'selections' };
    pages = [];

    ref = React.createRef();
    render = async () => {
      await act(async () => {
        create(
          <TestHook
            ref={ref}
            hook={useSelectionsInteractions}
            hookProps={[{ layout, selections, pages, doc: global.document }]}
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

  describe('it should behave', () => {
    it('should behave', async () => {
      await render();
      const arg0 = ref.current.result;
      expect(Object.keys(arg0)).to.deep.equal(['instantPages', 'interactionEvents']);
      expect(arg0.instantPages).to.equal('instant pages');
      expect(Object.keys(arg0.interactionEvents)).to.deep.equal(['onMouseDown']);

      expect(applySelectionsOnPages).calledOnce.calledWithExactly([], [], false, false);
      expect(global.document.addEventListener.args[0][0]).to.equal('mouseup');
      expect(global.document.removeEventListener).not.called;

      expect(listboxSelections.selectValues).not.called;

      arg0.interactionEvents.onMouseDown({
        currentTarget: {
          getAttribute: sandbox.stub().withArgs('data-n').returns(23),
        },
      });
      await render();
      expect(listboxSelections.selectValues).calledOnce.calledWithExactly({
        selections: { key: 'selections' },
        elemNumbers: [23],
        isSingleSelect: false,
      });
      const arg1 = ref.current.result;
      expect(applySelectionsOnPages).calledThrice;
      expect(applySelectionsOnPages.args[1]).to.deep.equal([[], [23], false, true]);
      expect(arg1.instantPages).to.equal('instant pages');
    });
  });
});
