import jibo = require('jibo');
import { EventEmitter } from 'events';

// Inline the menu config as an object (bundled by the build) instead of passing a
// path string to createView(). jibo 14 only fetches a view's configPath from disk
// when no viewConfig is present, and that fetch resolves relative to the active
// asset context, which is unreliable when the skill runs embedded inside Be. This
// is the same object-config form the mim engine uses to render its gui.Menu blocks.
const optionsConfig: any = require('../../resources/views/Options.json');

export default class OptionsView extends EventEmitter {

  public static TYPE: string = 'OptionsView';

  private view: any;

  constructor () {
    super();
  }

  public init (): void {
    this.view = jibo.face.views.createView('MenuView', optionsConfig, true, () => {
      this.setEventHandlers();
      this.emit('ready');
    });
  }

  public cleanup (done: () => any): void {
    jibo.face.views.removeView(done);
  }

  private setEventHandlers (): void {
    this.view.on('optionSelected', event => {
      if (event.choice === 'help') {
        this.emit('help');
      } else if (event.choice === 'back') {
        this.emit('close');
      } else {
        this.emit('choice', event.choice);
      }
    });
  }

}
