import React from 'react';

import { Popover, MenuList, MenuItem, ListItemIcon, Typography } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

import SvgIcon from '@nebula.js/ui/icons/SvgIcon';

import useActionState from '../hooks/useActionState';

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.primary,
  },
}));

function MoreItem({ item, onActionClick = () => {} }) {
  const { hidden, disabled, hasSvgIconShape } = useActionState(item);
  const { icon } = useStyles();
  const handleClick = () => {
    item.action();
    onActionClick();
  };
  return !hidden ? (
    <MenuItem title={item.label} onClick={handleClick} disabled={disabled}>
      {hasSvgIconShape && <ListItemIcon className={icon}>{SvgIcon(item.getSvgIconShape())}</ListItemIcon>}
      <Typography noWrap>{item.label}</Typography>
    </MenuItem>
  ) : null;
}

const More = React.forwardRef(
  (
    { actions = [], show = true, alignTo, popoverProps = {}, popoverPaperStyle = {}, onCloseOrActionClick = () => {} },
    ref
  ) => {
    const showActions = actions.length > 0;

    return (
      showActions && (
        <Popover
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...popoverProps}
          onClose={onCloseOrActionClick}
          ref={ref}
          open={show}
          anchorEl={alignTo.current}
          getContentAnchorEl={null}
          container={alignTo.current}
          disablePortal
          hideBackdrop
          style={{ pointerEvents: 'none' }}
          transitionDuration={0}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            style: {
              pointerEvents: 'auto',
              maxWidth: '250px',
              ...popoverPaperStyle,
            },
          }}
        >
          <MenuList>
            {actions.map((item, ix) => (
              // eslint-disable-next-line react/no-array-index-key
              <MoreItem key={ix} item={item} onActionClick={onCloseOrActionClick} />
            ))}
          </MenuList>
        </Popover>
      )
    );
  }
);

export default More;
