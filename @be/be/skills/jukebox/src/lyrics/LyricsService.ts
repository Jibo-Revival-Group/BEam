import { Album, Track } from '../models/MusicLibrary';

export interface SyncedLine {
  time: number; // seconds
  text: string;
}

export interface LyricsResult {
  lines: SyncedLine[];
  plain: string;
  instrumental: boolean;
  source: string;
}

interface LrcRecord {
  id?: number;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
}

const CLIENT = 'BEast-Jukebox/0.1.0 (https://github.com/zane/BEast-Skills)';
const SEARCH_URL = 'https://lrclib.net/api/search';
const GET_URL = 'https://lrclib.net/api/get';

/**
 * Fetch lyrics from lrclib.net for the current track.
 */
export default class LyricsService {

  public static fetch (
    album: Album,
    track: Track,
    durationSec?: number
  ): Promise<LyricsResult> {
    const trackName = track ? track.title : '';
    const artistName = album && album.artist ? album.artist : '';
    const albumName = album
      ? (album.isSingle ? trackName : (album.albumTitle || album.title || ''))
      : '';

    // Prefer exact get when we have artist + duration; otherwise search.
    // Search also runs when get fails.
    const tryGet = !!(artistName && trackName && durationSec && durationSec > 0);

    const run = tryGet
      ? LyricsService.getExact(trackName, artistName, albumName || trackName, durationSec)
          .catch(() => LyricsService.search(trackName, artistName, albumName, durationSec))
      : LyricsService.search(trackName, artistName, albumName, durationSec);

    return run.then((record) => LyricsService.toResult(record));
  }

  private static getExact (
    trackName: string,
    artistName: string,
    albumName: string,
    duration: number
  ): Promise<LrcRecord> {
    const q =
      'track_name=' + encodeURIComponent(trackName) +
      '&artist_name=' + encodeURIComponent(artistName) +
      '&album_name=' + encodeURIComponent(albumName) +
      '&duration=' + encodeURIComponent(String(Math.round(duration)));
    return LyricsService.httpGet(GET_URL + '?' + q).then((body) => {
      const data = JSON.parse(body);
      if (!data || data.code === 404) {
        throw new Error('not found');
      }
      return data as LrcRecord;
    });
  }

  private static search (
    trackName: string,
    artistName: string,
    albumName: string,
    durationSec?: number
  ): Promise<LrcRecord> {
    const parts = [trackName, artistName, albumName].filter((p) => !!p && String(p).trim());
    const q = encodeURIComponent(parts.join(' '));
    return LyricsService.httpGet(SEARCH_URL + '?q=' + q).then((body) => {
      const list = JSON.parse(body);
      if (!Array.isArray(list) || !list.length) {
        throw new Error('no results');
      }
      return LyricsService.pickBest(
        list as LrcRecord[],
        trackName,
        artistName,
        albumName,
        durationSec
      );
    });
  }

  private static pickBest (
    list: LrcRecord[],
    trackName: string,
    artistName: string,
    albumName: string,
    durationSec?: number
  ): LrcRecord {
    let best: LrcRecord = null;
    let bestScore = -1;

    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      if (!r) { continue; }
      const hasSynced = !!(r.syncedLyrics && String(r.syncedLyrics).trim());
      const hasPlain = !!(r.plainLyrics && String(r.plainLyrics).trim());
      if (!hasSynced && !hasPlain && !r.instrumental) { continue; }

      let score = 0;
      if (hasSynced) { score += 50; }
      else if (hasPlain) { score += 20; }
      if (r.instrumental && !hasSynced && !hasPlain) { score += 5; }

      if (LyricsService.fuzzyEq(r.trackName, trackName)) { score += 30; }
      if (artistName && LyricsService.fuzzyEq(r.artistName, artistName)) { score += 20; }
      if (albumName && LyricsService.fuzzyEq(r.albumName, albumName)) { score += 15; }

      if (durationSec && r.duration) {
        const diff = Math.abs(Number(r.duration) - durationSec);
        if (diff <= 2) { score += 25; }
        else if (diff <= 5) { score += 10; }
        else if (diff > 30) { score -= 20; }
      }

      if (score > bestScore) {
        bestScore = score;
        best = r;
      }
    }

    if (!best) {
      throw new Error('no usable lyrics');
    }
    return best;
  }

  private static toResult (record: LrcRecord): LyricsResult {
    if (!record) {
      throw new Error('empty record');
    }

    const synced = LyricsService.parseSynced(record.syncedLyrics || '');
    const plain = String(record.plainLyrics || '').trim();

    if (record.instrumental && !synced.length && !plain) {
      return {
        lines: [],
        plain: '',
        instrumental: true,
        source: (record.artistName || '') + ' / ' + (record.trackName || '')
      };
    }

    return {
      lines: synced,
      plain: plain || synced.map((l) => l.text).filter(Boolean).join('\n'),
      instrumental: !!record.instrumental && !synced.length && !plain,
      source: (record.artistName || '') + ' — ' + (record.trackName || '')
    };
  }

  /** Parse LRC `[mm:ss.xx] text` lines into timed entries. */
  public static parseSynced (raw: string): SyncedLine[] {
    if (!raw) { return []; }
    const lines: SyncedLine[] = [];
    const re = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)/g;
    const parts = String(raw).split(/\r?\n/);
    for (let i = 0; i < parts.length; i++) {
      const row = parts[i];
      re.lastIndex = 0;
      let m: RegExpExecArray;
      // A line can have multiple timestamps; keep last text with each time.
      const times: number[] = [];
      let text = '';
      while ((m = re.exec(row)) !== null) {
        const min = parseInt(m[1], 10) || 0;
        const sec = parseInt(m[2], 10) || 0;
        let frac = m[3] || '0';
        if (frac.length === 1) { frac += '00'; }
        else if (frac.length === 2) { frac += '0'; }
        const ms = parseInt(frac.substring(0, 3), 10) || 0;
        times.push(min * 60 + sec + ms / 1000);
        text = m[4] != null ? String(m[4]).trim() : '';
      }
      for (let t = 0; t < times.length; t++) {
        lines.push({ time: times[t], text });
      }
    }
    lines.sort((a, b) => a.time - b.time);
    return lines;
  }

  public static activeIndex (lines: SyncedLine[], timeSec: number): number {
    if (!lines || !lines.length) { return -1; }
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= timeSec + 0.05) { idx = i; }
      else { break; }
    }
    return idx;
  }

  private static fuzzyEq (a: string, b: string): boolean {
    const n = (s: string) => String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const na = n(a);
    const nb = n(b);
    if (!na || !nb) { return false; }
    return na === nb || na.indexOf(nb) >= 0 || nb.indexOf(na) >= 0;
  }

  private static httpGet (url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 12000;
        try { xhr.setRequestHeader('Lrclib-Client', CLIENT); } catch (e) { /* browsers may block */ }
        try { xhr.setRequestHeader('X-User-Agent', CLIENT); } catch (e2) { /* no-op */ }
        xhr.onreadystatechange = () => {
          if (xhr.readyState !== 4) { return; }
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText || '');
          } else if (xhr.status === 404) {
            reject(new Error('not found'));
          } else {
            reject(new Error('HTTP ' + xhr.status));
          }
        };
        xhr.onerror = () => { reject(new Error('network error')); };
        xhr.ontimeout = () => { reject(new Error('timeout')); };
        xhr.send();
      } catch (err) {
        reject(err);
      }
    });
  }
}
