import { kbModel as kb } from './KBModel';
import jibo = require('jibo');

class UserModel {

  public name: string = '';
  public id: string;

  constructor () {
    // this.id = jibo.lps.identity.getActiveSpeaker().id;
    this.id = "576d983a5bb1c11100ae4188"; // George Jetson... hard-coded, get from identity module eventually
  }

  async init (): Promise<void> {
    // jibo 14 removed the kb.loop name lookups, so getWrittenName() resolves to ''
    // (or can reject). Never let `name` end up undefined or the prompts that
    // interpolate ${name} speak the literal word "undefined".
    try {
      const name = await kb.getWrittenName();
      this.name = name || '';
    } catch (err) {
      console.warn('[recipe] UserModel.init: name lookup unavailable', err);
      this.name = '';
    }
  }

}

export const userModel = new UserModel();
