/// <reference path="../typings-local/index.d.ts" />

import { BeSkill } from '@be/be-framework';
import jibo = require('jibo');

import MusicLibrary, { Album } from './models/MusicLibrary';
import CoverThumbs from './views/CoverThumbs';
import JukeboxMenus from './views/JukeboxMenus';
import PlayerOverlay from './views/PlayerOverlay';
import StatusOverlay from './views/StatusOverlay';

type Screen = 'loading' | 'albums' | 'tracks' | 'player';

/**
 * Jukebox: native MenuView album/track browser + now-playing chrome.
 * On open it shows a loading screen, scans music/, then a MenuView grid.
 * Swipe-down: player → tracks → albums → exit.
 */
class JukeboxSkill extends BeSkill {

  private albums: Album[] = [];
  private currentAlbum: Album = null;
  private menus: JukeboxMenus = null;
  private player: PlayerOverlay = null;
  private status: StatusOverlay = null;
  private screen: Screen = 'loading';
  private exiting: boolean = false;
  private screenGestureHandler: (gesture: string) => void = null;

  constructor (assetPack?: string) {
    super(assetPack);
  }

  public postInit (done: () => any): void {
    done();
  }

  public preload (done: (err?: any) => void): void {
    const es: any = (jibo as any).embodied && (jibo as any).embodied.speech;
    if (es && typeof es.installDelegate === 'function') {
      es.installDelegate(this.assetPack);
    }
    done();
  }

  public open (result?: any): void {
    this.exiting = false;
    this.screen = 'loading';
    this.subscribeSwipeDown();

    try {
      this.status = StatusOverlay.show('Loading Jukebox...\nScanning music folder...');
    } catch (err) {
      console.error('[jukebox] could not show loading screen:', err);
    }

    const self = this;
    let finished = false;
    const watchdog = setTimeout(() => {
      if (finished || !self.status) { return; }
      self.status.showError(
        'Scan is taking too long (or hung).',
        'Check that music lives at:\n' +
          '/opt/jibo/Jibo/Skills/@be/Skills/Jukebox/Music/\n\n' +
          'Or that a previous update left it in /opt/tmp/jukebox-music/'
      );
    }, 12000);

    setTimeout(() => {
      try {
        self.finishOpen();
      } finally {
        finished = true;
        clearTimeout(watchdog);
      }
    }, 50);
  }

  private finishOpen (): void {
    try {
      if (this.status) {
        this.status.setLoading('Loading Jukebox...\nScanning music folder...');
      }

      const scan = MusicLibrary.scan(this.assetPack);
      console.log('[jukebox] scan result:\n' + (scan.detail || '(no detail)'));

      if (scan.error) {
        if (this.status) {
          this.status.showError(scan.error, scan.detail);
        }
        return;
      }

      this.albums = scan.albums || [];

      if (this.status) {
        this.status.setLoading(
          this.albums.length
            ? ('Found ' + this.albums.length + ' album(s).\nPreparing covers...')
            : 'No albums found yet.\nOpening menu...'
        );
      }

      const self = this;
      CoverThumbs.prepare(this.albums).then(() => {
        if (self.status) {
          self.status.setLoading(
            self.albums.length
              ? ('Found ' + self.albums.length + ' album(s).\nOpening menu...')
              : 'No albums found yet.\nOpening menu...'
          );
        }
        setTimeout(() => {
          try {
            self.menus = new JukeboxMenus();
            self.player = new PlayerOverlay();
            if (self.status) {
              self.status.dismiss();
              self.status = null;
            }
            self.showAlbumMenu();
          } catch (err) {
            console.error('[jukebox] UI failed to start:', err);
            if (self.status) {
              self.status.showError(
                'Player UI failed to start.',
                (scan.detail ? scan.detail + '\n\n' : '') +
                  (err && err.stack ? err.stack : String(err))
              );
            } else {
              try {
                self.status = StatusOverlay.show('Player UI failed to start.');
                self.status.showError(
                  'Player UI failed to start.',
                  err && err.stack ? err.stack : String(err)
                );
              } catch (e2) { /* no-op */ }
            }
          }
        }, 0);
      }).catch((err) => {
        console.warn('[jukebox] cover thumbs failed, opening with full covers', err);
        setTimeout(() => {
          try {
            self.menus = new JukeboxMenus();
            self.player = new PlayerOverlay();
            if (self.status) {
              self.status.dismiss();
              self.status = null;
            }
            self.showAlbumMenu();
          } catch (e2) {
            console.error('[jukebox] UI failed to start:', e2);
          }
        }, 0);
      });
    } catch (err) {
      console.error('[jukebox] open failed:', err);
      if (this.status) {
        this.status.showError(
          'Jukebox failed to open.',
          err && err.stack ? err.stack : String(err)
        );
      }
    }
  }

  private showAlbumMenu (): void {
    if (!this.menus) { return; }
    if (this.player && this.player.isVisible()) {
      this.player.hide();
    }
    this.screen = 'albums';
    this.currentAlbum = null;
    this.menus.showAlbums(this.albums, (albumId) => {
      this.openAlbum(albumId);
    });
  }

  private openAlbum (albumId: string): void {
    const album = this.findAlbum(albumId);
    if (!album) {
      console.warn('[jukebox] album not found:', albumId);
      return;
    }
    this.currentAlbum = album;
    // Singles skip the one-item track list and go straight to playback.
    if (album.isSingle && album.tracks.length === 1) {
      this.playTrack(album.id, 0);
      return;
    }
    this.showTrackMenu();
  }

  private showTrackMenu (): void {
    if (!this.menus || !this.currentAlbum) { return; }
    if (this.player && this.player.isVisible()) {
      this.player.hide();
    }
    this.screen = 'tracks';
    const nowPlaying = !!(
      this.player &&
      this.player.hasActiveTrack() &&
      this.player.getAlbumId() === this.currentAlbum.id
    );
    this.menus.showTracks(
      this.currentAlbum,
      (albumId, trackIndex) => {
        this.playTrack(albumId, trackIndex);
      },
      {
        nowPlaying,
        onNowPlaying: () => {
          if (this.player && this.player.hasActiveTrack()) {
            this.screen = 'player';
            this.player.show();
          }
        }
      }
    );
  }

  private playTrack (albumId: string, trackIndex: number): void {
    const album = this.findAlbum(albumId) || this.currentAlbum;
    if (!album || !album.tracks[trackIndex]) {
      console.warn('[jukebox] track not found', albumId, trackIndex);
      return;
    }
    this.currentAlbum = album;
    if (!this.player) {
      this.player = new PlayerOverlay();
    }
    this.screen = 'player';
    this.player.play(album, trackIndex);
  }

  private findAlbum (id: string): Album {
    for (let i = 0; i < this.albums.length; i++) {
      if (this.albums[i].id === id) { return this.albums[i]; }
    }
    return null;
  }

  public close (done: () => void): void {
    this.unsubscribeSwipeDown();
    if (this.player) {
      try { this.player.cleanup(); } catch (e) { /* no-op */ }
      this.player = null;
    }
    if (this.status) {
      try { this.status.dismiss(); } catch (e) { /* no-op */ }
      this.status = null;
    }
    const finish = () => {
      this.menus = null;
      this.albums = [];
      this.currentAlbum = null;
      this.screen = 'loading';
      done();
    };
    if (this.menus) {
      try {
        this.menus.cleanup(() => { finish(); });
        return;
      } catch (e) { /* fall through */ }
    }
    finish();
  }

  protected subscribeSwipeDown (): void {
    try {
      const shared: any = (jibo as any).globalEvents && (jibo as any).globalEvents.shared;
      if (!shared || !shared.screenGesture) { return; }
      this.screenGestureHandler = (gesture: string) => {
        if (String(gesture).toLowerCase() !== 'swipedown' || this.exiting) { return; }
        this.handleSwipeDown();
      };
      shared.screenGesture.on(this.screenGestureHandler);
    } catch (err) {
      console.warn('[jukebox] could not subscribe to swipe-down gesture', err);
    }
  }

  protected handleSwipeDown (): void {
    // Player → track list (or albums for singles); audio keeps playing
    if (this.screen === 'player' || (this.player && this.player.isVisible())) {
      if (this.currentAlbum && this.currentAlbum.isSingle) {
        console.log('[jukebox] swipe-down: player -> albums (single)');
        this.showAlbumMenu();
      } else if (this.currentAlbum) {
        console.log('[jukebox] swipe-down: player -> tracks');
        this.showTrackMenu();
      } else {
        this.showAlbumMenu();
      }
      return;
    }

    // Tracks → albums
    if (this.screen === 'tracks') {
      console.log('[jukebox] swipe-down: tracks -> albums');
      this.showAlbumMenu();
      return;
    }

    // Albums / loading → exit
    this.exiting = true;
    console.log('[jukebox] swipe-down: exiting to idle');
    (this as any).exit();
  }

  protected unsubscribeSwipeDown (): void {
    if (!this.screenGestureHandler) { return; }
    try {
      const shared: any = (jibo as any).globalEvents && (jibo as any).globalEvents.shared;
      if (shared && shared.screenGesture) {
        shared.screenGesture.removeListener(this.screenGestureHandler);
      }
    } catch (err) {
      console.warn('[jukebox] could not unsubscribe swipe-down gesture', err);
    }
    this.screenGestureHandler = null;
  }
}

module.exports = JukeboxSkill;
