/// <reference path="../typings-local/index.d.ts" />

import { BeSkill } from '@be/be-framework';
import jibo = require('jibo');

import DoomView from './views/DoomView';
import StatusOverlay from './views/StatusOverlay';

/**
 * Doom: playable shareware DOOM on Jibo's face with touch controls.
 *
 * Follows the same open pattern as Jukebox:
 * 1. Paint a status panel inside #face immediately
 * 2. Defer heavy work so that frame can paint
 * 3. Keep errors on-screen (never silent black)
 */
class DoomSkill extends BeSkill {

  private doomView: DoomView = null;
  private status: StatusOverlay = null;
  private exiting: boolean = false;
  private screenGestureHandler: (gesture: string) => void = null;

  constructor (assetPack?: any) {
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
    this.subscribeSwipeDown();

    // Remove the menu's temp diagnostic banner now that we've actually launched.
    try {
      const banner = document.getElementById('menu-redirect-banner');
      if (banner && banner.parentNode) { banner.parentNode.removeChild(banner); }
    } catch (e) { /* no-op */ }

    // Always paint something immediately (body layer) — before engine work.
    try {
      this.status = StatusOverlay.show(
        'Loading Doom...\nPreparing shareware episode...\n\nSwipe down to exit.'
      );
    } catch (err) {
      console.error('[doom] could not show loading screen:', err);
    }

    const self = this;
    setTimeout(() => {
      self.finishOpen();
    }, 50);
  }

  public close (done: () => void): void {
    this.unsubscribeSwipeDown();
    if (this.doomView) {
      try { this.doomView.cleanup(); } catch (e) { /* no-op */ }
      this.doomView = null;
    }
    if (this.status) {
      try { this.status.dismiss(); } catch (e) { /* no-op */ }
      this.status = null;
    }
    done();
  }

  protected subscribeSwipeDown (): void {
    try {
      const shared: any = (jibo as any).globalEvents && (jibo as any).globalEvents.shared;
      if (!shared || !shared.screenGesture) { return; }
      this.screenGestureHandler = (gesture: string) => {
        if (String(gesture).toLowerCase() !== 'swipedown' || this.exiting) { return; }
        this.exiting = true;
        (this as any).exit();
      };
      shared.screenGesture.on(this.screenGestureHandler);
    } catch (err) { /* no-op */ }
  }

  protected unsubscribeSwipeDown (): void {
    if (!this.screenGestureHandler) { return; }
    try {
      const shared: any = (jibo as any).globalEvents && (jibo as any).globalEvents.shared;
      if (shared && shared.screenGesture) {
        shared.screenGesture.removeListener(this.screenGestureHandler);
      }
    } catch (err) { /* no-op */ }
    this.screenGestureHandler = null;
  }

  private finishOpen (): void {
    const report = (message?: string, detail?: string) => {
      if (this.status) {
        if (message) {
          this.status.setLoading(message);
        }
        if (detail) {
          this.status.showDetail(detail);
        }
      }
    };

    try {
      if (this.status) {
        this.status.setLoading('Loading Doom...\nStarting engine...');
      }

      this.doomView = new DoomView(this.assetPack, this.rootPath, report);
      this.doomView.start((err?: any) => {
        if (err) {
          console.error('[doom] engine failed:', err);
          if (this.status) {
            this.status.showError(
              'Doom failed to start.\nSwipe down to exit.',
              err && err.stack ? err.stack : String(err)
            );
          }
          return;
        }
        // Only dismiss once frames are actually on screen.
        if (this.status) {
          this.status.dismiss();
          this.status = null;
        }
      });
    } catch (err) {
      console.error('[doom] open failed:', err);
      if (this.status) {
        this.status.showError(
          'Doom failed to open.\nSwipe down to exit.',
          err && err.stack ? err.stack : String(err)
        );
      }
    }
  }
}

module.exports = DoomSkill;
