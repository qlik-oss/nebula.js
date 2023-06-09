export default function getMeasureText(layoutOrNumber) {
  if (!layoutOrNumber) {
    return '';
  }

  const maxGlyphCount =
    typeof layoutOrNumber === 'number' ? layoutOrNumber : layoutOrNumber.qListObject.qDimensionInfo.qApprMaxGlyphCount;
  const measureString = Array(maxGlyphCount).fill('M').join('');
  return measureString;
}
