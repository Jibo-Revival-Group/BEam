(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Text = PIXI.Text;
    var Graphics = PIXI.Graphics;
    var shapes = PIXI.animate.ShapesCache;

    lib.NextArrow = Container.extend(function () {
        Container.call(this);
        var instance2 = new Graphics()
            .drawCommands(shapes.RecipeCard[1]);
        var instance1 = new Graphics()
            .drawCommands(shapes.RecipeCard[0]);
        this.addChild(instance2, instance1);
    });

    lib.RecipeCardClip = Container.extend(function () {
        Container.call(this);
        var instance9 = new Graphics()
            .drawCommands(shapes.RecipeCard[1])
            .setTransform(32.35, 16.45, 29.392, 10.271);
        var instance8 = this.title_txt = new Text("xChicken Pot Pie IX")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 135,
                fontWeight: "bold",
                
                fill: "#fff"
            })
            .setTransform(448.1, 129.05);
        var instance7 = this.reviews_txt = new Text("7444 Reviews")
            .setStyle({
                fontFamily: "Proxima Nova Soft Medium",
                fontSize: 29,
                fill: "#fff"
            })
            .setTransform(174.1, 495.5);
        var instance6 = this.madeit_txt = new Text("11K Made It")
            .setStyle({
                fontFamily: "Proxima Nova Soft Medium",
                fontSize: 29,
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(264.3, 527.1);
        var instance5 = this.recipeBy_txt = new Text("Recipe By:")
            .setStyle({
                fontFamily: "Proxima Nova Soft Medium",
                fontSize: 29,
                fill: "#ccc"
            })
            .setTransform(446.3, 459.5);
        var instance4 = this.serving_txt = new Text("8 Servings")
            .setStyle({
                fontFamily: "Proxima Nova Soft Medium",
                fontSize: 40,
                fill: "#ccc"
            })
            .setTransform(729.15, 398.05);
        var instance3 = this.totalTime_txt = new Text("1h 10m")
            .setStyle({
                fontFamily: "Proxima Nova Soft Medium",
                fontSize: 40,
                fill: "#ccc"
            })
            .setTransform(510.05, 399.05);
        var instance2 = new Graphics()
            .drawCommands(shapes.RecipeCard[2]);
        var instance1 = this.nextArrow = new lib.NextArrow()
            .setTransform(1153.25, 326.05);
        this.addChild(instance9, instance8, instance7, instance6, instance5, instance4, instance3, instance2, instance1);
    });

    lib.RecipeCard = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 1,
            framerate: 30
        });
        var instance2 = new lib.RecipeCardClip()
            .setTransform(1289.9, 720);
        var instance1 = new Sprite(fromFrame("Screen Shot 2016-11-12 at 6.36.50 AM"))
            .setTransform(1654, 60);
        this.addChild(instance2, instance1);
    });

    lib.RecipeCard.assets = {
        "Screen Shot 2016-11-12 at 6.36.50 AM": "images/Screen Shot 2016-11-12 at 6.36.50 AM.png",
        "RecipeCard": "images/RecipeCard.shapes.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.RecipeCard,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 1,
        library: lib
    };
}
