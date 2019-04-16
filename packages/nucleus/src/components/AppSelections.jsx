import preact from 'preact';

import Button from './Button';
import Icon from './Icon';

export class AppSelections extends preact.Component {
  constructor(props) {
    super(props);

    this.state = {
      forward: this.props.api.canGoForward(),
      back: this.props.api.canGoBack(),
      clear: this.props.api.canClear(),
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
      <div className="nebula-toolbar">
        <div className="nebula-selections-nav">
          <Button
            className="lui-fade-button"
            disabled={!this.state.back}
            onClick={this.onBack}
          >
            <Icon name="selections-back" />
          </Button>
          <Button
            className="lui-fade-button"
            disabled={!this.state.forward}
            onClick={this.onForward}
          >
            <Icon name="selections-forward" />
          </Button>
          <Button
            className="lui-fade-button"
            disabled={!this.state.clear}
            onClick={this.onClear}
          >
            <Icon name="clear-selections" />
          </Button>
        </div>
      </div>
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
