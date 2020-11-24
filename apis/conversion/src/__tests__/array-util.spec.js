import arrayUtil from '../array-util';

describe('array util', () => {
  describe('isOrderedSubset', () => {
    it('arrays is subset', () => {
      const arr1 = [0, 1, 2, 3, 4, 5];
      const arr2 = [2, 3];
      const arr3 = [0, 3];
      const arr4 = [0, 3, 5];
      expect(arrayUtil.isOrderedSubset(arr1, arr2)).to.be.true;
      expect(arrayUtil.isOrderedSubset(arr1, arr3)).to.be.true;
      expect(arrayUtil.isOrderedSubset(arr1, arr4)).to.be.true;
    });

    it('arrays is not subset', () => {
      const arr1 = [0, 1, 2, 3, 4, 5];
      const arr2 = [3, 2];
      const arr3 = [1, 3, 2];
      expect(arrayUtil.isOrderedSubset(arr1, arr2)).to.be.false;
      expect(arrayUtil.isOrderedSubset(arr1, arr3)).to.be.false;
    });
  });
});
