// eslint-disable-next-line import/prefer-default-export
export async function selectValues({ selections, elemNumbers, isSingleSelect = false }) {
  const SUCCESS = false; // start pessimistic
  let resolved = Promise.resolve(SUCCESS);
  const hasNanValues = elemNumbers.some((elemNumber) => Number.isNaN(elemNumber));
  if (!hasNanValues) {
    const elemNumbersToSelect = elemNumbers;
    resolved = selections
      .select({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', elemNumbersToSelect, !isSingleSelect],
      })
      .then((success) => success !== false)
      .catch(() => false);
  }
  return resolved;
}
