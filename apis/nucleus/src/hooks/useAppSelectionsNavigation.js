import { useState, useEffect } from 'react';
import useLayout, { useAppLayout } from './useLayout';
import useCurrentSelectionsModel from './useCurrentSelectionsModel';

const patchAlternateState = (currentSelectionsModel, currentSelectionsLayout, appLayout) => {
  const states = [...(appLayout.qStateNames || [])].map(s => ({
    stateName: s, // need this as reference in selection toolbar since qSelectionObject.qStateName is not in the layout
    qSelectionObjectDef: {
      qStateName: s,
    },
  }));
  const existingStates = (currentSelectionsLayout && currentSelectionsLayout.alternateStates
    ? currentSelectionsLayout.alternateStates.map(s => s.stateName)
    : []
  ).join('::');
  const newStates = (appLayout.qStateNames || []).map(s => s).join('::');
  if (existingStates !== newStates) {
    currentSelectionsModel.applyPatches(
      [
        {
          qOp: 'replace',
          qPath: '/alternateStates',
          qValue: JSON.stringify(states),
        },
      ],
      true
    );
  }
};

export default function useAppSelectionsNavigation(app) {
  const [currentSelectionsModel] = useCurrentSelectionsModel(app);
  const [currentSelectionsLayout] = useLayout(currentSelectionsModel);
  const [appLayout] = useAppLayout(app);
  const [navigationState, setNavigationState] = useState(null);

  useEffect(() => {
    if (!appLayout || !currentSelectionsModel || !currentSelectionsLayout) return;
    patchAlternateState(currentSelectionsModel, currentSelectionsLayout, appLayout);
  }, [appLayout, currentSelectionsModel, currentSelectionsLayout]);

  useEffect(() => {
    if (!currentSelectionsLayout) return;
    let canGoBack = false;
    let canGoForward = false;
    let canClear = false;
    [currentSelectionsLayout, ...(currentSelectionsLayout.alternateStates || [])].forEach(state => {
      canGoBack = canGoBack || (state.qSelectionObject && state.qSelectionObject.qBackCount > 0);
      canGoForward = canGoForward || (state.qSelectionObject && state.qSelectionObject.qForwardCount > 0);
      canClear =
        canClear ||
        ((state.qSelectionObject && state.qSelectionObject.qSelections) || []).filter(s => s.qLocked !== true).length >
          0;
    });
    setNavigationState({
      canGoBack,
      canGoForward,
      canClear,
    });
  }, [currentSelectionsLayout]);

  return [navigationState, currentSelectionsModel, currentSelectionsLayout];
}
