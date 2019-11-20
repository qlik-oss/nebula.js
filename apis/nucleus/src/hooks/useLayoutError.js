import { useState, useEffect } from 'react';

const filterData = d => (d.qError ? d.qError.qErrorCode === 7005 : true);

export default function useLayoutError({ sn, layout }, deps = []) {
  const [layoutError, setLayoutError] = useState([]);
  const [requirementError, setRequirementError] = useState([]);
  useEffect(() => {
    if (!sn || !sn.generator || !sn.generator.qae || !layout) {
      return;
    }
    const { targets } = sn.generator.qae.data;
    const layoutErrors = [];
    const requirementsError = [];
    targets.forEach(def => {
      const minD = def.dimensions.min();
      const minM = def.measures.min();
      const hc = def.resolveLayout(layout);
      const d = (hc.qDimensionInfo || []).filter(filterData);
      const m = (hc.qMeasureInfo || []).filter(filterData);
      const path = def.layoutPath;
      if (hc.qError) {
        layoutErrors.push({ path, error: hc.qError });
      }
      if (d.length < minD || m.length < minM) {
        requirementsError.push(path);
      }
    });
    setLayoutError(layoutErrors);
    setRequirementError(requirementsError);
  }, [sn, layout, ...deps]);

  return [layoutError, requirementError];
}
