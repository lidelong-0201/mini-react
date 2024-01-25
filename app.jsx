import React from './core/react';
let num = 0;
let props = { id: '11111' };
const Counter = () => {
  const handleClick = () => {
    console.log('click');
    num++;
    props = {};
    React.update();
  };
  return (
    <div {...props}>
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
