import React from './core/react';

const Counter = ({ num }) => {
  const handleClick = () => {
    console.log('click');
  };
  return (
    <div>
      count: {num}
      <button onClick={handleClick}>click</button>
    </div>
  );
};

export default function App() {
  return (
    <div>
      App
      <Counter num={123} />
    </div>
  );
}
