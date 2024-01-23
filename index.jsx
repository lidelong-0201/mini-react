const workCallback = (deadLine) => {
  let shouldYield = false;
  while (!shouldYield) {
    // 渲染dom
    shouldYield = deadLine.timeRemaining() < 1;
  }
  window.requestIdleCallback(workCallback);
};
window.requestIdleCallback(workCallback);
