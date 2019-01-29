// https://github.com/ricsv/react-leonardo-ui/blob/master/src/fade-button/fade-button.js

import preact from 'preact';

import { luiClassName } from '../lui/util';

const FadeButton = ({
  className,
  children,
  variant,
  size,
  block,
  rounded,
  active,
  ...extraProps
}) => {
  const finalClassName = luiClassName('fade-button', {
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
      className={finalClassName}
      {
        ...extraProps
      }
    >
      {children}
    </button>
  );
};

export default FadeButton;
