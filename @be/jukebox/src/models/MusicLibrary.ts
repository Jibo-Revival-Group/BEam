import jibo = require('jibo');
import { getNodeRequire } from '../audio/AudioSupport';

export interface Track {
  title: string;
  url: string;
  file: string;
  /** Absolute on-disk path (for blob URLs). */
  path: string;
  format: string;
}

export interface Album {
  /** Folder name under music/ (e.g. "CHASER"). */
  id: string;
  /** Display title (folder name, prettified). */
  title: string;
  /** Cover image URL, or null if none found. */
  coverUrl: string;
  tracks: Track[];
}

export interface ScanResult {
  albums: Album[];
  /** Absolute on-disk music directory that was scanned (if known). */
  dir: string;
  /** Human-readable error for the status screen; null when OK. */
  error: string;
  /** Extra diagnostic text (paths, exception stacks, etc.). */
  detail: string;
}

/** Audio extensions the jukebox lists and tries to play. */
const AUDIO_EXT = /\.(mp3|opus|ogg|oga)$/i;
/** Cover image names looked for inside each album folder (case-insensitive). */
const COVER_NAMES = ['cover.png', 'cover.jpg', 'cover.jpeg', 'folder.png', 'folder.jpg'];

/**
 * Discovers albums (folders) under the skill's `music/` directory at runtime.
 *
 * Expected layout:
 *
 *   music/
 *     CHASER/
 *       cover.png
 *       track-01.opus
 *     Some EP/
 *       cover.jpg
 *       track-02.mp3
 *
 * Also accepts one nesting level (Artist/Album/*.opus) — each Album folder
 * becomes its own carousel entry.
 *
 * Nothing here is bundled: the folder is read from disk every time the skill
 * opens, so a user can add albums simply by dropping folders into `music/`
 * with no rebuild.
 */
export default class MusicLibrary {

  /**
   * Scan music/ and return albums plus diagnostics for the status screen.
   * Never throws — failures are reported in `error` / `detail`.
   */
  public static scan (assetPack?: string): ScanResult {
    try {
      const req = getNodeRequire();
      if (!req) {
        return {
          albums: [],
          dir: null,
          error: 'Cannot access the filesystem (Node require is not available).',
          detail: 'Electron window.require / process.mainModule.require failed.'
        };
      }
      const fs = req('fs');
      const path = req('path');

      const dir = MusicLibrary.resolveMusicDir(assetPack, req);
      if (!dir) {
        return {
          albums: [],
          dir: null,
          error: 'Could not resolve the music/ folder path.',
          detail: 'assetPack=' + String(assetPack) +
            '\nTried PathUtils, package root, and /opt/jibo/... fallbacks.'
        };
      }

      if (!fs.existsSync(dir)) {
        return {
          albums: [],
          dir,
          error: 'music/ folder not found on disk.',
          detail: 'Looked for:\n' + dir +
            '\n\nCreate album folders under that path, e.g.\n' +
            'music/CHASER/cover.png\nmusic/CHASER/song.opus'
        };
      }

      let entries: string[];
      try {
        entries = fs.readdirSync(dir);
      } catch (err) {
        return {
          albums: [],
          dir,
          error: 'Could not read the music/ folder.',
          detail: 'Path: ' + dir + '\n' + MusicLibrary.formatErr(err)
        };
      }

      const albums: Album[] = [];
      const skipped: string[] = [];
      const seenIds: { [id: string]: boolean } = {};

      const addAlbum = (album: Album) => {
        if (!album || !album.tracks.length) { return false; }
        if (seenIds[album.id]) {
          album.id = album.id + '_' + albums.length;
        }
        seenIds[album.id] = true;
        albums.push(album);
        return true;
      };

      for (let i = 0; i < entries.length; i++) {
        const name = entries[i];
        if (name.charAt(0) === '.') { continue; }
        if (name === 'README.md') { continue; }
        const albumPath = path.join(dir, name);
        let stat: any;
        try { stat = fs.statSync(albumPath); } catch (e) { continue; }
        if (!stat || !stat.isDirectory()) {
          skipped.push(name + ' (not a folder — albums must be folders)');
          continue;
        }

        try {
          const album = MusicLibrary.scanAlbum(name, name, albumPath, assetPack, fs, path);
          if (addAlbum(album)) { continue; }

          // One nesting level: music/Artist/Album/*.opus
          const kids: string[] = fs.readdirSync(albumPath);
          let nestedFound = 0;
          for (let k = 0; k < kids.length; k++) {
            const kid = kids[k];
            if (kid.charAt(0) === '.') { continue; }
            const kidPath = path.join(albumPath, kid);
            let kidStat: any;
            try { kidStat = fs.statSync(kidPath); } catch (e) { continue; }
            if (!kidStat || !kidStat.isDirectory()) { continue; }
            const nestedId = name + '/' + kid;
            const nested = MusicLibrary.scanAlbum(
              nestedId,
              name + ' — ' + kid,
              kidPath,
              assetPack,
              fs,
              path
            );
            if (addAlbum(nested)) { nestedFound++; }
          }

          if (!nestedFound) {
            const sample = kids.filter((f: string) => f.charAt(0) !== '.').slice(0, 8);
            skipped.push(
              name + ' (no .mp3/.opus/.ogg inside' +
              (sample.length ? '; saw: ' + sample.join(', ') : '') + ')'
            );
          }
        } catch (err) {
          skipped.push(name + ' (error: ' + (err && err.message ? err.message : String(err)) + ')');
        }
      }

      albums.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
      console.log('[jukebox] found', albums.length, 'album(s) in', dir);

      const detailLines = [
        'music dir: ' + dir,
        'assetPack: ' + String(assetPack),
        'entries: ' + entries.length,
        'albums: ' + albums.length
      ];
      if (skipped.length) {
        detailLines.push('skipped:');
        for (let s = 0; s < skipped.length; s++) {
          detailLines.push('  - ' + skipped[s]);
        }
      }

      return {
        albums,
        dir,
        error: null,
        detail: detailLines.join('\n')
      };
    } catch (err) {
      console.error('[jukebox] failed to scan music folder:', err);
      return {
        albums: [],
        dir: null,
        error: 'Unexpected error while scanning music/.',
        detail: MusicLibrary.formatErr(err)
      };
    }
  }

  protected static formatErr (err: any): string {
    if (!err) { return String(err); }
    const msg = err.message || String(err);
    const stack = err.stack ? '\n' + err.stack : '';
    return msg + stack;
  }

  protected static scanAlbum (
    id: string,
    titleSource: string,
    albumPath: string,
    assetPack: string,
    fs: any,
    path: any
  ): Album {
    const files: string[] = fs.readdirSync(albumPath);
    const tracks: Track[] = [];
    let coverFile: string = null;

    const lowerFiles = files.map((f: string) => ({ raw: f, lower: f.toLowerCase() }));

    for (let c = 0; c < COVER_NAMES.length && !coverFile; c++) {
      const want = COVER_NAMES[c];
      for (let f = 0; f < lowerFiles.length; f++) {
        if (lowerFiles[f].lower === want) {
          coverFile = lowerFiles[f].raw;
          break;
        }
      }
    }

    const audioFiles = files
      .filter((name: string) => AUDIO_EXT.test(name))
      .sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));

    // Relative path under music/ for asset URLs (id may contain "Artist/Album").
    const relDir = id;

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      const abs = path.join(albumPath, file);
      const rel = relDir + '/' + file;
      tracks.push({
        file: rel,
        path: abs,
        title: MusicLibrary.prettifyName(file),
        format: MusicLibrary.formatLabel(file),
        url: MusicLibrary.resolveAssetUrl('music/' + rel, abs)
      });
    }

    const coverAbs = coverFile ? path.join(albumPath, coverFile) : null;
    return {
      id,
      title: MusicLibrary.prettifyFolder(titleSource),
      coverUrl: coverAbs
        ? MusicLibrary.resolveAssetUrl('music/' + relDir + '/' + coverFile, coverAbs)
        : null,
      tracks
    };
  }

  /**
   * Absolute on-disk path to music/. Prefer well-known absolute paths with a
   * cheap existsSync — never call require.resolve() (it can hang walking
   * node_modules on the robot). PathUtils is a last resort.
   */
  protected static resolveMusicDir (assetPack?: string, req?: any): string {
    const nodeRequire = req || getNodeRequire();
    if (!nodeRequire) { return null; }
    const fs = nodeRequire('fs');
    const path = nodeRequire('path');

    const candidates: string[] = [
      '/opt/jibo/Jibo/Skills/@be/be/node_modules/@be/jukebox/music',
      '/opt/tmp/jukebox-music'
    ];

    try {
      const cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : null;
      if (cwd) {
        candidates.push(path.join(cwd, '@be', 'be', 'node_modules', '@be', 'jukebox', 'music'));
        candidates.push(path.join(cwd, 'node_modules', '@be', 'jukebox', 'music'));
        candidates.push(path.join(cwd, 'music'));
      }
    } catch (e) { /* no-op */ }

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (!c) { continue; }
      try {
        if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
          console.log('[jukebox] music dir:', c);
          return c;
        }
      } catch (e) { /* try next */ }
    }

    // Last resort — PathUtils may touch Module resolution (can be slow/hang).
    // Skipped on purpose; absolute candidates above are enough on the robot.

    return candidates[0] || null;
  }

  protected static resolveAssetUrl (relPath: string, absPath?: string): string {
    // Prefer a direct file URL from the absolute path — avoids PathUtils
    // Module resolution during scan (which can hang on the robot).
    if (absPath) {
      return MusicLibrary.pathToFileUrl(absPath);
    }
    try {
      const PathUtils: any = (jibo as any).utils && (jibo as any).utils.PathUtils;
      if (PathUtils && typeof PathUtils.getAssetUri === 'function') {
        const uri = PathUtils.getAssetUri(relPath);
        if (uri) { return uri; }
      }
    } catch (err) {
      console.warn('[jukebox] resolveAssetUrl failed for', relPath, err);
    }
    return './' + relPath.split('/').map(encodeURIComponent).join('/');
  }

  protected static pathToFileUrl (absPath: string): string {
    const parts = String(absPath).split('/');
    const encoded = parts.map((p, i) => {
      if (i === 0 && p === '') { return ''; }
      return encodeURIComponent(p);
    }).join('/');
    return 'file://' + encoded;
  }

  protected static uriToPath (uri: string): string {
    let p = String(uri);
    if (p.indexOf('file://') === 0) {
      p = p.replace(/^file:\/\//, '');
      // file:///opt/... -> /opt/... ; file://localhost/opt/... -> /opt/...
      if (p.indexOf('localhost/') === 0) {
        p = p.substring('localhost'.length);
      }
    }
    try { p = decodeURIComponent(p); } catch (e) { /* leave as-is */ }
    return p;
  }

  protected static prettifyName (file: string): string {
    return file
      .replace(/\.(mp3|opus|ogg|oga)$/i, '')
      .replace(/_/g, ' ')
      .trim();
  }

  protected static prettifyFolder (name: string): string {
    return String(name).replace(/_/g, ' ').trim();
  }

  protected static formatLabel (file: string): string {
    const match = file.match(/\.([^.]+)$/);
    if (!match) { return ''; }
    const ext = match[1].toLowerCase();
    if (ext === 'oga') { return 'OGG'; }
    return ext.toUpperCase();
  }
}
