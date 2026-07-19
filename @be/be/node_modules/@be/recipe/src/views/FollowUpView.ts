import jibo = require('jibo');
import Recipe from '../entities/Recipe';
import ButtonUtil from '../utils/ButtonUtil';
import { EventEmitter } from 'events';

export default class FollowUpView extends EventEmitter {

  public static TYPE: string = 'FollowUpView';

  private componentType: any;
  private mc: any;
  private heartBtn: any;
  private recipe: Recipe;

  constructor (recipe: Recipe) {
    super();
  }

  public init (recipe: Recipe): void {
    this.recipe = recipe;
    jibo.face.views.addView('resources/views/FollowUp.json', view => {
      this.componentType = view.getComponentById('followUpClip');
      this.mc = this.componentType.movieClip;
      this.heartBtn = this.mc.heartBtn;
      this.setupButtons();
      this.heartBtn.gotoAndStop(0);
      // TODO: Add close button
      this.emit('ready');
    }, jibo.face.views.UP, jibo.face.views.OUT);
  }

  public cleanup (done: () => any): void {
    jibo.face.views.removeView(done);
  }

  public favorite (done: () => any): void {
    this.heartBtn.gotoAndStop(1);
    setTimeout(done, 1000);
  }

  private setupButtons (...buttons: any[]): void {
    this.heartBtn.interactive = this.heartBtn.buttonMode = true;
    ButtonUtil.once(this.heartBtn, () => {
      this.emit('favorite');
    });
  }

}
