import React from 'react';
import { makeStyles } from '@nebula.js/ui/theme';
import { Checkbox } from '@material-ui/core';
import CheckboxChecked from './assets/CheckboxChecked';

const borderRadius = 3;
const useStyles = makeStyles((theme) => ({
  cbIcon: {
    borderRadius,
    width: 16,
    height: 16,
    boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: '#f5f8fa',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cbIconChecked: {
    borderRadius,
    backgroundColor: theme.palette.selected.main,
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&:before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage: CheckboxChecked,
      content: '""',
    },
  },
  cbIconExcluded: {
    borderRadius: borderRadius - 1,
    width: 12,
    height: 12,
    backgroundColor: theme.palette.selected.excluded,
  },
  checkbox: {
    margin: 0,
    '&:hover': {
      backgroundColor: 'inherit !important',
    },
  },
  dense: {
    padding: '4px 8px',
  },
}));

const getIcon = (styles, showGray = true, excluded = false) => (
  <span className={styles.cbIcon}>
    {excluded && <span className={showGray && excluded ? styles.cbIconExcluded : ''} />}
  </span>
);

export default function ListboxCheckbox({ checked, label, dense, excluded, showGray = true }) {
  const styles = useStyles();

  return (
    <Checkbox
      edge="start"
      checked={checked}
      disableRipple
      className={[styles.checkbox, dense && styles.dense].filter(Boolean).join(' ')}
      inputProps={{ 'aria-labelledby': label }}
      name={label}
      icon={getIcon(styles, showGray, excluded)}
      checkedIcon={<span className={styles.cbIconChecked} />}
    />
  );
}
