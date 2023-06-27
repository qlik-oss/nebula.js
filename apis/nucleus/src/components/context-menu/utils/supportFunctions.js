function CopyPaste(CopySupport, CopyTranslate) {
  this.CopySupport = CopySupport;
  this.CopyTranslate = CopyTranslate;
}

const checkQlikViewClipboardData = async (copySupport) => {
  const prop = JSON.parse(localStorage['QlikView-clipboard']);

  const props = copySupport.isCopyingBundledImageBetweenApps(prop);
  //   .then((copyBundledImageBetweenApps) => {
  // TODO: do we need this?
  // if (copyBundledImageBetweenApps) {
  //   WarningHandler.showDialog([{ message: 'Object.CopyBetweenApps.BundleImageWarning.Text' }]);
  // }
  //   return;
  //   });

  return props;
};

const masterObjectExists = async (app, id) => {
  try {
    await app.getObject(id);
    return true;
  } catch (error) {
    return false;
  }
};

// const checkDimensions = async(prop, dimensions, copySupport) {
//   let done = 0;

//   copySupport.getDimensionList().then((dimList) => {
//     $.each(dimensions, (i) => {
//       dimensionMatch(dimensions[i], copySupport, dimList).then((data) => {
//         if (!data.found) {
//           if (prop.qListObjectDef && data.dimensionId === prop.qListObjectDef.qLibraryId) {
//             if (data.match < 0) {
//               deferred.resolve();
//               return;
//             }
//             prop.qListObjectDef.qLibraryId = dimList[data.match].qInfo.qId;
//           }
//           if (prop.qHyperCubeDef) {
//             if (data.match < 0) {
//               deferred.resolve();
//               return;
//             }
//             if (prop.qHyperCubeDef.qDimensions.length > i) {
//               prop.qHyperCubeDef.qDimensions[i].qLibraryId = dimList[data.match].qInfo.qId;
//             }
//           }
//         }
//         done++;
//         if (done === dimensions.length) {
//           deferred.resolve();
//         }
//       });
//     });
//   });
// }

// const dataCheck = function (prop, copySupport, id) {
//   let dimDone = false;
//   let measDone = false;
//   let dimensions;
//   let measures;

//   try {
//     dimensions = JSON.parse(localStorage['QlikView-clipboardDimensions']);
//     checkDimensions(prop, dimensions, copySupport).then(
//       () => {
//         dimDone = true;
//         if (measDone) {
//           deferred.resolve();
//         }
//       },
//       () => {
//         deferred.reject(id);
//       }
//     );
//   } catch (err) {
//     dimDone = true;
//     if (measDone) {
//       deferred.resolve();
//     }
//   }
//   try {
//     measures = JSON.parse(localStorage['QlikView-clipboardMeasures']);
//     checkMeasures(prop, measures, copySupport).then(() => {
//       measDone = true;
//       if (dimDone) {
//         deferred.resolve();
//       }
//     });
//   } catch (err) {
//     measDone = true;
//     if (dimDone) {
//       deferred.resolve();
//     }
//   }
//   return deferred.promise;
// };

const getPasteProp = () => {
  const masterProp = localStorage['QlikView-clipboardMasterObject'];

  if (masterProp) {
    const prop = JSON.parse(masterProp);
    const exist = masterObjectExists(prop.qExtendsId);
    if (exist) {
      return prop;
    }
  }

  const prop = JSON.parse(localStorage['QlikView-clipboard']);
  delete prop.appId;
  return prop;
};

async function getPasteObject(types) {
  const prop = await getPasteProp();
  const typeList = types.getR();
  const hasVisualizationType = typeList.findIndex((t) => t.name === prop.qInfo.qType) > -1;
  if (!hasVisualizationType) {
    throw new Error('Visualization type is not found');
  }
  let childProps;
  const clipboardChildren = localStorage['QlikView-clipboardChildren'];

  if (clipboardChildren) {
    childProps = JSON.parse(clipboardChildren);
  } else {
    childProps = [];
  }
  // await copyTranslate.dataCheck(prop, copySupport);
  // await copyTranslate.childrenDataCheck(childProps, copySupport);
  return {
    init: prop,
    children: childProps,
    template: prop.qInfo.qType,
  };
}

const getMeasureProp = async (app, id) => {
  const model = await app.getMeasure(id);
  const prop = await model.getProperties();
  return prop;
};

const getDimensionProp = async (app, id) => {
  const model = await app.getDimension(id);
  const props = await model.getProperties();
  return props;
};

const getMeasures = async (app, measures) => {
  if (measures.length === 0) {
    return [];
  }
  const propArray = await Promise.all(measures.map((measure) => getMeasureProp(app, measure)));
  return propArray.map((prop) => ({
    id: prop.qInfo.qId,
    title: prop.title,
    def: prop.qMeasure.qDef,
  }));
};

const getDimensions = async (app, dimensions) => {
  if (dimensions.length === 0) {
    return [];
  }

  const propArray = await Promise.all(dimensions.map((dimension) => getDimensionProp(app, dimension)));
  return propArray.map((prop) => ({
    id: prop.qInfo.qId,
    type: prop.qInfo.qType,
    grouping: prop.qGrouping,
    title: prop.title,
    fields: prop.qDim.qFieldDefs,
  }));
};

const getChildrenFor = async (app, id) => {
  const model = await app.getObject(id);
  const childInfos = await model.getChildInfos();
  const childModels = await Promise.all(childInfos.map((childInfo) => app.getObject(childInfo.qId)));
  const childProps = await Promise.all(childModels.map((childModel) => childModel.getFullPropertyTree()));
  return childProps;
};

const putOnLocalStorage = async (app, props) => {
  let i;
  const dimIdList = [];
  const measIdList = [];
  if (props.qHyperCubeDef) {
    for (i = 0; i < props.qHyperCubeDef.qDimensions.length; i++) {
      if (props.qHyperCubeDef.qDimensions[i].qLibraryId) {
        dimIdList.push(props.qHyperCubeDef.qDimensions[i].qLibraryId);
      }
    }
    for (i = 0; i < props.qHyperCubeDef.qMeasures.length; i++) {
      if (props.qHyperCubeDef.qMeasures[i].qLibraryId) {
        measIdList.push(props.qHyperCubeDef.qMeasures[i].qLibraryId);
      }
    }
  }

  const childProperties = await getChildrenFor(app, props.qInfo.qId);
  const tmpProps = { ...props };
  if (childProperties.length) {
    localStorage['QlikView-clipboardChildren'] = JSON.stringify(childProperties);
  } else {
    delete localStorage['QlikView-clipboardChildren'];
  }
  for (i = 0; i < childProperties.length; i++) {
    if (childProperties[i]?.qProperty?.qListObjectDef?.qLibraryId) {
      dimIdList.push(childProperties[i].qProperty.qListObjectDef.qLibraryId);
    }
  }
  const [dimArray, measArray] = await Promise.all([getDimensions(app, dimIdList), getMeasures(app, measIdList)]);
  if (dimArray.length) {
    localStorage['QlikView-clipboardDimensions'] = JSON.stringify(dimArray);
  } else {
    delete localStorage['QlikView-clipboardDimensions'];
  }

  if (measArray.length) {
    localStorage['QlikView-clipboardMeasures'] = JSON.stringify(measArray);
  } else {
    delete localStorage['QlikView-clipboardMeasures'];
  }

  // add app id to the properties in localStorage to be able to distinguish if copy and paste
  // is within the app or between apps
  tmpProps.appId = app.id;
  localStorage['QlikView-clipboard'] = JSON.stringify(tmpProps);
};

const storeCopyObject = async (app, model) => {
  const props = await model.getProperties();
  if (props.qExtendsId) {
    // masterobject
    localStorage['QlikView-clipboardMasterObject'] = JSON.stringify(props);
    const masterObjectProps = await app.getObject(props.qExtendsId);
    const copy = { ...masterObjectProps };
    copy.qInfo.qType = props.qInfo.qType;
    await putOnLocalStorage(app, copy);
  } else {
    delete localStorage['QlikView-clipboardMasterObject'];
    await putOnLocalStorage(app, props);
  }
};

const getPasteObjectData = (types) => getPasteObject(types);

const copyObject = ({ app, model }) =>
  // TODO: return when model/object is invalid
  storeCopyObject(app, model);

export default {
  copyObject,
  getPasteObjectData,
};
