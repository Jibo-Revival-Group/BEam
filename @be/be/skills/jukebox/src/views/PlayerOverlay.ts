import { Album, Track } from '../models/MusicLibrary';
import {
  fileToBlobUrl,
  mimeForFormat,
  PlayableSource
} from '../audio/AudioSupport';
import LyricsService, { LyricsResult } from '../lyrics/LyricsService';

/**
 * Now-playing chrome on #face: lyrics (or cover) on the left,
 * track/album/artist details and transport on the right.
 */
export default class PlayerOverlay {

  private root: HTMLDivElement = null;
  private leftPanel: HTMLDivElement;
  private coverWrap: HTMLDivElement;
  private coverImg: HTMLImageElement;
  private coverPlaceholder: HTMLDivElement;
  private lyricsWrap: HTMLDivElement;
  private lyricsScroll: HTMLDivElement;
  private lyricsStatusEl: HTMLDivElement;
  private trackTitleEl: HTMLDivElement;
  private albumEl: HTMLDivElement;
  private artistEl: HTMLDivElement;
  private statusEl: HTMLDivElement;
  private playPauseBtn: HTMLDivElement;
  private playPauseIcon: SVGElement;
  private currentTimeEl: HTMLSpanElement;
  private totalTimeEl: HTMLSpanElement;
  private progressTrack: HTMLDivElement;
  private progressFill: HTMLDivElement;

  private audio: HTMLAudioElement;
  private album: Album = null;
  private trackIndex: number = -1;
  private objectUrl: string = null;
  private playToken: number = 0;
  private lyricsToken: number = 0;
  private progressRaf: number = 0;
  private lastTimeText: string = '';
  private lastTotalText: string = '';
  private lastProgressPct: number = -1;
  private visible: boolean = false;

  private lyrics: LyricsResult = null;
  private lyricsLineEls: HTMLDivElement[] = [];
  private lastLyricsIndex: number = -1;
  private showCover: boolean = true;
  private hasLyrics: boolean = false;

  constructor () {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.build();
    this.bindAudio();
    this.bindControls();
  }

  public isVisible (): boolean {
    return this.visible;
  }

  public isPlaying (): boolean {
    return !!(this.audio && !this.audio.paused && !this.audio.ended && this.trackIndex >= 0);
  }

  public hasActiveTrack (): boolean {
    return !!(this.album && this.trackIndex >= 0);
  }

  public getAlbumId (): string {
    return this.album ? this.album.id : null;
  }

  /** Start (or restart) a track and show the overlay. */
  public play (album: Album, trackIndex: number): void {
    this.album = album;
    this.trackIndex = trackIndex;
    this.showCover = true;
    this.hasLyrics = false;
    this.updateMeta();
    this.show();
    this.loadAndPlay(album.tracks[trackIndex]);
    this.loadLyrics();
  }

  public show (): void {
    if (!this.root) { return; }
    this.root.style.display = 'flex';
    this.visible = true;
  }

  /** Hide chrome; audio keeps playing. */
  public hide (): void {
    if (!this.root) { return; }
    this.root.style.display = 'none';
    this.visible = false;
  }

  public cleanup (): void {
    this.playToken++;
    this.lyricsToken++;
    if (this.progressRaf) { cancelAnimationFrame(this.progressRaf); }
    this.progressRaf = 0;
    this.revokeObjectUrl();
    this.lyrics = null;
    this.lyricsLineEls = [];
    this.lastLyricsIndex = -1;
    try {
      if (this.audio) {
        this.audio.pause();
        this.audio.src = '';
      }
    } catch (e) { /* no-op */ }
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
    this.visible = false;
    this.album = null;
    this.trackIndex = -1;
  }

  private build (): void {
    this.root = document.createElement('div');
    this.root.id = 'jukebox-player';
    this.style(this.root, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '1280px',
      height: '720px',
      zIndex: '90000',
      display: 'none',
      flexDirection: 'row',
      alignItems: 'stretch',
      boxSizing: 'border-box',
      padding: '56px 64px',
      background: 'linear-gradient(135deg, #1a0f28 0%, #0d1016 55%, #121820 100%)',
      color: '#f2f4f7',
      fontFamily: '"Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif',
      webkitUserSelect: 'none',
      userSelect: 'none',
      webkitTouchCallout: 'none',
      touchAction: 'none'
    });
    this.root.addEventListener('selectstart', (e) => { e.preventDefault(); }, false);
    this.root.addEventListener('dragstart', (e) => { e.preventDefault(); }, false);
    this.root.addEventListener('contextmenu', (e) => { e.preventDefault(); }, false);

    // Left: album cover by default; lyrics when found (tap to toggle)
    this.leftPanel = document.createElement('div');
    this.style(this.leftPanel, {
      width: '520px',
      flexShrink: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: '48px',
      boxSizing: 'border-box'
    });

    this.coverWrap = document.createElement('div');
    this.style(this.coverWrap, {
      width: '480px',
      height: '560px',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#1e2430',
      boxShadow: '0 18px 48px rgba(0,0,0,0.45)',
      position: 'relative',
      display: 'none'
    });

    this.coverImg = document.createElement('img');
    this.style(this.coverImg, {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'none',
      pointerEvents: 'none'
    });
    this.coverWrap.appendChild(this.coverImg);

    this.coverPlaceholder = document.createElement('div');
    this.style(this.coverPlaceholder, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '28px',
      letterSpacing: '1px',
      color: 'rgba(242,244,247,0.35)',
      background: 'linear-gradient(160deg, #2a1a44, #1a2230)'
    });
    this.coverPlaceholder.textContent = 'No cover';
    this.coverWrap.appendChild(this.coverPlaceholder);

    this.lyricsWrap = document.createElement('div');
    this.style(this.lyricsWrap, {
      width: '480px',
      height: '560px',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'rgba(20, 16, 28, 0.92)',
      boxShadow: '0 18px 48px rgba(0,0,0,0.45)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      padding: '28px 24px'
    });

    this.lyricsStatusEl = document.createElement('div');
    this.style(this.lyricsStatusEl, {
      fontSize: '20px',
      color: 'rgba(242,244,247,0.45)',
      textAlign: 'center',
      marginBottom: '12px',
      flexShrink: '0'
    });
    this.lyricsStatusEl.textContent = 'Loading lyrics...';
    this.lyricsWrap.appendChild(this.lyricsStatusEl);

    this.lyricsScroll = document.createElement('div');
    this.style(this.lyricsScroll, {
      flex: '1',
      overflowY: 'auto',
      overflowX: 'hidden',
      webkitOverflowScrolling: 'touch',
      paddingRight: '8px'
    });
    this.lyricsWrap.appendChild(this.lyricsScroll);

    const toggleHint = document.createElement('div');
    this.style(toggleHint, {
      marginTop: '12px',
      fontSize: '16px',
      color: 'rgba(242,244,247,0.3)',
      textAlign: 'center',
      flexShrink: '0'
    });
    toggleHint.textContent = 'Tap to show cover';
    this.lyricsWrap.appendChild(toggleHint);

    const coverHint = document.createElement('div');
    this.style(coverHint, {
      position: 'absolute',
      left: '0',
      right: '0',
      bottom: '16px',
      fontSize: '16px',
      color: 'rgba(242,244,247,0.55)',
      textAlign: 'center',
      pointerEvents: 'none'
    });
    coverHint.textContent = 'Tap to show lyrics';
    this.coverWrap.appendChild(coverHint);

    this.leftPanel.appendChild(this.lyricsWrap);
    this.leftPanel.appendChild(this.coverWrap);
    this.leftPanel.addEventListener('click', () => { this.toggleCoverLyrics(); }, false);
    this.root.appendChild(this.leftPanel);

    // Right: details + controls
    const right = document.createElement('div');
    this.style(right, {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minWidth: '0',
      paddingLeft: '8px'
    });

    this.trackTitleEl = document.createElement('div');
    this.style(this.trackTitleEl, {
      fontSize: '44px',
      fontWeight: '700',
      lineHeight: '1.2',
      marginBottom: '16px',
      wordBreak: 'break-word'
    });
    this.trackTitleEl.textContent = '—';
    right.appendChild(this.trackTitleEl);

    this.albumEl = document.createElement('div');
    this.style(this.albumEl, {
      fontSize: '28px',
      fontWeight: '500',
      color: 'rgba(242,244,247,0.85)',
      marginBottom: '8px',
      wordBreak: 'break-word'
    });
    right.appendChild(this.albumEl);

    this.artistEl = document.createElement('div');
    this.style(this.artistEl, {
      fontSize: '24px',
      color: 'rgba(242,244,247,0.55)',
      marginBottom: '36px',
      wordBreak: 'break-word',
      minHeight: '28px'
    });
    right.appendChild(this.artistEl);

    this.statusEl = document.createElement('div');
    this.style(this.statusEl, {
      fontSize: '18px',
      color: 'rgba(232,114,58,0.95)',
      marginBottom: '20px',
      minHeight: '22px'
    });
    right.appendChild(this.statusEl);

    // Transport
    const transport = document.createElement('div');
    this.style(transport, {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '28px'
    });

    const prevBtn = this.makeIconBtn('prev', 72);
    const playBtn = this.makeIconBtn('play', 88);
    const nextBtn = this.makeIconBtn('next', 72);
    this.playPauseBtn = playBtn;
    this.playPauseIcon = playBtn.querySelector('svg') as any;
    prevBtn.addEventListener('click', () => { this.prev(); }, false);
    playBtn.addEventListener('click', () => { this.togglePlayPause(); }, false);
    nextBtn.addEventListener('click', () => { this.next(); }, false);
    transport.appendChild(prevBtn);
    transport.appendChild(playBtn);
    transport.appendChild(nextBtn);
    right.appendChild(transport);

    // Seek
    const seekRow = document.createElement('div');
    this.style(seekRow, {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    });

    this.currentTimeEl = document.createElement('span');
    this.style(this.currentTimeEl, {
      fontSize: '18px',
      color: 'rgba(242,244,247,0.65)',
      width: '56px',
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    });
    this.currentTimeEl.textContent = '0:00';

    this.progressTrack = document.createElement('div');
    this.style(this.progressTrack, {
      flex: '1',
      height: '14px',
      borderRadius: '7px',
      background: 'rgba(255,255,255,0.12)',
      position: 'relative',
      overflow: 'hidden'
    });
    this.progressFill = document.createElement('div');
    this.style(this.progressFill, {
      position: 'absolute',
      left: '0',
      top: '0',
      height: '100%',
      width: '0%',
      background: '#e8723a',
      borderRadius: '7px'
    });
    this.progressTrack.appendChild(this.progressFill);
    this.progressTrack.addEventListener('click', (e) => { this.seekFromEvent(e); }, false);

    this.totalTimeEl = document.createElement('span');
    this.style(this.totalTimeEl, {
      fontSize: '18px',
      color: 'rgba(242,244,247,0.65)',
      width: '56px',
      fontVariantNumeric: 'tabular-nums'
    });
    this.totalTimeEl.textContent = '0:00';

    seekRow.appendChild(this.currentTimeEl);
    seekRow.appendChild(this.progressTrack);
    seekRow.appendChild(this.totalTimeEl);
    right.appendChild(seekRow);

    const hint = document.createElement('div');
    this.style(hint, {
      marginTop: '36px',
      fontSize: '18px',
      color: 'rgba(242,244,247,0.35)'
    });
    hint.textContent = 'Swipe down for track list';
    right.appendChild(hint);

    this.root.appendChild(right);
    this.mount();
  }

  private makeIconBtn (kind: 'prev' | 'play' | 'next' | 'pause', size: number): HTMLDivElement {
    const btn = document.createElement('div');
    this.style(btn, {
      width: size + 'px',
      height: size + 'px',
      borderRadius: Math.round(size / 2) + 'px',
      background: 'rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flexShrink: '0'
    });
    const iconSize = Math.round(size * 0.42);
    btn.appendChild(this.createTransportSvg(kind, iconSize));
    return btn;
  }

  private createTransportSvg (
    kind: 'prev' | 'play' | 'next' | 'pause',
    size: number
  ): SVGElement {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    this.style(svg as any, {
      display: 'block',
      pointerEvents: 'none'
    });

    const fill = '#f2f4f7';
    if (kind === 'play') {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', 'M8 5v14l11-7z');
      path.setAttribute('fill', fill);
      svg.appendChild(path);
    } else if (kind === 'pause') {
      const r1 = document.createElementNS(ns, 'rect');
      r1.setAttribute('x', '6');
      r1.setAttribute('y', '5');
      r1.setAttribute('width', '4');
      r1.setAttribute('height', '14');
      r1.setAttribute('rx', '1');
      r1.setAttribute('fill', fill);
      const r2 = document.createElementNS(ns, 'rect');
      r2.setAttribute('x', '14');
      r2.setAttribute('y', '5');
      r2.setAttribute('width', '4');
      r2.setAttribute('height', '14');
      r2.setAttribute('rx', '1');
      r2.setAttribute('fill', fill);
      svg.appendChild(r1);
      svg.appendChild(r2);
    } else if (kind === 'prev') {
      const bar = document.createElementNS(ns, 'rect');
      bar.setAttribute('x', '5');
      bar.setAttribute('y', '5');
      bar.setAttribute('width', '3');
      bar.setAttribute('height', '14');
      bar.setAttribute('rx', '1');
      bar.setAttribute('fill', fill);
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', 'M19 5v14L8 12z');
      path.setAttribute('fill', fill);
      svg.appendChild(bar);
      svg.appendChild(path);
    } else {
      // next
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', 'M5 5v14l11-7z');
      path.setAttribute('fill', fill);
      const bar = document.createElementNS(ns, 'rect');
      bar.setAttribute('x', '16');
      bar.setAttribute('y', '5');
      bar.setAttribute('width', '3');
      bar.setAttribute('height', '14');
      bar.setAttribute('rx', '1');
      bar.setAttribute('fill', fill);
      svg.appendChild(path);
      svg.appendChild(bar);
    }
    return svg;
  }

  private setPlayPauseIcon (playing: boolean): void {
    if (!this.playPauseBtn) { return; }
    const size = this.playPauseIcon
      ? parseInt(this.playPauseIcon.getAttribute('width') || '36', 10)
      : 36;
    while (this.playPauseBtn.firstChild) {
      this.playPauseBtn.removeChild(this.playPauseBtn.firstChild);
    }
    this.playPauseIcon = this.createTransportSvg(playing ? 'pause' : 'play', size);
    this.playPauseBtn.appendChild(this.playPauseIcon);
  }

  private mount (): void {
    const face = document.getElementById('face');
    const host = face || document.body || document.documentElement;
    if (!host) {
      console.error('[jukebox] PlayerOverlay: no DOM host');
      return;
    }
    if (face) {
      this.root.style.position = 'absolute';
    } else {
      this.root.style.position = 'fixed';
    }
    host.appendChild(this.root);
  }

  private bindAudio (): void {
    this.audio.addEventListener('play', () => {
      this.setPlayPauseIcon(true);
      this.setStatus('');
      this.startProgressLoop();
    }, false);
    this.audio.addEventListener('pause', () => {
      this.setPlayPauseIcon(false);
    }, false);
    this.audio.addEventListener('ended', () => {
      this.next();
    }, false);
    this.audio.addEventListener('error', () => {
      this.setStatus('Could not play this track');
      this.setPlayPauseIcon(false);
    }, false);
    this.audio.addEventListener('loadedmetadata', () => {
      this.updateProgress(true);
      // Retry lyrics with duration for a better lrclib match if still loading/empty.
      if (!this.lyrics || (!this.lyrics.lines.length && !this.lyrics.plain && !this.lyrics.instrumental)) {
        this.loadLyrics();
      }
    }, false);
  }

  private bindControls (): void {
    // click handlers attached in build()
  }

  private updateMeta (): void {
    if (!this.album || this.trackIndex < 0) { return; }
    const track = this.album.tracks[this.trackIndex];
    this.trackTitleEl.textContent = track ? track.title : '—';

    if (this.album.isSingle) {
      // Don't repeat the same title as album; label it as a single.
      this.albumEl.textContent = 'Single';
      this.albumEl.style.display = 'block';
    } else {
      this.albumEl.textContent = this.album.albumTitle || this.album.title || '';
      this.albumEl.style.display = this.albumEl.textContent ? 'block' : 'none';
    }

    this.artistEl.textContent = this.album.artist || '';
    this.artistEl.style.display = this.album.artist ? 'block' : 'none';

    if (this.album.coverUrl) {
      this.coverImg.src = this.album.coverUrl;
      this.coverImg.style.display = 'block';
      this.coverPlaceholder.style.display = 'none';
    } else {
      this.coverImg.removeAttribute('src');
      this.coverImg.style.display = 'none';
      this.coverPlaceholder.style.display = 'flex';
    }

    this.applyLeftMode();
  }

  private loadLyrics (): void {
    if (!this.album || this.trackIndex < 0) { return; }
    const track = this.album.tracks[this.trackIndex];
    const token = ++this.lyricsToken;
    this.lyrics = null;
    this.hasLyrics = false;
    this.lyricsLineEls = [];
    this.lastLyricsIndex = -1;
    this.clearLyricsScroll();
    this.lyricsStatusEl.style.display = 'block';
    this.lyricsStatusEl.textContent = 'Loading lyrics...';
    // Keep cover up until we know there are usable lyrics.
    this.showCover = true;
    this.applyLeftMode();

    const duration = this.audio && isFinite(this.audio.duration) && this.audio.duration > 0
      ? this.audio.duration
      : undefined;

    LyricsService.fetch(this.album, track, duration).then((result) => {
      if (token !== this.lyricsToken) { return; }
      this.lyrics = result;
      if (result.instrumental || !this.hasUsableLyrics(result)) {
        this.hasLyrics = false;
        this.showCover = true;
        this.clearLyricsScroll();
        this.applyLeftMode();
        return;
      }
      this.hasLyrics = true;
      this.showCover = false;
      this.renderLyrics(result);
      this.applyLeftMode();
      this.updateLyricsHighlight(true);
    }).catch((err) => {
      if (token !== this.lyricsToken) { return; }
      console.warn('[jukebox] lyrics fetch failed', err);
      this.lyrics = null;
      this.hasLyrics = false;
      this.showCover = true;
      this.clearLyricsScroll();
      this.applyLeftMode();
    });
  }

  private hasUsableLyrics (result: LyricsResult): boolean {
    if (!result || result.instrumental) { return false; }
    if (result.lines && result.lines.some((l) => !!(l.text && l.text.trim()))) {
      return true;
    }
    return !!(result.plain && result.plain.trim());
  }

  private renderLyrics (result: LyricsResult): void {
    this.clearLyricsScroll();
    this.lyricsLineEls = [];
    this.lastLyricsIndex = -1;
    this.lyricsStatusEl.style.display = 'none';

    if (result.lines && result.lines.length) {
      for (let i = 0; i < result.lines.length; i++) {
        const line = result.lines[i];
        const el = document.createElement('div');
        this.style(el, {
          fontSize: '26px',
          lineHeight: '1.45',
          marginBottom: '14px',
          color: 'rgba(242,244,247,0.35)',
          transition: 'color 120ms linear, transform 120ms linear',
          wordBreak: 'break-word'
        });
        el.textContent = line.text || ' ';
        this.lyricsScroll.appendChild(el);
        this.lyricsLineEls.push(el);
      }
      return;
    }

    // Plain lyrics fallback
    const plain = result.plain || '';
    const chunks = plain.split(/\n/);
    for (let i = 0; i < chunks.length; i++) {
      const el = document.createElement('div');
      this.style(el, {
        fontSize: '24px',
        lineHeight: '1.5',
        marginBottom: '10px',
        color: 'rgba(242,244,247,0.75)',
        wordBreak: 'break-word',
        minHeight: chunks[i] ? '0' : '12px'
      });
      el.textContent = chunks[i] || ' ';
      this.lyricsScroll.appendChild(el);
    }
  }

  private clearLyricsScroll (): void {
    if (!this.lyricsScroll) { return; }
    while (this.lyricsScroll.firstChild) {
      this.lyricsScroll.removeChild(this.lyricsScroll.firstChild);
    }
  }

  private updateLyricsHighlight (forceScroll?: boolean): void {
    if (!this.lyrics || !this.lyrics.lines || !this.lyrics.lines.length) { return; }
    if (!this.lyricsLineEls.length) { return; }
    const t = this.audio && isFinite(this.audio.currentTime) ? this.audio.currentTime : 0;
    const idx = LyricsService.activeIndex(this.lyrics.lines, t);
    if (idx === this.lastLyricsIndex && !forceScroll) { return; }
    this.lastLyricsIndex = idx;

    for (let i = 0; i < this.lyricsLineEls.length; i++) {
      const el = this.lyricsLineEls[i];
      if (i === idx) {
        el.style.color = '#f2f4f7';
        el.style.fontWeight = '700';
        el.style.transform = 'scale(1.02)';
      } else if (idx >= 0 && Math.abs(i - idx) === 1) {
        el.style.color = 'rgba(242,244,247,0.55)';
        el.style.fontWeight = '500';
        el.style.transform = 'none';
      } else {
        el.style.color = 'rgba(242,244,247,0.28)';
        el.style.fontWeight = '400';
        el.style.transform = 'none';
      }
    }

    if (idx >= 0 && this.lyricsLineEls[idx] && !this.showCover) {
      try {
        const el = this.lyricsLineEls[idx];
        const parent = this.lyricsScroll;
        const top = el.offsetTop - parent.clientHeight / 2 + el.clientHeight / 2;
        parent.scrollTop = Math.max(0, top);
      } catch (e) { /* no-op */ }
    }
  }

  private toggleCoverLyrics (): void {
    // Only toggle when we actually have lyrics to show.
    if (!this.hasLyrics) { return; }
    this.showCover = !this.showCover;
    this.applyLeftMode();
  }

  private applyLeftMode (): void {
    if (!this.lyricsWrap || !this.coverWrap) { return; }
    if (this.showCover || !this.hasLyrics) {
      this.lyricsWrap.style.display = 'none';
      this.coverWrap.style.display = 'block';
    } else {
      this.coverWrap.style.display = 'none';
      this.lyricsWrap.style.display = 'flex';
    }
  }

  private loadAndPlay (track: Track): void {
    if (!track) { return; }
    const token = ++this.playToken;
    this.setStatus('Loading…');
    this.revokeObjectUrl();
    this.resolvePlayable(track).then((src) => {
      if (token !== this.playToken) {
        if (src.revoke) {
          try { URL.revokeObjectURL(src.url); } catch (e) { /* no-op */ }
        }
        return;
      }
      if (src.revoke) { this.objectUrl = src.url; }
      try {
        this.audio.src = src.url;
        const p = this.audio.play();
        if (p && typeof p.catch === 'function') {
          p.catch((err: any) => {
            console.warn('[jukebox] play() rejected', err);
            this.setStatus('Playback blocked or failed');
          });
        }
      } catch (err) {
        console.error('[jukebox] play failed', err);
        this.setStatus('Playback failed');
      }
    }).catch((err) => {
      console.error('[jukebox] resolvePlayable failed', err);
      this.setStatus('Could not load track');
    });
  }

  private resolvePlayable (track: Track): Promise<PlayableSource> {
    const absPath = track.path;
    if (absPath) {
      try {
        return Promise.resolve(fileToBlobUrl(absPath, mimeForFormat(track.format)));
      } catch (err) {
        console.warn('[jukebox] blob URL failed, falling back to file URL', err);
      }
    }
    return Promise.resolve({ url: track.url, revoke: false });
  }

  private togglePlayPause (): void {
    if (!this.audio || this.trackIndex < 0) { return; }
    if (this.audio.paused) {
      const p = this.audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => { this.setStatus('Could not resume'); });
      }
    } else {
      this.audio.pause();
    }
  }

  private prev (): void {
    if (!this.album || !this.album.tracks.length) { return; }
    if (this.audio && this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      this.updateLyricsHighlight(true);
      return;
    }
    const nextIndex = this.trackIndex <= 0
      ? this.album.tracks.length - 1
      : this.trackIndex - 1;
    this.trackIndex = nextIndex;
    this.updateMeta();
    this.loadAndPlay(this.album.tracks[nextIndex]);
    this.loadLyrics();
  }

  private next (): void {
    if (!this.album || !this.album.tracks.length) { return; }
    const nextIndex = (this.trackIndex + 1) % this.album.tracks.length;
    this.trackIndex = nextIndex;
    this.updateMeta();
    this.loadAndPlay(this.album.tracks[nextIndex]);
    this.loadLyrics();
  }

  private seekFromEvent (e: MouseEvent): void {
    if (!this.audio || !isFinite(this.audio.duration) || this.audio.duration <= 0) { return; }
    const rect = this.progressTrack.getBoundingClientRect();
    if (!rect.width) { return; }
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.audio.currentTime = x * this.audio.duration;
    this.updateProgress(true);
  }

  private startProgressLoop (): void {
    if (this.progressRaf) { return; }
    const tick = () => {
      this.progressRaf = 0;
      this.updateProgress(false);
      if (this.audio && !this.audio.paused && !this.audio.ended) {
        this.progressRaf = requestAnimationFrame(tick);
      }
    };
    this.progressRaf = requestAnimationFrame(tick);
  }

  private updateProgress (force: boolean): void {
    const cur = this.audio && isFinite(this.audio.currentTime) ? this.audio.currentTime : 0;
    const dur = this.audio && isFinite(this.audio.duration) ? this.audio.duration : 0;
    const timeText = this.formatTime(cur);
    const totalText = dur > 0 ? this.formatTime(dur) : '0:00';
    const pct = dur > 0 ? Math.max(0, Math.min(100, (cur / dur) * 100)) : 0;

    if (force || timeText !== this.lastTimeText) {
      this.currentTimeEl.textContent = timeText;
      this.lastTimeText = timeText;
    }
    if (force || totalText !== this.lastTotalText) {
      this.totalTimeEl.textContent = totalText;
      this.lastTotalText = totalText;
    }
    if (force || Math.abs(pct - this.lastProgressPct) >= 0.25) {
      this.progressFill.style.width = pct.toFixed(2) + '%';
      this.lastProgressPct = pct;
    }
    this.updateLyricsHighlight(force);
  }

  private formatTime (sec: number): string {
    if (!isFinite(sec) || sec < 0) { return '0:00'; }
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  private revokeObjectUrl (): void {
    if (!this.objectUrl) { return; }
    try { URL.revokeObjectURL(this.objectUrl); } catch (e) { /* no-op */ }
    this.objectUrl = null;
  }

  private setStatus (msg: string): void {
    this.statusEl.textContent = msg || '';
  }

  private style (el: HTMLElement, props: { [k: string]: string }): void {
    for (const key in props) {
      if (props.hasOwnProperty(key)) {
        (el.style as any)[key] = props[key];
      }
    }
  }
}
