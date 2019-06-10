const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const { baseUrl, docsUrl } = this.props.config;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const { baseUrl } = this.props.config;
    return baseUrl + (language ? `${language}/` : '') + doc;
  }

  imgUrl(img) {
    const { baseUrl } = this.props.config;
    return `${baseUrl}img/${img}`;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <div />
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('introduction.html', this.props.language)}>
              Getting Started
            </a>
          </div>
          <div>
            <h5>Links</h5>
            <a href="http://qlikbranch-slack-invite.herokuapp.com/">
              <i className="fa fa-slack" />
              Slack
            </a>
            <a href={this.props.config.repoUrl}>
              <i className="fa fa-github" />
              GitHub
            </a>
          </div>
          <div />
        </section>
        <a
          href="https://github.com/qlik-oss/"
          rel="noopener noreferrer"
          target="_blank"
          className="qlikOpenSource"
        >
          <img
            src={this.imgUrl('QlikLogo-White.png')}
            alt="Qlik Open Source"
            width="170"
            height="85"
          />
        </a>
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    );
  }
}

module.exports = Footer;
