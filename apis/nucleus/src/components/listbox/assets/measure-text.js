/**
 * @param {EngineAPI.IGenericListLayout|number} layoutOrNumber Either specify the number of characters to return or derive it from the layout's qApprMaxGlyphCount.
 * @returns {string} Containing the most suitable character for performing space measurements.
 */
export default function getMeasureText(layoutOrNumber) {
  if (!layoutOrNumber) {
    return '';
  }
  const maxGlyphCount =
    typeof layoutOrNumber === 'number' ? layoutOrNumber : layoutOrNumber.qListObject.qDimensionInfo.qApprMaxGlyphCount;
  const measureString = Array(maxGlyphCount).fill('M').join('');
  return measureString;
}
