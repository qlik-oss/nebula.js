import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import extend from 'extend';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@nebula.js/ui/theme';
import ListBoxInline from './ListBoxInline';
import { useModelStore } from '../../stores/model-store';
import useObjectSelections from '../../hooks/useObjectSelections';
import useSessionModel from '../../hooks/useSessionModel';
import InstanceContext from '../../contexts/InstanceContext';

const OBJECT_TYPE = {
  SESSION: 'SESSION',
  EXISTING: 'EXISTING',
};

const SELECTIONS_API = {
  INTERNAL: 'INTERNAL',
  PROVIDED: 'PROVIDED',
};

function identify({ qId, options }) {
  const variant = {};

  // Existing or session object
  variant.objectType = qId || options.sessionModel ? OBJECT_TYPE.EXISTING : OBJECT_TYPE.SESSION;

  // Use internal or provided selectionsApi
  variant.selectionsApi = options.selectionsApi ? SELECTIONS_API.PROVIDED : SELECTIONS_API.INTERNAL;

  return variant;
}

function NebulaSelections({ app, options = {} }) {
  const [selections] = useObjectSelections(app, options.model);
  const opts = {
    ...options,
    selections,
  };
  return <ListBoxInline options={opts} />;
}

function SessionListBox({ app, fieldIdentifier, stateName = '$', options = {} }) {
  const [fieldDef, setFieldDef] = useState('');
  const [isFetching, setIsFetching] = useState(false);

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

  if (isFetching) {
    return null;
  }

  const { title, properties = {}, selectionsApi = undefined } = options;
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

  const [model] = useSessionModel(listdef, app, fieldName, stateName);

  const opts = {
    ...options,
    model,
    selections: selectionsApi,
  };

  return options.selectionsApi ? <ListBoxInline options={opts} /> : <NebulaSelections app={app} options={opts} />;
}

export function ExistingListBox({ app, qId, options = {} }) {
  const [model, setModel] = useState();
  const [modelStore] = useModelStore();
  const { sessionModel } = options;

  useEffect(() => {
    async function fetchObject() {
      try {
        const m = await app.getObject(qId);
        const key = m ? `${m.id}` : null;
        modelStore.set(key, m);

        // TODO: isFrequencyMaxNeeded ?...
        setModel(m);
      } catch (e) {
        setModel({ failedToFetchFieldDef: true });
        throw new Error(`Disabling frequency count and histogram: ${e && e.message}`);
      }
    }
    if (sessionModel) {
      setModel(sessionModel);
    } else {
      fetchObject();
    }
  }, []);

  if (!model) {
    return null;
  }

  const opts = {
    ...options,
    model,
    selections: options.selectionsApi,
  };

  return options.selectionsApi ? <ListBoxInline options={opts} /> : <NebulaSelections app={app} options={opts} />;
}

export function ListBoxPortal({ app, fieldIdentifier, qId, stateName, element, options }) {
  const variant = identify({ qId, options });

  const TheComponent = variant.objectType === OBJECT_TYPE.EXISTING ? ExistingListBox : SessionListBox;

  return ReactDOM.createPortal(
    <TheComponent app={app} fieldIdentifier={fieldIdentifier} stateName={stateName} options={options} qId={qId} />,
    element
  );
}

export function RenderListBox({ app, fieldIdentifier, qId, stateName, element, options, context }) {
  const variant = identify({ qId, options });

  const TheComponent = variant.objectType === OBJECT_TYPE.EXISTING ? ExistingListBox : SessionListBox;

  const muiTheme = 'light'; // TODO: pick up and apply mui theme
  const theme = createTheme(muiTheme);

  const root = createRoot(element);

  root.render(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <InstanceContext.Provider value={context}>
          <TheComponent app={app} fieldIdentifier={fieldIdentifier} stateName={stateName} options={options} qId={qId} />
        </InstanceContext.Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
