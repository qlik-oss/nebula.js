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
import useLayout from '../hooks/useLayout';
import InstanceContext from '../contexts/InstanceContext';
import { createObjectSelectionAPI } from '../selections';

const initialState = err => ({
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
    selections.setLayout(layout);
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

const filterData = d => (d.qError ? d.qError.qErrorCode === 7005 : true);

const validateTargets = (translator, layout, { targets }) => {
  const layoutErrors = [];
  const requirementsError = [];
  targets.forEach(def => {
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

const loadType = async ({ dispatch, types, name, version, layout, model, app }) => {
  try {
    const snType = await getType({ types, name, version });
    // Layout might have changed since we requested the new type -> quick return
    if (layout.visualization !== name) {
      return undefined;
    }
    const selections = createObjectSelectionAPI(model, app);
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

const Cell = forwardRef(({ corona, model, initialSnContext, initialSnOptions, initialError, onMount }, ref) => {
  const {
    app,
    public: {
      nebbie: { types },
    },
  } = corona;

  const { translator, language } = useContext(InstanceContext);
  const theme = useTheme();
  const [state, dispatch] = useReducer(contentReducer, initialState(initialError));
  const [layout, { validating, canCancel, canRetry }, longrunning] = useLayout(model);
  const [contentRef, contentRect, , contentNode] = useRect();
  const [snContext, setSnContext] = useState(initialSnContext);
  const [snOptions, setSnOptions] = useState(initialSnOptions);
  const cellRef = useRef();

  useEffect(() => {
    if (initialError) {
      return undefined;
    }
    const validate = sn => {
      const [showError, error] = validateTargets(translator, layout, sn.generator.qae.data);
      if (showError) {
        dispatch({ type: 'ERROR', error });
      } else {
        dispatch({ type: 'RENDER' });
      }
      handleModal({ sn: state.sn, layout, model });
    };
    const load = async (withLayout, version) => {
      const sn = await loadType({ dispatch, types, name: withLayout.visualization, version, layout, model, app });
      if (sn) {
        dispatch({ type: 'LOADED', sn });
        onMount();
      }
      return undefined;
    };

    if (!layout) {
      dispatch({ type: 'LOADING' });
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
  }, [types, state.sn, model, layout, language]);

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
      setSnContext,
      setSnOptions,
      async takeSnapshot() {
        const { width, height } = cellRef.current.getBoundingClientRect();

        // clone layout to avoid mutation
        let clonedLayout = JSON.parse(JSON.stringify(layout));
        if (typeof state.sn.component.setSnapshotData === 'function') {
          clonedLayout = (await state.sn.component.setSnapshotData(clonedLayout)) || clonedLayout;
        }
        return {
          key: String(+Date.now()),
          meta: {
            language: translator.language(),
            theme: theme.name,
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
        if (!corona.config.snapshot.capture) {
          throw new Error('Nebula has not been configured with snapshot.capture');
        }
        const snapshot = await this.takeSnapshot(); // eslint-disable-line
        return corona.config.snapshot.capture(snapshot);
      },
    }),
    [state.sn, contentRect, layout, theme.name]
  );
  // console.log('content', state);
  let Content = null;
  if (state.loading) {
    Content = <LoadingSn />;
  } else if (state.error) {
    Content = <CError {...state.error} />;
  } else if (state.loaded) {
    Content = (
      <Supernova
        key={layout.visualization}
        sn={state.sn}
        snContext={snContext}
        snOptions={snOptions}
        layout={layout}
        parentNode={contentNode}
      />
    );
  }

  return (
    <Paper
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
      elevation={0}
      square
      className="nebulajs-cell"
      ref={cellRef}
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
        <Header layout={layout} sn={state.sn}>
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
          {Content}
        </Grid>
        <Footer layout={layout} />
      </Grid>
      {state.longRunningQuery && <LongRunningQuery canCancel={canCancel} canRetry={canRetry} api={longrunning} />}
    </Paper>
  );
});
export default Cell;
