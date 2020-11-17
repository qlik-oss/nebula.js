function findLibraryMeasure(id, measureList) {
  let i;
  let item;
  if (measureList) {
    for (i = 0; i < measureList.length; i++) {
      item = measureList[i];
      if (item.qInfo.qId === id) {
        return item;
      }
    }
  }
  return null;
}

function findLibraryDimension(id, dimensionList) {
  let i;
  let layout;
  if (dimensionList) {
    for (i = 0; i < dimensionList.length; i++) {
      layout = dimensionList[i];
      if (layout.qInfo.qId === id) {
        return layout;
      }
    }
  }
  return null;
}

export default {
  findLibraryDimension,
  findLibraryMeasure,
};
