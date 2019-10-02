import create from './creator';
import translator from './translator';
import qae from './qae';

/**
 * @typedef {SnDefinition|SnFn} Supernova
 */

/**
 * @interface SnDefinition
 * @property {object} qae
 * @property {SnComponent} component
 */

/**
 * @interface SnFn
 * @param {env} env
 * @returns {SnDefinition}
 */

/**
 * @interface snGenerator
 * @param {Supernova} Sn
 * @param {env} env
 * @returns {generator}
 */
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

  /**
   * @alias generator
   */
  const generator = /** @lends generator */ {
    /**
     * @type {QAE}
     */
    qae: qae(sn.qae),
    /**
     * @type {SnComponent}
     */
    component: sn.component || {},
    /**
     * @param {object} p
     * @param {EnigmaAppModel} p.app
     * @param {EnigmaObjectModel} p.model
     * @param {ObjectSelections} p.selections
     */
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
