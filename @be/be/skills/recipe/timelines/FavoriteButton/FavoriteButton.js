(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Graphics = PIXI.Graphics;
    var shapes = PIXI.animate.ShapesCache;

    lib.FavoriteButton = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 4,
            framerate: 30,
            labels: {
                up: 0,
                activate: 1,
                down: 2,
                out: 3
            }
        });
        var instance2 = new Graphics()
            .drawCommands(shapes.FavoriteButton[0]);
        var instance3 = new Graphics()
            .drawCommands(shapes.FavoriteButton[1]);
        var instance4 = new Graphics()
            .drawCommands(shapes.FavoriteButton[2]);
        var instance1 = new Sprite(fromFrame("favorite_btn"));
        this.addTimedChild(instance2, 1, 1)
            .addTimedChild(instance3, 2, 1)
            .addTimedChild(instance4, 3, 1)
            .addTimedChild(instance1);
    });

    lib.FavoriteButton.assets = {
        "favorite_btn": "images/favorite_btn.png",
        "FavoriteButton": "images/FavoriteButton.shapes.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.FavoriteButton,
        background: 0xffffff,
        width: 88,
        height: 74,
        framerate: 30,
        totalFrames: 4,
        library: lib
    };
}