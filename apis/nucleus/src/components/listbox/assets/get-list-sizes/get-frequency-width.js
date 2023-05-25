import { FREQUENCY_MIN_WIDTH } from '../../constants';

export default function getFrequencyWidth({ frequencyTextWidth, columnWidth }) {
  const maxWidth = Math.round(0.3 * columnWidth);
  const w = Math.max(FREQUENCY_MIN_WIDTH, Math.min(maxWidth, frequencyTextWidth));
  return w;
}
