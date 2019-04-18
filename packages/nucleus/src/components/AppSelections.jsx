import preact from 'preact';

import SelectionsBack from '@nebula.js/ui/icons/SelectionsBack';
import SelectionsForward from '@nebula.js/ui/icons/SelectionsForward';
import ClearSelections from '@nebula.js/ui/icons/ClearSelections';
import Remove from '@nebula.js/ui/icons/Remove';
import Lock from '@nebula.js/ui/icons/Lock';

import ButtonInline from '@nebula.js/ui/components/ButtonInline';
import Toolbar from '@nebula.js/ui/components/Toolbar';
import Grid from '@nebula.js/ui/components/Grid';
import Text from '@nebula.js/ui/components/Text';

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
  collect(layout.qSelectionObject, fields);
  if (layout.alternateStates || layout.selectionsInStates) {
    layout.alternateStates.forEach(s => collect(s.qSelectionObject, fields, s.stateName));
  }
  return Object.keys(fields).map(key => fields[key]);
}

function OneState({
  field,
  api,
}) {
  const selection = field.selections[0];
  const counts = selection.qStateCounts;
  const green = (counts.qSelected + counts.qLocked) / selection.qTotal;
  const white = counts.qOption / selection.qTotal;
  const grey = counts.qAlternative / selection.qTotal;

  const numSelected = counts.qSelected + counts.qSelectedExcluded + counts.qLocked + counts.qLockedExcluded;
  let label = '&nbsp;'; // FIXME translate
  if (selection.qTotal === numSelected && selection.qTotal > 1) {
    label = 'All';
  } else if (numSelected > 1 && selection.qTotal) {
    label = `${numSelected} of ${selection.qTotal}`;
  } else {
    label = selection.qSelectedFieldSelectionInfo.map(v => v.qName).join(', ');
  }
  if (field.states[0] !== '$') {
    label = `${field.states[0]}: ${label}`;
  }
  return (
    <Grid
      spacing="small"
      style={{
        position: 'relative',
        width: '148px',
        justifyContent: 'space-between',
        background: '$grey100',
        borderRight: '1px solid $alpha15',
      }}
    >
      <Grid vertical spacing="small" style={{ alignItems: 'normal', overflow: 'hidden', opacity: selection.qLocked ? '0.3' : '' }}>
        <Text size="small" weight="semibold" nowrap>{selection.qField}</Text>
        <Text size="small" faded nowrap>{label}</Text>
      </Grid>
      {selection.qLocked ? (<Grid><Lock /></Grid>) : (
        <Grid spacing="none">
          <ButtonInline
            onClick={() => api.clearField(selection.qField, field.states[0])}
          >
            <Remove />
          </ButtonInline>
        </Grid>
      )}
      <Grid
        spacing="none"
        style={{
          height: '4px',
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '100%',
        }}
      >
        <div style={{ background: '#6CB33F', height: '100%', width: `${green * 100}%` }} />
        <div style={{ background: '#D8D8D8', height: '100%', width: `${white * 100}%` }} />
        <div style={{ background: '#B4B4B4', height: '100%', width: `${grey * 100}%` }} />
      </Grid>
    </Grid>
  );
}

function MultiState({
  field,
}) {
  return (
    <Grid
      spacing="small"
      style={{
        width: '148px',
        justifyContent: 'space-between',
        height: '48px',
        boxSizing: 'border-box',
        background: '$grey100',
        borderRight: '1px solid $alpha15',
      }}
      className="nebula-ui-cs-group"
    >
      <Grid vertical spacing="small" style={{ overflow: 'hidden' }}>
        <Text size="small" weight="semibold" nowrap>{field.name}</Text>
      </Grid>
    </Grid>
  );
}

export class AppSelections extends preact.Component {
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
          <Grid style={{ background: '$grey100', borderRight: '1px solid $alpha15' }}>
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
            {this.state.items.map(s => (s.states.length > 1 ? <MultiState field={s} /> : <OneState field={s} api={this.props.api} />))}
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
  const reference = preact.render(
    <AppSelections
      api={api}
    />,
    element,
  );

  const unmount = () => {
    preact.render('', element, reference);
  };

  return () => {
    unmount();
  };
}
