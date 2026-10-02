import { useState } from 'react';

export default function Counter({ title }) {
  const [count, setCount] = useState(0);
  return (
    <div className="react-chart">
      <h1 className="react-title">{title}</h1>
      <button type="button" className="react-button" onClick={() => setCount(count + 1)}>
        Clicked {count}
      </button>
    </div>
  );
}
