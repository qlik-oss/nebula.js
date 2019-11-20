/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState, useContext } from 'react';

import { Grid, Paper, makeStyles } from '@material-ui/core';
import { useTheme } from '@nebula.js/ui/theme';

import CError from './Error';
import Header from './Header';
import Footer from './Footer';
import Supernova from './Supernova';

import useRect from '../hooks/useRect';
import useLayout from '../hooks/useLayout';
import useSupernova from '../hooks/useSupernova';
import useSelectionsModal from '../hooks/useSelectionsModal';
import useLayoutError from '../hooks/useLayoutError';
import LocaleContext from '../contexts/LocaleContext';

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

const Loading = ({ delay = 750 }) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setShowLoading(true), delay);

    return () => clearTimeout(handle);
  });

  return showLoading && <div>loading...</div>;
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

export default function Cell({ nebulaContext, model, snContext, snOptions, onMount }) {
  const translator = useContext(LocaleContext);
  const [err, setErr] = useState(null);

  const [layout] = useLayout(model);
  const [sn, snErr] = useSupernova({
    model,
    nebulaContext,
    genericObjectType: layout && layout.visualization,
    genericObjectVersion: layout && layout.version,
  });
  const [layoutError, requirementsError] = useLayoutError({ sn, layout });
  const [contentRef /* contentRect */, , contentNode] = useRect();
  const theme = useTheme();
  useSelectionsModal({ sn, model, layout });

  useEffect(() => {
    onMount();
  }, []);

  useEffect(() => {
    if (snErr) {
      setErr(snErr);
    } else if (layoutError.length) {
      setErr({ message: '', data: layoutError });
    } else if (requirementsError.length) {
      setErr({ message: translator.get('Supernova.Incomplete'), data: [] });
    } else {
      setErr(null);
    }
  }, [snErr, layoutError, requirementsError]);

  return (
    <Paper style={{ height: '100%', position: 'relative' }} elevation={0} square className="nebulajs-cell">
      <Grid container direction="column" spacing={0} style={{ height: '100%', padding: theme.spacing(1) }}>
        <Grid item style={{ maxWidth: '100%' }}>
          <Header layout={layout} sn={sn}>
            &nbsp;
          </Header>
        </Grid>
        <Grid item xs>
          <Content showError={!!err} ref={contentRef}>
            {sn === null && err === null && <Loading />}
            {err && <CError {...err} />}
            {sn && !err && (
              <Supernova
                key={layout.visualization}
                sn={sn}
                snContext={snContext}
                snOptions={snOptions}
                layout={layout}
                parentNode={contentNode}
              />
            )}
          </Content>
        </Grid>
        <Footer layout={layout} />
      </Grid>
    </Paper>
  );
}
