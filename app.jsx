import React from './core/react'

export default function App() {
  const [count, setCount] = React.useState(0)
  const [count1, setCount1] = React.useState('0')
  return (
    <div>
      App
      <div>
        <div>count:{count}</div>
        <button
          onClick={() => {
            setCount(count + 1)
          }}
        >
          click
        </button>
      </div>
      <div>
        <div>count1:{count1}</div>
        <button
          onClick={() => {
            setCount1('0')
          }}
        >
          click
        </button>
      </div>
    </div>
  )
}
