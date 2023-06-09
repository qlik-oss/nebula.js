export default function getFrequencyModeLetter(frequencyMode) {
  let freqLetter;
  switch (true) {
    case ['none', 'N', 'NX_FREQUENCY_NONE'].includes(frequencyMode):
      freqLetter = 'N';
      break;
    case ['value', 'V', 'NX_FREQUENCY_VALUE', 'default'].includes(frequencyMode):
      freqLetter = 'V';
      break;
    case ['percent', 'P', 'NX_FREQUENCY_PERCENT'].includes(frequencyMode):
      freqLetter = 'P';
      break;
    case ['relative', 'R', 'NX_FREQUENCY_RELATIVE'].includes(frequencyMode):
      freqLetter = 'R';
      break;
    default:
      freqLetter = 'N';
      break;
  }
  return freqLetter;
}
