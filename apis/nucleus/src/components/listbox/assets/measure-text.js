export default function getMeasureText(layout) {
  if (!layout) {
    return '';
  }

  const maxGlyphCount = layout.qListObject.qDimensionInfo.qApprMaxGlyphCount;
  let measureString = '';
  for (let i = 0; i < maxGlyphCount; i++) {
    measureString += 'M';
  }
  return measureString;
}
