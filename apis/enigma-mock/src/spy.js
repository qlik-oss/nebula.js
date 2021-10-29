const callStack = {};

function storeCall(name, args) {
  // console.log(name, args);
  if (Array.isArray(callStack[name])) {
    callStack[name].push(args);
  } else {
    callStack[name] = [args];
  }
}

function spy(obj) {
  const spyObj = { ...obj };
  Object.keys(obj).forEach((key) => {
    const orgFn = obj[key];
    if (typeof orgFn === 'function') {
      spyObj[key] = (...args) => {
        storeCall(key, args);
        return orgFn(...args);
      };
    }
  });

  return spyObj;
}

spy.getCall = (name, index = 0) => {
  const c = callStack[name];
  if (Array.isArray(c)) {
    return c[index];
  }
  return undefined;
};

spy.getCallCount = (name) => {
  const c = callStack[name];
  if (Array.isArray(c)) {
    return c.length;
  }
  return 0;
};

export default spy;
