import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ListBoxInline from './ListBoxInline';

export function ListBoxFetchMasterItem({ app, fieldIdentifier, stateName = '$', options = {} }) {
  const [fieldDef, setFieldDef] = useState('');
  const [isFetchingData, setIsFetchingData] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsFetchingData(true);
      try {
        const dim = await app.getDimension(fieldIdentifier.qLibraryId);
        const dimLayout = await dim.getLayout();
        setFieldDef(dimLayout.qDim.qFieldDefs ? dimLayout.qDim.qFieldDefs[0] : '');
        setIsFetchingData(false);
      } catch (e) {
        setIsFetchingData(false);
        setFieldDef({ failedToFetchFieldDef: true });
        throw new Error(`Disabling frequency count and histogram: ${e && e.message}`);
      }
    }
    fetchData();
  }, []);

  if (isFetchingData) {
    return null;
  }

  return (
    <ListBoxInline
      app={app}
      fieldIdentifier={fieldIdentifier}
      stateName={stateName}
      options={options}
      fieldDef={fieldDef}
    />
  );
}

export default function ListBoxPortal({ app, fieldIdentifier, stateName, element, options }) {
  const isFrequencyMaxNeeded = options.histogram || options.frequencyMode !== 'N';
  const TheComponent = fieldIdentifier.qLibraryId && isFrequencyMaxNeeded ? ListBoxFetchMasterItem : ListBoxInline;

  return ReactDOM.createPortal(
    <TheComponent
      app={app}
      fieldIdentifier={fieldIdentifier}
      stateName={stateName}
      element={element}
      options={options}
    />,
    element
  );
}
