function createTextNode(nodeValue) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue,
      children: []
    }
  };
}
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children?.map((child) => {
        return typeof child === 'string' ? createTextNode(child) : child;
      })
    }
  };
}
// 虚拟dom转换成真实dom
const render = (el, container) => {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  };
};

const createDom = (fiber) => {
  return fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(fiber.type);
};

const updateProps = (props, dom) => {
  Object.keys(props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = props[key];
    }
  });
};

const initChild = (fiber) => {
  const children = fiber.props.children;

  let prevChild = null;
  children.forEach((child, index) => {
    const newWork = {
      parent: fiber,
      props: child.props,
      type: child.type,
      sibling: null,
      dom: null,
      child: null
    };
    if (index === 0) {
      fiber.child = newWork;
    } else {
      prevChild.sibling = newWork;
    }
    prevChild = newWork;
  });
};

function perFormWorkOfUnit(fiber) {
  //1. 渲染dom  首次进入时可能会有dom
  if (!fiber?.dom) {
    const dom = (fiber.dom = createDom(fiber));
    fiber.parent.dom.append(dom);

    //2.处理props
    updateProps(fiber.props, dom);
  }

  //3. 构建指针
  initChild(fiber);

  //4.返回下一个执行Fiber
  if (fiber.child) {
    return fiber.child;
  }
  if (fiber.sibling) {
    return fiber.sibling;
  }
  return fiber.parent.sibling;
}
let nextWorkOfUnit = null;
const workCallback = (deadLine) => {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = perFormWorkOfUnit(nextWorkOfUnit);
    shouldYield = deadLine.timeRemaining() < 1;
  }
  window.requestIdleCallback(workCallback);
};

window.requestIdleCallback(workCallback);

const React = {
  createTextNode,
  createElement,
  render
};
export default React;
