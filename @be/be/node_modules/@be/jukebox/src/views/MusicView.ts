import { Album, Track } from '../models/MusicLibrary';
import {
  fileToBlobUrl,
  getNodeRequire,
  mimeForFormat,
  PlayableSource
} from '../audio/AudioSupport';

interface CoverSlot {
  root: HTMLDivElement;
  frame: HTMLDivElement;
  img: HTMLImageElement;
  placeholder: HTMLDivElement;
  albumId: string;
}

/**
 * Touchscreen jukebox UI with a transform-driven album carousel
 * (finger-follow + snap) and a track list. Built to avoid Chromium drag/select
 * and to keep cover images cached instead of rebuilding DOM on every swipe.
 */
export default class MusicView {

  private static COVER = 280;
  private static STRIDE = 340;
  private static STAGE_W = 1000;
  private static SNAP_MS = 280;

  private albums: Album[];
  private scanDetail: string;
  private albumIndex: number = 0;
  private tracks: Track[] = [];
  private trackIndex: number = -1;
  private screen: 'albums' | 'tracks' = 'albums';

  private audio: HTMLAudioElement;
  private root: HTMLDivElement;

  private albumsScreen: HTMLDivElement;
  private tracksScreen: HTMLDivElement;
  private stageEl: HTMLDivElement;
  private stripEl: HTMLDivElement;
  private slots: CoverSlot[] = [];
  private albumTitleEl: HTMLDivElement;
  private albumMetaEl: HTMLDivElement;
  private trackListEl: HTMLDivElement;
  private trackContentEl: HTMLDivElement;
  private trackHeaderTitle: HTMLDivElement;
  private trackHeaderCover: HTMLImageElement;
  private trackRowEls: HTMLDivElement[] = [];
  private trackNameEls: HTMLSpanElement[] = [];
  private trackBadgeEls: HTMLSpanElement[] = [];
  private trackNumEls: HTMLSpanElement[] = [];

  private nowPlayingEl: HTMLDivElement;
  private statusEl: HTMLDivElement;
  private playPauseBtn: HTMLDivElement;
  private currentTimeEl: HTMLSpanElement;
  private totalTimeEl: HTMLSpanElement;
  private progressTrack: HTMLDivElement;
  private progressFill: HTMLDivElement;
  private controlsBar: HTMLDivElement;

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchMoved: boolean = false;
  private touchActive: boolean = false;
  private dragOffset: number = 0;
  private baseTranslate: number = 0;
  private animating: boolean = false;
  private progressRaf: number = 0;
  private lastTimeText: string = '';
  private lastTotalText: string = '';
  private lastProgressPct: number = -1;

  // Track-list natural scroll (finger-follow + inertia).
  private listY: number = 0;
  private listTouchActive: boolean = false;
  private listMoved: boolean = false;
  private listStartY: number = 0;
  private listStartX: number = 0;
  private listStartTranslate: number = 0;
  private listLastY: number = 0;
  private listLastT: number = 0;
  private listVelocity: number = 0;
  private listMomentumRaf: number = 0;
  private listViewportH: number = 406;
  private static ROW_H = 78;

  private objectUrl: string = null;
  private playToken: number = 0;

  constructor (albums: Album[], scanDetail?: string) {
    this.albums = albums || [];
    this.scanDetail = scanDetail || '';
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.preloadCovers();
    this.build();
    this.bindAudio();
    this.showAlbums();
  }

  public cleanup (): void {
    try {
      this.playToken++;
      if (this.progressRaf) { cancelAnimationFrame(this.progressRaf); }
      if (this.listMomentumRaf) { cancelAnimationFrame(this.listMomentumRaf); }
      this.revokeObjectUrl();
      if (this.audio) {
        this.audio.pause();
        this.audio.src = '';
      }
    } catch (e) { /* no-op */ }
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
  }

  // ---- shell --------------------------------------------------------------

  private build (): void {
    this.root = document.createElement('div');
    this.root.id = 'jukebox-root';
    this.applyStyle(this.root, {
      position: 'absolute', left: '0', top: '0', width: '1280px', height: '720px',
      zIndex: '99999',
      background: 'linear-gradient(180deg, #12151c 0%, #0a0c10 55%, #07080b 100%)',
      color: '#f2f4f7',
      fontFamily: '"Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif',
      userSelect: 'none',
      overflow: 'hidden',
      cursor: 'default'
    });
    this.lockBrowserChrome(this.root);

    const wash = document.createElement('div');
    this.applyStyle(wash, {
      position: 'absolute', left: '-80px', top: '-120px', width: '520px', height: '320px',
      background: 'radial-gradient(circle, rgba(232,114,58,0.18) 0%, rgba(232,114,58,0) 70%)',
      pointerEvents: 'none'
    });
    this.root.appendChild(wash);

    this.root.appendChild(this.buildAlbumsScreen());
    this.root.appendChild(this.buildTracksScreen());
    this.controlsBar = this.buildControls();
    this.root.appendChild(this.controlsBar);

    const face = document.getElementById('face');
    const host = face || document.body || document.documentElement;
    if (!host) {
      throw new Error('No DOM host (#face / body) available to mount the player.');
    }
    if (!face) {
      this.root.style.position = 'fixed';
    }
    host.appendChild(this.root);
  }

  private lockBrowserChrome (el: HTMLElement): void {
    const css = el.style as any;
    css.webkitUserSelect = 'none';
    css.userSelect = 'none';
    css.webkitTouchCallout = 'none';
    css.webkitUserDrag = 'none';
    css.touchAction = 'none';
    css.mozUserSelect = 'none';
    css.msUserSelect = 'none';
    el.addEventListener('selectstart', (e) => { e.preventDefault(); return false; }, false);
    el.addEventListener('dragstart', (e) => { e.preventDefault(); return false; }, false);
    el.addEventListener('contextmenu', (e) => { e.preventDefault(); return false; }, false);
  }

  /** Warm the image cache so swipes do not hitch on decode. */
  private preloadCovers (): void {
    for (let i = 0; i < this.albums.length; i++) {
      const url = this.albums[i].coverUrl;
      if (!url) { continue; }
      const img = new Image();
      img.src = url;
    }
  }

  // ---- albums screen ------------------------------------------------------

  private buildAlbumsScreen (): HTMLDivElement {
    this.albumsScreen = document.createElement('div');
    this.applyStyle(this.albumsScreen, {
      position: 'absolute', left: '0', top: '0', width: '100%', height: '100%'
    });
    this.lockBrowserChrome(this.albumsScreen);

    const header = document.createElement('div');
    this.applyStyle(header, {
      position: 'absolute', left: '56px', top: '28px', right: '56px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'
    });

    const brand = document.createElement('div');
    const brandName = document.createElement('div');
    this.applyStyle(brandName, {
      fontSize: '44px', fontWeight: '700', letterSpacing: '1px', lineHeight: '1'
    });
    brandName.textContent = 'Jukebox';
    brand.appendChild(brandName);

    const brandSub = document.createElement('div');
    this.applyStyle(brandSub, {
      marginTop: '8px', fontSize: '18px', color: 'rgba(242,244,247,0.55)'
    });
    brandSub.textContent = 'Swipe covers left or right, then tap to open';
    brand.appendChild(brandSub);
    header.appendChild(brand);

    const count = document.createElement('div');
    this.applyStyle(count, {
      fontSize: '22px', color: 'rgba(242,244,247,0.55)', marginBottom: '4px'
    });
    count.textContent = this.albums.length === 1
      ? '1 album'
      : (this.albums.length + ' albums');
    header.appendChild(count);
    this.albumsScreen.appendChild(header);

    if (this.albums.length === 0) {
      const empty = document.createElement('div');
      this.applyStyle(empty, {
        position: 'absolute', left: '56px', right: '56px', top: '200px',
        fontSize: '26px', lineHeight: '1.45', color: 'rgba(242,244,247,0.72)',
        whiteSpace: 'pre-wrap', overflow: 'auto', bottom: '40px'
      });
      empty.textContent =
        'No albums found.\n\n' +
        'Need: music/<Album>/*.opus (or .mp3/.ogg)\n' +
        'Also OK: music/<Artist>/<Album>/*.opus\n\n' +
        (this.scanDetail || '(no scan detail)');
      this.albumsScreen.appendChild(empty);
      return this.albumsScreen;
    }

    const navLeft = this.buildNavButton('Prev', () => this.shiftAlbum(-1));
    this.applyStyle(navLeft, { position: 'absolute', left: '28px', top: '300px', zIndex: '2' });
    this.albumsScreen.appendChild(navLeft);

    const navRight = this.buildNavButton('Next', () => this.shiftAlbum(1));
    this.applyStyle(navRight, { position: 'absolute', right: '28px', top: '300px', zIndex: '2' });
    this.albumsScreen.appendChild(navRight);

    this.stageEl = document.createElement('div');
    this.applyStyle(this.stageEl, {
      position: 'absolute',
      left: ((1280 - MusicView.STAGE_W) / 2) + 'px',
      top: '130px',
      width: MusicView.STAGE_W + 'px',
      height: '360px',
      overflow: 'hidden'
    });
    this.lockBrowserChrome(this.stageEl);
    this.bindAlbumSwipe(this.stageEl);
    this.albumsScreen.appendChild(this.stageEl);

    this.stripEl = document.createElement('div');
    this.applyStyle(this.stripEl, {
      position: 'absolute', left: '0', top: '40px',
      width: (MusicView.STRIDE * 3) + 'px',
      height: (MusicView.COVER + 20) + 'px',
      willChange: 'transform'
    });
    (this.stripEl.style as any).webkitTransform = 'translate3d(0,0,0)';
    this.stageEl.appendChild(this.stripEl);

    // Three persistent slots: prev / current / next
    for (let i = 0; i < 3; i++) {
      const slot = this.createCoverSlot();
      slot.root.style.left = (i * MusicView.STRIDE) + 'px';
      this.stripEl.appendChild(slot.root);
      this.slots.push(slot);
    }

    this.syncSlots(false);
    this.setStripTranslate(this.restTranslate(), false);

    this.albumTitleEl = document.createElement('div');
    this.applyStyle(this.albumTitleEl, {
      position: 'absolute', left: '120px', right: '120px', top: '510px',
      textAlign: 'center', fontSize: '36px', fontWeight: '700',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
    });
    this.albumsScreen.appendChild(this.albumTitleEl);

    this.albumMetaEl = document.createElement('div');
    this.applyStyle(this.albumMetaEl, {
      position: 'absolute', left: '120px', right: '120px', top: '556px',
      textAlign: 'center', fontSize: '20px', color: 'rgba(242,244,247,0.55)'
    });
    this.albumsScreen.appendChild(this.albumMetaEl);

    const openBtn = this.buildButton('Open album', () => this.openSelectedAlbum(), true);
    this.applyStyle(openBtn, {
      position: 'absolute', left: '50%', bottom: '36px',
      transform: 'translateX(-50%)'
    });
    this.albumsScreen.appendChild(openBtn);

    this.updateAlbumCaption();
    return this.albumsScreen;
  }

  private createCoverSlot (): CoverSlot {
    const root = document.createElement('div');
    this.applyStyle(root, {
      position: 'absolute', top: '0', width: MusicView.COVER + 'px',
      height: MusicView.COVER + 'px', textAlign: 'center'
    });

    const frame = document.createElement('div');
    this.applyStyle(frame, {
      width: '100%', height: '100%', borderRadius: '12px',
      overflow: 'hidden', background: '#1a1e28',
      border: '2px solid rgba(255,255,255,0.08)',
      boxSizing: 'border-box',
      transform: 'scale(0.78)',
      opacity: '0.45',
      transition: 'transform ' + MusicView.SNAP_MS + 'ms ease-out, opacity ' +
        MusicView.SNAP_MS + 'ms ease-out, border-color ' + MusicView.SNAP_MS + 'ms ease-out'
    });
    (frame.style as any).webkitTransform = 'scale(0.78)';
    root.appendChild(frame);

    const img = document.createElement('img');
    img.draggable = false;
    img.alt = '';
    this.applyStyle(img, {
      width: '100%', height: '100%', objectFit: 'cover', display: 'none',
      pointerEvents: 'none'
    });
    (img.style as any).webkitUserDrag = 'none';
    frame.appendChild(img);

    const placeholder = document.createElement('div');
    this.applyStyle(placeholder, {
      position: 'absolute', left: '0', top: '0', width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', boxSizing: 'border-box',
      fontSize: '26px', fontWeight: '700', textAlign: 'center',
      color: 'rgba(242,244,247,0.75)',
      background: 'linear-gradient(145deg, #2a3140 0%, #151922 100%)',
      pointerEvents: 'none'
    });
    frame.appendChild(placeholder);
    // Make frame position relative for absolute placeholder
    frame.style.position = 'relative';

    return { root, frame, img, placeholder, albumId: '' };
  }

  private restTranslate (): number {
    // Center the middle slot (index 1) in the stage.
    return (MusicView.STAGE_W - MusicView.COVER) / 2 - MusicView.STRIDE;
  }

  private setStripTranslate (x: number, animate: boolean): void {
    this.baseTranslate = x;
    const css = this.stripEl.style as any;
    if (animate) {
      css.transition = 'transform ' + MusicView.SNAP_MS + 'ms cubic-bezier(0.22, 0.61, 0.36, 1)';
      css.webkitTransition = '-webkit-transform ' + MusicView.SNAP_MS +
        'ms cubic-bezier(0.22, 0.61, 0.36, 1)';
    } else {
      css.transition = 'none';
      css.webkitTransition = 'none';
    }
    const value = 'translate3d(' + x + 'px,0,0)';
    css.transform = value;
    css.webkitTransform = value;
  }

  private syncSlots (animateFocus: boolean): void {
    if (!this.albums.length) { return; }
    const offsets = [-1, 0, 1];
    for (let s = 0; s < 3; s++) {
      const slot = this.slots[s];
      if (this.albums.length === 1 && offsets[s] !== 0) {
        slot.root.style.visibility = 'hidden';
        continue;
      }
      slot.root.style.visibility = 'visible';
      const idx = (this.albumIndex + offsets[s] + this.albums.length * 50) % this.albums.length;
      this.fillSlot(slot, this.albums[idx]);
      this.setSlotFocus(slot, offsets[s] === 0, animateFocus);
    }
  }

  private fillSlot (slot: CoverSlot, album: Album): void {
    if (slot.albumId === album.id) { return; }
    slot.albumId = album.id;
    slot.placeholder.textContent = album.title;

    if (album.coverUrl) {
      // Only touch src when it changes — avoids decode/layout thrash.
      if (slot.img.getAttribute('data-src') !== album.coverUrl) {
        slot.img.setAttribute('data-src', album.coverUrl);
        slot.img.style.display = 'none';
        slot.placeholder.style.display = 'flex';
        slot.img.onload = () => {
          slot.img.style.display = 'block';
          slot.placeholder.style.display = 'none';
        };
        slot.img.onerror = () => {
          slot.img.style.display = 'none';
          slot.placeholder.style.display = 'flex';
        };
        slot.img.src = album.coverUrl;
      }
    } else {
      slot.img.removeAttribute('data-src');
      slot.img.removeAttribute('src');
      slot.img.style.display = 'none';
      slot.placeholder.style.display = 'flex';
    }
  }

  private setSlotFocus (slot: CoverSlot, focused: boolean, animate: boolean): void {
    this.setSlotFocusAmount(slot, focused ? 1 : 0, animate);
  }

  /** focusAmount 0 = side cover, 1 = centered cover. */
  private setSlotFocusAmount (slot: CoverSlot, focusAmount: number, animate: boolean): void {
    const t = Math.max(0, Math.min(1, focusAmount));
    const scale = 0.78 + 0.22 * t;
    const opacity = 0.45 + 0.55 * t;
    const css = slot.frame.style as any;
    if (!animate) {
      css.transition = 'none';
      css.webkitTransition = 'none';
    } else {
      css.transition = 'transform ' + MusicView.SNAP_MS + 'ms ease-out, opacity ' +
        MusicView.SNAP_MS + 'ms ease-out, border-color ' + MusicView.SNAP_MS + 'ms ease-out';
      css.webkitTransition = '-webkit-transform ' + MusicView.SNAP_MS +
        'ms ease-out, opacity ' + MusicView.SNAP_MS + 'ms ease-out, border-color ' +
        MusicView.SNAP_MS + 'ms ease-out';
    }
    css.transform = 'scale(' + scale + ')';
    css.webkitTransform = 'scale(' + scale + ')';
    css.opacity = String(opacity);
    css.border = t > 0.6 ? '3px solid #e8723a' : '2px solid rgba(255,255,255,0.08)';
  }

  /** Shift visual focus toward the neighboring cover while the finger moves. */
  private applyDragFocus (dx: number): void {
    if (!this.slots.length) { return; }
    const t = -dx / MusicView.STRIDE; // swipe left (dx<0) -> t>0 -> next gains focus
    const offsets = [-1, 0, 1];
    for (let s = 0; s < 3; s++) {
      const dist = Math.abs(offsets[s] - t);
      const amount = Math.max(0, 1 - Math.min(dist, 1));
      this.setSlotFocusAmount(this.slots[s], amount, false);
    }
  }

  private animateShift (delta: number): void {
    if (this.animating || !this.albums.length) { return; }
    this.animating = true;
    const target = this.restTranslate() - (delta * MusicView.STRIDE);
    // Animate focus toward the destination during the snap
    this.applyDragFocus(-delta * MusicView.STRIDE);
    this.setStripTranslate(target, true);

    setTimeout(() => {
      this.albumIndex = (this.albumIndex + delta + this.albums.length) % this.albums.length;
      this.syncSlots(false);
      this.setStripTranslate(this.restTranslate(), false);
      this.updateAlbumCaption();
      this.syncSlots(true);
      this.animating = false;
    }, MusicView.SNAP_MS);
  }

  private bindAlbumSwipe (el: HTMLElement): void {
    const onStart = (x: number, y: number) => {
      if (this.animating) { return; }
      this.touchActive = true;
      this.touchMoved = false;
      this.touchStartX = x;
      this.touchStartY = y;
      this.dragOffset = 0;
      this.setStripTranslate(this.restTranslate(), false);
    };

    const onMove = (x: number, y: number, e: Event) => {
      if (!this.touchActive || this.animating) { return; }
      const dx = x - this.touchStartX;
      const dy = y - this.touchStartY;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        this.touchMoved = true;
      }
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
        e.preventDefault();
        this.dragOffset = dx;
        this.setStripTranslate(this.restTranslate() + dx, false);
        // Live focus shift while dragging
        this.applyDragFocus(dx);
      }
    };

    const onEnd = (x: number) => {
      if (!this.touchActive) { return; }
      this.touchActive = false;
      const dx = x - this.touchStartX;
      if (Math.abs(dx) > 70 && this.albums.length > 1) {
        this.touchMoved = true;
        this.animateShift(dx < 0 ? 1 : -1);
      } else {
        this.setStripTranslate(this.restTranslate(), true);
        this.applyDragFocus(0);
        this.syncSlots(true);
      }
    };

    el.addEventListener('touchstart', (e: any) => {
      const t = e.touches && e.touches[0];
      if (t) { onStart(t.clientX, t.clientY); }
    }, false);
    el.addEventListener('touchmove', (e: any) => {
      const t = e.touches && e.touches[0];
      if (t) { onMove(t.clientX, t.clientY, e); }
    }, false);
    el.addEventListener('touchend', (e: any) => {
      const t = e.changedTouches && e.changedTouches[0];
      onEnd(t ? t.clientX : this.touchStartX);
    }, false);
    el.addEventListener('touchcancel', () => { this.touchActive = false; }, false);

    el.addEventListener('mousedown', (e: any) => { onStart(e.clientX, e.clientY); }, false);
    el.addEventListener('mousemove', (e: any) => {
      if (!this.touchActive) { return; }
      onMove(e.clientX, e.clientY, e);
    }, false);
    el.addEventListener('mouseup', (e: any) => { onEnd(e.clientX); }, false);
    el.addEventListener('mouseleave', () => {
      if (this.touchActive) {
        this.touchActive = false;
        this.setStripTranslate(this.restTranslate(), true);
      }
    }, false);

    // Tap center cover to open
    el.addEventListener('click', () => {
      if (this.touchMoved || this.animating) { return; }
      this.openSelectedAlbum();
    }, false);
  }

  private shiftAlbum (delta: number): void {
    if (!this.albums.length || this.animating) { return; }
    this.animateShift(delta);
  }

  private updateAlbumCaption (): void {
    const album = this.albums[this.albumIndex];
    if (!album) { return; }
    if (this.albumTitleEl) { this.albumTitleEl.textContent = album.title; }
    if (this.albumMetaEl) {
      const n = album.tracks.length;
      this.albumMetaEl.textContent = n === 1
        ? '1 track  ·  Swipe or use Prev/Next'
        : (n + ' tracks  ·  Swipe or use Prev/Next');
    }
  }

  private openSelectedAlbum (): void {
    const album = this.albums[this.albumIndex];
    if (!album) { return; }
    this.tracks = album.tracks;
    this.trackIndex = -1;
    this.showTracks(album);
  }

  private buildNavButton (label: string, onClick: () => void): HTMLDivElement {
    const btn = document.createElement('div');
    this.applyStyle(btn, {
      minWidth: '100px', height: '64px', padding: '0 22px',
      borderRadius: '10px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', cursor: 'pointer',
      fontSize: '22px', fontWeight: '700',
      background: 'rgba(255,255,255,0.1)',
      color: '#f2f4f7',
      border: '1px solid rgba(255,255,255,0.14)',
      boxSizing: 'border-box'
    });
    btn.textContent = label;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return btn;
  }

  // ---- tracks screen ------------------------------------------------------

  private buildTracksScreen (): HTMLDivElement {
    this.tracksScreen = document.createElement('div');
    this.applyStyle(this.tracksScreen, {
      position: 'absolute', left: '0', top: '0', width: '100%', height: '100%',
      display: 'none'
    });

    const backBtn = this.buildButton('Albums', () => this.showAlbums(), false);
    this.applyStyle(backBtn, {
      position: 'absolute', left: '40px', top: '28px', zIndex: '3'
    });
    this.tracksScreen.appendChild(backBtn);

    this.trackHeaderCover = document.createElement('img');
    this.trackHeaderCover.draggable = false;
    this.applyStyle(this.trackHeaderCover, {
      position: 'absolute', left: '200px', top: '22px',
      width: '72px', height: '72px', borderRadius: '8px',
      objectFit: 'cover', background: '#1a1e28',
      border: '1px solid rgba(255,255,255,0.1)',
      pointerEvents: 'none'
    });
    (this.trackHeaderCover.style as any).webkitUserDrag = 'none';
    this.tracksScreen.appendChild(this.trackHeaderCover);

    this.trackHeaderTitle = document.createElement('div');
    this.applyStyle(this.trackHeaderTitle, {
      position: 'absolute', left: '290px', top: '34px', right: '56px',
      fontSize: '34px', fontWeight: '700',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
    });
    this.tracksScreen.appendChild(this.trackHeaderTitle);

    this.trackListEl = document.createElement('div');
    this.applyStyle(this.trackListEl, {
      position: 'absolute', left: '48px', top: '114px', right: '48px',
      bottom: '200px', overflow: 'hidden', borderRadius: '12px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      boxSizing: 'border-box'
    });
    this.lockBrowserChrome(this.trackListEl);
    (this.trackListEl.style as any).touchAction = 'none';

    this.trackContentEl = document.createElement('div');
    this.applyStyle(this.trackContentEl, {
      position: 'absolute', left: '0', top: '0', width: '100%',
      willChange: 'transform'
    });
    (this.trackContentEl.style as any).webkitTransform = 'translate3d(0,0,0)';
    this.trackListEl.appendChild(this.trackContentEl);
    this.bindTrackListScroll(this.trackListEl);
    this.tracksScreen.appendChild(this.trackListEl);

    return this.tracksScreen;
  }

  /**
   * Natural touch scrolling: content follows the finger.
   * Swipe up -> list moves up -> you go further down the track list.
   * Includes light inertia after release.
   */
  private bindTrackListScroll (viewport: HTMLElement): void {
    const onStart = (x: number, y: number) => {
      this.stopListMomentum();
      this.listTouchActive = true;
      this.listMoved = false;
      this.listStartX = x;
      this.listStartY = y;
      this.listLastY = y;
      this.listLastT = Date.now();
      this.listVelocity = 0;
      this.listStartTranslate = this.listY;
    };

    const onMove = (x: number, y: number, e: Event) => {
      if (!this.listTouchActive) { return; }
      const dx = x - this.listStartX;
      const dy = y - this.listStartY;
      if (Math.abs(dy) > 6 || Math.abs(dx) > 6) {
        this.listMoved = true;
      }
      // Prefer vertical; ignore mostly-horizontal moves so album-style drags don't fight.
      if (Math.abs(dy) < Math.abs(dx) && Math.abs(dx) > 10) { return; }
      e.preventDefault();

      const now = Date.now();
      const dt = Math.max(1, now - this.listLastT);
      // Finger down (y increases) -> content moves down (translateY increases). Natural.
      const nextY = this.listStartTranslate + dy;
      this.listVelocity = (y - this.listLastY) / dt;
      this.listLastY = y;
      this.listLastT = now;
      this.setListTranslate(this.clampListY(nextY), false);
    };

    const onEnd = () => {
      if (!this.listTouchActive) { return; }
      this.listTouchActive = false;
      this.setListTranslate(this.clampListY(this.listY), false);
      // px/ms -> keep inertia going for a short coast
      if (Math.abs(this.listVelocity) > 0.05) {
        this.startListMomentum(this.listVelocity * 16); // ~per-frame pixels
      }
    };

    viewport.addEventListener('touchstart', (e: any) => {
      const t = e.touches && e.touches[0];
      if (t) { onStart(t.clientX, t.clientY); }
    }, false);
    viewport.addEventListener('touchmove', (e: any) => {
      const t = e.touches && e.touches[0];
      if (t) { onMove(t.clientX, t.clientY, e); }
    }, false);
    viewport.addEventListener('touchend', () => { onEnd(); }, false);
    viewport.addEventListener('touchcancel', () => { onEnd(); }, false);

    viewport.addEventListener('mousedown', (e: any) => {
      onStart(e.clientX, e.clientY);
    }, false);
    viewport.addEventListener('mousemove', (e: any) => {
      if (!this.listTouchActive) { return; }
      onMove(e.clientX, e.clientY, e);
    }, false);
    viewport.addEventListener('mouseup', () => { onEnd(); }, false);
    viewport.addEventListener('mouseleave', () => {
      if (this.listTouchActive) { onEnd(); }
    }, false);
  }

  private setListTranslate (y: number, animate: boolean): void {
    this.listY = y;
    if (!this.trackContentEl) { return; }
    const css = this.trackContentEl.style as any;
    if (animate) {
      css.transition = 'transform 180ms ease-out';
      css.webkitTransition = '-webkit-transform 180ms ease-out';
    } else {
      css.transition = 'none';
      css.webkitTransition = 'none';
    }
    const value = 'translate3d(0,' + y + 'px,0)';
    css.transform = value;
    css.webkitTransform = value;
  }

  private clampListY (y: number): number {
    const minY = this.listMinY();
    if (y > 0) { return 0; }
    if (y < minY) { return minY; }
    return y;
  }

  private listMinY (): number {
    const contentH = this.visibleTrackCount() * MusicView.ROW_H;
    const viewH = this.listViewportH || this.trackListEl.clientHeight || 406;
    if (contentH <= viewH) { return 0; }
    return viewH - contentH;
  }

  private visibleTrackCount (): number {
    let n = 0;
    for (let i = 0; i < this.trackRowEls.length; i++) {
      if (this.trackRowEls[i] && this.trackRowEls[i].style.display !== 'none') { n++; }
    }
    return n;
  }

  private startListMomentum (velocityPxPerFrame: number): void {
    this.stopListMomentum();
    let v = velocityPxPerFrame;
    const friction = 0.95;
    const step = () => {
      v *= friction;
      if (Math.abs(v) < 0.3) {
        this.listMomentumRaf = 0;
        this.setListTranslate(this.clampListY(this.listY), true);
        return;
      }
      this.setListTranslate(this.clampListY(this.listY + v), false);
      // Bounce softly at edges by killing velocity
      if (this.listY === 0 || this.listY === this.listMinY()) {
        v = 0;
      }
      const raf = typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (cb: any) => setTimeout(cb, 16);
      this.listMomentumRaf = raf(step) as any;
    };
    const raf = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (cb: any) => setTimeout(cb, 16);
    this.listMomentumRaf = raf(step) as any;
  }

  private stopListMomentum (): void {
    if (this.listMomentumRaf) {
      try { cancelAnimationFrame(this.listMomentumRaf); } catch (e) { /* no-op */ }
      this.listMomentumRaf = 0;
    }
  }

  private populateTrackList (album: Album): void {
    this.stopListMomentum();
    const needed = album.tracks.length;
    while (this.trackRowEls.length < needed) {
      const i = this.trackRowEls.length;
      const row = this.buildTrackRow(i);
      this.trackContentEl.appendChild(row);
    }
    for (let i = 0; i < this.trackRowEls.length; i++) {
      const row = this.trackRowEls[i];
      if (i < needed) {
        const track = album.tracks[i];
        this.trackNumEls[i].textContent = String(i + 1);
        this.trackNameEls[i].textContent = track.title;
        this.trackBadgeEls[i].textContent = track.format || '';
        row.style.display = 'flex';
      } else {
        row.style.display = 'none';
      }
    }
    // Measure viewport after layout and reset scroll to top.
    this.listViewportH = this.trackListEl.clientHeight || 406;
    this.setListTranslate(0, false);
  }

  private buildTrackRow (i: number): HTMLDivElement {
    const row = document.createElement('div');
    this.applyStyle(row, {
      display: 'flex', alignItems: 'center', height: MusicView.ROW_H + 'px',
      padding: '0 28px', boxSizing: 'border-box', fontSize: '28px',
      cursor: 'pointer',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    });

    const num = document.createElement('span');
    this.applyStyle(num, {
      width: '48px', color: 'rgba(242,244,247,0.38)', fontSize: '22px',
      flex: '0 0 auto', fontVariantNumeric: 'tabular-nums'
    });
    row.appendChild(num);

    const name = document.createElement('span');
    this.applyStyle(name, {
      flex: '1 1 auto', whiteSpace: 'nowrap', overflow: 'hidden',
      textOverflow: 'ellipsis', paddingRight: '20px'
    });
    row.appendChild(name);

    const badge = document.createElement('span');
    this.applyStyle(badge, {
      flex: '0 0 auto', fontSize: '16px', letterSpacing: '1px',
      padding: '6px 12px', borderRadius: '6px',
      background: 'rgba(255,255,255,0.08)',
      color: 'rgba(242,244,247,0.7)', fontWeight: '600'
    });
    row.appendChild(badge);

    row.addEventListener('click', (e) => {
      // Ignore the click that follows a scroll gesture.
      if (this.listMoved) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      this.selectTrack(i);
    });
    this.trackRowEls[i] = row;
    this.trackNumEls[i] = num;
    this.trackNameEls[i] = name;
    this.trackBadgeEls[i] = badge;
    return row;
  }

  // ---- shared playback controls -------------------------------------------

  private buildControls (): HTMLDivElement {
    const bar = document.createElement('div');
    this.applyStyle(bar, {
      position: 'absolute', left: '0', bottom: '0', width: '100%', height: '180px',
      boxSizing: 'border-box', padding: '18px 56px 24px',
      background: 'linear-gradient(180deg, rgba(10,12,16,0) 0%, rgba(10,12,16,0.95) 24%, #0a0c10 100%)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'none', zIndex: '5'
    });

    const meta = document.createElement('div');
    this.applyStyle(meta, {
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: '12px'
    });

    this.nowPlayingEl = document.createElement('div');
    this.applyStyle(this.nowPlayingEl, {
      flex: '1 1 auto', fontSize: '26px', fontWeight: '600', whiteSpace: 'nowrap',
      overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '24px'
    });
    this.nowPlayingEl.textContent = 'Nothing playing';
    meta.appendChild(this.nowPlayingEl);

    this.statusEl = document.createElement('div');
    this.applyStyle(this.statusEl, {
      flex: '0 0 auto', fontSize: '18px', letterSpacing: '1px',
      color: 'rgba(242,244,247,0.45)', textTransform: 'uppercase'
    });
    this.statusEl.textContent = 'Ready';
    meta.appendChild(this.statusEl);
    bar.appendChild(meta);

    const progressRow = document.createElement('div');
    this.applyStyle(progressRow, { display: 'flex', alignItems: 'center', marginBottom: '14px' });

    this.currentTimeEl = document.createElement('span');
    this.applyStyle(this.currentTimeEl, {
      width: '72px', fontSize: '20px', flex: '0 0 auto',
      fontVariantNumeric: 'tabular-nums', color: 'rgba(242,244,247,0.7)'
    });
    this.currentTimeEl.textContent = '0:00';
    progressRow.appendChild(this.currentTimeEl);

    this.progressTrack = document.createElement('div');
    this.applyStyle(this.progressTrack, {
      position: 'relative', flex: '1 1 auto', height: '10px', margin: '0 18px',
      background: 'rgba(255,255,255,0.12)', borderRadius: '5px', cursor: 'pointer'
    });
    this.progressFill = document.createElement('div');
    this.applyStyle(this.progressFill, {
      position: 'absolute', left: '0', top: '0', height: '100%', width: '0%',
      background: '#e8723a', borderRadius: '5px',
      willChange: 'width'
    });
    this.progressTrack.appendChild(this.progressFill);
    this.progressTrack.addEventListener('click', (e) => this.onSeek(e));
    progressRow.appendChild(this.progressTrack);

    this.totalTimeEl = document.createElement('span');
    this.applyStyle(this.totalTimeEl, {
      width: '72px', fontSize: '20px', flex: '0 0 auto', textAlign: 'right',
      fontVariantNumeric: 'tabular-nums', color: 'rgba(242,244,247,0.7)'
    });
    this.totalTimeEl.textContent = '0:00';
    progressRow.appendChild(this.totalTimeEl);
    bar.appendChild(progressRow);

    const controls = document.createElement('div');
    this.applyStyle(controls, {
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    });
    controls.appendChild(this.buildButton('Prev', () => this.prevTrack(), false));
    this.playPauseBtn = this.buildButton('Play', () => this.togglePlay(), true);
    controls.appendChild(this.playPauseBtn);
    controls.appendChild(this.buildButton('Next', () => this.nextTrack(), false));
    bar.appendChild(controls);

    return bar;
  }

  private buildButton (label: string, onClick: () => void, primary: boolean): HTMLDivElement {
    const btn = document.createElement('div');
    this.applyStyle(btn, {
      minWidth: primary ? '150px' : '110px',
      height: primary ? '60px' : '52px',
      margin: '0 12px',
      padding: '0 24px',
      borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      fontSize: primary ? '24px' : '20px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      background: primary ? '#e8723a' : 'rgba(255,255,255,0.08)',
      color: primary ? '#1a0f0a' : '#f2f4f7',
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.12)',
      boxSizing: 'border-box'
    });
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  // ---- screen switching ---------------------------------------------------

  private showAlbums (): void {
    this.screen = 'albums';
    this.albumsScreen.style.display = 'block';
    this.tracksScreen.style.display = 'none';
    this.controlsBar.style.display = this.audio && !this.audio.paused && this.trackIndex >= 0
      ? 'block' : 'none';
    this.updateAlbumCaption();
    if (this.stripEl) {
      this.syncSlots(false);
      this.setStripTranslate(this.restTranslate(), false);
      this.syncSlots(true);
    }
  }

  private showTracks (album: Album): void {
    this.screen = 'tracks';
    // Switch screens first so the UI feels instant; fill the list on the next frame.
    this.albumsScreen.style.display = 'none';
    this.tracksScreen.style.display = 'block';
    this.controlsBar.style.display = 'block';
    this.trackHeaderTitle.textContent = album.title;
    this.nowPlayingEl.textContent = 'Tap a track to play';
    this.statusEl.textContent = 'Ready';

    if (album.coverUrl) {
      this.trackHeaderCover.style.display = 'block';
      this.trackHeaderTitle.style.left = '290px';
      if (this.trackHeaderCover.getAttribute('data-src') !== album.coverUrl) {
        this.trackHeaderCover.setAttribute('data-src', album.coverUrl);
        this.trackHeaderCover.src = album.coverUrl;
      }
    } else {
      this.trackHeaderCover.removeAttribute('data-src');
      this.trackHeaderCover.removeAttribute('src');
      this.trackHeaderCover.style.display = 'none';
      this.trackHeaderTitle.style.left = '200px';
    }

    const fill = () => {
      this.populateTrackList(album);
      this.highlightActiveTrack();
    };
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(fill);
    } else {
      setTimeout(fill, 0);
    }
  }

  // ---- playback -----------------------------------------------------------

  private bindAudio (): void {
    this.audio.addEventListener('timeupdate', () => this.scheduleProgress());
    this.audio.addEventListener('loadedmetadata', () => this.paintProgress(true));
    this.audio.addEventListener('ended', () => this.nextTrack());
    this.audio.addEventListener('play', () => this.setPlaying(true));
    this.audio.addEventListener('pause', () => this.setPlaying(false));
    this.audio.addEventListener('error', () => {
      const err: any = this.audio.error;
      console.error('[jukebox] audio error for', this.audio.src,
        'code=', err && err.code, 'message=', err && err.message);
      if (this.statusEl) {
        this.statusEl.textContent = 'Error';
      }
      if (this.nowPlayingEl && err) {
        const code = err.code;
        // 4 = MEDIA_ERR_SRC_NOT_SUPPORTED
        if (code === 4) {
          this.nowPlayingEl.textContent = 'Cannot play this format on this robot';
        }
      }
    });
  }

  private revokeObjectUrl (): void {
    if (this.objectUrl) {
      try { URL.revokeObjectURL(this.objectUrl); } catch (e) { /* no-op */ }
      this.objectUrl = null;
    }
  }

  private resolvePlayable (track: Track): Promise<PlayableSource> {
    const format = (track.format || '').toUpperCase();
    const absPath = track.path;

    // Prefer reading the file into a blob URL (handles spaces / odd paths).
    // Always use Electron's Node require — never browserify's lexical require.
    if (absPath) {
      try {
        const nodeRequire = getNodeRequire();
        if (!nodeRequire) {
          return Promise.reject(new Error('Node require is not available'));
        }
        const fs = nodeRequire('fs');
        if (fs.existsSync(absPath)) {
          return Promise.resolve(fileToBlobUrl(absPath, mimeForFormat(format)));
        }
      } catch (err) {
        console.warn('[jukebox] blob path failed, falling back to asset URL', err);
        return Promise.reject(err);
      }
    }

    return Promise.resolve({ url: track.url, revoke: false });
  }

  private selectTrack (i: number): void {
    if (i < 0 || i >= this.tracks.length) { return; }
    this.trackIndex = i;
    const track = this.tracks[i];
    this.nowPlayingEl.textContent = track.title;
    this.highlightActiveTrack();
    this.controlsBar.style.display = 'block';

    const token = ++this.playToken;
    this.audio.pause();
    this.revokeObjectUrl();

    this.statusEl.textContent = 'Loading';

    this.resolvePlayable(track).then((src) => {
      if (token !== this.playToken) {
        if (src.revoke) { try { URL.revokeObjectURL(src.url); } catch (e) { /* no-op */ } }
        return;
      }
      if (src.revoke) { this.objectUrl = src.url; }
      this.audio.src = src.url;
      this.statusEl.textContent = track.format || 'Playing';
      const p: any = this.audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch((err: any) => {
          console.error('[jukebox] play() rejected:', err && err.name, err && err.message);
          this.statusEl.textContent = 'Error';
          this.nowPlayingEl.textContent = 'Playback failed: ' + (err && err.message ? err.message : 'unknown');
        });
      }
    }, (err) => {
      if (token !== this.playToken) { return; }
      console.error('[jukebox] resolvePlayable failed:', err);
      this.statusEl.textContent = 'Error';
      this.nowPlayingEl.textContent = 'Could not load track: ' + (err && err.message ? err.message : String(err));
    });
  }

  private togglePlay (): void {
    if (this.trackIndex === -1) {
      this.selectTrack(0);
      return;
    }
    if (this.audio.paused) {
      const p: any = this.audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch((err: any) => console.error('[jukebox] play() rejected:', err && err.name));
      }
    } else {
      this.audio.pause();
    }
  }

  private scheduleProgress (): void {
    if (this.progressRaf) { return; }
    const raf = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (cb: any) => setTimeout(cb, 33);
    this.progressRaf = raf(() => {
      this.progressRaf = 0;
      this.paintProgress(false);
    }) as any;
  }

  private paintProgress (force: boolean): void {
    const dur = this.audio.duration;
    const cur = this.audio.currentTime;
    const ratio = dur && !isNaN(dur) ? (cur / dur) : 0;
    const pct = Math.round(ratio * 1000) / 10;
    if (force || pct !== this.lastProgressPct) {
      this.lastProgressPct = pct;
      if (this.progressFill) { this.progressFill.style.width = pct + '%'; }
    }
    const curText = MusicView.formatTime(cur);
    if (force || curText !== this.lastTimeText) {
      this.lastTimeText = curText;
      if (this.currentTimeEl) { this.currentTimeEl.textContent = curText; }
    }
    const totText = MusicView.formatTime(dur);
    if (force || totText !== this.lastTotalText) {
      this.lastTotalText = totText;
      if (this.totalTimeEl) { this.totalTimeEl.textContent = totText; }
    }
  }

  private nextTrack (): void {
    if (!this.tracks.length) { return; }
    this.selectTrack((this.trackIndex + 1) % this.tracks.length);
  }

  private prevTrack (): void {
    if (!this.tracks.length) { return; }
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    const prev = (this.trackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.selectTrack(prev);
  }

  private onSeek (e: MouseEvent): void {
    if (!this.audio.duration || isNaN(this.audio.duration)) { return; }
    const rect = this.progressTrack.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.audio.currentTime = ratio * this.audio.duration;
    this.paintProgress(true);
  }

  private setPlaying (playing: boolean): void {
    if (this.playPauseBtn) {
      this.playPauseBtn.textContent = playing ? 'Pause' : 'Play';
    }
    if (this.statusEl && this.trackIndex >= 0 && this.tracks[this.trackIndex]) {
      const format = this.tracks[this.trackIndex].format;
      this.statusEl.textContent = playing
        ? (format ? format : 'Playing')
        : 'Paused';
    }
  }

  private highlightActiveTrack (): void {
    for (let i = 0; i < this.trackRowEls.length; i++) {
      const row = this.trackRowEls[i];
      if (!row || row.style.display === 'none') { continue; }
      if (i === this.trackIndex) {
        row.style.background = 'rgba(232,114,58,0.18)';
        row.style.boxShadow = 'inset 4px 0 0 #e8723a';
      } else {
        row.style.background = 'transparent';
        row.style.boxShadow = 'none';
      }
    }
  }

  private static formatTime (seconds: number): string {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) { return '0:00'; }
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' + s : String(s));
  }

  private applyStyle (el: HTMLElement, style: { [k: string]: string }): void {
    for (const key in style) {
      if (style.hasOwnProperty(key)) {
        (el.style as any)[key] = style[key];
      }
    }
  }
}
