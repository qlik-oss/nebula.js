const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const {
  // MarkdownBlock,
  Container,
  GridBlock,
} = CompLibrary;

class Index extends React.Component {
  render() {
    // const { config: siteConfig, language = '' } = this.props;
    const { baseUrl, docsUrl } = this.props.config;

    const docUrl = (doc) => {
      const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
      return `${baseUrl}${docsPart}${doc}`;
    };

    const Block = (props) => (
      <Container padding={['bottom', 'top']} id={props.id} background={props.background}>
        <GridBlock align="center" contents={props.children} layout={props.layout} />
      </Container>
    );

    return (
      <div>
        <div className="mainContainer">
          <Block>
            {[
              {
                title: `[Getting Started](${docUrl('introduction')})`,
              },
            ]}
          </Block>
        </div>
      </div>
    );
  }
}

module.exports = Index;
