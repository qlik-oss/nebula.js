import { useEffect } from 'react';

export default function useSelectionModal({ sn, layout, model }, deps = []) {
  useEffect(() => {
    if (sn && sn.component.selections && sn.component.selections.id === model.id) {
      sn.component.selections.setLayout(layout);
      if (layout.qSelectionInfo && layout.qSelectionInfo.qInSelections && !sn.component.selections.isModal()) {
        sn.selections.goModal('/qHyperCubeDef'); // TODO - use path from data targets
      }
      if (!layout.qSelectionInfo || !layout.qSelectionInfo.qInSelections) {
        if (sn.component.selections.isModal()) {
          sn.component.selections.noModal();
        }
      }
    }
  }, [sn && sn.component.selections, layout, model, ...deps]);

  return [];
}
