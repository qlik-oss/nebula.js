import { Container } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ListBoxInline from './ListBoxInline';

export function ListBoxFetchMasterItem({ app, fieldIdentifier, stateName = '$', options = {} }) {
  const [fieldDef, setFieldDef] = useState('');
  const [error, seterror] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const dim = await app.getDimension(fieldIdentifier.qLibraryId);
        const dimLayout = await dim.getLayout();
        setFieldDef(dimLayout.qDim.qFieldDefs ? dimLayout.qDim.qFieldDefs[0] : '');
      } catch (e) {
        seterror(e.message);
      }
    }
    fetchData();
  }, []);

  if (error) {
    return <Container>{error}</Container>;
  }

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
