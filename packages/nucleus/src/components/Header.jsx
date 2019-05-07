import React from 'react';

import {
  Grid,
  Typography,
} from '@nebula.js/ui/components';

import SelectionToolbar from './SelectionToolbar';

const Header = ({
  layout,
  sn,
}) => {
  const showTitle = layout && layout.showTitles && !!layout.title;
  const showSubtitle = layout && layout.showTitles && !!layout.subtitle;
  const showInSelectionActions = sn && layout && layout.qSelectionInfo && layout.qSelectionInfo.qInSelections;
  return (
    <Grid container wrap="nowrap" style={{ flexGrow: 0, flexWrap: 'nowrap' }}>
      <Grid item wrap="nowrap" style={{ flexGrow: 1, minWidth: 0 }}>
        <Grid container direction="column" style={{ flexGrow: 1, flexWrap: 'nowrap', minWidth: 0 }}>
          {showTitle && (<Typography variant="h6" noWrap>{layout.title}</Typography>)}
          {showSubtitle && (<Typography variant="body2" noWrap>{layout.subtitle}</Typography>)}
        </Grid>
      </Grid>
      <Grid item style={{ flexWrap: 'nowrap', whiteSpace: 'nowrap', minHeight: '32px' }}>
        {showInSelectionActions && (<SelectionToolbar inline sn={sn} />)}
      </Grid>
    </Grid>
  );
};

export default Header;
