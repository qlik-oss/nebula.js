import translator from './translator';

const locale = ({ initial = 'en-US', fallback = 'en-US' } = {}) => {
  const t = translator({
    initial,
    fallback,
  });

  return {
    translator: t,
  };
};

export default locale;
