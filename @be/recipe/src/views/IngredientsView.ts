import jibo = require('jibo');
import eases = require('eases');
import Recipe from '../entities/Recipe';
import ButtonUtil from '../utils/ButtonUtil';
import { EventEmitter } from 'events';

const WHITE = '#FFFFFF';
const HIGHLIGHT = '#FEAA26';

export default class IngredientsView extends EventEmitter {

  public index: number;

  private componentType: any;
  private mc: any;
  private timeline: any;
  private library: any;
  private closeBtn: any;
  private upBtn: any;
  private downBtn: any;
  private makeItBtn: any;
  private edgeFadeClip: any;
  private recipe: Recipe;
  private ingredientsContainer: PIXI.Container;
  private txts: PIXI.Text[];
  private isClickable: boolean;
  private highlightedIndex: number = null;

  constructor () {
    super();
  }

  public init (recipe: Recipe): void {
    this.recipe = recipe;

    jibo.face.views.addView('resources/views/Ingredients.json', (view) => {
      this.componentType = view.getComponentById('ingredientsClip');
      this.mc = this.componentType.movieClip;
      this.timeline = (<any>this.componentType).timeline;
      this.library = this.timeline.library;
      this.closeBtn = this.mc.closeBtn;
      this.upBtn = this.mc.upBtn;
      this.downBtn = this.mc.downBtn;
      this.makeItBtn = this.mc.makeItBtn;
      this.edgeFadeClip = this.mc.edgeFadeClip;

      this.closeBtn.gotoAndStop('close');
      this.upBtn.gotoAndStop('up');
      this.downBtn.gotoAndStop('down');

      //SD:Have to add a blocker since Tween doesn't have an override property.
      this.isClickable = true;
      this.index = 0;

      this.setButtons([this.closeBtn, this.upBtn, this.downBtn, this.makeItBtn]);
      this.setButtonHandlers();

      this.ingredientsContainer = new PIXI.Container();

      this.mc.addChild(this.ingredientsContainer);
      this.mc.setChildIndex(this.ingredientsContainer, 1);

      jibo.face.tween.play(this.closeBtn, { to:{x:1120}, from:{x:1300}, ease:'circInOut',delay:200, duration:350});
      jibo.face.tween.play(this.upBtn, { to:{y:600}, from:{y:900}, ease:'circInOut', delay:300, duration:350});
      jibo.face.tween.play(this.downBtn, { to:{y:600}, from:{y:900}, ease:'circInOut', delay:200, duration:350});

      this.emit('ready');
      this.updateDisplay();
    });
  }

  public cleanup (done: () => any): void {
    jibo.face.views.removeView(done);
  }

  public toggleMakeIt (visible: boolean): void {
    this.makeItBtn.visible = visible;
    this.makeItBtn.y = visible ? 600 : 960;
  }

  public scrollTo (index: number, done?: () => any): void {
    if (index === this.index) {
      done && done();
      return;
    }
    this.isClickable = false;
    let dir = index < this.index ? 'up' : 'down';
    let txt = this.txts[index];
    let posY = -txt.y + 145;
    jibo.face.tween.play(this.ingredientsContainer, { to: { y: posY }, from: { y: this.ingredientsContainer.y } }, () => {
      this.index = index;
      this.isClickable = true;
      done && done();
    });
  }

  public highlight (index: any, done: () => any): void {
    if (this.highlightedIndex !== null) {
      this.removeHighlight();
    }
    let txt = this.txts[index];
    txt.style.fill = HIGHLIGHT;
    txt.style = txt.style;
    this.scrollTo(index, done);
    this.highlightedIndex = index;
  }

  public removeHighlight (): void {
    let txt = this.txts[this.highlightedIndex];
    txt.style.fill = WHITE;
    txt.style = txt.style;
    this.highlightedIndex = null;
  }

  protected setButtonHandlers (): void {
    ButtonUtil.once(this.closeBtn, () => {
      this.emit('close');
    });

    // up and down buttons don't emit events because the vui state doesn't need to be updated
    ButtonUtil.once(this.upBtn, () => {
      if (this.isClickable && this.index > 0) {
        this.scrollTo(this.index - 1);
      }
    });

    ButtonUtil.once(this.downBtn, () => {
      if (this.isClickable && this.index < this.recipe.numIngredients - 1) {
        this.scrollTo(this.index + 1);
      }
    });

    ButtonUtil.once(this.makeItBtn, () => {
      this.emit('make');
    });
  }

  protected updateDisplay (): void {
    const fontSize = 75;
    const offsetX = 80;
    const offsetY = 145;
    const fill = WHITE;
    const align = 'left';
    const fontFamily = 'Proxima Nova Light';

    this.ingredientsContainer.removeChildren();
    this.index = 0;
    this.txts = [];

    let ingredients = this.recipe.ingredients;
    for (let i = 0, l = ingredients.length; i < l; i++) {
      let ingredient = ingredients[i];
      if (ingredient.displayValue.length === 0) { continue; }
      let txt = new PIXI.Text(ingredient.displayValue, { fontFamily, fontSize, align, fill });
      txt.style.wordWrap = false;
      txt.style.breakWords = false;
      txt.style.wordWrapWidth = 1120;
      txt.style = txt.style; // update text
      txt.x = offsetX;
      txt.y = offsetY + ((txt.height + 60)) * i;
      this.ingredientsContainer.addChild(txt);
      this.txts.push(txt);
    }
  }

  protected setButtons (buttons: any[]): void {
    for (let i = 0, l = buttons.length; i < l; i++) {
      let btn = buttons[i];
      btn.interactive = btn.buttonMode = true;
    }
  }

}
