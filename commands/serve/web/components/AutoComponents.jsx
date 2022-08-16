/* eslint no-param-reassign:0 */
/* eslint no-use-before-define:0 */

import React, { useState } from 'react';

import { styled } from '@mui/material/styles';

import {
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from '@mui/material';

import { ExpandMore } from '@nebula.js/ui/icons';
import Variable from './property-panel/Variable';

const PREFIX = 'AutoComponents';

const classes = {
  summary: `${PREFIX}-summary`,
  details: `${PREFIX}-details`,
  root: `${PREFIX}-root`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.summary}`]: {
    padding: theme.spacing(0, 1),
    backgroundColor: theme.palette.background.lighter,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  [`& .${classes.details}`]: {
    padding: theme.spacing(1),
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  [`& .${classes.root}`]: {
    boxShadow: 'none',
    marginLeft: -theme.spacing(1),
    marginRight: -theme.spacing(1),
    '&$expanded': {
      marginLeft: -theme.spacing(1),
      marginRight: -theme.spacing(1),
    },
  },
}));

const getType = (value, key) => {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (key === 'variable') {
    return 'variable';
  }

  if (value && typeof value === 'object' && 'qStringExpression' in value) {
    return 'expression';
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

function Bool({ property, value, target, changed }) {
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
}

function Str({ property, value, target, changed }) {
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

  return <TextField variant="standard" fullWidth onChange={handleChange} onBlur={onBlur} label={property} value={s} />;
}

function Num({ property, value, target, changed }) {
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

  return <TextField variant="standard" fullWidth onChange={handleChange} onBlur={onBlur} label={property} value={s} />;
}

function Expression({ property, value, target, changed }) {
  const initial = value.qStringExpression && value.qStringExpression.qExpr ? value.qStringExpression.qExpr : '';
  const [s, setS] = useState(initial);
  const handleChange = (e) => {
    setS(e.target.value);
  };
  const onBlur = () => {
    if (s !== value) {
      target[property].qStringExpression = { qExpr: `=${s}` };
      changed();
    }
  };

  return (
    <TextField
      variant="standard"
      InputProps={{
        startAdornment: <InputAdornment position="start">=</InputAdornment>,
      }}
      fullWidth
      onChange={handleChange}
      onBlur={onBlur}
      label={property}
      value={s}
    />
  );
}

function Obj({ property, value, changed, app }) {
  return (
    <StyledAccordion square className={classes.root}>
      <AccordionSummary expandIcon={<ExpandMore />} className={classes.summary}>
        <Typography>{property}</Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>{generateComponents(value, changed, app)}</AccordionDetails>
    </StyledAccordion>
  );
}

const registeredComponents = {
  boolean: Bool,
  string: Str,
  object: Obj,
  number: Num,
  expression: Expression,
  variable: Variable,
};

const QRX = /^q[A-Z]/;

const whiteListedQ = {
  qStringExpression: true,
};

export default function generateComponents(properties, changed, app) {
  const components = Object.keys(properties)
    .map((key) => {
      if (['visualization', 'version'].indexOf(key) !== -1) {
        return false;
      }
      if (!whiteListedQ[key] && QRX.test(key)) {
        // skip q properties for now, but allow qStringExpression
        return false;
      }
      const type = getType(properties[key], key);
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
    <StyledGrid container direction="column" gap={0} alignItems="stretch">
      {components.map((c) => (
        <Grid item xs key={c.key} style={{ width: '100%' }}>
          <c.Component
            key={c.key}
            app={app}
            property={c.property}
            value={c.value}
            target={properties}
            changed={changed}
          />
        </Grid>
      ))}
    </StyledGrid>
  );
}
