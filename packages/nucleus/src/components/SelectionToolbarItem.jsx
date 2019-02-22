import preact from 'preact';

import Button from './Button';
import FadeButton from './FadeButton';
import Icon from './Icon';

export default class Item extends preact.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: props.item.active && props.item.active(),
      disabled: props.item.enabled && !props.item.enabled(),
    };
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      disabled: nextProps.item.enabled && !nextProps.item.enabled(),
    };
  }

  componentDidMount() {
    if (this.props.item.active && this.props.item.action && this.props.item.on) {
      this.onChange = () => {
        this.setState({
          active: this.props.item.active && this.props.item.active(),
          disabled: this.props.item.enabled && !this.props.item.enabled(),
        });
      };

      this.props.item.on('changed', this.onChange);
    }
  }

  componentWillUnmount() {
    if (this.onChange && this.props.item.removeListener) {
      this.props.item.removeListener('changed', this.onChange);
    }
    this.onChange = null;
  }

  render() {
    const props = this.props.item;
    const Btn = props.type === 'fade-button' || this.props.isCustom ? FadeButton : Button;
    return (
      <Btn
        onClick={() => props.action()}
        variant={props.variant}
        active={this.state.active}
        disabled={this.state.disabled}
      >
        {props.icon ? <Icon name={props.icon} /> : props.label}
      </Btn>
    );
  }
}
