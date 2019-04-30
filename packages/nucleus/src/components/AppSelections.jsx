import React from 'react';
import ReactDOM from 'react-dom';

import SelectionsBack from '@nebula.js/ui/icons/SelectionsBack';
import SelectionsForward from '@nebula.js/ui/icons/SelectionsForward';
import ClearSelections from '@nebula.js/ui/icons/ClearSelections';

import ButtonInline from '@nebula.js/ui/components/ButtonInline';
import Toolbar from '@nebula.js/ui/components/Toolbar';
import Grid from '@nebula.js/ui/components/Grid';
import Text from '@nebula.js/ui/components/Text';

import SelectedField from './SelectedField';

function collect(qSelectionObject, fields, state = '$') {
  qSelectionObject.qSelections.forEach((selection) => {
    const name = selection.qField;
    const field = fields[name] = fields[name] || { name, states: [], selections: [] }; // eslint-disable-line
    if (field.states.indexOf(state) === -1) {
      field.states.push(state);
      field.selections.push(selection);
    }
  });
}

function getItems(layout) {
  if (!layout) {
    return [];
  }
  const fields = {};
  if (layout.qSelectionObject) {
    collect(layout.qSelectionObject, fields);
  }
  if (layout.alternateStates) {
    layout.alternateStates.forEach(s => collect(s.qSelectionObject, fields, s.stateName));
  }
  return Object.keys(fields).map(key => fields[key]);
}

function MultiState({
  field,
}) {
  return (
    <Grid
      spacing="small"
      styled={{
        width: '148px',
        justifyContent: 'space-between',
        height: '48px',
        boxSizing: 'border-box',
        background: '$grey100',
        borderRight: '1px solid $alpha15',
      }}
    >
      <Grid vertical spacing="small" style={{ overflow: 'hidden' }}>
        <Text size="small" weight="semibold" nowrap>{field.name}</Text>
      </Grid>
    </Grid>
  );
}

export class AppSelections extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      forward: this.props.api.canGoForward(),
      back: this.props.api.canGoBack(),
      clear: this.props.api.canClear(),
      items: getItems(this.props.api.layout()),
    };

    this.onBack = () => {
      this.props.api.back();
    };

    this.onForward = () => {
      this.props.api.forward();
    };

    this.onClear = () => {
      this.props.api.clear();
    };

    this.apiChangeHandler = () => {
      this.setState({
        forward: this.props.api.canGoForward(),
        back: this.props.api.canGoBack(),
        clear: this.props.api.canClear(),
        items: getItems(this.props.api.layout()),
      });
    };
  }

  componentDidMount() {
    this.props.api.on('changed', this.apiChangeHandler);
  }

  componentWillUnmount() {
    this.props.api.removeListener('changed', this.apiChangeHandler);
  }

  render() {
    return (
      <Toolbar>
        <Grid spacing="none">
          <Grid styled={{ background: '$grey100', borderRight: '1px solid $alpha15' }}>
            <ButtonInline
              style={{ marginRight: '8px' }}
              disabled={!this.state.back}
              onClick={this.onBack}
            >
              <SelectionsBack />
            </ButtonInline>
            <ButtonInline
              style={{ marginRight: '8px' }}
              disabled={!this.state.forward}
              onClick={this.onForward}
            >
              <SelectionsForward />
            </ButtonInline>
            <ButtonInline
              disabled={!this.state.clear}
              onClick={this.onClear}
            >
              <ClearSelections />
            </ButtonInline>
          </Grid>
          <Grid spacing="none">
            {this.state.items.map(s => (s.states.length > 1 ? <MultiState field={s} /> : <SelectedField field={s} api={this.props.api} />))}
          </Grid>
        </Grid>
      </Toolbar>
    );
  }
}

export default function mount({
  element,
  api,
}) {
  ReactDOM.render(
    <AppSelections
      api={api}
    />,
    element,
  );

  const unmount = () => {
    ReactDOM.unmountComponentAtNode(element);
  };

  return () => {
    unmount();
  };
}
