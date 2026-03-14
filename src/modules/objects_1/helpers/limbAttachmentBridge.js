/**
 * Bridge for limb-release callback so it is never passed through the Physics worker tree
 * (workers clone data via postMessage and functions cannot be cloned).
 */
let limbReleaseCallback = null;

export function setLimbReleaseCallback(fn) {
  limbReleaseCallback = fn;
}

export function getLimbReleaseCallback() {
  return limbReleaseCallback;
}
