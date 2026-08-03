import jibo = require('jibo');
import Recipe from '../entities/Recipe';
import ButtonUtil from '../utils/ButtonUtil';
import { EventEmitter } from 'events';

export default class StepView extends EventEmitter {

  public static TYPE: string = 'StepView';

  public activeStep: number;

  private view: any;
  private componentType: any;
  private mc: any;
  private timeline: any;
  private library: any;
  private prevBtn: any;
  private playVideoBtn: any;
  private nextBtn: any;
  private stepTxt: PIXI.Text;
  private recipe: Recipe;
  private txt: PIXI.Text;

  constructor () {
    super();
  }

  public init (recipe: Recipe): void {
    this.recipe = recipe;
    jibo.face.views.addView('resources/views/Steps.json', view => {
      this.componentType = view.getComponentById('stepsClip');
      this.mc = this.componentType.movieClip;
      this.timeline = this.componentType.timeline;
      this.library = this.timeline.library;
      this.prevBtn = this.mc.prevBtn;
      this.playVideoBtn = this.mc.playVideoBtn;
      this.nextBtn = this.mc.nextBtn;
      this.stepTxt = this.mc.stepNumber_txt;

      this.setupButtons();

      this.activeStep = 1;

      this.stepTxt.text = '0 of 0';
      this.setup();
      this.emit('ready');

      jibo.face.tween.play(this.prevBtn, { to:{y:600}, from:{y:950}, ease:'circInOut',delay:200, duration:350});
      jibo.face.tween.play(this.playVideoBtn, { to:{y:600}, from:{y:950}, ease:'circInOut', delay:300, duration:350});
      jibo.face.tween.play(this.nextBtn, { to:{y:600}, from:{y:950}, ease:'circInOut', delay:400, duration:350});
    }, jibo.face.views.UP, jibo.face.views.DOWN);
  }

  public cleanup (done: () => any): void {
    jibo.face.views.removeView(done);
  }

  protected setupButtons (): void {
    this.nextBtn.interactive = this.nextBtn.buttonMode = true;
    this.prevBtn.interactive = this.prevBtn.buttonMode = true;
    this.playVideoBtn.interactive = this.playVideoBtn.buttonMode = true;

    ButtonUtil.once(this.nextBtn, () => {
      this.emit('nav', 'next');
    });

    ButtonUtil.once(this.prevBtn, () => {
      this.emit('nav', 'previous');
    });

    ButtonUtil.once(this.playVideoBtn, () => {
      this.emit('video');
    });
  }

  protected setup (): void {
    const offsetX = 80;
    const offsetY = 145;
    const fontSize = 75;
    const fill = 0xFFFFFF;
    const align = 'left';
    const fontFamily = 'Proxima Nova Light';

    this.txt = new PIXI.Text('', { fontFamily, fontSize, align, fill });
    this.txt.style.wordWrap = true;
    this.txt.style.breakWords = true;
    this.txt.style.wordWrapWidth = 1120;
    this.txt.x = offsetX;
    this.txt.y = offsetY;

    this.mc.addChildAt(this.txt, 0);
  }

  protected updateDisplay (): void {
    this.stepTxt.text = `${this.activeStep} of ${this.recipe.numDirections}`;
    this.txt.text = this.recipe.getTextDirectionAtIndex(this.activeStep - 1);
  }

  public next (): void {
    if (this.activeStep >= this.recipe.numDirections) { return; }
    this.activeStep++;
    this.updateDisplay();
  }

  public prev (): void {
    if (this.activeStep <= 1) { return; }
    this.activeStep--;
    this.updateDisplay();
  }

  public stepTo (activeStep: number): void {
    this.activeStep = activeStep;
    this.updateDisplay();
  }

}
