/* eslint no-param-reassign: 0 */
import createAppSelectionAPI from './app-selections';
import createObjectSelectionAPI from './object-selections';

// MIXINS
// const objectSelectionAPI = {
//   types: ['GenericObject'],
//   init(args) {
//     let selections = null;
//     Object.defineProperty(args.api, 'selections', {
//       get() {
//         selections = selections || createObjectSelectionAPI(args.api);
//         return selections;
//       },
//     });
//   },
// };

// const appSelectionAPI = {
//   types: ['Doc'],
//   init(args) {
//     let selections = null;
//     Object.defineProperty(args.api, 'selections', {
//       get() {
//         selections = selections || createAppSelectionAPI(args.api);
//         return selections;
//       },
//     });
//   },
// };

// const all = {
//   types: ['Doc', 'GenericObject'],
//   init({ api }) {
//     if (api.getAppLayout) {
//       api.session.app = api;
//     }
//     api.app = api.session.app;
//   },
// };

// export default [all, objectSelectionAPI, appSelectionAPI];

export { createObjectSelectionAPI, createAppSelectionAPI };
