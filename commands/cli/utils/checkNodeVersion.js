function checkNodeVersion(pkg) {
  if (pkg.engines && pkg.engines.node) {
    const minVersion = pkg.engines.node.replace('>=', '');
    const [minMajor, minMinor, minPatch] = minVersion.split('.').map(Number);
    const currentVersion = process.versions.node;
    const [currentMajor, currentMinor, currentPatch] = currentVersion.split('.').map(Number);

    let validVersion = true;
    if (currentMajor < minMajor) {
      validVersion = false;
    } else if (currentMajor === minMajor) {
      if (currentMinor < minMinor) {
        validVersion = false;
      }
      if (currentMinor === minMinor && currentPatch < minPatch) {
        validVersion = false;
      }
    }

    if (!validVersion) {
      // eslint-disable-next-line no-console
      console.error(`${pkg.name} requires NodeJS >= ${minVersion}, but you are using NodeJS ${currentVersion}.`);
      process.exit(1);
    }
  }
}

module.exports = checkNodeVersion;
