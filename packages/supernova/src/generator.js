import create from './creator';
import translator from './translator';
import qae from './qae';

export default function generatorFn(UserSN, env) {
  let sn;

  const localEnv = {
    translator,
    Promise,
    ...env,
  };

  if (typeof UserSN === 'function') {
    sn = UserSN(localEnv);
  } else {
    sn = UserSN;
  }

  const generator = {
    qae: qae(sn.qae),
    component: sn.component || {},
    create(params) {
      const ss = create(generator, params, localEnv);
      return ss;
    },
    definition: {},
  };

  Object.keys(sn).forEach(key => {
    if (!generator[key]) {
      generator.definition[key] = sn[key];
    }
  });

  return generator;
}
