import { useState } from 'react';

// Nucleus-internal analog of stardust's useStaleLayout() (apis/supernova/src/hooks.js) - freezes
// the layout while this object is the target of an active modal selection (qInSelections), since
// ListBox isn't a supernova and can't reach the real hook via useInternalContext.
export default function useStaleLayout(layout) {
  const [ref] = useState({ current: layout });
  if (!layout?.qSelectionInfo?.qInSelections) {
    ref.current = layout;
  }
  return ref.current;
}
