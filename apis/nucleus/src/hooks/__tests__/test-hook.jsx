import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';
import initializeStores from '../../stores/new-model-store';
import initializeSelectionStores from '../../stores/new-selections-store';
import InstanceContext from '../../contexts/InstanceContext';

const TestHook = forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  const result2 = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
    result2,
  }));
  return null;
});

export default async function render(ref, hook, hookProps, setupCallback) {
  const context = {
    modelStore: initializeStores('app'),
    selectionStore: initializeSelectionStores('app'),
  };
  setupCallback && setupCallback(context);
  let renderer;
  await act(async () => {
    renderer = create(
      <InstanceContext.Provider value={context}>
        <TestHook ref={ref} hook={hook} hookProps={hookProps} />
      </InstanceContext.Provider>
    );
  });
  return renderer;
}
