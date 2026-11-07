(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.befriendlyTips = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let HJ = "Hey Jibo";
class CardData {
    constructor(data, seen, category) {
        this.id = data.id;
        this._text = data.text;
        this.speech = data.speech || data.text;
        this.featured = !!data.featured;
        this.seen = seen;
        this._background = category.background;
        this.categoryName = category.name;
        this.categoryId = category.id;
        this.rootNode = category.rootNode;
        this.log = category.log;
        this._skill = category.skill;
    }
    get text() {
        return `${HJ}, ${this._text}`;
    }
    get background() {
        return `assets/backgrounds/${this._background}`;
    }
    markSeen(done) {
        if (this._skill && this._skill.cardsShown !== null) {
            this._skill.cardsShown++;
            this._skill.analytics.cardShown(this._text);
        }
        this.seen = true;
        this.rootNode.data.seen[this.categoryId][this.id] = Date.now();
        this.rootNode.save((err) => {
            if (err && this.log) {
                this.log.warn('failed to save card seen data: ', err);
            }
            if (done) {
                done();
            }
        });
    }
    destroy() {
        this.id = null;
        this._text = null;
        this.speech = null;
        this.featured = null;
        this.seen = null;
        this._background = null;
        this.categoryName = null;
        this.categoryId = null;
        this.rootNode = null;
        this.log = null;
        this._skill = null;
    }
}
exports.default = CardData;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const TAP_EVENT = 'press';
class CardDisplay {
    constructor(log, cardSelector) {
        this._isSpeaking = false;
        this.log = log.createChild('FriendlyTipsClass');
        this._cardSelector = cardSelector;
        this._resetTimeout = this._resetTimeout.bind(this);
        this._pauseTimeout = this._pauseTimeout.bind(this);
        this._onViewClosed = this._onViewClosed.bind(this);
        this._onCardSeen = this._onCardSeen.bind(this);
        this._onCardTapped = this._onCardTapped.bind(this);
    }
    showCardMenu(done) {
        this._onDone = done;
        this._cards = this._cardSelector.cards;
        this.log.info('showCardMenu');
        jibo.loader.load('assets/views/cardMenuView.json', (err, viewJSON) => {
            const viewConfig = this._createConfigFromCards(viewJSON);
            const onComplete = (view) => {
                this._startTimeout();
                jibo.jetstream.events.hjHeard.on(this._pauseTimeout);
                jibo.jetstream.events.globalTurnResult.on(this._resetTimeout);
                document.addEventListener('mousedown', this._resetTimeout);
                document.addEventListener('mousemove', this._resetTimeout);
                document.addEventListener('mouseup', this._resetTimeout);
                this._onCardSeen();
            };
            const onFailure = (err) => {
                this._cleanup();
                done('~viewFailed');
            };
            const onLoaded = (view) => {
                this._view = view;
                this._view.on(jibo.face.views.CLOSED, this._onViewClosed);
                this._view.on(jibo.face.views.List.PAGED, this._onCardSeen);
                this._view.on(TAP_EVENT, this._onCardTapped);
            };
            jibo.face.views.changeView({ addView: viewConfig }, onComplete, onFailure, onLoaded);
        });
    }
    _createConfigFromCards(viewJSON) {
        const dimensions = viewJSON.viewConfig.elementDimensions;
        const WIDTH_MARGIN = 30;
        const HEIGHT_MARGIN = 64;
        const INNER_WIDTH = dimensions.width - WIDTH_MARGIN * 2;
        const INNER_HEIGHT = dimensions.height - HEIGHT_MARGIN * 2;
        viewJSON.componentConfigs[0].componentConfigs = this._cards.map((card) => {
            return {
                type: 'ElementGroup',
                id: card.categoryId,
                label: card.categoryName,
                componentConfigs: [
                    {
                        type: 'Button',
                        assets: [
                            {
                                id: card.id,
                                type: 'texture',
                                src: card.background
                            }
                        ],
                        action: {
                            type: "event",
                            data: {
                                event: TAP_EVENT,
                                speech: card.speech
                            }
                        }
                    },
                    {
                        type: 'Label',
                        text: card.text,
                        style: {
                            fontSize: 120,
                            fontFamily: 'Proxima Nova Soft',
                            fontWeight: 'Normal',
                            fill: '#FFFFFF',
                            align: 'center',
                            wordWrap: true,
                            wordWrapWidth: INNER_WIDTH
                        },
                        position: {
                            x: dimensions.width / 2,
                            y: dimensions.height / 2
                        },
                        targetAnchor: {
                            x: 0.5,
                            y: 0.5
                        },
                        bounds: {
                            width: INNER_WIDTH,
                            height: INNER_HEIGHT
                        }
                    }
                ]
            };
        });
        return viewJSON;
    }
    speakingDone() {
        this._isSpeaking = false;
    }
    _onCardTapped(event) {
        if (this._isSpeaking) {
            return;
        }
        this._isSpeaking = true;
        if (this.sayHeyJiboHandler) {
            this.sayHeyJiboHandler(event.speech);
        }
    }
    _onCardSeen() {
        if (this._view && this._view.list && this._cards) {
            this._cards[this._view.list.pageIndex].markSeen();
        }
    }
    _onViewClosed() {
        this._onDone('~SwipeDown');
        this._cleanup();
    }
    _onTimeout() {
        if (this._view && this._view.list && this._cards) {
            if (this._view.list.pageIndex >= this._cards.length - 1) {
                this._closeView();
            }
            else {
                this._view.list.changePage();
                this._startTimeout();
            }
        }
    }
    _startTimeout() {
        this._timeout = jibo.timer.setTimeout(this._onTimeout.bind(this), 5000);
    }
    _resetTimeout() {
        if (this._timeout) {
            this._timeout.restart();
        }
    }
    _pauseTimeout() {
        if (this._timeout) {
            this._timeout.stop();
        }
    }
    _closeView() {
        let done = this._onDone;
        this._cleanup();
        jibo.face.views.changeView({ remove: true }, () => {
            done('timeout');
        }, () => {
            done('~CloseFailed');
        });
    }
    _cleanup() {
        if (this._timeout) {
            this._timeout.stop();
            this._timeout.destroy();
            this._timeout = null;
        }
        if (this._view) {
            this._view.removeListener(jibo.face.views.CLOSED, this._onViewClosed);
            this._view.removeListener(jibo.face.views.List.PAGED, this._onCardSeen);
            this._view.removeListener(TAP_EVENT, this._onCardTapped);
            this._view = null;
        }
        this._onDone = null;
        this._cards = null;
        if (this._isSpeaking) {
            jibo.embodied.speech.stop();
        }
        this._isSpeaking = null;
        jibo.jetstream.events.hjHeard.removeListener(this._pauseTimeout);
        jibo.jetstream.events.globalTurnResult.removeListener(this._resetTimeout);
        document.removeEventListener('mousedown', this._resetTimeout);
        document.removeEventListener('mousemove', this._resetTimeout);
        document.removeEventListener('mouseup', this._resetTimeout);
    }
    destroy() {
        this._cleanup();
    }
}
exports.default = CardDisplay;

},{"jibo":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const Category_1 = require("./Category");
const categoryPaths = [
    'assets/categories/chitchat.json',
    'assets/categories/geography.json',
    'assets/categories/history.json',
    'assets/categories/justforfun.json',
    'assets/categories/math.json',
    'assets/categories/places.json',
    'assets/categories/popculture.json',
    'assets/categories/science.json',
    'assets/categories/skills.json',
    'assets/categories/sports.json',
    'assets/categories/timedate.json'
];
const KB_MODEL = '/wcyd';
const NUM_CARDS = 5;
class CardSelector {
    constructor(skill) {
        this._categories = [];
        this.log = skill.log;
        this._skill = skill;
        this._kbModel = jibo.kb.createModel(KB_MODEL);
    }
    init(done) {
        jibo.loader.load(categoryPaths, (err, results) => {
            if (err || !results) {
                this.log.error('failed to load Category JSON', err);
                done();
                return;
            }
            this._kbModel.loadRoot((err, root) => {
                if (err || !root) {
                    this.log.error('failed to load CardSelector KB', err);
                    done();
                    return;
                }
                let seenData;
                if (!root.data.seen) {
                    root.data.seen = {};
                }
                for (let categoryData of results) {
                    if (!root.data.seen[categoryData.id]) {
                        root.data.seen[categoryData.id] = {};
                    }
                    this._categories.push(new Category_1.default(categoryData, root, this._skill));
                }
                root.save((err) => {
                    if (err) {
                        this.log.error('failed to save KB data on init: ', err);
                    }
                    done();
                });
            });
        });
    }
    get cards() {
        let bestCards = [];
        for (let category of this._categories) {
            bestCards.push(category.bestCard);
        }
        this._shuffle(bestCards);
        let bestOfTheBest = [];
        for (let card of bestCards) {
            if (card.featured && !card.seen) {
                bestOfTheBest.push(card);
            }
        }
        if (bestOfTheBest.length >= NUM_CARDS) {
            bestOfTheBest.length = NUM_CARDS;
            return bestOfTheBest;
        }
        for (let card of bestCards) {
            if (!card.featured && !card.seen) {
                bestOfTheBest.push(card);
            }
        }
        if (bestOfTheBest.length >= NUM_CARDS) {
            bestOfTheBest.length = NUM_CARDS;
            return bestOfTheBest;
        }
        for (let card of bestCards) {
            if (card.seen) {
                bestOfTheBest.push(card);
            }
        }
        bestOfTheBest.length = NUM_CARDS;
        return bestOfTheBest;
    }
    _shuffle(arr) {
        for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x)
            ;
        return arr;
    }
    destroy() {
        for (let cat of this._categories) {
            cat.destroy();
            cat = null;
        }
        this._categories = null;
        this._kbModel = null;
        this.log = null;
        this._skill = null;
    }
}
exports.default = CardSelector;

},{"./Category":4,"jibo":undefined}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CardData_1 = require("./CardData");
class Category {
    constructor(data, rootNode, skill) {
        this.log = skill.log;
        this.skill = skill;
        this.background = data.background;
        this.name = data.name;
        this.id = data.id;
        this.cards = [];
        this.rootNode = rootNode;
        for (let card of data.cards) {
            let seen = !!this.rootNode.data.seen[this.id][card.id];
            this.cards.push(new CardData_1.default(card, seen, this));
        }
    }
    get bestCard() {
        let bestCards = [];
        for (let card of this.cards) {
            if (card.featured && !card.seen) {
                bestCards.push(card);
            }
        }
        if (bestCards.length) {
            return this._random(bestCards);
        }
        for (let card of this.cards) {
            if (!card.seen) {
                bestCards.push(card);
            }
        }
        if (bestCards.length) {
            return this._random(bestCards);
        }
        return this._random(this.cards);
    }
    destroy() {
        this.background = null;
        this.name = null;
        this.id = null;
        for (let card of this.cards) {
            card.destroy();
            card = null;
        }
        this.cards = null;
        this.log = null;
        this.skill = null;
    }
    _random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
exports.default = Category;

},{"./CardData":1}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const jibo = require("jibo");
const Analytics_1 = require("./analytics/Analytics");
const CardSelector_1 = require("./CardSelector");
const CardMenuView_1 = require("./views/CardMenuView");
const CardDisplay_1 = require("./CardDisplay");
const CardData_1 = require("./CardData");
let mainFlow = require('./flows/main');
class FriendlyTips extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.cardsShown = null;
        this.flowOverrides = null;
        this.analytics = new Analytics_1.default(this);
    }
    preload(done) {
        this.cardSelector = new CardSelector_1.default(this);
        this.cardSelector.init(() => {
            done();
        });
    }
    open(result, refresh) {
        this.log.info('opening skill');
        jibo.face.views.creator.registerClass(CardMenuView_1.default);
        if (!result) {
            result = { nlu: { intent: 'whatCanIDo' } };
        }
        this.log.debug('nlu:', result.nlu);
        if (refresh) {
            this._cleanup(() => {
                this.runFlow(result, refresh);
            });
        }
        else {
            this.runFlow(result, refresh);
        }
    }
    runFlow(result, refresh) {
        this.cardsShown = 0;
        this.cardDisplay = new CardDisplay_1.default(this.log, this.cardSelector);
        this.blackboard = {
            assetPack: this.assetPack,
            cardDisplay: this.cardDisplay,
            log: this.log
        };
        const options = Object.assign({
            enableLogging: true,
            assetPack: this.assetPack,
            blackboard: this.blackboard,
            params: {
                result: result,
                refresh: !!refresh
            }
        }, this.flowOverrides);
        this.flow = jibo.flow.run(mainFlow, options, (err, status) => {
            if (status === jibo.bt.Status.INTERRUPTED) {
                return;
            }
            this.exit();
        });
    }
    close(done) {
        this.log.info('closing skill');
        jibo.face.views.creator.unregisterClass('CardMenuView');
        this._cleanup(() => {
            if (this.cardSelector) {
                this.cardSelector.destroy();
                this.cardSelector = null;
            }
            done();
        });
    }
    _cleanup(done) {
        if (this.cardsShown !== null) {
            this.analytics.thingsDone(this.cardsShown);
            this.cardsShown = null;
        }
        if (this.flow) {
            this.flow.stopAndDestroy().then(() => {
                if (this.cardDisplay) {
                    this.cardDisplay.destroy();
                    this.cardDisplay = null;
                }
                this.flow = null;
                if (jibo.face.views.currentView && jibo.face.views.currentView.id !== 'eyeView') {
                    jibo.face.views.changeView({
                        removeAll: true,
                        leaveEmpty: true
                    }, () => {
                        done();
                    }, (err) => {
                        this.log.error(err);
                        done();
                    });
                }
                else {
                    jibo.face.views.forceEyeView(() => {
                        done();
                    }, null, null, null, () => {
                        this.log.error('Error removing view, calling done anyway');
                        done();
                    });
                }
            });
        }
        else {
            done();
        }
    }
}
FriendlyTips.CardMenuView = CardMenuView_1.default;
FriendlyTips.CardSelector = CardSelector_1.default;
FriendlyTips.CardDisplay = CardDisplay_1.default;
FriendlyTips.CardData = CardData_1.default;
exports.default = FriendlyTips;

},{"./CardData":1,"./CardDisplay":2,"./CardSelector":3,"./analytics/Analytics":6,"./flows/main":7,"./views/CardMenuView":9,"@be/be-framework":undefined,"jibo":undefined}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    constructor(skill) {
        this.skill = skill;
    }
    thingsDone(cards_shown) {
        this.skill.track('TTD Complete', { cards_shown });
    }
    cardShown(text) {
        this.skill.track('TTD Card Shown', { text });
    }
}
exports.default = Analytics;

},{}],7:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/friendly-tips/src/flows/main.flow'
        },
        '943fb90c-8699-4eb6-9de1-a1cddc841c94': function () {
            return {
                'id': '943fb90c-8699-4eb6-9de1-a1cddc841c94',
                'name': 'Begin',
                'transitions': [{
                        'frm': '943fb90c-8699-4eb6-9de1-a1cddc841c94',
                        'to': '61e249f6-f671-434b-be27-5401fc050591',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return { result: null };
                    }
                }
            };
        },
        '2052e45c-2d10-4dda-9f90-8013d60de749': function () {
            return {
                'id': '2052e45c-2d10-4dda-9f90-8013d60de749',
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
        'ea1269d1-36aa-4934-a7f7-d13decf7fe45': function () {
            return {
                'id': 'ea1269d1-36aa-4934-a7f7-d13decf7fe45',
                'name': 'Frustrated intro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ea1269d1-36aa-4934-a7f7-d13decf7fe45',
                        'to': 'd7210888-9aa2-4162-8fc9-b3d7fcfbdaa3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/FrustratedIntro.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '31d3aba3-5a54-4ab1-bd5d-5ff80dd84576': function () {
            return {
                'id': '31d3aba3-5a54-4ab1-bd5d-5ff80dd84576',
                'name': 'Curious intro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '31d3aba3-5a54-4ab1-bd5d-5ff80dd84576',
                        'to': 'd7210888-9aa2-4162-8fc9-b3d7fcfbdaa3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CuriousIntro.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '61e249f6-f671-434b-be27-5401fc050591': function () {
            return {
                'id': '61e249f6-f671-434b-be27-5401fc050591',
                'name': 'Prompts setup,Parse intent',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '61e249f6-f671-434b-be27-5401fc050591',
                        'to': 'd7210888-9aa2-4162-8fc9-b3d7fcfbdaa3',
                        'value': 'dontSpeak'
                    },
                    {
                        'frm': '61e249f6-f671-434b-be27-5401fc050591',
                        'to': '3d40d81f-26b0-4040-ade1-bf893976402b',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let intent = notepad.params.result.nlu.intent;
                        if (intent === 'menu' || notepad.params.refresh && intent === 'whatCanIDo') {
                            intent = 'dontSpeak';
                        }
                        blackboard.log.debug('intent:', intent);
                        done(intent);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '3d40d81f-26b0-4040-ade1-bf893976402b': function () {
            return {
                'id': '3d40d81f-26b0-4040-ade1-bf893976402b',
                'name': 'Force eye view',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '3d40d81f-26b0-4040-ade1-bf893976402b',
                        'to': 'ea1269d1-36aa-4934-a7f7-d13decf7fe45',
                        'value': 'frustrated'
                    },
                    {
                        'frm': '3d40d81f-26b0-4040-ade1-bf893976402b',
                        'to': '31d3aba3-5a54-4ab1-bd5d-5ff80dd84576',
                        'value': 'whatCanIDo'
                    },
                    {
                        'frm': '3d40d81f-26b0-4040-ade1-bf893976402b',
                        'to': '31d3aba3-5a54-4ab1-bd5d-5ff80dd84576',
                        'value': 'help'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.forceEyeView(() => {
                            done(this.inTransition);
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'd7210888-9aa2-4162-8fc9-b3d7fcfbdaa3': function () {
            return {
                'id': 'd7210888-9aa2-4162-8fc9-b3d7fcfbdaa3',
                'name': 'Do the thing.',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd7210888-9aa2-4162-8fc9-b3d7fcfbdaa3',
                        'to': '25e80e74-27ca-443b-bde9-0e350748749f',
                        'value': ''
                    }],
                'exceptions': [{
                        'frm': 'd7210888-9aa2-4162-8fc9-b3d7fcfbdaa3',
                        'to': '2052e45c-2d10-4dda-9f90-8013d60de749',
                        'value': '~'
                    }],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.cardDisplay.showCardMenu(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '25e80e74-27ca-443b-bde9-0e350748749f': function () {
            return {
                'id': '25e80e74-27ca-443b-bde9-0e350748749f',
                'name': 'Want More T T D',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '25e80e74-27ca-443b-bde9-0e350748749f',
                        'to': '2052e45c-2d10-4dda-9f90-8013d60de749',
                        'value': ''
                    },
                    {
                        'frm': '25e80e74-27ca-443b-bde9-0e350748749f',
                        'to': 'd7210888-9aa2-4162-8fc9-b3d7fcfbdaa3',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': '25e80e74-27ca-443b-bde9-0e350748749f',
                        'to': '2052e45c-2d10-4dda-9f90-8013d60de749',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/WantMoreTTD.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = results.firstGrammarTag;
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
        'cf30e951-0779-46e3-9907-d0af9d065bc7': function () {
            return {
                'id': 'cf30e951-0779-46e3-9907-d0af9d065bc7',
                'name': 'SayHeyJibo',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'cf30e951-0779-46e3-9907-d0af9d065bc7',
                        'to': '9805eb29-c2ff-40f0-a376-0f9127335b10',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (!notepad.sayHeyJiboInit) {
                            notepad.sayHeyJiboInit = true;
                        } else {
                            blackboard.cardDisplay.speakingDone();
                            notepad.suggestedPrompt = null;
                        }
                        blackboard.cardDisplay.sayHeyJiboHandler = suggestedPrompt => {
                            notepad.suggestedPrompt = suggestedPrompt;
                            done('');
                        };
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '66a6d93a-5f25-4593-a167-41f58da530cc': {
            'id': '66a6d93a-5f25-4593-a167-41f58da530cc',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '66a6d93a-5f25-4593-a167-41f58da530cc',
                    'to': 'cf30e951-0779-46e3-9907-d0af9d065bc7',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '9805eb29-c2ff-40f0-a376-0f9127335b10': function () {
            return {
                'id': '9805eb29-c2ff-40f0-a376-0f9127335b10',
                'name': 'Say Hey Jibo',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9805eb29-c2ff-40f0-a376-0f9127335b10',
                        'to': 'cf30e951-0779-46e3-9907-d0af9d065bc7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/SayHeyJibo.mim',
                    'getPromptData': () => {
                        return { suggestedPrompt: notepad.suggestedPrompt };
                    }
                }
            };
        }
    };
};
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FriendlyTips_1 = require("./FriendlyTips");
module.exports = FriendlyTips_1.default;

},{"./FriendlyTips":5}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
var Label = jibo.rendering.gui.components.Label;
var List = jibo.rendering.gui.components.List;
var MenuView = jibo.rendering.gui.views.MenuView;
var ElementGroup = jibo.rendering.gui.components.ElementGroup;
const log = jibo.log.createChild('Be.FriendlyTips.CardMenuView');
const ELEMENT_WIDTH = 1016;
const ELEMENT_HEIGHT = 520;
const ELEMENTS_PER_PAGE = 1;
class CardMenuView extends MenuView {
    constructor() {
        super();
        this._buttonLabelsText = [];
    }
    static get DEFAULT_TYPE() { return 'CardMenuView'; }
    applyData() {
        this._list = new List();
        this.addComponent(this._list);
        this.createListComponents(this._list);
        const listConfig = (this._viewConfig) ? Object.assign({}, this._viewConfig) : {};
        listConfig.id = 'list';
        listConfig.type = List.DEFAULT_TYPE;
        if (!listConfig.elementsPerPage) {
            listConfig.elementsPerPage = ELEMENTS_PER_PAGE;
        }
        if (!listConfig.elementDimensions) {
            listConfig.elementDimensions = {
                width: ELEMENT_WIDTH,
                height: ELEMENT_HEIGHT
            };
        }
        delete listConfig.title;
        delete listConfig.assets;
        delete listConfig.list;
        this._list.assignConfig(listConfig);
        this._buttonLabels = [];
        let buttonLabel;
        for (let i = 0; i < ELEMENTS_PER_PAGE; i++) {
            buttonLabel = new Label();
            buttonLabel.id = 'buttonLabel' + i;
            buttonLabel.text = this.componentConfigs[0].componentConfigs[i].label;
            buttonLabel.style = Label.createFontStyle(45, 'Proxima Nova Light', '#FFFFFF', '', 'center');
            buttonLabel.bounds = { width: listConfig.elementDimensions.width, height: listConfig.elementDimensions.height };
            this.addComponent(buttonLabel);
            this._buttonLabels.push(buttonLabel);
        }
    }
    createListComponents(list) {
        if (this._viewConfig) {
            const defaultElementData = this._viewConfig.listDefault || {};
            const componentType = defaultElementData.elementGroupType || ElementGroup.DEFAULT_TYPE;
            if (!defaultElementData.type) {
                defaultElementData.type = componentType;
            }
            const configs = this.componentConfigs[0].componentConfigs;
            this._buttonLabelsText = configs.map((config) => config.label);
            list.createComponentsFromConfigs(configs, defaultElementData);
        }
        else {
            log.warn('createListComponents() this._viewConfig was not defined, but is required.');
        }
    }
    updateButtonLabels(labelRemovalNeeded = false, playTransition = true, duration = 200) {
        if (!this._buttonLabels) {
            return;
        }
        if (labelRemovalNeeded) {
            let component = this.removeComponent(this._buttonLabels.pop());
            if (component) {
                component.destroy();
                component = null;
            }
        }
        this.positionButtonLabels();
        const buttonComponents = this._list.getElementsByPage();
        const length = buttonComponents.length;
        if (playTransition) {
            for (let i = 0; i < length; i++) {
                let buttonLabel = this._buttonLabels[i];
                buttonLabel.text = this._buttonLabelsText[this._list.pageIndex];
                if (buttonLabel.display.alpha === 1) {
                    buttonLabel.close(() => {
                        buttonLabel.open(null, null, duration);
                    }, null, duration);
                }
                else {
                    buttonLabel.open(null, null, duration);
                }
            }
        }
        else {
            for (let i = 0; i < length; i++) {
                this._buttonLabels[i].text = this._buttonLabelsText[this._list.pageIndex];
            }
        }
    }
    destroy() {
        super.destroy();
    }
}
exports.default = CardMenuView;

},{"jibo":undefined}]},{},[8])(8)
});
//# sourceMappingURL=index.js.map