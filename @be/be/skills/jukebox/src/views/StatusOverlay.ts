/**
 * Full-screen status panel shown immediately when Jukebox opens.
 * Survives scan/UI failures so the user never only sees a black screen.
 */
export default class StatusOverlay {

  private root: HTMLDivElement;
  private titleEl: HTMLDivElement;
  private messageEl: HTMLDivElement;
  private detailEl: HTMLPreElement;

  public static show (message?: string): StatusOverlay {
    return new StatusOverlay(message || 'Loading Jukebox...');
  }

  constructor (message: string) {
    this.root = document.createElement('div');
    this.root.id = 'jukebox-status';
    this.style(this.root, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '1280px',
      height: '720px',
      zIndex: '100000',
      background: '#0d1016',
      color: '#f2f4f7',
      fontFamily: '"Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif',
      boxSizing: 'border-box',
      padding: '80px 72px',
      overflow: 'auto',
      webkitUserSelect: 'none',
      userSelect: 'none',
      webkitTouchCallout: 'none',
      touchAction: 'pan-y'
    });
    this.root.addEventListener('selectstart', (e) => { e.preventDefault(); }, false);
    this.root.addEventListener('dragstart', (e) => { e.preventDefault(); }, false);
    this.root.addEventListener('contextmenu', (e) => { e.preventDefault(); }, false);

    this.titleEl = document.createElement('div');
    this.style(this.titleEl, {
      fontSize: '48px',
      fontWeight: '700',
      letterSpacing: '1px',
      marginBottom: '28px'
    });
    this.titleEl.textContent = 'Jukebox';
    this.root.appendChild(this.titleEl);

    this.messageEl = document.createElement('div');
    this.style(this.messageEl, {
      fontSize: '30px',
      lineHeight: '1.45',
      color: 'rgba(242,244,247,0.9)',
      marginBottom: '28px',
      whiteSpace: 'pre-wrap'
    });
    this.messageEl.textContent = message;
    this.root.appendChild(this.messageEl);

    this.detailEl = document.createElement('pre');
    this.style(this.detailEl, {
      fontSize: '18px',
      lineHeight: '1.5',
      color: 'rgba(242,244,247,0.55)',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      margin: '0',
      fontFamily: 'Menlo, Consolas, monospace',
      display: 'none'
    });
    this.root.appendChild(this.detailEl);

    this.mount();
  }

  public setLoading (message: string): void {
    this.titleEl.textContent = 'Jukebox';
    this.titleEl.style.color = '#f2f4f7';
    this.messageEl.textContent = message;
    this.messageEl.style.color = 'rgba(242,244,247,0.9)';
    this.detailEl.style.display = 'none';
    this.detailEl.textContent = '';
  }

  public showError (message: string, detail?: string): void {
    this.titleEl.textContent = 'Jukebox — Error';
    this.titleEl.style.color = '#ff8a6a';
    this.messageEl.textContent = message;
    this.messageEl.style.color = '#ffd5c8';
    if (detail) {
      this.detailEl.textContent = detail;
      this.detailEl.style.display = 'block';
    } else {
      this.detailEl.style.display = 'none';
      this.detailEl.textContent = '';
    }
  }

  public dismiss (): void {
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
  }

  private mount (): void {
    const face = document.getElementById('face');
    const host = face || document.body || document.documentElement;
    if (!host) {
      console.error('[jukebox] StatusOverlay: no DOM host to mount into');
      return;
    }
    // Prefer #face so we sit in the same layer as the robot screen.
    if (face) {
      this.root.style.position = 'absolute';
    } else {
      this.root.style.position = 'fixed';
    }
    host.appendChild(this.root);
  }

  private style (el: HTMLElement, props: { [k: string]: string }): void {
    for (const key in props) {
      if (props.hasOwnProperty(key)) {
        (el.style as any)[key] = props[key];
      }
    }
  }
}
