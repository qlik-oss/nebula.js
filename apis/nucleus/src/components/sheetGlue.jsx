import React from 'react';
import ReactDOM from 'react-dom';
import Sheet from './Sheet';

export default function glue({ halo, element, model, initialSnOptions, initialSnPlugins, onMount, initialError }) {
  const { root } = halo;
  const sheetRef = React.createRef();
  const portal = ReactDOM.createPortal(
    <Sheet
      ref={sheetRef}
      halo={halo}
      model={model}
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
  return [unmount, sheetRef];
}
