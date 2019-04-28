import React from 'react';

export default function Grid({
  children,
  vertical,
  noSpacing,
  style,
}) {
  const classNames = [
    'nebula-grid',
    vertical ? 'vertical' : 'horizontal',
    noSpacing ? 'no-spacing' : '',
  ].join(' ');
  // const style = {};
  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  );
}
