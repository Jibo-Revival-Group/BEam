(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;

    lib.hand = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("tap-hand"))
            .setTransform(-20, 20, 1.25, 1.25);
        this.addChild(instance1);
    });

    lib.ripple = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("tap-ring"))
            .setTransform(-41, -41);
        this.addChild(instance1);
    });

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 5, loop: false });
        var instance1 = new Sprite(fromFrame("tap-ring"))
            .setTransform(-41, -41);
        this.addTimedChild(instance1);
    });

    lib.tap = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 26,
            framerate: 24
        });
        var instance2 = new lib.ripple();
        var instance3 = new Graphic1(MovieClip.SYNCHED)
            .setTransform(125.05, 121, 2.147, 2.147)
            .setAlpha(0);
        var instance1 = new lib.hand();
        this.addTimedChild(instance2, 10, 11, {
                "10": {
                    x: 105.05,
                    y: 106,
                    sx: 0.4,
                    sy: 0.4,
                    a: 1
                },
                "11": {
                    x: 105.076,
                    y: 105.921,
                    sx: 0.671,
                    sy: 0.671
                },
                "12": {
                    x: 104.957,
                    y: 105.846,
                    sx: 0.943,
                    sy: 0.943
                },
                "13": {
                    x: 105.05,
                    y: 106,
                    sx: 1.214,
                    sy: 1.214
                },
                "14": {
                    x: 107.642,
                    y: 108.083,
                    sx: 1.331,
                    sy: 1.331,
                    a: 0.88
                },
                "15": {
                    x: 110.187,
                    y: 110.12,
                    sx: 1.447,
                    sy: 1.447,
                    a: 0.75
                },
                "16": {
                    x: 112.731,
                    y: 112.205,
                    sx: 1.564,
                    sy: 1.564,
                    a: 0.63
                },
                "17": {
                    x: 115.275,
                    y: 114.24,
                    sx: 1.681,
                    sy: 1.681,
                    a: 0.5
                },
                "18": {
                    x: 117.82,
                    y: 116.276,
                    sx: 1.797,
                    sy: 1.797,
                    a: 0.38
                },
                "19": {
                    x: 120.364,
                    y: 118.311,
                    sx: 1.914,
                    sy: 1.914,
                    a: 0.25
                },
                "20": {
                    x: 122.857,
                    y: 120.396,
                    sx: 2.031,
                    sy: 2.031,
                    a: 0.13
                }
            })
            .addTimedChild(instance3, 21, 5)
            .addTimedChild(instance1, 0, 26, {
                "0": {
                    x: 104.45,
                    y: 71.95,
                    sx: 0.8,
                    sy: 0.8,
                    r: 0
                },
                "1": {
                    x: 118.497,
                    y: 79.901,
                    sx: 0.919,
                    sy: 0.919,
                    r: -0.01
                },
                "2": {
                    x: 128.227,
                    y: 87.139,
                    sx: 1.011,
                    sy: 1.011,
                    r: -0.022
                },
                "3": {
                    x: 135.741,
                    y: 91.906,
                    sx: 1.077,
                    sy: 1.077,
                    r: -0.027
                },
                "4": {
                    x: 139.817,
                    y: 95.024,
                    sx: 1.117,
                    sy: 1.117,
                    r: -0.032
                },
                "5": {
                    x: 140.35,
                    y: 96.55,
                    sx: 1.13,
                    sy: 1.13,
                    r: -0.036
                },
                "6": {
                    x: 128.09,
                    y: 87.114,
                    sx: 1.011,
                    sy: 1.011,
                    r: -0.022
                },
                "7": {
                    x: 118.385,
                    y: 79.904,
                    sx: 0.919,
                    sy: 0.919,
                    r: -0.01
                },
                "8": {
                    x: 110.608,
                    y: 75.53,
                    sx: 0.853,
                    sy: 0.853,
                    r: -0.005
                },
                "9": {
                    x: 106.083,
                    y: 72.727,
                    sx: 0.813,
                    sy: 0.813,
                    r: 0
                },
                "10": {
                    x: 104.45,
                    y: 71.95,
                    sx: 0.8,
                    sy: 0.8
                }
            });
    });

    lib.tap.assets = {
        "tap_atlas_1": "images/tap_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.tap,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 24,
        totalFrames: 26,
        library: lib
    };
}