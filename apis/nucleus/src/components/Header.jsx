import React, { useEffect, useState } from 'react';

import { makeStyles, Grid, Typography } from '@material-ui/core';
import SelectionToolbarWithDefault from './SelectionToolbar';

const useStyles = makeStyles(theme => ({
  containerStyle: {
    flexGrow: 0,
    paddingBottom: theme.spacing(1),
  },
  itemsStyle: {
    whiteSpace: 'nowrap',
    minHeight: '32px',
  },
}));

const Header = ({ layout, sn }) => {
  const showTitle = layout && layout.showTitles && !!layout.title;
  const showSubtitle = layout && layout.showTitles && !!layout.subtitle;
  const showInSelectionActions = sn && layout && layout.qSelectionInfo && layout.qSelectionInfo.qInSelections;
  const [items, setItems] = useState([]);
  const { containerStyle, itemsStyle } = useStyles();

  useEffect(() => {
    if (!sn || !sn.component || !sn.component.isHooked) {
      return;
    }
    sn.component.observeActions(actions => setItems(actions));
  }, [sn]);

  return (
    <Grid item container wrap="nowrap" className={containerStyle}>
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
      <Grid item className={itemsStyle}>
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
