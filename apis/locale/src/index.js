import translator from './translator';

export default function locale({ initial = 'en-US', fallback = 'en-US' } = {}) {
  const t = translator({
    initial,
    fallback,
  });

  return {
    translator: t,
  };
}
