import React from 'react';

const PopoverHeader = ({
  children,
}) => {
  const style = { padding: '8px' };
  return (
    <div style={style}>
      {children}
    </div>
  );
};

export default PopoverHeader;
