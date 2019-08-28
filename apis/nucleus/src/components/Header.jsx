import React from 'react';

import { Grid, Typography } from '@nebula.js/ui/components';

import SelectionToolbar from './SelectionToolbar';

const Header = ({ layout, sn }) => {
  const showTitle = layout && layout.showTitles && !!layout.title;
  const showSubtitle = layout && layout.showTitles && !!layout.subtitle;
  const showInSelectionActions = sn && layout && layout.qSelectionInfo && layout.qSelectionInfo.qInSelections;
  return (
    <Grid container wrap="nowrap" style={{ flexGrow: 0 }}>
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
          <SelectionToolbar inline api={sn.component.selections} items={sn.selectionToolbar.items} />
        )}
      </Grid>
    </Grid>
  );
};

export default Header;
