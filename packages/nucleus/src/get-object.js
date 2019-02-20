import { createObjectSelectionAPI } from './selections';
import vizualizationAPI from './viz';

export function init(model, optional, context) {
  let state = {
    layout: null,
    sn: null,
    error: null,
  };

  const {
    nebbie,
    app,
    config,
  } = context;

  const viz = vizualizationAPI({
    model,
    config,
  });

  let currentObjectType = '__placeholder__';
  let currentObjectVersion = '';

  const setState = (s) => {
    state = {
      ...state,
      ...s,
    };

    if (s.error) {
      context.logger.error(s.error);
    }
    viz.setObjectProps(state);
  };

  const setType = (t, v) => {
    currentObjectType = t;
    currentObjectVersion = v;
    if (!currentObjectType) {
      return;
    }
    nebbie.types.supernova(currentObjectType, currentObjectVersion).then((SN) => {
      // layout might have changed since we requested the new type,
      // make sure type in layout matches the requested one
      if (!state.layout || state.layout.visualization !== currentObjectType) {
        return;
      }
      const sn = SN.create({
        model,
        app,
        selections: createObjectSelectionAPI(model, app),
      });
      setState({
        sn,
        error: null,
      });
    }).catch((e) => {
      setState({
        error: {
          message: `${e.message}`,
        },
      });
    });
  };

  const onChanged = () => model.getLayout().then((layout) => {
    const selections = state.sn ? state.sn.component.selections : null;
    if (selections && selections.id === model.id) {
      selections.setLayout(layout);
      if (layout.qSelectionInfo && layout.qSelectionInfo.qInSelections
          && !selections.isModal()) {
        selections.goModal('/qHyperCubeDef'); // TODO - use path from data targets
      }
      if (!layout.qSelectionInfo || !layout.qSelectionInfo.qInSelections) {
        if (selections.isModal()) {
          selections.noModal();
        }
      }
    }
    if (layout.visualization !== currentObjectType || layout.version !== currentObjectVersion) {
      setState({
        layout,
        sn: null,
        error: null,
      });
      setType(layout.visualization, layout.version);
    } else {
      setState({
        layout,
        error: null,
      });
    }
  });

  model.on('changed', onChanged);
  model.once('closed', () => {
    model.removeListener('changed', onChanged);
    viz.api.close();
    setState({
      layout: null,
      sn: null,
    });
  });

  onChanged();

  // this.cleanUp = () => {
  //   model.removeListener('changed', onChanged);
  // };

  if (optional.options) {
    viz.api.options(optional.options);
  }
  if (optional.context) {
    viz.api.context(optional.context);
  }
  if (optional.element) {
    viz.api.show(optional.element);
  }

  return viz.api;
}

export default function initiate(getCfg, optional, context) {
  return context.app.getObject(getCfg.id).then(model => init(model, optional, context));
}
