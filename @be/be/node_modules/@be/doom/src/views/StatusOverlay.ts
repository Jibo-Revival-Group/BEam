/**
 * Full-screen status panel shown immediately when Doom opens.
 * Mounted inside #face like Jukebox — body/fixed overlays are invisible on robot.
 */
export default class StatusOverlay {

  private root: HTMLDivElement;
  private titleEl: HTMLDivElement;
  private messageEl: HTMLDivElement;
  private detailEl: HTMLPreElement;

  public static show (message?: string): StatusOverlay {
    return new StatusOverlay(message || 'Loading Doom...');
  }

  constructor (message: string) {
    this.root = document.createElement('div');
    this.root.id = 'doom-status';
    this.style(this.root, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '1280px',
      height: '720px',
      zIndex: '100002',
      background: '#0a0a0a',
      color: '#f2f4f7',
      fontFamily: '"Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif',
      boxSizing: 'border-box',
      padding: '80px 72px',
      overflow: 'auto',
      webkitUserSelect: 'none',
      userSelect: 'none',
      webkitTouchCallout: 'none',
      touchAction: 'none'
    });
    this.root.addEventListener('selectstart', (e) => { e.preventDefault(); }, false);
    this.root.addEventListener('contextmenu', (e) => { e.preventDefault(); }, false);

    this.titleEl = document.createElement('div');
    this.style(this.titleEl, {
      fontSize: '48px',
      fontWeight: '700',
      letterSpacing: '2px',
      marginBottom: '28px',
      color: '#e23b2f'
    });
    this.titleEl.textContent = 'DOOM';
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
    this.titleEl.textContent = 'DOOM';
    this.titleEl.style.color = '#e23b2f';
    this.messageEl.textContent = message;
    this.messageEl.style.color = 'rgba(242,244,247,0.9)';
  }

  public showDetail (detail: string): void {
    if (!detail) {
      this.detailEl.style.display = 'none';
      this.detailEl.textContent = '';
      return;
    }
    this.detailEl.textContent = detail;
    this.detailEl.style.display = 'block';
    this.detailEl.style.color = 'rgba(242,244,247,0.55)';
  }

  public showError (message: string, detail?: string): void {
    this.titleEl.textContent = 'DOOM — Error';
    this.titleEl.style.color = '#ff8a6a';
    this.messageEl.textContent = message;
    this.messageEl.style.color = '#ffd5c8';
    if (detail) {
      this.detailEl.textContent = detail;
      this.detailEl.style.display = 'block';
      this.detailEl.style.color = 'rgba(255,213,200,0.75)';
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
    // Mount on body (fixed) — the only layer confirmed visible on the robot.
    // #face-mounted DOM did not render on this device.
    const host = document.body || document.documentElement;
    if (!host) {
      throw new Error('No DOM host (body) for Doom status overlay');
    }
    this.root.style.position = 'fixed';
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
