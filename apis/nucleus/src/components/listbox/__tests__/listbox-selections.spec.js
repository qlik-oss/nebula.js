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
      const toggle = false;
      const selectedPages = listboxSelections.applySelectionsOnPages(pages, [2], toggle);
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
      const toggle = true;
      const selectedPages = listboxSelections.applySelectionsOnPages(pages, [0], toggle);
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
      const toggle = false;
      const selectedPages = listboxSelections.applySelectionsOnPages(pages, [0, 1, 2, 3, 4, 5], toggle);
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
  });
});
