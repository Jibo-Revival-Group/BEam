(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;

    lib.HeartBtn = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 2,
            labels: {
                notfavorite: 0,
                favorite: 1
            }
        });
        var instance1 = new Sprite(fromFrame("HeartOutline"));
        var instance2 = new Sprite(fromFrame("HeartFill"))
            .setTransform(-1, -1);
        this.addTimedChild(instance1, 0, 1)
            .addTimedChild(instance2, 1, 1)
            .addAction(function () {
                this.stop();
            }, 0)
            .addAction(function () {
                this.stop();
            }, 1);
    });

    lib.FollowUp = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 1,
            framerate: 30
        });
        var instance2 = this.heartBtn = new lib.HeartBtn()
            .setTransform(290, 73);
        var instance1 = new Sprite(fromFrame("Screen Shot 2016-11-07 at 7.18.16 PM"))
            .setTransform(1390, 235);
        this.addChild(instance2, instance1);
    });

    lib.FollowUp.assets = {
        "FollowUp_atlas_1": "images/FollowUp_atlas_1.json",
        "FollowUp_atlas_2": "images/FollowUp_atlas_2.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.FollowUp,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 1,
        library: lib
    };
}