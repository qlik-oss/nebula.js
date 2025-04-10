import React from 'react';
import ReactDOM from 'react-dom';
import Sheet from './Sheet';

export default function glue({
  halo,
  element,
  model,
  initialSnOptions,
  initialSnPlugins,
  onMount,
  initialError,
  navigation,
  onError,
}) {
  const { root } = halo;
  const sheetRef = React.createRef();
  let portal;
  const unmount = () => {
    root.remove(portal);
  };
  portal = ReactDOM.createPortal(
    <Sheet
      ref={sheetRef}
      halo={halo}
      model={model}
      initialSnOptions={initialSnOptions}
      initialSnPlugins={initialSnPlugins}
      initialError={initialError}
      onMount={onMount}
      unmount={unmount}
      navigation={navigation}
      onError={onError}
    />,
    element,
    model.id
  );
  navigation.setSheetRef(sheetRef);

  root.add(portal, unmount);
  return [unmount, sheetRef];
}
