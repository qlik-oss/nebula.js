function fixtureServer() {
  const fixtures = {};

  return {
    getFixtures() {
      return fixtures;
    },
    getFixture(key) {
      return fixtures[key];
    },
    storeFixture(fixture) {
      if (!fixture.key) {
        throw new Error('Fixture has no "key"');
      }
      fixtures[fixture.key] = fixture;

      return fixture.key;
    },
  };
}

module.exports = fixtureServer();
