function findLibraryItem(id, libraryItemList) {
  let i;
  let item;
  if (libraryItemList) {
    for (i = 0; i < libraryItemList.length; i++) {
      item = libraryItemList[i];
      if (item.qInfo.qId === id) {
        return item;
      }
    }
  }
  return null;
}

export default {
  findLibraryItem,
};
