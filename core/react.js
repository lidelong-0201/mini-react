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
        const isTextNode = ['string', 'number'].includes(typeof child);
        return isTextNode ? createTextNode(child) : child;
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
    // 绑定事件
    if (key.startsWith('on')) {
      dom.addEventListener(key.slice(2).toLocaleLowerCase(), props[key]);
    }
    if (key !== 'children') {
      dom[key] = props[key];
    }
  });
};

const initChild = (fiber, children) => {
  let prevChild = null;
  children.forEach((child, index) => {
    const newFiber = {
      parent: fiber,
      props: child.props,
      type: child.type,
      sibling: null,
      dom: null,
      child: null
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
};

const updateFunctionComponent = (fiber) => {
  const children = [fiber.type(fiber.props)];
  initChild(fiber, children);
};

const updateHostComponent = (fiber) => {
  if (!fiber?.dom) {
    //1. 渲染dom  首次进入时可能会有dom // FunctionComp 不需要创建dom
    const dom = (fiber.dom = createDom(fiber));
    // 更换为统一提交
    // fiber.parent.dom.append(dom);

    //2.处理props
    updateProps(fiber.props, dom);
  }

  //3. 构建指针
  const children = fiber.props.children;

  initChild(fiber, children);
};

function perFormWorkOfUnit(fiber) {
  const isFunctionComp = typeof fiber.type === 'function';

  /*   //1. 渲染dom  首次进入时可能会有dom // FunctionComp 不需要创建dom
  if (!fiber?.dom && !isFunctionComp) {
    const dom = (fiber.dom = createDom(fiber));
    // 更换为统一提交
    // fiber.parent.dom.append(dom);

    //2.处理props
    updateProps(fiber.props, dom);
  }
  //3. 构建指针
  const children = isFunctionComp
    ? [fiber.type(fiber.props)]
    : fiber.props.children;

  initChild(fiber, children); */

  // 重构逻辑
  if (isFunctionComp) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  //4.返回下一个执行Fiber
  if (fiber.child) {
    return fiber.child;
  }
  //循环向上 寻找
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  // return fiber.parent.sibling;
}

// 指针指向
let nextWorkOfUnit = null;

// 提交流程
const commitWork = (fiber) => {
  if (!fiber) return;

  // Function comp 时没有dom节点
  let parentFiber = fiber.parent.dom ? fiber.parent : fiber.parent.parent;
  if (fiber?.dom) {
    parentFiber.dom.append(fiber?.dom);
  }

  if (fiber.child) {
    commitWork(fiber?.child);
  }

  if (fiber.sibling) {
    commitWork(fiber?.sibling);
  }
  if (fiber.parent.sibling) {
    commitWork(fiber?.parent?.sibling);
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
