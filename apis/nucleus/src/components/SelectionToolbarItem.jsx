import React, { useState, useEffect } from 'react';

import { IconButton, Button, MenuItem, ListItemIcon, Typography } from '@material-ui/core';

import SvgIcon from '@nebula.js/ui/icons/SvgIcon';

import { makeStyles } from '@nebula.js/ui/theme';

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.text.primary,
  },
}));

const Item = ({ layout, item }) => {
  const getDisabled = () => (typeof item.enabled === 'function' ? !item.enabled() : false);
  const [disabled, setDisabled] = useState(false);

  const onChanged = () => {
    setDisabled(getDisabled());
  };
  // Handle changed from action-hero
  useEffect(() => {
    if (item && item.action && item.on) {
      item.on('changed', onChanged);
      return () => {
        item.removeListener('changed', onChanged);
      };
    }
    return undefined;
  }, []);

  // Handle layout changed
  useEffect(() => {
    onChanged();
  }, [layout]);

  const { icon } = useStyles();
  const hasSvgIconShape = typeof item.getSvgIconShape === 'function';

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
        backgroundColor: item.color,
      }}
      onClick={() => item.action()}
      disabled={disabled}
    >
      {hasSvgIconShape && SvgIcon(item.getSvgIconShape())}
    </Button>
  ) : (
    <IconButton title={item.label} onClick={() => item.action()} disabled={disabled}>
      {hasSvgIconShape && SvgIcon(item.getSvgIconShape())}
    </IconButton>
  );
};

export default Item;
