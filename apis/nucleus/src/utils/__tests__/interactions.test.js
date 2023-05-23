import unifyContraintsAndInteractions from '../interactions';

describe('Interactions and contraints resolver', () => {
  test('should get default settings', () => {
    const context = { constraints: {}, interactions: {} };
    unifyContraintsAndInteractions(context);
    expect(context.constraints).toEqual({ active: false, passive: false, select: false, edit: true });
    expect(context.interactions).toEqual({ active: true, passive: true, select: true, edit: false });
  });

  test('should use contraints', () => {
    const context = { constraints: { active: true, passive: true, select: true, edit: false }, interactions: {} };
    unifyContraintsAndInteractions(context);
    expect(context.constraints).toEqual({ active: true, passive: true, select: true, edit: false });
    expect(context.interactions).toEqual({ active: false, passive: false, select: false, edit: true });
  });

  test('should use interactions', () => {
    const context = { constraints: {}, interactions: { active: false, passive: false, select: false, edit: true } };
    unifyContraintsAndInteractions(context);
    expect(context.constraints).toEqual({ active: true, passive: true, select: true, edit: false });
    expect(context.interactions).toEqual({ active: false, passive: false, select: false, edit: true });
  });

  test('should use interactions over contraints', () => {
    const context = {
      constraints: { active: false, passive: true, select: false, edit: true },
      interactions: { active: false, passive: true, select: false, edit: true },
    };
    unifyContraintsAndInteractions(context);
    expect(context.constraints).toEqual({ active: true, passive: false, select: true, edit: false });
    expect(context.interactions).toEqual({ active: false, passive: true, select: false, edit: true });
  });
});
