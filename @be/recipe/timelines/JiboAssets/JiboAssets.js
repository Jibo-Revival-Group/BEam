(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;

    lib.TitleScreen = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 6,
            labels: {
                recipeSelection: 0,
                guidedRecipe: 1,
                videoOverview: 2,
                ingredients: 3,
                followUp: 4,
                takePhoto: 5
            }
        });
        var instance1 = new Sprite(fromFrame("Flow-RecipeSelection"));
        var instance2 = new Sprite(fromFrame("Flow-GuidedRecipe"));
        var instance3 = new Sprite(fromFrame("Flow-VideoOverview"));
        var instance4 = new Sprite(fromFrame("Flow-Ingredients"));
        var instance5 = new Sprite(fromFrame("Flow-FollowUp"));
        var instance6 = new Sprite(fromFrame("Flow-TakePhoto"));
        this.addTimedChild(instance1, 0, 1)
            .addTimedChild(instance2, 1, 1)
            .addTimedChild(instance3, 2, 1)
            .addTimedChild(instance4, 3, 1)
            .addTimedChild(instance5, 4, 1)
            .addTimedChild(instance6, 5, 1)
            .addAction(function () {
                this.stop();
            }, 0);
    });

    lib.JiboAssets = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 1,
            framerate: 30
        });
        var instance1 = this.titleScreen = new lib.TitleScreen();
        this.addChild(instance1);
    });

    lib.JiboAssets.assets = {
        "Flow-RecipeSelection": "images/Flow-RecipeSelection.jpg",
        "Flow-GuidedRecipe": "images/Flow-GuidedRecipe.jpg",
        "Flow-VideoOverview": "images/Flow-VideoOverview.jpg",
        "Flow-Ingredients": "images/Flow-Ingredients.jpg",
        "Flow-FollowUp": "images/Flow-FollowUp.jpg",
        "Flow-TakePhoto": "images/Flow-TakePhoto.jpg"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.JiboAssets,
        background: 0xffffff,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 1,
        library: lib
    };
}