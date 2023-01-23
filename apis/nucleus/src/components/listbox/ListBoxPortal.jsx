import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ListBoxInline from './ListBoxInline';
import ListBoxPopover from './ListBoxPopover';
import useObjectSelections from '../../hooks/useObjectSelections';
import useExistingModel from './hooks/useExistingModel';
import useOnTheFlyModel from './hooks/useOnTheFlyModel';
import identify from './assets/identify';

function ListBoxWrapper({ app, fieldIdentifier, qId, stateName, element, options }) {
  const { isExistingObject, hasExternalSelectionsApi } = identify({ qId, options });
  const [changeCount, setChangeCount] = useState(0);

  useEffect(() => {
    if (changeCount) {
      throw new Error('Source or selection Api can not change after a listbox has been mounted');
    }

    setChangeCount(changeCount + 1);
  }, [isExistingObject, hasExternalSelectionsApi]);

  const model = isExistingObject
    ? useExistingModel({ app, qId, options })
    : useOnTheFlyModel({ app, fieldIdentifier, stateName, options });

  const elementRef = useRef(element);

  const selections = hasExternalSelectionsApi ? options.selectionsApi : useObjectSelections(app, model, elementRef)[0];

  if (!selections || !model) {
    return null;
  }

  const opts = {
    ...options,
    selections,
    model,
  };

  return opts.popover ? (
    <ListBoxPopover
      app={app}
      alignTo={{ current: element }}
      show={options.popoverState}
      close={options.onPopoverClose}
      fieldName={fieldIdentifier}
      stateName={stateName}
    />
  ) : (
    <ListBoxInline options={opts} />
  );
}

export default function ListBoxPortal({ element, app, fieldIdentifier, qId, stateName = '$', options = {} }) {
  return ReactDOM.createPortal(
    <ListBoxWrapper
      app={app}
      element={element}
      fieldIdentifier={fieldIdentifier}
      qId={qId}
      stateName={stateName}
      options={options}
    />,
    element
  );
}
