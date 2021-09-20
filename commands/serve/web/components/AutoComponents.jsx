/* eslint no-param-reassign:0 */
/* eslint no-use-before-define:0 */

import React, { useState } from 'react';

import {
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { ExpandMore } from '@nebula.js/ui/icons';

import { makeStyles } from '@nebula.js/ui/theme';

const useStyles = makeStyles((theme) => ({
  summary: {
    padding: theme.spacing(0, 1),
    backgroundColor: theme.palette.background.lighter,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  details: {
    padding: theme.spacing(1),
  },
}));

const usePanelStyles = makeStyles((theme) => ({
  root: {
    boxShadow: 'none',
    marginLeft: -theme.spacing(1),
    marginRight: -theme.spacing(1),
    '&$expanded': {
      marginLeft: -theme.spacing(1),
      marginRight: -theme.spacing(1),
    },
  },
  expanded: {},
}));

const getType = (value) => {
  if (Array.isArray(value)) {
    return 'array';
  }
  if (typeof value === 'boolean') {
    return 'boolean';
  }
  if (typeof value === 'string') {
    return 'string';
  }
  if (typeof value === 'number') {
    return 'number';
  }
  if (value && typeof value === 'object') {
    return 'object';
  }
  return 'unknown';
};

const Bool = ({ property, value, target, changed }) => {
  const handleChange = (e) => {
    target[property] = e.target.checked;
    changed();
  };
  return (
    <FormControlLabel
      control={<Checkbox checked={value} onChange={handleChange} />}
      label={property}
      labelPlacement="end"
    />
  );
};

const Str = ({ property, value, target, changed }) => {
  const [s, setS] = useState(value);
  const handleChange = (e) => {
    setS(e.target.value);
  };
  const onBlur = () => {
    if (s !== value) {
      target[property] = s;
      changed();
    }
  };

  return <TextField fullWidth onChange={handleChange} onBlur={onBlur} label={property} value={s} />;
};

const Num = ({ property, value, target, changed }) => {
  const [s, setS] = useState(+value);
  const handleChange = (e) => {
    setS(e.target.value);
  };
  const onBlur = () => {
    if (s !== value) {
      target[property] = +s;
      changed();
    }
  };

  return <TextField fullWidth onChange={handleChange} onBlur={onBlur} label={property} value={s} />;
};

const Obj = ({ property, value, changed }) => {
  const classes = useStyles();
  const panelClasses = usePanelStyles();
  return (
    <Accordion square className={[panelClasses.root, panelClasses.expanded].join(' ')}>
      <AccordionSummary expandIcon={<ExpandMore />} className={classes.summary}>
        <Typography>{property}</Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>{generateComponents(value, changed)}</AccordionDetails>
    </Accordion>
  );
};

const registeredComponents = {
  boolean: Bool,
  string: Str,
  object: Obj,
  number: Num,
};

const QRX = /^q[A-Z]/;

function generateComponents(properties, changed) {
  const components = Object.keys(properties)
    .map((key) => {
      if (['visualization', 'version'].indexOf(key) !== -1) {
        return false;
      }
      if (QRX.test(key)) {
        // skip q properties for now
        return false;
      }
      const type = getType(properties[key]);
      if (!registeredComponents[type]) {
        return false;
      }
      return {
        Component: registeredComponents[type],
        property: key,
        target: properties,
        value: properties[key],
        key: `${key}:${properties[key]}`,
      };
    })
    .filter(Boolean);

  return (
    <Grid container direction="column" spacing={0} alignItems="stretch">
      {components.map((c) => (
        <Grid item xs key={c.key} style={{ width: '100%' }}>
          <c.Component key={c.key} property={c.property} value={c.value} target={properties} changed={changed} />
        </Grid>
      ))}
    </Grid>
  );
}

export { generateComponents as default };
