import resolver from './resolver';

const rxAppend = /^&/;
const rxCap = /[A-Z]/g;
const idGen = [[10, 31], [0, 31], [0, 31], [0, 31], [0, 31], [0, 31]];
function toChar([min, max]) {
  return (min + (Math.random() * (max - min) | 0)).toString(32);
}

function uid() {
  return idGen.map(toChar).join('');
}

function parse(id, style, sheet, r) {
  const rule = [];
  const post = {};
  Object.keys(style).forEach((prop) => {
    if (rxAppend.test(prop)) {
      post[prop.slice(1)] = style[prop];
    } else {
      const value = r.get(style[prop]);
      rule.push(`${prop.replace(rxCap, '-$&').toLowerCase()}: ${value}`);
    }
  });
  sheet.insertRule(`.${id} { ${rule.join(';')} }`, sheet.cssRules.length);
  Object.keys(post).forEach((key) => {
    parse(`${id}${key}`, post[key], sheet, r);
  });
}

const theme = (definition) => {
  const res = resolver(definition);

  let injectedSheet;
  if (typeof window !== 'undefined') {
    const el = document.createElement('style');
    el.setAttribute('data-id', 'nebula-ui');
    el.setAttribute('data-version', '0.1.0');
    injectedSheet = document.head.appendChild(el).sheet;
  }

  const cache = {};

  return {
    style(s) {
      const styles = Array.isArray(s) ? s : [s];
      return styles.filter(Boolean).map((style) => {
        const key = JSON.stringify(style);
        if (cache[key]) {
          return cache[key].className;
        }
        const className = uid();
        parse(className, style, injectedSheet, res);
        cache[key] = {
          style,
          className,
        };
        return className;
      }).join(' ');
    },
    clear() {

    },
  };
};

export default theme;
