/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef, useImperativeHandle, useEffect, useState, useContext, useReducer, useRef } from 'react';

import { Grid, Paper } from '@mui/material';
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
  visualization: null,
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
        visualization: action.visualization,
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

const validateInfo = (min, info, getDescription, translatedError, translatedCalcCond) =>
  [...Array(min).keys()].map((i) => {
    const exists = !!(info && info[i]);
    const softError = exists && info[i].qError && info[i].qError.qErrorCode === 7005;
    const error = exists && !softError && info[i].qError;
    const delimiter = ':';
    const calcCondMsg = softError && info[i].qCalcCondMsg;
    const label = `${
      // eslint-disable-next-line no-nested-ternary
      error ? translatedError : softError ? calcCondMsg || translatedCalcCond : (exists && info[i].qFallbackTitle) || ''
    }`;
    const customDescription = getDescription(i);
    const description = customDescription ? `${customDescription}${label.length ? delimiter : ''}` : null;
    return {
      description,
      label,
      missing: (info && !exists && !error && i >= info.length) || softError,
      error,
    };
  });

const getInfo = (info) => (info && (Array.isArray(info) ? info : [info])) || [];

const validateTarget = (translator, layout, properties, def) => {
  const minD = def.dimensions.min();
  const minM = def.measures.min();
  const c = def.resolveLayout(layout);
  const reqDimErrors = validateInfo(
    minD,
    getInfo(c.qDimensionInfo),
    (i) => def.dimensions.description(properties, i),
    translator.get('Visualization.Invalid.Dimension'),
    translator.get('Visualization.UnfulfilledCalculationCondition')
  );
  const reqMeasErrors = validateInfo(
    minM,
    getInfo(c.qMeasureInfo),
    (i) => def.measures.description(properties, i),
    translator.get('Visualization.Invalid.Measure'),
    translator.get('Visualization.UnfulfilledCalculationCondition')
  );
  return {
    reqDimErrors,
    reqMeasErrors,
  };
};

const validateCubes = (translator, targets, layout) => {
  let hasUnfulfilledErrors = false;
  let aggMinD = 0;
  let aggMinM = 0;
  let hasLayoutErrors = false;
  let hasLayoutUnfulfilledCalculcationCondition = false;
  const layoutErrors = [];
  for (let i = 0; i < targets.length; ++i) {
    const def = targets[i];
    const minD = def.dimensions.min();
    const minM = def.measures.min();
    const c = def.resolveLayout(layout);
    const d = getInfo(c.qDimensionInfo).filter(filterData); // Filter out optional calc conditions
    const m = getInfo(c.qMeasureInfo).filter(filterData); // Filter out optional calc conditions
    aggMinD += minD;
    aggMinM += minM;
    if (d.length < minD || m.length < minM) {
      hasUnfulfilledErrors = true;
    }
    if (c.qError) {
      hasLayoutErrors = true;
      hasLayoutUnfulfilledCalculcationCondition = c.qError.qErrorCode === 7005;
      const title =
        // eslint-disable-next-line no-nested-ternary
        hasLayoutUnfulfilledCalculcationCondition && c.qCalcCondMsg
          ? c.qCalcCondMsg
          : hasLayoutUnfulfilledCalculcationCondition
          ? translator.get('Visualization.UnfulfilledCalculationCondition')
          : translator.get('Visualization.LayoutError');

      layoutErrors.push({ title, descriptions: [] });
    }
  }
  return {
    hasUnfulfilledErrors,
    aggMinD,
    aggMinM,
    hasLayoutErrors,
    layoutErrors,
  };
};

const validateTargets = async (translator, layout, { targets }, model) => {
  // Use a flattened requirements structure to combine all targets
  const { hasUnfulfilledErrors, aggMinD, aggMinM, hasLayoutErrors, layoutErrors } = validateCubes(
    translator,
    targets,
    layout
  );

  const reqDimErrors = [];
  const reqMeasErrors = [];
  let loopCacheProperties = null;

  for (let i = 0; i < targets.length; ++i) {
    const def = targets[i];
    if (!hasLayoutErrors && hasUnfulfilledErrors) {
      // eslint-disable-next-line no-await-in-loop
      const properties = loopCacheProperties || (await model.getProperties());
      loopCacheProperties = properties;
      const res = validateTarget(translator, layout, properties, def);
      reqDimErrors.push(...res.reqDimErrors);
      reqMeasErrors.push(...res.reqMeasErrors);
    }
  }
  const fulfilledDims = reqDimErrors.filter((e) => !(e.missing || e.error)).length;
  const reqDimErrorsTitle = translator.get('Visualization.Incomplete.Dimensions', [fulfilledDims, aggMinD]);
  const fulfilledMeas = reqMeasErrors.filter((e) => !(e.missing || e.error)).length;
  const reqMeasErrorsTitle = translator.get('Visualization.Incomplete.Measures', [fulfilledMeas, aggMinM]);
  const reqErrors = [
    { title: reqDimErrorsTitle, descriptions: [...reqDimErrors] },
    { title: reqMeasErrorsTitle, descriptions: [...reqMeasErrors] },
  ];

  const showError = hasLayoutErrors || hasUnfulfilledErrors;
  const data = hasLayoutErrors ? layoutErrors : reqErrors;
  const title = hasLayoutErrors ? layoutErrors[0].title : translator.get('Visualization.Incomplete');

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

const loadType = async ({ dispatch, types, visualization, version, model, app, selections, blurCallback, nebbie }) => {
  try {
    const snType = await getType({ types, name: visualization, version });
    const sn = snType.create({
      model,
      app,
      selections,
      nebbie,
      blurCallback,
    });
    return sn;
  } catch (err) {
    dispatch({ type: 'ERROR', error: { title: err.message } });
  }
  return undefined;
};

const Cell = forwardRef(
  ({ halo, model, initialSnOptions, initialSnPlugins, initialError, onMount, currentId }, ref) => {
    const { app, types } = halo;
    const { nebbie } = halo.public;

    const { translator, language, keyboardNavigation } = useContext(InstanceContext);
    const theme = useTheme();
    const [cellRef, cellRect, cellNode] = useRect();
    const [state, dispatch] = useReducer(contentReducer, initialState(initialError));
    const [layout, { validating, canCancel, canRetry }, longrunning] = useLayout(model);
    const [appLayout] = useAppLayout(app);
    const [contentRef, contentRect] = useRect();
    const [snOptions, setSnOptions] = useState(initialSnOptions);
    const [snPlugins, setSnPlugins] = useState(initialSnPlugins);
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

    const handleKeyDown = (e) => {
      // Enter or space
      if (['Enter', ' ', 'Spacebar'].includes(e.key)) {
        halo.root.toggleFocusOfCells(currentId);
      }
    };

    const relinquishFocus = (resetFocus) => {
      halo.root.toggleFocusOfCells();
      if (resetFocus && cellNode) {
        cellNode.focus();
      }
    };

    useEffect(() => {
      if (initialError || !appLayout || !layout) {
        return undefined;
      }
      const validate = async (sn) => {
        const [showError, error] = await validateTargets(translator, layout, sn.generator.qae.data, model);
        if (showError) {
          dispatch({ type: 'ERROR', error });
        } else {
          dispatch({ type: 'RENDER' });
        }
        handleModal({ sn: state.sn, layout, model });
      };
      const load = async (visualization, version) => {
        dispatch({ type: 'LOADING' });
        const sn = await loadType({
          dispatch,
          types,
          visualization,
          version,
          model,
          app,
          selections,
          nebbie,
          blurCallback: relinquishFocus,
        });
        if (sn) {
          dispatch({ type: 'LOADED', sn, visualization });
          onMount();
        }
        return undefined;
      };

      // Validate if it's still the same type
      if (state.visualization === layout.visualization && state.sn) {
        validate(state.sn);
        return undefined;
      }

      // Load supernova
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
      load(layout.visualization, withVersion);

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
        getQae() {
          return state.sn.generator.qae;
        },
        toggleFocus(active) {
          if (typeof state.sn.component.focus === 'function') {
            if (active) {
              state.sn.component.focus();
            } else {
              state.sn.component.blur();
            }
          }
        },
        setSnOptions,
        setSnPlugins,
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
          snPlugins={snPlugins}
          layout={layout}
          appLayout={appLayout}
        />
      );
    }

    return (
      <Paper
        style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
        tabIndex={keyboardNavigation ? 0 : -1}
        elevation={0}
        square
        className={CellElement.className}
        ref={cellRef}
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        onKeyDown={keyboardNavigation ? handleKeyDown : null}
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
  }
);
export default Cell;
