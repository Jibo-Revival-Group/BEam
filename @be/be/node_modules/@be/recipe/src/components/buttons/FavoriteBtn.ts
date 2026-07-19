import jibo = require('jibo');

export default class FavoriteBtn extends jibo.rendering.gui.components.Button {

  public timeline: any;
  public isSelected: boolean = false;

  public static TYPE: string = 'FavoriteBtn';

  public static createFromConfig (config: any): FavoriteBtn {
    let btn: FavoriteBtn = new FavoriteBtn();
    btn.assignConfig(config);
    return btn;
  }

  constructor () {
    super();
  }

  public toggle (): void {
    this.updateDisplay(!this.isSelected);
  }

  public updateDisplay (isSelected: boolean): void {
    this.isSelected = isSelected;
    if (!this.timeline) { return; }
    if (isSelected) {
      this.timeline.gotoAndStop(1);
    } else {
      this.timeline.gotoAndStop(0);
    }
  }

  public setupDisplay (assets?: any): void {
    // Guard timeline art so a missing/incompatible asset can't throw and take
    // down the whole view (and its taps). The button stays tappable regardless.
    try {
      const lib = assets && assets.icon_favorite && assets.icon_favorite.library;
      if (lib && typeof lib.stage === 'function') {
        this.timeline = new lib.stage();
        this.display.addChild(this.timeline);
      }
    } catch (err) {
      console.warn('[recipe] FavoriteBtn: favorite timeline art unavailable', err);
      this.timeline = null;
    }

    this.setupHitArea();
    this.setupInteractions();

    if (this.timeline) {
      this.timeline.interactive = true;
      this.timeline.buttonMode = true;
      this.timeline.gotoAndStop(0);
    }
  }

  /**
   * Handler for down touch input.
   * @method jibo.face.Button#down
   * @param {any} mouseData Returned from Pixi.
   * @protected
   */
  protected down (mouseData?: any) {
    if (this.timeline) {
      this.updateDisplay(this.isSelected);
    }
  }

  /**
   * Handler for up touch input.
   * @method jibo.face.Button#up
   * @param {any} mouseData Returned from Pixi.
   * @protected
   */
  protected up (mouseData?: any) {
    if (this.timeline) {
      // PIXI.animate.Animator.play(this.timeline, 'up');
      // this.timeline.gotoAndStop(0);
    }
  }

}
