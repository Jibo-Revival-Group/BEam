import jibo = require('jibo');
import { EventEmitter } from 'events';

export default class MealView extends EventEmitter {

  public static TYPE: string = 'MealView';

  private componentType: any;
  private mc: any;
  private view: any;

  constructor () {
    super();
  }

  public init (): void {
    this.view = jibo.face.views.addView('resources/views/Meal.json', view => {
      this.componentType = view.getComponentById('mealClip');
      this.mc = this.componentType.movieClip;
      this.mc.gotoAndStop('HOLD_SAFE');
      this.emit('ready');
    }, jibo.face.views.UP, jibo.face.views.OUT);
  }

  public cleanup (done: () => any): void {
    // this cleanup has a done callback because it goes straight in to the step view.
    jibo.face.views.changeView({ removeAll: true }, done);
  }
}
