import React, { useState } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Container, FormHelperText, makeStyles, Typography } from '@material-ui/core';
import QlikSwitch from './QlikSwitch';

const useStyles = makeStyles((theme) => ({
  label: {
    marginLeft: '0.4rem',
  },
  helpLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '& span': {
      color: theme.palette.text.secondary,
    },
  },
}));

export default function QlikSwitchWithLabel({ label, helperText, startOn, onChange, styling = {} }) {
  const [isOn, setOn] = useState(startOn || false);
  const classes = useStyles();
  const onSwitchChange = (event) => {
    const { checked } = event.target;
    setOn(checked);
    onChange(checked);
  };
  return (
    <Container disableGutters style={{ padding: '0.7rem', paddingTop: 0 }}>
      <FormControlLabel
        style={{
          margin: 0,
        }}
        control={
          <QlikSwitch checked={isOn} onChange={onSwitchChange} iconOn={styling.iconOn} iconOff={styling.iconOff} />
        }
        label={
          <Typography variant="caption" className={classes.label} style={{ verticalAlign: 'middle' }}>
            {label}
          </Typography>
        }
      />
      {helperText && (
        <FormHelperText className={classes.helpLabel}>
          <Typography variant="caption">{helperText}</Typography>
        </FormHelperText>
      )}
    </Container>
  );
}
