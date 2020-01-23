import React, { useCallback } from 'react';

import { Typography } from '@material-ui/core';

import useProperties from '@nebula.js/nucleus/src/hooks/useProperties';

import Data from './property-panel/Data';
import generateComponents from './AutoComponents';

export default function Properties({ viz, sn }) {
  // console.log(viz.model.handle, viz.model);
  const [properties] = useProperties(viz.model);
  // const [properties, setProperties] = useState();

  // useEffect(() => {
  //   viz.model.getProperties().then(setProperties);
  // }, [viz.model]);

  const changed = useCallback(() => {
    viz.model.setProperties(properties);
  }, [viz, sn, properties]);

  if (!sn) {
    return null;
  }

  if (!viz || !properties) {
    return (
      <div
        style={{
          minWidth: '250px',
          padding: '8px',
        }}
      >
        <Typography>Nothing selected</Typography>
      </div>
    );
  }

  return (
    <div
      style={{
        minWidth: '250px',
        padding: '8px',
      }}
    >
      <Data properties={properties} model={viz.model} sn={sn} />
      {generateComponents(properties, changed)}
    </div>
  );
}
