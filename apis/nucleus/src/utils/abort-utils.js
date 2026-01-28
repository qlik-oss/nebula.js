/**
 * Utilities for implementing abortable APIs following MDN best practices.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal#implementing_an_abortable_api
 */

/**
 * Races a promise with an AbortSignal, throwing an AbortError if the signal is aborted.
 * Follows the MDN pattern for implementing abortable APIs:
 * 1. Check if already aborted before starting work
 * 2. Race the promise with abort event
 * 3. Clean up abort listener when promise settles
 *
 * @param {Promise<T>} promise - The promise to race with the abort signal
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<T>} The original promise result, or rejects with AbortError
 * @throws {DOMException} Throws with name 'AbortError' if signal is aborted
 * @example
 * const controller = new AbortController();
 * const result = await raceWithAbort(
 *   someAsyncOperation(),
 *   controller.signal
 * );
 */
export default function raceWithAbort(promise, signal) {
  // If no signal provided, just return the original promise
  if (!signal) {
    return promise;
  }

  // Check if already aborted before starting
  if (typeof signal.throwIfAborted === 'function') {
    signal.throwIfAborted();
  }

  let abortReject;
  const abortPromise = new Promise((_, reject) => {
    abortReject = reject;
  });

  const onAbort = () => abortReject?.(signal.reason);
  signal.addEventListener('abort', onAbort, { once: true });

  return Promise.race([promise, abortPromise]).finally(() => {
    signal.removeEventListener('abort', onAbort);
  });
}
