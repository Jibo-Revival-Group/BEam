(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.beradio = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const TouchyTimeout_1 = require("./utils/TouchyTimeout");
const FREEZE_MOTION_TIME = 3000;
class DanceController {
    constructor() {
        this.startDancing = (isCommand) => {
            if (isCommand === true) {
                this._clearTimeout();
                this._dontDance = false;
            }
            else if (this._dontDance) {
                return Promise.resolve();
            }
            let danceList = isCommand ? this._reactiveDances : this._proactiveDances;
            let lastDance = isCommand ? this._lastReactiveDance : this._lastProactiveDance;
            let loops = isCommand ? this._reactiveLoops : this._proactiveLoops;
            return this.stopDancing()
                .then(() => {
                let dance;
                if (danceList.length === 0) {
                    return;
                }
                else if (danceList.length === 1) {
                    dance = danceList[0];
                }
                else {
                    let i = lastDance;
                    while (i === lastDance) {
                        i = Math.floor(Math.random() * danceList.length);
                    }
                    if (isCommand) {
                        this._lastReactiveDance = i;
                    }
                    else {
                        this._lastProactiveDance = i;
                    }
                    dance = danceList[i];
                }
                jibo.expression.setAttentionMode(jibo.expression.AttentionMode.OFF)
                    .then(() => {
                    if (!this._freezeMotionTimeout) {
                        this._currentDance = dance.play({
                            loops,
                            cache: jibo.loader.activeCache,
                            dofs: jibo.expression.dofs.BODY
                        });
                        return this._currentDance.result;
                    }
                })
                    .then((status) => {
                    if (!this._freezeMotionTimeout) {
                        return jibo.expression.cleanup({ dofs: jibo.expression.dofs.BODY });
                    }
                })
                    .catch(() => { })
                    .then(() => {
                    jibo.expression.setAttentionMode(jibo.expression.AttentionMode.ENGAGED);
                });
            });
        };
        this.stopDancing = (reason) => {
            if (reason === 'voice') {
                this._dontDance = true;
            }
            else if (!this._freezeMotionTimeout && reason === 'touch') {
                this._freezeMotionTimeout = new TouchyTimeout_1.default(this._clearTimeout, FREEZE_MOTION_TIME);
            }
            if (this._currentDance) {
                let danceRef = this._currentDance;
                this._currentDance = null;
                return danceRef.playback.stop();
            }
            else {
                return Promise.resolve();
            }
        };
        this._clearTimeout = () => {
            if (this._freezeMotionTimeout) {
                this._freezeMotionTimeout.destroy();
                this._freezeMotionTimeout = null;
            }
        };
    }
    setDance(danceMeta) {
        this._lastProactiveDance = null;
        this._lastReactiveDance = null;
        this._reactiveLoops = danceMeta.reactiveDance.loops;
        this._proactiveLoops = danceMeta.proactiveDance.loops;
        this._reactiveDances = jibo.animDB.query(danceMeta.reactiveDance.query).matching;
        this._proactiveDances = jibo.animDB.query(danceMeta.proactiveDance.query).matching;
    }
    stopAndDestroy() {
        return this.stopDancing().then(this.destroy.bind(this));
    }
    destroy() {
        this._reactiveDances = null;
        this._proactiveDances = null;
        this._currentDance = null;
        this._clearTimeout();
    }
}
exports.default = DanceController;

},{"./utils/TouchyTimeout":8,"jibo":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const jibo = require("jibo");
const jibo_radio_1 = require("jibo-radio");
const OUR_RULE = 'radio/run_control';
class LocalGlobal extends events_1.EventEmitter {
    constructor(assetPack) {
        super();
        this.VOLUME = 'volumeQuery';
        this.DANCE = 'startDancing';
        this.STOP_DANCING = 'stopDancing';
        this.STATIONS = 'stations';
        this.CURRENT_GENRE = 'currentGenre';
        this.CURRENT_TRACK = 'currentTrack';
        this.LOCAL = jibo_radio_1.Locality.Local;
        this.NATIONAL = jibo_radio_1.Locality.National;
        this._nowListening = false;
        this._shouldRelisten = true;
        this._cloudHandler = (data) => {
            const eventName = this._parseListenResults(data);
            if (eventName) {
                this.emit(eventName, eventName);
                jibo.globalEvents.shared.nonInterruptingGlobal.emit();
            }
            this._destroyListener();
            if (this.persistent) {
                this.startListening();
            }
        };
    }
    get persistent() {
        return this._shouldRelisten;
    }
    set persistent(flag) {
        this._shouldRelisten = flag;
    }
    init() {
        return Promise.resolve();
    }
    startListening() {
        if (!this._nowListening) {
            jibo.globalEvents.shared.hjOnly.on(this._cloudHandler);
            this._listener = jibo.jetstream.setHotwordMode(jibo.jetstream.types.HotwordListenMode.Custom_NLU_Added, [OUR_RULE]);
            this._listener.match.on(this._cloudHandler);
            this._nowListening = true;
        }
    }
    stopListening() {
        this._destroyListener();
    }
    destroy() {
        this._shouldRelisten = false;
        this.removeAllListeners();
        this.stopListening();
    }
    _destroyListener() {
        jibo.globalEvents.shared.hjOnly.off(this._cloudHandler);
        if (this._listener) {
            this._listener.match.off(this._cloudHandler);
            this._listener.release();
            this._listener = null;
        }
        this._nowListening = false;
    }
    _parseListenResults(data) {
        let eventName = '';
        if (!data || !data.result || !data.result.nlu) {
            return eventName;
        }
        switch (data.result.nlu.intent) {
            case 'start_dancing':
                eventName = this.DANCE;
                break;
            case 'stop_dancing':
                eventName = this.STOP_DANCING;
                break;
            case 'get_volume':
                eventName = this.VOLUME;
                break;
            case 'stations':
                eventName = this.STATIONS;
                break;
            case 'get_genre':
                eventName = this.CURRENT_GENRE;
                break;
            case 'get_track':
                eventName = this.CURRENT_TRACK;
                break;
            case 'local':
                eventName = this.LOCAL;
                break;
            case 'national':
                eventName = this.NATIONAL;
                break;
            default:
                break;
        }
        return eventName;
    }
}
exports.default = LocalGlobal;

},{"events":undefined,"jibo":undefined,"jibo-radio":undefined}],3:[function(require,module,exports){
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
const Analytics_1 = require("./analytics/Analytics");
const be_framework_1 = require("@be/be-framework");
const jibo = require("jibo");
const DanceController_1 = require("./DanceController");
const LocalGlobal_1 = require("./LocalGlobal");
const jibo_radio_1 = require("jibo-radio");
var PromiseUtils = be_framework_1.libraries.jibo_cai_utils.PromiseUtils;
const VolumeView_1 = require("./VolumeView");
var CancelTokenSession = be_framework_1.libraries.jibo_cai_utils.CancelTokenSession;
const TouchyTimeout_1 = require("./utils/TouchyTimeout");
const promisify = PromiseUtils.promisify;
const ALBUM_SIZE = 410;
const LONG_FIELD_SUFFIX = '...';
const MAX_FIELD_CHAR_LENGTH = 50;
const OVERLAY_TIME = 8000;
const VOLUME_CHANGED_TIME = 2000;
const BUTTON_FADE_TIMEOUT = 5000;
const BUTTON_TWEEN_IN_TIME = 250;
const BUTTON_TWEEN_OUT_TIME = 1000;
const GET_COUNTRY_TIMEOUT = 4000;
const ALBUM_ART_ID = 'albumArt';
const STATION_LOGO_ID = 'stationLogo';
const OVERLAY_OPTIONS = { alpha: 0.8 };
const SHOW_VOLUME = { addView: 'assets/volume/volumeView.json', pause: OVERLAY_OPTIONS };
const IS_SPEAKING = true;
const IS_NOT_SPEAKING = false;
class Radio extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this._onScreenTouch = (e) => {
            if (e.y === 358) {
                this.log.warn('BAD TOUCH: y === 358');
                return;
            }
            if (this._danceController) {
                this._danceController.stopDancing('touch');
            }
            this._showButtons();
        };
        this._hideButtons = () => {
            this._buttonFadeTimeout.destroy();
            this._buttonFadeTimeout = null;
            if (this._playerView) {
                jibo.face.tween.playSet([
                    this._volumeLabel.display,
                    this._stationsLabel.display,
                    this._stationsButton.display,
                    this._volumeButton.display,
                    this._logo.display
                ], { to: { alpha: 0 }, duration: BUTTON_TWEEN_OUT_TIME });
            }
        };
        this._onVolumeUtterance = () => {
            if (jibo.face.views.currentView) {
                if (jibo.face.views.currentView.id === 'radioPlayer') {
                    this._showVolumePanel();
                }
                else if (jibo.face.views.currentView.id === 'silentGenreChooser' && !jibo.face.views.viewsInProcess) {
                    jibo.face.views.changeView({ remove: true }, this._showVolumePanel);
                }
            }
        };
        this._onStationUtterance = () => {
            if (jibo.face.views.currentView) {
                if (jibo.face.views.currentView.id === 'radioPlayer') {
                    this._showStationList();
                }
                else if (jibo.face.views.currentView.id === 'radioVolumePanel' && !jibo.face.views.viewsInProcess) {
                    jibo.face.views.changeView({ remove: true }, this._showStationList);
                }
            }
        };
        this._onGenreUtterance = () => {
            if (!this._blackboard.station) {
                this.log.warn('No station is currently being played');
                return;
            }
            this._radioPlayer.setCurrentlySpeaking(IS_SPEAKING);
            if (this.currentlyPlayingHandler) {
                this._blackboard.currentlyPlayingEvent = 'genre';
                this.currentlyPlayingHandler();
            }
            else {
                this.log.error('Unhandled utterance: currentGenre');
            }
        };
        this._onTrackUtterance = () => {
            if (!this._blackboard.station) {
                this.log.warn('No station is currently being played');
                return;
            }
            this._radioPlayer.setCurrentlySpeaking(IS_SPEAKING);
            if (this.currentlyPlayingHandler) {
                let response = { song: null, artist: null };
                if (this._currentSongData && this._currentSongData.mediaType === jibo_radio_1.MediaType.Music) {
                    response.song = this._currentSongData.title;
                    response.artist = this._currentSongData.artist;
                }
                this._blackboard.currentSong = response.song;
                this._blackboard.currentArtist = response.artist;
                this._blackboard.currentlyPlayingEvent = 'track';
                this.currentlyPlayingHandler();
            }
            else {
                this.log.error('Unhandled utterance: currentTrack');
            }
        };
        this._showStationList = () => {
            if (jibo.face.views.viewsInProcess) {
                return;
            }
            this._clearTimeout();
            jibo.face.views.changeView({ addView: `assets/genreMenus/${this._countryCode}/playerMenu.json`, pause: OVERLAY_OPTIONS }, null, null, (view) => {
                this._startOverlayTimeout(view);
                view.on('pressed', (e) => {
                    const previousGenreName = this._root && this._root.data
                        && this._root.data.lastStation;
                    const previousStationName = this._currentStationData ?
                        this._currentStationData.name : 'No station data found';
                    if (previousGenreName && previousStationName) {
                        this._analyticsData = { previousGenreName, previousStationName };
                        this._analytics.setNextEventName('genreChanged');
                    }
                    this.playStationsForGenre(e.intent);
                    jibo.face.views.changeView({ remove: true });
                });
            });
        };
        this._showVolumePanel = () => {
            if (jibo.face.views.viewsInProcess) {
                return;
            }
            this._clearTimeout();
            jibo.face.views.changeView(SHOW_VOLUME, null, null, (view) => {
                view.once(VolumeView_1.default.VOLUME_CHANGED, () => {
                    this._startOverlayTimeout(null, VOLUME_CHANGED_TIME);
                });
                this._startOverlayTimeout(view);
            });
        };
        this._clearTimeout = () => {
            if (this._timeout) {
                this._timeout.destroy();
                this._timeout = null;
            }
        };
        this._onStationLogoLoaded = (err, result) => {
            if (err || !this._playerView || !this._playerView.assets[STATION_LOGO_ID]) {
                return;
            }
            if (this._loaderAnim.visible) {
                this._loaderAnim.stop();
                this._loaderAnim.visible = false;
            }
            let texture = this._playerView.assets[STATION_LOGO_ID];
            this._logoSprite = new PIXI.Sprite(texture);
            this._artBox.display.addChildAt(this._logoSprite, 2);
        };
        this._onAlbumArtLoaded = (err) => {
            if (err || !this._playerView || !this._playerView.assets[ALBUM_ART_ID]) {
                return;
            }
            if (this._loaderAnim.visible) {
                this._loaderAnim.stop();
                this._loaderAnim.visible = false;
            }
            let texture = this._playerView.assets[ALBUM_ART_ID];
            this._albumSprite = new PIXI.Sprite(texture);
            this._artBox.display.addChild(this._albumSprite);
        };
        this._onSongData = (songData) => {
            this.log.info('song-data', songData);
            this._currentSongData = songData;
            this._updateSong();
            if (this._danceController) {
                if (!songData) {
                    if (this._currentGenre.dontDanceByDefault) {
                        return;
                    }
                    this._danceController.startDancing();
                }
                else if (songData.mediaType === jibo_radio_1.MediaType.Music) {
                    this._danceController.startDancing();
                }
                else {
                    this._danceController.stopDancing();
                }
            }
        };
        this._onStreamError = (err) => {
            if (this.streamErrorHandler) {
                this.log.warn('handling stream error: ', err);
                this.streamErrorHandler();
            }
            else {
                this.log.error('Unhandled stream error: ', err);
            }
        };
        this._cleanupTouchListener = () => {
            document.removeEventListener('mousedown', this._onScreenTouch);
        };
        this.exit = this.exit.bind(this);
        this._analytics = new Analytics_1.default(this);
    }
    preload(done) {
        this._danceController = new DanceController_1.default();
        this._localGlobal = new LocalGlobal_1.default(this.assetPack);
        jibo.face.views.creator.registerClass(VolumeView_1.default, 'VolumeView');
        Promise.all([
            this._localGlobal.init(),
            this._kbm.loadRoot().then((root) => {
                this._root = root;
            }),
            promisify((cb) => {
                jibo.loader.load('./assets/defaultStations.json', cb);
            }).then((preferredStations) => {
                this.log.info('Default stations', preferredStations);
                this._preferredStations = preferredStations;
            }).catch((err) => {
                this.log.warn('preferred stations load failed', err);
                throw err;
            }),
            promisify((cb) => {
                jibo.loader.load('./assets/genres.json', cb);
            }).then((genres) => {
                this._genres = genres;
            }).catch((err) => {
                this.log.warn('genres load failed', err);
                throw err;
            }),
            promisify((cb) => {
                jibo.systemManager.getIdentity(cb);
            }).then((identity) => {
                this._radioPlayer = jibo_radio_1.createRadio()
                    .on('song-data', this._onSongData)
                    .on('error', this._onStreamError);
                const home = jibo.utils.Location.jiboHome;
                return Promise.race([
                    this._radioPlayer.init(identity.serial_number, jibo.versions.release, home.country, home.lat, home.lng, {
                        hjHeard: jibo.jetstream.events.hjHeard,
                        hjOnly: jibo.globalEvents.shared.hjOnly,
                        noGlobalMatch: jibo.globalEvents.shared.noGlobalMatch,
                        nonInterruptingGlobal: jibo.globalEvents.shared.nonInterruptingGlobal
                    }, jibo.volume).then(() => {
                        return this._radioPlayer.getCountry().then((countryCode) => {
                            this._countryCode = countryCode === 'us' ? 'us' : 'ca';
                            this.log.info(`iHeart thinks Jibo is in ${this._countryCode}`);
                        });
                    }),
                    promisify((cb) => setTimeout(cb, GET_COUNTRY_TIMEOUT)),
                ]);
            }).catch((err) => {
                this.log.warn('Error getting identity or country', err);
            }).catch((err) => {
                this.log.warn('Error preloading RadioPlayer', err);
                throw err;
            }),
        ]).then(() => { done(); }).catch(done);
    }
    postInit(done) {
        this._kbm = jibo.kb.createModel('/radio');
        done();
    }
    open(result, refresh, previousSkillName) {
        let intent = 'showStations';
        let launchGenre;
        if (result && result.nlu && result.nlu.intent) {
            this._analyticsData = {};
            this._analyticsData.intent = result.nlu.intent;
            this._analytics.setNextEventName('radioLaunched');
            intent = result.nlu.intent === 'menu' ? 'play' : result.nlu.intent;
            launchGenre = result.nlu.entities.station;
        }
        if (launchGenre === 'NPR' && this._countryCode !== 'us') {
            launchGenre = null;
            intent = 'unsupportedGenre';
        }
        if (refresh) {
            const previousGenreName = this._root
                && this._root.data
                && this._root.data.lastStation;
            const previousStationName = this._currentStationData ?
                this._currentStationData.name : 'No station data found';
            this._analytics.setNextEventName('genreChanged');
            this._analyticsData = { previousGenreName, previousStationName };
            if (intent === 'showStations') {
                this.cleanup().then(() => { this._startFlow(intent, null, true); });
            }
            else if (launchGenre) {
                this.playStationsForGenre(launchGenre);
            }
        }
        else {
            this._localGlobal.startListening();
            this._localGlobal.on(this._localGlobal.DANCE, () => {
                if (this._danceController) {
                    this._analyticsData = {
                        genreName: this._root.data.lastStation,
                        stationName: this._currentStationData ?
                            this._currentStationData.name :
                            'No station data found'
                    };
                    this._analytics.setNextEventName('startDancing');
                    this._trackAnalytics();
                    this._danceController.startDancing(true);
                }
            });
            this._localGlobal.on(this._localGlobal.STOP_DANCING, () => {
                if (this._danceController) {
                    const stationName = this._currentStationData ?
                        this._currentStationData.name : 'No station data found';
                    this._analyticsData = { genreName: this._root.data.lastStation, stationName };
                    this._analytics.setNextEventName('stopDancing');
                    this._trackAnalytics();
                    this._danceController.stopDancing('voice');
                }
            });
            this._localGlobal.on(this._localGlobal.VOLUME, this._onVolumeUtterance);
            this._localGlobal.on(this._localGlobal.STATIONS, this._onStationUtterance);
            this._localGlobal.on(this._localGlobal.CURRENT_GENRE, this._onGenreUtterance);
            this._localGlobal.on(this._localGlobal.CURRENT_TRACK, this._onTrackUtterance);
            this._startFlow(intent, launchGenre, false);
        }
    }
    _startFlow(intent, launchGenre, refresh) {
        this._blackboard = {
            launchIntent: intent,
            station: launchGenre,
            refresh: refresh,
            skill: this,
            log: this.log,
            kbData: this._root.data,
            countryCode: this._countryCode
        };
        let options = {
            assetPack: this.assetPack,
            blackboard: this._blackboard
        };
        this._flow = jibo.flow.run(require('./flows/Main.flow'), options, (err, status) => {
            if (status === jibo.bt.Status.INTERRUPTED) {
                return;
            }
            this.exit();
        });
    }
    playStationsForGenre(genreName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._playerView && !this._loadingView) {
                this._loadingView = true;
                jibo.face.views.changeView({ addView: 'assets/player/playerView.json' }, () => {
                    document.addEventListener('mousedown', this._onScreenTouch);
                    this._buttonFadeTimeout = new TouchyTimeout_1.default(this._hideButtons, BUTTON_FADE_TIMEOUT);
                }, null, (view) => {
                    this._playerView = view;
                    this._loadingView = false;
                    this._stationsButton = this._playerView.getComponentById('stationsButton');
                    this._volumeButton = this._playerView.getComponentById('volumeButton');
                    this._stationsLabel = this._playerView.getComponentById('stationsButton_label');
                    this._volumeLabel = this._playerView.getComponentById('volumeButton_label');
                    this._logo = this._playerView.getComponentById('logo');
                    this._artBox = this._playerView.getComponentById('artBox');
                    this._loaderAnim = this._artBox.display.children[1];
                    this._loaderAnim.x = this._artBox.display.children[0].width / 2;
                    this._loaderAnim.y = this._artBox.display.children[0].height / 2;
                    this._stationField = this._playerView.getComponentById('stationName');
                    this._artistField = this._playerView.getComponentById('artistName');
                    this._titleField = this._playerView.getComponentById('songName');
                    this._clearDisplay();
                    this._updateStation();
                    this._updateSong();
                    this._playerView.on('volume', this._showVolumePanel);
                    this._playerView.on('stations', this._showStationList);
                    this._playerView.once(jibo.face.views.STATE.CLOSED, this.exit);
                    this._playerView.once(jibo.face.views.BACK, this._cleanupTouchListener);
                });
            }
            if (genreName === 'NPR' && this._countryCode !== 'us') {
                genreName = 'NewsAndTalk';
            }
            let newGenre = this._genres[genreName];
            let locality = genreName === 'NPR'
                ? jibo_radio_1.Locality.Local
                : jibo_radio_1.Locality.National;
            if (!newGenre || newGenre === this._currentGenre) {
                this.log.info('Station change to same station; doing nothing');
                return;
            }
            this._blackboard.station = genreName;
            this._root.data.lastStation = genreName;
            this._currentGenre = newGenre;
            this._danceController.setDance(this._currentGenre);
            this._clearDisplay();
            const preferredStation = this._preferredStations[genreName];
            this._currentStations = yield this._radioPlayer.getStations(Object.assign({ genreName,
                locality }, (preferredStation && (genreName !== 'NPR' || locality === jibo_radio_1.Locality.National) ? { preferredStation } : null)));
            if (!this._currentStations.length) {
                locality = locality === jibo_radio_1.Locality.National
                    ? jibo_radio_1.Locality.Local
                    : jibo_radio_1.Locality.National;
                this._currentStations = yield this._radioPlayer.getStations(Object.assign({ genreName,
                    locality }, (preferredStation && (genreName !== 'NPR' || locality === jibo_radio_1.Locality.National) ? { preferredStation } : null)));
            }
            this._currentStationIndex = 0;
            return this.playNextStation();
        });
    }
    playNextStation() {
        return __awaiter(this, void 0, void 0, function* () {
            let playing = false;
            while (!playing) {
                if (this._playPromises) {
                    this._playPromises.cancel();
                }
                if (!this._currentStations.length ||
                    this._currentStationIndex > this._currentStations.length - 1) {
                    throw new Error('There are no stations remaining to play');
                }
                this._currentStationData = this._currentStations[this._currentStationIndex++];
                this._playPromises = new CancelTokenSession();
                try {
                    yield this._playPromises.wrap(this._radioPlayer.play(this._currentStationData.callLetters)
                        .then(() => {
                        this._updateStation();
                        this._currentStationIndex = 0;
                    }));
                    playing = true;
                    if (this._analytics.getNextEventName()) {
                        this._analyticsData.genreName = this._root.data.lastStation;
                        this._analyticsData.stationName = this._currentStationData ?
                            this._currentStationData.name : 'No station data found';
                        this._trackAnalytics();
                    }
                }
                catch (err) {
                    this.log.warn('Error playing station; trying the next one');
                }
            }
        });
    }
    _showButtons() {
        if (this._playerView) {
            if (this._buttonFadeTimeout) {
                this._buttonFadeTimeout.reset();
            }
            else {
                this._buttonFadeTimeout = new TouchyTimeout_1.default(this._hideButtons, BUTTON_FADE_TIMEOUT);
            }
            this._cancelButtonTweens();
            jibo.face.tween.playSet([
                this._volumeLabel.display,
                this._stationsLabel.display,
                this._stationsButton.display,
                this._volumeButton.display,
                this._logo.display
            ], { to: { alpha: 1 }, duration: BUTTON_TWEEN_IN_TIME });
        }
    }
    _cancelButtonTweens() {
        jibo.face.tween.stop(this._volumeLabel.display);
        jibo.face.tween.stop(this._stationsLabel.display);
        jibo.face.tween.stop(this._stationsButton.display);
        jibo.face.tween.stop(this._volumeButton.display);
        jibo.face.tween.stop(this._logo.display);
    }
    currentlyPlayingSpeakingDone() {
        this._radioPlayer.setCurrentlySpeaking(IS_NOT_SPEAKING);
    }
    _startOverlayTimeout(view, time) {
        this._clearTimeout();
        this._timeout = new TouchyTimeout_1.default(() => {
            jibo.face.views.changeView({ remove: true });
        }, time || OVERLAY_TIME);
        if (view) {
            view.once(jibo.face.views.STATE.CLOSED, this._clearTimeout);
        }
    }
    _clearDisplay() {
        if (!this._playerView) {
            return;
        }
        this._loaderAnim.visible = true;
        this._loaderAnim.play();
        this._stationField.text = '';
        this._artistField.text = '';
        this._titleField.text = '';
        this._clearAlbumArt();
        this._clearStationLogo();
    }
    _updateStation() {
        if (!this._playerView || !this._currentStationData) {
            return;
        }
        this._stationField.text = this._currentStationData.name;
        this._clearStationLogo();
        if (this._currentStationData.logoUrl) {
            const logoUrl = this._radioPlayer.resizeArtwork(this._currentStationData.logoUrl, ALBUM_SIZE);
            this._logoAsset = {
                id: STATION_LOGO_ID,
                src: logoUrl,
                type: 'texture'
            };
            this._playerView.addAssets(this._logoAsset, this._onStationLogoLoaded);
        }
    }
    _updateSong() {
        if (!this._playerView || !this._currentSongData) {
            return;
        }
        this._clearAlbumArt();
        if (!this._currentSongData.mediaType
            || this._currentSongData.mediaType === jibo_radio_1.MediaType.Music) {
            this._artistField.text =
                this._currentSongData.artist.length <= MAX_FIELD_CHAR_LENGTH ?
                    this._currentSongData.artist :
                    this._currentSongData.artist.
                        substring(0, MAX_FIELD_CHAR_LENGTH - LONG_FIELD_SUFFIX.length) +
                        LONG_FIELD_SUFFIX;
            this._titleField.text =
                this._currentSongData.title.length <= MAX_FIELD_CHAR_LENGTH ?
                    this._currentSongData.title :
                    this._currentSongData.title.
                        substring(0, MAX_FIELD_CHAR_LENGTH - LONG_FIELD_SUFFIX.length) +
                        LONG_FIELD_SUFFIX;
            if (this._currentSongData.artworkUrl && this._currentSongData.artworkUrl.length) {
                let artworkUrl = this._radioPlayer.resizeArtwork(this._currentSongData.artworkUrl, ALBUM_SIZE);
                this._albumAsset = {
                    id: ALBUM_ART_ID,
                    src: artworkUrl,
                    type: 'texture'
                };
                this._playerView.addAssets(this._albumAsset, this._onAlbumArtLoaded);
            }
        }
        else {
            this._artistField.text = '';
            this._titleField.text = '';
        }
    }
    _clearStationLogo() {
        if (!this._playerView) {
            return;
        }
        if (this._logoSprite) {
            this._artBox.display.removeChild(this._logoSprite);
            this._logoSprite = null;
        }
        if (this._logoAsset) {
            this._playerView.removeAssets(this._logoAsset);
            this._logoAsset = null;
        }
    }
    _clearAlbumArt() {
        if (!this._playerView) {
            return;
        }
        if (this._albumSprite) {
            this._artBox.display.removeChild(this._albumSprite);
            this._albumSprite = null;
        }
        if (this._albumAsset) {
            this._playerView.removeAssets(this._albumAsset);
            this._albumAsset = null;
        }
    }
    _trackAnalytics() {
        this._analytics.trackAnalytics(this._analyticsData);
        this._analyticsData = null;
    }
    cleanupViews(toEye) {
        if (this._playerView) {
            this._cleanupTouchListener();
            this._playerView.removeListener(jibo.face.views.STATE.CLOSED, this.exit);
            this._playerView = null;
        }
        if (this._buttonFadeTimeout) {
            this._buttonFadeTimeout.destroy();
            this._buttonFadeTimeout = null;
        }
        return new Promise((resolve) => {
            if (jibo.face.views.currentView && jibo.face.views.currentView.id !== 'eyeView') {
                jibo.face.views.changeView({
                    removeAll: true,
                    leaveEmpty: !toEye
                }, () => {
                    resolve();
                }, (err) => {
                    this.log.warn('Failed removing view', err);
                    resolve();
                });
            }
            else {
                jibo.face.views.forceEyeView(() => {
                    resolve();
                }, null, null, null, (err) => {
                    this.log.warn('Failed reseting view', err);
                    resolve();
                });
            }
        });
    }
    cleanup() {
        this._currentGenre = null;
        this._currentStations = null;
        this.streamErrorHandler = null;
        if (this._playPromises) {
            this._playPromises.cancel();
            this._playPromises = null;
        }
        if (this._radioPlayer) {
            this._radioPlayer.stop();
        }
        return Promise.all([
            this.cleanupViews(),
            this._flow.stopAndDestroy().then(() => { this._flow = null; }),
            this._danceController ? this._danceController.stopDancing() : Promise.resolve(),
        ]);
    }
    close(done) {
        this._close().then(done, (err) => {
            this.log.error('Error closing skill', err);
            done();
        });
    }
    _close() {
        return __awaiter(this, void 0, void 0, function* () {
            const genreName = this._root && this._root.data && this._root.data.lastStation;
            const stationName = this._currentStationData ?
                this._currentStationData.name : 'No station data found';
            if (genreName && stationName) {
                this._analytics.setNextEventName('playbackStopped');
                this._analyticsData = { genreName, stationName };
                this._trackAnalytics();
            }
            jibo.face.views.creator.unregisterClass('VolumeView');
            this._clearTimeout();
            this._currentGenre = null;
            this._currentStations = null;
            this.streamErrorHandler = null;
            if (this._playPromises) {
                this._playPromises.cancel();
                this._playPromises = null;
            }
            if (this._localGlobal) {
                this._localGlobal.destroy();
                this._localGlobal = null;
            }
            if (this._radioPlayer) {
                try {
                    this._radioPlayer.removeListener('song-data', this._onSongData);
                    this._radioPlayer.removeListener('error', this._onStreamError);
                }
                catch (err) {
                    this.log.warn('Error removing radio-player event listeners', err);
                }
                try {
                    yield this._radioPlayer.stopAndDestroy();
                }
                catch (err) {
                    this.log.warn('Error cleaning up radio player', err);
                }
                this._radioPlayer = null;
            }
            try {
                yield this._flow.stopAndDestroy();
            }
            catch (err) {
                this.log.warn('Error cleaning up flow', err);
            }
            try {
                yield this._danceController.stopAndDestroy();
            }
            catch (err) {
                this.log.warn('Error cleaning up dance controller', err);
            }
            try {
                yield this.cleanupViews();
            }
            catch (err) {
                this.log.warn('Error cleaning up the views', err);
            }
            this._currentSongData = null;
            this._currentStationData = null;
            this._currentStations = null;
            this._loadingView = null;
            this._playerView = null;
            this._preferredStations = null;
            this._stationsButton = null;
            this._volumeButton = null;
            this._stationsLabel = null;
            this._volumeLabel = null;
            this._artBox = null;
            this._loaderAnim = null;
            this._logo = null;
            this._stationField = null;
            this._artistField = null;
            this._titleField = null;
            this._blackboard = null;
            this._danceController = null;
            this._flow = null;
            if (this._root) {
                try {
                    yield promisify(cb => this._root.save(cb));
                }
                catch (err) {
                    this.log.warn('failed to save KB');
                }
                this._root = null;
            }
        });
    }
}
exports.default = Radio;

},{"./DanceController":1,"./LocalGlobal":2,"./VolumeView":4,"./analytics/Analytics":5,"./flows/Main.flow":6,"./utils/TouchyTimeout":8,"@be/be-framework":undefined,"jibo":undefined,"jibo-radio":undefined}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
let View = jibo.rendering.gui.views.View;
const ActionData = jibo.rendering.gui.actions.ActionData;
let MIN_POS = 140;
let SLIDER_WIDTH = 1000;
let VOLUME_CONTROL = 'volumeToValue';
class VolumeView extends View {
    constructor(viewState) {
        super(viewState);
        this.volume = null;
        this.startX = null;
        this.deltaX = 0;
        this.buttonStartX = 0;
        this.isDragging = false;
        this.currentVolume = -1;
        this.buttonDown = this.buttonDown.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onTouchUp = this.onTouchUp.bind(this);
    }
    update(elapsed) {
        if (this.isDragging) {
            let newX = this.buttonStartX - this.deltaX;
            if (newX < MIN_POS) {
                newX = MIN_POS;
            }
            else if (newX > MIN_POS + SLIDER_WIDTH) {
                newX = MIN_POS + SLIDER_WIDTH;
            }
            this.volume.button.x = this.volume.blueBar.x = newX;
            let newVol = jibo.volume.MIN_VOLUME + Math.round((newX - MIN_POS) / (SLIDER_WIDTH / this.numTicks));
            if (newVol != this.currentVolume) {
                this.currentVolume = newVol;
                this.volume.button.value.text = String(newVol);
            }
        }
        else if (jibo.volume.currentVolume !== this.currentVolume) {
            this.updateSlider(jibo.volume.currentVolume);
        }
        super.update(elapsed);
    }
    buttonDown(event) {
        this.startX = event.data.global.x;
        this.buttonStartX = this.volume.button.x;
        this.isDragging = true;
        this.volume.on('mousemove', this.onDrag);
        this.volume.once('mouseup', this.onTouchUp);
    }
    onTouchUp(event) {
        this.volume.off('mousemove', this.onDrag);
        this.volume.button.once('mousedown', this.buttonDown);
        this.isDragging = false;
        this.deltaX = 0;
        jibo.volume.changeVolume(VOLUME_CONTROL, this.currentVolume);
        this.updateSlider(jibo.volume.currentVolume);
        this.emit(VolumeView.VOLUME_CHANGED);
    }
    onDrag(event) {
        this.deltaX = this.startX - event.data.global.x;
    }
    loaded() {
        super.loaded();
        this.numTicks = jibo.volume.MAX_VOLUME - jibo.volume.MIN_VOLUME;
        this.volume = this.getComponentById('volume').movieClip;
        this.volume.interactive = true;
        this.volume.hitArea = new PIXI.Rectangle(0, 0, 1280, 720);
        this.volume.button.interactive = true;
        this.volume.button.once('mousedown', this.buttonDown);
        this.updateSlider(jibo.volume.currentVolume);
    }
    updateSlider(value) {
        if (this.volume) {
            this.currentVolume = value;
            let position = value - jibo.volume.MIN_VOLUME;
            this.volume.button.x = this.volume.blueBar.x = MIN_POS + position / this.numTicks * SLIDER_WIDTH;
            value = Math.round(value);
            this.volume.button.value.text = String(value);
        }
    }
    destroy() {
        this.volume.button.off('mousedown', this.buttonDown);
        this.volume.off('mousemove', this.onDrag);
        this.volume.off('mouseup', this.onTouchUp);
        this.volume = null;
        super.destroy();
    }
}
VolumeView.VOLUME_CHANGED = 'volumeChanged';
exports.default = VolumeView;

},{"jibo":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    constructor(skill) {
        this.skill = skill;
        this._log = skill.log;
    }
    _getSessionTime() {
        if (this._sessionStartTimestamp) {
            return (Date.now() - this._sessionStartTimestamp) / 1000;
        }
        this._log.warn('Session start timestamp is not set yet');
        return 0;
    }
    setNextEventName(eventName) {
        this._nextEventName = eventName;
    }
    getNextEventName() {
        return this._nextEventName;
    }
    trackAnalytics(data) {
        switch (this._nextEventName) {
            case 'radioLaunched':
                this._radioLaunched(data);
                break;
            case 'genreChanged':
                this._genreChanged(data);
                break;
            case 'playbackStopped':
                this._playbackStopped(data);
                break;
            case 'startDancing':
                this._startDancing(data);
                break;
            case 'stopDancing':
                this._stopDancing(data);
                break;
            default:
                this._log.warn('No eventName has been specified for tracking');
        }
        this._nextEventName = '';
    }
    _radioLaunched(data) {
        this._sessionStartTimestamp = Date.now();
        this.skill.track('Radio Launched', { genreName: data.genreName,
            stationName: data.stationName,
            intent: data.intent
        });
        this._log.info('Radio launched event tracked', data);
    }
    _genreChanged(data) {
        data.sessionTime = this._getSessionTime();
        this.skill.track('Radio Genre Changed', { genreName: data.genreName,
            stationName: data.stationName,
            previousGenreName: data.previousGenreName,
            previousStationName: data.previousStationName,
            sessionTime: data.sessionTime
        });
        this._log.info('Genre changed event tracked', data);
    }
    _playbackStopped(data) {
        data.sessionTime = this._getSessionTime();
        this.skill.track('Radio Playback Stopped', { genreName: data.genreName,
            stationName: data.stationName, sessionTime: data.sessionTime
        });
        this._sessionStartTimestamp = null;
        this._log.info('Playback stopped event tracked', data);
    }
    _startDancing(data) {
        data.sessionTime = this._getSessionTime();
        this.skill.track('Radio Start Dancing', { genreName: data.genreName,
            stationName: data.stationName, sessionTime: data.sessionTime
        });
        this._log.info('Start dancing event tracked', data);
    }
    _stopDancing(data) {
        data.sessionTime = this._getSessionTime();
        this.skill.track('Radio Stop Dancing', { genreName: data.genreName,
            stationName: data.stationName, sessionTime: data.sessionTime
        });
        this._log.info('Stop dancing event tracked', data);
    }
}
exports.default = Analytics;

},{}],6:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'Main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/radio/src/flows/Main.flow'
        },
        'a3b66a33-c34e-4972-add1-ef103513b81e': function () {
            return {
                'id': 'a3b66a33-c34e-4972-add1-ef103513b81e',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a3b66a33-c34e-4972-add1-ef103513b81e',
                        'to': '7c41cbb2-e0e0-469c-a944-011c79d150c1',
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
        'c3337b24-a90b-4fc5-b3e9-df39d51e0a62': function () {
            return {
                'id': 'c3337b24-a90b-4fc5-b3e9-df39d51e0a62',
                'name': 'Radio Get Genre',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c3337b24-a90b-4fc5-b3e9-df39d51e0a62',
                        'to': '0da49c52-1058-433e-b255-33de0cb33e55',
                        'value': ''
                    }],
                'exceptions': [{
                        'frm': 'c3337b24-a90b-4fc5-b3e9-df39d51e0a62',
                        'to': '185e2f48-5184-4697-bfae-ff9a0a5190e7',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/RadioGetGenre.mim',
                    'getPromptData': () => {
                        return { entryCondition: blackboard.entryCondition };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = results.firstGrammarTag;
                        blackboard.station = asrResults.intent;
                        return transition;
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
        'c9e7a145-e8b2-46ae-9d6f-9dc683c6c61d': function () {
            return {
                'id': 'c9e7a145-e8b2-46ae-9d6f-9dc683c6c61d',
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
        '7c41cbb2-e0e0-469c-a944-011c79d150c1': function () {
            return {
                'id': '7c41cbb2-e0e0-469c-a944-011c79d150c1',
                'name': 'Intent Router',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '7c41cbb2-e0e0-469c-a944-011c79d150c1',
                        'to': '747d530f-3c85-4c7a-9db5-86fd2d2ac552',
                        'value': 'showStations'
                    },
                    {
                        'frm': '7c41cbb2-e0e0-469c-a944-011c79d150c1',
                        'to': 'b493c24e-ba57-4b7d-b1d6-da56a59fad0f',
                        'value': ''
                    },
                    {
                        'frm': '7c41cbb2-e0e0-469c-a944-011c79d150c1',
                        'to': 'd819fa6b-09a7-4e03-b088-e9e35e93f6a7',
                        'value': 'firstPlay'
                    },
                    {
                        'frm': '7c41cbb2-e0e0-469c-a944-011c79d150c1',
                        'to': '8ba013a5-0902-4758-ad0b-3b96dbe3a9fd',
                        'value': 'playSpecific'
                    },
                    {
                        'frm': '7c41cbb2-e0e0-469c-a944-011c79d150c1',
                        'to': '0da49c52-1058-433e-b255-33de0cb33e55',
                        'value': 'play'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let firstTime = !blackboard.kbData.lastStation;
                        blackboard.entryCondition = blackboard.refresh ? 'fromDetail' : 'stationSelector';
                        let intent = blackboard.launchIntent;
                        if (intent === 'unsupportedGenre') {
                            blackboard.entryCondition = 'wildcardRecovery';
                            intent = 'showStations';
                        } else if (firstTime && !blackboard.station) {
                            blackboard.entryCondition = 'firstTime';
                            intent = 'showStations';
                        } else if (firstTime && blackboard.station) {
                            intent = 'firstPlay';
                        } else if (intent === 'play' && blackboard.station) {
                            intent = 'playSpecific';
                        }
                        if (intent !== 'play') {
                            jibo.face.views.forceEyeView(() => {
                                done(intent);
                            }, null, null, null, () => {
                                done(intent);
                            });
                        } else {
                            done(intent);
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '0da49c52-1058-433e-b255-33de0cb33e55': function () {
            return {
                'id': '0da49c52-1058-433e-b255-33de0cb33e55',
                'name': 'playRadio',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0da49c52-1058-433e-b255-33de0cb33e55',
                        'to': 'c9e7a145-e8b2-46ae-9d6f-9dc683c6c61d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.playStationsForGenre(blackboard.station || blackboard.kbData.lastStation).then(() => {
                            notepad.streamError = false;
                        }).catch(err => {
                            let failed = '~playFailed';
                            blackboard.log.error('Error streaming station', err);
                            blackboard.skill.cleanupViews(true).then(() => {
                                done(failed);
                            }, () => {
                                done(failed);
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '26f28d77-2b6e-4893-9515-42bde42e3b29': function () {
            return {
                'id': '26f28d77-2b6e-4893-9515-42bde42e3b29',
                'name': '~playFailed',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '26f28d77-2b6e-4893-9515-42bde42e3b29',
                        'to': '7d35ee99-0563-40ed-b88c-ff6b839bd551',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        blackboard.log.error('flow caught error', exception, payload);
                        return '';
                    }
                }
            };
        },
        'd819fa6b-09a7-4e03-b088-e9e35e93f6a7': function () {
            return {
                'id': 'd819fa6b-09a7-4e03-b088-e9e35e93f6a7',
                'name': 'Radio First Time Station',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd819fa6b-09a7-4e03-b088-e9e35e93f6a7',
                        'to': '0da49c52-1058-433e-b255-33de0cb33e55',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/RadioFirstTimeStation.mim',
                    'getPromptData': () => {
                        return { radioGenre: blackboard.station };
                    }
                }
            };
        },
        '8ba013a5-0902-4758-ad0b-3b96dbe3a9fd': function () {
            return {
                'id': '8ba013a5-0902-4758-ad0b-3b96dbe3a9fd',
                'name': 'Presenting I Heart',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8ba013a5-0902-4758-ad0b-3b96dbe3a9fd',
                        'to': '0da49c52-1058-433e-b255-33de0cb33e55',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/PresentingIHeart.mim',
                    'getPromptData': () => {
                        return { radioGenre: blackboard.station };
                    }
                }
            };
        },
        'b493c24e-ba57-4b7d-b1d6-da56a59fad0f': function () {
            return {
                'id': 'b493c24e-ba57-4b7d-b1d6-da56a59fad0f',
                'name': 'Radio Down',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b493c24e-ba57-4b7d-b1d6-da56a59fad0f',
                        'to': 'c9e7a145-e8b2-46ae-9d6f-9dc683c6c61d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/RadioDown.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '3e1df81d-0fb6-45da-b511-2d60d4e19b4f': function () {
            return {
                'id': '3e1df81d-0fb6-45da-b511-2d60d4e19b4f',
                'name': 'Radio Crashed',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3e1df81d-0fb6-45da-b511-2d60d4e19b4f',
                        'to': 'd10a9c9b-535e-4dcf-b6e1-25408112966d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/RadioCrashed.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '185e2f48-5184-4697-bfae-ff9a0a5190e7': function () {
            return {
                'id': '185e2f48-5184-4697-bfae-ff9a0a5190e7',
                'name': 'was just playing',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '185e2f48-5184-4697-bfae-ff9a0a5190e7',
                        'to': '0da49c52-1058-433e-b255-33de0cb33e55',
                        'value': 'true'
                    },
                    {
                        'frm': '185e2f48-5184-4697-bfae-ff9a0a5190e7',
                        'to': 'c9e7a145-e8b2-46ae-9d6f-9dc683c6c61d',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return blackboard.refresh;
                    }
                }
            };
        },
        'edf74a06-ab51-4c2c-b291-ad5e54badde7': function () {
            return {
                'id': 'edf74a06-ab51-4c2c-b291-ad5e54badde7',
                'name': 'Radio Failure',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'edf74a06-ab51-4c2c-b291-ad5e54badde7',
                        'to': 'c9e7a145-e8b2-46ae-9d6f-9dc683c6c61d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/RadioFailure.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '7d35ee99-0563-40ed-b88c-ff6b839bd551': function () {
            return {
                'id': '7d35ee99-0563-40ed-b88c-ff6b839bd551',
                'name': 'from streamError?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '7d35ee99-0563-40ed-b88c-ff6b839bd551',
                        'to': 'b493c24e-ba57-4b7d-b1d6-da56a59fad0f',
                        'value': ''
                    },
                    {
                        'frm': '7d35ee99-0563-40ed-b88c-ff6b839bd551',
                        'to': 'edf74a06-ab51-4c2c-b291-ad5e54badde7',
                        'value': 'true'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return notepad.streamError;
                    }
                }
            };
        },
        '545aaaf7-62df-4ae8-a834-f57d1d02ffff': function () {
            return {
                'id': '545aaaf7-62df-4ae8-a834-f57d1d02ffff',
                'name': '~streamError',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '545aaaf7-62df-4ae8-a834-f57d1d02ffff',
                        'to': '3e3f3035-398b-44e1-95de-bcbe1ed46e90',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        blackboard.log.error('flow caught error', exception, payload);
                        return '';
                    }
                }
            };
        },
        '350d9adc-50a4-4a7a-a8e6-b01701844d2a': {
            'id': '350d9adc-50a4-4a7a-a8e6-b01701844d2a',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '350d9adc-50a4-4a7a-a8e6-b01701844d2a',
                    'to': '86b940f3-1a12-455b-b4c3-46d7017e88bc',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '86b940f3-1a12-455b-b4c3-46d7017e88bc': function () {
            return {
                'id': '86b940f3-1a12-455b-b4c3-46d7017e88bc',
                'name': 'error handler',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '86b940f3-1a12-455b-b4c3-46d7017e88bc',
                        'to': 'a035a006-9158-4033-aa31-b764951db1e3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.streamErrorHandler = () => {
                            blackboard.skill.streamErrorHandler = null;
                            done();
                        };
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'a035a006-9158-4033-aa31-b764951db1e3': function () {
            return {
                'id': 'a035a006-9158-4033-aa31-b764951db1e3',
                'name': '~streamError',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a035a006-9158-4033-aa31-b764951db1e3',
                        'to': '86b940f3-1a12-455b-b4c3-46d7017e88bc',
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
        '3e3f3035-398b-44e1-95de-bcbe1ed46e90': function () {
            return {
                'id': '3e3f3035-398b-44e1-95de-bcbe1ed46e90',
                'name': 'set streamError',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3e3f3035-398b-44e1-95de-bcbe1ed46e90',
                        'to': '3e1df81d-0fb6-45da-b511-2d60d4e19b4f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.streamError = true;
                    }
                }
            };
        },
        'd10a9c9b-535e-4dcf-b6e1-25408112966d': function () {
            return {
                'id': 'd10a9c9b-535e-4dcf-b6e1-25408112966d',
                'name': 'nextStation',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd10a9c9b-535e-4dcf-b6e1-25408112966d',
                        'to': 'c9e7a145-e8b2-46ae-9d6f-9dc683c6c61d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.playNextStation().then(() => {
                            notepad.streamError = false;
                        }).catch(err => {
                            let failed = '~playFailed';
                            blackboard.log.error('Error streaming station', err);
                            blackboard.skill.cleanupViews(true).then(() => {
                                done(failed);
                            }, () => {
                                done(failed);
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '747d530f-3c85-4c7a-9db5-86fd2d2ac552': function () {
            return {
                'id': '747d530f-3c85-4c7a-9db5-86fd2d2ac552',
                'name': 'Country Code',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '747d530f-3c85-4c7a-9db5-86fd2d2ac552',
                        'to': 'c3337b24-a90b-4fc5-b3e9-df39d51e0a62',
                        'value': 'us'
                    },
                    {
                        'frm': '747d530f-3c85-4c7a-9db5-86fd2d2ac552',
                        'to': '3c1803ba-83c7-4338-b43d-4699ea24d6fb',
                        'value': 'ca'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return blackboard.countryCode;
                    }
                }
            };
        },
        'f8e2ce79-8e18-4283-b4b3-f1a845759918': function () {
            return {
                'id': 'f8e2ce79-8e18-4283-b4b3-f1a845759918',
                'name': 'currentlyPlaying handler',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'f8e2ce79-8e18-4283-b4b3-f1a845759918',
                        'to': 'cb218318-d2c9-4b64-aede-d0128582ca3f',
                        'value': 'track'
                    },
                    {
                        'frm': 'f8e2ce79-8e18-4283-b4b3-f1a845759918',
                        'to': 'ce5fe482-98ab-49f6-a88f-81ec1d5be48c',
                        'value': 'genre'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (!notepad.currentlyPlayingHasInit) {
                            notepad.currentlyPlayingHasInit = true;
                        } else {
                            blackboard.skill.currentlyPlayingSpeakingDone();
                        }
                        notepad.skipCurrentStation = false;
                        blackboard.skill.currentlyPlayingHandler = () => {
                            result = blackboard.currentlyPlayingEvent;
                            blackboard.currentlyPlayingEvent = null;
                            done(result);
                        };
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '5300456a-9b56-41bc-ad9e-19f6fe6a00fb': {
            'id': '5300456a-9b56-41bc-ad9e-19f6fe6a00fb',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '5300456a-9b56-41bc-ad9e-19f6fe6a00fb',
                    'to': 'f8e2ce79-8e18-4283-b4b3-f1a845759918',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        'cb218318-d2c9-4b64-aede-d0128582ca3f': function () {
            return {
                'id': 'cb218318-d2c9-4b64-aede-d0128582ca3f',
                'name': 'Current Track',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'cb218318-d2c9-4b64-aede-d0128582ca3f',
                        'to': 'ce5fe482-98ab-49f6-a88f-81ec1d5be48c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CurrentTrack.mim',
                    'getPromptData': () => {
                        notepad.skipCurrentStation = false;
                        if (blackboard.currentArtist || blackboard.currentSong) {
                            notepad.skipCurrentStation = true;
                        }
                        return {
                            artist: blackboard.currentArtist,
                            song: blackboard.currentSong
                        };
                    }
                }
            };
        },
        'ce5fe482-98ab-49f6-a88f-81ec1d5be48c': function () {
            return {
                'id': 'ce5fe482-98ab-49f6-a88f-81ec1d5be48c',
                'name': 'Current Station',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ce5fe482-98ab-49f6-a88f-81ec1d5be48c',
                        'to': 'f8e2ce79-8e18-4283-b4b3-f1a845759918',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CurrentStation.mim',
                    'getPromptData': () => {
                        notepad.radioGenre = blackboard.station;
                        if (notepad.skipCurrentStation) {
                            notepad.radioGenre = null;
                            notepad.skipCurrentStation = false;
                        }
                        blackboard.log.info('genre is ', notepad.radioGenre);
                        return { radioGenre: notepad.radioGenre };
                    }
                }
            };
        },
        '3c1803ba-83c7-4338-b43d-4699ea24d6fb': function () {
            return {
                'id': '3c1803ba-83c7-4338-b43d-4699ea24d6fb',
                'name': 'Radio Get Genre CA',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3c1803ba-83c7-4338-b43d-4699ea24d6fb',
                        'to': '0da49c52-1058-433e-b255-33de0cb33e55',
                        'value': ''
                    }],
                'exceptions': [{
                        'frm': '3c1803ba-83c7-4338-b43d-4699ea24d6fb',
                        'to': '185e2f48-5184-4697-bfae-ff9a0a5190e7',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/RadioGetGenreCA.mim',
                    'getPromptData': () => {
                        return { entryCondition: blackboard.entryCondition };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = results.firstGrammarTag;
                        blackboard.station = asrResults.intent;
                        return transition;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        }
    };
};
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Radio_1 = require("./Radio");
module.exports = Radio_1.default;

},{"./Radio":3}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class TouchyTimeout {
    constructor(callback, time) {
        this.delayedCall = jibo.timer.setTimeout(() => {
            this.destroy();
            callback();
        }, time, false, false);
        this._reset = this.reset.bind(this);
        document.addEventListener('mousedown', this._reset);
        document.addEventListener('mouseup', this._reset);
        document.addEventListener('mousemove', this._reset);
    }
    reset(e) {
        if (e && e.y === 358) {
            return;
        }
        this.delayedCall.restart();
    }
    destroy() {
        if (this._reset) {
            document.removeEventListener('mousedown', this._reset);
            document.removeEventListener('mouseup', this._reset);
            document.removeEventListener('mousemove', this._reset);
            this._reset = null;
        }
        if (this.delayedCall) {
            this.delayedCall.destroy();
            this.delayedCall = null;
        }
    }
}
exports.default = TouchyTimeout;

},{"jibo":undefined}]},{},[7])(7)
});
//# sourceMappingURL=index.js.map