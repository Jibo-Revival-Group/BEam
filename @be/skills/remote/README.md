# Remote

Remote Skill for supporting remote control of Jibo via the command protocol

## Documentation

Launching simulation of a remote application
https://confluence.jibo.com/display/RCP/Launch+a+simulation+of+the+remote+skill

## Opening & Closing the Remote Skill

The Remote Skill is opened differently than other skills, in that it requires an active web socket connection managed by the remote service.

In order to test the remote skill without a remote application, you can use the jibo-command-requester, see documentation for setup:

https://confluence.jibo.com/display/SDK/Launch+a+simulation+of+the+remote+skill

Using any of the examples should establish a connection and start the remote skill, but to open the remote skill without sending a command you can use the Connect test.

Within the mono-repo: `cd packages/jibo-command-requester/examples/`
To establish a connection & launch the remote skill.

In simulator:
start the sim from `skills/be` enter `jibo sim .`
then from `packages/jibo-command-requester/examples/` enter `node Connect.js sim`

On robot:
Launch the Be skill on the robot.
From the examples run `node Connect.js` and including robot information, for example
if connecting to robot via Wi-Fi use robot name: `node Connect.js my-robot-unique-name`
if connecting to robot via direct line use robot IP: `node Connect.js ###.##.##.###`

To close the connection and in turn close the remote skill stop the example node process.
This can be done in the terminal where you ran the example using `Ctrl + C`

NOTE : Shutting down Be (or any other standalone skill) will NOT end the socket connection, this is because the socket connection is maintained by the remote service which exists within the skills-service-manager and continues to run even after the Be skill is stopped.
