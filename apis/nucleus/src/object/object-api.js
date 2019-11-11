import { createObjectSelectionAPI } from '../selections';

const QRX = /^q[A-Z]/;
export default class ObjectAPI {
  constructor(model, context, viz) {
    this.context = context;
    this.model = model;
    this.viz = viz;

    this.currentObjectType = '__placeholder__';
    this.currentPropertyVersion = '';
    this.currentSupernovaVersion = '';

    this.state = {
      layout: null,
      sn: null,
      error: null,
      dataErrors: [],
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

  validateData(layout) {
    const dataErrors = Object.keys(layout)
      .filter(k => QRX.test(k))
      .filter(k => typeof layout[k].qError !== 'undefined')
      .map(k => layout[k].qError);
    if (dataErrors.length) {
      this.setState({
        dataErrors,
      });
    }
  }

  updateModal(layout) {
    const selections = this.state.sn ? this.state.sn.component.selections : null;
    if (selections && selections.id === this.model.id) {
      selections.setLayout(layout);
      if (layout.qSelectionInfo && layout.qSelectionInfo.qInSelections && !selections.isModal()) {
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

  setType(type, propertyVersion, snVersion) {
    this.currentObjectType = type;
    this.currentPropertyVersion = propertyVersion;
    this.currentSupernovaVersion = snVersion;
    if (!this.currentObjectType) {
      return this.context.config.env.Promise.resolve();
    }
    return this.context.nebbie.types
      .get({
        name: this.currentObjectType,
        version: this.currentSupernovaVersion,
      })
      .supernova()
      .then(SN => {
        // layout might have changed since we requested the new type,
        // make sure type in layout matches the requested one
        if (!this.state.layout || this.state.layout.visualization !== this.currentObjectType) {
          return this.context.config.env.Promise.resolve();
        }
        return this.setSupernova(SN);
      })
      .catch(e => {
        this.setState({
          error: {
            message: `${e.message}`,
          },
        });
      });
  }

  setLayout(layout) {
    this.updateModal(layout);
    this.validateData(layout);
    if (layout.visualization !== this.currentObjectType || layout.version !== this.currentPropertyVersion) {
      const v = this.context.nebbie.types.getSupportedVersion(layout.visualization, layout.version);
      if (!v) {
        this.setState({
          layout,
          error: {
            message: `Could not find a version of '${layout.visualization}' that supports current object version. Did you forget to register ${layout.visualization}?`,
          },
          sn: null,
        });
        return;
      }

      this.setState({
        layout,
        sn: null,
        error: null,
      });
      this.setType(layout.visualization, layout.version, v);
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
