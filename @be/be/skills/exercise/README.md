# Exercise Skill

[![Build
Status](http://jenkins.jibo.com/buildStatus/icon?job=template)](http://jenkins.jibo.com/view/Skills/job/template/)

## Documentation

Please also read the [Be Documentation](https://confluence.jibo.com/display/SKIL/Be+Documentation) for information on creating a skill in this organization and adding your skill to this repo as a dependency.

## Building

Build process is implemented using NPM scripts installed in the **package.json** file.

**Since jibo-sync and jibo-run take so long, for OSX first run `npm run sync` and then use `jibo run --nosync` when using the CLI.**

| Command | Description
|---|---|
|`yarn run build` | Build the project in debug mode. |
|`yarn run release` | Build the project in release mode. |
|`yarn run watch` | Watch the source and behaviors, auto-rebuilds. |
|`yarn run clean` | Deletes built JavaScript files. |
|`yarn start` | Alias for `npm run watch`. |
|`yarn run preprocess:xlsx` | Convert the spreadsheets that contain the routines and rounds into JSON |

## Publishing

To publish, bump the version number (optional) and either publish in debug or release mode. This will generate a release/debug build before publishing and will Git push the version bump and the tag. For example:

```bash
# Bump the version, see NPM docs for more info
npm version patch

# Publish in debug mode with source maps
npm run publish:debug

# Publish in release mode, minified
npm run publish:release
```
