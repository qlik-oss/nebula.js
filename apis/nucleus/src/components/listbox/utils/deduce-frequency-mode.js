export default function deduceFrequencyMode(pages) {
  const hasPercentSign = pages.some(({ qMatrix }) => qMatrix[0].some((item) => !!item.qFrequency?.match('%')));
  const OTHER = '-'; // treat all other as '-' (change later if we need to identify other modes)
  return hasPercentSign ? 'P' : OTHER;
}
