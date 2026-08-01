(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Graphics = PIXI.Graphics;
    var shapes = PIXI.animate.ShapesCache;

    lib.IngredientsTitle = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("IngredientsTitleImg"));
        this.addChild(instance1);
    });

    lib.IngredientsButton = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 3,
            labels: {
                close: 0,
                up: 1,
                down: 2
            }
        });
        var instance2 = new Sprite(fromFrame("YellowCircle"));
        var instance1 = new Sprite(fromFrame("IngredientsCloseBtn"));
        var instance3 = new Sprite(fromFrame("IngredientsButtonUp"));
        var instance4 = new Sprite(fromFrame("IngredientsButtonDown"))
            .setTransform(16, 24);
        this.addTimedChild(instance2)
            .addTimedChild(instance1, 0, 1, {
                "0": {
                    x: 18,
                    y: 18
                }
            })
            .addTimedChild(instance3, 1, 1, {
                "1": {
                    x: 16,
                    y: 18
                }
            })
            .addTimedChild(instance4, 2, 1)
            .addAction(function () {
                this.stop();
            }, 0)
            .addAction(function () {
                this.stop();
            }, 1)
            .addAction(function () {
                this.stop();
            }, 2);
    });

    lib.MakeIt_btn = Container.extend(function () {
        Container.call(this);
        var instance2 = new Sprite(fromFrame("MakeItBtn"));
        var instance1 = new Sprite(fromFrame("MakeItTxt"))
            .setTransform(0, 16);
        this.addChild(instance2, instance1);
    });

    lib.EdgeFadeClip = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("EdgeFade"));
        this.addChild(instance1);
    });

    lib.Ingredients = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 1,
            framerate: 30
        });
        var instance7 = new Graphics()
            .drawCommands(shapes.Ingredients[0])
            .setTransform(-60, -30);
        var instance6 = this.edgeFadeClip = new lib.EdgeFadeClip();
        var instance5 = this.makeItBtn = new lib.MakeIt_btn()
            .setTransform(490, 960);
        var instance4 = this.closeBtn = new lib.IngredientsButton()
            .setTransform(1300, 40);
        var instance3 = this.downBtn = new lib.IngredientsButton()
            .setTransform(1120, 900);
        var instance2 = this.upBtn = new lib.IngredientsButton()
            .setTransform(1020, 900);
        var instance1 = this.ingredientsTitle = new lib.IngredientsTitle()
            .setTransform(80, 40);
        this.addChild(instance7, instance6, instance5, instance4, instance3, instance2, instance1);
    });

    lib.Ingredients.assets = {
        "EdgeFade": "images/EdgeFade.png",
        "Ingredients": "images/Ingredients.shapes.json",
        "Ingredients_atlas_1": "images/Ingredients_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.Ingredients,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 1,
        library: lib
    };
}