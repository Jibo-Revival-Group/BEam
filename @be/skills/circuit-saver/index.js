(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.becircuitSaver = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const THREE = require("@jibo/three");
class Pose {
    constructor(name, vec) {
        this.animName = name;
        this.headOrientation = new THREE.Vector3(vec.x, vec.y, vec.z);
    }
}
let CENTER_POSES = [
    new Pose('Body_Look_Center_Middle_01', { x: 0.9010769128799438, y: -5.551115123125783e-17, z: 0.4336593551128336 }),
    new Pose('Body_Crouch_01', { x: 0.9895257949829321, y: -6.351618192512731e-8, z: 0.14435623937185668 }),
    new Pose('Body_Lean_Forward_01', { x: 0.9526615142822263, y: -7.197626028521142e-8, z: -0.30403297580888083 })
];
class BetterCenter {
    static getNearestLevelHeadPose() {
        let up = new THREE.Vector3(0, 0, 1);
        let currentPosition = jibo.expression.features.head.direction;
        let currentAngleToUp = currentPosition.angleTo(up);
        let closestPose;
        let closestAngle = 2 * Math.PI;
        let currentAngle;
        for (let pose of CENTER_POSES) {
            let poseAngleToUp = pose.headOrientation.angleTo(up);
            currentAngle = Math.abs(poseAngleToUp - currentAngleToUp);
            if (currentAngle < closestAngle) {
                closestAngle = currentAngle;
                closestPose = pose;
            }
        }
        return closestPose.animName;
    }
}
exports.default = BetterCenter;

},{"@jibo/three":undefined,"jibo":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const jibo = require("jibo");
const BetterCenter_1 = require("./BetterCenter");
const FaceWatcher_1 = require("./FaceWatcher");
const Analytics_1 = require("./analytics/Analytics");
let mainFlow = require('./flows/main');
class CircuitSaver extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.flow = null;
    }
    preload(done) {
        jibo.face.views.creator.registerClass(require('./GameView').default, 'GameView');
        this.kbm = jibo.kb.createModel('/circuit-saver');
        this.kbm.loadRoot((err, root) => {
            if (root) {
                this.root = root;
            }
            done();
        });
    }
    open(result, refresh, previousSkillName, previousSkillOptions) {
        if (refresh) {
            this.cleanup(this.open.bind(this, result, false, previousSkillName, previousSkillOptions));
            return;
        }
        Analytics_1.default.init(this);
        jibo.mim.silentMenus = false;
        jibo.face.views.forceEyeView();
        this._faceWatcher = new FaceWatcher_1.default();
        this._blackboard = {
            kbRoot: this.root,
            log: this.log,
            skill: this,
            BetterCenter: BetterCenter_1.default,
            faceWatcher: this._faceWatcher,
            Analytics: Analytics_1.default
        };
        const options = { assetPack: this.assetPack, enableLogging: true, blackboard: this._blackboard };
        this.flow = jibo.flow.run(mainFlow, options, (err, status) => {
            if (status != jibo.bt.Status.INTERRUPTED) {
                this.log.info('game exiting naturally');
                this.exit();
            }
        });
    }
    close(done) {
        jibo.face.views.creator.unregisterClass('GameView');
        this.kbm = null;
        this.cleanup(done);
    }
    cleanup(done) {
        if (this._faceWatcher) {
            this._faceWatcher.destroy();
            this._faceWatcher = null;
        }
        this._blackboard = null;
        if (this.flow) {
            let flowCleanupDone = () => {
                this.flow = null;
                this.cleanupViews(done);
            };
            this.flow.stopAndDestroy().then(flowCleanupDone).catch(flowCleanupDone);
        }
        else {
            this.cleanupViews(done);
        }
    }
    cleanupViews(done) {
        let callback = this.cleanupViewfinder.bind(this, done);
        jibo.action.configure({ orientToHJ: true });
        if (jibo.face.views.currentView) {
            if (jibo.face.views.currentView.id != 'eyeView') {
                jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => { callback(); }, () => {
                    this.log.warn('failed to cleanup on exit');
                    callback();
                });
            }
            else {
                jibo.face.views.forceEyeView(() => { callback(); }, null, jibo.face.views.IN, jibo.face.views.NONE, () => {
                    this.log.warn('failed to cleanup on exit');
                    callback();
                });
            }
        }
        else {
            callback();
        }
    }
    cleanupViewfinder(done) {
        jibo.media.setViewfinder(false, (err) => {
            if (err) {
                this.log.warn('failed to disable viewfinder on exit: ', err);
            }
            done();
        });
    }
}
exports.default = CircuitSaver;

},{"./BetterCenter":1,"./FaceWatcher":3,"./GameView":4,"./analytics/Analytics":5,"./flows/main":7,"@be/be-framework":undefined,"jibo":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const GameView_1 = require("./GameView");
const SCREEN_WIDTH = 1280;
class FaceWatcher {
    constructor() {
        if (jibo.runMode !== jibo.RunMode.SIMULATOR) {
            this.onMotionData(jibo.lps.motionData);
            this.onMotionData = this.onMotionData.bind(this);
            jibo.lps.events.motion.on(this.onMotionData);
        }
    }
    onMotionData(motionData) {
        if (motionData && motionData.entities) {
            let peeps = [];
            for (let ent of motionData.entities) {
                if (ent.description == 'person') {
                    peeps.push(ent);
                }
            }
            let trackers = [];
            let numberOfPeople = 0;
            for (let peep of peeps) {
                if (peep.parts.length && peep.parts[0].key == 'head' && peep.parts[0].value.trackers.length && peep.parts[0].value.trackers[0].rectangle) {
                    trackers.push(peep);
                    if (this.isInTrackingRange(peep.parts[0].value.trackers[0].rectangle)) {
                        numberOfPeople++;
                    }
                }
            }
            let tracker;
            let person;
            for (let peep of trackers) {
                let track = peep.parts[0].value.trackers[0];
                if (!tracker) {
                    tracker = track;
                    person = peep;
                }
                else if (Math.abs(tracker.rectangle.left + tracker.rectangle.right - SCREEN_WIDTH / 2) > Math.abs(track.rectangle.left + track.rectangle.right - SCREEN_WIDTH / 2)) {
                    tracker = track;
                    person = peep;
                }
            }
            this.currentTrack = tracker;
            this.currentPerson = person;
            this.lastNumberOfPeople = numberOfPeople;
            if (this.listener) {
                this.listener(tracker, person, numberOfPeople);
            }
        }
    }
    isInTrackingRange(lowResRectangle) {
        let lowResCenterPointX = (lowResRectangle.left + lowResRectangle.right) / 2;
        let highResCenterPointX = lowResCenterPointX * 2;
        let xOffset = (SCREEN_WIDTH / 2) - highResCenterPointX;
        return Math.abs(xOffset) < GameView_1.TRACKING_RANGE;
    }
    destroy() {
        jibo.lps.events.motion.removeListener(this.onMotionData);
        this.listener = null;
        this.currentPerson = null;
        this.currentTrack = null;
    }
}
exports.default = FaceWatcher;

},{"./GameView":4,"jibo":undefined}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const particles = require("pixi-particles");
const Analytics_1 = require("./analytics/Analytics");
let View = jibo.rendering.gui.views.View;
let sessionId = 0;
let sessionStartTime = Date.now();
const SPEED = 512;
const ACCEL_X = 12;
const ACCEL_Y = 8;
const FRICTION = 0.90;
const WIGGLE_ROOM = 16;
const FINISH_OFFSET = 280;
exports.TRACKING_RANGE = 256;
const CONTROL_CURVE = 7 / 8;
const OBSTACLE_FORGIVENESS = 16;
const COLLECTIBLE_FORGIVENESS = 4;
const SCREEN_HEIGHT = 720;
const SCREEN_WIDTH = 1280;
const OBSTACLE_VISIBILITY_BUFFER = 360;
const COLLECTABLE_VISIBILITY_BUFFER = 50;
const DUDE_SPOT = { x: 640, y: 620 };
const NUM_COLLECT_SOUNDS = 8;
const NUM_NEGATIVE_SOUNDS = 1;
const COLLECT_SOUND = 'collect_';
const NEGATIVE_SOUND = 'negative_';
const COLLISION_TTS_FREQUENCY = 5;
const DISTANCE_TO_IGNORE_MULTIPLE_PLAYERS = SCREEN_HEIGHT - FINISH_OFFSET;
const TIMEOUT = 45000;
const CENTER_TIME = 1000;
const MAX_CONSECUTIVE_NO_FACE = 5;
class GameView extends View {
    constructor(viewState) {
        super(viewState);
        this.assetPack = '';
        this.highScore = 0;
        this.newHighScore = false;
        this._score = 0;
        this.gameOver = false;
        this._invincible = false;
        this._obstaclesHit = 0;
        this._promptedForSinglePlayerThisLevel = false;
        this._currentObstacleIndex = 0;
        this._currentCollectableIndex = 0;
        this._steeringDirection = 0;
        this._velX = 0;
        this._velY = 0;
        this.LINK_MODE = {
            find: 0,
            center: 1,
            left: 2,
            right: 3,
            up: 4,
            linked: 5,
            go: 6
        };
        this.initialSearch = false;
        this._faceTracked = jibo.runMode == jibo.RunMode.SIMULATOR;
        this.currentLinkMode = this.LINK_MODE.find;
        this._mindLinkBusy = false;
        this._tutorialTimer = 0;
        this._consecutiveNoFace = 0;
        this.justLostFace = false;
        this._faceLossCounter = 1;
        this._centerTimer = 0;
        this._avatarUpdating = false;
        this.FINISHED = 'levelFinished';
        this.TIMED_OUT = 'gameTimedOut';
        this.FACE_LOST = 'faceLost';
        this.FACE_FOUND = 'faceFound';
        this.doFaceTrack = this.doFaceTrack.bind(this);
    }
    get score() {
        return this._score;
    }
    set score(newScore) {
        this._score = newScore;
        if (this.hud && this.hud.score) {
            this.hud.score.text = this._score;
        }
    }
    loaded() {
        super.loaded();
        if (jibo.runMode == 'SIMULATOR') {
            this.stage.interactive = true;
            this.stage.on('mousemove', (event) => {
                this._steeringDirection = event.data.global.x / 640 - 1;
            });
        }
        let library = this.assets.gameArt.library.library;
        this.background = new library.Background();
        this.level = new library.Level();
        this.nanoShip = new library.LittleDude();
        this.nanoShip.gotoAndStop(0);
        this.hud = new library.HudScore();
        this.scoreDisplay = new library.ScoreDisplay();
        this.scoreDisplay.gotoAndStop(0);
        this.scoreDisplay.visible = false;
        this.nanoShip.x = DUDE_SPOT.x;
        this.nanoShip.y = DUDE_SPOT.y;
        library.MindLink.prototype.setChildVisible = function (name) {
            this.left.alpha = 0;
            this.right.alpha = 0;
            this.up.alpha = 0;
            this.left.gotoAndStop(0);
            this.right.gotoAndStop(0);
            this.up.gotoAndStop(0);
            this.leftperson.alpha = 0;
            this.rightperson.alpha = 0;
            this.upperson.alpha = 0;
            if (name) {
                if (this[name]) {
                    this[name].alpha = 1;
                }
                if (this[name + 'person']) {
                    this[name + 'person'].alpha = 1;
                }
            }
        };
        this.mindLink = new library.MindLink();
        this.mindLink.visible = false;
        this.countdown = new library.Countdown();
        this.countdown.gotoAndStop(0);
        this.countdown.visible = false;
        jibo.sound.SoundUtils.addClipSounds(this.countdown);
        this.stage.addChild(this.background);
        this.stage.addChild(this.level);
        this.stage.addChild(this.hud);
        this.stage.addChild(this.mindLink);
        this.stage.addChild(this.countdown);
        this.stage.addChild(this.scoreDisplay);
        this.stage.addChild(this.nanoShip);
        this.emitter = new particles.Emitter(this.level, [PIXI.TextureCache.energy1], this.assets.particleConfig);
        this.emitter.autoUpdate = true;
        let rect;
        this.obstacles = [];
        let faceRadius = this.nanoShip.width / 2;
        let buffer = faceRadius - OBSTACLE_FORGIVENESS;
        let width, height, xBuffer, yBuffer;
        for (let obstacle of this.level.obstacles.children) {
            width = obstacle.width / obstacle.scale.x;
            height = obstacle.height / obstacle.scale.y;
            xBuffer = buffer / obstacle.scale.x;
            yBuffer = buffer / obstacle.scale.y;
            obstacle.hitArea = new PIXI.Rectangle(-0.5 * width - xBuffer, -0.5 * height - yBuffer, width + xBuffer * 2, height + yBuffer * 2);
            obstacle.visible = false;
            this.obstacles.push(obstacle);
        }
        this.collectables = [];
        buffer = faceRadius + COLLECTIBLE_FORGIVENESS;
        for (let collectable of this.level.collectables.children) {
            width = collectable.width / collectable.scale.x;
            height = collectable.height / collectable.scale.y;
            collectable.hitArea = new PIXI.Rectangle(-0.5 * width - buffer, -0.5 * height - buffer, width + buffer * 2, height + buffer * 2);
            collectable.visible = false;
            this.collectables.push(collectable);
        }
        let sortY = (a, b) => {
            return b.y - a.y;
        };
        this.collectables.sort(sortY);
        this.obstacles.sort(sortY);
        this.score = 0;
        this._obstaclesHit = 0;
        this._promptedForSinglePlayerThisLevel = false;
        this.linkStart();
        this.faceWatcher.listener = this.doFaceTrack;
        this.music = jibo.sound.play('music_loop_01');
        sessionStartTime = Date.now();
    }
    update(elapsed) {
        super.update(elapsed);
        if (this.nanoShip) {
            let secs = (elapsed / 1000);
            if (this._currentTracker) {
                if (this._currentTracker.new) {
                    this._currentTracker.new = false;
                }
                else {
                    this._currentTracker.centerPoint += this._currentTracker.velocity.x * 2 * secs;
                }
                let xPos = (this._currentTracker.centerPoint) - SCREEN_WIDTH / 2;
                this._steeringDirection = Math.min(Math.max(xPos / exports.TRACKING_RANGE, -1), 1);
                if (this._steeringDirection < 0) {
                    this._steeringDirection = -1 * Math.pow((this._steeringDirection * -1), CONTROL_CURVE);
                }
                else {
                    this._steeringDirection = Math.pow(this._steeringDirection, CONTROL_CURVE);
                }
            }
            let newAngle = this._steeringDirection * (Math.PI / 2);
            this.nanoShip.rotation = newAngle;
            if (this.currentLinkMode == this.LINK_MODE.go) {
                if (!this.gameOver && this.level.y > -this.level.finishLine.y + SCREEN_HEIGHT - FINISH_OFFSET) {
                    this.log.info(`Finishline crossed! New score: ${this.score} High score: ${this.highScore}`);
                    this.gameOver = true;
                    this.music.stop();
                    this.nanoShip.fire.visible = false;
                    this.hud.visible = false;
                    this.scoreDisplay.graphics.yourScore.text = this.score;
                    this.newHighScore = this.score > this.highScore;
                    if (this.newHighScore) {
                        this.scoreDisplay.graphics.highScore.text = `New High Score!`;
                        this.highScore = this.score;
                    }
                    else {
                        this.scoreDisplay.graphics.highScore.text = `High Score: ${this.highScore}`;
                    }
                    this.scoreDisplay.visible = true;
                    PIXI.animate.Animator.play(this.scoreDisplay, 'show');
                    jibo.sound.play('finishline', () => { this.emit(this.FINISHED); });
                }
                if (!this.level.finishLine.visible && this.level.y > -this.level.finishLine.y - OBSTACLE_VISIBILITY_BUFFER) {
                    this.level.finishLine.visible = true;
                }
                newAngle += Math.PI / 2;
                this._velX *= FRICTION;
                this._velX += Math.cos(newAngle) * ACCEL_X * secs;
                this._velY *= FRICTION;
                this._velY += Math.sin(newAngle) * ACCEL_Y * secs;
                let magnitude = Math.sqrt(this._velX * this._velX + this._velY * this._velY);
                if (magnitude > 1) {
                    this._velX *= 1 / magnitude;
                    this._velY *= 1 / magnitude;
                }
                const X_CONSTRAINT = 640;
                let levelX = this.level.x + this._velX * SPEED * secs;
                if (levelX > X_CONSTRAINT) {
                    levelX = X_CONSTRAINT;
                    this._velX *= -0.5;
                }
                else if (levelX < -X_CONSTRAINT) {
                    levelX = -X_CONSTRAINT;
                    this._velX *= -0.5;
                }
                this.level.x += this._velX * SPEED * secs;
                this.level.y += this._velY * SPEED * secs;
                if (this.level.y >= -this.level.finishLine.y) {
                    this.background.y = this.level.y + this.level.finishLine.y;
                }
                this.background.x = this.level.x;
                this.nanoShip.x = DUDE_SPOT.x - WIGGLE_ROOM * this._velX;
                this.nanoShip.y = DUDE_SPOT.y - WIGGLE_ROOM * this._velY;
                let point = new PIXI.Point();
                let i;
                let obstacle;
                for (i = this._currentObstacleIndex; i < this.obstacles.length; i++) {
                    obstacle = this.obstacles[i];
                    if (obstacle.y < -this.level.y - OBSTACLE_VISIBILITY_BUFFER) {
                        obstacle.visible = false;
                        break;
                    }
                    else if (obstacle.y > -this.level.y + SCREEN_HEIGHT + OBSTACLE_VISIBILITY_BUFFER) {
                        obstacle.visible = false;
                        this._currentObstacleIndex = i;
                    }
                    else {
                        obstacle.visible = true;
                        obstacle.toLocal(this.nanoShip.position, null, point, false);
                        if (obstacle.hitArea.contains(point.x, point.y)) {
                            if (!obstacle.hit && !this._invincible) {
                                if (this._obstaclesHit % COLLISION_TTS_FREQUENCY === 0) {
                                    let promptId = Math.floor(Math.random() * this.assets.prompts.hitPrompts.length);
                                    jibo.tts.speak(this.assets.prompts.hitPrompts[promptId]);
                                    Analytics_1.default.collisionWarning(promptId);
                                }
                                this._obstaclesHit++;
                                let nuPoint = new PIXI.Point();
                                this.level.toLocal(this.nanoShip.position, null, nuPoint, false);
                                this.emitter.updateSpawnPos(nuPoint.x, nuPoint.y);
                                this.emitter.resetPositionTracking();
                                this.emitter.emit = true;
                                this.playNegativeSound();
                                obstacle.hit = true;
                                this.score = Math.max(0, this.score - 5);
                                this._invincible = true;
                                PIXI.animate.Animator.play(this.nanoShip, 'hurtrocket', () => {
                                    this._invincible = false;
                                    if (this.nanoShip) {
                                        this.nanoShip.gotoAndStop(0);
                                    }
                                });
                            }
                        }
                    }
                }
                let collectable;
                for (i = this._currentCollectableIndex; i < this.collectables.length; i++) {
                    collectable = this.collectables[i];
                    if (collectable.y < -this.level.y - COLLECTABLE_VISIBILITY_BUFFER) {
                        collectable.visible = false;
                        break;
                    }
                    else if (collectable.y > -this.level.y + SCREEN_HEIGHT + COLLECTABLE_VISIBILITY_BUFFER) {
                        collectable.visible = false;
                        this._currentCollectableIndex = i;
                    }
                    else if (!collectable.hit) {
                        collectable.visible = true;
                        collectable.toLocal(this.nanoShip.position, null, point, false);
                        if (collectable.hitArea.contains(point.x, point.y)) {
                            collectable.visible = false;
                            collectable.hit = true;
                            this.playCollectSound();
                            this.score++;
                        }
                    }
                }
            }
            else {
                this.mindLinkUpdate(elapsed);
            }
        }
    }
    mindLinkUpdate(elapsed) {
        if (this.mindLink.face.visible) {
            this.mindLink.face.x = this._steeringDirection * 320 + 640;
        }
        if (this._mindLinkBusy) {
            return;
        }
        this._tutorialTimer += elapsed;
        if (this._tutorialTimer > TIMEOUT) {
            this._tutorialTimer = 0;
            if (this.tutorialCB) {
                this.log.info('tutorial timeout');
                this.tutorialCB('timeout');
                return;
            }
            else {
                this.log.info('game timeout');
                this.emit(this.TIMED_OUT);
            }
        }
        switch (this.currentLinkMode) {
            case this.LINK_MODE.find:
                if (this._faceTracked) {
                    this._mindLinkBusy = true;
                    jibo.sound.play('facelock1', () => {
                        let doStuff = () => {
                            if (this.tutorialCB) {
                                this.tutorialCB(this.linkCenter.bind(this));
                            }
                            else {
                                this.linkCenter();
                            }
                        };
                        if (this.justLostFace) {
                            jibo.action.configure({ orientToHJ: false });
                            jibo.expression.setAttentionMode(jibo.expression.AttentionMode.OFF)
                                .catch((err) => { this.log.warn('Attention mode not set. ', err); })
                                .then(() => {
                                if (!this.nanoShip) {
                                    return;
                                }
                                const options = { enableLogging: true, assetPack: this.assetPack, blackboard: this.blackboard };
                                this.faceYou = jibo.flow.run(require('./flows/faceYou'), options, (err, status) => {
                                    if (status != jibo.bt.Status.INTERRUPTED) {
                                        this.justLostFace = false;
                                        doStuff();
                                    }
                                });
                            });
                        }
                        else {
                            doStuff();
                        }
                    });
                }
                break;
            case this.LINK_MODE.center:
                if (this._steeringDirection > -0.125 && this._steeringDirection < 0.125) {
                    this._centerTimer += elapsed;
                    if (this._centerTimer >= CENTER_TIME) {
                        this.mindLink.up.gotoAndStop(1);
                        this._mindLinkBusy = true;
                        this.nanoShip.alpha = 1;
                        jibo.sound.play('facelock2', () => {
                            if (this.tutorialCB) {
                                this.tutorialCB(this.linkLeft.bind(this));
                            }
                            else {
                                this.linkLeft();
                            }
                        });
                    }
                }
                else {
                    this._centerTimer = 0;
                }
                break;
            case this.LINK_MODE.left:
                if (this._steeringDirection < -0.5) {
                    this.mindLink.left.gotoAndStop(1);
                    this._mindLinkBusy = true;
                    jibo.sound.play('facelock3', () => {
                        if (this.tutorialCB) {
                            this.tutorialCB(this.linkRight.bind(this));
                        }
                        else {
                            this.linkRight();
                        }
                    });
                }
                break;
            case this.LINK_MODE.right:
                if (this._steeringDirection > 0.5) {
                    this.mindLink.right.gotoAndStop(1);
                    this._mindLinkBusy = true;
                    jibo.sound.play('facelock4', () => {
                        if (this.tutorialCB) {
                            this.tutorialCB(this.linkUp.bind(this));
                        }
                        else {
                            this.linkUp();
                        }
                    });
                }
                break;
            case this.LINK_MODE.up:
                if (this._steeringDirection > -0.1 && this._steeringDirection < 0.1) {
                    this.mindLink.up.gotoAndStop(1);
                    this._mindLinkBusy = true;
                    Analytics_1.default.calibrated(!!this.tutorialCB, true, this.level.y !== 0);
                    jibo.sound.play('facelock5', () => {
                        if (this.tutorialCB) {
                            this.tutorialCB(this.linkedUp.bind(this));
                        }
                        else {
                            this.linkedUp();
                        }
                    });
                }
                break;
        }
    }
    linkStart() {
        if (!this.nanoShip) {
            return;
        }
        this.currentLinkMode = this.LINK_MODE.find;
        this.mindLink.visible = true;
        this.mindLink.setChildVisible();
        this.mindLink.instructions.text = `Looking for a player's face...`;
        this._steeringDirection = 0;
        this._velX = 0;
        this._velY = 0;
        this._tutorialTimer = 0;
        this.nanoShip.fire.visible = false;
        this.nanoShip.alpha = 0;
        let done = () => {
            if (this.justLostFace) {
                jibo.action.configure({ orientToHJ: true });
                jibo.expression.setAttentionMode(jibo.expression.AttentionMode.ATTRACTABLE).then(() => {
                    this._mindLinkBusy = false;
                }).catch(() => {
                    this._mindLinkBusy = false;
                });
            }
            else {
                this._mindLinkBusy = false;
            }
        };
        jibo.media.getViewfinder((err, data) => {
            if (this.state !== jibo.face.views.LOADED && this.state !== jibo.face.views.OPENED) {
                jibo.log.warn('CircuitSaver: got viewfinder status after game already destroyed. Not detecting this would have been bad.');
                return;
            }
            if (data && data.enable) {
                done();
            }
            else {
                jibo.media.setViewfinder(true, { x: 0, y: 0, width: 1280, height: 720, camera: 0 }).then(done).catch(done);
            }
        });
    }
    linkCenter() {
        if (!this.nanoShip) {
            return;
        }
        this._centerTimer = 0;
        this.mindLink.face.visible = true;
        this.currentLinkMode = this.LINK_MODE.center;
        this.mindLink.instructions.text = 'Line-up your face...';
        this.mindLink.setChildVisible();
        this.mindLink.upperson.alpha = 1;
        this._mindLinkBusy = false;
        this._tutorialTimer = 0;
        jibo.media.setViewfinder(false);
    }
    linkLeft() {
        if (!this.nanoShip) {
            return;
        }
        this.mindLink.face.visible = false;
        this.currentLinkMode = this.LINK_MODE.left;
        this.mindLink.instructions.text = 'Lean to the left...';
        this.mindLink.setChildVisible('left');
        this._mindLinkBusy = false;
        this._tutorialTimer = 0;
    }
    linkRight() {
        if (!this.nanoShip) {
            return;
        }
        this.currentLinkMode = this.LINK_MODE.right;
        this.mindLink.instructions.text = 'Lean to the right...';
        this.mindLink.setChildVisible('right');
        this._mindLinkBusy = false;
        this._tutorialTimer = 0;
    }
    linkUp() {
        if (!this.nanoShip) {
            return;
        }
        this.currentLinkMode = this.LINK_MODE.up;
        this.mindLink.instructions.text = 'And back to center to start!';
        this.mindLink.setChildVisible();
        this.mindLink.up.alpha = 1;
        this._mindLinkBusy = false;
        this._tutorialTimer = 0;
    }
    linkedUp() {
        if (!this.nanoShip) {
            return;
        }
        this.currentLinkMode = this.LINK_MODE.linked;
        this.mindLink.visible = false;
        this._mindLinkBusy = false;
        this._tutorialTimer = 0;
        this.countdown.visible = true;
        PIXI.animate.Animator.play(this.countdown, 'countdown', this.go.bind(this));
    }
    go() {
        if (!this.nanoShip) {
            return;
        }
        this.countdown.visible = false;
        this.nanoShip.fire.visible = true;
        this.currentLinkMode = this.LINK_MODE.go;
    }
    doFaceTrack(tracker, person, numberOfPeople) {
        if (!this.nanoShip) {
            return;
        }
        if (!tracker && this._faceTracked && this._consecutiveNoFace === 0 && !this.gameOver) {
            this.log.warn('lost a face:', {
                session: sessionId,
                gametime: Date.now() - sessionStartTime,
                linkMode: this.currentLinkMode,
                rect: this._currentTracker ? this._currentTracker.rectangle : null
            });
        }
        if (!tracker && (this.initialSearch || (this._faceTracked && !this._mindLinkBusy && this.currentLinkMode !== this.LINK_MODE.linked && !this.gameOver && !this.justLostFace && ++this._consecutiveNoFace > MAX_CONSECUTIVE_NO_FACE))) {
            this._faceTracked = false;
            this.initialSearch = false;
            this.justLostFace = true;
            if (this.tutorialCB) {
                this.log.warn('face-track lost during tutorial. Current link mode: ', this.currentLinkMode);
                this._mindLinkBusy = true;
                this.tutorialCB(this.linkStart.bind(this));
            }
            else {
                this.log.warn('face-track lost during game. Current link mode: ', this.currentLinkMode);
                if (this.currentLinkMode === this.LINK_MODE.go) {
                    this.playLostPrompt();
                }
                this.linkStart();
            }
        }
        else if (tracker) {
            this.checkSinglePlayer(numberOfPeople);
            this._consecutiveNoFace = 0;
            this._faceTracked = true;
            tracker.centerPoint = tracker.rectangle.left + tracker.rectangle.right;
            tracker.new = true;
            this._currentTracker = tracker;
            if ((!this._currentPlayer || this._currentPlayer._id != person.id_summary.name) && !this._avatarUpdating && person.id_summary.name != 'UNKNOWN') {
                this.updateAvatar(person);
            }
        }
    }
    playLostPrompt() {
        if (++this._faceLossCounter % 3 == 0) {
            jibo.tts.speak(this.assets.prompts.lpsHintPrompts[Math.floor(Math.random() * this.assets.prompts.lpsHintPrompts.length)]);
        }
        else if (this._faceLossCounter > 2) {
            jibo.tts.speak(this.assets.prompts.lostPromptsShort[Math.floor(Math.random() * this.assets.prompts.lostPromptsShort.length)]);
        }
        else {
            jibo.tts.speak(this.assets.prompts.lostPrompts[Math.floor(Math.random() * this.assets.prompts.lostPrompts.length)]);
        }
    }
    get distanceToFinishLine() {
        let finishLineY = -this.level.finishLine.y + SCREEN_HEIGHT - FINISH_OFFSET;
        return finishLineY - this.level.y;
    }
    checkSinglePlayer(numberOfPeople) {
        let askForSinglePlayer = ((numberOfPeople > 1)
            && (!this._promptedForSinglePlayerThisLevel)
            && (!this.tutorialCB)
            && (!jibo.tts.isTalking)
            && (this.distanceToFinishLine > DISTANCE_TO_IGNORE_MULTIPLE_PLAYERS));
        if (askForSinglePlayer) {
            if (this.currentLinkMode === this.LINK_MODE.go) {
                this._promptedForSinglePlayerThisLevel = true;
                jibo.tts.speak(this.assets.prompts.singlePlayer[Math.floor(Math.random() * this.assets.prompts.singlePlayer.length)], (err) => {
                    if (err) {
                        this.log.warn("Error asking for single player", err);
                        this._promptedForSinglePlayerThisLevel = false;
                    }
                });
            }
        }
    }
    resetGame() {
        sessionId++;
        sessionStartTime = Date.now();
        this.linkStart();
        this.hud.visible = true;
        this.music.play();
        this.level.finishLine.visible = false;
        this.scoreDisplay.visible = false;
        this.gameOver = false;
        this._obstaclesHit = 0;
        this._promptedForSinglePlayerThisLevel = false;
        this.score = 0;
        this.level.y = 0;
        this.level.x = 0;
        this.background.x = 0;
        this.background.y = 0;
        this._currentObstacleIndex = 0;
        this._currentCollectableIndex = 0;
        this._faceLossCounter = 1;
        for (let collectable of this.collectables) {
            collectable.visible = true;
            collectable.hit = false;
        }
        for (let obstacle of this.obstacles) {
            obstacle.hit = false;
        }
    }
    updateAvatar(person) {
        this._avatarUpdating = true;
        if (person.id_summary.name == 'NOT_TRAINED') {
            this.log.info('current player is identified as un-enrolled');
            this._currentPlayer = { _id: person.id_summary.name };
            this._removeAvatar();
            this._avatarUpdating = false;
            return;
        }
        jibo.kb.loop.getUserNodeById(person.id_summary.name, (err, userNode) => {
            if (!this.nanoShip) {
                return;
            }
            if (err || !userNode) {
                this.log.error('Identified user not found. ', err);
                this._avatarUpdating = false;
                return;
            }
            this._currentPlayer = userNode;
            let photos = userNode.getAssets('photo');
            if (photos.length) {
                if (this._personAsset && this._personAsset.id === photos[0]._id) {
                    this.log.warn('ignoring attempt to load same avatar asset again');
                    this._avatarUpdating = false;
                    return;
                }
                this.log.info('current player identified and has photo');
                this._removeAvatar();
                this._personAsset = {
                    id: photos[0]._id,
                    src: photos[0].fullFilenameOrURL(),
                    type: 'texture'
                };
                this.addAssets(this._personAsset, (err) => {
                    if (!this.nanoShip) {
                        return;
                    }
                    if (err || !this.assets[this._personAsset.id]) {
                        this._avatarUpdating = false;
                        this.log.warn('player photo failed to load', err);
                        return;
                    }
                    this._personPhoto = new PIXI.Sprite(this.assets[this._personAsset.id]);
                    this.nanoShip.faceHolder.addChild(this._personPhoto);
                    this._avatarUpdating = false;
                });
            }
            else {
                this.log.info('current player identified and has no photo');
                this._removeAvatar();
                this._avatarUpdating = false;
            }
        });
    }
    _removeAvatar() {
        if (this._personPhoto) {
            this.nanoShip.faceHolder.removeChild(this._personPhoto);
            this._personPhoto.destroy();
            this._personPhoto = null;
        }
        if (this._personAsset) {
            this.removeAssets(this._personAsset);
            this._personAsset = null;
        }
    }
    playCollectSound() {
        jibo.sound.play(COLLECT_SOUND + (Math.floor(Math.random() * NUM_COLLECT_SOUNDS) + 1));
    }
    playNegativeSound() {
        jibo.sound.play(NEGATIVE_SOUND + (Math.floor(Math.random() * NUM_NEGATIVE_SOUNDS) + 1));
    }
    destroy() {
        super.destroy();
        if (this.currentLinkMode !== this.LINK_MODE.go && this.currentLinkMode !== this.LINK_MODE.linked) {
            Analytics_1.default.calibrated(!!this.tutorialCB, false, this.level ? this.level.y !== 0 : false);
        }
        this.tutorialCB = null;
        this.score = null;
        this.gameOver = null;
        if (this.music && !this.music.paused) {
            this.music.stop();
        }
        if (this.emitter) {
            this.emitter.destroy();
        }
        this.emitter = null;
        this.music = null;
        this.nanoShip = null;
        this.mindLink = null;
        this.level = null;
        this.background = null;
        this.obstacles = null;
        this.collectables = null;
        if (this.faceWatcher) {
            this.faceWatcher.listener = null;
            this.faceWatcher = null;
        }
        this.initialSearch = null;
        this.blackboard = null;
        this._currentTracker = null;
        this._steeringDirection = null;
        this._velX = null;
        this._velY = null;
        this._faceTracked = null;
        this.currentLinkMode = null;
        this._avatarUpdating = null;
        this._personPhoto = null;
        this._personAsset = null;
        this._currentPlayer = null;
        this.log = null;
        this.assetPack = null;
    }
}
exports.default = GameView;

},{"./analytics/Analytics":5,"./flows/faceYou":6,"jibo":undefined,"pixi-particles":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const YEAR_IN_MS = 31536000000;
class Analytics {
    static init(skill) {
        this._track = skill.track;
        this._playerAge = -1;
        let speaker = jibo.lps.identity.getActiveSpeaker();
        if (speaker && speaker.idInfo && speaker.idInfo.id) {
            jibo.kb.loop.getUserNodeById(speaker.idInfo.id, (err, looper) => {
                if (!err && looper && looper.data && typeof looper.data.birthday === 'number') {
                    this._playerAge = Math.floor((Date.now() - looper.data.birthday) / YEAR_IN_MS);
                }
            });
        }
    }
    static calibrated(is_initial, success, after_face_lost) {
        this._track('CircuitSaver Calibrated', { is_initial, success, player_age: this._playerAge, after_face_lost });
    }
    static collisionWarning(prompt_id) {
        this._track('CircuitSaver Collision Warning', { prompt_id });
    }
    static gameFinished(score, replay_number) {
        this._track('CircuitSaver Game Finished', { score, replay_number });
    }
}
Analytics._playerAge = -1;
exports.default = Analytics;

},{"jibo":undefined}],6:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'faceYou',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/circuit-saver/src/flows/faceYou.flow'
        },
        '073a1d99-cfc2-414f-ba91-c541ad4273af': function () {
            return {
                'id': '073a1d99-cfc2-414f-ba91-c541ad4273af',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '073a1d99-cfc2-414f-ba91-c541ad4273af',
                        'to': '564a65a8-3a60-4fe1-9807-51edb34439eb',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        '24228197-55c8-4c11-b0d5-37367a4697e2': function () {
            return {
                'id': '24228197-55c8-4c11-b0d5-37367a4697e2',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '037a938f-e9b3-4de0-b50d-dd1d79c267ae': function () {
            return {
                'id': '037a938f-e9b3-4de0-b50d-dd1d79c267ae',
                'name': 'Body_Lean_Forward_01',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '037a938f-e9b3-4de0-b50d-dd1d79c267ae',
                        'to': '24228197-55c8-4c11-b0d5-37367a4697e2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'PlayAnimation',
                'options': {
                    'animSelector': 3,
                    'animPath': '',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animPathFunction': () => {
                        return notepad.centerPose;
                    },
                    'animName': 'Body_Lean_Forward_01',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '5d93d16e-7109-4ee2-9d7b-f25844dfa88c': function () {
            return {
                'id': '5d93d16e-7109-4ee2-9d7b-f25844dfa88c',
                'name': 'Body_Crouch_01',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5d93d16e-7109-4ee2-9d7b-f25844dfa88c',
                        'to': '24228197-55c8-4c11-b0d5-37367a4697e2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'PlayAnimation',
                'options': {
                    'animSelector': 3,
                    'animPath': '',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animName': 'Body_Crouch_01',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        'd47cb0c6-40a0-4594-a49d-f3f9397f4f11': function () {
            return {
                'id': 'd47cb0c6-40a0-4594-a49d-f3f9397f4f11',
                'name': 'Body_Look_Center_Middle_01',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd47cb0c6-40a0-4594-a49d-f3f9397f4f11',
                        'to': '24228197-55c8-4c11-b0d5-37367a4697e2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'PlayAnimation',
                'options': {
                    'animSelector': 3,
                    'animPath': '',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animName': 'Body_Look_Center_Middle_01',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '3d6b3d91-b741-4fdb-ba7c-cc1e5b71bd3e': function () {
            return {
                'id': '3d6b3d91-b741-4fdb-ba7c-cc1e5b71bd3e',
                'name': 'Body_Lean_Back_01',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3d6b3d91-b741-4fdb-ba7c-cc1e5b71bd3e',
                        'to': '24228197-55c8-4c11-b0d5-37367a4697e2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'PlayAnimation',
                'options': {
                    'animSelector': 3,
                    'animPath': '',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animName': 'Body_Lean_Back_01',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '53129ca4-8fc3-4795-a401-e6cb9e2b4bf3': function () {
            return {
                'id': '53129ca4-8fc3-4795-a401-e6cb9e2b4bf3',
                'name': 'strike a pose',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '53129ca4-8fc3-4795-a401-e6cb9e2b4bf3',
                        'to': '037a938f-e9b3-4de0-b50d-dd1d79c267ae',
                        'value': 'Body_Lean_Forward_01'
                    },
                    {
                        'frm': '53129ca4-8fc3-4795-a401-e6cb9e2b4bf3',
                        'to': '5d93d16e-7109-4ee2-9d7b-f25844dfa88c',
                        'value': 'Body_Crouch_01'
                    },
                    {
                        'frm': '53129ca4-8fc3-4795-a401-e6cb9e2b4bf3',
                        'to': 'd47cb0c6-40a0-4594-a49d-f3f9397f4f11',
                        'value': ''
                    },
                    {
                        'frm': '53129ca4-8fc3-4795-a401-e6cb9e2b4bf3',
                        'to': '3d6b3d91-b741-4fdb-ba7c-cc1e5b71bd3e',
                        'value': 'Body_Lean_Back_01'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let pose = blackboard.BetterCenter.getNearestLevelHeadPose();
                        blackboard.log.info(`nearest level-head pose to target is ${ pose }`);
                        return pose;
                    }
                }
            };
        },
        '20f42e67-4da6-4275-99ea-15383029a012': function () {
            return {
                'id': '20f42e67-4da6-4275-99ea-15383029a012',
                'name': 'do lookat',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '20f42e67-4da6-4275-99ea-15383029a012',
                        'to': 'd47cb0c6-40a0-4594-a49d-f3f9397f4f11',
                        'value': 'noFace'
                    },
                    {
                        'frm': '20f42e67-4da6-4275-99ea-15383029a012',
                        'to': '53129ca4-8fc3-4795-a401-e6cb9e2b4bf3',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let currentFace = blackboard.faceWatcher.currentPerson;
                        if (currentFace) {
                            blackboard.originalFace = currentFace;
                        }
                        if (blackboard.originalFace) {
                            jibo.expression.acquireTarget({ entity: blackboard.originalFace }).then(acquireHandle => {
                                return acquireHandle.promise;
                            }).then(() => {
                                done();
                            }).catch(err => {
                                blackboard.log.warn('acquireTarget failed. ', err);
                                done('noFace');
                            });
                        } else {
                            blackboard.log.info('no face found, using default center pose.');
                            done('noFace');
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '3f5cfc7d-03f1-4540-b180-292d94baa46c': {
            'id': '3f5cfc7d-03f1-4540-b180-292d94baa46c',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '564a65a8-3a60-4fe1-9807-51edb34439eb': function () {
            return {
                'id': '564a65a8-3a60-4fe1-9807-51edb34439eb',
                'name': 'set attention mode off',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '564a65a8-3a60-4fe1-9807-51edb34439eb',
                        'to': '20f42e67-4da6-4275-99ea-15383029a012',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.action.configure({ orientToHJ: false });
                        jibo.expression.setAttentionMode(jibo.expression.AttentionMode.OFF).catch(err => {
                            blackboard.log.warn('Attention mode not set. ', err);
                        }).then(() => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        }
    };
};
},{}],7:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/circuit-saver/src/flows/main.flow'
        },
        '31a533be-4f4a-4c1d-8121-d52a804e3314': function () {
            return {
                'id': '31a533be-4f4a-4c1d-8121-d52a804e3314',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '31a533be-4f4a-4c1d-8121-d52a804e3314',
                        'to': '606845c7-008a-43fc-8475-e01c0bba1be9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        'f5a9b048-f1b6-4574-b17a-8f65290472e0': function () {
            return {
                'id': 'f5a9b048-f1b6-4574-b17a-8f65290472e0',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '43253da1-01c1-40e7-9c59-9bb19fb2a54a': function () {
            return {
                'id': '43253da1-01c1-40e7-9c59-9bb19fb2a54a',
                'name': 'prep game view',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '43253da1-01c1-40e7-9c59-9bb19fb2a54a',
                        'to': '72914d24-ba51-4b95-abc6-e883e7575933',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.numReplays = 0;
                        notepad.game = jibo.face.views.createView('GameView', 'assets/GameView.json', false);
                        notepad.nextTutorialStep = null;
                        notepad.stepSkippable = false;
                        notepad.game.log = blackboard.log;
                        notepad.game.assetPack = blackboard.skill.assetPack;
                        notepad.game.faceWatcher = blackboard.faceWatcher;
                        notepad.game.blackboard = blackboard;
                        notepad.game.tutorialCB = nextStep => {
                            notepad.nextTutorialStep = nextStep;
                            if (notepad.stepSkippable) {
                                jibo.mim.end.emit();
                            }
                        };
                        if (blackboard.kbRoot.data.highScore) {
                            notepad.game.highScore = blackboard.kbRoot.data.highScore;
                        }
                        jibo.face.views.changeView({
                            addView: notepad.game,
                            transitionOpen: jibo.face.views.IN
                        }, () => {
                            done();
                        }, () => {
                            blackboard.log.error('failed to load game view');
                            done('~fail');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '35dce1f0-95c5-4e7e-a8f4-80cd7673007b': function () {
            return {
                'id': '35dce1f0-95c5-4e7e-a8f4-80cd7673007b',
                'name': 'C S_ Catastrophe',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '35dce1f0-95c5-4e7e-a8f4-80cd7673007b',
                        'to': '563903ed-c0d3-406d-bd27-297024c7b0ce',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_Catastrophe.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'c7d6cc74-4900-4315-ba01-12bbca26448b': function () {
            return {
                'id': 'c7d6cc74-4900-4315-ba01-12bbca26448b',
                'name': '~fail',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c7d6cc74-4900-4315-ba01-12bbca26448b',
                        'to': '35dce1f0-95c5-4e7e-a8f4-80cd7673007b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return '';
                    }
                }
            };
        },
        '563903ed-c0d3-406d-bd27-297024c7b0ce': function () {
            return {
                'id': '563903ed-c0d3-406d-bd27-297024c7b0ce',
                'name': 'error',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '93af4ce2-4aee-4f3f-a27f-cf2a08ca403b': function () {
            return {
                'id': '93af4ce2-4aee-4f3f-a27f-cf2a08ca403b',
                'name': 'gameplay',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '93af4ce2-4aee-4f3f-a27f-cf2a08ca403b',
                        'to': 'bf1f3513-7a4b-47d9-a4c2-7c50061b8c08',
                        'value': 'timeout'
                    },
                    {
                        'frm': '93af4ce2-4aee-4f3f-a27f-cf2a08ca403b',
                        'to': '9d6f7fc5-e938-4066-85a4-671478248a0c',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.onGameFinished = () => {
                            notepad.game.removeListener(notepad.game.TIMED_OUT, notepad.onGameTimeout);
                            done();
                        };
                        notepad.onGameTimeout = () => {
                            notepad.game.removeListener(notepad.game.FINISHED, notepad.onGameFinished);
                            done('timeout');
                        };
                        notepad.game.once(notepad.game.FINISHED, notepad.onGameFinished);
                        notepad.game.once(notepad.game.TIMED_OUT, notepad.onGameTimeout);
                    },
                    'onStop': () => {
                        notepad.game.removeListener(notepad.game.FINISHED, notepad.onGameFinished);
                        notepad.game.removeListener(notepad.game.TIMED_OUT, notepad.onGameTimeout);
                    }
                }
            };
        },
        '9d6f7fc5-e938-4066-85a4-671478248a0c': function () {
            return {
                'id': '9d6f7fc5-e938-4066-85a4-671478248a0c',
                'name': 'C S_ You Finished',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9d6f7fc5-e938-4066-85a4-671478248a0c',
                        'to': 'd5bd46eb-29a2-47d1-8220-2dd91caeb2a1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_YouFinished.mim',
                    'getPromptData': () => {
                        return {
                            score: notepad.game.score,
                            highscore: notepad.game.newHighScore
                        };
                    }
                }
            };
        },
        '976b1447-3694-48b2-a5fb-5ee33a048c30': function () {
            return {
                'id': '976b1447-3694-48b2-a5fb-5ee33a048c30',
                'name': 'show eye',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '976b1447-3694-48b2-a5fb-5ee33a048c30',
                        'to': '9f98b03f-2a4b-4fd3-8d11-dc8c9798b580',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let eye = jibo.face.views.createView('EyeView', null, false);
                        jibo.face.views.changeView({
                            addView: eye,
                            pause: {
                                alpha: 1,
                                duration: 500
                            }
                        }, () => {
                            done();
                        }, () => {
                            done('~fail');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'e08bd516-2e52-4bcb-8bb0-94f8b486737d': function () {
            return {
                'id': 'e08bd516-2e52-4bcb-8bb0-94f8b486737d',
                'name': 'C S_ Play Again',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'e08bd516-2e52-4bcb-8bb0-94f8b486737d',
                        'to': 'bd5502af-6dd7-4177-8e14-cee3008ade9b',
                        'value': ''
                    },
                    {
                        'frm': 'e08bd516-2e52-4bcb-8bb0-94f8b486737d',
                        'to': '5cb99502-4690-4377-96dd-2d73814af49e',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': 'e08bd516-2e52-4bcb-8bb0-94f8b486737d',
                        'to': 'bd5502af-6dd7-4177-8e14-cee3008ade9b',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/CS_PlayAgain.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        return results.asrResults.intent;
                    },
                    'onFailure': results => {
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        'bd5502af-6dd7-4177-8e14-cee3008ade9b': function () {
            return {
                'id': 'bd5502af-6dd7-4177-8e14-cee3008ade9b',
                'name': 'C S_ Maybe Later',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'bd5502af-6dd7-4177-8e14-cee3008ade9b',
                        'to': 'f5a9b048-f1b6-4574-b17a-8f65290472e0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_MaybeLater.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '5cb99502-4690-4377-96dd-2d73814af49e': function () {
            return {
                'id': '5cb99502-4690-4377-96dd-2d73814af49e',
                'name': 'C S_ Good Play Again',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5cb99502-4690-4377-96dd-2d73814af49e',
                        'to': '4c2feb91-a74c-463d-b555-21257335bc2f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_GoodPlayAgain.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '232497da-6a77-4a4e-9cfc-42d5479a53c1': function () {
            return {
                'id': '232497da-6a77-4a4e-9cfc-42d5479a53c1',
                'name': 'reset game',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '232497da-6a77-4a4e-9cfc-42d5479a53c1',
                        'to': '93af4ce2-4aee-4f3f-a27f-cf2a08ca403b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.numReplays++;
                        notepad.game.resetGame();
                        jibo.face.views.changeView({ remove: true }, () => {
                            done();
                        }, () => {
                            done('~fail');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '9f98b03f-2a4b-4fd3-8d11-dc8c9798b580': function () {
            return {
                'id': '9f98b03f-2a4b-4fd3-8d11-dc8c9798b580',
                'name': 'grade score',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '9f98b03f-2a4b-4fd3-8d11-dc8c9798b580',
                        'to': 'ad50f4b8-3ec2-479b-a645-03c0b3d63313',
                        'value': 'medium'
                    },
                    {
                        'frm': '9f98b03f-2a4b-4fd3-8d11-dc8c9798b580',
                        'to': '0a93e96a-3cf6-434f-8efb-5df553c7351e',
                        'value': 'low'
                    },
                    {
                        'frm': '9f98b03f-2a4b-4fd3-8d11-dc8c9798b580',
                        'to': '5ef5b56d-6571-4e98-b85e-d45042306bd9',
                        'value': 'high'
                    },
                    {
                        'frm': '9f98b03f-2a4b-4fd3-8d11-dc8c9798b580',
                        'to': 'c3d53b52-5327-40fd-a372-f8dfedcaa511',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.action.configure({ orientToHJ: true });
                        jibo.expression.setAttentionMode(jibo.expression.AttentionMode.ENGAGED).catch(err => {
                            blackboard.log.warn('Attention mode not set. ', err);
                        }).then(handle => {
                            if (notepad.game.score == 0) {
                                done('zero');
                            } else if (notepad.game.score >= 200) {
                                done('high');
                            } else if (notepad.game.score >= 120) {
                                done('medium');
                            } else {
                                done('low');
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '0a93e96a-3cf6-434f-8efb-5df553c7351e': function () {
            return {
                'id': '0a93e96a-3cf6-434f-8efb-5df553c7351e',
                'name': 'C S_ Low Score',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0a93e96a-3cf6-434f-8efb-5df553c7351e',
                        'to': 'e08bd516-2e52-4bcb-8bb0-94f8b486737d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_LowScore.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'ad50f4b8-3ec2-479b-a645-03c0b3d63313': function () {
            return {
                'id': 'ad50f4b8-3ec2-479b-a645-03c0b3d63313',
                'name': 'C S_ Medium Score',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ad50f4b8-3ec2-479b-a645-03c0b3d63313',
                        'to': 'e08bd516-2e52-4bcb-8bb0-94f8b486737d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_MediumScore.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '5ef5b56d-6571-4e98-b85e-d45042306bd9': function () {
            return {
                'id': '5ef5b56d-6571-4e98-b85e-d45042306bd9',
                'name': 'C S_ High Score',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5ef5b56d-6571-4e98-b85e-d45042306bd9',
                        'to': 'e08bd516-2e52-4bcb-8bb0-94f8b486737d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_HighScore.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '15c594d6-9926-40f7-ac15-bc0f8443e809': function () {
            return {
                'id': '15c594d6-9926-40f7-ac15-bc0f8443e809',
                'name': 'C S_ Start Center',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '15c594d6-9926-40f7-ac15-bc0f8443e809',
                        'to': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'words': 'Hello',
                    'onWord': word => {
                    },
                    'mimPath': 'mims/en-us/CS_StartCenter.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '049ade0b-4645-4921-9c37-29ad35a6e9c4': function () {
            return {
                'id': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                'name': 'tutorial switch',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'to': '15c594d6-9926-40f7-ac15-bc0f8443e809',
                        'value': 'center'
                    },
                    {
                        'frm': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'to': 'ab09ae3a-414d-4949-8bea-169d8dcc6e38',
                        'value': 'left'
                    },
                    {
                        'frm': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'to': 'eee8ace0-2852-4ed2-b367-6996fb262191',
                        'value': 'right'
                    },
                    {
                        'frm': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'to': 'd2bca655-1267-400b-b2f8-b7885993381f',
                        'value': 'up'
                    },
                    {
                        'frm': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'to': '4e747a40-a529-4268-ad9b-e097a90b5264',
                        'value': 'linked'
                    },
                    {
                        'frm': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'to': 'd424a176-453f-4e0f-b9b0-45c20ac49228',
                        'value': 'find'
                    },
                    {
                        'frm': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'to': 'bac2b2b2-5687-413e-a79f-b86695c3724d',
                        'value': 'noFace'
                    },
                    {
                        'frm': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'to': 'bf1f3513-7a4b-47d9-a4c2-7c50061b8c08',
                        'value': 'timeout'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.tutorialListener = () => {
                            if (notepad.nextTutorialStep) {
                                notepad.game.initialSearch = false;
                                notepad.stepSkippable = false;
                                jibo.timer.removeListener('update', notepad.tutorialListener);
                                let next;
                                if (notepad.nextTutorialStep == 'timeout') {
                                    if (notepad.game.currentLinkMode == notepad.game.LINK_MODE.find) {
                                        next = 'noFace';
                                    } else {
                                        next = 'timeout';
                                    }
                                } else {
                                    notepad.nextTutorialStep();
                                    for (let mode in notepad.game.LINK_MODE) {
                                        if (notepad.game.currentLinkMode == notepad.game.LINK_MODE[mode]) {
                                            next = mode;
                                            break;
                                        }
                                    }
                                }
                                notepad.nextTutorialStep = null;
                                done(next);
                            }
                        };
                        jibo.timer.on('update', notepad.tutorialListener);
                    },
                    'onStop': () => {
                        jibo.timer.removeListener('update', notepad.tutorialListener);
                    }
                }
            };
        },
        'ab09ae3a-414d-4949-8bea-169d8dcc6e38': function () {
            return {
                'id': 'ab09ae3a-414d-4949-8bea-169d8dcc6e38',
                'name': 'C S_ Lean Left',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ab09ae3a-414d-4949-8bea-169d8dcc6e38',
                        'to': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_LeanLeft.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'eee8ace0-2852-4ed2-b367-6996fb262191': function () {
            return {
                'id': 'eee8ace0-2852-4ed2-b367-6996fb262191',
                'name': 'C S_ Lean Right',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'eee8ace0-2852-4ed2-b367-6996fb262191',
                        'to': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_LeanRight.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'd2bca655-1267-400b-b2f8-b7885993381f': function () {
            return {
                'id': 'd2bca655-1267-400b-b2f8-b7885993381f',
                'name': 'C S_ Back To Center',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd2bca655-1267-400b-b2f8-b7885993381f',
                        'to': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_BackToCenter.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '4e747a40-a529-4268-ad9b-e097a90b5264': function () {
            return {
                'id': '4e747a40-a529-4268-ad9b-e097a90b5264',
                'name': 'cleanup tutorial',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4e747a40-a529-4268-ad9b-e097a90b5264',
                        'to': '93af4ce2-4aee-4f3f-a27f-cf2a08ca403b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.log.info('tutorial complete');
                        notepad.game.tutorialCB = null;
                    }
                }
            };
        },
        '768d6a22-48a2-4c65-b727-73a76276581b': function () {
            return {
                'id': '768d6a22-48a2-4c65-b727-73a76276581b',
                'name': 'C S_ Face Error',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '768d6a22-48a2-4c65-b727-73a76276581b',
                        'to': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_FaceError.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '527770d9-8a59-4139-b123-c24f97e9f9c4': function () {
            return {
                'id': '527770d9-8a59-4139-b123-c24f97e9f9c4',
                'name': 'C S_ Intro Explaining Situation',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '527770d9-8a59-4139-b123-c24f97e9f9c4',
                        'to': '1d66995f-c25a-4b81-916f-c5b481dd66e8',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_IntroExplainingSituation.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '1d66995f-c25a-4b81-916f-c5b481dd66e8': function () {
            return {
                'id': '1d66995f-c25a-4b81-916f-c5b481dd66e8',
                'name': 'C S_ Intro How To Play',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1d66995f-c25a-4b81-916f-c5b481dd66e8',
                        'to': '0f52cc9a-432e-47c3-8233-fb17ef54e470',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_IntroHowToPlay.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '72914d24-ba51-4b95-abc6-e883e7575933': function () {
            return {
                'id': '72914d24-ba51-4b95-abc6-e883e7575933',
                'name': 'C S_ Searching For Player',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '72914d24-ba51-4b95-abc6-e883e7575933',
                        'to': 'c5bf7656-ac44-4bb5-8903-708d802c4bec',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_SearchingForPlayer.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'bac2b2b2-5687-413e-a79f-b86695c3724d': function () {
            return {
                'id': 'bac2b2b2-5687-413e-a79f-b86695c3724d',
                'name': 'first noFace?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'bac2b2b2-5687-413e-a79f-b86695c3724d',
                        'to': 'bf1f3513-7a4b-47d9-a4c2-7c50061b8c08',
                        'value': ''
                    },
                    {
                        'frm': 'bac2b2b2-5687-413e-a79f-b86695c3724d',
                        'to': '768d6a22-48a2-4c65-b727-73a76276581b',
                        'value': 'true'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.stepSkippable = true;
                        if (!notepad.noFace) {
                            notepad.noFace = true;
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            };
        },
        'bf1f3513-7a4b-47d9-a4c2-7c50061b8c08': function () {
            return {
                'id': 'bf1f3513-7a4b-47d9-a4c2-7c50061b8c08',
                'name': 'C S_ Lean Error',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'bf1f3513-7a4b-47d9-a4c2-7c50061b8c08',
                        'to': '5b613fd5-09d2-41ca-81d2-fcc53008c4fa',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_LeanError.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '5b613fd5-09d2-41ca-81d2-fcc53008c4fa': function () {
            return {
                'id': '5b613fd5-09d2-41ca-81d2-fcc53008c4fa',
                'name': 'timeout',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        'd5bd46eb-29a2-47d1-8220-2dd91caeb2a1': function () {
            return {
                'id': 'd5bd46eb-29a2-47d1-8220-2dd91caeb2a1',
                'name': 'save high score',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd5bd46eb-29a2-47d1-8220-2dd91caeb2a1',
                        'to': '976b1447-3694-48b2-a5fb-5ee33a048c30',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.Analytics.gameFinished(notepad.game.score, notepad.numReplays);
                        if (notepad.game.newHighScore) {
                            blackboard.kbRoot.data.highScore = notepad.game.score;
                            blackboard.kbRoot.save(() => {
                                done();
                            });
                        } else {
                            done();
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'd424a176-453f-4e0f-b9b0-45c20ac49228': function () {
            return {
                'id': 'd424a176-453f-4e0f-b9b0-45c20ac49228',
                'name': 'allow skip',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd424a176-453f-4e0f-b9b0-45c20ac49228',
                        'to': '768d6a22-48a2-4c65-b727-73a76276581b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.stepSkippable = true;
                    }
                }
            };
        },
        'c3d53b52-5327-40fd-a372-f8dfedcaa511': function () {
            return {
                'id': 'c3d53b52-5327-40fd-a372-f8dfedcaa511',
                'name': 'C S_ Zero Score',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c3d53b52-5327-40fd-a372-f8dfedcaa511',
                        'to': 'e08bd516-2e52-4bcb-8bb0-94f8b486737d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CS_ZeroScore.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'b61f032b-49bf-4010-aa72-1a0f535771a1': {
            'id': 'b61f032b-49bf-4010-aa72-1a0f535771a1',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '606845c7-008a-43fc-8475-e01c0bba1be9': function () {
            return {
                'id': '606845c7-008a-43fc-8475-e01c0bba1be9',
                'name': 'get current closest entity',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '606845c7-008a-43fc-8475-e01c0bba1be9',
                        'to': '527770d9-8a59-4139-b123-c24f97e9f9c4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.originalFace = blackboard.faceWatcher.currentPerson;
                    }
                }
            };
        },
        'db8946b3-32a2-4464-a275-7589c8485903': function () {
            return {
                'id': 'db8946b3-32a2-4464-a275-7589c8485903',
                'name': 'faceYou',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'db8946b3-32a2-4464-a275-7589c8485903',
                        'to': '43253da1-01c1-40e7-9c59-9bb19fb2a54a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./faceYou');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '5b1b7d3d-3def-48f0-b6eb-472429baecde': function () {
            return {
                'id': '5b1b7d3d-3def-48f0-b6eb-472429baecde',
                'name': 'faceYou',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5b1b7d3d-3def-48f0-b6eb-472429baecde',
                        'to': '232497da-6a77-4a4e-9cfc-42d5479a53c1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./faceYou');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '0f52cc9a-432e-47c3-8233-fb17ef54e470': function () {
            return {
                'id': '0f52cc9a-432e-47c3-8233-fb17ef54e470',
                'name': 'disable attention system and enable viewfinder',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0f52cc9a-432e-47c3-8233-fb17ef54e470',
                        'to': 'db8946b3-32a2-4464-a275-7589c8485903',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.action.configure({ orientToHJ: false });
                        jibo.expression.setAttentionMode(jibo.expression.AttentionMode.OFF).catch(err => {
                            blackboard.log.warn('Attention mode not set. ', err);
                        }).then(handle => {
                            jibo.media.setViewfinder(true, {
                                x: 0,
                                y: 0,
                                width: 1280,
                                height: 720,
                                camera: 0
                            }, err => {
                                if (err) {
                                    blackboard.log.error('viewfinder failed to enable', err);
                                }
                                done();
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '4c2feb91-a74c-463d-b555-21257335bc2f': function () {
            return {
                'id': '4c2feb91-a74c-463d-b555-21257335bc2f',
                'name': 'disable attention system and enable viewfinder',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4c2feb91-a74c-463d-b555-21257335bc2f',
                        'to': '5b1b7d3d-3def-48f0-b6eb-472429baecde',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.action.configure({ orientToHJ: false });
                        jibo.expression.setAttentionMode(jibo.expression.AttentionMode.OFF).catch(err => {
                            blackboard.log.warn('Attention mode not set. ', err);
                        }).then(handle => {
                            jibo.media.setViewfinder(true, {
                                x: 0,
                                y: 0,
                                width: 1280,
                                height: 720,
                                camera: 0
                            }, err => {
                                if (err) {
                                    blackboard.log.error('viewfinder failed to enable', err);
                                }
                                done();
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'c5bf7656-ac44-4bb5-8903-708d802c4bec': function () {
            return {
                'id': 'c5bf7656-ac44-4bb5-8903-708d802c4bec',
                'name': 'enter search mode',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c5bf7656-ac44-4bb5-8903-708d802c4bec',
                        'to': '049ade0b-4645-4921-9c37-29ad35a6e9c4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.game.initialSearch = true;
                    }
                }
            };
        }
    };
};
},{"./faceYou":6}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CircuitSaver_1 = require("./CircuitSaver");
module.exports = CircuitSaver_1.default;

},{"./CircuitSaver":2}]},{},[8])(8)
});
//# sourceMappingURL=index.js.map