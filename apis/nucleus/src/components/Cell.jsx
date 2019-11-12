import React, { useEffect, useState } from 'react';

import { Grid, Paper, makeStyles } from '@material-ui/core';
import { useTheme } from '@nebula.js/ui/theme';

import Requirements from './Requirements';
import CError from './Error';
import Header from './Header';
import Footer from './Footer';
import Supernova from './Supernova';
import Placeholder from './Placeholder';

const useStyles = makeStyles(() => ({
  content: {
    position: 'relative',
    height: '100%',
  },
  contentError: {
    '&::before': {
      position: 'absolute',
      height: '100%',
      width: '100%',
      top: 0,
      left: 0,
      content: '""',
      backgroundSize: '14.14px 14.14px',
      backgroundImage:
        'linear-gradient(135deg, currentColor 10%, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 50%, currentColor 50%, currentColor 59%, rgba(0,0,0,0) 60%, rgba(0,0,0,0) 103%)',
      opacity: 0.1,
    },
  },
}));

const showRequirements = (sn, layout) => {
  if (!sn || !sn.generator || !sn.generator.qae || !layout || !layout.qHyperCube) {
    return false;
  }
  const def = sn.generator.qae.data.targets[0];
  if (!def) {
    return false;
  }
  const minD = def.dimensions.min();
  const minM = def.measures.min();
  return layout.qHyperCube.qDimensionInfo.length < minD || layout.qHyperCube.qMeasureInfo.length < minM;
};

const Content = React.forwardRef(({ children, showError }, ref) => {
  const { content, contentError } = useStyles();
  const classes = [content, showError ? contentError : ''];
  return (
    <div ref={ref} className={classes.join(' ')}>
      <div
        className="nebulajs-sn"
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          right: '8px',
          bottom: '8px',
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default function Cell({ api, onInitial }) {
  const [, setChanged] = useState(0);

  const theme = useTheme();
  useEffect(() => {
    const onChanged = () => setChanged(Date.now());
    api.on('changed', onChanged);
    return () => {
      api.removeListener('changed', onChanged);
    };
  }, [api]);

  useEffect(() => {
    onInitial();
  });

  const objectProps = api.objectProps();
  const userProps = api.userProps();

  const SN = showRequirements(objectProps.sn, objectProps.layout) ? Requirements : Supernova;
  const Comp = !objectProps.sn ? Placeholder : SN;
  const showError = objectProps.error || objectProps.dataErrors.length;

  return (
    <Paper style={{ height: '100%', position: 'relative' }} elevation={0} square className="nebulajs-cell">
      <Grid container direction="column" spacing={0} style={{ height: '100%', padding: theme.spacing(1) }}>
        <Grid item style={{ maxWidth: '100%' }}>
          <Header layout={objectProps.layout} sn={objectProps.sn}>
            &nbsp;
          </Header>
        </Grid>
        <Grid item xs>
          <Content showError={showError}>
            {showError ? (
              <CError err={objectProps.err} dataErrors={objectProps.dataErrors} />
            ) : (
              <Comp
                key={objectProps.layout.visualization}
                sn={objectProps.sn}
                snContext={userProps.context}
                snOptions={userProps.options}
                layout={objectProps.layout}
              />
            )}
          </Content>
        </Grid>
        <Footer layout={objectProps.layout} />
      </Grid>
    </Paper>
  );
}
