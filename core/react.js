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
// 根节点
let root = null;
// 当前节点
let currentRoot = null;
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

// 生成新树
const update = () => {
  nextWorkOfUnit = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    // 指向旧Fiber节点
    altemate: currentRoot
  };
  root = nextWorkOfUnit;
};

const createDom = (fiber) => {
  return fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(fiber.type);
};

const updateProps = (newProps, preProps = {}, dom) => {
  // 老的有 新的没有
  Object.keys(preProps).forEach((key) => {
    // 取消绑定事件
    if (key.startsWith('on') && !(key in newProps)) {
      dom.removeEventListener(key.slice(2).toLocaleLowerCase(), preProps[key]);
    }
    if (key !== 'children' && !(key in newProps)) {
      dom.removeAttribute(key);
    }
  });
  // 绑定新的
  Object.keys(newProps).forEach((key) => {
    // 绑定事件
    if (key.startsWith('on') && newProps[key] !== preProps[key]) {
      dom.removeEventListener(key.slice(2).toLocaleLowerCase(), preProps[key]);
      dom.addEventListener(key.slice(2).toLocaleLowerCase(), newProps[key]);
    }
    if (key !== 'children' && newProps[key] !== preProps[key]) {
      dom[key] = newProps[key];
    }
  });
};

const initChild = (fiber, children) => {
  let prevChild = null;

  // 之前 以赋值 指向旧Fiber节点
  let oldFiberChild = fiber.altemate?.child;

  children.forEach((child, index) => {
    const isSameType = child.type === oldFiberChild?.type;
    let newFiber;
    if (isSameType) {
      newFiber = {
        parent: fiber,
        props: child.props,
        type: child.type,
        sibling: null,
        dom: oldFiberChild.dom,
        child: null,
        altemate: oldFiberChild,
        effectTag: 'UPDATE' // 更新操作
      };
    } else {
      newFiber = {
        parent: fiber,
        props: child.props,
        type: child.type,
        sibling: null,
        dom: null,
        child: null,
        altemate: oldFiberChild,
        effectTag: 'PLACEMENT' // 新增操作
      };
    }
    // 更新 旧Fiber节点
    oldFiberChild = oldFiberChild?.sibling;

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
    updateProps(fiber.props, {}, dom);
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
  if (fiber?.dom && fiber.effectTag === 'PLACEMENT') {
    parentFiber.dom.append(fiber?.dom);
  } else if (fiber.effectTag === 'UPDATE') {
    // 暂时只处理dom
    if (typeof fiber.type !== 'function') {
      updateProps(fiber.props, fiber.altemate.props, fiber.dom);
    }
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
    // 当前节点 构建新旧dom树用
    currentRoot = root;

    root = null;
  }
  window.requestIdleCallback(workCallback);
};

window.requestIdleCallback(workCallback);

const React = {
  createTextNode,
  createElement,
  render,
  update
};
export default React;
