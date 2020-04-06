import React from 'react';

import { IconButton, Button, MenuItem, ListItemIcon, Typography } from '@material-ui/core';

import SvgIcon from '@nebula.js/ui/icons/SvgIcon';

import { makeStyles, useTheme } from '@nebula.js/ui/theme';

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.primary,
  },
}));

const Item = ({ item }) => {
  const disabled = typeof item.enabled === 'function' ? !item.enabled() : !!item.disabled;
  const theme = useTheme();

  const { icon } = useStyles();
  const hasSvgIconShape = typeof item.getSvgIconShape === 'function';

  if (item.hidden === true) {
    return null;
  }

  if (item.type === 'menu-icon-button') {
    return (
      <MenuItem divider title={item.label} onClick={() => item.action()} disabled={disabled}>
        <ListItemIcon className={icon}>{hasSvgIconShape && SvgIcon(item.getSvgIconShape())}</ListItemIcon>
        <Typography>{item.label}</Typography>
      </MenuItem>
    );
  }

  return item.type === 'button' ? (
    <Button
      title={item.label}
      variant="contained"
      style={{
        backgroundColor: item.active ? theme.palette.btn.active : undefined,
      }}
      onClick={() => item.action()}
      disabled={disabled}
    >
      {hasSvgIconShape && SvgIcon(item.getSvgIconShape())}
    </Button>
  ) : (
    <IconButton
      title={item.label}
      onClick={() => item.action()}
      disabled={disabled}
      style={{ backgroundColor: item.active ? theme.palette.btn.active : undefined }}
    >
      {hasSvgIconShape && SvgIcon(item.getSvgIconShape())}
    </IconButton>
  );
};

export default Item;
