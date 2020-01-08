if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/theme.js');
} else {
  module.exports = require('./dist/theme.dev.js');
}
