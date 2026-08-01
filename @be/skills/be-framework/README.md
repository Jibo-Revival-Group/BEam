# Be Framework

[![Build Status](https://jenkins2.jibo.com/buildStatus/icon?job=be/be-framework/master)](https://jenkins2.jibo.com/job/be/job/be-framework/job/master/)

Interface for skills that run-inside of Be as an asset-pack.

Read all the [API docs here](https://github.jibo.com/pages/be/be-framework/).

## Contributing

1. yarn install --no-options
2. gulp debug


## Usage

```js
import {BeSkill} from '@be/be-framework';

/**
 * Create a custom skill to run inside of Be.
 * @class MySkill
 * @extends BeSkill
 */
class MySkill extends BeSkill {

  /**
   * @constructor
   * @param {String} assetPack Should be the name asset-pack when
   *        running inside of Be
   */
  constructor(assetPack?) {
    super(assetPack);
  }

  /**
     * Open a skill, must override
     * @method open
     * @param {Object} [result] Parse object from `jibo.gl`
     */
  open(options) {}

  /**
   * Unload a skill, must override
   * @method close
   * @param {Function} done Callback when completed with close (must call!)
   */
  close(done) {
    done();
  }

  /**
   * Trigger a refresh
   * @method refresh
   * @param {Object} [result] Parse object from `jibo.gl`
   */
  refresh(options) {
    this.open(options);
  }
}
```

## Exports
For the Be superskill to be able to properly import and create this skill, its main export needs to be of either of the two following forms:

```js
class MySkill extends BeSkill {  /* your class */ }

module.exports = MySkill;
```
or if you also want to export other things:

```js
class MySkill extends BeSkill {  /* your class */ }
const MyConst = { foo: 'bar' };

// The export needs to be called 'Skill'
const Skill = MySkill;

export {
  Skill,
  MyConst
}
```

## APIs

BeSkill contains two methods that can be called by child skills:

### redirect(skillName:String, options?:Object)

Redirect to another skill from within be, for instance, `this.redirect('weather')`.

### exit(): void

The skill has completed, call this will tell Be go to back to idle.

### assetPack:String

The name of the asset-pack passed in from the constructor. This can be used with `jibo.bt.run` or `jibo.bt.create` to pass in the name of the asset-pack in to the overrides.

## Publishing
Run `gulp publish` on the command line to publish a new version of be-framework.
