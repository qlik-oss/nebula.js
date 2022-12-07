import React from 'react';
import ReactDOM from 'react-dom';
import Sheet from './Sheet';
import uid from '../object/uid';

export default function glue({ halo, element, model, initialSnOptions, initialSnPlugins, onMount, initialError }) {
  const { root } = halo;
  const sheetRef = React.createRef();
  const currentId = uid();
  const portal = ReactDOM.createPortal(
    <Sheet
      ref={sheetRef}
      halo={halo}
      model={model}
      currentId={currentId}
      initialSnOptions={initialSnOptions}
      initialSnPlugins={initialSnPlugins}
      initialError={initialError}
      onMount={onMount}
    />,
    element,
    model.id
  );

  const unmount = () => {
    root.remove(portal);
    model.removeListener('closed', unmount);
  };

  model.on('closed', unmount);

  root.add(portal);
  // Cannot use model.id as it is not unique in a given mashup
  //root.addCell(currentId, sheetRef); // this is not needed, sheet is not part of the focus stuff

  return [unmount, sheetRef];
}
