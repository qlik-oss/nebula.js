import getFrequencyAllowed from '../frequency-allowed';

describe('frequency allowed', () => {
  const layout = { qListObject: { frequencyEnabled: undefined } };

  describe('getFrequencyAllowed', () => {
    it('should return true', () => {
      layout.qListObject.frequencyEnabled = true;
      const allowed = getFrequencyAllowed({
        width: 81,
        layout,
        frequencyMode: 'not none',
      });
      expect(allowed).toEqual(true);
    });
    it('should return true when frequencyMode is not none although frequencyEnabled is false', () => {
      layout.qListObject.frequencyEnabled = false;
      const allowed = getFrequencyAllowed({
        width: 81,
        layout,
        frequencyMode: 'not none',
      });
      expect(allowed).toEqual(true);
    });
    it('should return true when frequencyEnabled is true although frequencyMode is none', () => {
      layout.qListObject.frequencyEnabled = true;
      const allowed = getFrequencyAllowed({
        width: 81,
        layout,
        frequencyMode: 'none',
      });
      expect(allowed).toEqual(true);
    });
    it('should return false when the listbox is not wide enough', () => {
      layout.qListObject.frequencyEnabled = true;
      const allowed = getFrequencyAllowed({
        width: 80,
        layout,
        frequencyMode: 'not none',
      });
      expect(allowed).toEqual(false);
    });
    it('should return false when frequencyMode is not defined and frequencyEnabled is false', () => {
      layout.qListObject.frequencyEnabled = false;
      const allowed = getFrequencyAllowed({
        width: 81,
        layout,
      });
      expect(allowed).toEqual(false);
    });
  });
});
