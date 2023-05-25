const escapeField = (field) => {
  if (!field) {
    return field;
  }
  if (/^[A-Za-z][A-Za-z0-9_]*$/.test(field)) {
    return field;
  }
  return `[${field.replace(/\]/g, ']]')}]`;
};

export const needToFetchFrequencyMax = (layout) => layout?.frequencyMax === 'fetch';

export const getFrequencyMaxExpression = (field) => {
  const escapedField = escapeField(field);
  return `Max(AGGR(Count(${escapedField}), ${escapedField}))`;
};

export const getFrequencyMax = async (layout, app) => {
  const dimInfo = layout.qListObject.qDimensionInfo;
  const field = dimInfo.qGroupFieldDefs[dimInfo.qGroupPos];
  const expression = getFrequencyMaxExpression(field);
  const evaluadedExpression = await app.evaluateEx(expression);
  return evaluadedExpression.qNumber;
};
export const getFrequencyMaxGlyphCount = (pages) => {
  const freqLengthsArr = pages.map((p) => p.qMatrix.map(([item]) => item.qFrequency?.length ?? 0)).flat();
  const maxCount = freqLengthsArr.length === 0 ? 0 : Math.max(...freqLengthsArr);
  return maxCount;
};
