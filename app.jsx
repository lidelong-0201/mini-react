import React from './core/react'
let count1 = 0
let count2 = 0
export default function App() {
  const Foo = () => {
    const update = React.update()

    console.log('foo')
    return (
      <div>
        <button
          onClick={() => {
            count1++
            update()
          }}
        >
          click
        </button>
      </div>
    )
  }
  const Foo1 = () => {
    const update = React.update()
    return (
      <div>
        <button
          onClick={() => {
            count1++
            update()
          }}
        >
          click
        </button>
      </div>
    )
  }
  const Bar = () => {
    const update = React.update()

    console.log('bar')
    return (
      <div>
        <button
          onClick={() => {
            count2++
            update()
          }}
        >
          click
        </button>
      </div>
    )
  }
  return (
    <div>
      App
      <Foo />
      <Foo1 />
      <Bar />
    </div>
  )
}
