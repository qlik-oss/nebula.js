const path = require('path');
const fs = require('fs');
// this plugin will check if there is a corresponding .native file for the input file and output the contents of the native file
// This plugin should be loaded first.

module.exports = ({ reactNative }) => ({
  async load(id) {
    if (!reactNative) {
      return null;
    }
    if (id) {
      const parsed = path.parse(id);
      if (parsed) {
        if (parsed.name.length > 0) {
          const nativeTest = `${parsed.dir}/${parsed.name}.native${parsed.ext}`;
          try {
            if (fs.existsSync(nativeTest)) {
              return fs.readFileSync(nativeTest, { encoding: 'utf8', flag: 'r' });
            }
          } catch (err) {
            console.log('there was a problem reading the file', nativeTest, err);
          }
        }
      }
    }
    return null;
  },
});
