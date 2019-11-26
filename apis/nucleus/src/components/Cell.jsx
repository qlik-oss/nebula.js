/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState, useContext } from 'react';

import { Grid, Paper } from '@material-ui/core';
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

const Loading = ({ delay = 750 }) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setShowLoading(true), delay);

    return () => clearTimeout(handle);
  });

  return showLoading && <div>loading...</div>;
};

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
    <Paper
      style={{ position: 'relative', width: '100%', height: '100%' }}
      elevation={0}
      square
      className="nebulajs-cell"
    >
      <Grid
        container
        direction="column"
        spacing={0}
        style={{ position: 'relative', width: '100%', height: '100%', padding: theme.spacing(1) }}
      >
        <Header layout={layout} sn={sn}>
          &nbsp;
        </Header>
        <Grid
          item
          xs
          style={{
            height: '100%',
          }}
          ref={contentRef}
        >
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
        </Grid>
        <Footer layout={layout} />
      </Grid>
    </Paper>
  );
}
