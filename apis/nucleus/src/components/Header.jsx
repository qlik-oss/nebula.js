import React, { useEffect, useState } from 'react';

import { styled } from '@mui/material/styles';

import { Grid, Tooltip, Typography } from '@mui/material';
import ActionsToolbar from './ActionsToolbar';
import hiddenScreenReaderText from '../utils/style/screen-reader';

const PREFIX = 'Header';

const classes = {
  containerStyle: `${PREFIX}-containerStyle`,
  containerTitleStyle: `${PREFIX}-containerTitleStyle`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`&.${classes.containerStyle}`]: {
    flexGrow: 0,
  },

  [`&.${classes.containerTitleStyle}`]: {
    paddingBottom: theme.spacing(1),
  },
}));

/**
 * @interface
 * @extends HTMLElement
 * @since 2.0.0
 */
const CellTitle = {
  /** @type {'njs-cell-title'} */
  className: 'njs-cell-title',
};

/**
 * @interface
 * @extends HTMLElement
 * @since 2.0.0
 */
const CellSubTitle = {
  /** @type {'njs-cell-sub-title'} */
  className: 'njs-cell-sub-title',
};

function Header({ id, layout, sn, anchorEl, hovering, focusHandler, titleStyles = {}, isRtl, translator }) {
  const showTitle = layout.showTitles && !!layout.title;
  const showSubtitle = layout.showTitles && !!layout.subtitle;
  const showInSelectionActions = layout.qSelectionInfo && layout.qSelectionInfo.qInSelections;
  const [actions, setActions] = useState([]);

  useEffect(() => {
    if (!sn || !sn.component || !sn.component.isHooked) {
      return;
    }
    sn.component.observeActions((a) => {
      setActions([...a, ...((sn && sn.selectionToolbar && sn.selectionToolbar.items) || [])]);
    });
  }, [sn]);

  const showTitles = showTitle || showSubtitle;
  const cls = [classes.containerStyle, ...(showTitles ? [classes.containerTitleStyle] : [])];
  const showPopoverToolbar = hovering || showInSelectionActions;

  const Toolbar = (
    <ActionsToolbar
      show={false}
      selections={{
        show: showInSelectionActions,
        api: sn.component.selections,
        onKeyDeactivate: focusHandler.refocusContent,
      }}
      actions={actions}
      popover={{ show: showPopoverToolbar, anchorEl }}
      focusHandler={focusHandler}
      layout={layout}
      isRtl={isRtl}
    />
  );
  return (
    <StyledGrid item container wrap="nowrap" className={cls.join(' ')}>
      <Grid item zeroMinWidth xs dir={isRtl ? 'rtl' : 'ltr'}>
        <Grid container wrap="nowrap" direction="column">
          {showTitle ? (
            <Tooltip title={layout.title}>
              <Typography
                id={`${id}_title`}
                variant="h6"
                noWrap
                className={CellTitle.className}
                style={titleStyles.main}
              >
                {layout.title}
              </Typography>
            </Tooltip>
          ) : (
            <div
              id={`${id}_title`}
              style={hiddenScreenReaderText}
              aria-label={translator.get('Accessibility.Object.NoTitle')}
            />
          )}
          {showSubtitle && (
            <Tooltip title={layout.subtitle}>
              <Typography variant="body2" noWrap className={CellSubTitle.className} style={titleStyles.subTitle}>
                {layout.subtitle}
              </Typography>
            </Tooltip>
          )}
        </Grid>
      </Grid>
      <Grid item>{Toolbar}</Grid>
    </StyledGrid>
  );
}

export default Header;
