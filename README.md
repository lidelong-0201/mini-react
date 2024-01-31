# miniReact-demo

miniReact-demo 是一个简化版的 React 库，用于构建用户界面。

## Installation

使用 git clone 此项目体验:

```
git clone https://github.com/lidelong-0201/mini-react.git
```

## Usage

在你的项目中导入 miniReact:

```javascript
import React from 'core/react.js'
```

### createTextNode(nodeValue)

创建一个文本节点。

### createElement(type, props, ...children)

创建一个 React 元素。

- `type`: 元素类型，可以是 HTML 标签名或自定义组件。
- `props`: 元素的属性对象。
- `children`: 子元素。

### render(el, container)

将一个 React 元素渲染到指定的容器中。

- `el`: 要渲染的 React 元素。
- `container`: 容器元素。

### update()

生成一个更新函数，用于更新组件。

### useState(initVal)

创建一个状态钩子。

- `initVal`: 初始状态值。

返回一个包含当前状态和设置状态的函数的数组。

### useEffect(callback, deps)

创建一个副作用钩子。

- `callback`: 副作用函数。
- `deps`: 依赖数组。

### Example

```javascript
import React from 'miniReact'

function App() {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    console.log('Component mounted')
  }, [])

  React.useEffect(() => {
    console.log('deps:count:', count)
  }, [count])

  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  )
}
React.render(<App />, document.getElementById('root'))
```

---

# miniReactDOM

### createRoot(container)

创建一个根对象，用于渲染 React 元素到指定的容器。

- `container`: 容器元素。

返回一个包含`render`方法的根对象。

### render(vDom)

将一个 React 元素渲染到指定的容器中。

- `vDom`: 要渲染的 React 元素。

### Example

```javascript
import React from 'miniReact'
import ReactDOM from 'miniReactDOM'

const root = ReactDOM.createRoot(document.getElementById('root'))

function App() {
  return (
    <div>
      <h1>Hello, world!</h1>
    </div>
  )
}

root.render(<App />)
```
