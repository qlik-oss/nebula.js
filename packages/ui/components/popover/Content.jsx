import React, { useState, useRef, useEffect } from 'react';

import { oppositeDock, positionToElement } from 'react-leonardo-ui/src/positioner';

import styled from '../styled';

const classes = styled({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '2px',
  margin: 'auto',
  minWidth: '250px',
  border: '1px solid transparent',
  zIndex: '1021',
  backgroundColor: '$grey100',
  borderColor: '$alpha15',
  boxShadow: '0 1px 2px $alpha03',
});

const [arrowC] = styled({
  position: 'absolute',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: 0,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: 0,
  },
});

const [arrowTop] = styled({
  position: 'absolute',
  top: 0,
  '&::before': {
    left: '-8px',
    bottom: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: '8px solid $alpha15',
  },
  '&::after': {
    left: '-8px',
    bottom: '-1px',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: '8px solid $grey100',
  },
});

const [arrowBottom] = styled({
  position: 'absolute',
  bottom: 0,
  '&::before': {
    left: '-8px',
    top: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '8px solid $alpha15',
  },
  '&::after': {
    left: '-8px',
    top: '-1px',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '8px solid $grey100',
  },
});

const [arrowLeft] = styled({
  position: 'absolute',
  left: 0,
  top: '50%',
  '&::before': {
    top: '-8px',
    right: 0,
    borderRight: '8px solid $alpha15',
    borderTop: '8px solid transparent',
    borderBottom: '8px solid transparent',
  },
  '&::after': {
    top: '-8px',
    right: '-1px',
    borderRight: '8px solid $grey100',
    borderTop: '8px solid transparent',
    borderBottom: '8px solid transparent',
  },
});

const [arrowRight] = styled({
  position: 'absolute',
  left: 0,
  top: '50%',
  '&::before': {
    top: '-8px',
    left: 0,
    borderLeft: '8px solid $alpha15',
    borderTop: '8px solid transparent',
    borderBottom: '8px solid transparent',
  },
  '&::after': {
    top: '-8px',
    left: '-1px',
    borderLeft: '8px solid $grey100',
    borderTop: '8px solid transparent',
    borderBottom: '8px solid transparent',
  },
});

const arrows = {
  left: arrowLeft,
  right: arrowRight,
  top: arrowTop,
  bottom: arrowBottom,
};

export default function PopoverContent({
  children,
  alignTo,
}) {
  const [p, setP] = useState(null);
  const ref = useRef(null);

  const style = {
    visibility: p ? 'visible' : 'hidden',
    position: 'absolute',
    maxWidth: '500px',
    top: p ? `${p.position.top}px` : '-99999px',
    left: p ? `${p.position.left}px` : '-99999px',
  };

  useEffect(() => {
    const pp = positionToElement(ref.current, alignTo, 'right', {
      dock: 'right',
      offset: 8,
      minWindowOffset: 10,
      minEdgeOffset: 5,
    });
    setP(pp);
  }, [alignTo]);

  const arrow = {
    dock: '',
    style: {},
  };
  if (p) {
    arrow.dock = oppositeDock(p.dock);
    if (arrow.dock === 'top' || arrow.dock === 'bottom') {
      arrow.style.left = `${p.toPosition.left - p.position.left}px`;
    } else {
      arrow.style.top = `${p.toPosition.top - p.position.top}px`;
    }
  }
  const arrowElem = (
    <div
      className={[arrowC, arrows[arrow.dock]].join(' ')}
      style={arrow.style}
    />
  );
  return (
    <div
      className={classes.join(' ')}
      ref={ref}
      role="dialog"
      style={style}
    >
      {children}
      {arrowElem}
    </div>
  );
}
