module.exports = async (...args) => {
  const { default: serve } = await import('./serve.js');
  return serve(...args);
};
