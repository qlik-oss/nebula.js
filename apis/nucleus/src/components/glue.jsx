import React from 'react';
import ReactDOM from 'react-dom';
import Cell from './Cell';
import uid from '../object/uid';

export default function glue({
  halo,
  element,
  model,
  initialSnOptions,
  initialSnPlugins,
  onMount,
  emitter,
  initialError,
  navigation,
  onError,
}) {
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
      emitter={emitter}
      navigation={navigation}
      onError={onError}
    />,
    element,
    currentId
  );

  const unmount = () => {
    root.remove(portal);
    model.removeListener('closed', unmount);
  };
  model.on('closed', unmount);

  // Cannot use model.id as it is not unique in a given mashup
  root.addCell(currentId, cellRef);

  (async () => {
    try {
      await root.add(portal, unmount);
    } catch (e) {
      unmount();
      onMount();
      onError(e);
    }
  })();

  return [unmount, cellRef];
}
