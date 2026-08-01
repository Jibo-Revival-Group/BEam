(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Graphics = PIXI.Graphics;
    var shapes = PIXI.animate.ShapesCache;

    lib.SaveBtn = Container.extend(function () {
        Container.call(this);
        var instance2 = new Sprite(fromFrame("SaveBtnBg"));
        var instance1 = new Sprite(fromFrame("SaveBtnTxt"))
            .setTransform(0, 16);
        this.addChild(instance2, instance1);
    });

    lib.CloseBtn = Container.extend(function () {
        Container.call(this);
        var instance2 = new Sprite(fromFrame("YellowCircleBg"));
        var instance1 = new Sprite(fromFrame("CloseBtnX"))
            .setTransform(18, 18);
        this.addChild(instance2, instance1);
    });

    lib.RetakeBtn = Container.extend(function () {
        Container.call(this);
        var instance2 = new Sprite(fromFrame("RetakeBtnBg"));
        var instance1 = new Sprite(fromFrame("RetakeBtnTxt"))
            .setTransform(0, 16);
        this.addChild(instance2, instance1);
    });

    lib.Photo = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("PiePhoto"));
        this.addChild(instance1);
    });

    lib.TakePhoto = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 1,
            framerate: 30
        });
        var instance4 = new Graphics()
            .drawCommands(shapes.TakePhoto[0])
            .setRenderable(false);
        var instance5 = this.photoImg = new lib.Photo()
            .setMask(instance4);
        var instance3 = this.retakeBtn = new lib.RetakeBtn()
            .setTransform(330, 950);
        var instance2 = this.closeBtn = new lib.CloseBtn()
            .setTransform(1300, 40);
        var instance1 = this.saveBtn = new lib.SaveBtn()
            .setTransform(650, 950);
        this.addChild(instance4, instance5, instance3, instance2, instance1);
    });

    lib.TakePhoto.assets = {
        "PiePhoto": "images/PiePhoto.png",
        "TakePhoto": "images/TakePhoto.shapes.json",
        "TakePhoto_atlas_1": "images/TakePhoto_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.TakePhoto,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 1,
        library: lib
    };
}