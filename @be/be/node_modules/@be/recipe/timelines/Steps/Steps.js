(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Text = PIXI.Text;

    lib.StepsTitle = Container.extend(function () {
        Container.call(this);
        var instance1 = this.header = new Text("Step")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 75,
                fontWeight: "bold",
                fill: "#feaa26",
                letterSpacing: 2
            })
            .setTransform(2, 2);
        this.addChild(instance1);
    });

    lib.FinishedBtn = Container.extend(function () {
        Container.call(this);
        var instance2 = new Sprite(fromFrame("OrangeBtnBg"));
        var instance1 = new Sprite(fromFrame("FinishedBtnTxt"))
            .setTransform(0, 16);
        this.addChild(instance2, instance1);
    });

    lib.PreviousBtn = Container.extend(function () {
        Container.call(this);
        var instance2 = new Sprite(fromFrame("YellowBtnBg"));
        var instance1 = new Sprite(fromFrame("PreviousBtnTxt"))
            .setTransform(0, 16);
        this.addChild(instance2, instance1);
    });

    lib.PlayVideoBtn = Container.extend(function () {
        Container.call(this);
        var instance2 = new Sprite(fromFrame("YellowBtnBg"));
        var instance1 = new Sprite(fromFrame("PlayVideoTxt"))
            .setTransform(0, 16);
        this.addChild(instance2, instance1);
    });

    lib.NextBtn = Container.extend(function () {
        Container.call(this);
        var instance2 = new Sprite(fromFrame("OrangeBtnBg"));
        var instance1 = new Sprite(fromFrame("NextBtnTxt"))
            .setTransform(0, 16);
        this.addChild(instance2, instance1);
    });

    lib.Steps = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 1,
            framerate: 30
        });
        var instance6 = this.nextBtn = new lib.NextBtn()
            .setTransform(810, 950);
        var instance5 = this.playVideoBtn = new lib.PlayVideoBtn()
            .setTransform(490, 950);
        var instance4 = this.prevBtn = new lib.PreviousBtn()
            .setTransform(170, 950);
        var instance3 = this.finishedBtn = new lib.FinishedBtn()
            .setTransform(810, 1070);
        var instance2 = this.stepNumber_txt = new Text("- of -")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 75,
                fontWeight: "bold",
                fill: "#feaa26",
                letterSpacing: 2
            })
            .setTransform(274.85, 42);
        var instance1 = this.stepsTitle = new lib.StepsTitle()
            .setTransform(80, 40);
        this.addChild(instance6, instance5, instance4, instance3, instance2, instance1);
    });

    lib.Steps.assets = {
        "Steps_atlas_1": "images/Steps_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.Steps,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 1,
        library: lib
    };
}