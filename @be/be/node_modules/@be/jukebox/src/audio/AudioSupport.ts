/**
 * Playback helpers for Electron: read files via Node require into blob URLs
 * so paths with spaces work in <audio>.
 */

export interface PlayableSource {
  url: string;
  /** True when url is an object URL that must be revoked later. */
  revoke: boolean;
}

/**
 * Electron's Node require (window.require / process.mainModule.require),
 * not browserify's lexical require.
 */
export function getNodeRequire (): any {
  const candidates: any[] = [];
  try {
    if (typeof window !== 'undefined' && typeof (window as any).require === 'function') {
      candidates.push((window as any).require);
    }
  } catch (e) { /* no-op */ }
  try {
    if (typeof global !== 'undefined' && typeof (global as any).require === 'function') {
      candidates.push((global as any).require);
    }
  } catch (e) { /* no-op */ }
  try {
    const g: any = typeof global !== 'undefined' ? global : null;
    if (g && g.process && g.process.mainModule && typeof g.process.mainModule.require === 'function') {
      candidates.push(g.process.mainModule.require.bind(g.process.mainModule));
    }
  } catch (e) { /* no-op */ }

  for (let i = 0; i < candidates.length; i++) {
    try {
      const r = candidates[i];
      const fs = r('fs');
      if (fs && typeof fs.readFileSync === 'function') { return r; }
    } catch (e) { /* try next */ }
  }
  return null;
}

export function mimeForFormat (format: string): string {
  const f = (format || '').toUpperCase();
  if (f === 'MP3') { return 'audio/mpeg'; }
  if (f === 'OGG' || f === 'OPUS' || f === 'OGA') { return 'audio/ogg'; }
  if (f === 'WAV') { return 'audio/wav'; }
  return 'application/octet-stream';
}

export function fileToBlobUrl (absPath: string, mime: string): PlayableSource {
  const req = getNodeRequire();
  if (!req) {
    throw new Error('Node require is not available');
  }
  const fs = req('fs');
  const raw = fs.readFileSync(absPath);
  const blob = new Blob([raw], { type: mime });
  return { url: URL.createObjectURL(blob), revoke: true };
}
