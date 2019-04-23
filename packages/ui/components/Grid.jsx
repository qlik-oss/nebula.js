import React from 'react';

import styled from './styled';

export default function Grid({
  children,
  vertical,
  spacing,
  style,
  ...props
}) {
  // const classNames = [
  //   'nebula-ui-grid',
  //   vertical ? 'vertical' : 'horizontal',
  //   noSpacing ? 'no-spacing' : '',
  // ].join(' ');
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
  const classes = styled([inlineStyle, style, { boxSizing: 'border-box' }]);
  return (
    <div
      className={classes.join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

Grid.Item = function GridItem({
  children,
  style,
}) {
  const classes = styled([{
    flex: '1 0 auto',
  }, style]);

  return (
    <div className={classes.join(' ')}>
      {children}
    </div>
  );
};
