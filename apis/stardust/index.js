if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/stardust');
} else {
  module.exports = require('./dist/stardust.dev');
}
