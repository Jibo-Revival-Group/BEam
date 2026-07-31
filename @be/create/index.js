(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.becreate = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "viewConfig": {
    "type": "MenuView",
    "id": "createMenu",
    "title": "Create",
    "listDefault": {
      "menuButtonType": "SkillButton",
      "colors": ["0x8EDD40", "0x31732A"]
    },
    "list": [
      {
        "id": "photo",
        "label": "Take a Photo",
        "action": {
          "type": "event",
          "data":{
            "event": "press",
            "intent": "createOnePhoto"
          }
        }
      },
      {
        "id": "photobooth",
        "label": "Photobooth",
        "action": {
          "type": "event",
          "data":{
            "event": "press",
            "intent": "createSomePhotos"
          }
        }
      }
    ]
  },
  "rule": "create/execute_create_menu",
  "timeout": 12,
  "open": {
    "pause":null,
    "transitionOpen":"trans_up"
  },
  "defaultClose": {
    "remove": true,
    "transitionClose":"trans_down"
  },
  "defaultSelect": {
    "remove": true,
    "leaveEmpty": false,
    "transitionClose":"trans_up"
  }
}

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    constructor(skill) {
        this._isPhotobooth = false;
        this._retries = 0;
        this.skill = skill;
    }
    reset(isPhotobooth) {
        this._isPhotobooth = isPhotobooth;
        this._retries = 0;
        this._howFound = 'none_found';
    }
    set found(howFound) {
        this._howFound = howFound;
    }
    retry() {
        this._retries++;
        this._howFound = 'none_found';
    }
    photoSaved(saved = true) {
        let eventName = (this._isPhotobooth) ? 'Photobooth captured' : 'Photo captured';
        this.skill.track(eventName, {
            photo_saved: saved,
            photo_retries: this._retries,
            how_found_user: this._howFound
        });
    }
}
exports.default = Analytics;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const THREE = require("@jibo/three");
const FaceScore_1 = require("./FaceScore");
const FaceSearcher_1 = require("./FaceSearcher");
const FrameHelper_1 = require("./FrameHelper");
const GoalFinishedStatus = jibo.action.types.GoalFinishedStatus;
class FaceFinder {
    constructor() {
        this.safeZone = { left: 230, right: 1115, top: 100, bottom: 590 };
        this.onSearchResult = this.onSearchResult.bind(this);
        this._faceSearcher = new FaceSearcher_1.default();
        this.highScore = new FaceScore_1.default();
        this.highScore.peopleTotal = 1;
        this.highScore.peopleConfidenceTotal = .2;
        this.highScore.generateHeuristic();
        this.mediumScore = new FaceScore_1.default();
        this.mediumScore.peopleTotal = 1;
        this.mediumScore.peopleConfidenceTotal = 0;
        this.mediumScore.generateHeuristic();
        this.lowScore = new FaceScore_1.default();
        this.lowScore.faceDetectTotal = 1;
        this.lowScore.faceDetectConfidence = .2;
        this.lowScore.generateHeuristic();
    }
    get faceSearcher() {
        return this._faceSearcher;
    }
    destroy() {
        this.stopSearch();
    }
    reset(done) {
        this._searchResult = null;
        this._awaitingResult = false;
        this._resultCallback = null;
    }
    resetSearch(done) {
        FaceFinder.log.info('FaceFinder.resetSearch()');
        this._searchResult = null;
        this._awaitingResult = true;
        this._resultCallback = null;
        this.checkSearch(done);
    }
    checkSearch(done) {
        if (done) {
            if (this._awaitingResult) {
                FaceFinder.log.info('FaceFinder.checkSearch() is awaiting results');
                if (this._resultCallback) {
                    FaceFinder.log.info('FaceFinder.checkSearch() overiding previous callback: ' + this._resultCallback + ' with: ' + done);
                }
                this._resultCallback = done;
            }
            else {
                FaceFinder.log.info('FaceFinder.checkSearch() results are available: ' + this._searchResult);
                done(this._searchResult);
            }
        }
    }
    get isAwaitingResults() {
        return this._awaitingResult;
    }
    onSearchResult(result) {
        FaceFinder.log.info('onSearchResult() search result: ' + result);
        this._awaitingResult = false;
        this._searchResult = result;
        if (this._resultCallback) {
            this._resultCallback(result);
            this._resultCallback = null;
        }
    }
    checkForFaces(score = this.highScore) {
        this._awaitingResult = false;
        this._searchResult = score.checkForEqualBetter(new FaceScore_1.default(jibo.lps.motionData));
        return this._searchResult;
    }
    detectForFaces(done, score = this.lowScore) {
        this.resetSearch(done);
        jibo.lps.demandDetect(0, false, (err) => {
            if (err) {
                FaceFinder.log.info('FaceFinder.detectForFaces() encountered error from jibo.lps.demandDetect' + err);
                this.onSearchResult(false);
            }
            else {
                FaceFinder.log.info('FaceFinder.detectForFaces() completed');
                this.onSearchResult(score.checkForEqualBetter(new FaceScore_1.default(jibo.lps.motionData)));
            }
        });
    }
    searchForFaces(done) {
        this.resetSearch(done);
        jibo.action.addFindPersonGoal().events.finished.waitFor()
            .then(status => {
            if (status === GoalFinishedStatus.SUCCEEDED) {
                this.onSearchResult(true);
            }
            else {
                this.onSearchResult(false);
            }
        });
    }
    startSearch(done, minScore, duration = 0) {
        FaceFinder.log.info('FaceFinder.startSearch() minScore', minScore, ' duration', duration);
        this.resetSearch(done);
        this._faceSearcher.search(this.onSearchResult, minScore, duration);
    }
    checkBest(minScore = this.lowScore) {
        return this._faceSearcher.checkAgainstBest(minScore);
    }
    stopSearch(clearCallback = true) {
        this._faceSearcher.stopSearch(clearCallback);
    }
    findCenterFromFrame(done, cameraTracking = 0, cameraPhoto = 0, headHeightRatio = 0.5, fovSafeRegion = 0.9) {
        this.resetSearch(done);
        FaceFinder.log.info('FaceFinder.findCenterFromFrame() Starting a getFaces request to LPS');
        jibo.lps.getFaces(cameraTracking, (err, result) => {
            FaceFinder.log.info("FaceFinder.findCenterFromFrame() got a getFaces result" + (err ? (" ERR:" + err) : ""));
            if (result && result.details && result.details.length) {
                try {
                    FaceFinder.log.info('FaceFinder.findCenterFromFrame() getFaces found ' + result.details.length + ' faces');
                    let targetPositions = [];
                    let allDetails = result.details;
                    for (let i = 0; i < allDetails.length; i++) {
                        let aDetail = allDetails[i];
                        let origin = new THREE.Vector3().copy(aDetail.ray_origin);
                        let direction = new THREE.Vector3().copy(aDetail.ray_dir);
                        let distance = aDetail.range;
                        let position = origin.add(direction.setLength(distance));
                        targetPositions.push(position);
                    }
                    let lookAt = this.getCenterFromTargets(targetPositions, cameraTracking, cameraPhoto, headHeightRatio, fovSafeRegion);
                    this.onSearchResult(lookAt);
                }
                catch (err) {
                    FaceFinder.log.warn('FaceFinder.findCenterFromFrame() got error computing lookat:' + err);
                    this.onSearchResult(null);
                }
            }
            else {
                FaceFinder.log.info('FaceFinder.findCenterFromFrame() getFaces found NO faces');
                this.onSearchResult(null);
            }
        }, 'faces', false);
    }
    getCenterFromTargets(targetPositions, cameraTracking = 0, cameraPhoto = 0, headHeightRatio = 0.5, fovSafeRegion = 0.9) {
        if (!targetPositions || targetPositions.length === 0) {
            return null;
        }
        try {
            let cameraPosInFaceXY;
            if (cameraPhoto === 0) {
                cameraPosInFaceXY = [-0.041, 0.058];
            }
            else if (cameraPhoto === 1) {
                cameraPosInFaceXY = [0.041, 0.058];
            }
            else {
                FaceFinder.log.warn('FaceFinder.getCenterFromTargets() unknown camera id:' + cameraPhoto + ', using no offset');
                cameraPosInFaceXY = [0, 0];
            }
            let features = jibo.expression.features;
            let headFeature = features.head;
            let currentDirection = new THREE.Vector3().copy(headFeature.direction);
            let currentOrigin = new THREE.Vector3().copy(headFeature.position);
            let FoV = jibo.lps.motionData.cameras[cameraPhoto].fov;
            let fovX = FoV.x * fovSafeRegion;
            let fovY = FoV.y * fovSafeRegion;
            let lookAt = FrameHelper_1.default.getFramingTarget(fovX, fovY, headHeightRatio, targetPositions, currentDirection, currentOrigin, cameraPosInFaceXY[0], cameraPosInFaceXY[1]);
            if (lookAt) {
                FaceFinder.log.debug("FaceFinder.getCenterFromTargets() generated look-at target " + JSON.stringify(lookAt)
                    + " from face locations " + JSON.stringify(targetPositions)
                    + " using tracking camera " + cameraTracking + ", photo camera " + cameraPhoto + ","
                    + " headHeightRatio " + headHeightRatio + ", fovSafeRegion " + fovSafeRegion + ","
                    + " current position " + JSON.stringify(currentOrigin) + ", direction " + JSON.stringify(currentDirection) + ","
                    + " and camera data " + JSON.stringify(jibo.lps.motionData.cameras));
            }
            return lookAt;
        }
        catch (err) {
            FaceFinder.log.warn('FaceFinder.getCenterFromTargets() Got error computing lookat:' + err);
            return null;
        }
    }
    getTargetsFromMotionData(motionData, includeFaceDetects = true, requiredConfidence = 0) {
        let targetPositions = [];
        if (motionData.entities && motionData.entities.length) {
            let inFOV;
            let part;
            for (let entity of motionData.entities) {
                if (entity.description === 'person') {
                    inFOV = true;
                    if (entity.parts.length > 0) {
                        part = entity.parts[0];
                        if (part.value.trackers.length > requiredConfidence) {
                            inFOV = part.value.trackers[0].inFOV;
                        }
                    }
                    if (inFOV && entity.confidence >= 0) {
                        targetPositions.push(new THREE.Vector3().copy(entity.position));
                    }
                }
            }
            FaceFinder.log.debug('FaceFinder.getBestTargets() found ' + targetPositions.length + ' valid faces out of ' + motionData.entities.length + ' faces from current LPS');
        }
        if (includeFaceDetects) {
            if (motionData.detections && motionData.detections.length) {
                for (let detection of motionData.detections) {
                    if (detection.kind === 'face') {
                        if (detection.confidence >= requiredConfidence) {
                            targetPositions.push(new THREE.Vector3().copy(detection.position));
                        }
                    }
                }
            }
        }
        return targetPositions;
    }
    get screenLookAt() {
        const features = jibo.expression.features;
        const screenInfo = features.head;
        const screenPosition = screenInfo.position;
        const screenDirection = screenInfo.direction;
        const lookAt = screenDirection
            .clone()
            .normalize()
            .add(screenPosition);
        return lookAt;
    }
}
FaceFinder.log = null;
module.exports = FaceFinder;

},{"./FaceScore":4,"./FaceSearcher":5,"./FrameHelper":6,"@jibo/three":undefined,"jibo":undefined}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FaceScore {
    constructor(motionData) {
        this.peopleTotal = 0;
        this.peopleConfidenceTotal = 0;
        this.faceDetectTotal = 0;
        this.faceDetectConfidence = 0;
        this.entityTotal = 0;
        this.detectionTotal = 0;
        this._heuristicScore = 0;
        if (motionData) {
            this.createScore(motionData);
        }
    }
    get heuristicScore() {
        return this._heuristicScore;
    }
    static createScoreManual(totalPeople = 0, personConfidence = 0, totalFaceDetect = 0, faceDetectConfidence = 0) {
        const score = new FaceScore();
        score.peopleTotal = totalPeople;
        score.peopleConfidenceTotal = personConfidence;
        score.faceDetectTotal = totalFaceDetect;
        score.faceDetectConfidence = faceDetectConfidence;
        score.generateHeuristic();
        return score;
    }
    reset() {
        this.motionData = null;
        this.peopleTotal = 0;
        this.peopleConfidenceTotal = 0;
        this.faceDetectTotal = 0;
        this.faceDetectConfidence = 0;
        this.entityTotal = 0;
        this.detectionTotal = 0;
        this._heuristicScore = 0;
    }
    applyScore(score) {
        this.motionData = score.motionData;
        this.peopleTotal = score.peopleTotal;
        this.peopleConfidenceTotal = score.peopleConfidenceTotal;
        this.faceDetectTotal = score.faceDetectTotal;
        this.faceDetectConfidence = score.faceDetectConfidence;
        this.entityTotal = score.entityTotal;
        this.detectionTotal = score.detectionTotal;
        this.generateHeuristic();
    }
    createScore(motionData) {
        this.reset();
        this.motionData = motionData;
        if (motionData.entities && motionData.entities.length) {
            for (let entity of motionData.entities) {
                if (entity.in_fov) {
                    if (entity.description == 'person') {
                        this.peopleTotal++;
                        this.peopleConfidenceTotal += entity.confidence;
                    }
                    this.entityTotal++;
                }
            }
        }
        if (motionData.detections && motionData.detections.length) {
            for (let detection of motionData.detections) {
                if (detection.kind == 'face') {
                    this.faceDetectTotal++;
                    this.faceDetectConfidence += detection.confidence;
                }
                this.detectionTotal++;
            }
        }
        this.generateHeuristic();
    }
    checkForBetter(score, useHeuristicScore = false) {
        if (useHeuristicScore) {
            return score.heuristicScore > this.heuristicScore;
        }
        else {
            if (score.peopleTotal > 0) {
                if (score.peopleTotal > this.peopleTotal) {
                    return true;
                }
                else if (score.peopleTotal === this.peopleTotal) {
                    if (score.peopleConfidenceTotal > this.peopleConfidenceTotal) {
                        return true;
                    }
                }
            }
            else if (this.peopleTotal === 0) {
                if (score.faceDetectTotal && score.faceDetectTotal !== this.faceDetectTotal) {
                    if (score.faceDetectTotal > this.faceDetectTotal) {
                        return true;
                    }
                    else if (score.faceDetectTotal === this.faceDetectTotal) {
                        if (score.faceDetectConfidence > this.faceDetectConfidence) {
                            return true;
                        }
                    }
                }
                else if (score.entityTotal && score.entityTotal !== this.entityTotal) {
                    if (score.entityTotal > this.entityTotal) {
                        return true;
                    }
                }
                else if (score.detectionTotal && score.detectionTotal !== this.detectionTotal) {
                    if (score.detectionTotal > this.detectionTotal) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    checkForEqualBetter(score, useHeuristicScore = false) {
        if (useHeuristicScore) {
            return score.heuristicScore >= this.heuristicScore;
        }
        else {
            if (score.peopleTotal > 0) {
                if (score.peopleTotal > this.peopleTotal) {
                    return true;
                }
                else if (score.peopleTotal === this.peopleTotal) {
                    if (score.peopleConfidenceTotal >= this.peopleConfidenceTotal) {
                        return true;
                    }
                }
            }
            else if (this.peopleTotal === 0) {
                if (score.faceDetectTotal > 0) {
                    if (score.faceDetectTotal > this.faceDetectTotal) {
                        return true;
                    }
                    else if (score.faceDetectTotal === this.faceDetectTotal) {
                        if (score.faceDetectConfidence >= this.faceDetectConfidence) {
                            return true;
                        }
                    }
                }
                else if (this.faceDetectTotal === 0) {
                    if (score.entityTotal && score.entityTotal >= this.entityTotal) {
                        return true;
                    }
                    else if (score.detectionTotal && score.detectionTotal >= this.detectionTotal) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    toString() {
        let str = '\n';
        str += 'People: ' + this.peopleTotal + '\n';
        str += 'Confidence: : ' + this.peopleConfidenceTotal + '\n';
        str += 'Entities: ' + this.entityTotal + '\n';
        str += 'Face Detections: ' + this.faceDetectTotal + '\n';
        str += 'Detections: ' + this.detectionTotal + '\n';
        str += 'Heuristic Score: ' + this.heuristicScore + '\n';
        return str;
    }
    toStringCompare(score) {
        let str = '\n';
        str += 'People: ' + this.peopleTotal + ' vs ' + score.peopleTotal + '\n';
        str += 'Confidence: : ' + this.peopleConfidenceTotal + ' vs ' + score.peopleConfidenceTotal + '\n';
        str += 'Entities: ' + this.entityTotal + ' vs ' + score.entityTotal + '\n';
        str += 'Face Detections: ' + this.faceDetectTotal + ' vs ' + score.faceDetectTotal + '\n';
        str += 'Detections: ' + this.detectionTotal + ' vs ' + score.detectionTotal + '\n';
        str += 'Heuristic Score: ' + this.heuristicScore + '\n';
        return str;
    }
    generateHeuristic() {
        this._heuristicScore = this.peopleTotal + this.faceDetectTotal + (this.peopleConfidenceTotal * .5) + (this.faceDetectConfidence * .5);
    }
}
FaceScore.log = null;
exports.default = FaceScore;

},{}],5:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const FaceScore_1 = require("./FaceScore");
const GoalFinishedStatus = jibo.action.types.GoalFinishedStatus;
require('./FaceScore');
class FaceSearcher {
    constructor() {
        this.DEFAULT_DURATION = 6000;
        this.onMotion = this.onMotion.bind(this);
        this._nextScore = new FaceScore_1.default();
    }
    set minScore(score) {
        this._minScore = score;
        this._minScore.generateHeuristic();
    }
    get bestScore() {
        return this._bestScore;
    }
    reset() {
        this._callback = null;
        this._minScore = null;
        this._bestScore = null;
        clearTimeout(this._searchTimer);
        this._searchTimer = null;
        jibo.lps.events.motion.removeListener(this.onMotion);
    }
    search(done, minScore, duration = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            this.reset();
            this._callback = done;
            this._minScore = minScore;
            if (this._minScore) {
                this._minScore.generateHeuristic();
            }
            if (duration > 0) {
                this.setupTimer(duration);
            }
            this._bestScore = new FaceScore_1.default();
            jibo.lps.events.motion.on(this.onMotion);
        });
    }
    stopSearch(clearCallback = true) {
        if (clearCallback) {
            this._callback = null;
        }
        this.searchComplete(false);
    }
    checkAgainstBest(minScore) {
        if (minScore) {
            minScore.generateHeuristic();
            if (this._bestScore && minScore) {
                return minScore.checkForEqualBetter(this._bestScore);
            }
        }
        return false;
    }
    onMotion(data) {
        this._nextScore.createScore(jibo.lps.motionData);
        if (this._bestScore.checkForEqualBetter(this._nextScore)) {
            this._bestScore.applyScore(this._nextScore);
            this.checkAgainstMin();
        }
    }
    checkAgainstMin() {
        if (this._minScore && this._minScore.checkForEqualBetter(this._bestScore)) {
            this.searchComplete(true, false);
        }
    }
    searchComplete(found, stopSearch = true) {
        FaceSearcher.log.debug('searchComplete() with result: ' + found + ', will stop search:' + stopSearch);
        clearTimeout(this._searchTimer);
        this._searchTimer = null;
        if (stopSearch) {
            jibo.lps.events.motion.removeListener(this.onMotion);
        }
        if (this._callback) {
            this._callback(found);
            this._callback = null;
        }
    }
    setupTimer(duration) {
        this._searchTimer = setTimeout(() => {
            FaceSearcher.log.debug('timed out');
            this.searchComplete(false);
            return;
        }, duration);
    }
}
FaceSearcher.log = null;
exports.default = FaceSearcher;

},{"./FaceScore":4,"jibo":undefined}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("@jibo/three");
class FrameHelper {
    static computeLocalBases(currentOrientationDir) {
        let worldUp = new THREE.Vector3(0, 0, 1);
        let localLeft = worldUp.cross(currentOrientationDir);
        worldUp = null;
        if (localLeft.lengthSq() < 0.0001) {
            FrameHelper.log.debug("Singularity error computing look target, forwardDir = (" + currentOrientationDir.x + ", " + currentOrientationDir.y + ", " + currentOrientationDir.z + ")");
            return null;
        }
        localLeft.normalize();
        let localUp = currentOrientationDir.clone().cross(localLeft).normalize();
        return [localLeft, localUp];
    }
    static convertToSortedXYAngles(fovX, fovY, localLeft, localUp, targetDirs, forward) {
        let targetsXY = [];
        for (let i = 0; i < targetDirs.length; i++) {
            let targetDir = targetDirs[i];
            let targetOnHorizontalPlane = targetDir.clone().projectOnPlane(localUp);
            let xAngle = forward.angleTo(targetOnHorizontalPlane);
            if (targetOnHorizontalPlane.dot(localLeft) < 0) {
                xAngle = -xAngle;
            }
            let targetOnVerticalPlane = targetDir.clone().projectOnPlane(localLeft);
            let yAngle = forward.angleTo(targetOnVerticalPlane);
            if (targetOnVerticalPlane.dot(localUp) < 0) {
                yAngle = -yAngle;
            }
            targetsXY.push([
                xAngle, yAngle
            ]);
        }
        let angleDistanceFromCenter = function (xAngle, yAngle, fovXRadius, fovYRadius) {
            let xRatioDistanceFromCenter = xAngle / fovXRadius;
            let yRatioDistanceFromCenter = yAngle / fovYRadius;
            return Math.sqrt(xRatioDistanceFromCenter * xRatioDistanceFromCenter + yRatioDistanceFromCenter * yRatioDistanceFromCenter);
        };
        let fovXRadius = fovX / 2;
        let fovYRadius = fovY / 2;
        targetsXY.sort((a, b) => {
            return angleDistanceFromCenter(a[0], a[1], fovXRadius, fovYRadius) - angleDistanceFromCenter(b[0], b[1], fovXRadius, fovYRadius);
        });
        return targetsXY;
    }
    static filterTargetListToFOVPossible(fovX, fovY, targetsXY) {
        let canBeFramed = function (targetsXY, fov) {
            let min = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
            let max = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
            let countOfTargetsWhichFit = 0;
            for (let i = 0; i < targetsXY.length; i++) {
                let iFits = true;
                for (let j = 0; j < 2; j++) {
                    let t = targetsXY[i];
                    if (t[j] < min[j]) {
                        min[j] = t[j];
                    }
                    if (t[j] > max[j]) {
                        max[j] = t[j];
                    }
                    if (max[j] - min[j] > fov[j]) {
                        iFits = false;
                    }
                }
                if (iFits) {
                    countOfTargetsWhichFit = i + 1;
                }
                else {
                    break;
                }
            }
            return countOfTargetsWhichFit;
        };
        let numCanBeFramed = canBeFramed(targetsXY, [fovX, fovY]);
        if (numCanBeFramed < targetsXY.length) {
            targetsXY.splice(numCanBeFramed, targetsXY.length - numCanBeFramed);
        }
        return targetsXY;
    }
    static getFramingXY(fovX, fovY, targetsXY, headHeightRatio) {
        let min = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
        let max = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
        for (let i = 0; i < targetsXY.length; i++) {
            for (let j = 0; j < 2; j++) {
                let t = targetsXY[i];
                if (t[j] < min[j]) {
                    min[j] = t[j];
                }
                if (t[j] > max[j]) {
                    max[j] = t[j];
                }
            }
        }
        let framingX = (max[0] + min[0]) / 2;
        let fovYRadius = fovY / 2;
        let useHeadAngleFromBottom = fovY * headHeightRatio;
        if (useHeadAngleFromBottom < max[1] - min[1]) {
            useHeadAngleFromBottom = max[1] - min[1];
        }
        let yAngleAboveCenter = useHeadAngleFromBottom - fovYRadius;
        let framingY = max[1] - yAngleAboveCenter;
        return [framingX, framingY];
    }
    static getFramingTarget(fovX, fovY, headHeightRatio, targetPositions, currentOrientationDir, currentOrientationOrigin, cameraLocalLeft, cameraLocalUp) {
        let basesDir = this.computeLocalBases(currentOrientationDir);
        if (basesDir === null) {
            return null;
        }
        let localLeft = basesDir[0];
        let localUp = basesDir[1];
        let targetDirs = [];
        for (let i = 0; i < targetPositions.length; i++) {
            let t = targetPositions[i];
            t = t.clone().sub(localUp.clone().setLength(cameraLocalUp));
            t = t.sub(localLeft.clone().setLength(cameraLocalLeft));
            targetDirs.push(t.clone().sub(currentOrientationOrigin).normalize());
        }
        let targetsXY = this.convertToSortedXYAngles(fovX, fovY, localLeft, localUp, targetDirs, currentOrientationDir);
        targetsXY = this.filterTargetListToFOVPossible(fovX, fovY, targetsXY);
        FrameHelper.log.debug("getFramingTarget() chose to frame " + targetsXY.length + " faces out of " + targetPositions.length + " provided");
        if (targetsXY.length > 0) {
            let xyAngles = this.getFramingXY(fovX, fovY, targetsXY, headHeightRatio);
            let xProj = Math.sin(xyAngles[0]);
            let yProj = Math.sin(xyAngles[1]);
            let dirVec = localLeft.clone().multiplyScalar(xProj);
            dirVec.add(localUp.clone().multiplyScalar(yProj));
            let zProj = Math.sqrt(1 - xProj * xProj - yProj * yProj);
            dirVec.add(currentOrientationDir.clone().multiplyScalar(zProj));
            let targetPos = currentOrientationOrigin.clone().add(dirVec.multiplyScalar(2));
            return targetPos;
        }
        else {
            return null;
        }
    }
}
FrameHelper.log = null;
exports.default = FrameHelper;

},{"@jibo/three":undefined}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class PhotoStyler {
    constructor() {
    }
    style(urls, callback) {
        let loadTasks = [];
        for (let i = 0; i < urls.length; i++) {
            loadTasks.push({
                id: `photo${i}`,
                src: urls[i].url,
                format: 'image'
            });
        }
        jibo.loader.load(loadTasks, (err, result) => {
            if (err) {
                callback(err);
                return;
            }
            let canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            let ctx = canvas.getContext('2d');
            if (urls.length == 4) {
                ctx.drawImage(result.photo0, 0, 0, 640, 360);
                ctx.drawImage(result.photo1, 640, 0, 640, 360);
                ctx.drawImage(result.photo2, 0, 360, 640, 360);
                ctx.drawImage(result.photo3, 640, 360, 640, 360);
                callback(null, canvas.toDataURL('image/jpeg', 0.9));
            }
            else {
                ctx.drawImage(result.photo0, 0, 0, 1280, 720);
                callback(null, canvas.toDataURL('image/jpeg', 0.9));
            }
        });
    }
    destroy() {
    }
}
PhotoStyler.log = null;
module.exports = PhotoStyler;

},{"jibo":undefined}],8:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'create-main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/create/src/flows/create-main.flow'
        },
        '31250ef3-1cac-4d78-ba86-ea05daff3191': function () {
            return {
                'id': '31250ef3-1cac-4d78-ba86-ea05daff3191',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '31250ef3-1cac-4d78-ba86-ea05daff3191',
                        'to': '8a56bfea-cf3d-47d7-a637-015e5a949ec1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return { intent: 'menu' };
                    }
                }
            };
        },
        '8a56bfea-cf3d-47d7-a637-015e5a949ec1': function () {
            return {
                'id': '8a56bfea-cf3d-47d7-a637-015e5a949ec1',
                'name': 'intent',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '8a56bfea-cf3d-47d7-a637-015e5a949ec1',
                        'to': 'af2c1a3b-4886-4576-8fa5-682ed45e54b0',
                        'value': 'createOnePhoto'
                    },
                    {
                        'frm': '8a56bfea-cf3d-47d7-a637-015e5a949ec1',
                        'to': '6208b21c-1ba4-4182-874b-043e0eaf1316',
                        'value': 'createSomePhotos'
                    },
                    {
                        'frm': '8a56bfea-cf3d-47d7-a637-015e5a949ec1',
                        'to': '7d9ea15c-51fc-4b23-a8d2-3ace03bb2419',
                        'value': ''
                    },
                    {
                        'frm': '8a56bfea-cf3d-47d7-a637-015e5a949ec1',
                        'to': 'fbf028b3-4a55-4059-9d01-352ca278d730',
                        'value': 'menu'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return notepad.params.intent;
                    }
                }
            };
        },
        '9bff4b95-8f3e-4009-a154-6c8214e8fd83': function () {
            return {
                'id': '9bff4b95-8f3e-4009-a154-6c8214e8fd83',
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
        'af2c1a3b-4886-4576-8fa5-682ed45e54b0': function () {
            return {
                'id': 'af2c1a3b-4886-4576-8fa5-682ed45e54b0',
                'name': 'one photo',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'af2c1a3b-4886-4576-8fa5-682ed45e54b0',
                        'to': '0799a741-3ee2-461d-9f46-bee770352ad8',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.log.info('starting snapshot');
                        notepad.numPhotos = 1;
                    }
                }
            };
        },
        '6208b21c-1ba4-4182-874b-043e0eaf1316': function () {
            return {
                'id': '6208b21c-1ba4-4182-874b-043e0eaf1316',
                'name': 'some photos',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '6208b21c-1ba4-4182-874b-043e0eaf1316',
                        'to': '0799a741-3ee2-461d-9f46-bee770352ad8',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.log.info('starting photobooth');
                        notepad.numPhotos = 4;
                    }
                }
            };
        },
        '7d9ea15c-51fc-4b23-a8d2-3ace03bb2419': function () {
            return {
                'id': '7d9ea15c-51fc-4b23-a8d2-3ace03bb2419',
                'name': 'idunno',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7d9ea15c-51fc-4b23-a8d2-3ace03bb2419',
                        'to': '9bff4b95-8f3e-4009-a154-6c8214e8fd83',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'TextToSpeech',
                'options': {
                    'words': 'I don\'t know how to do that yet',
                    'onWord': word => {
                    }
                }
            };
        },
        'fbf028b3-4a55-4059-9d01-352ca278d730': function () {
            return {
                'id': 'fbf028b3-4a55-4059-9d01-352ca278d730',
                'name': 'Menu',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fbf028b3-4a55-4059-9d01-352ca278d730',
                        'to': '8a56bfea-cf3d-47d7-a637-015e5a949ec1',
                        'value': ''
                    }],
                'exceptions': [{
                        'frm': 'fbf028b3-4a55-4059-9d01-352ca278d730',
                        'to': '9bff4b95-8f3e-4009-a154-6c8214e8fd83',
                        'value': '~'
                    }],
                'class': 'Menu',
                'options': {
                    'getConfig': loadCallback => {
                        loadCallback(require('../../assets/menu/menu.json'));
                    },
                    'onMenuClosed': (wasTimeout, menu, overrideMenuTransition, exception) => {
                        return exception;
                    },
                    'onItemChosen': (menuResult, menu, overrideMenuTransition) => {
                        notepad.params.intent = menuResult.intent;
                    },
                    'onPositionalSelect': (commandAsr, intendedIndex, menu) => {
                    }
                }
            };
        },
        '0799a741-3ee2-461d-9f46-bee770352ad8': function () {
            return {
                'id': '0799a741-3ee2-461d-9f46-bee770352ad8',
                'name': 'create-photo',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0799a741-3ee2-461d-9f46-bee770352ad8',
                        'to': '9bff4b95-8f3e-4009-a154-6c8214e8fd83',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./subs/create-photo');
                    },
                    'inputParameters': () => {
                        return { numPhotos: notepad.numPhotos };
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '318f0278-982b-4d3e-928f-2551e5cc8ff3': function () {
            return {
                'id': '318f0278-982b-4d3e-928f-2551e5cc8ff3',
                'name': '~photoError',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '318f0278-982b-4d3e-928f-2551e5cc8ff3',
                        'to': 'b034436d-94ca-45df-af6b-d965c8ac8cd6',
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
        'b034436d-94ca-45df-af6b-d965c8ac8cd6': function () {
            return {
                'id': 'b034436d-94ca-45df-af6b-d965c8ac8cd6',
                'name': 'where da photos?',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b034436d-94ca-45df-af6b-d965c8ac8cd6',
                        'to': '9bff4b95-8f3e-4009-a154-6c8214e8fd83',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'TextToSpeech',
                'options': {
                    'words': 'Oops, something went wrong.',
                    'onWord': word => {
                    }
                }
            };
        }
    };
};
},{"../../assets/menu/menu.json":1,"./subs/create-photo":13}],9:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'create-find-face',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/create/src/flows/subs/create-find-face.flow'
        },
        'c206d94f-ed3c-4071-8589-0c7974f3bda7': function () {
            return {
                'id': 'c206d94f-ed3c-4071-8589-0c7974f3bda7',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c206d94f-ed3c-4071-8589-0c7974f3bda7',
                        'to': '3b1458ee-92fa-45cb-a2d0-a9b6095a076a',
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
        '2b648b45-ab2b-43e6-bbc0-93857f9732e2': {
            'id': '2b648b45-ab2b-43e6-bbc0-93857f9732e2',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '2b648b45-ab2b-43e6-bbc0-93857f9732e2',
                    'to': '766877df-d097-4953-b748-a259ae6563ec',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '608f7805-9f82-45df-b2a2-ed6884f2ed6a': function () {
            return {
                'id': '608f7805-9f82-45df-b2a2-ed6884f2ed6a',
                'name': 'found',
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
        'ed38f72c-4497-46df-a1c0-5f1394942d17': function () {
            return {
                'id': 'ed38f72c-4497-46df-a1c0-5f1394942d17',
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
        '766877df-d097-4953-b748-a259ae6563ec': function () {
            return {
                'id': '766877df-d097-4953-b748-a259ae6563ec',
                'name': 'Start Search',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '766877df-d097-4953-b748-a259ae6563ec',
                        'to': 'e717cb64-986c-4b08-ab9d-4eebb7a519b5',
                        'value': 'true'
                    },
                    {
                        'frm': '766877df-d097-4953-b748-a259ae6563ec',
                        'to': '211a47d3-6253-43fd-a623-0deab828d098',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.log.info('Starting active search, will search until stopped');
                        blackboard.faceFinder.startSearch(found => {
                            blackboard.log.info('Result of face search during Looking For You MIM: ' + found);
                            if (found) {
                                blackboard.log.info('Best score: ' + blackboard.faceFinder.faceSearcher.bestScore.toString());
                                blackboard.tracker.found = 'attractable';
                            }
                            done(found);
                        }, blackboard.faceFinder.lowScore);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'e717cb64-986c-4b08-ab9d-4eebb7a519b5': function () {
            return {
                'id': 'e717cb64-986c-4b08-ab9d-4eebb7a519b5',
                'name': '~found',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e717cb64-986c-4b08-ab9d-4eebb7a519b5',
                        'to': '211a47d3-6253-43fd-a623-0deab828d098',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return { found: this.inTransition };
                    }
                }
            };
        },
        'd5eeb405-5268-478c-8783-7b19d1ef4236': function () {
            return {
                'id': 'd5eeb405-5268-478c-8783-7b19d1ef4236',
                'name': '~found',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd5eeb405-5268-478c-8783-7b19d1ef4236',
                        'to': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'value': 'true'
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return true;
                    }
                }
            };
        },
        '98af535f-41b4-41fd-9ad3-1da712603ea0': function () {
            return {
                'id': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                'name': 'Clean Up',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'to': '15aeacb4-1988-4f17-ab12-472fcb18c444',
                        'value': 'take'
                    },
                    {
                        'frm': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'to': 'ed38f72c-4497-46df-a1c0-5f1394942d17',
                        'value': 'false'
                    },
                    {
                        'frm': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'to': '608f7805-9f82-45df-b2a2-ed6884f2ed6a',
                        'value': 'true'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.lightRing(false);
                        jibo.face.views.currentView.removeActionsByType(jibo.face.views.ActionData.CALLBACK);
                        blackboard.skill.releaseMode().then(() => {
                            jibo.expression.setAttentionMode('OFF').then(() => {
                                done(this.inTransition);
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '3b1458ee-92fa-45cb-a2d0-a9b6095a076a': function () {
            return {
                'id': '3b1458ee-92fa-45cb-a2d0-a9b6095a076a',
                'name': 'Looking For You',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3b1458ee-92fa-45cb-a2d0-a9b6095a076a',
                        'to': '7ef96365-7b17-41a2-ad72-28f73cb5299b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LookingForYou.mim',
                    'getPromptData': () => {
                        return {
                            first: blackboard.searchType === 'first',
                            again: blackboard.searchType === 'again',
                            lost: blackboard.searchType === 'lost'
                        };
                    }
                }
            };
        },
        '2062dcb1-e47c-465e-9c06-fe5fee84cf4f': function () {
            return {
                'id': '2062dcb1-e47c-465e-9c06-fe5fee84cf4f',
                'name': '~take',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2062dcb1-e47c-465e-9c06-fe5fee84cf4f',
                        'to': '211a47d3-6253-43fd-a623-0deab828d098',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return {};
                    }
                }
            };
        },
        '211a47d3-6253-43fd-a623-0deab828d098': function () {
            return {
                'id': '211a47d3-6253-43fd-a623-0deab828d098',
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
        'a7033ede-c4bc-4984-9b8d-4ef75ab43924': function () {
            return {
                'id': 'a7033ede-c4bc-4984-9b8d-4ef75ab43924',
                'name': 'Start Attractable Search',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'a7033ede-c4bc-4984-9b8d-4ef75ab43924',
                        'to': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'value': 'true'
                    },
                    {
                        'frm': 'a7033ede-c4bc-4984-9b8d-4ef75ab43924',
                        'to': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let searchDuration = jibo.runMode === jibo.RunMode.SIMULATOR ? 1 : notepad.params.duration;
                        blackboard.log.info('Starting attractable search, will search for ' + searchDuration + ' milliseconds');
                        blackboard.skill.setMode(jibo.expression.AttentionMode.ATTRACTABLE).then(() => {
                            blackboard.faceFinder.startSearch(found => {
                                blackboard.log.info('Result of attractable search for faces: ' + found);
                                if (found) {
                                    blackboard.tracker.found = 'attractable';
                                }
                                done(found);
                            }, blackboard.faceFinder.lowScore, searchDuration);
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'e70bbf60-61c8-4f8a-b0e6-bbcf2d27cbe9': function () {
            return {
                'id': 'e70bbf60-61c8-4f8a-b0e6-bbcf2d27cbe9',
                'name': '~take',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e70bbf60-61c8-4f8a-b0e6-bbcf2d27cbe9',
                        'to': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'value': 'take'
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return 'take';
                    }
                }
            };
        },
        '15aeacb4-1988-4f17-ab12-472fcb18c444': function () {
            return {
                'id': '15aeacb4-1988-4f17-ab12-472fcb18c444',
                'name': 'take',
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
        '7ef96365-7b17-41a2-ad72-28f73cb5299b': function () {
            return {
                'id': '7ef96365-7b17-41a2-ad72-28f73cb5299b',
                'name': 'Stop Search',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7ef96365-7b17-41a2-ad72-28f73cb5299b',
                        'to': 'a7033ede-c4bc-4984-9b8d-4ef75ab43924',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.faceFinder.stopSearch();
                        blackboard.lightRing(true);
                        blackboard.searchedOnce = true;
                    }
                }
            };
        },
        '7f9a392c-88be-476e-b9a0-a895333ff127': {
            'id': '7f9a392c-88be-476e-b9a0-a895333ff127',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '7f9a392c-88be-476e-b9a0-a895333ff127',
                    'to': 'd717ddd9-1c27-4693-b21e-792ac27a2e18',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        'd717ddd9-1c27-4693-b21e-792ac27a2e18': function () {
            return {
                'id': 'd717ddd9-1c27-4693-b21e-792ac27a2e18',
                'name': 'Listen for Tap',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd717ddd9-1c27-4693-b21e-792ac27a2e18',
                        'to': '2062dcb1-e47c-465e-9c06-fe5fee84cf4f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.currentView.addAction(jibo.face.views.ActionData.CALLBACK, {
                            callback: () => {
                                blackboard.log.info('Screen tapped while during face search, proceed to take');
                                blackboard.faceFinder.stopSearch();
                                done(true);
                            }
                        }, true);
                    },
                    'onStop': () => {
                    }
                }
            };
        }
    };
};
},{}],10:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'create-frame-faces',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/create/src/flows/subs/create-frame-faces.flow'
        },
        '8650d67d-da69-49a4-b336-1bc90ea24b3a': function () {
            return {
                'id': '8650d67d-da69-49a4-b336-1bc90ea24b3a',
                'name': 'Hold Still',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8650d67d-da69-49a4-b336-1bc90ea24b3a',
                        'to': '2fa7e7a3-335e-4ccd-9e01-b9ec0062705d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/HoldStill.mim',
                    'getPromptData': () => {
                        return { didSearch: blackboard.didSearch };
                    }
                }
            };
        },
        '158a73de-5f80-489b-bb00-69020b77d6ca': function () {
            return {
                'id': '158a73de-5f80-489b-bb00-69020b77d6ca',
                'name': 'Face Center Result',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '158a73de-5f80-489b-bb00-69020b77d6ca',
                        'to': 'cfb87ed9-08c0-424a-ac28-3869ad1911c6',
                        'value': 'false'
                    },
                    {
                        'frm': '158a73de-5f80-489b-bb00-69020b77d6ca',
                        'to': '1c9c9ca5-a1cb-4458-95fc-88526a315c11',
                        'value': 'true'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.log.info('Attempt to calculate photo center target');
                        let cameraTracking = 0;
                        let cameraPhoto = 1;
                        let fovSafeRegion = 0.9;
                        blackboard.faceFinder.findCenterFromFrame(point => {
                            if (point) {
                                blackboard.log.info('Found a center target using getFaces');
                                this.out = point;
                                blackboard.faceFinder.stopSearch();
                                done(true);
                                return;
                            }
                            blackboard.log.info('Falling back to current tracks and detects');
                            let targets;
                            targets = blackboard.faceFinder.getTargetsFromMotionData(jibo.lps.motionData);
                            point = blackboard.faceFinder.getCenterFromTargets(targets, cameraTracking, cameraPhoto, blackboard.headRatio, fovSafeRegion);
                            if (point) {
                                blackboard.log.info('Found a center target using current tracks');
                                this.out = point;
                                blackboard.faceFinder.stopSearch();
                                done(true);
                                return;
                            }
                            blackboard.log.info('Falling back to best score: ' + blackboard.faceFinder.faceSearcher.bestScore.toString());
                            targets = blackboard.faceFinder.getTargetsFromMotionData(blackboard.faceFinder.faceSearcher.bestScore.motionData);
                            point = blackboard.faceFinder.getCenterFromTargets(targets, cameraTracking, cameraPhoto, blackboard.headRatio, fovSafeRegion);
                            if (point) {
                                blackboard.log.info('Created a center target using best motion data');
                                this.out = point;
                                blackboard.faceFinder.stopSearch();
                                done(true);
                                return;
                            }
                            blackboard.log.warn('Failed to get a center target, this should not happen');
                            blackboard.faceFinder.stopSearch();
                            done(false);
                        }, cameraTracking, cameraPhoto, blackboard.headRatio, fovSafeRegion);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '1c9c9ca5-a1cb-4458-95fc-88526a315c11': function () {
            return {
                'id': '1c9c9ca5-a1cb-4458-95fc-88526a315c11',
                'name': 'Look At Center Point',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1c9c9ca5-a1cb-4458-95fc-88526a315c11',
                        'to': '5906aec8-05a4-4909-ba1a-3b1052df4564',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.expression.acquireTarget({ position: this.in }).then(handle => {
                            return handle.promise;
                        }).then(() => {
                            done();
                        }).catch(err => {
                            blackboard.log.warn('Error during attend to target', err);
                            done('~photoError');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '44634ce6-2a61-4d3a-af6a-1aa8733bf763': function () {
            return {
                'id': '44634ce6-2a61-4d3a-af6a-1aa8733bf763',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '44634ce6-2a61-4d3a-af6a-1aa8733bf763',
                        'to': '158a73de-5f80-489b-bb00-69020b77d6ca',
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
        'c6204860-e3a9-4134-8781-f7bc6d8fd779': {
            'id': 'c6204860-e3a9-4134-8781-f7bc6d8fd779',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': 'c6204860-e3a9-4134-8781-f7bc6d8fd779',
                    'to': '8650d67d-da69-49a4-b336-1bc90ea24b3a',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        'cfb87ed9-08c0-424a-ac28-3869ad1911c6': function () {
            return {
                'id': 'cfb87ed9-08c0-424a-ac28-3869ad1911c6',
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
        '5906aec8-05a4-4909-ba1a-3b1052df4564': function () {
            return {
                'id': '5906aec8-05a4-4909-ba1a-3b1052df4564',
                'name': 'found',
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
        '2fa7e7a3-335e-4ccd-9e01-b9ec0062705d': function () {
            return {
                'id': '2fa7e7a3-335e-4ccd-9e01-b9ec0062705d',
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
        }
    };
};
},{}],11:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'create-photo-find-failed',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/create/src/flows/subs/create-photo-find-failed.flow'
        },
        'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b': function () {
            return {
                'id': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                'name': 'Look Good?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'to': '1c7a9d0c-af0c-4c16-8b02-747b15ef0f97',
                        'value': 'yes'
                    },
                    {
                        'frm': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'to': '3ec57edc-bba4-4834-870e-f352c4b5f378',
                        'value': 'no'
                    }
                ],
                'exceptions': [{
                        'frm': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'to': '3ec57edc-bba4-4834-870e-f352c4b5f378',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/LookGood.mim',
                    'getPromptData': () => {
                        console.log('Look Good?');
                        return {};
                    },
                    'onStatus': status => {
                        console.log('Look Good? status', status);
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        console.log('Look Good? success', results);
                        result.rollupResult = results.asrResults.intent;
                        return result.rollupResult;
                    },
                    'onFailure': results => {
                        console.log('Look Good? failure', results);
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        notepad.exceptionType = exception.split('.')[1];
                        return exception;
                    }
                }
            };
        },
        '3ec57edc-bba4-4834-870e-f352c4b5f378': function () {
            return {
                'id': '3ec57edc-bba4-4834-870e-f352c4b5f378',
                'name': 'Hide Viewfinder',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '3ec57edc-bba4-4834-870e-f352c4b5f378',
                        'to': '172557fe-1e4e-4178-b8c9-ea257ebc3e9c',
                        'value': 'no'
                    },
                    {
                        'frm': '3ec57edc-bba4-4834-870e-f352c4b5f378',
                        'to': '1953eff6-7a9a-4d16-a037-a140c0b40f8b',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let trans = notepad.exceptionType ? '' : this.inTransition;
                        jibo.media.setViewfinder(false, {}, error => {
                            if (error) {
                                blackboard.log.error('viewfinder disable error: ', error);
                                if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
                                    done('~photoError');
                                } else {
                                    done(trans);
                                }
                            } else {
                                blackboard.log.info('viewfinder disabled');
                                done(trans);
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'f14c4d59-becb-4e44-8e9b-a7bad5836123': function () {
            return {
                'id': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                'name': 'Try Again',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                        'to': '4b819ae2-f036-420e-978c-6279e46a66d3',
                        'value': 'yes'
                    },
                    {
                        'frm': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                        'to': '3dd8987c-cc7f-4c82-84d5-dd3eaf729a09',
                        'value': 'no'
                    }
                ],
                'exceptions': [{
                        'frm': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                        'to': '3dd8987c-cc7f-4c82-84d5-dd3eaf729a09',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/TryAgain.mim',
                    'getPromptData': () => {
                        return { saidNo: this.inTransition === 'no' };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        return results.asrResults.intent;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        '4b819ae2-f036-420e-978c-6279e46a66d3': function () {
            return {
                'id': '4b819ae2-f036-420e-978c-6279e46a66d3',
                'name': 'retry',
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
        '32faf5c3-2384-4a98-b42a-ecc87ae0571e': function () {
            return {
                'id': '32faf5c3-2384-4a98-b42a-ecc87ae0571e',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '32faf5c3-2384-4a98-b42a-ecc87ae0571e',
                        'to': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
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
        '3dd8987c-cc7f-4c82-84d5-dd3eaf729a09': function () {
            return {
                'id': '3dd8987c-cc7f-4c82-84d5-dd3eaf729a09',
                'name': 'exit',
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
        '1c7a9d0c-af0c-4c16-8b02-747b15ef0f97': function () {
            return {
                'id': '1c7a9d0c-af0c-4c16-8b02-747b15ef0f97',
                'name': 'take',
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
        'ed8bb529-6a19-4e6d-89a6-13568d1f8b57': function () {
            return {
                'id': 'ed8bb529-6a19-4e6d-89a6-13568d1f8b57',
                'name': 'SurfaceViewfinder',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ed8bb529-6a19-4e6d-89a6-13568d1f8b57',
                        'to': 'f42e1a1e-6bfe-413b-aab4-d194dbf1ce5e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.searchType = 'second';
                        blackboard.log.info('show view finder');
                        jibo.media.setViewfinder(true, {
                            enable: true,
                            x: 0,
                            y: 0,
                            width: 1280,
                            height: 720,
                            camera: 1
                        }, error => {
                            if (error) {
                                blackboard.log.error('viewfinder error: ', error);
                                if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
                                    done('~photoError');
                                } else {
                                    done();
                                }
                            } else {
                                blackboard.log.info('viewfinder enabled');
                                done();
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '1953eff6-7a9a-4d16-a037-a140c0b40f8b': function () {
            return {
                'id': '1953eff6-7a9a-4d16-a037-a140c0b40f8b',
                'name': 'Look Good Fallback',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '1953eff6-7a9a-4d16-a037-a140c0b40f8b',
                        'to': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                        'value': 'no'
                    },
                    {
                        'frm': '1953eff6-7a9a-4d16-a037-a140c0b40f8b',
                        'to': 'ac694250-8943-4733-ae96-7d5f8adfbb44',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': '1953eff6-7a9a-4d16-a037-a140c0b40f8b',
                        'to': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/LookGoodFallback.mim',
                    'getPromptData': () => {
                        return {
                            noMatch: notepad.exceptionType === 'noMatch',
                            noInput: notepad.exceptionType === 'noInput'
                        };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        result.rollupResult = results.asrResults.intent;
                        return result.rollupResult;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        'ac694250-8943-4733-ae96-7d5f8adfbb44': function () {
            return {
                'id': 'ac694250-8943-4733-ae96-7d5f8adfbb44',
                'name': 'SurfaceViewfinder',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ac694250-8943-4733-ae96-7d5f8adfbb44',
                        'to': '1c7a9d0c-af0c-4c16-8b02-747b15ef0f97',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.searchType = 'second';
                        blackboard.log.info('show view finder');
                        jibo.media.setViewfinder(true, {
                            enable: true,
                            x: 0,
                            y: 0,
                            width: 1280,
                            height: 720,
                            camera: 1
                        }, error => {
                            if (error) {
                                blackboard.log.error('viewfinder error: ', error);
                                if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
                                    done('~photoError');
                                } else {
                                    done();
                                }
                            } else {
                                blackboard.log.info('viewfinder enabled');
                                done();
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '354ca859-d748-4500-bd46-2d1536dc53e5': {
            'id': '354ca859-d748-4500-bd46-2d1536dc53e5',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '99c9112e-cb1e-44b4-abd0-262a841f7e9b': {
            'id': '99c9112e-cb1e-44b4-abd0-262a841f7e9b',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '99c9112e-cb1e-44b4-abd0-262a841f7e9b',
                    'to': 'ed8bb529-6a19-4e6d-89a6-13568d1f8b57',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        'f42e1a1e-6bfe-413b-aab4-d194dbf1ce5e': function () {
            return {
                'id': 'f42e1a1e-6bfe-413b-aab4-d194dbf1ce5e',
                'name': 'Clear Views',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f42e1a1e-6bfe-413b-aab4-d194dbf1ce5e',
                        'to': '669ed1e8-85c0-4dc8-9c8a-914b8ae40928',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.changeView({
                            removeAll: true,
                            leaveEmpty: true,
                            transitionClose: jibo.face.views.TRANSITION.OUT
                        }, () => {
                            blackboard.log.info('Successfully removed all views');
                            done();
                        }, () => {
                            blackboard.log.warn('Failed to remove all views');
                            done('~photoError');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '669ed1e8-85c0-4dc8-9c8a-914b8ae40928': function () {
            return {
                'id': '669ed1e8-85c0-4dc8-9c8a-914b8ae40928',
                'name': 'exit',
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
        '172557fe-1e4e-4178-b8c9-ea257ebc3e9c': function () {
            return {
                'id': '172557fe-1e4e-4178-b8c9-ea257ebc3e9c',
                'name': 'Open Eye',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '172557fe-1e4e-4178-b8c9-ea257ebc3e9c',
                        'to': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        if (!jibo.mim.shouldShowGUI) {
                            jibo.face.views.forceEyeView(() => {
                                blackboard.log.info('Successfully opened eye view');
                            }, null, jibo.face.views.TRANSITION.IN, jibo.face.views.TRANSITION.NONE, () => {
                                blackboard.log.warn('Failed to open eye view');
                            });
                        }
                    }
                }
            };
        }
    };
};
},{}],12:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'create-photo-rollup',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/create/src/flows/subs/create-photo-rollup.flow'
        },
        'ba00676c-144d-419b-99ee-8deaeb60e2d4': function () {
            return {
                'id': 'ba00676c-144d-419b-99ee-8deaeb60e2d4',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ba00676c-144d-419b-99ee-8deaeb60e2d4',
                        'to': '3ad1a8e8-442b-4489-85f3-f7f690f903cb',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return { photos: [] };
                    }
                }
            };
        },
        '16f75caa-99f1-4d26-a596-a71e02c9ca74': function () {
            return {
                'id': '16f75caa-99f1-4d26-a596-a71e02c9ca74',
                'name': 'present',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '16f75caa-99f1-4d26-a596-a71e02c9ca74',
                        'to': 'b7f18a06-3b27-428c-9953-51957699e2a2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.view = jibo.face.views.createView('PhotoView', null, false);
                        notepad.view.transitionStageOnly = true;
                        jibo.face.views.changeView({
                            remove: true,
                            addView: notepad.view,
                            transitionClose: jibo.face.views.TRANSITION.OUT,
                            transitionOpen: jibo.face.views.TRANSITION.UP
                        }, () => {
                            done();
                        }, () => {
                            blackboard.log.error('PhotoView failed to load');
                            done('~photoError');
                        }, view => {
                            view.addPhoto(notepad.photoBase64);
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '93af030d-83e0-4b61-8113-7db77b5173ab': {
            'id': '93af030d-83e0-4b61-8113-7db77b5173ab',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Picture',
            'options': {}
        },
        'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b': function () {
            return {
                'id': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                'name': 'Is It A Keeper',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'to': '8c4f53c6-17f8-45be-9770-a1066b22c7c9',
                        'value': 'yes'
                    },
                    {
                        'frm': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'to': '9eebff61-d65c-4777-9473-b6e4cc81cc0c',
                        'value': 'no'
                    },
                    {
                        'frm': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'to': '9eebff61-d65c-4777-9473-b6e4cc81cc0c',
                        'value': 'retake'
                    },
                    {
                        'frm': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'to': '8c4f53c6-17f8-45be-9770-a1066b22c7c9',
                        'value': ''
                    }
                ],
                'exceptions': [
                    {
                        'frm': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'to': '8c4f53c6-17f8-45be-9770-a1066b22c7c9',
                        'value': '~'
                    },
                    {
                        'frm': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'to': '2cfc9f0c-a682-4cfc-aa22-0aeefdf375b4',
                        'value': '~InteractionError.MenuClosed'
                    }
                ],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/IsItAKeeper.mim',
                    'getPromptData': () => {
                        return { isRestart: notepad.restartRollup };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        notepad.view.removeActionsByType('mimEnd', 'swipeDown');
                        notepad.view.removeActionsByType('mimShowGUI', 'tap');
                        result.rollupResult = results.asrResults.intent;
                        return result.rollupResult;
                    },
                    'onFailure': results => {
                        notepad.view.removeActionsByType('mimEnd', 'swipeDown');
                        notepad.view.removeActionsByType('mimShowGUI', 'tap');
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        'e78cb6cf-2bc2-4dc6-ab58-a3af148efcd8': {
            'id': 'e78cb6cf-2bc2-4dc6-ab58-a3af148efcd8',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Picture',
            'options': {}
        },
        'fa9bd718-ca25-4349-9ec8-589db232342e': function () {
            return {
                'id': 'fa9bd718-ca25-4349-9ec8-589db232342e',
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
        'b10efebf-d5eb-401d-8fa8-decbc33c0468': {
            'id': 'b10efebf-d5eb-401d-8fa8-decbc33c0468',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '64e3ab6b-8223-430e-a307-fa581457cfd5': {
            'id': '64e3ab6b-8223-430e-a307-fa581457cfd5',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '8c4f53c6-17f8-45be-9770-a1066b22c7c9': function () {
            return {
                'id': '8c4f53c6-17f8-45be-9770-a1066b22c7c9',
                'name': 'SaveCurrentPhoto',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8c4f53c6-17f8-45be-9770-a1066b22c7c9',
                        'to': '3cac36d6-d29a-4659-a934-3ff15ff10227',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.media.storePhoto({ buffer: notepad.photoBase64.replace(/^data:image\/jpeg;base64,/, '') }, (err, result) => {
                            if (err) {
                                blackboard.log.error('error saving photo: ', err);
                                done('~photoError');
                            } else {
                                done();
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'df461019-2c63-43c5-9dbe-aa8e4ea8a20d': function () {
            return {
                'id': 'df461019-2c63-43c5-9dbe-aa8e4ea8a20d',
                'name': 'filter photos',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'df461019-2c63-43c5-9dbe-aa8e4ea8a20d',
                        'to': '16f75caa-99f1-4d26-a596-a71e02c9ca74',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.mediaType = 'photo';
                        notepad.restartRollup = false;
                        if (!notepad.params.photos.length) {
                            blackboard.log.error('photo length of 0');
                            done('~photoError');
                            return;
                        }
                        blackboard.photoStyler.style(notepad.params.photos, (err, photo) => {
                            if (err) {
                                blackboard.log.error('image fail:', err);
                                done('~photoError');
                                return;
                            }
                            notepad.photoBase64 = photo;
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'b7f18a06-3b27-428c-9953-51957699e2a2': function () {
            return {
                'id': 'b7f18a06-3b27-428c-9953-51957699e2a2',
                'name': 'setup view listeners',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b7f18a06-3b27-428c-9953-51957699e2a2',
                        'to': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.view.addAction('mimShowGUI');
                        notepad.view.addAction('mimEnd', undefined, undefined, true, 'swipeDown');
                    }
                }
            };
        },
        '2cfc9f0c-a682-4cfc-aa22-0aeefdf375b4': function () {
            return {
                'id': '2cfc9f0c-a682-4cfc-aa22-0aeefdf375b4',
                'name': 'restart',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2cfc9f0c-a682-4cfc-aa22-0aeefdf375b4',
                        'to': 'b7f18a06-3b27-428c-9953-51957699e2a2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.restartRollup = true;
                    }
                }
            };
        },
        '3ad1a8e8-442b-4489-85f3-f7f690f903cb': function () {
            return {
                'id': '3ad1a8e8-442b-4489-85f3-f7f690f903cb',
                'name': 'flash white',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3ad1a8e8-442b-4489-85f3-f7f690f903cb',
                        'to': '02bb1af4-ef4c-4952-88ff-f6dbcee2993e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.view = jibo.face.views.currentView;
                        if (notepad.view.id === 'flashView') {
                            notepad.view.startLoader();
                            notepad.view.flashWhite();
                        } else {
                            blackboard.log.error('currentView should be flash view');
                        }
                        done();
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '9eebff61-d65c-4777-9473-b6e4cc81cc0c': function () {
            return {
                'id': '9eebff61-d65c-4777-9473-b6e4cc81cc0c',
                'name': 'cleanup view(delete)',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '9eebff61-d65c-4777-9473-b6e4cc81cc0c',
                        'to': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                        'value': 'no'
                    },
                    {
                        'frm': '9eebff61-d65c-4777-9473-b6e4cc81cc0c',
                        'to': 'c94a9f94-18c1-4d68-85d0-702bbc937026',
                        'value': 'retake'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.tracker.photoSaved(false);
                        notepad.view.showChoice(false, jibo.face.views.forceEyeView(() => {
                            done(result.rollupResult);
                        }, null, jibo.face.views.TRANSITION.IN, jibo.face.views.TRANSITION.OUT));
                        notepad.view = null;
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '3cac36d6-d29a-4659-a934-3ff15ff10227': function () {
            return {
                'id': '3cac36d6-d29a-4659-a934-3ff15ff10227',
                'name': 'cleanup view(save)',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '3cac36d6-d29a-4659-a934-3ff15ff10227',
                        'to': '47c01c00-df75-43b9-92f4-a1af2e8daed2',
                        'value': 'yes'
                    },
                    {
                        'frm': '3cac36d6-d29a-4659-a934-3ff15ff10227',
                        'to': '1ce96e8a-8a71-410f-8b5a-9f0a45cc3600',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.tracker.photoSaved(true);
                        notepad.view.showChoice(true, jibo.face.views.forceEyeView(() => {
                            done(result.rollupResult);
                        }, null, jibo.face.views.TRANSITION.IN, jibo.face.views.TRANSITION.UP));
                        notepad.view = null;
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'f14c4d59-becb-4e44-8e9b-a7bad5836123': function () {
            return {
                'id': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                'name': 'Take Another Photo?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                        'to': 'fa9bd718-ca25-4349-9ec8-589db232342e',
                        'value': 'no'
                    },
                    {
                        'frm': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                        'to': 'c94a9f94-18c1-4d68-85d0-702bbc937026',
                        'value': 'yes'
                    },
                    {
                        'frm': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                        'to': 'fa9bd718-ca25-4349-9ec8-589db232342e',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': 'f14c4d59-becb-4e44-8e9b-a7bad5836123',
                        'to': 'fa9bd718-ca25-4349-9ec8-589db232342e',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/TakeAnotherPhoto.mim',
                    'getPromptData': () => {
                        return { isRestart: notepad.restartRollup };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        return results.asrResults.intent;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        'c94a9f94-18c1-4d68-85d0-702bbc937026': function () {
            return {
                'id': 'c94a9f94-18c1-4d68-85d0-702bbc937026',
                'name': 'Set Retake',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c94a9f94-18c1-4d68-85d0-702bbc937026',
                        'to': 'fa9bd718-ca25-4349-9ec8-589db232342e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        result.rollupResult = 'retake';
                        return '';
                    }
                }
            };
        },
        '02bb1af4-ef4c-4952-88ff-f6dbcee2993e': function () {
            return {
                'id': '02bb1af4-ef4c-4952-88ff-f6dbcee2993e',
                'name': 'Attention Mode MENU',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '02bb1af4-ef4c-4952-88ff-f6dbcee2993e',
                        'to': 'df461019-2c63-43c5-9dbe-aa8e4ea8a20d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.expression.setAttentionMode('MENU').then(() => {
                            done();
                        }).catch(err => {
                            blackboard.log.error('Error setting attention mode to MENU', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '47c01c00-df75-43b9-92f4-a1af2e8daed2': function () {
            return {
                'id': '47c01c00-df75-43b9-92f4-a1af2e8daed2',
                'name': 'Save Media',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '47c01c00-df75-43b9-92f4-a1af2e8daed2',
                        'to': 'fa9bd718-ca25-4349-9ec8-589db232342e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/SaveMedia.mim',
                    'getPromptData': () => {
                        return { type: notepad.mediaType };
                    }
                }
            };
        },
        '1ce96e8a-8a71-410f-8b5a-9f0a45cc3600': function () {
            return {
                'id': '1ce96e8a-8a71-410f-8b5a-9f0a45cc3600',
                'name': 'Default To Gallery',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1ce96e8a-8a71-410f-8b5a-9f0a45cc3600',
                        'to': 'fa9bd718-ca25-4349-9ec8-589db232342e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/DefaultToGallery.mim',
                    'getPromptData': () => {
                        return { type: notepad.mediaType };
                    }
                }
            };
        }
    };
};
},{}],13:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'create-photo',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/create/src/flows/subs/create-photo.flow'
        },
        'ccb8a0f6-c517-4728-88c6-ef7ffc71526f': function () {
            return {
                'id': 'ccb8a0f6-c517-4728-88c6-ef7ffc71526f',
                'name': 'Begin',
                'transitions': [{
                        'frm': 'ccb8a0f6-c517-4728-88c6-ef7ffc71526f',
                        'to': 'b3b57232-af1a-4edf-82c8-64238ad7ef0c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return { numPhotos: 1 };
                    }
                }
            };
        },
        '0c351594-f4b1-46a0-9f91-3b43a033ce4e': function () {
            return {
                'id': '0c351594-f4b1-46a0-9f91-3b43a033ce4e',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return '';
                    }
                }
            };
        },
        'df8cf3b8-bc65-4284-9eca-6d2b6a51c2e1': function () {
            return {
                'id': 'df8cf3b8-bc65-4284-9eca-6d2b6a51c2e1',
                'name': 'TakeMorePhotos',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'df8cf3b8-bc65-4284-9eca-6d2b6a51c2e1',
                        'to': '79ba11dd-11b5-4203-8b5b-507759a82a4d',
                        'value': 'true'
                    },
                    {
                        'frm': 'df8cf3b8-bc65-4284-9eca-6d2b6a51c2e1',
                        'to': '0118ffc6-61bb-41b5-ab14-d92979e4f21f',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return --notepad.numPhotos > 0;
                    }
                }
            };
        },
        '8c249976-6e78-482d-956c-3e52c3cfe480': function () {
            return {
                'id': '8c249976-6e78-482d-956c-3e52c3cfe480',
                'name': 'Paparazzi',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8c249976-6e78-482d-956c-3e52c3cfe480',
                        'to': '922509aa-792e-43df-b2cd-1e14ae4131b0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Paparazzi.mim',
                    'getPromptData': () => {
                        return {
                            numLeft: notepad.numPhotos,
                            loopMember: null
                        };
                    }
                }
            };
        },
        '0118ffc6-61bb-41b5-ab14-d92979e4f21f': function () {
            return {
                'id': '0118ffc6-61bb-41b5-ab14-d92979e4f21f',
                'name': 'create-photo-rollup',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '0118ffc6-61bb-41b5-ab14-d92979e4f21f',
                        'to': '118d536d-ff7e-47c3-9da0-f8ba6cacf8e6',
                        'value': 'retake'
                    },
                    {
                        'frm': '0118ffc6-61bb-41b5-ab14-d92979e4f21f',
                        'to': '0c351594-f4b1-46a0-9f91-3b43a033ce4e',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./create-photo-rollup');
                    },
                    'inputParameters': () => {
                        return { photos: notepad.photos };
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.rollupResult;
                    }
                }
            };
        },
        '0a55d57a-a229-428b-8132-8ab548d36359': function () {
            return {
                'id': '0a55d57a-a229-428b-8132-8ab548d36359',
                'name': 'Photo Get Ready',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0a55d57a-a229-428b-8132-8ab548d36359',
                        'to': '1e976be5-6820-42a2-8b98-29bae156b840',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/PhotoGetReady.mim',
                    'getPromptData': () => {
                        return { manualTake: blackboard.manualTake };
                    }
                }
            };
        },
        '79ba11dd-11b5-4203-8b5b-507759a82a4d': function () {
            return {
                'id': '79ba11dd-11b5-4203-8b5b-507759a82a4d',
                'name': 'SurfaceViewfinder',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '79ba11dd-11b5-4203-8b5b-507759a82a4d',
                        'to': '8c249976-6e78-482d-956c-3e52c3cfe480',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.media.setViewfinder(true, {
                            enable: true,
                            x: 0,
                            y: 0,
                            width: 1280,
                            height: 720,
                            camera: 1
                        }, error => {
                            if (error) {
                                blackboard.log.error('viewfinder error: ', error);
                                if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
                                    done('~photoError');
                                } else {
                                    done();
                                }
                            } else {
                                blackboard.log.info('viewfinder enabled');
                                done();
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'cd4c8f1f-e2b7-4af5-bf30-90858b305a9f': function () {
            return {
                'id': 'cd4c8f1f-e2b7-4af5-bf30-90858b305a9f',
                'name': 'Hide Viewfinder',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'cd4c8f1f-e2b7-4af5-bf30-90858b305a9f',
                        'to': 'df8cf3b8-bc65-4284-9eca-6d2b6a51c2e1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.media.setViewfinder(false, {}, error => {
                            if (error) {
                                blackboard.log.error('viewfinder disable error: ', error);
                                if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
                                    done('~photoError');
                                } else {
                                    done();
                                }
                            } else {
                                blackboard.log.info('viewfinder disabled');
                                done();
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '922509aa-792e-43df-b2cd-1e14ae4131b0': function () {
            return {
                'id': '922509aa-792e-43df-b2cd-1e14ae4131b0',
                'name': 'takePhoto',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '922509aa-792e-43df-b2cd-1e14ae4131b0',
                        'to': 'cd4c8f1f-e2b7-4af5-bf30-90858b305a9f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.sound.play('Shutter_01');
                        jibo.media.takePhoto((err, data) => {
                            if (!err && data) {
                                blackboard.log.info('Photo taking');
                                notepad.photos.push(data);
                                done();
                            } else {
                                blackboard.log.error('Photo taking error:', err);
                                done('~photoError');
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'b3b57232-af1a-4edf-82c8-64238ad7ef0c': function () {
            return {
                'id': 'b3b57232-af1a-4edf-82c8-64238ad7ef0c',
                'name': 'Show Camera',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b3b57232-af1a-4edf-82c8-64238ad7ef0c',
                        'to': '8c453647-8205-44c6-b5ac-5e1d29b9f79f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.view = jibo.face.views.createView('CameraView');
                        jibo.face.views.changeView({ addView: notepad.view }, null, () => {
                            blackboard.log.warn('Error loading camera view');
                        });
                    }
                }
            };
        },
        '1470c8a1-c0da-4b1e-9a68-1df43c798bbe': function () {
            return {
                'id': '1470c8a1-c0da-4b1e-9a68-1df43c798bbe',
                'name': 'Echo Photo',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1470c8a1-c0da-4b1e-9a68-1df43c798bbe',
                        'to': '1800951a-c420-4761-9e31-70daf92a2572',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/EchoPhoto.mim',
                    'getPromptData': () => {
                        return {
                            numPhotos: notepad.params.numPhotos,
                            loopMember: null
                        };
                    }
                }
            };
        },
        'f9a78599-0b27-45cd-b389-1894011a75a3': function () {
            return {
                'id': 'f9a78599-0b27-45cd-b389-1894011a75a3',
                'name': 'Reset Photo Vars',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f9a78599-0b27-45cd-b389-1894011a75a3',
                        'to': '0a55d57a-a229-428b-8132-8ab548d36359',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.numPhotos = notepad.params.numPhotos;
                        notepad.photos = [];
                    }
                }
            };
        },
        '9bb86414-e3d1-40ab-8eb5-fc784d2793fa': function () {
            return {
                'id': '9bb86414-e3d1-40ab-8eb5-fc784d2793fa',
                'name': 'SurfaceViewfinder',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9bb86414-e3d1-40ab-8eb5-fc784d2793fa',
                        'to': '9386f327-17a3-4ed1-8917-167a31f475a7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.media.setViewfinder(true, {
                            enable: true,
                            x: 0,
                            y: 0,
                            width: 1280,
                            height: 720,
                            camera: 1
                        }, error => {
                            if (error) {
                                blackboard.log.error('Viewfinder error: ', error);
                                if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
                                    done('~photoError');
                                } else {
                                    done();
                                }
                            } else {
                                blackboard.log.info('viewfinder enabled');
                                done();
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '795e2709-6418-4580-aced-c0ccea03c4fe': function () {
            return {
                'id': '795e2709-6418-4580-aced-c0ccea03c4fe',
                'name': 'You Got It',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '795e2709-6418-4580-aced-c0ccea03c4fe',
                        'to': '1800951a-c420-4761-9e31-70daf92a2572',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/YouGotIt.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '118d536d-ff7e-47c3-9da0-f8ba6cacf8e6': function () {
            return {
                'id': '118d536d-ff7e-47c3-9da0-f8ba6cacf8e6',
                'name': 'Set Retake',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '118d536d-ff7e-47c3-9da0-f8ba6cacf8e6',
                        'to': 'b3b57232-af1a-4edf-82c8-64238ad7ef0c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        result.rollupResult = 'retake';
                        blackboard.didSearch = false;
                        blackboard.manualTake = false;
                        blackboard.tracker.retry();
                    }
                }
            };
        },
        'fb02f470-d689-4402-a9d3-70d18a0f5712': function () {
            return {
                'id': 'fb02f470-d689-4402-a9d3-70d18a0f5712',
                'name': 'Check Faces Search Result',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'fb02f470-d689-4402-a9d3-70d18a0f5712',
                        'to': 'c71581ab-165e-4c1e-9bca-8592b5608864',
                        'value': 'false'
                    },
                    {
                        'frm': 'fb02f470-d689-4402-a9d3-70d18a0f5712',
                        'to': '7cfd9026-4860-49f0-aef8-1ce03c5dff0d',
                        'value': 'true'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.log.info('Best score: ' + blackboard.faceFinder.faceSearcher.bestScore.toString());
                        const faceFound = blackboard.faceFinder.checkBest(blackboard.faceFinder.lowScore);
                        blackboard.log.info('Face found: ' + faceFound);
                        if (faceFound) {
                            blackboard.tracker.found = 'check';
                        } else {
                            blackboard.faceFinder.stopSearch();
                        }
                        return faceFound;
                    }
                }
            };
        },
        '9386f327-17a3-4ed1-8917-167a31f475a7': function () {
            return {
                'id': '9386f327-17a3-4ed1-8917-167a31f475a7',
                'name': 'Create Flash View',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9386f327-17a3-4ed1-8917-167a31f475a7',
                        'to': 'f9a78599-0b27-45cd-b389-1894011a75a3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.view = jibo.face.views.createView('FlashView');
                        notepad.view.transitionStageOnly = true;
                        jibo.face.views.changeView({
                            remove: true,
                            addView: notepad.view,
                            transitionOpen: jibo.face.views.TRANSITION.NONE,
                            transitionClose: jibo.face.views.TRANSITION.NONE
                        }, null, () => {
                            blackboard.log.error('Error loading white');
                        });
                    }
                }
            };
        },
        '1800951a-c420-4761-9e31-70daf92a2572': function () {
            return {
                'id': '1800951a-c420-4761-9e31-70daf92a2572',
                'name': 'Camera View Opened',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1800951a-c420-4761-9e31-70daf92a2572',
                        'to': 'fb02f470-d689-4402-a9d3-70d18a0f5712',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (notepad.view.state === jibo.face.views.STATE.OPENED) {
                            notepad.view.storeDefaultValues();
                            done();
                        } else {
                            notepad.view.on(jibo.face.views.STATE.OPENED, () => {
                                notepad.view.storeDefaultValues();
                                done();
                            });
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '210cde74-0df8-4119-9b3d-62914659d0e9': function () {
            return {
                'id': '210cde74-0df8-4119-9b3d-62914659d0e9',
                'name': 'Choose Mim',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '210cde74-0df8-4119-9b3d-62914659d0e9',
                        'to': '1470c8a1-c0da-4b1e-9a68-1df43c798bbe',
                        'value': ''
                    },
                    {
                        'frm': '210cde74-0df8-4119-9b3d-62914659d0e9',
                        'to': '795e2709-6418-4580-aced-c0ccea03c4fe',
                        'value': 'retake'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return result.rollupResult;
                    }
                }
            };
        },
        '5b9d18f5-348f-4769-b576-798c031d2560': function () {
            return {
                'id': '5b9d18f5-348f-4769-b576-798c031d2560',
                'name': 'View Only Lens',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5b9d18f5-348f-4769-b576-798c031d2560',
                        'to': 'd249f680-fb36-4333-bac0-e3b51b3fd555',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.view.expandToLens();
                    }
                }
            };
        },
        '467644e7-9a14-452f-a8bc-b54719128554': function () {
            return {
                'id': '467644e7-9a14-452f-a8bc-b54719128554',
                'name': 'View Corners & Camera',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '467644e7-9a14-452f-a8bc-b54719128554',
                        'to': '4b0bcf93-98de-4edc-9f27-6e31af7160c9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.view.showCorners();
                        notepad.view.shrinkLens();
                    }
                }
            };
        },
        '7cfd9026-4860-49f0-aef8-1ce03c5dff0d': function () {
            return {
                'id': '7cfd9026-4860-49f0-aef8-1ce03c5dff0d',
                'name': 'Attention OFF',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7cfd9026-4860-49f0-aef8-1ce03c5dff0d',
                        'to': '467644e7-9a14-452f-a8bc-b54719128554',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.expression.setAttentionMode('OFF').then(() => {
                            done();
                        }).catch(err => {
                            blackboard.log.error('Error setting attention mode to OFF', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'f8027ce6-3265-4efc-ae2b-1efcff20ff73': function () {
            return {
                'id': 'f8027ce6-3265-4efc-ae2b-1efcff20ff73',
                'name': 'Attention OFF',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f8027ce6-3265-4efc-ae2b-1efcff20ff73',
                        'to': '9bb86414-e3d1-40ab-8eb5-fc784d2793fa',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.expression.setAttentionMode('OFF').then(() => {
                            done();
                        }).catch(err => {
                            blackboard.log.error('Error setting attention mode to OFF', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '69ce69d8-ad50-4379-a092-a9abe812e113': {
            'id': '69ce69d8-ad50-4379-a092-a9abe812e113',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '1e976be5-6820-42a2-8b98-29bae156b840': function () {
            return {
                'id': '1e976be5-6820-42a2-8b98-29bae156b840',
                'name': 'Check Flash View',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1e976be5-6820-42a2-8b98-29bae156b840',
                        'to': '922509aa-792e-43df-b2cd-1e14ae4131b0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (notepad.view.state === jibo.face.views.STATE.OPENED) {
                            done();
                        } else {
                            blackboard.log.error('Error with flash view');
                            done('~photoError');
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '4b0bcf93-98de-4edc-9f27-6e31af7160c9': function () {
            return {
                'id': '4b0bcf93-98de-4edc-9f27-6e31af7160c9',
                'name': 'frame-faces',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '4b0bcf93-98de-4edc-9f27-6e31af7160c9',
                        'to': 'f8027ce6-3265-4efc-ae2b-1efcff20ff73',
                        'value': 'found'
                    },
                    {
                        'frm': '4b0bcf93-98de-4edc-9f27-6e31af7160c9',
                        'to': '4ac58bce-f478-4e0d-9c7d-2bc35517d066',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./create-frame-faces');
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
        'd249f680-fb36-4333-bac0-e3b51b3fd555': function () {
            return {
                'id': 'd249f680-fb36-4333-bac0-e3b51b3fd555',
                'name': 'find-face',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'd249f680-fb36-4333-bac0-e3b51b3fd555',
                        'to': '467644e7-9a14-452f-a8bc-b54719128554',
                        'value': 'found'
                    },
                    {
                        'frm': 'd249f680-fb36-4333-bac0-e3b51b3fd555',
                        'to': 'f2321df5-bb6f-4e88-b75c-3a3b804d1c5a',
                        'value': 'take'
                    },
                    {
                        'frm': 'd249f680-fb36-4333-bac0-e3b51b3fd555',
                        'to': '2b1fe533-ff31-403b-a9fb-302d986b033a',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./create-find-face');
                    },
                    'inputParameters': () => {
                        return { duration: 8000 };
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '4ac58bce-f478-4e0d-9c7d-2bc35517d066': function () {
            return {
                'id': '4ac58bce-f478-4e0d-9c7d-2bc35517d066',
                'name': 'Hide View Corners',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ac58bce-f478-4e0d-9c7d-2bc35517d066',
                        'to': 'deb0b9e7-2c9d-42ea-a072-9aec3262d9c8',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.view.hideCorners();
                    }
                }
            };
        },
        '2b1fe533-ff31-403b-a9fb-302d986b033a': function () {
            return {
                'id': '2b1fe533-ff31-403b-a9fb-302d986b033a',
                'name': 'find-failed',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '2b1fe533-ff31-403b-a9fb-302d986b033a',
                        'to': '0c351594-f4b1-46a0-9f91-3b43a033ce4e',
                        'value': 'exit'
                    },
                    {
                        'frm': '2b1fe533-ff31-403b-a9fb-302d986b033a',
                        'to': '118d536d-ff7e-47c3-9da0-f8ba6cacf8e6',
                        'value': 'retry'
                    },
                    {
                        'frm': '2b1fe533-ff31-403b-a9fb-302d986b033a',
                        'to': '43bbc54a-e7b2-4c3d-8eda-5d51c4427fab',
                        'value': 'take'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./create-photo-find-failed');
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
        'c71581ab-165e-4c1e-9bca-8592b5608864': function () {
            return {
                'id': 'c71581ab-165e-4c1e-9bca-8592b5608864',
                'name': 'Set Search',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c71581ab-165e-4c1e-9bca-8592b5608864',
                        'to': '5b9d18f5-348f-4769-b576-798c031d2560',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.didSearch = true;
                        blackboard.searchType = !blackboard.searchedOnce ? 'first' : 'again';
                    }
                }
            };
        },
        'deb0b9e7-2c9d-42ea-a072-9aec3262d9c8': function () {
            return {
                'id': 'deb0b9e7-2c9d-42ea-a072-9aec3262d9c8',
                'name': 'Set Search',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'deb0b9e7-2c9d-42ea-a072-9aec3262d9c8',
                        'to': '5b9d18f5-348f-4769-b576-798c031d2560',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.didSearch = true;
                        blackboard.searchType = 'lost';
                    }
                }
            };
        },
        '7dfef3cc-8dcc-4340-90c7-3def81fbfb2f': function () {
            return {
                'id': '7dfef3cc-8dcc-4340-90c7-3def81fbfb2f',
                'name': 'Just Take It',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/JustTakeIt.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'f2321df5-bb6f-4e88-b75c-3a3b804d1c5a': function () {
            return {
                'id': 'f2321df5-bb6f-4e88-b75c-3a3b804d1c5a',
                'name': 'Manual Take',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f2321df5-bb6f-4e88-b75c-3a3b804d1c5a',
                        'to': '9bb86414-e3d1-40ab-8eb5-fc784d2793fa',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.manualTake = true;
                    }
                }
            };
        },
        '43bbc54a-e7b2-4c3d-8eda-5d51c4427fab': function () {
            return {
                'id': '43bbc54a-e7b2-4c3d-8eda-5d51c4427fab',
                'name': 'Manual Take',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '43bbc54a-e7b2-4c3d-8eda-5d51c4427fab',
                        'to': '9386f327-17a3-4ed1-8917-167a31f475a7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.manualTake = true;
                    }
                }
            };
        },
        '8c453647-8205-44c6-b5ac-5e1d29b9f79f': function () {
            return {
                'id': '8c453647-8205-44c6-b5ac-5e1d29b9f79f',
                'name': 'Start Face Search',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8c453647-8205-44c6-b5ac-5e1d29b9f79f',
                        'to': '210cde74-0df8-4119-9b3d-62914659d0e9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.log.info('Starting active search, will search until stopped');
                        blackboard.faceFinder.startSearch();
                    }
                }
            };
        }
    };
};
},{"./create-find-face":9,"./create-frame-faces":10,"./create-photo-find-failed":11,"./create-photo-rollup":12}],14:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const jibo = require("jibo");
const PhotoView_1 = require("./views/PhotoView");
const FlashView_1 = require("./views/FlashView");
const CameraView_1 = require("./views/CameraView");
const Analytics_1 = require("./Analytics");
const FrameHelper_1 = require("./FrameHelper");
const FaceSearcher_1 = require("./FaceSearcher");
const PhotoStyler = require('./PhotoStyler');
const FaceFinder = require('./FaceFinder');
const mainFlow = require('./flows/create-main');
class Create extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this._tracker = null;
        this.flow = null;
        FaceSearcher_1.default.log = this.log.createChild('FaceSearcher');
        FrameHelper_1.default.log = this.log.createChild('FrameHelper');
        PhotoStyler.log = this.log.createChild('PhotoStyler');
        FaceFinder.log = this.log.createChild('FaceFinder');
        CameraView_1.default.log = this.log.createChild('CameraView');
        FlashView_1.default.log = this.log.createChild('FlashView');
        PhotoView_1.default.log = this.log.createChild('PhotoView');
    }
    preload(done) {
        const load = jibo.loader.load({
            src: 'audio/Shutter_01.m4a',
            cache: jibo.loader.activeCache
        }, done);
        this._assetTokens = load.tokens;
    }
    open(result, refresh) {
        if (refresh) {
            this.cleanup(this.open.bind(this, result));
        }
        else {
            jibo.mim.silentMenus = false;
            jibo.face.views.disableMovement = false;
            jibo.face.views.creator.registerClass(PhotoView_1.default);
            jibo.face.views.creator.registerClass(FlashView_1.default);
            jibo.face.views.creator.registerClass(CameraView_1.default);
            let intent = 'menu';
            if (result && result.nlu && result.nlu.intent) {
                intent = result.nlu.intent;
            }
            if (!this._tracker) {
                this._tracker = new Analytics_1.default(this);
            }
            this._tracker.reset((intent === 'createSomePhotos'));
            const options = {
                assetPack: this.assetPack,
                params: { intent: intent },
                blackboard: {
                    photoStyler: new PhotoStyler(this.log),
                    faceFinder: new FaceFinder(this.log),
                    lightRing: this.setLightRing,
                    headRatio: .56,
                    log: this.log,
                    tracker: this._tracker,
                    skill: this
                },
                enableLogging: true
            };
            this.flow = jibo.flow.run(mainFlow, options, (err, status) => {
                if (status !== jibo.bt.Status.INTERRUPTED) {
                    this.log.info('flow ended without interruption, destroy flow & calling exit');
                    this.destroyFlow();
                    this.exit();
                }
                else {
                    this.log.info('flow ended with interruption, not calling exit');
                }
            });
        }
    }
    close(done) {
        jibo.loader.unload(this._assetTokens);
        this._assetTokens = null;
        jibo.face.views.creator.unregisterClass('PhotoView');
        jibo.face.views.creator.unregisterClass('FlashView');
        jibo.face.views.creator.unregisterClass('CameraView');
        this.cleanup(done);
    }
    setMode(mode) {
        return __awaiter(this, void 0, void 0, function* () {
            this._pmHandle = yield jibo.expression.pushAttentionMode(mode);
            return this._pmHandle;
        });
    }
    releaseMode() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._pmHandle) {
                yield this._pmHandle.release();
                this._pmHandle = null;
            }
        });
    }
    setLightRing(turnOn) {
        if (turnOn) {
            jibo.embodied.listen.enterActiveMode(jibo.embodied.listen.ActiveListenMode.UI);
        }
        else {
            jibo.embodied.listen.exitActiveMode();
        }
    }
    destroyFlow() {
        if (this.flow) {
            this.log.info('flow ended, destroy flow any classes on blackboard');
            if (this.flow.blackboard) {
                if (this.flow.blackboard.faceFinder) {
                    this.flow.blackboard.faceFinder.destroy();
                }
                if (this.flow.blackboard.photoStyler) {
                    this.flow.blackboard.photoStyler.destroy();
                }
            }
            this.flow.destroy();
            this.flow = null;
        }
    }
    cleanup(done) {
        this.setLightRing(false);
        if (this.flow) {
            Promise.all([
                this.flow.stop()
                    .catch((err) => {
                    this.log.debug('Error when stopping flow: ', err);
                })
                    .then(() => {
                    this.destroyFlow();
                }),
                this.releaseMode(),
                this.disableViewFinder()
                    .catch((err) => {
                    this.log.debug('cleanup() setViewfinder disable error: ', err);
                }),
                this.cleanupViews()
                    .catch((err) => {
                    this.log.debug('Eror when closing views: ', err);
                })
            ])
                .then(() => {
                done();
            });
        }
        else {
            Promise.all([
                this.releaseMode(),
                this.disableViewFinder()
                    .catch((err) => {
                    this.log.debug('cleanup() setViewfinder disable error: ', err);
                }),
                this.cleanupViews()
                    .catch((err) => {
                    this.log.debug('Eror when closing views: ', err);
                })
            ])
                .then(() => {
                done();
            });
        }
    }
    disableViewFinder() {
        return new Promise((resolve) => {
            jibo.media.setViewfinder({ enable: false }, (error) => {
                if (error) {
                    this.log.error('cleanup() setViewfinder disable error: ', error);
                }
                resolve();
            });
        });
    }
    cleanupViews() {
        return new Promise((resolve) => {
            jibo.face.views.viewStackCleanup()
                .then(() => {
                resolve();
            })
                .catch(() => {
                this.log.debug('cleanupViews() failed to remove all views, calling done anyway');
                resolve();
            });
        });
    }
}
Create.PhotoStyler = PhotoStyler;
Create.FrameHelper = FrameHelper_1.default;
module.exports = Create;

},{"./Analytics":2,"./FaceFinder":3,"./FaceSearcher":5,"./FrameHelper":6,"./PhotoStyler":7,"./flows/create-main":8,"./views/CameraView":15,"./views/FlashView":16,"./views/PhotoView":17,"@be/be-framework":undefined,"jibo":undefined}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class CameraView extends jibo.rendering.gui.views.View {
    constructor() {
        super();
        this._lensZoomed = false;
        this._type = CameraView.DEFAULT_TYPE;
        this.id = 'cameraView';
        this.transitionStageOnly = true;
        this.closeOnSwipeDown = false;
        this._category = jibo.face.views.CATEGORY.DISPLAY;
        this.addTransition(jibo.rendering.gui.views.EyeView.DEFAULT_TYPE, true, this.openFromEye, jibo.face.views.TRANSITION.NONE);
        this.lensSearch = this.lensSearch.bind(this);
        this.startLensSearch = this.startLensSearch.bind(this);
    }
    static get DEFAULT_TYPE() { return 'CameraView'; }
    ready() {
        this._cameraClip.movieClip.gotoAndStop('open_stop');
        let clip = this._cameraClip.movieClip;
        this._corners = clip['corners'];
        this._ring = clip['ring'];
        this._body = clip['body'];
        this._light = this._body['light'];
        this._lens = clip['lens'];
        this._lensRing = this._lens['lensCase']['ring'];
        this._iris = this._lens['lensFront']['iris'];
        this._body.gotoAndStop('open_stop');
        this._lens.gotoAndStop('open_stop');
        this._ring.gotoAndStop('open_stop');
        this.setLight('black');
        clip.visible = true;
        clip.alpha = 1;
        this._ring.visible = false;
        this._ring.alpha = 1;
        this._body.visible = true;
        this._body.alpha = 1;
        this._lens.visible = true;
        this._lens.alpha = 1;
        this._corners.visible = false;
        this._corners.alpha = 1;
        super.ready();
    }
    applyData() {
        this.addAssetDescriptorObject({
            id: 'camera-sfx',
            type: 'sound',
            src: 'audio/camera-open.m4a'
        });
        this._cameraClip = new jibo.rendering.gui.components.Clip();
        this._cameraClip.addAssetDescriptorObject({
            id: 'camera',
            type: 'timeline',
            src: 'assets/camera/camera.js',
            upload: true
        });
        this.addComponent(this._cameraClip, 'cameraClip');
        super.applyData();
    }
    openFromEye(callback) {
        this._cameraClip.display.visible = false;
        const eye = jibo.face.eye;
        this._stage.addChild(eye);
        eye.active = false;
        eye.visible = true;
        const duration = 550 * .7;
        super.transitionFadeOutTo(() => {
            this._stage.removeChild(eye);
            eye.active = false;
            let action = new jibo.rendering.gui.actions.ActionData('sound', { id: 'camera-sfx' });
            this._inputLocked = false;
            super.actionHandler(action);
            this._inputLocked = true;
            this._ring.visible = true;
            PIXI.animate.Animator.play(this._body, 'open');
            PIXI.animate.Animator.play(this._lens, 'open');
            PIXI.animate.Animator.play(this._ring, 'open');
            this._cameraClip.display.visible = true;
            callback();
        }, 1.1, .8, .6, duration);
    }
    destroy() {
        this._lensZoomed = false;
        if (this._timer) {
            this._timer.destroy();
            this._timer = null;
        }
        if (this._body) {
            jibo.rendering.tween.TweenManager.stop(this._body);
            this._body = null;
        }
        if (this._lens) {
            jibo.rendering.tween.TweenManager.stop(this._lens);
            this._lens = null;
        }
        if (this._lensRing) {
            jibo.rendering.tween.TweenManager.stop(this._lensRing);
            this._lensRing = null;
        }
        if (this._iris) {
            jibo.rendering.tween.TweenManager.stop(this._iris);
            this._iris = null;
        }
        if (this._corners) {
            jibo.rendering.tween.TweenManager.stop(this._corners);
            this._corners = null;
        }
        this._cameraClip = null;
        this._light = null;
        this._ring = null;
        this._corners = null;
        this._lensPosition = null;
        this._bodyPosition = null;
        super.destroy();
    }
    storeDefaultValues() {
        this._lensScale = this._lens.scale.x;
        this._bodyScale = this._body.scale.x;
        this._irisScale = this._iris.scale.x;
        this._lensPosition = new PIXI.Point(this._lens.x, this._lens.y);
        this._bodyPosition = new PIXI.Point(this._body.x, this._body.y);
        this._ring.visible = false;
    }
    expandToLens(callback, duration = 600) {
        this._lensZoomed = true;
        this.setLight('red');
        let centerX = jibo.face.width * .5;
        let centerY = jibo.face.height * .55;
        const bodyScale = this._bodyScale * .96;
        jibo.rendering.tween.TweenManager.stop(this._body);
        jibo.rendering.tween.TweenManager.play(this._body, {
            to: {
                'scale.x': bodyScale,
                'scale.y': bodyScale,
            },
            duration: duration,
            ease: 'backOut'
        });
        const lensScale = this._lensScale * CameraView.MAX_LENS_SCALE;
        jibo.rendering.tween.TweenManager.stop(this._lens);
        jibo.rendering.tween.TweenManager.play(this._lens, {
            to: {
                'scale.x': lensScale,
                'scale.y': lensScale,
                'x': centerX,
                'y': centerY
            },
            duration: duration,
            ease: 'backOut'
        }, () => {
            this.startLensSearch();
            if (callback) {
                callback();
            }
        });
        const irisScale = this._irisScale * CameraView.MAX_IRIS_SCALE;
        jibo.rendering.tween.TweenManager.stop(this._iris);
        jibo.rendering.tween.TweenManager.play(this._iris, {
            to: {
                'scale.x': irisScale,
                'scale.y': irisScale
            },
            duration: duration,
            ease: 'backOut'
        });
        jibo.rendering.tween.TweenManager.stop(this._lensRing);
        jibo.rendering.tween.TweenManager.play(this._lensRing, {
            to: {
                rotation: Math.PI / 4
            },
            duration: duration,
            ease: 'backOut'
        });
    }
    shrinkLens(callback, duration = 500) {
        if (this._lensZoomed) {
            this.registerUpdate(false);
            this._lensZoomed = false;
            if (this._timer) {
                this._timer.destroy();
                this._timer = null;
            }
            jibo.rendering.tween.TweenManager.stop(this._body);
            jibo.rendering.tween.TweenManager.play(this._body, {
                to: {
                    'scale.x': this._bodyScale,
                    'scale.y': this._bodyScale,
                    'x': this._lensPosition.x,
                    'y': this._lensPosition.y
                },
                duration: duration,
                ease: 'backIn'
            });
            jibo.rendering.tween.TweenManager.stop(this._lens);
            jibo.rendering.tween.TweenManager.play(this._lens, {
                to: {
                    'scale.x': this._lensScale,
                    'scale.y': this._lensScale,
                    'x': this._lensPosition.x,
                    'y': this._lensPosition.y
                },
                duration: duration,
                ease: 'backIn'
            }, callback);
            jibo.rendering.tween.TweenManager.stop(this._iris);
            jibo.rendering.tween.TweenManager.play(this._iris, {
                to: {
                    'scale.x': this._irisScale,
                    'scale.y': this._irisScale
                },
                duration: duration,
                ease: 'backIn'
            });
            jibo.rendering.tween.TweenManager.stop(this._lensRing);
            jibo.rendering.tween.TweenManager.play(this._lensRing, {
                to: {
                    rotation: 0
                },
                duration: duration,
                ease: 'backIn'
            });
        }
    }
    showCorners(callback) {
        this.setLight('green');
        this._corners.visible = true;
        this._corners.alpha = 0;
        const cornerDuration = 300;
        jibo.rendering.tween.TweenManager.play(this._corners, {
            to: {
                'scale.x': 1,
                'scale.y': 1,
            },
            from: {
                'scale.x': 1.2,
                'scale.y': 1.2,
            },
            duration: cornerDuration,
            ease: 'backOut'
        });
        jibo.rendering.tween.TweenManager.play(this._corners, {
            to: {
                'alpha': 1,
            },
            duration: cornerDuration,
            ease: 'sineOut'
        }, callback);
    }
    hideCorners(callback) {
        if (this._corners.visible) {
            let cornerDuration = 300;
            jibo.rendering.tween.TweenManager.play(this._corners, {
                to: {
                    'scale.x': 1.2,
                    'scale.y': 1.2,
                },
                duration: cornerDuration,
                ease: 'backIn'
            }, () => {
                this._corners.visible = false;
            });
            jibo.rendering.tween.TweenManager.play(this._corners, {
                to: {
                    'alpha': 0,
                },
                duration: cornerDuration,
                ease: 'sineOut'
            }, callback);
        }
        else if (callback) {
            callback();
        }
    }
    setLight(color) {
        if (this._light) {
            switch (color) {
                case 'red': { }
                case 'green': { }
                case 'black': {
                    this._light.gotoAndStop(color);
                    break;
                }
                default: {
                    this._light.gotoAndStop('black');
                }
            }
        }
    }
    startLensSearch() {
        const lapse = 500 + Math.random() * 400;
        if (this._timer) {
            this._timer.destroy();
        }
        this._timer = jibo.timer.setTimeout(this.lensSearch, lapse);
    }
    lensSearch() {
        if (this._lensZoomed) {
            let centerX = jibo.face.width * .5;
            let centerY = jibo.face.height * .5;
            let seed = Math.sqrt(Math.random());
            let radians = 2 * Math.PI * Math.random();
            let targetX = centerX + seed * CameraView.MAX_RADIUS_X * Math.cos(radians);
            let targetY = centerY + seed * CameraView.MAX_RADIUS_Y * Math.sin(radians);
            let moveDistance = Math.abs(this.getDistance(this._lens.x, this._lens.y, targetX, targetY));
            let centerDistance = Math.abs(this.getDistance(centerX, centerY, targetX, targetY));
            let duration = CameraView.MIN_DURATION + CameraView.MAX_DURATION * (moveDistance / (CameraView.MAX_RADIUS_X * 2));
            let distanceDelta = centerDistance / CameraView.MAX_RADIUS_X;
            let lensScale = this._lensScale * (CameraView.MAX_LENS_SCALE - distanceDelta * .2);
            let irisScale = this._irisScale * (CameraView.MAX_IRIS_SCALE - distanceDelta * .4);
            let rotationDelta = lensScale - this._lens.scale.x;
            let rotation = rotationDelta * CameraView.MAX_ROTATION;
            jibo.rendering.tween.TweenManager.stop(this._lens);
            jibo.rendering.tween.TweenManager.play(this._lens, {
                to: {
                    'scale.x': lensScale,
                    'scale.y': lensScale,
                    x: targetX,
                    y: targetY
                },
                duration: duration,
                ease: 'backInOut'
            }, this.startLensSearch);
            jibo.rendering.tween.TweenManager.stop(this._body);
            jibo.rendering.tween.TweenManager.play(this._body, {
                to: {
                    x: targetX,
                    y: targetY
                },
                duration: duration,
                ease: 'backInOut'
            });
            jibo.rendering.tween.TweenManager.stop(this._iris);
            jibo.rendering.tween.TweenManager.play(this._iris, {
                to: {
                    'scale.x': irisScale,
                    'scale.y': irisScale
                },
                duration: duration,
                ease: 'backInOut'
            });
            jibo.rendering.tween.TweenManager.stop(this._lensRing);
            jibo.rendering.tween.TweenManager.play(this._lensRing, {
                to: {
                    rotation: rotation
                },
                duration: duration,
                ease: 'backInOut'
            });
        }
    }
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
}
CameraView.log = null;
CameraView.MAX_RADIUS_X = 120;
CameraView.MAX_RADIUS_Y = 60;
CameraView.MIN_DURATION = 200;
CameraView.MAX_DURATION = 1200;
CameraView.MAX_ROTATION = Math.PI / 2;
CameraView.MAX_LENS_SCALE = 1.4;
CameraView.MAX_IRIS_SCALE = 1.6;
exports.default = CameraView;

},{"jibo":undefined}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class FlashView extends jibo.rendering.gui.views.View {
    constructor() {
        super();
        this._type = FlashView.DEFAULT_TYPE;
        this.id = 'flashView';
        this.transitionStageOnly = true;
        this.closeOnSwipeDown = false;
        this._category = jibo.face.views.CATEGORY_DISPLAY;
    }
    static get DEFAULT_TYPE() { return 'FlashView'; }
    flashWhite(done) {
        jibo.rendering.tween.TweenManager.play(this._whiteClip.display, {
            to: { alpha: 0 },
            duration: 500,
            ease: 'sineOut'
        }, () => {
            if (done) {
                done();
            }
        });
    }
    startLoader() {
        this._loaderClip.movieClip.play();
    }
    applyData() {
        this._loaderClip = new jibo.rendering.gui.components.Clip();
        this._loaderClip.addAssetDescriptorObject({
            id: 'loader',
            type: 'timeline',
            src: 'core://resources/buttons/loader.js'
        });
        this._loaderClip.setTargetPosition(jibo.face.width / 2, jibo.face.height / 2);
        super.addComponent(this._loaderClip, 'loader');
        super.applyData();
    }
    ready() {
        this.addWhite();
        this._loaderClip.movieClip.stop();
        super.ready();
    }
    addWhite() {
        let graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF);
        graphics.drawRect(0, 0, jibo.face.width, jibo.face.height);
        graphics.endFill();
        this._whiteClip = super.addComponent(jibo.rendering.gui.components.Clip.createFromDisplayObject(graphics, this.stage), 'whiteClip');
    }
}
FlashView.log = null;
exports.default = FlashView;

},{"jibo":undefined}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class PhotoView extends jibo.rendering.gui.views.View {
    constructor() {
        super();
        this._type = PhotoView.DEFAULT_TYPE;
        this.id = 'photoView';
        this.transitionStageOnly = true;
        this.closeOnSwipeDown = false;
        this._category = jibo.face.views.CATEGORY_DISPLAY;
    }
    static get DEFAULT_TYPE() { return 'PhotoView'; }
    applyData() {
        this.addAssetDescriptorObject({
            id: 'save-sfx',
            type: 'sound',
            src: 'audio/save.m4a'
        });
        this.addAssetDescriptorObject({
            id: 'delete-sfx',
            type: 'sound',
            src: 'audio/delete.m4a'
        });
        this._choiceBtn = new jibo.rendering.gui.components.MenuButton();
        this._choiceBtn.addAssetDescriptorObject({
            id: 'ok',
            type: 'texture',
            src: 'core://resources/actionIcons/ok.png',
            cache: 'global-gui'
        });
        this._choiceBtn.addAssetDescriptorObject({
            id: 'delete',
            type: 'texture',
            src: 'core://resources/actionIcons/delete.png',
            cache: 'global-gui'
        });
        this._choiceBtn.interactable = false;
        this._choiceBtn.applyButtonType(jibo.rendering.gui.components.MenuButton.ACTION);
        this.addComponent(this._choiceBtn, 'choiceBtn');
        super.applyData();
    }
    ready() {
        this._choiceBtn.display.visible = false;
        super.ready();
    }
    addPhoto(photoSrc) {
        let image = new Image();
        image.src = photoSrc;
        let bt = new PIXI.BaseTexture(image);
        let tex = new PIXI.Texture(bt);
        let sprite = new PIXI.Sprite(tex);
        if (!this._photoClip) {
            jibo.rendering.gui.components.Clip.createFromDisplayObject(sprite);
            this.stage.addChildAt(sprite, 0);
        }
        else {
            this._photoClip.display.removeChildren();
            this._photoClip.display.addChild(sprite);
        }
    }
    addPhotoToLoad(url) {
        this.addAssetDescriptorObject({
            id: 'photoImage',
            type: 'texture',
            src: url
        });
    }
    displayPhoto() {
        let sprite = new PIXI.Sprite(this.assets['photoImage']);
        if (!this._photoClip) {
            jibo.rendering.gui.components.Clip.createFromDisplayObject(sprite);
            this.stage.addChildAt(sprite, 0);
        }
        else {
            this._photoClip.display.removeChildren();
            this._photoClip.display.addChild(sprite);
        }
    }
    showChoice(save, done) {
        let action = new jibo.rendering.gui.actions.ActionData('sound', { id: '' });
        if (save) {
            this._choiceBtn.setIcon(new PIXI.Sprite(this.assets['ok']));
            this._choiceBtn.colors = 'confirm';
            action.data.id = 'save-sfx';
        }
        else {
            this._choiceBtn.setIcon(new PIXI.Sprite(this.assets['delete']));
            this._choiceBtn.colors = 'cancel';
            action.data.id = 'delete-sfx';
        }
        let choiceDisplay = this._choiceBtn.display;
        let btnDisplay = this._choiceBtn.buttonDisplay;
        this._choiceBtn.setTargetPosition(jibo.face.width / 2 - choiceDisplay.width / 2, jibo.face.height / 2 - choiceDisplay.height / 2, true);
        choiceDisplay.visible = true;
        this.stage.setChildIndex(choiceDisplay, this.stage.children.length - 1);
        this._inputLocked = false;
        super.actionHandler(action);
        this._inputLocked = true;
        jibo.rendering.tween.TweenManager.play(btnDisplay, {
            to: {
                'scale.x': 1,
                'scale.y': 1
            },
            from: {
                'scale.x': 0,
                'scale.y': 0
            },
            duration: 750,
            ease: 'backOut'
        }, () => {
            if (done) {
                done();
            }
        });
        jibo.rendering.tween.TweenManager.play(btnDisplay, {
            to: { alpha: 1 },
            from: { alpha: 0 },
            duration: 500,
            ease: 'sineIn'
        });
    }
}
PhotoView.log = null;
exports.default = PhotoView;

},{"jibo":undefined}]},{},[14])(14)
});
//# sourceMappingURL=index.js.map