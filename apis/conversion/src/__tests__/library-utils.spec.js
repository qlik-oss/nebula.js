import libraryUtils from '../library-utils';

describe('Library utils', () => {
  describe('findLibraryMeasure', () => {
    it('should return null if there is no measureList', () => {
      expect(libraryUtils.findLibraryItem()).to.equal(null);
      expect(libraryUtils.findLibraryItem('')).to.equal(null);
      expect(libraryUtils.findLibraryItem('id')).to.equal(null);
    });

    it('should return null if there is no match', () => {
      const libraryList = [{ qInfo: { qId: 'id1' } }, { qInfo: { qId: 'id2' } }];
      expect(libraryUtils.findLibraryItem('someId', libraryList)).to.equal(null);
    });

    it('should return measure if there is a match', () => {
      const libraryList = [{ qInfo: { qId: 'id1' } }, { qInfo: { qId: 'id2' } }];
      expect(libraryUtils.findLibraryItem('id1', libraryList)).to.deep.equal({ qInfo: { qId: 'id1' } });
    });
  });
});
