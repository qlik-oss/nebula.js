const theme = {
  $grey100: '#fff',
  $grey98: 'fafafa',
  $grey95: 'f2f2f2',
  $grey90: '#e6e6e6',
  $grey25: '#404040',

  $alpha15: 'rgba(0, 0, 0, 0.15)',
  $alpha55: 'rgba(0, 0, 0, 0.55)',

  $green: '#6CB33F',

  $fontFamily: '"Source Sans Pro", Arial, sans-serif',
  $fontSize: '14px',
  $lineHeight: '16px',
};

const rxCap = /[A-Z]/g;
const rxAppend = /^&/;
const rxVar = /\$[A-z0-9]+/g;

const idGen = [[10, 31], [0, 31], [0, 31], [0, 31], [0, 31], [0, 31]];
function toChar([min, max]) {
  return (min + (Math.random() * (max - min) | 0)).toString(32);
}

function uid() {
  return idGen.map(toChar).join('');
}

function replaceVar(match) {
  return theme[match];
}

function parse(id, style, sheet) {
  const rule = [];
  const post = {};
  Object.keys(style).forEach((prop) => {
    if (rxAppend.test(prop)) {
      post[prop.slice(1)] = style[prop];
    } else {
      let value = style[prop];
      if (rxVar.test(style[prop])) {
        value = value.replace(rxVar, replaceVar);
      }
      rule.push(`${prop.replace(rxCap, '-$&').toLowerCase()}: ${value}`);
    }
  });
  Object.keys(post).forEach((key) => {
    parse(`${id}${key}`, post[key], sheet);
  });
}

function addRule(style, sheet) {
  const id = uid();
  parse(id, style, sheet);
  return [id];
}

function initiate() {
  let injectedSheet;
  if (typeof window !== 'undefined') {
    const el = document.createElement('style');
    el.setAttribute('data-id', 'nebula-ui');
    el.setAttribute('data-version', '0.1.0');
    injectedSheet = document.head.appendChild(el).sheet;
  }


  const cache = {};
  return function addStyle(s) {
    const styles = Array.isArray(s) ? s : [s];
    return styles.filter(Boolean).map((style) => {
      const key = JSON.stringify(style);
      if (cache[key]) {
        return cache[key].classes[0];
      }
      const classes = addRule(style, injectedSheet);
      cache[key] = {
        style,
        classes,
      };
      return classes[0];
    });
  };
}

const styled = initiate();

export default styled;
