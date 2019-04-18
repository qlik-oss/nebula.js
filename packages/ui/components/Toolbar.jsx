import preact from 'preact';

import styled from './styled';

export default function Toolbar({
  children,
  style,
}) {
  const classes = styled([{
    background: '$grey90',
    color: '$grey25',
    height: '48px',
    boxShadow: '0 1px 0 $alpha15',
    fontFamily: '"Source Sans Pro", Arial, sans-serif',
  }, style]);

  return (
    <div
      className={classes.join(' ')}
    >
      {children}
    </div>
  );
}
