class Inject {
  constructor(options = {}) {
    this.options = options;
    this.stylesheets = options.stylesheets || [];
    this.scripts = options.scripts || [];
  }

  apply(compiler) {
    if (!this.scripts.length || !this.stylesheets.length) {
      return;
    }
    compiler.hooks.compilation.tap('Inject', compilation => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tap('Inject', htmlPluginData => {
        this.scripts.forEach(s => {
          htmlPluginData.head.unshift({
            tagName: 'script',
            closeTag: true,
            attributes: { type: 'text/javascript', src: s },
          });
        });
        this.stylesheets.forEach(s => {
          htmlPluginData.head.unshift({
            tagName: 'link',
            closeTag: true,
            attributes: { rel: 'stylesheet', type: 'text/css', href: s },
          });
        });
      });
    });
  }
}

module.exports = Inject;
