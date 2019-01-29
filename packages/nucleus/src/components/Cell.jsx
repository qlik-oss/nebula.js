import preact from 'preact';

import { prefixer } from '../utils';

import Requirements from './Requirements';
import CError from './Error';
import Header from './Header';
import Footer from './Footer';
import Supernova from './Supernova';
import Placeholder from './Placeholder';
import SelectionToolbar from './SelectionToolbar';

// import './Cell.scss';

import viz from '../viz';

const showRequirements = (sn, layout) => {
  if (!sn || !sn.definition || !sn.definition.qae || !layout || !layout.qHyperCube) {
    return false;
  }
  const def = sn.definition.qae.data.targets[0];
  if (!def) {
    return false;
  }
  const minD = def.dimensions.min();
  const minM = def.measures.min();
  return (layout.qHyperCube.qDimensionInfo.length < minD
    || layout.qHyperCube.qMeasureInfo.length < minM);
};

const Content = ({ children }) => (
  <div className={prefixer(['content'])}>
    <div className={prefixer(['content__body'])}>
      {children}
    </div>
  </div>
);

class Cell extends preact.Component {
  constructor(props) {
    super(props);
    this.state = {
      context: {
        ...props.visual.context,
      },
      options: {
        ...props.visual.options,
      },
      layout: {},
      sn: null,
    };

    this.contentRef = preact.createRef();

    let type = '__placeholder__';
    let version = '__placeholder__';

    const { Promise } = props.config.env;
    const { model, app } = props;

    const externalAPI = viz({
      app,
      model,
      cell: this,
    });

    this.unmount = () => {
      props.unmount();
    };

    this.takeSnapshot = () => {
      const rect = this.contentRef.current.base.children[0].getBoundingClientRect();
      if (this.state.sn) {
        const snapshot = {
          ...this.state.layout,
          snapshotData: {
            object: {
              size: {
                w: rect.width,
                h: rect.height,
              },
            },
          },
        };

        if (typeof this.state.sn.component.setSnapshotData === 'function') {
          return this.state.sn.component.setSnapshotData(snapshot);
        }
        return Promise.resolve(snapshot);
      }
      return Promise.reject();
    };

    const onDone = new Promise((resolve) => { // eslint-disable-line
      this.onDone = resolve;
    }).then(() => {
      this.props.prom(externalAPI);
    });

    const setType = (t, v) => {
      type = t;
      version = v;
      if (!type) {
        return;
      }
      props.nebbie.types.supernova(t, v).then((SN) => {
        const sn = SN.create({
          model,
          app: props.app,
        });
        sn.component.on('rendered', (...args) => {
          externalAPI.emit('rendered', ...args);
        });

        this.setState({
          sn,
          error: null,
        });
      }).catch((e) => {
        console.error(e);
        this.setState({
          error: {
            message: `${e.message}`,
          },
        });
      });
    };

    const onChanged = () => model.getLayout().then((layout) => {
      if (model.selections) {
        model.selections.setLayout(layout);
        if (layout.qSelectionInfo && layout.qSelectionInfo.qInSelections
            && !model.selections.isModal()) {
          model.selections.goModal('/qHyperCubeDef');
        }
        if (!layout.qSelectionInfo || !layout.qSelectionInfo.qInSelections) {
          if (model.selections.isModal()) {
            model.selections.noModal();
          }
        }
      }
      if (layout.visualization !== type || layout.version !== version) {
        setType(layout.visualization, layout.version);
        this.setState({
          layout,
          sn: null,
          error: null,
        });
      } else {
        this.setState({
          layout,
          error: null,
        });
      }
    });

    model.on('changed', onChanged);
    model.once('closed', () => {
      model.removeListener('changed', onChanged);
    });

    onChanged();

    this.cleanUp = () => {
      model.removeListener('changed', onChanged);
    };
  }

  // componentDidMount() {
  //   // console.log('mounted');
  // }

  // componentDidUpdate() {
  // }

  componentWillUnmount() {
    this.cleanUp();
  }

  componentDidCatch() {
    this.setState({
      error: {
        message: 'Failed to render',
      },
    });
  }

  render() {
    const s = this.state;
    const SN = (showRequirements(this.state.sn, this.state.layout) ? Requirements : Supernova);
    const Comp = !this.state.sn ? Placeholder : SN;
    return (
      <div className={prefixer(['cell-wrapper'])}>
        {
          this.state.sn
          && this.state.layout.qSelectionInfo
          && this.state.layout.qSelectionInfo.qInSelections
            && <SelectionToolbar model={this.props.model} sn={this.state.sn} />
        }
        <div className={prefixer(['cell'])}>
          <Header layout={s.layout} />
          <Content ref={this.contentRef}>
            {this.state.error
              ? (<CError {...this.state.error} />)
              : (
                <Comp
                  key={this.state.layout.visualization}
                  sn={this.state.sn}
                  snContext={this.state.context}
                  snOptions={this.state.options}
                  prom={this.onDone}
                  model={this.props.model}
                  layout={this.state.layout}
                />
              )
            }
          </Content>
          <Footer layout={s.layout} />
        </div>
      </div>
    );
  }
}

export default Cell;
