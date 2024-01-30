function createTextNode(nodeValue) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue,
      children: [],
    },
  }
}
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children?.map((child) => {
        const isTextNode = ['string', 'number'].includes(typeof child)
        return isTextNode ? createTextNode(child) : child
      }),
    },
  }
}
// work in progress 根据生命周期命名
let wipRoot = null
// 当前根节点
let currentRoot = null
// 指针指向
let nextWorkOfUnit = null

let wipFunctionFiber = null

// 需要删除的节点
let deletions = []
// 虚拟dom转换成真实dom
const render = (el, container) => {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  }
  nextWorkOfUnit = wipRoot
}

// 生成新树
const update = () => {
  let currentFiber = wipFunctionFiber
  return () => {
    wipRoot = {
      ...currentFiber,
      altemate: currentFiber,
    }
    nextWorkOfUnit = wipRoot
  }
}
// 每次更新处理function 会重制为【】
let stateHooks = []
let stateIndex = 0
const useState = (initVal) => {
  let currentFiber = wipFunctionFiber
  const oldHook = currentFiber.altemate?.stateHooks[stateIndex]
  const stateHook = {
    state: oldHook ? oldHook.state : initVal,
    // 任务队列 收集统一执行
    queue: oldHook ? oldHook.queue : [],
  }
  stateHooks.push(stateHook)
  stateIndex++
  currentFiber.stateHooks = stateHooks
  // 每次执行React。useState 统一执行action
  stateHook.queue.forEach((item) => {
    stateHook.state = item
  })
  const setState = (val) => {
    // 值相同不更新
    if (val === stateHook.state) return
    stateHook.queue.push(val)
    // stateHook.state = val
    wipRoot = {
      ...currentFiber,
      altemate: currentFiber,
    }
    nextWorkOfUnit = wipRoot
  }
  return [stateHook.state, setState]
}

const createDom = (fiber) => {
  return fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(fiber.type)
}

const updateProps = (newProps, preProps = {}, dom) => {
  // 老的有 新的没有
  Object.keys(preProps).forEach((key) => {
    // 取消绑定事件
    if (key.startsWith('on') && !(key in newProps)) {
      dom.removeEventListener(key.slice(2).toLocaleLowerCase(), preProps[key])
    }
    if (key !== 'children' && !(key in newProps)) {
      dom.removeAttribute(key)
    }
  })
  // 绑定新的
  Object.keys(newProps).forEach((key) => {
    // 绑定事件
    if (key.startsWith('on') && newProps[key] !== preProps[key]) {
      dom.removeEventListener(key.slice(2).toLocaleLowerCase(), preProps[key])
      dom.addEventListener(key.slice(2).toLocaleLowerCase(), newProps[key])
    } else if (key !== 'children' && newProps[key] !== preProps[key]) {
      dom[key] = newProps[key]
    }
  })
}

// 调和过程
const reconcileChildren = (fiber, children) => {
  let prevChild = null

  // 之前 以赋值 指向旧Fiber节点
  let oldFiberChild = fiber.altemate?.child

  children.forEach((child, index) => {
    const isSameType = child?.type === oldFiberChild?.type && !!child?.type

    let newFiber
    if (isSameType) {
      newFiber = {
        parent: fiber,
        props: child.props,
        type: child.type,
        sibling: null,
        dom: oldFiberChild.dom,
        child: null,
        altemate: oldFiberChild,
        effectTag: 'UPDATE', // 更新操作
      }
    } else {
      // fiber 可能为boolean
      if (child) {
        newFiber = {
          parent: fiber,
          props: child.props,
          type: child.type,
          sibling: null,
          dom: null,
          child: null,
          effectTag: 'PLACEMENT', // 新增操作
        }
      }
      if (oldFiberChild) {
        deletions.push(oldFiberChild)
      }
    }
    // 更新 旧Fiber节点
    oldFiberChild = oldFiberChild?.sibling

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber
    }
    if (newFiber) {
      prevChild = newFiber
    }
  })
}

const updateFunctionComponent = (fiber) => {
  stateHooks = []
  stateIndex = 0
  wipFunctionFiber = fiber
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

const updateHostComponent = (fiber) => {
  if (!fiber?.dom) {
    //1. 渲染dom  首次进入时可能会有dom // FunctionComp 不需要创建dom
    const dom = (fiber.dom = createDom(fiber))
    // 更换为统一提交
    // fiber.parent.dom.append(dom);
    //2.处理props
    updateProps(fiber.props, {}, dom)
  }

  //3. 构建指针
  const children = fiber.props.children

  reconcileChildren(fiber, children)
}

function perFormWorkOfUnit(fiber) {
  const isFunctionComp = typeof fiber.type === 'function'

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
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  //4.返回下一个执行Fiber
  if (fiber.child) {
    return fiber.child
  }
  //循环向上 寻找
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
  // return fiber.parent.sibling;
}

const getParent = (fiber) => {
  let parent = fiber.parent
  while (fiber) {
    if (!!parent?.dom) {
      return parent
    }
    parent = parent.parent
  }
}

// 提交流程
const commitWork = (fiber) => {
  if (!fiber) return

  // Function comp 时没有dom节点
  let parentFiber = getParent(fiber)

  if (fiber?.dom && fiber.effectTag === 'PLACEMENT') {
    parentFiber.dom.append(fiber?.dom)
  } else if (fiber.effectTag === 'UPDATE') {
    // 暂时只处理dom
    updateProps(fiber.props, fiber.altemate.props, fiber.dom)
  }

  if (fiber.child) {
    commitWork(fiber?.child)
  }

  if (fiber.sibling) {
    commitWork(fiber?.sibling)
  }
  if (fiber.parent.sibling) {
    commitWork(fiber?.parent?.sibling)
  }
}

const commitDeletion = () => {
  deletions.forEach((fiber) => {
    const isFunctionComp = typeof fiber.type === 'function'

    const parent = getParent(fiber)

    // 函数组件不存在dom
    parent.dom.removeChild(isFunctionComp ? fiber.child.dom : fiber.dom)
  })
}

// 统一提交
const commitRoot = () => {
  commitDeletion()
  commitWork(wipRoot.child)
  // 当前节点 构建新旧dom树用
  currentRoot = wipRoot
  wipRoot = null
  deletions = []
}

const workCallback = (deadLine) => {
  let shouldYield = false
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = perFormWorkOfUnit(nextWorkOfUnit)
    if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = null
    }
    shouldYield = deadLine.timeRemaining() < 1
  }
  // render 时条件满足不会执行多变
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot()
  }
  window.requestIdleCallback(workCallback)
}

window.requestIdleCallback(workCallback)

const React = {
  createTextNode,
  createElement,
  render,
  update,
  useState,
}
export default React
