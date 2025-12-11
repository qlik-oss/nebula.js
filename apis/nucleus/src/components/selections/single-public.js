const SINGLE_OBJECT_ID = 'singlepublic-pinnedItems';
const TYPE = 'singlepublic';

const getSinglePublicObject = async (app, qId) => {
  // TODO check create permission of single public object
  const layout = await app.getLayout();
  const canCreate = !!layout.permissions?.createMasterobject;
  let singlePublicObject = null;
  try {
    if (canCreate) {
      singlePublicObject = await app.getOrCreateObject({
        qInfo: { qType: TYPE, qId },
      });
    } else {
      singlePublicObject = await app.getObject(qId);
    }
  } catch {
    // ignore
  }
  return singlePublicObject;
};

const getSinglePublicObjectProps = async (app, qId) => {
  const singlePublicObject = await getSinglePublicObject(app, qId);
  if (!singlePublicObject) {
    return undefined;
  }
  const props = await singlePublicObject.getProperties();
  return props;
};

export { getSinglePublicObjectProps, SINGLE_OBJECT_ID };
