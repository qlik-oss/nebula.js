function CopyPaste(CopySupport, GridService, CopyTranslate) {
  this.CopySupport = CopySupport;
  this.GridService = GridService;
  this.CopyTranslate = CopyTranslate;
}

const checkQlikViewClipboardData = async (copySupport) => {
  const prop = JSON.parse(localStorage['QlikView-clipboard']);

  const props = copySupport.isCopyingBundledImageBetweenApps(prop);
  //   .then((copyBundledImageBetweenApps) => {
  // TODO: What is this?
  // if (copyBundledImageBetweenApps) {
  //   WarningHandler.showDialog([{ message: 'Object.CopyBetweenApps.BundleImageWarning.Text' }]);
  // }
  //   return;
  //   });

  return props;
};

const getPasteProp = (copySupport) => {
  let prop;

  const masterProp = localStorage['QlikView-clipboardMasterObject'];

  if (masterProp) {
    prop = JSON.parse(masterProp);
    copySupport.masterObjectExists(prop.qExtendsId).then(
      () => {
        Promise.resolve(prop);
      },
      () => {
        checkQlikViewClipboardData(copySupport).then((p) => {
          delete p.appId;
          Promise.resolve(prop);
        });
      }
    );
  } else {
    checkQlikViewClipboardData(copySupport).then((p) => {
      delete p.appId;
      Promise.resolve(prop);
    });
  }
  return Promise;
};

async function getPasteObject(copySupport, copyTranslate) {
  const prop = await getPasteProp(copySupport);
  if (!copySupport.hasVisualizationType(prop.qInfo.qType)) {
    throw new Error('Visualization type is not found');
  }
  let childProps;
  const clipboardChildren = localStorage['QlikView-clipboardChildren'];

  if (clipboardChildren) {
    childProps = JSON.parse(clipboardChildren);
  } else {
    childProps = [];
  }
  await copyTranslate.dataCheck(prop, copySupport);
  await copyTranslate.childrenDataCheck(childProps, copySupport);
  return {
    init: prop,
    children: childProps,
    template: prop.qInfo.qType,
  };
}

function getMeasures(measures, CopySupport) {
  const measArray = [];
  const count = measures.length;
  let done = 0;
  const deferred = new Deferred();

  if (count === 0) {
    deferred.resolve(measArray);
  }
  measArray.length = count;
  measures.forEach((i) => {
    CopySupport.getMeasureProp(measures[i]).then((prop) => {
      const entry = {};
      entry.id = prop.qInfo.qId;
      entry.title = prop.title;
      entry.def = prop.qMeasure.qDef;
      measArray[i] = entry;
      done++;
      if (done === count) {
        deferred.resolve(measArray);
      }
    });
  });
  return deferred.promise;
}

function getDimensions(dimensions, CopySupport) {
  const dimArray = [];
  const count = dimensions.length;
  let done = 0;
  const deferred = new Deferred();

  if (count === 0) {
    deferred.resolve(dimArray);
  }
  dimArray.length = count;
  dimensions.forEach((i) => {
    CopySupport.getDimensionProp(dimensions[i]).then((prop) => {
      const entry = {};
      entry.id = prop.qInfo.qId;
      entry.type = prop.qInfo.qType;
      entry.grouping = prop.qGrouping;
      entry.title = prop.title;
      entry.fields = prop.qDim.qFieldDefs;
      dimArray[i] = entry;
      done++;
      if (done === count) {
        deferred.resolve(dimArray);
      }
    });
  });

  return deferred.promise;
}

function putOnLocalStorage(props, deferred, copySupport) {
  let i;
  const dimIdList = [];
  const measIdList = [];
  if (props.qHyperCubeDef) {
    for (i = 0; i < props.qHyperCubeDef.qDimensions.length; i++) {
      if (props.qHyperCubeDef.qDimensions[i].qLibraryId) {
        dimIdList.push(props.qHyperCubeDef.qDimensions[i].qLibraryId);
      }
    }
  }
  if (props.qHyperCubeDef) {
    for (i = 0; i < props.qHyperCubeDef.qMeasures.length; i++) {
      if (props.qHyperCubeDef.qMeasures[i].qLibraryId) {
        measIdList.push(props.qHyperCubeDef.qMeasures[i].qLibraryId);
      }
    }
  }

  copySupport.getChildrenFor(props.qInfo.qId).then((childProperties) => {
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
    getDimensions(dimIdList, copySupport).then((dimArray) => {
      if (dimArray.length) {
        localStorage['QlikView-clipboardDimensions'] = JSON.stringify(dimArray);
      } else {
        delete localStorage['QlikView-clipboardDimensions'];
      }
    });
    getMeasures(measIdList, copySupport).then((measArray) => {
      if (measArray.length) {
        localStorage['QlikView-clipboardMeasures'] = JSON.stringify(measArray);
      } else {
        delete localStorage['QlikView-clipboardMeasures'];
      }
    });

    // add app id to the properties in localStorage to be able to distinguish if copy and paste
    // is within the app or between apps
    copySupport.addAppId(tmpProps).then(() => {
      localStorage['QlikView-clipboard'] = JSON.stringify(tmpProps);
      deferred.resolve();
    });
  });
}

function storeCopyObject(object, copySupport) {
  const deferred = new Deferred();

  copySupport.getVisualizationProp(object).then((props) => {
    if (props.qExtendsId) {
      // masterobject
      localStorage['QlikView-clipboardMasterObject'] = JSON.stringify(props);
      copySupport.getMasterObjectProp(props.qExtendsId).then((mProps) => {
        const copy = { ...mProps };
        copy.qInfo.qType = props.qInfo.qType;
        putOnLocalStorage(copy, deferred, copySupport);
      });
    } else {
      delete localStorage['QlikView-clipboardMasterObject'];
      putOnLocalStorage(props, deferred, copySupport);
    }
  });
  return deferred.promise;
}
CopyPaste.prototype.getPasteObject = function () {
  return getPasteObject(this.CopySupport, this.CopyTranslate);
};

CopyPaste.prototype.copyObject = function (object) {
  if (object.isInvalid) {
    return undefined;
  }

  return storeCopyObject(object, this.CopySupport);
};
