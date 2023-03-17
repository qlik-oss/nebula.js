import { frequencyTextNone } from './constants';

export const joinClassNames = (namesArray) =>
  namesArray
    .filter((c) => !!c)
    .join(' ')
    .trim();

export const getBarWidth = ({ qFrequency, frequencyMax }) => {
  const freqStr = String(qFrequency);
  const isPercent = freqStr.substring(freqStr.length - 1) === '%';
  const freq = parseFloat(isPercent ? freqStr : qFrequency);
  const width = isPercent ? freq : (freq / frequencyMax) * 100;
  return `${width}%`;
};

export const getFrequencyText = (qFrequency) => qFrequency || frequencyTextNone;
