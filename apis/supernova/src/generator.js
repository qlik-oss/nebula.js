import create from './creator';
import translator from './translator';
import qae from './qae';

/**
 * The entry point for defining a supernova.
 * @interface Supernova
 * @param {object=} env
 * @returns {SupernovaDefinition}
 * @example
 * import { useElement, useLayout } from '@nebula.js/supernova';
 *
 * export default function() {
 *   return {
 *     qae: {
 *       properties: {
 *         dude: 'Heisenberg',
 *       }
 *     },
 *     component() {
 *       const el = useElement();
 *       const layout = useLayout();
 *       el.innerHTML = `What's my name? ${layout.dude}!!!`;
 *     }
 *   };
 * }
 */

/**
 * @interface SupernovaDefinition
 * @property {QAEDefinition} qae
 * @property {function():void} component
 */

/**
 * @interface snGenerator
 * @param {Supernova} Sn
 * @param {env} env
 * @returns {generator}
 * @private
 */
export default function generatorFn(UserSN, env) {
  let sn;

  const localEnv = {
    translator,
    ...env,
  };

  if (typeof UserSN === 'function') {
    sn = UserSN(localEnv);
  } else {
    sn = UserSN;
  }

  /**
   * @alias generator
   * @private
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
