function isObject(v) {
  return v != null && !Array.isArray(v) && typeof v === 'object';
}

function isEqual(a, b) {
  if (isObject(a) && isObject(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }
  return a === b;
}
// eslint-disable-next-line default-param-last
export default function getPatches(path = '/', obj, old) {
  const patches = [];
  Object.keys(obj).forEach((prop) => {
    const v = obj[prop];
    if (typeof old[prop] === 'object' && typeof v === 'object' && !Array.isArray(v)) {
      patches.push(...getPatches(`${path}${prop}/`, obj[prop], old[prop]));
    } else if (!isEqual(v, old[prop])) {
      patches.push({
        qPath: path + prop,
        qOp: 'add',
        qValue: JSON.stringify(obj[prop]),
      });
    }
  });
  return patches;
}
