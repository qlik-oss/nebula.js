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

  describe('indexAdded', () => {
    it('should add index 0 correctly', () => {
      const arr1 = [0, 1, 2];
      const arr2 = [1, 0, 2];
      arrayUtil.indexAdded(arr1, 0);
      arrayUtil.indexAdded(arr2, 0);
      expect(arr1).to.deep.equal([1, 2, 3, 0]);
      expect(arr2).to.deep.equal([2, 1, 3, 0]);
    });

    it('should add index 1 correctly', () => {
      const arr1 = [0, 1, 2];
      const arr2 = [1, 0, 2];
      arrayUtil.indexAdded(arr1, 1);
      arrayUtil.indexAdded(arr2, 1);
      expect(arr1).to.deep.equal([0, 2, 3, 1]);
      expect(arr2).to.deep.equal([2, 0, 3, 1]);
    });

    it('should add index 2 correctly', () => {
      const arr1 = [0, 1, 2];
      const arr2 = [1, 0, 2];
      arrayUtil.indexAdded(arr1, 2);
      arrayUtil.indexAdded(arr2, 2);
      expect(arr1).to.deep.equal([0, 1, 3, 2]);
      expect(arr2).to.deep.equal([1, 0, 3, 2]);
    });

    it('should add index 3 correctly', () => {
      const arr1 = [0, 1, 2];
      const arr2 = [1, 0, 2];
      arrayUtil.indexAdded(arr1, 3);
      arrayUtil.indexAdded(arr2, 3);
      expect(arr1).to.deep.equal([0, 1, 2, 3]);
      expect(arr2).to.deep.equal([1, 0, 2, 3]);
    });
  });

  describe('indexRemoved', () => {
    it('should remove index 0 correctly', () => {
      const arr1 = [0, 1, 2, 3];
      const arr2 = [2, 3, 0, 1];
      arrayUtil.indexRemoved(arr1, 0);
      arrayUtil.indexRemoved(arr2, 0);
      expect(arr1).to.deep.equal([0, 1, 2]);
      expect(arr2).to.deep.equal([1, 2, 0]);
    });

    it('should remove index 1 correctly', () => {
      const arr1 = [0, 1, 2, 3];
      const arr2 = [2, 3, 0, 1];
      arrayUtil.indexRemoved(arr1, 1);
      arrayUtil.indexRemoved(arr2, 1);
      expect(arr1).to.deep.equal([0, 1, 2]);
      expect(arr2).to.deep.equal([1, 2, 0]);
    });

    it('should remove index 2 correctly', () => {
      const arr1 = [0, 1, 2, 3];
      const arr2 = [2, 3, 0, 1];
      arrayUtil.indexRemoved(arr1, 2);
      arrayUtil.indexRemoved(arr2, 2);
      expect(arr1).to.deep.equal([0, 1, 2]);
      expect(arr2).to.deep.equal([2, 0, 1]);
    });

    it('should remove index 3 correctly', () => {
      const arr1 = [0, 1, 2, 3];
      const arr2 = [2, 3, 0, 1];
      arrayUtil.indexRemoved(arr1, 3);
      arrayUtil.indexRemoved(arr2, 3);
      expect(arr1).to.deep.equal([0, 1, 2]);
      expect(arr2).to.deep.equal([2, 0, 1]);
    });

    it('should remove index 4 correctly', () => {
      const arr1 = [0, 1, 2, 3];
      const arr2 = [2, 3, 0, 1];
      arrayUtil.indexRemoved(arr1, 4);
      arrayUtil.indexRemoved(arr2, 4);
      expect(arr1).to.deep.equal([1, 2, 3]);
      expect(arr2).to.deep.equal([3, 0, 1]);
    });
  });
});
