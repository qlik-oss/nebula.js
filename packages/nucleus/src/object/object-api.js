import { createObjectSelectionAPI } from '../selections';

export default class ObjectAPI {
  constructor(model, context, viz) {
    this.context = context;
    this.model = model;
    this.viz = viz;

    this.currentObjectType = '__placeholder__';
    this.currentObjectVersion = '';

    this.state = {
      layout: null,
      sn: null,
      error: null,
    };
  }

  getPublicAPI() {
    return this.viz.api;
  }

  setState(s) {
    this.state = {
      ...this.state,
      ...s,
    };

    if (s.error) {
      this.context.logger.error(s.error);
    }
    this.viz.setObjectProps(this.state);
  }

  updateModal(layout) {
    const selections = this.state.sn ? this.state.sn.component.selections : null;
    if (selections && selections.id === this.model.id) {
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
  }

  setSupernova(SN) {
    const sn = SN.create({
      model: this.model,
      app: this.context.app,
      selections: createObjectSelectionAPI(this.model, this.context.app),
    });
    this.setState({
      sn,
      error: null,
    });
  }

  setType(type, version) {
    this.currentObjectType = type;
    this.currentObjectVersion = version;
    if (!this.currentObjectType) {
      return this.context.config.env.Promise.resolve();
    }
    return this.context.nebbie.types.supernova(this.currentObjectType, this.currentObjectVersion).then((SN) => {
      // layout might have changed since we requested the new type,
      // make sure type in layout matches the requested one
      if (!this.state.layout || this.state.layout.visualization !== this.currentObjectType) {
        return this.context.config.env.Promise.resolve();
      }
      return this.setSupernova(SN);
    }).catch((e) => {
      this.setState({
        error: {
          message: `${e.message}`,
        },
      });
    });
  }

  setLayout(layout) {
    this.updateModal(layout);
    if (layout.visualization !== this.currentObjectType || layout.version !== this.currentObjectVersion) {
      this.setState({
        layout,
        sn: null,
        error: null,
      });
      this.setType(layout.visualization, layout.version);
    } else {
      this.setState({
        layout,
        error: null,
      });
    }
  }

  close() {
    this.viz.api.close();
    this.setState({
      layout: null,
      sn: null,
    });
  }
}
