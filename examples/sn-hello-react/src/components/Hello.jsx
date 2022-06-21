import React from 'react';

import './style.css';

export default function Hello(props) {
  const { layout } = props;
  return (
    <div className="my-unique-class">
      Hello React
      {layout.title}
    </div>
  );
}
