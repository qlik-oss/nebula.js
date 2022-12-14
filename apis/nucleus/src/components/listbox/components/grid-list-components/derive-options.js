/* eslint-disable import/prefer-default-export */
const FREQUENCY_MIN_SHOW_WIDTH = 80;

export const getFrequencyAllowed = ({ width, layout, frequencyMode }) => {
  const widthPermitsFreq = width > FREQUENCY_MIN_SHOW_WIDTH;
  const { frequencyEnabled = false } = layout?.qListObject || {};
  const hasValidFreqOption = !['none', undefined].includes(frequencyMode);
  return !!(widthPermitsFreq && (hasValidFreqOption || frequencyEnabled));
};
