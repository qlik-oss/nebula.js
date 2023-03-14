export const FREQUENCY_MIN_SHOW_WIDTH = 80;

export default function getFrequencyAllowed({ itemWidth, layout, frequencyMode }) {
  const widthPermitsFreq = itemWidth > FREQUENCY_MIN_SHOW_WIDTH;
  const { frequencyEnabled = false } = layout?.qListObject || {};
  const hasValidFreqOption = !['none', undefined].includes(frequencyMode);
  return !!(widthPermitsFreq && (hasValidFreqOption || frequencyEnabled));
}
