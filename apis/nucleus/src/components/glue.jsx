import React from 'react';
import ReactDOM from 'react-dom';
import Cell from './Cell';

export default function glue({ nebulaContext, element, model, initialSnContext, initialSnOptions, onMount }) {
  const { root } = nebulaContext;
  const cellRef = React.createRef();
  const portal = ReactDOM.createPortal(
    <Cell
      ref={cellRef}
      nebulaContext={nebulaContext}
      model={model}
      initialSnContext={initialSnContext}
      initialSnOptions={initialSnOptions}
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

  return [
    () => {
      unmount();
    },
    cellRef,
  ];
}
