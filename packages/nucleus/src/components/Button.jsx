// https://github.com/ricsv/react-leonardo-ui/blob/master/src/button/button.js

import preact from 'preact';

import { luiClassName } from '../lui/util';

export default class Button extends preact.Component {
  render() {
    const {
      children,
      className,
      variant,
      size,
      block,
      rounded,
      active,
      ...extraProps
    } = this.props;

    const finalClassName = luiClassName('button', {
      className,
      modifiers: {
        variant,
        size,
        block,
        rounded,
      },
      states: { active },
    });

    return (
      <button
        type="button"
        ref={(element) => { this.element = element; }}
        className={finalClassName}
        {...extraProps}
      >
        {children}
      </button>
    );
  }
}
