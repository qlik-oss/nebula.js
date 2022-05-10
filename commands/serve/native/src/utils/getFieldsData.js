import stringifyCyclicStruct from './stringifyCyclicStruct';

const fieldListObjectDef = {
  qInfo: {
    qId: '',
    qType: 'SessionLists',
  },
  qFieldListDef: {
    qType: 'Field',
    qData: { id: '/qInfo/qId' },
  },
};

const getFieldsData = async (app) => {
  const fieldListObject = await app.createSessionObject(fieldListObjectDef);
  const fieldListObjectLayout = await fieldListObject.getLayout();
  stringifyCyclicStruct(fieldListObjectLayout.qFieldList.qItems);
  let count = 0;
  const multiSelectItems = fieldListObjectLayout.qFieldList.qItems.map((qItem) => {
    count++;
    return { name: qItem.qName, id: count };
  });
  return multiSelectItems;
};

export default getFieldsData;
