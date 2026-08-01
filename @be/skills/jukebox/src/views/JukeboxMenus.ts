import jibo = require('jibo');
import { Album } from '../models/MusicLibrary';

/** Main-menu Jukebox tile colors. */
const COLORS: [string, string] = ['0x8A2BE2', '0x3B1266'];
const DEFAULT_ICON = 'jibo://resources/actionIcons/play.png';
const NOW_PLAYING_ICON = 'jibo://resources/actionIcons/play.png';

export type AlbumPressHandler = (albumId: string) => void;
export type TrackPressHandler = (albumId: string, trackIndex: number) => void;
export type NowPlayingHandler = () => void;

/**
 * Build and show dynamic native MenuViews for albums / tracks.
 * Object configs (not path strings) so they work when embedded under Be.
 */
export default class JukeboxMenus {

  private albumView: any = null;
  private trackView: any = null;
  private onAlbumPress: AlbumPressHandler = null;
  private onTrackPress: TrackPressHandler = null;
  private onNowPlaying: NowPlayingHandler = null;

  public showAlbums (albums: Album[], onPress: AlbumPressHandler, done?: () => void): void {
    this.onAlbumPress = onPress;
    this.clearListeners(this.albumView);
    this.clearListeners(this.trackView);

    const list: any[] = [];
    for (let i = 0; i < albums.length; i++) {
      const album = albums[i];
      list.push({
        id: 'album_' + i,
        label: album.title,
        iconSrc: album.iconUrl || album.coverUrl || DEFAULT_ICON,
        action: {
          type: 'event',
          data: {
            event: 'pressed',
            intent: 'album|' + album.id,
            albumId: album.id
          }
        }
      });
    }

    const config = {
      viewConfig: {
        type: 'MenuView',
        id: 'jukeboxAlbums',
        title: albums.length ? 'Albums' : 'No albums found',
        dynamic: true,
        ignoreSwipeDown: true,
        elementsPerPage: 3,
        listDefault: {
          menuButtonType: 'SkillButton',
          colors: COLORS
        },
        list
      }
    };

    this.replaceWith(config, 'album', (view) => {
      this.albumView = view;
      this.trackView = null;
      const handle = (e: any) => {
        if (!this.onAlbumPress) { return; }
        const id = JukeboxMenus.albumIdFromEvent(e);
        if (id) { this.onAlbumPress(id); }
      };
      view.on('pressed', handle);
      view.on('press', handle);
      if (done) { done(); }
    });
  }

  public showTracks (
    album: Album,
    onPress: TrackPressHandler,
    opts?: { nowPlaying?: boolean; onNowPlaying?: NowPlayingHandler },
    done?: () => void
  ): void {
    this.onTrackPress = onPress;
    this.onNowPlaying = opts && opts.onNowPlaying ? opts.onNowPlaying : null;
    this.clearListeners(this.trackView);

    const list: any[] = [];
    if (opts && opts.nowPlaying) {
      list.push({
        id: 'nowPlaying',
        label: 'Now playing',
        iconSrc: NOW_PLAYING_ICON,
        colors: ['0xe8723a', '0x8a3a12'],
        action: {
          type: 'event',
          data: {
            event: 'pressed',
            intent: 'nowPlaying'
          }
        }
      });
    }

    for (let i = 0; i < album.tracks.length; i++) {
      const track = album.tracks[i];
      list.push({
        id: 'track_' + i,
        label: track.title,
        iconSrc: album.iconUrl || album.coverUrl || DEFAULT_ICON,
        action: {
          type: 'event',
          data: {
            event: 'pressed',
            intent: 'track|' + album.id + '|' + i,
            albumId: album.id,
            trackIndex: i
          }
        }
      });
    }

    const config = {
      viewConfig: {
        type: 'MenuView',
        id: 'jukeboxTracks',
        title: album.albumTitle || album.title,
        dynamic: true,
        ignoreSwipeDown: true,
        elementsPerPage: 3,
        listDefault: {
          menuButtonType: 'ActionBigButton',
          colors: COLORS
        },
        list
      }
    };

    this.replaceWith(config, 'track', (view) => {
      this.trackView = view;
      const handle = (e: any) => {
        if (!e) { return; }
        const intent = String(e.intent || (e.data && e.data.intent) || '');
        if (intent === 'nowPlaying') {
          if (this.onNowPlaying) { this.onNowPlaying(); }
          return;
        }
        if (!this.onTrackPress) { return; }
        const parsed = JukeboxMenus.trackFromEvent(e, album.id);
        if (!parsed) { return; }
        this.onTrackPress(parsed.albumId, parsed.trackIndex);
      };
      view.on('pressed', handle);
      view.on('press', handle);
      if (done) { done(); }
    });
  }

  public cleanup (done?: () => void): void {
    this.clearListeners(this.albumView);
    this.clearListeners(this.trackView);
    this.albumView = null;
    this.trackView = null;
    this.onAlbumPress = null;
    this.onTrackPress = null;
    this.onNowPlaying = null;
    try {
      jibo.face.views.changeView(
        { removeAll: true, leaveEmpty: true },
        () => { if (done) { done(); } },
        () => { if (done) { done(); } }
      );
    } catch (err) {
      console.warn('[jukebox] menu cleanup failed', err);
      if (done) { done(); }
    }
  }

  private static albumIdFromEvent (e: any): string {
    if (!e) { return null; }
    if (e.albumId != null) { return String(e.albumId); }
    if (e.data && e.data.albumId != null) { return String(e.data.albumId); }
    const intent = String(e.intent || (e.data && e.data.intent) || '');
    if (intent.indexOf('album|') === 0) {
      return intent.substring('album|'.length) || null;
    }
    return null;
  }

  private static trackFromEvent (
    e: any,
    fallbackAlbumId: string
  ): { albumId: string; trackIndex: number } {
    let albumId = e.albumId != null ? String(e.albumId)
      : (e.data && e.data.albumId != null ? String(e.data.albumId) : null);
    let trackIndex: any = e.trackIndex != null ? e.trackIndex
      : (e.data && e.data.trackIndex != null ? e.data.trackIndex : null);

    const intent = String(e.intent || (e.data && e.data.intent) || '');
    if (intent.indexOf('track|') === 0) {
      const parts = intent.split('|');
      // track|<albumId>|<index> — albumId may contain '/'
      if (parts.length >= 3) {
        trackIndex = parts[parts.length - 1];
        albumId = parts.slice(1, -1).join('|');
      }
    }

    if (albumId == null) { albumId = fallbackAlbumId; }
    const idx = typeof trackIndex === 'number' ? trackIndex : parseInt(String(trackIndex), 10);
    if (albumId == null || isNaN(idx)) { return null; }
    return { albumId, trackIndex: idx };
  }

  private replaceWith (config: any, _kind: 'album' | 'track', onReady: (view: any) => void): void {
    const open = () => {
      try {
        const view = jibo.face.views.createView('MenuView', config, true);
        jibo.face.views.changeView(
          { addView: view },
          null,
          (err: any) => {
            console.error('[jukebox] changeView failed:', err);
          },
          (readyView: any) => {
            onReady(readyView || view);
          }
        );
      } catch (err) {
        console.error('[jukebox] createView MenuView failed:', err);
      }
    };

    try {
      if (jibo.face.views.currentView) {
        jibo.face.views.changeView(
          { removeAll: true, leaveEmpty: true },
          () => { open(); },
          () => { open(); }
        );
      } else {
        open();
      }
    } catch (err) {
      console.warn('[jukebox] replaceWith remove failed, opening anyway', err);
      open();
    }
  }

  private clearListeners (view: any): void {
    if (!view || typeof view.removeAllListeners !== 'function') { return; }
    try {
      view.removeAllListeners('pressed');
      view.removeAllListeners('press');
    } catch (e) { /* no-op */ }
  }
}
