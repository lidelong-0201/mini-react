import React from './react';
const reactDOm = {
  createRoot: (container) => {
    return {
      render: (vDom) => {
        React.render(vDom, container);
      }
    };
  }
};
export default reactDOm;
