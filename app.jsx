import React from './core/react'
let flag = false
export default function App() {
  const Foo = () => (
    <div>
      Foo
      <div>child1</div>
      <div>child2</div>
    </div>
  )
  const Bar = () => <p>Bar</p>
  return (
    <div>
      App
      {/* <div> {flag ? <Foo /> : <Bar />}</div> */}
      {flag && <Foo />}
      <button
        onClick={() => {
          console.log('click')
          flag = !flag
          React.update()
        }}
      >
        click
      </button>
    </div>
  )
}
