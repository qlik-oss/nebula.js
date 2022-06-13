import { ClassNameGenerator } from '@nebula.js/ui/theme';

const NEBULA_VERSION_HASH = process.env.NEBULA_VERSION_HASH || '';
let counter = 0;

ClassNameGenerator.configure((componentName) => {
  if (process.env.NODE_ENV !== 'production') {
    return `njs-${counter++}-${componentName.replace('Mui', '')}`;
  }
  return `njs-${NEBULA_VERSION_HASH}-${componentName.replace('Mui', '')}`;
});
