import create from './creator';
// import translator from './translator';
import qae from './qae';

/**
 * The entry point for defining a visualization.
 * @interface Visualization
 * @param {Galaxy} galaxy
 * @returns {VisualizationDefinition}
 * @example
 * import { useElement, useLayout } from '@nebula.js/stardust';
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
 * @interface VisualizationDefinition
 * @property {QAEDefinition} qae
 * @property {function():void} component
 */

/**
 * @interface snGenerator
 * @param {Visualization} Sn
 * @param {Galaxy} galaxy
 * @returns {generator}
 * @private
 */
export default function generatorFn(UserSN, galaxy) {
  let sn;

  // TODO validate galaxy API

  if (typeof UserSN === 'function') {
    sn = UserSN(galaxy);
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
      const ss = create(generator, params, galaxy);
      return ss;
    },
    definition: {},
  };

  Object.keys(sn).forEach((key) => {
    if (!generator[key]) {
      generator.definition[key] = sn[key];
    }
  });

  return generator;
}
