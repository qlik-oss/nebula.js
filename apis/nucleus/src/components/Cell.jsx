/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef, useImperativeHandle, useEffect, useState, useContext, useReducer, useRef } from 'react';

import { Grid, Paper } from '@material-ui/core';
import { useTheme } from '@nebula.js/ui/theme';

import CError from './Error';
import LongRunningQuery from './LongRunningQuery';
import Loading from './Loading';
import Header from './Header';
import Footer from './Footer';
import Supernova from './Supernova';

import useRect from '../hooks/useRect';
import useLayout, { useAppLayout } from '../hooks/useLayout';
import InstanceContext from '../contexts/InstanceContext';
import useObjectSelections from '../hooks/useObjectSelections';

/**
 * @interface
 * @extends HTMLElement
 */
const CellElement = {
  /** @type {'njs-cell'} */
  className: 'njs-cell',
};

const initialState = (err) => ({
  loading: false,
  loaded: false,
  longRunningQuery: false,
  error: err ? { title: err.message } : null,
  sn: null,
});

const contentReducer = (state, action) => {
  // console.log('content reducer', action.type);
  switch (action.type) {
    case 'LOADING': {
      return {
        ...state,
        loading: true,
      };
    }
    case 'LOADED': {
      return {
        ...state,
        loaded: true,
        loading: false,
        longRunningQuery: false,
        error: null,
        sn: action.sn,
      };
    }
    case 'RENDER': {
      return {
        ...state,
        loaded: true,
        loading: false,
        longRunningQuery: false,
        error: null,
      };
    }
    case 'LONG_RUNNING_QUERY': {
      return {
        ...state,
        longRunningQuery: true,
      };
    }
    case 'ERROR': {
      return {
        ...state,
        loading: false,
        longRunningQuery: false,
        error: action.error,
      };
    }
    default: {
      throw new Error(`Unhandled type: ${action.type}`);
    }
  }
};

const LoadingSn = ({ delay = 750 }) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setShowLoading(true), delay);

    return () => clearTimeout(handle);
  }, []);

  return showLoading && <Loading />;
};

const handleModal = ({ sn, layout, model }) => {
  const selections = sn && sn.component && sn.component.selections;
  if (!selections || !selections.id || !model.id) {
    return;
  }
  if (selections.id === model.id) {
    if (layout && layout.qSelectionInfo && layout.qSelectionInfo.qInSelections && !selections.isModal()) {
      const { targets } = sn.generator.qae.data;
      const firstPropertyPath = targets[0].propertyPath;
      selections.goModal(firstPropertyPath);
    }
    if (!layout.qSelectionInfo || !layout.qSelectionInfo.qInSelections) {
      if (selections.isModal()) {
        selections.noModal();
      }
    }
  }
};

const filterData = (d) => (d.qError ? d.qError.qErrorCode === 7005 : true);

const validateTargets = (translator, layout, { targets }) => {
  const layoutErrors = [];
  const requirementsError = [];
  targets.forEach((def) => {
    const minD = def.dimensions.min();
    const minM = def.measures.min();
    const hc = def.resolveLayout(layout);
    const d = (hc.qDimensionInfo || []).filter(filterData);
    const m = (hc.qMeasureInfo || []).filter(filterData);
    const path = def.layoutPath;
    if (hc.qError) {
      layoutErrors.push({ path, error: hc.qError });
    }
    if (d.length < minD || m.length < minM) {
      requirementsError.push({ path });
    }
  });
  const showError = !!(layoutErrors.length || requirementsError.length);
  const title = requirementsError.length ? translator.get('Supernova.Incomplete') : 'Error';
  const data = requirementsError.length ? requirementsError : layoutErrors;
  return [showError, { title, data }];
};

const getType = async ({ types, name, version }) => {
  const SN = await types
    .get({
      name,
      version,
    })
    .supernova();
  return SN;
};

const loadType = async ({ dispatch, types, name, version, layout, model, app, selections }) => {
  try {
    const snType = await getType({ types, name, version });
    // Layout might have changed since we requested the new type -> quick return
    if (layout.visualization !== name) {
      return undefined;
    }

    const sn = snType.create({
      model,
      app,
      selections,
    });
    return sn;
  } catch (err) {
    dispatch({ type: 'ERROR', error: { title: err.message } });
  }
  return undefined;
};

const Cell = forwardRef(({ halo, model, initialSnOptions, initialError, onMount }, ref) => {
  const { app, types } = halo;

  const { translator, language } = useContext(InstanceContext);
  const theme = useTheme();
  const [cellRef, cellRect, cellNode] = useRect();
  const [state, dispatch] = useReducer(contentReducer, initialState(initialError));
  const [layout, { validating, canCancel, canRetry }, longrunning] = useLayout(model);
  const [appLayout] = useAppLayout(app);
  const [contentRef, contentRect] = useRect();
  const [snOptions, setSnOptions] = useState(initialSnOptions);
  const [selections] = useObjectSelections(app, model);
  const [hovering, setHover] = useState(false);
  const hoveringDebouncer = useRef({ enter: null, leave: null });

  const handleOnMouseEnter = () => {
    if (hoveringDebouncer.current.leave) {
      clearTimeout(hoveringDebouncer.current.leave);
    }
    if (hoveringDebouncer.enter) return;
    hoveringDebouncer.current.enter = setTimeout(() => {
      setHover(true);
      hoveringDebouncer.current.enter = null;
    }, 250);
  };
  const handleOnMouseLeave = () => {
    if (hoveringDebouncer.current.enter) {
      clearTimeout(hoveringDebouncer.current.enter);
    }
    if (hoveringDebouncer.current.leave) return;
    hoveringDebouncer.current.leave = setTimeout(() => {
      setHover(false);
      hoveringDebouncer.current.leave = null;
    }, 750);
  };

  useEffect(() => {
    if (initialError || !appLayout) {
      return undefined;
    }
    const validate = (sn) => {
      const [showError, error] = validateTargets(translator, layout, sn.generator.qae.data);
      if (showError) {
        dispatch({ type: 'ERROR', error });
      } else {
        dispatch({ type: 'RENDER' });
      }
      handleModal({ sn: state.sn, layout, model });
    };
    const load = async (withLayout, version) => {
      dispatch({ type: 'LOADING' });
      const sn = await loadType({
        dispatch,
        types,
        name: withLayout.visualization,
        version,
        layout,
        model,
        app,
        selections,
      });
      if (sn) {
        dispatch({ type: 'LOADED', sn });
        onMount();
      }
      return undefined;
    };

    if (!layout) {
      return undefined;
    }

    if (state.sn) {
      validate(state.sn);
      return undefined;
    }

    // Load supernova h
    const withVersion = types.getSupportedVersion(layout.visualization, layout.version);
    if (!withVersion) {
      dispatch({
        type: 'ERROR',
        error: {
          title: `Could not find a version of '${layout.visualization}' that supports current object version. Did you forget to register ${layout.visualization}?`,
        },
      });
      return undefined;
    }
    load(layout, withVersion);

    return () => {};
  }, [types, state.sn, model, layout, appLayout, language]);

  // Long running query
  useEffect(() => {
    if (!validating) {
      return undefined;
    }
    const handle = setTimeout(() => dispatch({ type: 'LONG_RUNNING_QUERY' }), 2000);
    return () => clearTimeout(handle);
  }, [validating]);

  // Expose cell ref api
  useImperativeHandle(
    ref,
    () => ({
      setSnOptions,
      async takeSnapshot() {
        const { width, height } = cellRect;

        // clone layout to avoid mutation
        let clonedLayout = JSON.parse(JSON.stringify(layout));
        if (typeof state.sn.component.setSnapshotData === 'function') {
          clonedLayout = (await state.sn.component.setSnapshotData(clonedLayout)) || clonedLayout;
        }
        return {
          // TODO - this snapshot format needs to be documented and governed
          key: String(+Date.now()),
          meta: {
            language: translator.language(),
            theme: theme.name,
            appLayout,
            // direction: 'ltr',
            size: {
              width: Math.round(width),
              height: Math.round(height),
            },
          },
          layout: clonedLayout,
        };
      },
      async exportImage() {
        if (typeof halo.config.snapshot.capture !== 'function') {
          throw new Error('Stardust embed has not been configured with snapshot.capture callback');
        }
        const snapshot = await this.takeSnapshot(); // eslint-disable-line
        return halo.config.snapshot.capture(snapshot);
      },
    }),
    [state.sn, contentRect, cellRect, layout, theme.name, appLayout]
  );

  // console.log('content', state);
  let Content = null;
  if (state.loading && !state.longRunningQuery) {
    Content = <LoadingSn />;
  } else if (state.error) {
    Content = <CError {...state.error} />;
  } else if (state.loaded) {
    Content = (
      <Supernova
        key={layout.visualization}
        sn={state.sn}
        halo={halo}
        snOptions={snOptions}
        layout={layout}
        appLayout={appLayout}
      />
    );
  }

  return (
    <Paper
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
      elevation={0}
      square
      className={CellElement.className}
      ref={cellRef}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
    >
      <Grid
        container
        direction="column"
        spacing={0}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: theme.spacing(1),
          ...(state.longRunningQuery ? { opacity: '0.3' } : {}),
        }}
      >
        {cellNode && layout && state.sn && (
          <Header layout={layout} sn={state.sn} anchorEl={cellNode} hovering={hovering}>
            &nbsp;
          </Header>
        )}
        <Grid
          item
          xs
          style={{
            height: '100%',
          }}
          ref={contentRef}
        >
          {Content}
        </Grid>
        <Footer layout={layout} />
      </Grid>
      {state.longRunningQuery && <LongRunningQuery canCancel={canCancel} canRetry={canRetry} api={longrunning} />}
    </Paper>
  );
});
export default Cell;
