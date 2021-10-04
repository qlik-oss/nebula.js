import React from 'react';
import ReactDOM from 'react-dom';
import Cell from './Cell';
import uid from '../object/uid';

export default function glue({ halo, element, model, initialSnOptions, initialSnPlugins, onMount, initialError }) {
  const { root } = halo;
  const cellRef = React.createRef();
  const currentId = uid();
  const portal = ReactDOM.createPortal(
    <Cell
      ref={cellRef}
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
  root.addCell(currentId, cellRef);

  return [unmount, cellRef];
}
