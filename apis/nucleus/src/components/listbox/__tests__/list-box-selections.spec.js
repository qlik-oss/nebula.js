import * as listboxSelections from '../listbox-selections';

describe('Listbox selections', () => {
  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  describe('selectValues', () => {
    let selections;

    beforeEach(() => {
      selections = { select: sandbox.stub().resolves(true) };
    });

    it('should call select', () => {
      listboxSelections
        .selectValues({ selections, elemNumbers: [1, 2, 4], isSingleSelect: false })
        .then((successStory) => {
          expect(successStory).to.equal(true);
        });
      expect(selections.select).calledOnce.calledWithExactly({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', [1, 2, 4], true],
      });
    });

    it('should call select with toggle false when single select', () => {
      listboxSelections.selectValues({ selections, elemNumbers: [2], isSingleSelect: true }).then((successStory) => {
        expect(successStory).to.equal(true);
      });
      expect(selections.select).calledOnce.calledWithExactly({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', [2], false],
      });
    });

    it('should not call select when NaN values exist', () => {
      listboxSelections
        .selectValues({ selections, elemNumbers: [1, NaN, 4], isSingleSelect: false })
        .then((successStory) => {
          expect(successStory).to.equal(false);
        });
      expect(selections.select).not.called;
    });

    it('should handle select failure and then resolve false', () => {
      selections.select.rejects(false);
      listboxSelections
        .selectValues({ selections, elemNumbers: [1, 2, 4], isSingleSelect: false })
        .then((successStory) => {
          expect(successStory).to.equal(false);
        });
      expect(selections.select).calledOnce;
    });
  });
});
