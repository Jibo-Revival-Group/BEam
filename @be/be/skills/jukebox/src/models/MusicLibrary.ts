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
  /** Folder name under music/ (e.g. "CHASER" or "Artist/Album"). */
  id: string;
  /** Menu label (artist — album when nested, else album title). */
  title: string;
  /** Album / EP name only. */
  albumTitle: string;
  /** Artist from nested music/Artist/Album/; empty for flat folders. */
  artist: string;
  /** Cover image URL, or null if none found. */
  coverUrl: string;
  /** Absolute on-disk cover path, or null. */
  coverPath: string;
  /** 300×300 menu-button icon URL (generated), or null. */
  iconUrl?: string;
  /**
   * True when the folder has exactly one track whose title matches the album
   * title (a single release).
   */
  isSingle: boolean;
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
 * becomes its own menu entry (artist + albumTitle filled in).
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
            '\nExpected: /opt/jibo/Knowledge/jukebox/music'
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
          const album = MusicLibrary.scanAlbum(
            name,
            MusicLibrary.prettifyFolder(name),
            '',
            albumPath,
            assetPack,
            fs,
            path
          );
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
              MusicLibrary.prettifyFolder(kid),
              MusicLibrary.prettifyFolder(name),
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
    albumTitle: string,
    artist: string,
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
    const title = artist
      ? (artist + ' — ' + albumTitle)
      : albumTitle;
    const isSingle = tracks.length === 1 &&
      MusicLibrary.titlesMatch(tracks[0].title, albumTitle);
    return {
      id,
      title,
      albumTitle,
      artist: artist || '',
      coverUrl: coverAbs
        ? MusicLibrary.resolveAssetUrl('music/' + relDir + '/' + coverFile, coverAbs)
        : null,
      coverPath: coverAbs || null,
      isSingle,
      tracks
    };
  }

  /**
   * Absolute on-disk path to the user music library.
   *
   * Canonical store is /opt/jibo/Knowledge/jukebox/music so Skills / @be/be
   * OTA cannot wipe albums. Prefer a directory that actually contains albums;
   * migrate legacy Skills/tmp libraries into Knowledge once when empty.
   */
  protected static resolveMusicDir (assetPack?: string, req?: any): string {
    const nodeRequire = req || getNodeRequire();
    if (!nodeRequire) { return null; }
    const fs = nodeRequire('fs');
    const path = nodeRequire('path');

    const CANONICAL = '/opt/jibo/Knowledge/jukebox/music';
    const ROBOT_SKILLS = '/opt/jibo/Jibo/Skills';
    const onRobot = (() => {
      try {
        return fs.existsSync(ROBOT_SKILLS) && fs.statSync(ROBOT_SKILLS).isDirectory();
      } catch (e) {
        return false;
      }
    })();

    const candidates: string[] = [
      CANONICAL,
      '/opt/jibo/Jibo/Skills/@be/Skills/Jukebox/Music',
      '/opt/jibo/Jibo/Skills/@be/be/skills/jukebox/music',
      '/opt/jibo/Jibo/Skills/@be/skills/jukebox/music',
      '/opt/jibo/Jibo/Skills/@be/jukebox/music',
      '/opt/jibo/Jibo/Skills/@be/be/node_modules/@be/jukebox/music',
      '/opt/jibo/Jibo/Skills/skills/jukebox/music',
      '/opt/tmp/jukebox-music'
    ];

    try {
      const cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : null;
      if (cwd) {
        candidates.push(path.join(cwd, '@be', 'be', 'skills', 'jukebox', 'music'));
        candidates.push(path.join(cwd, 'skills', 'jukebox', 'music'));
        candidates.push(path.join(cwd, 'music'));
      }
    } catch (e) { /* no-op */ }

    if (onRobot) {
      MusicLibrary.migrateMusicToKnowledge(fs, path, CANONICAL, candidates);
    }

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (!c) { continue; }
      try {
        if (MusicLibrary.dirHasAlbums(fs, path, c)) {
          console.log('[jukebox] music dir:', c);
          return c;
        }
      } catch (e) { /* try next */ }
    }

    if (onRobot) {
      MusicLibrary.ensureDir(fs, path, CANONICAL);
      console.log('[jukebox] music dir (empty canonical):', CANONICAL);
      return CANONICAL;
    }

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (!c) { continue; }
      try {
        if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
          console.log('[jukebox] music dir (dev empty):', c);
          return c;
        }
      } catch (e) { /* try next */ }
    }

    return CANONICAL;
  }

  /** Move/copy a legacy library into Knowledge when Knowledge is empty. */
  protected static migrateMusicToKnowledge (
    fs: any,
    path: any,
    dest: string,
    candidates: string[]
  ): void {
    if (MusicLibrary.dirHasAlbums(fs, path, dest)) { return; }
    for (let i = 0; i < candidates.length; i++) {
      const src = candidates[i];
      if (!src || src === dest || !MusicLibrary.dirHasAlbums(fs, path, src)) {
        continue;
      }
      try {
        MusicLibrary.ensureDir(fs, path, path.dirname(dest));
        try {
          if (fs.existsSync(dest) && fs.statSync(dest).isDirectory()) {
            try { fs.rmdirSync(dest); } catch (e) { /* non-empty stub */ }
          }
        } catch (e) { /* create below */ }
        try {
          fs.renameSync(src, dest);
        } catch (e) {
          MusicLibrary.copyDirRecursive(fs, path, src, dest);
        }
        console.log('[jukebox] migrated music from', src, 'to', dest);
        return;
      } catch (err) {
        console.warn(
          '[jukebox] music migrate failed from',
          src,
          ':',
          err && err.message
        );
      }
    }
  }

  protected static copyDirRecursive (fs: any, path: any, src: string, dest: string): void {
    MusicLibrary.ensureDir(fs, path, dest);
    const entries: string[] = fs.readdirSync(src);
    for (let i = 0; i < entries.length; i++) {
      const name = entries[i];
      const from = path.join(src, name);
      const to = path.join(dest, name);
      const st = fs.statSync(from);
      if (st.isDirectory()) {
        MusicLibrary.copyDirRecursive(fs, path, from, to);
      } else {
        fs.writeFileSync(to, fs.readFileSync(from));
      }
    }
  }

  /** True when dir has at least one playable track under album or Artist/Album. */
  protected static dirHasAlbums (fs: any, path: any, dir: string): boolean {
    if (!dir) { return false; }
    try {
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) { return false; }
    } catch (e) {
      return false;
    }
    let entries: string[];
    try {
      entries = fs.readdirSync(dir);
    } catch (e) {
      return false;
    }
    const audioRe = /\.(mp3|opus|ogg|oga)$/i;
    for (let i = 0; i < entries.length; i++) {
      const name = entries[i];
      if (!name || name.charAt(0) === '.' || name === 'README.md') { continue; }
      const full = path.join(dir, name);
      let st: any;
      try { st = fs.statSync(full); } catch (e) { continue; }
      if (st.isFile()) {
        if (audioRe.test(name)) { return true; }
        continue;
      }
      if (!st.isDirectory()) { continue; }
      let kids: string[];
      try { kids = fs.readdirSync(full); } catch (e) { continue; }
      for (let k = 0; k < kids.length; k++) {
        const kid = kids[k];
        if (!kid || kid.charAt(0) === '.') { continue; }
        if (audioRe.test(kid)) { return true; }
        const nested = path.join(full, kid);
        try {
          if (!fs.statSync(nested).isDirectory()) { continue; }
          const grand: string[] = fs.readdirSync(nested);
          for (let g = 0; g < grand.length; g++) {
            if (audioRe.test(grand[g])) { return true; }
          }
        } catch (e) { /* try next */ }
      }
    }
    return false;
  }

  /** mkdir -p for Electron 1.4 / Node 6 (no recursive flag). */
  protected static ensureDir (fs: any, path: any, dir: string): void {
    if (!dir) { return; }
    try {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) { return; }
    } catch (e) { /* create below */ }
    const parent = path.dirname(dir);
    if (parent && parent !== dir) {
      MusicLibrary.ensureDir(fs, path, parent);
    }
    try {
      fs.mkdirSync(dir);
    } catch (err) {
      if (!err || err.code !== 'EEXIST') { throw err; }
    }
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

  /** Case-insensitive title compare for single detection. */
  protected static titlesMatch (a: string, b: string): boolean {
    const norm = (s: string) => String(s || '')
      .toLowerCase()
      .replace(/[_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const na = norm(a);
    const nb = norm(b);
    return !!na && na === nb;
  }

  protected static formatLabel (file: string): string {
    const match = file.match(/\.([^.]+)$/);
    if (!match) { return ''; }
    const ext = match[1].toLowerCase();
    if (ext === 'oga') { return 'OGG'; }
    return ext.toUpperCase();
  }
}
