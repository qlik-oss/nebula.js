import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ListBoxInline from './ListBoxInline';
import useObjectSelections from '../../hooks/useObjectSelections';
import useExistingModel from './hooks/useExistingModel';
import useOnTheFlyModel from './hooks/useOnTheFlyModel';

const OBJECT_SOURCE = {
  ON_THE_FLY: 'ON_THE_FLY',
  EXISTING: 'EXISTING',
};

const SELECTIONS_API = {
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
};

function identify({ qId, options }) {
  const variant = {};

  // Existing or on the fly
  variant.objectSource = qId || options.sessionModel ? OBJECT_SOURCE.EXISTING : OBJECT_SOURCE.ON_THE_FLY;

  // Use internal or external selectionsApi
  variant.selectionsApi = options.selectionsApi ? SELECTIONS_API.EXTERNAL : SELECTIONS_API.INTERNAL;

  return variant;
}

function ListBoxWrapper({ app, fieldIdentifier, qId, stateName, options }) {
  const { objectSource, selectionsApi } = identify({ qId, options });
  const [changeCount, setChangeCount] = useState(0);

  useEffect(() => {
    if (changeCount) {
      throw new Error('Source or selection Api can not change after a listbox has been mounted');
    }

    setChangeCount(changeCount + 1);
  }, [objectSource, selectionsApi]);

  const model =
    objectSource === OBJECT_SOURCE.EXISTING
      ? useExistingModel({ app, qId, options })
      : useOnTheFlyModel({ app, fieldIdentifier, stateName, options });
  const selections =
    selectionsApi === SELECTIONS_API.EXTERNAL ? options.selectionsApi : useObjectSelections(app, model)[0];

  if (!selections || !model) {
    return null;
  }

  const opts = {
    ...options,
    selections,
    model,
  };

  return <ListBoxInline options={opts} />;
}

export default function ListBoxPortal({ element, app, fieldIdentifier, qId, stateName = '$', options = {} }) {
  return ReactDOM.createPortal(
    <ListBoxWrapper app={app} fieldIdentifier={fieldIdentifier} qId={qId} stateName={stateName} options={options} />,
    element
  );
}
