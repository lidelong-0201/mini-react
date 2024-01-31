import React from './core/react'
export default function App() {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    console.log('init')
  }, [])
  React.useEffect(() => {
    console.log(count)
  }, [count])

  return (
    <div>
      App
      <div>count:{count}</div>
      <button
        onClick={() => {
          setCount(count + 1)
        }}
      >
        count++
      </button>
    </div>
  )
}
