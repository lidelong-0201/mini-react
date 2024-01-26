import React from './core/react'
let flag = false
export default function App() {
  const Foo = () => <div>Foo</div>
  const Bar = () => <p>Bar</p>
  return (
    <div>
      App
      <div> {flag ? <Foo /> : <Bar />}</div>
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
