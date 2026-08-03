import { Album } from '../models/MusicLibrary';
import { getNodeRequire } from '../audio/AudioSupport';

const THUMB_SIZE = 300;
const THUMB_DIR_CANDIDATES = [
  '/opt/tmp/jukebox-thumbs',
  '/tmp/jukebox-thumbs'
];

/**
 * Downsize album covers to 300×300 JPEG files for MenuView button icons.
 * Full-res coverUrl stays for the now-playing screen.
 */
export default class CoverThumbs {

  /**
   * Fill album.iconUrl for every album that has a cover. Never throws.
   */
  public static prepare (albums: Album[]): Promise<void> {
    if (!albums || !albums.length) {
      return Promise.resolve();
    }
    const thumbDir = CoverThumbs.ensureThumbDir();
    const jobs: Promise<void>[] = [];
    for (let i = 0; i < albums.length; i++) {
      jobs.push(CoverThumbs.prepareOne(albums[i], thumbDir));
    }
    return Promise.all(jobs).then(() => undefined);
  }

  private static prepareOne (album: Album, thumbDir: string): Promise<void> {
    if (!album || (!album.coverPath && !album.coverUrl)) {
      album.iconUrl = null;
      return Promise.resolve();
    }

    return CoverThumbs.resizeToFile(album, thumbDir)
      .then((url) => {
        album.iconUrl = url || album.coverUrl || null;
      })
      .catch((err) => {
        console.warn('[jukebox] thumb failed for', album.id, err);
        album.iconUrl = album.coverUrl || null;
      });
  }

  private static resizeToFile (album: Album, thumbDir: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = getNodeRequire();
      if (!req || !thumbDir) {
        resolve(album.coverUrl);
        return;
      }

      let fs: any;
      let path: any;
      try {
        fs = req('fs');
        path = req('path');
      } catch (err) {
        reject(err);
        return;
      }

      const safe = CoverThumbs.safeFileName(album.id);
      const outPath = path.join(thumbDir, safe + '-' + THUMB_SIZE + '.jpg');

      // Reuse cached thumb when source cover is older or same mtime.
      try {
        if (album.coverPath && fs.existsSync(outPath) && fs.existsSync(album.coverPath)) {
          const coverStat = fs.statSync(album.coverPath);
          const thumbStat = fs.statSync(outPath);
          if (thumbStat.mtimeMs >= coverStat.mtimeMs && thumbStat.size > 0) {
            resolve(CoverThumbs.pathToFileUrl(outPath));
            return;
          }
        }
      } catch (e) { /* rebuild */ }

      const img = new Image();
      let objectUrl: string = null;

      const cleanup = () => {
        if (objectUrl) {
          try { URL.revokeObjectURL(objectUrl); } catch (e) { /* no-op */ }
          objectUrl = null;
        }
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = THUMB_SIZE;
          canvas.height = THUMB_SIZE;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            cleanup();
            resolve(album.coverUrl);
            return;
          }

          // Center-crop to square, then scale to 300×300.
          const sw = img.naturalWidth || img.width;
          const sh = img.naturalHeight || img.height;
          const side = Math.min(sw, sh);
          const sx = Math.max(0, (sw - side) / 2);
          const sy = Math.max(0, (sh - side) / 2);
          ctx.fillStyle = '#1a0f28';
          ctx.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE);
          ctx.drawImage(img, sx, sy, side, side, 0, 0, THUMB_SIZE, THUMB_SIZE);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
          const buf = Buffer.from(base64, 'base64');
          fs.writeFileSync(outPath, buf);
          cleanup();
          resolve(CoverThumbs.pathToFileUrl(outPath));
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      img.onerror = () => {
        cleanup();
        resolve(album.coverUrl);
      };

      // Prefer blob from disk so canvas is not tainted by file:// CORS.
      try {
        if (album.coverPath && fs.existsSync(album.coverPath)) {
          const raw = fs.readFileSync(album.coverPath);
          const mime = CoverThumbs.mimeForPath(album.coverPath);
          const blob = new Blob([raw], { type: mime });
          objectUrl = URL.createObjectURL(blob);
          img.src = objectUrl;
          return;
        }
      } catch (err) {
        console.warn('[jukebox] could not read cover for thumb', album.id, err);
      }

      if (album.coverUrl) {
        img.src = album.coverUrl;
      } else {
        resolve(null);
      }
    });
  }

  private static ensureThumbDir (): string {
    const req = getNodeRequire();
    if (!req) { return null; }
    let fs: any;
    try { fs = req('fs'); } catch (e) { return null; }

    for (let i = 0; i < THUMB_DIR_CANDIDATES.length; i++) {
      const dir = THUMB_DIR_CANDIDATES[i];
      try {
        if (!fs.existsSync(dir)) {
          try {
            fs.mkdirSync(dir, { recursive: true });
          } catch (e1) {
            // Older Node without recursive mkdir.
            fs.mkdirSync(dir);
          }
        }
        if (fs.existsSync(dir)) { return dir; }
      } catch (e) { /* try next */ }
    }
    return null;
  }

  private static safeFileName (id: string): string {
    return String(id || 'album')
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 80) || 'album';
  }

  private static mimeForPath (p: string): string {
    const lower = String(p).toLowerCase();
    if (lower.indexOf('.png') >= 0) { return 'image/png'; }
    if (lower.indexOf('.jpeg') >= 0 || lower.indexOf('.jpg') >= 0) { return 'image/jpeg'; }
    if (lower.indexOf('.webp') >= 0) { return 'image/webp'; }
    return 'application/octet-stream';
  }

  private static pathToFileUrl (absPath: string): string {
    const parts = String(absPath).split('/');
    const encoded = parts.map((p, i) => {
      if (i === 0 && p === '') { return ''; }
      return encodeURIComponent(p);
    }).join('/');
    return 'file://' + encoded;
  }
}
