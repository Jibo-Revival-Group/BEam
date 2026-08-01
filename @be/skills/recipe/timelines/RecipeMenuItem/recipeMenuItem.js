(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Text = PIXI.Text;
    var Graphics = PIXI.Graphics;
    var shapes = PIXI.animate.ShapesCache;

    lib.RecipeCardBorder = Container.extend(function () {
        Container.call(this);
        var instance1 = new Graphics()
            .drawCommands(shapes.recipeMenuItem[0]);
        this.addChild(instance1);
    });

    lib.RecipeImage = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 10,
            labels: {
                barbecuedbeef: 0,
                beefbulgogi: 1,
                chickencordonbleuii: 2,
                chickenpotpieix: 3,
                dessertcrepes: 4,
                fishchowder: 5,
                fishtacos: 6,
                spinachenchiladas: 7,
                tiramisuii: 8,
                vegetariankalesoup: 9
            }
        });
        var instance1 = new Sprite(fromFrame("barbecuedbeef"));
        var instance2 = new Sprite(fromFrame("beefbulgogi"));
        var instance3 = new Sprite(fromFrame("chickencordonbleuii"));
        var instance4 = new Sprite(fromFrame("chickenpotpieix"));
        var instance5 = new Sprite(fromFrame("dessertcrepes"));
        var instance6 = new Sprite(fromFrame("fishchowder"));
        var instance7 = new Sprite(fromFrame("fishtacos"));
        var instance8 = new Sprite(fromFrame("spinachenchiladas"));
        var instance9 = new Sprite(fromFrame("tiramisull"));
        var instance10 = new Sprite(fromFrame("vegetariankalesoup"))
            .setTransform(38, 38, 1.24, 1.24);
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: 38,
                    y: 38,
                    sx: 1.24,
                    sy: 1.24
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: 38,
                    y: 38,
                    sx: 1.24,
                    sy: 1.24
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: 38,
                    y: 38,
                    sx: 1.24,
                    sy: 1.24
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: 38,
                    y: 38,
                    sx: 1.24,
                    sy: 1.24
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: 38,
                    y: 38,
                    sx: 1.24,
                    sy: 1.24
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: 38,
                    y: 38,
                    sx: 1.24,
                    sy: 1.24
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: 38,
                    y: 38,
                    sx: 1.24,
                    sy: 1.24
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: 38,
                    y: 38,
                    sx: 1.24,
                    sy: 1.24
                }
            })
            .addTimedChild(instance9, 8, 1, {
                "8": {
                    x: 38,
                    y: 38,
                    sx: 1.24,
                    sy: 1.24
                }
            })
            .addTimedChild(instance10, 9, 1);
    });

    lib.IconTime = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("IconTimeImg"));
        this.addChild(instance1);
    });

    lib.IconServing = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("IconServingImg"));
        this.addChild(instance1);
    });

    lib.Star = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 2,
            labels: {
                starfull: 0,
                starEmpty: 1,
                starempty: 1
            }
        });
        var instance1 = new Sprite(fromFrame("StarFull"));
        var instance2 = new Sprite(fromFrame("StarEmpty"))
            .setTransform(-2, -2);
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: -2,
                    y: -2
                }
            })
            .addTimedChild(instance2, 1, 1)
            .addAction(function () {
                this.stop();
            }, 0)
            .addAction(function () {
                this.stop();
            }, 1);
    });

    lib.Rating = Container.extend(function () {
        Container.call(this);
        var instance5 = this.rating1 = new lib.Star();
        var instance4 = this.rating2 = new lib.Star()
            .setTransform(59.5);
        var instance3 = this.rating3 = new lib.Star()
            .setTransform(119);
        var instance2 = this.rating4 = new lib.Star()
            .setTransform(178.5);
        var instance1 = this.rating5 = new lib.Star()
            .setTransform(238);
        this.addChild(instance5, instance4, instance3, instance2, instance1);
    });

    lib.recipeMenuItem_mc = Container.extend(function () {
        Container.call(this);
        var instance2 = new Graphics()
            .drawCommands(shapes.recipeMenuItem[1])
            .setRenderable(false);
        var instance10 = this.title_txt = new Text("Chicken Pot Pie IX")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 140,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setTransform(380, 36);
        var instance9 = this.reviews_txt = new Text("7444 Reviews")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 30,
                fontWeight: "bold",
                fill: "#fff",
                letterSpacing: 2
            })
            .setAlign("center")
            .setTransform(193, 434);
        var instance8 = this.ratingFull = new lib.Rating()
            .setTransform(53, 380);
        var instance7 = this.serving_txt = new Text("8 Servings")
            .setStyle({
                fontFamily: "Proxima Nova Light",
                fontSize: 45,
                fill: "#fff",
                letterSpacing: 2
            })
            .setTransform(727, 316);
        var instance6 = this.iconServing = new lib.IconServing()
            .setTransform(647, 314);
        var instance5 = this.totalTime_txt = new Text("1h 10m")
            .setStyle({
                fontFamily: "Proxima Nova Light",
                fontSize: 45,
                fill: "#fff",
                letterSpacing: 2
            })
            .setTransform(454, 316);
        var instance4 = this.iconTime = new lib.IconTime()
            .setTransform(382, 314);
        var instance3 = this.recipeImage = new lib.RecipeImage()
            .setTransform(0, -13)
            .setMask(instance2);
        var instance1 = new lib.RecipeCardBorder()
            .setTransform(4, 4);
        this.addChild(instance2, instance10, instance9, instance8, instance7, instance6, instance5, instance4, instance3, instance1);
    });

    lib.recipeMenuItem = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 1,
            framerate: 30,
            loop: false
        });
        var instance1 = this.recipeMenuItem = new lib.recipeMenuItem_mc();
        this.addChild(instance1);
    });

    lib.recipeMenuItem.assets = {
        "barbecuedbeef": "images/barbecuedbeef.jpg",
        "beefbulgogi": "images/beefbulgogi.jpg",
        "chickencordonbleuii": "images/chickencordonbleuii.jpg",
        "chickenpotpieix": "images/chickenpotpieix.jpg",
        "dessertcrepes": "images/dessertcrepes.jpg",
        "fishchowder": "images/fishchowder.jpg",
        "fishtacos": "images/fishtacos.jpg",
        "spinachenchiladas": "images/spinachenchiladas.jpg",
        "tiramisull": "images/tiramisull.jpg",
        "vegetariankalesoup": "images/vegetariankalesoup.jpg",
        "IconTimeImg": "images/IconTimeImg.png",
        "IconServingImg": "images/IconServingImg.png",
        "StarFull": "images/StarFull.png",
        "StarEmpty": "images/StarEmpty.png",
        "recipeMenuItem": "images/recipeMenuItem.shapes.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.recipeMenuItem,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 1,
        library: lib
    };
}