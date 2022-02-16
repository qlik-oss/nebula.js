import React from 'react';
import { makeStyles } from '@nebula.js/ui/theme';
import { Checkbox } from '@material-ui/core';
import CheckboxChecked from './assets/CheckboxChecked';

const useStyles = makeStyles((theme) => ({
  cbIcon: {
    borderRadius: 3,
    width: 16,
    height: 16,
    boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: '#f5f8fa',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
  },
  cbIconChecked: {
    borderRadius: 3,
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
  checkbox: {
    margin: 0,
    '&:hover': {
      backgroundColor: 'inherit !important',
    },
  },
}));

export default function ListboxCheckbox({ checked, highlighted, label }) {
  const styles = useStyles();

  return (
    <Checkbox
      edge="start"
      checked={checked}
      tabIndex={-1}
      disableRipple
      className={[highlighted, styles.checkbox].join(' ').trim()}
      inputProps={{ 'aria-labelledby': label }}
      name={label}
      icon={<span className={styles.cbIcon} />}
      checkedIcon={<span className={styles.cbIconChecked} />}
    />
  );
}
