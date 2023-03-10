import { barBorderWidthPx, barPadPx, barWithCheckboxLeftPadPx, frequencyTextNone } from './constants';

export const joinClassNames = (namesArray) =>
  namesArray
    .filter((c) => !!c)
    .join(' ')
    .trim();

export const getBarWidth = ({ qFrequency, checkboxes, frequencyMax }) => {
  const freqStr = String(qFrequency);
  const isPercent = freqStr.substring(freqStr.length - 1) === '%';
  const freq = parseFloat(isPercent ? freqStr : qFrequency);
  const rightSlice = checkboxes
    ? `(${barWithCheckboxLeftPadPx}px + ${barPadPx + barBorderWidthPx * 2}px)`
    : `${barPadPx * 2 + barBorderWidthPx * 2}px`;
  const width = isPercent ? freq : (freq / frequencyMax) * 100;
  return `calc(${width}% - ${rightSlice})`;
};

export const getFrequencyText = ({ cell }) => {
  if (cell) {
    return cell.qFrequency ? cell.qFrequency : frequencyTextNone;
  }
  return '';
};
