# Be

[Beam Variant](https://github.com/Jibo-Revival-Group/Beam)

Be the Super Skill

## Documentation

[INTERNAL/LATEST Jibo SDK & API Documentation](https://developers.stage.jibo.com/sdk/docs/)

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
|`yarn test` | Run unit tests on the command line. |
|`yarn testdebug` | Run unit tests via the electron window with the developer console. |
|`yarn first:robot:enable` | Reset the flag to run through the First Contact / OOBE flow again ON THE ROBOT. |
|`yarn first:robot:disable` | Disable First Contact / OOBE flow so Be automatically launches into the default skill (Idle) ON THE ROBOT. |
|`yarn first:local:enable` | Reset the flag to run through the First Contact / OOBE flow again LOCALLY. |
|`yarn first:local:disable` | Disable First Contact / OOBE flow so Be automatically launches into the default skill (Idle) LOCALLY. |


## Publishing

To publish, bump the version number (optional) and either publish in debug or release mode. This will generate a release/debug build before publishing and will Git push the version bump and the tag. For example:

```bash
# Bump the version, see NPM docs for more info
npm version patch|minor|major (depending on change)

# Publish in debug mode with source maps and shrinkwrapped
yarn publish:debug:shrinkwrap

# Publish in release mode, minified and shrinkwrapped
yarn publish:release:shrinkwrap
```
