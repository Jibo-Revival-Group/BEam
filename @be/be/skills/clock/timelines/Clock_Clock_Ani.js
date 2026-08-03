(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 53, loop: false });
        var instance1 = new Sprite(fromFrame("Clock_Cover_Middle1"))
            .setTransform(-25.6, -25.7, 0.877, 0.877);
        this.addTimedChild(instance1);
    });

    var Graphic2 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 53, loop: false });
        var instance1 = new Sprite(fromFrame("Clock_Body1"));
        this.addTimedChild(instance1);
    });

    lib.Clock_SecondHand = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("Clock_SecondHand1"))
            .setTransform(-2.6, -205.3);
        this.addChild(instance1);
    });

    lib.Clock_MinuteHand = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("Clock_MinuteHand1"))
            .setTransform(-12.6, -215.45, 0.877, 0.877);
        this.addChild(instance1);
    });

    lib.Clock_HourHand = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("Clock_HourHand1"))
            .setTransform(-13.2, -157.5, 0.877, 0.877);
        this.addChild(instance1);
    });

    lib.Clock_Clock_Ani = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 53,
            framerate: 30,
            loop: false,
            labels: {
                clock_in: 0,
                second: 13,
                minute: 17,
                hour: 21,
                menu_trans: 34,
                menu_trans_stop: 35,
                clock_in_stop: 36,
                clock_tick: 37,
                clock_out: 38,
                hands_out: 39,
                hands_out_stop: 51,
                clock_out_stop: 52
            }
        });
        var instance2 = new Graphic2(MovieClip.SYNCHED)
            .setTransform(355.7, 76.25);
        var instance5 = new lib.Clock_HourHand()
            .setTransform(640, 360);
        this[instance5.name = "hourHand"] = instance5;
        var instance4 = new lib.Clock_MinuteHand()
            .setTransform(640, 360);
        this[instance4.name = "minuteHand"] = instance4;
        var instance3 = new lib.Clock_SecondHand()
            .setTransform(640, 360);
        this[instance3.name = "secondHand"] = instance3;
        var instance1 = new Graphic1(MovieClip.SYNCHED)
            .setTransform(640.15, 359.4);
        this.addTimedChild(instance2)
            .addTimedChild(instance5, 21, 32)
            .addTimedChild(instance4, 17, 36)
            .addTimedChild(instance3, 13, 40)
            .addTimedChild(instance1);
    });

    lib.Clock_Clock_Ani.assets = {
        "Clock_Clock_Ani_atlas_1": "images/Clock_Clock_Ani_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.Clock_Clock_Ani,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 53,
        library: lib
    };
}