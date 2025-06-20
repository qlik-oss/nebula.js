import path from 'path';
import { Jimp } from 'jimp';

export async function looksLike(fileName, capturedPath) {
  const artifactsPath = path.resolve(__dirname, './__artifacts__/');
  const storedPath = path.resolve(artifactsPath, 'baseline', fileName);

  const stored = await Jimp.read(storedPath);
  const captured = await Jimp.read(capturedPath);

  const distance = Jimp.distance(stored, captured);
  const diff = Jimp.diff(stored, captured);

  if (distance > 0.001 || diff.percent > 0.007) {
    await captured.writeAsync(path.resolve(artifactsPath, 'regression', fileName));
    await diff.image.writeAsync(path.resolve(artifactsPath, 'diff', fileName));
    throw new Error(`Images differ too much - distance: ${distance}, percent: ${diff.percent}`);
  }
}

/**
 * Utility function for ensuring that each action is awaited before executing the next one.
 * @param {function[]} items An array of items (e.g. selectors) that will be sent into the action function, iteratively.
 * @returns {Promise} Resolves true when done.
 */
export async function execSequence(items, action) {
  const takeAction = async (index = 0) => {
    if (index >= items.length) {
      return true; // done
    }
    const nextItem = items[index];
    await action(nextItem);
    return takeAction(index + 1);
  };
  return takeAction();
}
