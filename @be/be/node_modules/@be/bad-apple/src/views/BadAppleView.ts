import jibo = require('jibo');

const FACE_W = 1280;
const FACE_H = 720;

/**
 * Fullscreen looping Bad Apple video on document.body (same mount trick as Doom).
 */
export default class BadAppleView {

  private assetPack: string;
  private rootPath: string;
  private root: HTMLDivElement = null;
  private video: HTMLVideoElement = null;
  private status: HTMLDivElement = null;
  private cleaned: boolean = false;

  constructor (assetPack: string, rootPath: string) {
    this.assetPack = assetPack;
    this.rootPath = rootPath || '';
  }

  public start (done: (err?: any) => void): void {
    try {
      this.mountShell();
      const uri = this.resolveVideoUri();
      if (!uri) {
        this.showStatus(
          'Missing video\n\nPlace bad-apple.mp4 in:\n@be/bad-apple/video/\n\nSwipe down to exit'
        );
        done(new Error('missing bad-apple.mp4'));
        return;
      }
      this.showStatus('Loading Bad Apple…');
      this.play(uri, done);
    } catch (err) {
      this.showStatus('Failed to start\n\n' + String(err));
      done(err);
    }
  }

  public cleanup (): void {
    this.cleaned = true;
    try {
      if (this.video) {
        this.video.pause();
        this.video.removeAttribute('src');
        try { this.video.load(); } catch (e) { /* no-op */ }
        if (this.video.parentNode) { this.video.parentNode.removeChild(this.video); }
      }
    } catch (e) { /* no-op */ }
    this.video = null;
    try {
      if (this.root && this.root.parentNode) {
        this.root.parentNode.removeChild(this.root);
      }
    } catch (e) { /* no-op */ }
    this.root = null;
    this.status = null;
  }

  private mountShell (): void {
    this.root = document.createElement('div');
    this.root.id = 'bad-apple-root';
    this.applyStyle(this.root, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: FACE_W + 'px',
      height: FACE_H + 'px',
      background: '#000',
      zIndex: '99999',
      overflow: 'hidden'
    });

    this.status = document.createElement('div');
    this.applyStyle(this.status, {
      position: 'absolute',
      left: '40px',
      top: '40px',
      right: '40px',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '28px',
      whiteSpace: 'pre-wrap',
      zIndex: '3',
      textShadow: '0 2px 4px #000'
    });
    this.status.textContent = 'Bad Apple';
    this.root.appendChild(this.status);

    const hint = document.createElement('div');
    this.applyStyle(hint, {
      position: 'absolute',
      left: '40px',
      bottom: '36px',
      color: 'rgba(255,255,255,0.55)',
      fontFamily: 'monospace',
      fontSize: '20px',
      zIndex: '3'
    });
    hint.textContent = 'Swipe down to exit';
    this.root.appendChild(hint);

    document.body.appendChild(this.root);
  }

  private play (uri: string, done: (err?: any) => void): void {
    const video = document.createElement('video');
    this.video = video;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.preload = 'auto';
    video.loop = true;
    // Try unmuted first (Jibo Electron usually allows it); tap handler is the fallback.
    video.muted = false;
    video.volume = 0.20;
    this.applyStyle(video, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: FACE_W + 'px',
      height: FACE_H + 'px',
      objectFit: 'contain',
      background: '#000',
      zIndex: '1'
    });
    this.root.insertBefore(video, this.root.firstChild);

    let settled = false;
    const finish = (err?: any) => {
      if (settled || this.cleaned) { return; }
      settled = true;
      done(err);
    };

    video.addEventListener('loadeddata', () => {
      if (this.cleaned) { return; }
      this.hideStatus();
      const p = video.play();
      if (p && typeof (p as any).then === 'function') {
        (p as Promise<void>).then(() => finish()).catch((err) => {
          this.showStatus('Play blocked\nTap the screen\n\n' + String(err));
          finish(err);
        });
      } else {
        finish();
      }
    });
    video.addEventListener('error', () => {
      const msg = (video.error && (video.error as any).message)
        ? (video.error as any).message
        : ('code ' + (video.error ? video.error.code : '?'));
      this.showStatus('Video error\n\n' + msg + '\n\n' + uri);
      finish(new Error(msg));
    });

    // Tap to unmute (Electron/autoplay).
    const unmute = () => {
      try {
        video.muted = false;
        video.volume = 0.20;
        video.play();
      } catch (e) { /* no-op */ }
    };
    this.root.addEventListener('pointerdown', unmute, false);
    this.root.addEventListener('touchstart', unmute, false);

    video.src = uri;
    video.load();

    setTimeout(() => {
      if (!settled && !this.cleaned) {
        this.showStatus('Still loading…\n\n' + uri);
      }
    }, 8000);
  }

  private resolveVideoUri (): string {
    const candidates = [
      'video/bad-apple.mp4',
      'video/badapple.mp4',
      'resources/bad-apple.mp4'
    ];
    const path = require('path');
    const fs = require('fs');

    for (let i = 0; i < candidates.length; i++) {
      const rel = candidates[i];
      // Prefer PathUtils so Be resolves the asset-pack URI correctly.
      try {
        const PathUtils = (jibo as any).utils && (jibo as any).utils.PathUtils;
        if (PathUtils && typeof PathUtils.getAssetUri === 'function') {
          const uri = PathUtils.getAssetUri(rel, this.assetPack);
          if (uri) {
            // Also verify file exists when we can map to disk.
            const disk = this.resolveDiskPath(rel, path, fs);
            if (!disk || fs.existsSync(disk)) {
              return uri;
            }
          }
        }
      } catch (e) { /* fall through */ }

      const disk = this.resolveDiskPath(rel, path, fs);
      if (disk && fs.existsSync(disk)) {
        return 'file://' + disk;
      }
    }
    return '';
  }

  private resolveDiskPath (rel: string, pathMod: any, fsMod: any): string {
    const cleaned = String(rel).replace(/^\.\//, '');
    const bases = [
      this.rootPath,
      pathMod.join(__dirname),
      pathMod.join(__dirname, '..'),
      pathMod.join(__dirname, '..', '..')
    ];
    for (let i = 0; i < bases.length; i++) {
      if (!bases[i]) { continue; }
      const full = pathMod.join(bases[i], cleaned);
      try {
        if (fsMod.existsSync(full)) { return full; }
      } catch (e) { /* no-op */ }
    }
    return '';
  }

  private showStatus (text: string): void {
    if (!this.status) { return; }
    this.status.style.display = 'block';
    this.status.textContent = text;
  }

  private hideStatus (): void {
    if (!this.status) { return; }
    this.status.style.display = 'none';
  }

  private applyStyle (el: HTMLElement, props: { [k: string]: string }): void {
    for (const key in props) {
      if (props.hasOwnProperty(key)) {
        (el.style as any)[key] = props[key];
      }
    }
  }
}
