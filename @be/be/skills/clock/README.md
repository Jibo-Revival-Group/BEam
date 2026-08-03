# Clock

[![Build Status](https://jenkins2.jibo.com/buildStatus/icon?job=clock/master)](https://jenkins2.jibo.com/view/Be/job/clock/job/master/)

[Jibo SDK & API Documentation](https://developers.jibo.com/sdk/docs/)

Build process is implemented using NPM scripts installed in the **package.json** file.

| Command | Description
|---|---|
|`yarn build` | Build the project in debug mode. |
|`yarn release` | Build the project in release mode. |
|`yarn watch` | Watch the source and behaviors, auto-rebuilds. |
|`yarn clean` | Deletes built JavaScript files. |
|`yarn start` | Alias for `yarn watch`. |
|`yarn sync` | Sync file to the robot (OS X Only). |
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
