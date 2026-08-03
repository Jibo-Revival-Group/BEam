const TestUtils = require('./TestUtils');
const FriendlyTips = require('../index');
const CardMenuView = FriendlyTips.CardMenuView;
const CardSelector = FriendlyTips.CardSelector;
const CardDisplay = FriendlyTips.CardDisplay;
const CardData = FriendlyTips.CardData;

const result = {"Input":"hey jibo what can you do","nlu":{"intent":"whatCanIDo","domain":"global_commands","skill":"@be/friendly-tips"},"heuristic_score":0};
const frustratedResult = {"Input":"hey jibo you can't do anything","nlu":{"intent":"frustrated","skill":"@be/friendly-tips","domain":"friendly-tips","union_original_fst_name":"handle:8"},"heuristic_score":22,"index":0};

describe('FriendlyTips', function() {
    beforeEach(function() {
        this.skill.flowOverrides = null; // TODO: Remove this when Rick fixes this bug: https://jira.jibo.com/browse/JIBO-6716
    });

    describe('open', function() {
        it('cardSelector class should exist', function() {
            assert.isOk(this.skill.cardSelector, 'cardSelector should exist');
            assert.instanceOf(this.skill.cardSelector, CardSelector, 'cardSelector should be an instance of CardSelector');
        });

        it('CardSelector should be inited', function() {
            assert.notStrictEqual(this.skill.cardSelector._categories.length, 0, 'init was not called');
        });

        it('CardDisplay class should exist', function(done) {
            const flowStub = this.sandbox.stub(jibo.flow, 'run', () => {
                assert.isOk(this.skill.cardDisplay, 'cardDisplay should exist');
                assert.instanceOf(this.skill.cardDisplay, CardDisplay, 'cardSelector should be an instance of CardSelector');
                done();
            });
            this.skill.open(result);
        });

        it('should register CardMenuView', function() {
            const viewRegisterSpy = this.sandbox.spy(jibo.face.views.creator, 'registerClass');
            this.skill.open(result);
            assert(viewRegisterSpy.calledWithExactly(CardMenuView), 'should register CardMenuView');
        });
    });

    describe('close', function() {
        it('should unregister CardMenuView', function(done) {
            const viewUnregisterSpy = this.sandbox.spy(jibo.face.views.creator, 'unregisterClass');
            this.skill.open(result);
            this.skill.close(() => {
                assert(viewUnregisterSpy.calledWithExactly('CardMenuView'), 'should unregister CardMenuView');
                done();
            });
        });

        it('should destroy and null out cardSelector', function(done) {
            assert.instanceOf(this.skill.cardSelector, CardSelector, 'cardSelector should be an instance of CardSelector');
            const destroySpy = this.sandbox.spy(this.skill.cardSelector, 'destroy');
            this.skill.open(result);
            this.skill.close(() => {
                assert(destroySpy.calledOnce, 'destroy() was not called');
                assert.isNull(this.skill.cardSelector, 'cardSelector should be null');
                done();
            });
        });

        it('should stop and destroy flow', function(done) {
            this.skill.open(result);
            assert.isOk(this.skill.flow, 'flow should exist');
            const stopDestroySpy = this.sandbox.spy(this.skill.flow, 'stopAndDestroy');
            this.skill.close(() => {
                assert(stopDestroySpy.calledOnce, 'flow.stopAndDestroy was not called');
                assert.isNull(this.skill.flow, 'flow should be null');
                done();
            });
        });
    });
});

describe('CardDisplay', function() {
    beforeEach(function() {
        jibo.face.views.creator.registerClass(CardMenuView);
        this.skill.cardDisplay = new CardDisplay(this.skill.log, this.skill.cardSelector);
    });

    describe('showCardMenu', function() {
        it('should create an ElementGroup for each of the 5 cards', function(done) {
            this.sandbox.stub(jibo.face.views, 'changeView', (...args) => {
                const len = 5;
                const componentConfigs = args[0].addView.componentConfigs[0].componentConfigs;
                assert.equal(componentConfigs.length, len, 'componentConfigs array length is not 5');
                for (let element of componentConfigs) {
                    assert.equal(element.type, 'ElementGroup', 'component is not an ElementGroup');
                }
                done();
            });
            this.skill.cardDisplay.showCardMenu();
        });
    });
});

describe('CardSelector', function() {
    it('should get a new set of 5 cards', function() {
        const cards = this.skill.cardSelector.cards;
        const len = 5;
        assert.equal(cards.length, len, 'card array length is not 5');
        for (let card of cards) {
            const props = [
                card.speech,
                card.text,
                card.id,
                card.background,
                card.categoryName,
                card.categoryId
            ];
            assert.instanceOf(card, CardData, 'card is not CardData instance');
            for (let prop of props) {
                assert.isOk(prop, `${card.id} is not OK`);
            }
        }
    });

    it('should have unique IDs for all cards in each category', function(){
        let duplicateIDs = [];
        for(let category of this.skill.cardSelector._categories){
            let ids = [];
            for(let card of category.cards){
                if(ids.includes(card.id)){
                    duplicateIDs.push(card.id)
                }
                else{
                    ids.push(card.id);
                }
            }
        }
        assert.lengthOf(duplicateIDs, 0, 'Duplicate IDs detected: ' + duplicateIDs.toString());
    });

    it('should have complete data for all possible cards', function(){
        for(let category of this.skill.cardSelector._categories){
            for(let card of category.cards){
                const props = [
                    card.speech,
                    card.text,
                    card._text,
                    card.id,
                    card.background,
                    card._background,
                    card.categoryName,
                    card.categoryId
                ];
                assert.instanceOf(card, CardData, 'card is not CardData instance');
                for (let prop of props) {
                    assert.isAbove(prop.length, 0, `${card.id} is missing data`);
                }
            }
        }
    });
});
 
describe('flow', function () {
    it('view should be eyeView', function (done) {
        this.flow.when()
            .activityName('Prompts setup,Parse intent')
            .do((activity, notepad, blackboard) => {
                process.nextTick(() =>{
                    TestUtils.assertAndFinish(done, () => {
                        assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view is not eye view')
                        TestUtils.assertEachExecuted(this.flow);
                    });
                });
            });

        this.skill.open(result);
    });

    it('should play FrustratedIntro.mim and not CuriousIntro.mim if intent is frustrated', function (done) {
        this.flow.when()
            .activityName('Frustrated intro')
            .do((activity, notepad, blackboard) => {
                process.nextTick(() =>{
                    TestUtils.assertAndFinish(done, () => {
                        TestUtils.assertEachExecuted(this.flow);
                        assert(!this.flow.didExecuteActivity('Curious intro'));
                    });
                });
            });

        this.skill.open(frustratedResult);
    });

    it('should play CuriousIntro.mim if intent is whatCanIDo', function (done) {
        this.flow.when()
            .activityName('Curious intro')
            .do((activity, notepad, blackboard) => {
                process.nextTick(() =>{
                    TestUtils.assertAndFinish(done, () => {
                        TestUtils.assertEachExecuted(this.flow);
                        assert(!this.flow.didExecuteActivity('Frustrated intro'));
                    });
                });
            });

        this.skill.open(result);
    });

});
