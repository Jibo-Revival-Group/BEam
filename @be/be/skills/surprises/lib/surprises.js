(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.surprises = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jon/Workspace/jibo/buildsdk/node_modules/jibo/typings/index.d.ts":[function(require,module,exports){
/// <reference path="globals/jibo/index.d.ts" />

},{}],1:[function(require,module,exports){
"use strict";
/**
 * @fileOverview
 *
 * Created on 9/14/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const kb_1 = require("./kb");
const Utils_1 = require("./Utils");
const be_framework_1 = require("@be/be-framework");
exports.CU = be_framework_1.libraries.jibo_cai_utils;
/**
 * An interface of options that can be read from a test json file
 * to control the flow of the EoS selection
 */
const ControlType = {
    lastSkill: 'lastSkill',
    hasAnyDateFactPlayedToday: 'hasAnyDateFactPlayedToday',
    userID: 'userID',
    likesEoS: 'likesEoS',
    timeSinceLastEoSOfferMs: 'timeSinceLastEoSOfferMs',
    probabilityDateFact: 'probabilityDateFact',
    probabilityEOSType: 'probabilityEOSType',
    probabilityPoliteComment: 'probabilityPoliteComment',
    pickNoCategory: 'pickNoCategory',
};
class EoSControl extends exports.CU.TestConfiguration {
    constructor(identity) {
        super('@be/surprises');
        this.identity = identity;
    }
    pickNoCategory() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getBooleanFromTestConfig(ControlType.pickNoCategory, () => false);
        });
    }
    hasAnyDateFactPlayed() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getBooleanFromTestConfig(ControlType.hasAnyDateFactPlayedToday, this._hasAnyDateFactPlayed.bind(this));
        });
    }
    getTimeSinceLastEoSOffer() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getNumberFromTestConfig(ControlType.timeSinceLastEoSOfferMs, this._getTimeSinceLastEoSOffer.bind(this));
        });
    }
    getLastSkill() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getStringFromTestConfig(ControlType.lastSkill, () => this.defaultLastSkill);
        });
    }
    getProbabilityDateFact() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getNumberFromTestConfig(ControlType.probabilityDateFact, () => Math.random());
        });
    }
    getProbabilityPoliteComment() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getNumberFromTestConfig(ControlType.probabilityPoliteComment, () => Math.random());
        });
    }
    getProbabilityEOSType() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getNumberFromTestConfig(ControlType.probabilityEOSType, () => Math.random());
        });
    }
    getUserLikesEoS() {
        return __awaiter(this, void 0, void 0, function* () {
            const likesStr = yield this.getStringFromTestConfig(ControlType.likesEoS, this._userLikesEoS.bind(this));
            return kb_1.UserLikesEoS[likesStr];
        });
    }
    getUserID() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getStringFromTestConfig(ControlType.userID, this._getUserID.bind(this));
        });
    }
    /*
     * All of the methods below are the actual methods to retrieve control data
     */
    _hasAnyDateFactPlayed() {
        return __awaiter(this, void 0, void 0, function* () {
            const catNode = yield kb_1.CategoryKBNode.getOrCreate(Utils_1.Utils.SkillNames.DATE_COMMENTARY);
            if (catNode.getData().lastSelectedTime === -1) {
                return false;
            }
            const lastSelected = new Date(catNode.getData().lastSelectedTime);
            const today = kb_1.KBTools.dateProvider();
            // If we are in the same day
            if (lastSelected.getDay() === today.getDay() &&
                lastSelected.getMonth() === today.getMonth() &&
                lastSelected.getFullYear() === today.getFullYear()) {
                // If we are truly in the daytime but eos was delivered last night
                return !(today.getHours() > 7 && lastSelected.getHours() <= 7);
            }
            else {
                return false;
            }
        });
    }
    _getUserID() {
        return __awaiter(this, void 0, void 0, function* () {
            const personList = this.identity.getPresentPersons();
            return (personList.length !== 0) ? personList[0].id : null;
        });
    }
    _userLikesEoS() {
        return __awaiter(this, void 0, void 0, function* () {
            const userID = yield this._getUserID();
            if (userID) {
                const userNode = yield kb_1.UserKBNode.getOrCreate(userID);
                return userNode.getData().likesEoS;
            }
            else {
                return kb_1.UserLikesEoS.UNKNOWN;
            }
        });
    }
    _getTimeSinceLastEoSOffer() {
        return __awaiter(this, void 0, void 0, function* () {
            const eosNode = yield kb_1.EoSKBNode.getOrCreate();
            const now = kb_1.KBTools.dateProvider();
            const last = new Date(eosNode.getData().lastEoSDelivery);
            return now.getTime() - last.getTime();
        });
    }
}
exports.EoSControl = EoSControl;
// Give access to internal module components for testing
if (global._eosTest) {
    global._eosTest.EoSControl = module.exports;
}

},{"./Utils":5,"./kb":10,"@be/be-framework":undefined}],2:[function(require,module,exports){
"use strict";
/**
 * @EosBase
 *
 * Created on 6/25/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
class SurpriseElement extends be_framework_1.BeSkill {
    /**
     * Create new ElementsOfSurpriseCategory
     * @constructor
     * @param {Object} [options] Be options for setting up this skill or the assetPack name.
     * @param {String} [options.assetPack=''] Name of the asset pack if running in the context of another skill.
     * @param {String} [options.rootPath=''] The path to this skill's root folder.
     */
    constructor(options) {
        super(options);
    }
    /**
     * A boolean read-only flag to indicate to Be that this is an Element of Surprise category
     * @type {boolean}
     */
    get isElementOfSurprise() {
        return true;
    }
}
exports.SurpriseElement = SurpriseElement;

},{"@be/be-framework":undefined}],3:[function(require,module,exports){
"use strict";
/**
 * @EosBase
 *
 * Created on 6/25/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
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
const path = require("path");
const be_framework_1 = require("@be/be-framework");
const policies_1 = require("./policies");
const kb_1 = require("./kb");
const EoSControl_1 = require("./EoSControl");
class SurpriseSkill extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.selectionPolicy = new policies_1.HighestPriorityPolicy(this);
        this.eosControl = new EoSControl_1.EoSControl(null);
        this.openPromise = Promise.resolve();
        this.isActive = false;
    }
    postInit(done) {
        this._postInit().then(done).catch(done);
    }
    _postInit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield kb_1.KBTools.getRoot(); // Workaround for a kb bug
            this.eosControl.identity = jibo.lps.identity;
            yield this.eosControl.init(path.join(jibo.utils.PathUtils.findRoot(), 'testConfig.json'));
        });
    }
    /**
     * Provide categories. This is either called from Be during setup or
     * the constructor in standalone mode
     * @param {SurpriseElement[]} categories
     */
    supplyCategories(categories) {
        categories.forEach(cat => {
            if (!cat.isElementOfSurprise) {
                throw Error(`Invalid EoS category: ${cat.assetPack}`);
            }
        });
        this.categories = categories;
    }
    /**
     * Called just before skill starts
     * @param done
     */
    preload(done) {
        done();
    }
    open(result) {
        // Needed to make sure that the Be LOADED state gets set
        // in case we redirect immediately
        process.nextTick(() => {
            this._open(result)
                .then(([categoryName, context]) => {
                if (categoryName) {
                    this.redirect(categoryName, context);
                }
                else {
                    this.exit();
                }
            })
                .catch(e => {
                this.log.error(`error opening: `, e);
                this.exit();
            });
        });
    }
    /**
     * Called when skill is closing
     * @param {function} done
     */
    close(done) {
        this.log.info(`Exiting`);
        this.isActive = false;
        this.openPromise
            .then(() => done())
            .catch(error => done(error));
    }
    /**
     * Internal async open method, mostly exists to make open async
     * @param result
     * @private
     */
    _open(result) {
        return __awaiter(this, void 0, void 0, function* () {
            this.eosControl.defaultLastSkill = (result && result.lastSkill) ? result.lastSkill : '';
            // Wait to allow some VAD samples in
            this.isActive = true;
            this.openPromise = new Promise(resolve => setTimeout(resolve, SurpriseSkill.OPEN_WAIT_TIME_MS));
            yield this.openPromise;
            if (!this.isActive) {
                // close was called while we were waiting
                return [null, null];
            }
            if (!jibo.action.checkEnvironmentContext()) {
                this.log.info(`No EoS because environment context is loud or detected people talking.`);
                return [null, null];
            }
            else if (yield this.eosControl.pickNoCategory()) {
                this.log.info(`No EoS category selected because of 'pickNoCategory' option`);
                return [null, null];
            }
            // First we construct the context
            const context = yield this._constructContext(result);
            // We then select the category based on this context
            const categoryName = yield this._selectCategory(context);
            if (!categoryName) {
                this.log.info(`No EoS category selected`);
                return [null, null];
            }
            else {
                this.log.info(`EoS category '${categoryName}' selected`);
                return [categoryName, context];
            }
        });
    }
    /**
     * Builds the launch context for all Surprise categories. They use this as a basis for
     * whether or not they want to be selected
     * @param {Object} result Input results that were originally passed in through open
     * @return {LaunchContext}
     * @private
     */
    _constructContext(result) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastSkill = yield this.eosControl.getLastSkill();
            let context = { lastSkill };
            context.userID = yield this.eosControl.getUserID();
            return context;
        });
    }
    /**
     * Selects what category to run
     * Selects what category to run
     * @param {LaunchContext} context
     */
    _selectCategory(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ask all installed categories how much they want to be selected
            const priorityPrs = this.categories.map((cat) => {
                return cat.getContextualPriority(context)
                    .then(priority => {
                    return {
                        category: cat,
                        contextualPriority: priority,
                        totalPriority: priority * cat.getCategoryPriority()
                    };
                });
            });
            let categories = yield Promise.all(priorityPrs);
            // Remove all categories with 0 priority
            categories = categories.filter((res) => res.totalPriority > 0);
            // Sort in reverse order (highest first)
            categories.sort((a, b) => {
                return b.totalPriority - a.totalPriority;
            });
            if (categories.length === 0) {
                // If no categories remain then we're done
                this.log.info(`No Eos categories participating`);
            }
            else {
                // Get the selected category using our installed selection policy
                const category = yield this.selectionPolicy.select(context, categories);
                const selectedCategoryName = category ? category.assetPack : null;
                const [catNode, eosNode] = yield Promise.all([
                    kb_1.CategoryKBNode.getOrCreate(selectedCategoryName),
                    kb_1.EoSKBNode.getOrCreate(),
                ]);
                yield Promise.all([
                    catNode.markSelected(),
                    eosNode.markDelivered(),
                ]);
                return selectedCategoryName;
            }
        });
    }
}
SurpriseSkill.OPEN_WAIT_TIME_MS = 150; // time to wait in open method before checking for environmental inhibiting signals
exports.SurpriseSkill = SurpriseSkill;

},{"./EoSControl":1,"./kb":10,"./policies":13,"@be/be-framework":undefined,"jibo":undefined,"path":undefined}],4:[function(require,module,exports){
"use strict";
/**
 * @EosBase
 *
 * Created on 6/25/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SurpriseElement_1 = require("./SurpriseElement");
class SurpriseTemplate extends SurpriseElement_1.SurpriseElement {
    /**
     * Create new EosCategory
     * @constructor
     * @param {Object} [options] Be options for setting up this skill or the assetPack name.
     * @param {String} [options.assetPack=''] Name of the asset pack if running in the context of another skill.
     * @param {String} [options.rootPath=''] The path to this skill's root folder.
     * @param {number} [categoryPriority=10] Base priority of this category.
     * @param {number} [contextualPriority=10] Contextual priority of this category.
     */
    constructor(options, categoryPriority = 10, contextualPriority = 10) {
        super(options);
        this.categoryPriority = categoryPriority;
        this.contextualPriority = contextualPriority;
    }
    getCategoryPriority() {
        return this.categoryPriority;
    }
    getContextualPriority(context) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contextualPriority;
        });
    }
    open(result) {
        this.exit();
    }
    /**
     * Unload a skill, must override
     * @method close
     * @param {Function} done Callback to call when completed.
     */
    close(done) {
        done();
    }
}
exports.SurpriseTemplate = SurpriseTemplate;

},{"./SurpriseElement":2}],5:[function(require,module,exports){
"use strict";
/**
 * @fileOverview
 *
 * Created on 9/17/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
}
Utils.MINUTE_TO_MS = 60 * 1000;
Utils.HOUR_TO_MS = 60 * Utils.MINUTE_TO_MS;
Utils.SkillNames = {
    JOT: '@be/jot',
    SNAP: '@be/snap',
    GREETINGS: '@be/greetings',
    SETTINGS: '@be/settings',
    CLOCK: '@be/clock',
    DATE_COMMENTARY: '@be/surprises-date',
};
exports.Utils = Utils;
// Give access to internal module components for testing
if (global._eosTest) {
    global._eosTest.Utils = module.exports;
}

},{}],6:[function(require,module,exports){
"use strict";
/**
 * @fileOverview
 *
 * Created on 9/15/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
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
const KBTools_1 = require("./KBTools");
const { PromiseUtils } = be_framework_1.libraries.jibo_cai_utils;
class CategoryKBNode {
    constructor(node) {
        this.node = node;
    }
    /**
     * Retrieves a CategoryKBNode. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getOrCreate(categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            const categoryRoot = yield KBTools_1.KBTools.getCategoriesNode();
            const node = yield KBTools_1.KBTools.getOrCreateEdge(categoryName, categoryRoot, CategoryKBNode._createInitialCategoryData);
            return new CategoryKBNode(node);
        });
    }
    /**
     * Creates an initial CategoryData object
     * @param {string} categoryName
     * @returns {CategoryData}
     * @private
     */
    static _createInitialCategoryData(categoryName) {
        return {
            categoryName,
            lastSelectedTime: -1,
        };
    }
    /**
     * Sets that a particular category has been selected at a certain time
     * @param {Date} [date] The time at which it was selected
     */
    markSelected(date = KBTools_1.KBTools.dateProvider()) {
        return __awaiter(this, void 0, void 0, function* () {
            this.getData().lastSelectedTime = date.getTime();
            yield PromiseUtils.promisify(h => this.node.save(h));
        });
    }
    /**
     * Get EoSCategory data
     * @return {CategoryData}
     */
    getData() {
        return this.node.data;
    }
    /**
     * Save kb node
     * @return {Promise<void>}
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            return PromiseUtils.promisify(h => this.node.save(h));
        });
    }
}
exports.CategoryKBNode = CategoryKBNode;
// Give access to internal module components for testing
if (global._eosTest) {
    global._eosTest.CategoryKBNode = module.exports;
}

},{"./KBTools":8,"@be/be-framework":undefined}],7:[function(require,module,exports){
"use strict";
/**
 * @fileOverview
 *
 * Created on 9/15/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
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
const KBTools_1 = require("./KBTools");
const { PromiseUtils } = be_framework_1.libraries.jibo_cai_utils;
class EoSKBNode {
    constructor(node) {
        this.node = node;
    }
    /**
     * Retrieves an EoSKBNode. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getOrCreate() {
        return __awaiter(this, void 0, void 0, function* () {
            const node = yield KBTools_1.KBTools.getOrCreateEdge('eos', null, EoSKBNode._createInitialRootData);
            return new EoSKBNode(node);
        });
    }
    /**
     * Creates an initial EoSData object
     * @returns {EoSData}
     * @private
     */
    static _createInitialRootData() {
        return {
            lastEoSDelivery: -1,
        };
    }
    /**
     * Sets that any EoS category was delivered
     * @param {Date} [date] The time at which it was selected
     */
    markDelivered(date = KBTools_1.KBTools.dateProvider()) {
        return __awaiter(this, void 0, void 0, function* () {
            this.getData().lastEoSDelivery = date.getTime();
            yield PromiseUtils.promisify(h => this.node.save(h));
        });
    }
    /**
     * Get data
     * @return {CategoryData}
     */
    getData() {
        return this.node.data;
    }
    /**
     * Save kb node
     * @return {Promise<void>}
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            yield PromiseUtils.promisify(h => this.node.save(h));
        });
    }
}
exports.EoSKBNode = EoSKBNode;
// Give access to internal module components for testing
if (global._eosTest) {
    global._eosTest.EoSKBNode = module.exports;
}

},{"./KBTools":8,"@be/be-framework":undefined}],8:[function(require,module,exports){
"use strict";
/**
 * @fileOverview
 *
 * Created on 9/15/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
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
const { PromiseUtils } = be_framework_1.libraries.jibo_cai_utils;
class KBTools {
    /**
     * Creates the KB model and stores it in static variable
     * @param {string} [path='/jibo/eos'] Path to EoS KB model
     * @private
     */
    static _createModel(path = '/jibo/eos') {
        return __awaiter(this, void 0, void 0, function* () {
            KBTools._kbModel = jibo.kb.createModel(path);
            yield PromiseUtils.promisify(h => KBTools._kbModel.loadRoot(h)); // This works around a bug
            return null;
        });
    }
    /**
     * Gets the kb model or creates it if it doesn't exist
     * @return {Model}
     */
    static getOrCreateModel() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!KBTools._kbModel) {
                yield KBTools._createModel();
            }
            return KBTools._kbModel;
        });
    }
    /**
     * Retrieves the KB root node. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getRoot() {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield KBTools.getOrCreateModel();
            return PromiseUtils.promisify(h => model.loadRoot(h));
        });
    }
    /**
     * Retrieves categories node. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getCategoriesNode() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield KBTools.getOrCreateEdge('categories', null, () => {
                return {};
            });
        });
    }
    /**
     * Retrieves users node. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getUsersNode() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield KBTools.getOrCreateEdge('users', null, () => {
                return {};
            });
        });
    }
    /**
     * Gets an edge node by name (and creates it if needed)
     * @param {string} edgeName
     * @param {Node} [node] Node to create edge on, if omitted then root node is used
     * @param {function} [dataInitializer] A function to initialize data in new node
     * If not provided, then a new node won't be created
     * @return {Node}
     */
    static getOrCreateEdge(edgeName, node, dataInitializer) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield KBTools.getOrCreateModel();
            let rootToUse = node || (yield KBTools.getRoot());
            const edges = rootToUse.getEdges(edgeName);
            // If edge found
            if (edges.length > 0) {
                return yield PromiseUtils.promisify(h => model.load(edges[0], h));
            }
            else if (dataInitializer) {
                let node = model.createNode(edgeName);
                node.data = dataInitializer(edgeName);
                yield PromiseUtils.promisify(h => node.save(h));
                rootToUse.addEdges(node);
                yield PromiseUtils.promisify(h => rootToUse.save(h));
                return node;
            }
            else {
                return null;
            }
        });
    }
}
KBTools.dateProvider = () => new Date();
exports.KBTools = KBTools;
// Give access to internal module components for testing
if (global._eosTest) {
    global._eosTest.KBTools = module.exports;
}

},{"@be/be-framework":undefined,"jibo":undefined}],9:[function(require,module,exports){
"use strict";
/**
 * @fileOverview
 *
 * Created on 9/15/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
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
const KBTools_1 = require("./KBTools");
const { PromiseUtils } = be_framework_1.libraries.jibo_cai_utils;
var UserLikesEoS;
(function (UserLikesEoS) {
    UserLikesEoS[UserLikesEoS["TRUE"] = 'TRUE'] = "TRUE";
    UserLikesEoS[UserLikesEoS["FALSE"] = 'FALSE'] = "FALSE";
    UserLikesEoS[UserLikesEoS["UNKNOWN"] = 'UNKNOWN'] = "UNKNOWN";
})(UserLikesEoS = exports.UserLikesEoS || (exports.UserLikesEoS = {}));
class UserKBNode {
    constructor(node) {
        this.node = node;
    }
    /**
     * Retrieves an UserKBNode. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getOrCreate(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersRoot = yield KBTools_1.KBTools.getUsersNode();
            const node = yield KBTools_1.KBTools.getOrCreateEdge(userID, usersRoot, UserKBNode._createInitialUserData);
            return new UserKBNode(node);
        });
    }
    /**
     * Creates an initial UserData object
     * @param {string} userID
     * @returns {UserData}
     * @private
     */
    static _createInitialUserData(userID) {
        return {
            userID,
            likesEoS: UserLikesEoS.UNKNOWN
        };
    }
    /**
     * Get User data
     * @return {UserData}
     */
    getData() {
        return this.node.data;
    }
    /**
     * Save kb node
     * @return {Promise<void>}
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            return PromiseUtils.promisify(h => this.node.save(h));
        });
    }
}
exports.UserKBNode = UserKBNode;
// Give access to internal module components for testing
if (global._eosTest) {
    global._eosTest.UserKBNode = module.exports;
}

},{"./KBTools":8,"@be/be-framework":undefined}],10:[function(require,module,exports){
"use strict";
/**
 * @fileOverview
 *
 * Created on 9/16/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./CategoryKBNode"));
__export(require("./UserKBNode"));
__export(require("./EoSKBNode"));
__export(require("./KBTools"));

},{"./CategoryKBNode":6,"./EoSKBNode":7,"./KBTools":8,"./UserKBNode":9}],11:[function(require,module,exports){
"use strict";
/**
 * @fileOverview
 *
 * Created on 7/16/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SelectionPolicy_1 = require("./SelectionPolicy");
class HighestPriorityPolicy extends SelectionPolicy_1.SelectionPolicy {
    constructor(eosSkill) {
        super(eosSkill);
        this._selectedTimes = new Map();
    }
    select(launchContext, categories) {
        return __awaiter(this, void 0, void 0, function* () {
            if (categories.length > 0) {
                // Find all that tied with equally high score
                const highScore = categories[0].totalPriority;
                let ties = [categories[0]];
                for (let i = 1; i < categories.length; i++) {
                    if (categories[i].totalPriority !== highScore) {
                        break;
                    }
                    ties.push(categories[i]);
                }
                let selected;
                // If we have a tie, select the one that hasn't been played the longest
                if (ties.length > 1) {
                    const lastPlayed = ties.map(categoryRes => {
                        const time = this._selectedTimes.get(categoryRes.category.assetPack) || 0;
                        return { categoryRes, time };
                    });
                    lastPlayed.sort((a, b) => (a.time - b.time));
                    selected = lastPlayed[0].categoryRes.category;
                }
                else if (categories.length === 1) {
                    selected = categories[0].category;
                }
                else {
                    // If we selected this last time then we select the next highest priority category now
                    selected = (categories[0].category.assetPack !== this._lastSelected) ?
                        categories[0].category : categories[1].category;
                }
                // Mark the selection time for this category
                this._selectedTimes.set(selected.assetPack, Date.now());
                this._lastSelected = selected.assetPack;
                return selected;
            }
            else {
                return null;
            }
        });
    }
}
exports.HighestPriorityPolicy = HighestPriorityPolicy;
// Give access to internal module components for testing
if (global._eosTest) {
    global._eosTest.HighestPriorityPolicy = module.exports;
}

},{"./SelectionPolicy":12}],12:[function(require,module,exports){
"use strict";
/**
 * @fileOverview
 *
 * Created on 7/16/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
class SelectionPolicy {
    constructor(eosSkill) {
        this.eosSkill = eosSkill;
    }
}
exports.SelectionPolicy = SelectionPolicy;

},{}],13:[function(require,module,exports){
"use strict";
/**
 * @fileOverview
 *
 * Created on 9/17/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./SelectionPolicy"));
// export * from './RandomSelectionPolicy';
// export * from './Beta2SelectionPolicy';
__export(require("./HighestPriorityPolicy"));

},{"./HighestPriorityPolicy":11,"./SelectionPolicy":12}],14:[function(require,module,exports){
"use strict";
/**
 * @fileOverview
 *
 * Created on 9/16/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const SurpriseSkill_1 = require("./SurpriseSkill");
exports.SurpriseSkill = SurpriseSkill_1.SurpriseSkill;
const kb = require("./kb");
exports.kb = kb;
const policies = require("./policies");
exports.policies = policies;
const BeFramework = require("@be/be-framework");
exports.BeFramework = BeFramework;
__export(require("./SurpriseElement"));
__export(require("./SurpriseTemplate"));
const Skill = SurpriseSkill_1.SurpriseSkill;
exports.Skill = Skill;

},{"./SurpriseElement":2,"./SurpriseSkill":3,"./SurpriseTemplate":4,"./kb":10,"./policies":13,"@be/be-framework":undefined}]},{},[14])(14)
});

//# sourceMappingURL=surprises.js.map
