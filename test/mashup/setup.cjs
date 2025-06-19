const server = require('./server.cjs');

module.exports = async () => {
  const s = await server();
  process.env.BASE_URL = s.url;
  // Optionally return a teardown function or data
  return async () => {
    if (s && s.close) await s.close();
  };
};
