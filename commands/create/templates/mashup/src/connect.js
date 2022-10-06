import { AuthType } from '@qlik/sdk';
import Authenticator from './Authenticator';

async function connect({ connectionType, url, appId, ...rest }) {
  const AuthenticatorInstance = new Authenticator({
    url,
    appId,
  });

  switch (connectionType) {
    case AuthType.WebIntegration: {
      return AuthenticatorInstance.AuthenticateWithWebIntegrationId({
        ...rest,
      });
    }

    case AuthType.OAuth2: {
      return AuthenticatorInstance.AuthenticateWithOAuth({ ...rest });
    }

    default:
      throw new Error('Please Provide a `connectionType` to proceed!');
  }
}

export default connect;
