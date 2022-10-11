import { useState, useEffect } from 'react';
import extend from 'extend';
import useSessionModel from '../../../hooks/useSessionModel';

export default function useOnTheFlyModel({ app, fieldIdentifier, stateName, options }) {
  const [fieldDef, setFieldDef] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [model, setModel] = useState();

  useEffect(() => {
    async function fetchMasterItem() {
      setIsFetching(true);
      try {
        const dim = await app.getDimension(fieldIdentifier.qLibraryId);
        const dimLayout = await dim.getLayout();
        setFieldDef(dimLayout.qDim.qFieldDefs ? dimLayout.qDim.qFieldDefs[0] : '');
        setIsFetching(false);
      } catch (e) {
        setIsFetching(false);
        setFieldDef({ failedToFetchFieldDef: true });
        throw new Error(`Disabling frequency count and histogram: ${e && e.message}`);
      }
    }

    const isFrequencyMaxNeeded = options.histogram || options.frequencyMode !== 'N';
    const shouldFetchMasterItem = fieldIdentifier.qLibraryId && isFrequencyMaxNeeded;
    if (shouldFetchMasterItem) {
      fetchMasterItem();
    }
  }, []);

  const { title, properties = {} } = options;
  let { frequencyMode, histogram = false } = options;

  if (fieldDef && fieldDef.failedToFetchFieldDef) {
    histogram = false;
    frequencyMode = 'N';
  }

  switch (true) {
    case ['none', 'N', 'NX_FREQUENCY_NONE'].includes(frequencyMode):
      frequencyMode = 'N';
      break;
    case ['value', 'V', 'NX_FREQUENCY_VALUE', 'default'].includes(frequencyMode):
      frequencyMode = 'V';
      break;
    case ['percent', 'P', 'NX_FREQUENCY_PERCENT'].includes(frequencyMode):
      frequencyMode = 'P';
      break;
    case ['relative', 'R', 'NX_FREQUENCY_RELATIVE'].includes(frequencyMode):
      frequencyMode = 'R';
      break;
    default:
      frequencyMode = 'N';
      break;
  }

  const getListdefFrequencyMode = () => (histogram && frequencyMode === 'N' ? 'V' : frequencyMode);

  const listdef = {
    qInfo: {
      qType: 'njsListbox',
    },
    qListObjectDef: {
      qStateName: stateName,
      qShowAlternatives: true,
      qFrequencyMode: getListdefFrequencyMode(),
      qInitialDataFetch: [
        {
          qTop: 0,
          qLeft: 0,
          qWidth: 0,
          qHeight: 0,
        },
      ],
      qDef: {
        qSortCriterias: [
          {
            qSortByState: 1,
            qSortByAscii: 1,
            qSortByNumeric: 1,
            qSortByLoadOrder: 1,
          },
        ],
      },
    },
    title,
  };
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

  if (frequencyMode !== 'N' || histogram) {
    const field = fieldIdentifier.qLibraryId ? fieldDef : fieldName;
    listdef.frequencyMax = {
      qValueExpression: `Max(AGGR(Count([${field}]), [${field}]))`,
    };
  }

  const [sessionModel] = useSessionModel(listdef, isFetching ? null : app, fieldName, stateName);

  useEffect(() => {
    if (!sessionModel) {
      return;
    }

    const fetch = async (m) => {
      const prom = await m;
      setModel(prom);
    };

    fetch(sessionModel);
  });

  return model;
}
