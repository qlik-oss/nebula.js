// https://github.com/ricsv/react-leonardo-ui/blob/master/src/icon/icon.js

import preact from 'preact';

import { luiClassName } from '../lui/util';

const Icon = ({
  className,
  name,
  size,
  ...extraProps
}) => {
  const finalClassName = luiClassName('icon', {
    className,
    modifiers: { name, size },
  });
  return (
    <span className={finalClassName} aria-hidden="true" {...extraProps} />
  );
};

export default Icon;
