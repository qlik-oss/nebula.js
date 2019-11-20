import React from 'react';
import ReactDOM from 'react-dom';
import Cell from './Cell';

export default function glue({ nebulaContext, element, model, snContext, snOptions, onMount }) {
  const { root } = nebulaContext;
  const portal = ReactDOM.createPortal(
    <Cell nebulaContext={nebulaContext} model={model} snContext={snContext} snOptions={snOptions} onMount={onMount} />,
    element,
    model.id
  );

  const unmount = () => {
    root.remove(portal);
  };

  model.once('closed', unmount);

  root.add(portal);

  return () => {
    unmount();
  };
}
