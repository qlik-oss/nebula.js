import React from 'react';
import ReactDOM from 'react-dom';
import Cell from './Cell';

export default function glue({ corona, element, model, initialSnOptions, onMount, initialError }) {
  const { root } = corona;
  const cellRef = React.createRef();
  const portal = ReactDOM.createPortal(
    <Cell
      ref={cellRef}
      corona={corona}
      model={model}
      initialSnOptions={initialSnOptions}
      initialError={initialError}
      onMount={onMount}
    />,
    element,
    model.id
  );

  const unmount = () => {
    root.remove(portal);
  };

  model.once('closed', unmount);

  root.add(portal);

  return [unmount, cellRef];
}
