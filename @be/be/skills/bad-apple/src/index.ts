/// <reference path="../typings-local/index.d.ts" />

import { BeSkill } from '@be/be-framework';
import jibo = require('jibo');

import BadAppleView from './views/BadAppleView';

/**
 * Bad Apple!! — fullscreen PV on Jibo's face. Swipe down to exit.
 */
class BadAppleSkill extends BeSkill {

  private view: BadAppleView = null;
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

    try {
      const banner = document.getElementById('menu-redirect-banner');
      if (banner && banner.parentNode) { banner.parentNode.removeChild(banner); }
    } catch (e) { /* no-op */ }

    const self = this;
    setTimeout(() => {
      try {
        self.view = new BadAppleView(self.assetPack, self.rootPath);
        self.view.start((err?: any) => {
          if (err) {
            console.error('[bad-apple] start failed:', err);
          }
        });
      } catch (err) {
        console.error('[bad-apple] open failed:', err);
      }
    }, 50);
  }

  public close (done: () => void): void {
    this.unsubscribeSwipeDown();
    if (this.view) {
      try { this.view.cleanup(); } catch (e) { /* no-op */ }
      this.view = null;
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
}

export = BadAppleSkill;
