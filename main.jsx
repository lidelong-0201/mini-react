import React from './core/react'
import ReactDom from './core/reactDom'

import App from './app'

ReactDom.createRoot(document.querySelector('#root')).render(<App />)
