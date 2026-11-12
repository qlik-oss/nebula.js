import fs from 'fs';
import path from 'path';
import { homedir } from 'os';

export const getCertificatePaths = (home = homedir()) => ({
  keyPath: path.join(home, '.certs/key.pem'),
  certPath: path.join(home, '.certs/cert.pem'),
});

/**
 * Serve over https when asked for and over http when asked not to. When it is not asked for either way, https is used
 * if the certificates are installed, as they are on a development machine, and http is used if they are not, as on a CI
 * runner.
 * @param {object} options
 * @param {boolean} [options.https] `--https` or `--no-https`
 * @returns {{ https: boolean, auto: boolean, keyPath: string, certPath: string }}
 */
export const resolveHttps = ({ https, paths = getCertificatePaths(), exists = fs.existsSync } = {}) => {
  const { keyPath, certPath } = paths;
  const installed = exists(keyPath) && exists(certPath);

  if (https === true && !installed) {
    const missing = !exists(keyPath) ? `key cert at path ${keyPath}` : `cert at path ${certPath}`;
    throw new Error(`Failed to start using HTTPS. Missing ${missing}, install certificates or use --no-https`);
  }

  return { https: https ?? installed, auto: https === undefined, keyPath, certPath };
};
