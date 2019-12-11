import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';

import { Grid, Card, Toolbar, Divider, IconButton, CircularProgress } from '@material-ui/core';

import SvgIcon from '@nebula.js/ui/icons/SvgIcon';

import PropsDialog from './PropertiesDialog';

import AppContext from '../contexts/AppContext';
import VizContext from '../contexts/VizContext';

import Chart from './Chart';

export default function({ id, expandable, minHeight }) {
  const language = 'en-US'; // TODO - useLocale
  const app = useContext(AppContext);
  const [model, setModel] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [localViz, setLocalViz] = useState(null);

  const { currentThemeName, activeViz, setActiveViz, setExpandedObject, expandedObject } = useContext(VizContext);

  const isExpanded = expandedObject === id;

  const vizRef = useRef();
  useEffect(() => {
    const v = app.getObject(id).then(m => {
      setModel(m);
      return m;
    });

    return () => {
      v.then(m => m.emit('close'));
    };
  }, [id]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const onLoad = useCallback(
    (viz, el) => {
      vizRef.current = {
        viz,
        el,
      };
      setLocalViz(viz);
    },
    [id]
  );

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedObject(null);
    } else {
      setExpandedObject(id);
      setActiveViz(localViz);
    }
  };

  const snapIt = useCallback(
    (doExport = false) => {
      if (!vizRef.current) {
        return;
      }
      if (doExport) {
        setExporting(true);
        vizRef.current.viz.exportImage().then(res => {
          if (res && res.url) {
            window.open(res.url);
          }
          setExporting(false);
        });
      } else {
        const containerSize = vizRef.current.el.getBoundingClientRect();
        vizRef.current.viz.takeSnapshot().then(snapshot => {
          fetch('/njs/snapshot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(snapshot),
          });
          window.open(
            `/render?snapshot=${snapshot.key}`,
            'snapshot',
            `height=${Math.round(containerSize.height)},width=${Math.round(containerSize.width)}`
          );
        });
      }
    },
    [model, currentThemeName]
  );

  const activeStyle =
    !isExpanded && vizRef.current && activeViz && activeViz === vizRef.current.viz
      ? {
          boxShadow: '0px 0px 4px 2px rgba(0,100,200,0.85)',
        }
      : {};

  const isActive = activeViz === localViz;

  return (
    <Card style={{ minHeight, height: '100%', ...activeStyle }}>
      <Grid container direction="column" style={{ height: '100%', position: 'relative' }}>
        <Grid item>
          <Toolbar variant="dense" disableGutters style={{ padding: '0 8px' }}>
            <PropsDialog model={model} show={dialogOpen} close={closeDialog} />
            <IconButton title="Modify object properties" disabled={!model} onClick={() => setDialogOpen(true)}>
              {SvgIcon({
                size: 'large',
                viewBox: '0 0 16 16',
                d:
                  'M14,8 C14,8.2 14,8.4 14,8.6 L16,9.6 L15.4,11.4 L13.2,11 C13,11.3 12.8,11.7 12.5,12 L13.6,14 L12,15 L10.4,13.4 C10,13.5 9.7,13.7 9.3,13.8 L9,16 L7,16 L6.7,13.8 C6.3,13.7 5.9,13.6 5.6,13.4 L4,15 L2.4,13.9 L3.5,11.9 C3.2,11.6 3,11.3 2.8,10.9 L0.6,11.3 L0,9.6 L2,8.6 C2,8.4 2,8.2 2,8 C2,7.8 2,7.6 2,7.4 L0,6.4 L0.6,4.6 L2.8,5 C3,4.7 3.2,4.3 3.5,4 L2.4,2 L4,1 L5.6,2.6 C6,2.4 6.3,2.3 6.7,2.2 L7,0 L9,0 L9.3,2.2 C9.7,2.3 10.1,2.4 10.4,2.6 L12,1 L13.6,2.1 L12.5,4.1 C12.8,4.4 13,4.7 13.2,5.1 L15.4,4.7 L16,6.4 L14,7.4 C14,7.6 14,7.8 14,8 Z M8,11 C9.7,11 11,9.7 11,8 C11,6.3 9.7,5 8,5 C6.3,5 5,6.3 5,8 C5,9.7 6.3,11 8,11 Z',
              })}
            </IconButton>
            <IconButton
              disabled={!model}
              title="Open in single render view"
              href={
                model
                  ? `${document.location.href.replace(/\/dev\//, '/render/')}?object=${
                      model.id
                    }&permissions=passive,interact,select&theme=${currentThemeName}&language=${language}`
                  : ''
              }
              target="_blank"
            >
              {SvgIcon({
                size: 'large',
                viewBox: '0 0 24 24',
                d:
                  'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
              })}
            </IconButton>
            <IconButton disabled={!model} onClick={() => snapIt()} title="Take and render as snapshot">
              {SvgIcon({
                size: 'large',
                viewBox: '0 0 24 24',
                d:
                  'M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
              })}
            </IconButton>
            {exporting ? (
              <CircularProgress size={24} />
            ) : (
              <IconButton disabled={!model} onClick={() => snapIt(true)} title="Export as image">
                {SvgIcon({
                  size: 'large',
                  viewBox: '0 0 24 24',
                  d:
                    'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
                })}
              </IconButton>
            )}
            <Grid item xs />
            {expandable && (
              <IconButton disabled={!localViz || isActive} onClick={() => setActiveViz(localViz)} title="Edit">
                {SvgIcon({
                  size: 'large',
                  viewBox: '0 0 24 24',
                  d:
                    'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
                })}
              </IconButton>
            )}
            {expandable && (
              <IconButton disabled={!model || !localViz} onClick={() => toggleExpand()} title="Expand">
                {SvgIcon({
                  size: 'large',
                  viewBox: '0 0 24 24',
                  d: isExpanded
                    ? 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z'
                    : 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
                })}
              </IconButton>
            )}
          </Toolbar>
          <Divider />
        </Grid>
        <Grid item xs>
          <Chart id={id} onLoad={onLoad} />
        </Grid>
      </Grid>
    </Card>
  );
}
