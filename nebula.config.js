const config = {
  serve: {
    host: '',
    port: '',
    enigma: {
      schema: '',
      host: '',
      port: 9076,
      secure: false,
      authenticate: {
        jwt: {},
        cert: {},
      },
    },
  },
};

module.exports = config;
