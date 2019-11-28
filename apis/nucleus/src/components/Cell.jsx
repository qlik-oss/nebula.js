/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef, useImperativeHandle, useEffect, useState, useContext, useReducer } from 'react';

import { Grid, Paper } from '@material-ui/core';
import { useTheme } from '@nebula.js/ui/theme';

import CError from './Error';
import LongRunningQuery from './LongRunningQuery';
import Header from './Header';
import Footer from './Footer';
import Supernova from './Supernova';

import useRect from '../hooks/useRect';
import useLayout from '../hooks/useLayout';
import LocaleContext from '../contexts/LocaleContext';
import { createObjectSelectionAPI } from '../selections';

const initialState = {
  loading: false,
  loadingError: false,
  loaded: false,
  longRunningQuery: false,
  error: null,
  sn: null,
};

const contentReducer = (state, action) => {
  console.log(action.type);
  switch (action.type) {
    case 'LOADING': {
      return {
        ...state,
        loading: true,
      };
    }
    case 'LOAD_ERROR': {
      return {
        ...state,
        loadError: true,
      };
    }
    case 'LOADED': {
      return {
        ...state,
        loaded: true,
        loading: false,
        loadError: false,
        longRunningQuery: false,
        error: null,
        sn: action.sn,
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
        loadError: false,
        longRunningQuery: false,
        error: action.error,
      };
    }
    default: {
      throw new Error(`Unhandled type: ${action.type}`);
    }
  }
};

const Loading = ({ delay = 750 }) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setShowLoading(true), delay);

    return () => clearTimeout(handle);
  });

  return showLoading && <div>loading...</div>;
};

const handleModal = ({ sn, layout, model }) => {
  if (sn && sn.component.selections && sn.component.selections.id === model.id) {
    sn.component.selections.setLayout(layout);
    if (layout && layout.qSelectionInfo && layout.qSelectionInfo.qInSelections && !sn.component.selections.isModal()) {
      sn.selections.goModal('/qHyperCubeDef'); // TODO - use path from data targets
    }
    if (!layout.qSelectionInfo || !layout.qSelectionInfo.qInSelections) {
      if (sn.component.selections.isModal()) {
        sn.component.selections.noModal();
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
      requirementsError.push(path);
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
    dispatch({ type: 'LOAD_ERROR' });
  }
  return undefined;
};

const Cell = forwardRef(({ nebulaContext, model, initialSnContext, initialSnOptions, onMount }, ref) => {
  const {
    app,
    nebbie: { types },
  } = nebulaContext;

  const translator = useContext(LocaleContext);
  const theme = useTheme();
  const [state, dispatch] = useReducer(contentReducer, initialState);
  const [layout, validating, cancel, retry] = useLayout({ app, model });
  const [contentRef, contentRect, , contentNode] = useRect();
  const [snContext, setSnContext] = useState(initialSnContext);
  const [snOptions, setSnOptions] = useState(initialSnOptions);

  useEffect(() => {
    const validate = () => {
      const [showError, error] = validateTargets(translator, layout, state.sn.generator.qae.data);
      if (showError) {
        dispatch({ type: 'ERROR', error });
      }
    };
    const load = async (withLayout, version) => {
      const sn = await loadType({ types, name: withLayout.visualization, version, layout, model, app });
      onMount();
      dispatch({ type: 'LOADED', sn });
      // Handle modal
      handleModal({ sn, layout, model });
    };

    if (!layout) {
      dispatch({ type: 'LOADING' });
      return undefined;
    }
    if (state.sn) {
      validate(state.sn);
      handleModal({ sn: state.sn, layout, model });
      return undefined;
    }

    // Load supernova
    const withVersion = types.getSupportedVersion(layout.visualization, layout.version);
    if (!withVersion) {
      dispatch({ type: 'ERROR' });
      return undefined;
    }
    load(layout, withVersion);

    return () => {};
  }, [types, state.sn, model, layout]);

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
      takeSnapshot: async () => {
        const snapshot = {
          ...layout,
          snapshotData: {
            object: {
              size: {
                w: contentRect.width,
                h: contentRect.height,
              },
            },
          },
        };
        if (typeof state.sn.component.setSnapshotData === 'function') {
          return (await state.sn.component.setSnapshotData(snapshot)) || snapshot;
        }
        return snapshot;
      },
    }),
    [state.sn, contentRect, layout]
  );

  let Content = null;
  if (state.loading) {
    Content = <Loading />;
  } else if (state.loadingError) {
    Content = <CError {...state.error} />;
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
      {state.longRunningQuery && <LongRunningQuery onCancel={cancel} onRetry={retry} />}
    </Paper>
  );
});
export default Cell;
