# Friendly Tips

[![Build
Status](http://jenkins.jibo.com/buildStatus/icon?job=friendly-tips)](http://jenkins.jibo.com/view/Skills/job/friendly-tips/)

## Documentation

Please also read the [Be Documentation](https://confluence.jibo.com/display/SKIL/Be+Documentation) for information on creating a skill in this organization and adding your skill to this repo as a dependency.

## Building

Build process is implemented using NPM scripts installed in the **package.json** file.

| Command | Description
|---|---|
|`yarn build` | Build the project in debug mode. |
|`yarn release` | Build the project in release mode. |
|`yarn watch` | Watch the source and behaviors, auto-rebuilds. |
|`yarn clean` | Deletes built JavaScript files. |
|`yarn start` | Alias for `yarn watch`. |
|`yarn sync` | Sync file to the robot</br> **Tip**: Use `jibo run` after to launch skills |
|`yarn addsshkey` | Install your public SSH key on the robot (OS X Only). |

## Publishing

To publish, bump the version number (optional) and either publish in debug or release mode. This will generate a release/debug build before publishing and will Git push the version bump and the tag. For example:

```bash
# Bump the version, see NPM docs for more info
npm version patch

# Publish in debug mode with source maps
yarn publish:debug

# Publish in release mode, minified
yarn publish:release
```

## Proactive Prototype
To use the `proactive-reactive` (prototype) branch of this skill in Be, do the following:
* In be/package.json:
 * In `"launchRule"` add `"node_modules/@be/demo/launch.rule"`
 * In `"skills"` add `"@be/demo"`
 * Change `"firstSkill"` to `"@be/demo"`
* In be/index.js
 * Remove the line `this.firstSkill.once('oobeComplete', enableRelaunch);`
 * On the next line, add `enableRelaunch()` to the callback in `this.redirect` (before `this.initDoneCallback();`
* In the Be root directory, `yarn link ../friendly-tips; yarn build; yarn first:robot:enable`
