import React from 'react';
import { styled } from '@mui/material/styles';
import { Checkbox } from '@mui/material';
import CheckboxChecked from '../../../assets/CheckboxChecked';

const PREFIX = 'ListBoxCheckbox';
const borderRadius = 3;

const classes = {
  cbIcon: `${PREFIX}-cbIcon`,
  cbIconChecked: `${PREFIX}-cbIconChecked`,
  cbIconExcluded: `${PREFIX}-cbIconExcluded`,
  cbIconAlternative: `${PREFIX}-cbIconAlternative`,
  checkbox: `${PREFIX}-checkbox`,
  dense: `${PREFIX}-dense`,
};

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  [`& .${classes.cbIcon}`]: {
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

  [`& .${classes.cbIconChecked}`]: {
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

  [`& .${classes.cbIconExcluded}`]: {
    borderRadius: borderRadius - 1,
    width: 12,
    height: 12,
    backgroundColor: theme.palette.selected.excluded,
  },

  [`& .${classes.cbIconAlternative}`]: {
    borderRadius: borderRadius - 1,
    width: 12,
    height: 12,
    backgroundColor: theme.palette.selected.alternative,
  },

  [`&.${classes.checkbox}`]: {
    margin: 0,
    '&:hover': {
      backgroundColor: 'inherit !important',
    },
  },

  [`&.${classes.dense}`]: {
    padding: '4px 8px',
  },
}));

const getIcon = (cls, showGray = true, excluded = false) => (
  <span className={cls.cbIcon}>{excluded && <span className={showGray && excluded ? cls.cbIconExcluded : ''} />}</span>
);

export default function ListboxCheckbox({ checked, label, dense, excluded, showGray = true }) {
  return (
    <StyledCheckbox
      edge="start"
      checked={checked}
      disableRipple
      className={[classes.checkbox, dense && classes.dense].filter(Boolean).join(' ')}
      inputProps={{ 'aria-labelledby': label }}
      name={label}
      icon={getIcon(classes, showGray, excluded)}
      checkedIcon={<span className={classes.cbIconChecked} />}
    />
  );
}
