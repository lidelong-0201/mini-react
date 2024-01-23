import React from './core/react';
import ReactDom from './core/reactDom';

const App = <div>123</div>;

ReactDom.createRoot(document.querySelector('#root')).render(App);
