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
let root = null;
// 虚拟dom转换成真实dom
const render = (el, container) => {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  };
  root = nextWorkOfUnit;
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
    // 更换为统一提交
    // fiber.parent.dom.append(dom);

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

// 指针指向
let nextWorkOfUnit = null;

// 提交流程
const commitWork = (fiber) => {
  console.log('🙋 ~ commitWork ~ fiber:', fiber);
  if (!fiber) return;
  fiber.parent.dom.append(fiber?.dom);

  if (fiber.child) {
    commitWork(fiber?.child);
  }

  if (fiber.sibling) {
    commitWork(fiber?.sibling);
  }
  if (fiber.parent.sibling) {
    commitWork(fiber?.sibling);
  }
};
// 统一提交
const commitRoot = () => {
  commitWork(root.child);
};

const workCallback = (deadLine) => {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = perFormWorkOfUnit(nextWorkOfUnit);
    shouldYield = deadLine.timeRemaining() < 1;
  }
  // render 时条件满足不会执行多变
  if (!nextWorkOfUnit && root) {
    commitRoot();
    root = null;
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
