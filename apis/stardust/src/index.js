/* eslint no-underscore-dangle: 0 */
import 'regenerator-runtime/runtime'; // Polyfill for using async/await
import embed, { __DO_NOT_USE__ as nucleus } from '@nebula.js/nucleus';
import { generator, hook } from '@nebula.js/supernova';
import theme from '@nebula.js/theme';
import locale from '@nebula.js/locale';
import conversion from '@nebula.js/conversion';
import EnigmaMocker from '@nebula.js/enigma-mocker';

// mashup api
export { embed, conversion, EnigmaMocker };

// component api
export {
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  useKeyboard,
  usePromise,
  useAction,
  useRect,
  useModel,
  useApp,
  useGlobal,
  useElement,
  useSelections,
  useTheme,
  useLayout,
  useStaleLayout,
  useAppLayout,
  useTranslator,
  useDeviceType,
  usePlugins,
  useConstraints,
  useOptions,
  useEmbed,
  useRenderState,
  onTakeSnapshot,
  onContextMenu,
} from '@nebula.js/supernova';

// component internals
const __DO_NOT_USE__ = { generator, hook, theme, locale, viz: nucleus.viz };
export { __DO_NOT_USE__ };
