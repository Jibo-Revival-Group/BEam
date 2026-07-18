# Diagnostics Skill

This skill is designed to test the robot's functionality on the manufacturing floor and during development. It is pre-installed on each robot.

## Launching The Skill

To launch the Diagnostics Skill:

**You'll need to know the robot's ip or host name and it's password.**

1. Run the following from your terminal (This will start electron our app runtime running the Diagnostics Skill)

 ```bash
 ssh root@<robot-ip-or-host-name> "/opt/jibo/Jibo/Skills/jibo-diagnostics/bin/run.sh"
 # (to stop skill run: "/opt/jibo/Jibo/Skills/jibo-diagnostics/bin/stop.sh")
 ```
2. Or from on the robot:

 ```bash
 cd /opt/jibo/Jibo/Skills/jibo-diagnostics
 ./bin/run.sh
 # to stop skill run: ./bin/stop.sh
 ```
 
3. After the skill loads you should be able to switch via a dropdown between a series of tests of the robot's functionality.

## Packaging for buildroot

1. Get diagnostics on your computer if you don't have it already (otherwise git pull origin master and skip to `npm install`)

 ```bash
 git clone git@github.jibo.com:sdk/sdk.git
 cd packages/jibo-diagnostics
 npm install
 ```
2. Update stash's [diagnostic skill](https://git.jibo.com/projects/PLAT/repos/buildroot.jibo/browse/package/jibo-diagnostics-skill)

 ```bash
 cd ../
 # pack the skill
 tar -cvzf jibo-diagnostics-skill-<version>.tar.gz \
     diagnostics --exclude='diagnostics/.git'
 
 # Copy the file to repo
 scp jibo-diagnostics-skill-<version>.tar.gz \
     <your user>@repository.jibo.com:/data001/www/sdk/jibo-diagnostics-skill/
     
 # to use later
 get shasum of tar- shasum -a 256 jibo-diagnostics-skill-<version>.tar.gz
 ```
3. Get latest and create branch of buildroot

 ```bash
 # if you don't have it already
 git clone ssh://git@git.jibo.com:7999/plat/buildroot.jibo.git
 
 # if you already had it, make sure to git pull and figure out which branch to branch from!
 cd buildroot.jibo
 
 # The branch name should be feature/<jira-ticket>-<short-description> 
 # or bugfix/<jira-ticket>-<short-description>
 # Example feature/PLATSVCS-242-added-math-lib-tests (For https://jira.jibo.com/browse/PLATSVCS-242)
 git checkout -b <branch-name> <source-branch-name if not master>
 ```
4. Update package in your buildroot branch
 
 ```bash
 # into your jibo-diagnostic-skill direcotry
 cd jibo-diagnostic-skill
 
 # Update the .hash file to use the new shasum you did in setp 2 and update the tar name
 # (https://git.jibo.com/projects/PLAT/repos/buildroot.jibo/browse/package/jibo-diagnostics-skill/jibo-diagnostics-skill.hash)
 
 # update the .mk file to specify the new version (used in the tar name)
 # (https://git.jibo.com/projects/PLAT/repos/buildroot.jibo/browse/package/jibo-diagnostics-skill/jibo-diagnostics-skill.mk)
  ```
5. Test buildroot with your branch (TBD)
6. notify Blair of your branch (in specific JIRA ticket for upcoming build)

 ```bash
 list changes
 branchname
 testing output
 ```
