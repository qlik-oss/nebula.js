import * as listboxSelections from '../listbox-selections';

describe('use-listbox-interactions', () => {
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

  it('getUniques should return unique values', () => {
    expect(listboxSelections.getUniques([1, 1, 2, 5, 7, 7, 7, 1000000, 1000000])).to.deep.equal([1, 2, 5, 7, 1000000]);
    expect(listboxSelections.getUniques([])).to.deep.equal([]);
    expect(listboxSelections.getUniques(['hey hey', 'hey hey'])).to.deep.equal(['hey hey']);
    expect(listboxSelections.getUniques(undefined)).to.equal(undefined);
    expect(listboxSelections.getUniques(null)).to.equal(undefined);
    expect(listboxSelections.getUniques({})).to.equal(undefined);
  });

  it('getSelectedValues should return unique values', () => {
    const pages = [
      {
        qMatrix: [
          [{ qState: 'S', qElemNumber: 0 }],
          [{ qState: 'XS', qElemNumber: 1 }],
          [{ qState: 'L', qElemNumber: 2 }],
          [{ qState: 'A', qElemNumber: 3 }],
          [{ qState: 'XL', qElemNumber: 4 }],
          [{ qState: 'XS', qElemNumber: 5 }],
          [{ qState: 'A', qElemNumber: 6 }],
        ],
      },
    ];

    expect(listboxSelections.getSelectedValues(undefined)).to.deep.equal([]);
    expect(listboxSelections.getSelectedValues(pages)).to.deep.equal([0, 1, 5]);
  });

  describe('applySelectionsOnPages should modify pages so that selections are applied', () => {
    let pages;

    beforeEach(() => {
      pages = [
        {
          qMatrix: [
            [{ qState: 'S', qElemNumber: 0 }],
            [{ qState: 'XS', qElemNumber: 1 }],
            [{ qState: 'L', qElemNumber: 2 }],
            [{ qState: 'A', qElemNumber: 3 }],
            [{ qState: 'XL', qElemNumber: 4 }],
            [{ qState: 'XS', qElemNumber: 5 }],
            [{ qState: 'A', qElemNumber: 6 }],
          ],
        },
      ];
    });

    it('should add selection for element number 2', () => {
      const selectedPages = listboxSelections.applySelectionsOnPages(pages, [2]);
      expect(selectedPages).to.deep.equal([
        {
          qMatrix: [
            [{ qState: 'S', qElemNumber: 0 }, []],
            [{ qState: 'XS', qElemNumber: 1 }, []],
            [{ qState: 'S', qElemNumber: 2 }, []],
            [{ qState: 'A', qElemNumber: 3 }, []],
            [{ qState: 'XL', qElemNumber: 4 }, []],
            [{ qState: 'XS', qElemNumber: 5 }, []],
            [{ qState: 'A', qElemNumber: 6 }, []],
          ],
        },
      ]);
    });

    it('should toggle selection (turn it off)', () => {
      const selectedPages = listboxSelections.applySelectionsOnPages(pages, [0]);
      expect(selectedPages).to.deep.equal([
        {
          qMatrix: [
            [{ qState: 'A', qElemNumber: 0 }, []],
            [{ qState: 'XS', qElemNumber: 1 }, []],
            [{ qState: 'L', qElemNumber: 2 }, []],
            [{ qState: 'A', qElemNumber: 3 }, []],
            [{ qState: 'XL', qElemNumber: 4 }, []],
            [{ qState: 'XS', qElemNumber: 5 }, []],
            [{ qState: 'A', qElemNumber: 6 }, []],
          ],
        },
      ]);
    });

    it('should select a range without toggling any already selected values', () => {
      const selectedPages = listboxSelections.applySelectionsOnPages(pages, [0, 1, 2, 3, 4, 5]);
      expect(selectedPages).to.deep.equal([
        {
          qMatrix: [
            [{ qState: 'S', qElemNumber: 0 }, []],
            [{ qState: 'S', qElemNumber: 1 }, []],
            [{ qState: 'S', qElemNumber: 2 }, []],
            [{ qState: 'S', qElemNumber: 3 }, []],
            [{ qState: 'S', qElemNumber: 4 }, []],
            [{ qState: 'S', qElemNumber: 5 }, []],
            [{ qState: 'A', qElemNumber: 6 }, []],
          ],
        },
      ]);
    });

    it('should deselect all exept the new selection', () => {
      const clearAllButElmNumbers = true;
      const selectedPages = listboxSelections.applySelectionsOnPages(pages, [3], clearAllButElmNumbers);
      expect(selectedPages).to.deep.equal([
        {
          qMatrix: [
            [{ qState: 'A', qElemNumber: 0 }, []],
            [{ qState: 'A', qElemNumber: 1 }, []],
            [{ qState: 'A', qElemNumber: 2 }, []],
            [{ qState: 'S', qElemNumber: 3 }, []],
            [{ qState: 'A', qElemNumber: 4 }, []],
            [{ qState: 'A', qElemNumber: 5 }, []],
            [{ qState: 'A', qElemNumber: 6 }, []],
          ],
        },
      ]);
    });
  });

  describe('selectValues should call the select method', () => {
    let selections;

    beforeEach(() => {
      const SUCCESS = true;
      selections = {
        select: sandbox.stub().resolves(SUCCESS),
      };
    });

    it('should abort if nan values exist', async () => {
      const promise = listboxSelections.selectValues({
        selections,
        elemNumbers: [1, 2, NaN, 4],
        isSingleSelect: false,
      });
      expect(promise.then, 'should return a promise').to.be.a('function');
      const resp = await promise;
      expect(resp, 'should return unsuccessful').to.equal(false);
      expect(selections.select).not.called;
    });

    it('should call select', async () => {
      const resp = await listboxSelections.selectValues({
        selections,
        elemNumbers: [1, 2, 3, 4],
        isSingleSelect: false,
      });
      expect(resp, 'success').to.equal(true);
      expect(selections.select).calledOnce.calledWithExactly({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', [1, 2, 3, 4], true],
      });
    });

    it('single select true should translate to toggle false', async () => {
      const resp = await listboxSelections.selectValues({
        selections,
        elemNumbers: [4],
        isSingleSelect: true,
      });
      expect(resp, 'success').to.equal(true);
      expect(selections.select).calledOnce.calledWithExactly({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', [4], false],
      });
    });

    it('should catch errors in backend call', async () => {
      selections.select.rejects('error');
      expect(async () => {
        await listboxSelections.selectValues({
          selections,
          elemNumbers: [4],
          isSingleSelect: false,
        });
      }).not.to.throw();
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

  describe('getElemNumbersFromPages', () => {
    let pages;

    beforeEach(() => {
      pages = [
        {
          qMatrix: [
            [{ qState: 'S', qElemNumber: 0 }],
            [{ qState: 'XS', qElemNumber: 1 }],
            [{ qState: 'L', qElemNumber: 2 }],
            [{ qState: 'A', qElemNumber: 3 }],
            [{ qState: 'XL', qElemNumber: 4 }],
            [{ qState: 'XS', qElemNumber: 5 }],
            [{ qState: 'A', qElemNumber: 6 }],
          ],
        },
      ];
    });

    it('listboxSelections', () => {
      expect(listboxSelections.getElemNumbersFromPages(undefined)).to.deep.equal([]);
      const resp = listboxSelections.getElemNumbersFromPages(pages);
      expect(resp).to.deep.equal([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('fillRange', () => {
    it('should fill the numbers according to ground-truth array', () => {
      expect(listboxSelections.fillRange([], [])).to.deep.equal([]);
      expect(listboxSelections.fillRange([1, 10], []), 'without ground-truth no range').to.deep.equal([]);

      expect(listboxSelections.fillRange([0, 5], [0, 1, 2, 3, 4, 5, 6])).to.deep.equal([0, 1, 2, 3, 4, 5]);
      expect(listboxSelections.fillRange([0], [0, 1, 2, 3, 4, 5, 6])).to.deep.equal([0]);
      expect(listboxSelections.fillRange([], [0, 1, 2, 3, 4, 5, 6])).to.deep.equal([]);
      expect(listboxSelections.fillRange([1, 6], [0, 1, 8, 16, 6, 2]), 'should fill using ground-truth').to.deep.equal([
        1, 8, 16, 6,
      ]);
    });
  });
});
