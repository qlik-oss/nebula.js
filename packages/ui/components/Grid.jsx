import React from 'react';

import themes from '../theme';

export default function Grid({
  children,
  vertical,
  spacing,
  style,
  styled,
  className = '',
  theme = themes('light'),
  ...props
}) {
  let space = '8px';
  if (spacing === 'none') {
    space = '0px';
  } else if (spacing === 'small') {
    space = '4px';
  }
  const inlineStyle = {
    padding: space,
    display: 'flex',
    flexDirection: vertical ? 'column' : '',
    alignItems: vertical ? '' : 'center',
  };
  const classes = theme.style([inlineStyle, styled, { boxSizing: 'border-box' }]);
  return (
    <div
      className={[className, classes].join(' ')}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

Grid.Item = function GridItem({
  children,
  style,
  theme = themes('light'),
}) {
  const className = theme.style([{
    flex: '1 0 auto',
  }, style]);

  return (
    <div className={className}>
      {children}
    </div>
  );
};
