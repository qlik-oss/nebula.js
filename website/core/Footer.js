const React = require('react');

function Footer({ config, language }) {
  const { baseUrl, docsUrl, repoUrl, copyright } = config;
  const docUrl = doc => {
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  };

  // Is this needed? Delete later if not.
  // const pageUrl = doc => {
  //   return baseUrl + (language ? `${language}/` : '') + doc;
  // };

  const imgUrl = img => {
    return `${baseUrl}img/${img}`;
  };

  return (
    <footer className="nav-footer" id="footer">
      <section className="sitemap">
        <div />
        <div>
          <h5>Docs</h5>
          <a href={docUrl('introduction', language)}>Getting Started</a>
        </div>
        <div>
          <h5>Links</h5>
          <a href="http://qlikbranch-slack-invite.herokuapp.com/">
            <i className="fa fa-slack" />
            Slack
          </a>
          <a href={repoUrl}>
            <i className="fa fa-github" />
            GitHub
          </a>
        </div>
        <div />
      </section>
      <a href="https://github.com/qlik-oss/" rel="noopener noreferrer" target="_blank" className="qlikOpenSource">
        <img src={imgUrl('QlikLogo-White.png')} alt="Qlik Open Source" width="170" height="85" />
      </a>
      <section className="copyright">{copyright}</section>
    </footer>
  );
}

module.exports = Footer;
