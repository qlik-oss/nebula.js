import permissions from '../permissions';

const MODES = {
  static: {
    interactionState: 0,
  },
  analyis: {
    interactionState: 1,
  },
  edit: {
    interactionState: 2,
  },
  editstory: {
    interactionState: 1,
    // navigation: false,
    tooltips: false,
    selections: false,
    limitedInteraction: false,
  },
  playstory: {
    interactionState: 1,
    // navigation: false,
    tooltips: true,
    selections: false,
    limitedInteraction: true,
  },
};

describe('permissions', () => {
  describe('with live engine', () => {
    it('in STATIC mode should only allow model SELECT and FETCH', () => {
      expect(
        permissions(
          {
            interactionState: 0,
          },
          {}
        )
      ).to.eql(['select', 'fetch']);
    });

    it('in ANALYSIS mode should allow everything', () => {
      expect(
        permissions(
          {
            interactionState: 1,
          },
          {}
        )
      ).to.eql(['passive', 'interact', 'select', 'fetch']);
    });

    it('in EDIT mode should only allow model SELECT and FETCH', () => {
      expect(
        permissions(
          {
            interactionState: 2,
          },
          {}
        )
      ).to.eql(['select', 'fetch']);
    });

    it('in ANALYSIS mode with tooltips and selections off, should only allow FETCH', () => {
      expect(
        permissions(
          {
            interactionState: 1,
            tooltips: false,
            selections: false,
          },
          {}
        )
      ).to.eql(['fetch']);
    });
  });

  describe('for a snapshot', () => {
    // interactive chart snapshot (shared chart)
    it('in ANALYSIS mode should only allow PASSIVE and INTERACT', () => {
      expect(
        permissions(
          {
            interactionState: 1,
          },
          { isSnapshot: true }
        )
      ).to.eql(['passive', 'interact']);
    });

    // edit story
    it('in ANALYSIS mode with tooltips and selections off, should not allow anything', () => {
      expect(permissions(MODES.editstory, { isSnapshot: true })).to.eql([]);
    });

    // play story
    it('in ANALYSIS mode with selections off, should ONLY allow PASSIVE', () => {
      expect(permissions(MODES.playstory, { isSnapshot: true })).to.eql(['passive']);
    });
  });
});
