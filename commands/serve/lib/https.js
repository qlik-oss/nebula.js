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
 * @returns {{ https: boolean, reason: string, keyPath: string, certPath: string }} `reason` tells why it is served as it is
 */
export const resolveHttps = ({ https, paths = getCertificatePaths(), exists = fs.existsSync } = {}) => {
  const { keyPath, certPath } = paths;
  const installed = exists(keyPath) && exists(certPath);

  if (https === true && !installed) {
    const missing = !exists(keyPath) ? `key cert at path ${keyPath}` : `cert at path ${certPath}`;
    throw new Error(`Failed to start using HTTPS. Missing ${missing}, install certificates or use --no-https`);
  }

  const dir = path.dirname(keyPath);
  let reason;
  if (https === true) {
    reason = 'asked for with the https option';
  } else if (https === false) {
    reason = 'turned off with the https option, as with --no-https';
  } else if (installed) {
    reason = `certificates found in ${dir}`;
  } else {
    reason = `no certificates in ${dir}, install them to serve over https`;
  }

  return { https: https ?? installed, reason, keyPath, certPath };
};
