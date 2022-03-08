import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ListBoxInline from './ListBoxInline';

export default function ListBoxPortal({ app, fieldIdentifier, stateName, element, options }) {
  let returnComponent = null;
  const isFrequencyMaxNeeded = options.histogram || options.frequencyMode !== 'N';
  if (fieldIdentifier.qLibraryId && isFrequencyMaxNeeded) {
    returnComponent = (
      <ListBoxFetchMasterItem
        app={app}
        fieldIdentifier={fieldIdentifier}
        stateName={stateName}
        element={element}
        options={options}
      />
    );
  } else {
    returnComponent = (
      <ListBoxInline
        app={app}
        fieldIdentifier={fieldIdentifier}
        stateName={stateName}
        element={element}
        options={options}
      />
    );
  }

  return ReactDOM.createPortal(returnComponent, element);
}

export function ListBoxFetchMasterItem({ app, fieldIdentifier, stateName = '$', options = {} }) {
  const [fieldDef, setFieldDef] = useState('');

  useEffect(() => {
    async function fetchData() {
      const dim = await app.getDimension(fieldIdentifier.qLibraryId);
      const dimLayout = await dim.getLayout();
      setFieldDef(dimLayout.qDim.qFieldDefs ? dimLayout.qDim.qFieldDefs[0] : '');
    }
    fetchData();
  }, []);

  if (!fieldDef) {
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
