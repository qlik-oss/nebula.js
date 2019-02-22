import preact from 'preact';

import { prefixer } from '../utils/utils';

import Requirements from './Requirements';
import CError from './Error';
import Header from './Header';
import Footer from './Footer';
import Supernova from './Supernova';
import Placeholder from './Placeholder';
import SelectionToolbar from './SelectionToolbar';

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
  componentDidCatch() {
    this.setState({
      error: {
        message: 'Failed to render',
      },
    });
  }

  render() {
    const {
      objectProps,
      userProps,
    } = this.props;

    const SN = (showRequirements(objectProps.sn, objectProps.layout) ? Requirements : Supernova);
    const Comp = !objectProps.sn ? Placeholder : SN;
    const err = objectProps.error || this.state.error;
    return (
      <div className={prefixer(['cell-wrapper'])}>
        {
          objectProps.sn
          && objectProps.layout.qSelectionInfo
          && objectProps.layout.qSelectionInfo.qInSelections
            && <SelectionToolbar sn={objectProps.sn} />
        }
        <div className={prefixer(['cell'])}>
          <Header layout={objectProps.layout} />
          <Content>
            {err
              ? (<CError {...err} />)
              : (
                <Comp
                  key={objectProps.layout.visualization}
                  sn={objectProps.sn}
                  snContext={userProps.context}
                  snOptions={userProps.options}
                  layout={objectProps.layout}
                />
              )
            }
          </Content>
          <Footer layout={objectProps.layout} />
        </div>
      </div>
    );
  }
}

export default Cell;
