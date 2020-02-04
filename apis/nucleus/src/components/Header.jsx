import React, { useEffect, useState } from 'react';

import { Grid, Typography } from '@material-ui/core';

import SelectionToolbarWithDefault from './SelectionToolbar';

const Header = ({ layout, sn }) => {
  const showTitle = layout && layout.showTitles && !!layout.title;
  const showSubtitle = layout && layout.showTitles && !!layout.subtitle;
  const showInSelectionActions = sn && layout && layout.qSelectionInfo && layout.qSelectionInfo.qInSelections;

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!sn || !sn.component || !sn.component.isHooked) {
      return;
    }
    sn.component.observeActions(actions => setItems(actions));
  }, [sn]);

  return (
    <Grid item container wrap="nowrap" style={{ flexGrow: 0 }}>
      <Grid item zeroMinWidth xs>
        <Grid container wrap="nowrap" direction="column">
          {showTitle && (
            <Typography variant="h6" noWrap>
              {layout.title}
            </Typography>
          )}
          {showSubtitle && (
            <Typography variant="body2" noWrap>
              {layout.subtitle}
            </Typography>
          )}
        </Grid>
      </Grid>
      <Grid item style={{ whiteSpace: 'nowrap', minHeight: '32px' }}>
        {showInSelectionActions && (
          <SelectionToolbarWithDefault
            inline
            layout={layout}
            api={sn.component.selections}
            xItems={[...items, ...(sn.selectionToolbar.items || [])]}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default Header;
