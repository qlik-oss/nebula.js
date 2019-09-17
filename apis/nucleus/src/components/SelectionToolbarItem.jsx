import React, { useState, useEffect } from 'react';

import { IconButton, Button, MenuItem, ListItemIcon, Typography } from '@nebula.js/ui/components';

import SvgIcon from '@nebula.js/ui/icons/SvgIcon';

import { makeStyles } from '@nebula.js/ui/theme';

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.text.primary,
  },
}));

const Item = props => {
  const initialValue =
    typeof props.item.disabled !== 'undefined' ? props.item.disabled : props.item.enabled && !props.item.enabled();
  const [disabled, setDisabled] = useState(initialValue);
  if (disabled !== props.item.disabled) {
    setDisabled(props.item.disabled);
  }

  useEffect(() => {
    let onChange;
    if (props.item && props.item.action && props.item.on) {
      onChange = () => {
        setDisabled(props.item.enabled && !props.item.enabled());
      };

      props.item.on('changed', onChange);
    }

    return () => {
      if (onChange && props.item.removeListener) {
        props.item.removeListener('changed', onChange);
      }

      onChange = null;
    };
  }, []);

  const { icon } = useStyles();
  const { item } = props;
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
