import supernova from '../../src/index';

describe('supernova', () => {
  it('should pass down resources', () => {
    let res;

    const mySn = {
      component: {
        created() {
          res = this.resources;
        },
      },
    };

    const generator = supernova(mySn, {
      translator: 't',
      flags: 'f',
      Promise: 'P',
    });

    const sn = generator.create({
      model: {},
      app: {},
    });

    sn.component.created();

    expect(res).to.eql({
      translator: 't',
      flags: 'f',
      Promise: 'P',
      PERMISSIONS: {
        PASSIVE: 1,
        INTERACT: 2,
        SELECT: 4,
        FETCH: 8,
      },
    });
  });
});
