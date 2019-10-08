import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

import {
  Grid,
  Card,
  Toolbar,
  Divider,
  IconButton,
  CircularProgress,
} from '@nebula.js/ui/components';

import SvgIcon from '@nebula.js/ui/icons/SvgIcon';

import PropsDialog from './PropertiesDialog';

import AppContext from '../contexts/AppContext';

import Chart from './Chart';

const takeAndSendSnapshot = ({
  ref,
  route = '/snapshot',
}) => ref.viz.takeSnapshot().then((snapshot) => {
  const containerSize = ref.el.getBoundingClientRect();
  return fetch(route, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: snapshot.qInfo.qId,
      meta: {
        language: '',
        theme: '',
        direction: '',
        size: {
          width: Math.round(containerSize.width),
          height: Math.round(containerSize.height),
        },
      },
      layout: snapshot,
    }),
  }).then((response) => response.json());
});

export default function ({
  id,
  onSelected,
  minHeight,
}) {
  const app = useContext(AppContext);
  const [model, setModel] = useState(null);
  const [exporting, setExporting] = useState(false);

  const vizRef = useRef();
  useEffect(() => {
    const v = app.getObject(id).then((m) => {
      setModel(m);
      return m;
    });

    return () => {
      v.then((m) => m.emit('close'));
    };
  }, [id]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const closeDialog = useCallback(() => { setDialogOpen(false); }, []);

  const onLoad = useCallback((viz, el) => {
    vizRef.current = {
      viz,
      el,
    };
  }, [id]);

  const takeSnapshot = useCallback(() => {
    if (!vizRef.current) {
      return;
    }
    const containerSize = vizRef.current.el.getBoundingClientRect();
    takeAndSendSnapshot({ ref: vizRef.current }).then((res) => {
      if (res && res.url) {
        window.open(res.url, 'snapshot', `height=${Math.round(containerSize.height)},width=${Math.round(containerSize.width)}`);
      }
    });
  }, [model]);

  const exportImage = useCallback(() => {
    if (!vizRef.current) {
      return;
    }
    setExporting(true);
    takeAndSendSnapshot({ ref: vizRef.current, route: '/image' }).then((res) => {
      if (res && res.url) {
        window.open(res.url);
      }
      setExporting(false);
    });
  }, [model]);

  return (
    <Card style={{ minHeight, height: '100%' }}>
      <Grid container direction="column" style={{ height: '100%', position: 'relative' }}>
        <Grid item>
          <Toolbar variant="dense" disableGutters style={{ padding: '0 8px' }}>
            <PropsDialog model={model} show={dialogOpen} close={closeDialog} />
            <IconButton
              title="Modify object properties"
              disabled={!model}
              onClick={() => setDialogOpen(true)}
            >
              {SvgIcon({
                size: 'large',
                viewBox: '0 0 16 16',
                d: 'M14,8 C14,8.2 14,8.4 14,8.6 L16,9.6 L15.4,11.4 L13.2,11 C13,11.3 12.8,11.7 12.5,12 L13.6,14 L12,15 L10.4,13.4 C10,13.5 9.7,13.7 9.3,13.8 L9,16 L7,16 L6.7,13.8 C6.3,13.7 5.9,13.6 5.6,13.4 L4,15 L2.4,13.9 L3.5,11.9 C3.2,11.6 3,11.3 2.8,10.9 L0.6,11.3 L0,9.6 L2,8.6 C2,8.4 2,8.2 2,8 C2,7.8 2,7.6 2,7.4 L0,6.4 L0.6,4.6 L2.8,5 C3,4.7 3.2,4.3 3.5,4 L2.4,2 L4,1 L5.6,2.6 C6,2.4 6.3,2.3 6.7,2.2 L7,0 L9,0 L9.3,2.2 C9.7,2.3 10.1,2.4 10.4,2.6 L12,1 L13.6,2.1 L12.5,4.1 C12.8,4.4 13,4.7 13.2,5.1 L15.4,4.7 L16,6.4 L14,7.4 C14,7.6 14,7.8 14,8 Z M8,11 C9.7,11 11,9.7 11,8 C11,6.3 9.7,5 8,5 C6.3,5 5,6.3 5,8 C5,9.7 6.3,11 8,11 Z',
              })}
            </IconButton>
            <IconButton disabled={!model} title="Open in single render view" href={model ? `${document.location.href.replace(/\/dev\//, '/render/')}?object=${model.id}&permissions=passive,interact,select` : ''} target="_blank">
              {SvgIcon({
                size: 'large',
                viewBox: '0 0 24 24',
                d: 'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
              })}
            </IconButton>
            <IconButton
              disabled={!model}
              onClick={() => takeSnapshot()}
              title="Take and render as snapshot"
            >
              {SvgIcon({
                size: 'large',
                viewBox: '0 0 24 24',
                d: 'M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
              })}
            </IconButton>
            {exporting ? <CircularProgress size={24} /> : (
              <IconButton
                disabled={!model}
                onClick={() => exportImage()}
                title="Export as image"
              >
                {SvgIcon({
                  size: 'large',
                  viewBox: '0 0 24 24',
                  d: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
                })}
              </IconButton>
            )}
          </Toolbar>
          <Divider />
        </Grid>
        <Grid item xs>
          <Chart id={id} onSelected={onSelected} onLoad={onLoad} />
        </Grid>
      </Grid>
    </Card>
  );
}
