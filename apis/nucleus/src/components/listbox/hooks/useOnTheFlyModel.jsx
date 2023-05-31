import { useState, useEffect, useRef } from 'react';
import extend from 'extend';
import useSessionModel from '../../../hooks/useSessionModel';
import uid from '../../../object/uid';
import { getFrequencyMaxExpression } from '../utils/frequencyMaxUtil';
import defaultListboxProperties from '../default-properties';

export default function useOnTheFlyModel({ app, fieldIdentifier, stateName, options = {} }) {
  const [fieldDef, setFieldDef] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [model, setModel] = useState();
  const [fallbackTitle, setFallbackTitle] = useState();
  const title = options.title ?? fallbackTitle;

  let { histogram = false, frequencyMode = 'N' } = options;
  if (fieldDef && fieldDef.failedToFetchFieldDef) {
    histogram = false;
    frequencyMode = 'N';
  }

  useEffect(() => {
    async function fetchMasterItem() {
      try {
        const dim = await app.getDimension(fieldIdentifier.qLibraryId);
        const dimLayout = await dim.getLayout();
        setFallbackTitle(dimLayout.qDim.title);
        if (dimLayout.qDim.qGrouping === 'N') {
          setFieldDef(dimLayout.qDim.qFieldDefs ? dimLayout.qDim.qFieldDefs[0] : '');
        } else {
          setFieldDef({ multiFieldDim: true });
        }
        setIsFetching(false);
      } catch (e) {
        setIsFetching(false);
        setFieldDef({ failedToFetchFieldDef: true });
        throw new Error(`Disabling frequency count and histogram: ${e && e.message}`);
      }
    }

    const isFrequencyMaxNeeded = histogram || frequencyMode !== 'N';
    const shouldFetchMasterItem = fieldIdentifier.qLibraryId && isFrequencyMaxNeeded;
    if (shouldFetchMasterItem) {
      fetchMasterItem();
    } else {
      setIsFetching(false);
      setFallbackTitle(fieldIdentifier);
    }
  }, []);

  const { dense, checkboxes, listLayout, properties = {} } = options;

  const getListdefFrequencyMode = () => (histogram && frequencyMode === 'N' ? 'V' : frequencyMode);
  const layoutOptions = { dense };

  if (listLayout === 'horizontal') {
    layoutOptions.dataLayout = 'grid';
    layoutOptions.layoutOrder = 'column';
    layoutOptions.maxVisibleColumns = { auto: true };
    layoutOptions.maxVisibleRows = { auto: false, maxRows: 1 };
  }

  const id = useRef();
  if (!id.current) {
    id.current = uid();
  }

  const listdef = extend(true, {}, defaultListboxProperties, {
    qInfo: {
      qId: id.current,
    },
    qListObjectDef: {
      qStateName: stateName,
      qFrequencyMode: getListdefFrequencyMode(),
    },
    histogram,
    checkboxes,
    layoutOptions,
    title,
  });
  extend(true, listdef, properties);

  // Something something lib dimension
  let fieldName;
  if (fieldIdentifier.qLibraryId) {
    listdef.qListObjectDef.qLibraryId = fieldIdentifier.qLibraryId;
    fieldName = fieldIdentifier.qLibraryId;
  } else {
    listdef.qListObjectDef.qDef.qFieldDefs = [fieldIdentifier];
    fieldName = fieldIdentifier;
  }

  if (frequencyMode !== 'P' && histogram) {
    if (fieldDef?.multiFieldDim) {
      listdef.frequencyMax = 'fetch';
      // maybe for all lib dimension to handle if it properties change
    } else {
      const field = fieldIdentifier.qLibraryId ? fieldDef : fieldName;
      listdef.frequencyMax = {
        qValueExpression: getFrequencyMaxExpression(field),
      };
    }
  }

  const [sessionModel] = useSessionModel(listdef, isFetching ? null : app, fieldName, stateName);

  useEffect(() => {
    if (!sessionModel) {
      return;
    }

    setModel(sessionModel);
  }, [sessionModel]);

  return model;
}
