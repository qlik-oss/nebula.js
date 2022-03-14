import extend from 'extend';
import generateScales from './theme-scale-generator';

/**
 * Creates the following array of paths
 * object.barChart - legend.title - fontSize
 * object - legend.title - fontSize
 * legend.title - fontSize
 * object.barChart - legend - fontSize
 * object - legend - fontSize
 * legend - fontSize
 * object.barChart - fontSize
 * object - fontSize
 * fontSize
 * @ignore
 */
function constructPaths(pathSteps, baseSteps) {
  const ret = [];
  let localBaseSteps;
  let baseLength;
  if (pathSteps) {
    let pathLength = pathSteps.length;
    while (pathLength >= 0) {
      localBaseSteps = baseSteps.slice();
      baseLength = localBaseSteps.length;
      while (baseLength >= 0) {
        ret.push(localBaseSteps.concat(pathSteps));
        localBaseSteps.pop();
        baseLength--;
      }
      pathSteps.pop();
      pathLength--;
    }
  } else {
    localBaseSteps = baseSteps.slice();
    baseLength = localBaseSteps.length;
    while (baseLength >= 0) {
      ret.push(localBaseSteps.concat());
      localBaseSteps.pop();
      baseLength--;
    }
  }
  return ret;
}

function getObject(root, steps) {
  let obj = root;
  for (let i = 0; i < steps.length; i++) {
    if (obj[steps[i]]) {
      obj = obj[steps[i]];
    } else {
      return null;
    }
  }
  return obj;
}

function searchPathArray(pathArray, attribute, theme) {
  const attributeArray = attribute.split('.');
  for (let i = 0; i < pathArray.length; i++) {
    const target = getObject(theme, pathArray[i]);
    if (target !== null) {
      if (attributeArray.length === 1 && target[attribute]) {
        return target[attribute];
      }
      if (attributeArray.length > 1) {
        return getObject(target, attributeArray);
      }
    }
  }

  return undefined;
}

function searchValue(path, attribute, baseSteps, component) {
  let pathArray;
  if (path === '') {
    pathArray = constructPaths(null, baseSteps);
  } else {
    const steps = path.split('.');
    pathArray = constructPaths(steps, baseSteps);
  }
  return searchPathArray(pathArray, attribute, component);
}

export default function styleResolver(basePath, themeJSON) {
  const basePathSteps = basePath.split('.');

  const api = {
    /**
     *
     * Get the value of a style attribute, starting in the given base path + path
     * Ex: Base path: "object.barChart", Path: "legend.title", Attribute: "fontSize"
     * Will search in, and fall back to:
     * object.barChart - legend.title - fontSize
     * object - legend.title - fontSize
     * legend.title - fontSize
     * object.barChart - legend - fontSize
     * object - legend - fontSize
     * legend - fontSize
     * object.barChart - fontSize
     * object - fontSize
     * fontSize
     * When attributes separated by dots is provided, they are required in the theme JSON file
     * Ex. Base path: "object" , Path: "legend", ", Attribute: "title.fontSize"
     * title: {fontSize: ...} must be matched and the rest is the same as above
     * If you want a exact match, you can use `getStyle('object', '', 'legend.title.fontSize');`
     * @ignore
     *
     * @param {string} component String of properties separated by dots to search in
     * @param {string} attribute Name of the style attribute
     * @returns {string|undefined} The style value of the resolved path, undefined if not found
     */
    getStyle(component, attribute) {
      // TODO - object overrides
      // TODO - feature flag on font-family?
      // TODO - caching
      const baseSteps = basePathSteps.concat();
      const result = searchValue(component, attribute, baseSteps, themeJSON);

      // TODO - support functions
      return result;
    },
  };

  return api;
}

/**
 * Iterate the object tree and resolve variables and functions.
 * @ignore
 * @param {Object} - objTree
 * @param {Object} - variables
 */
function resolveVariables(objTree, variables) {
  Object.keys(objTree).forEach((key) => {
    if (typeof objTree[key] === 'object' && objTree[key] !== null) {
      resolveVariables(objTree[key], variables);
    } else if (typeof objTree[key] === 'string' && objTree[key].charAt(0) === '@') {
      // Resolve variables
      objTree[key] = variables[objTree[key]]; // eslint-disable-line no-param-reassign
    }
  });
}

styleResolver.resolveRawTheme = (raw) => {
  // TODO - validate format
  const c = extend(true, {}, raw);
  resolveVariables(c, c._variables); // eslint-disable-line

  // generate class-pyramid
  if (c.scales) {
    generateScales(c.scales, c.dataColors && c.dataColors.nullColor);
  }

  return c;
};
