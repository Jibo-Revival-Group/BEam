(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 13, loop: false });
        var instance1 = new Sprite(fromFrame("checkmark-highlight2"))
            .setTransform(-177.15, -26.35);
        this.addTimedChild(instance1);
    });

    var Graphic2 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 13, loop: false });
        var instance1 = new Sprite(fromFrame("checkmark-highlight1"))
            .setTransform(-306.5, 81.15);
        this.addTimedChild(instance1);
    });

    var Graphic3 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("checkmark-small1"))
            .setTransform(-139.9, -40);
        this.addTimedChild(instance1);
    });

    var Graphic4 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 20, loop: false });
        var instance1 = new Sprite(fromFrame("checkmark-big1"))
            .setTransform(-317.35, -54.15);
        this.addTimedChild(instance1);
    });

    var Graphic5 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance2 = new Graphic4(MovieClip.SYNCHED);
        var instance1 = new Graphic3(MovieClip.SYNCHED);
        var instance4 = new Graphic2(MovieClip.SYNCHED);
        var instance3 = new Graphic1(MovieClip.SYNCHED);
        this.addTimedChild(instance2, 3, 20, {
                "3": {
                    x: -82.15,
                    y: 173.95,
                    sx: 0.126,
                    sy: 0.912,
                    r: -0.785,
                    c: [
                        0,
                        0.31,
                        0,
                        0.63,
                        0,
                        0.18
                    ]
                },
                "4": {
                    x: -45.2,
                    y: 136.75,
                    sx: 0.304,
                    sy: 0.929,
                    c: [
                        0.18,
                        0.25,
                        0.18,
                        0.51,
                        0.18,
                        0.15
                    ]
                },
                "5": {
                    x: 17.1,
                    y: 73.95,
                    sx: 0.605,
                    sy: 0.959,
                    c: [
                        0.35,
                        0.2,
                        0.35,
                        0.41,
                        0.35,
                        0.11
                    ]
                },
                "6": {
                    x: 104.8,
                    y: -14.3,
                    sx: 1.029,
                    sy: 1,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "7": {
                    x: 104.25,
                    y: -13.75,
                    sx: 1.026
                },
                "8": {
                    x: 102.1,
                    y: -11.6,
                    sx: 1.017
                },
                "9": {
                    x: 98.5,
                    y: -8,
                    sx: 1.001
                },
                "10": {
                    x: 95.8,
                    y: -5.3,
                    sx: 0.989
                },
                "11": {
                    x: 95.05,
                    y: -4.55,
                    sx: 0.985
                }
            })
            .addTimedChild(instance1, 0, 23, {
                "0": {
                    x: -258.35,
                    y: 33.6,
                    sx: 0.186,
                    sy: 0.663,
                    r: 0.785,
                    c: [
                        0,
                        0.48,
                        0,
                        0.85,
                        0,
                        0.23
                    ]
                },
                "1": {
                    x: -247.15,
                    y: 44.75,
                    sx: 0.32,
                    sy: 0.719
                },
                "2": {
                    x: -207.85,
                    y: 84.1,
                    sx: 0.79,
                    sy: 0.913,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "3": {
                    x: -190.25,
                    y: 101.7,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance4, 10, 13, {
                "10": {
                    x: 14.55,
                    y: 136.6,
                    r: 0.785,
                    a: 0
                },
                "11": {
                    x: 14.6,
                    y: 136.596,
                    a: 0.13
                },
                "12": {
                    a: 0.25
                },
                "13": {
                    x: 14.55,
                    y: 136.6,
                    a: 1
                }
            })
            .addTimedChild(instance3, 10, 13, {
                "10": {
                    x: 29.25,
                    y: 26.25,
                    r: -0.785,
                    a: 0
                },
                "11": {
                    x: 29.249,
                    y: 26.249,
                    a: 0.13
                },
                "12": {
                    a: 0.25
                },
                "13": {
                    x: 29.25,
                    y: 26.25,
                    a: 1
                }
            });
    });

    lib.emoji_check = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 24,
            framerate: 30
        });
        var instance1 = new Graphic5(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 23, {
            "0": {
                x: 639.95,
                y: 359.95,
                sx: 1,
                sy: 1
            },
            "14": {
                x: 639.948,
                y: 359.948,
                sx: 0.992,
                sy: 1.007
            },
            "15": {
                x: 639.945,
                y: 359.932,
                sx: 0.958,
                sy: 1.036
            },
            "16": {
                x: 639.958,
                y: 359.974,
                sx: 0.896,
                sy: 1.091
            },
            "17": {
                x: 639.934,
                y: 359.965,
                sx: 0.853,
                sy: 1.128
            },
            "18": {
                x: 639.95,
                y: 359.95,
                sx: 0.843,
                sy: 1.137
            },
            "19": {
                x: 639.975,
                y: 359.939,
                sy: 1.044
            },
            "20": {
                x: 639.962,
                y: 359.916,
                sx: 0.844,
                sy: 0.65
            },
            "21": {
                x: 639.965,
                y: 359.945,
                sx: 0.846,
                sy: 0.186
            },
            "22": {
                x: 639.95,
                y: 359.95,
                sy: 0.067
            }
        });
    });

    lib.emoji_check.assets = {
        "emoji_check_atlas_1": "images/emoji_check_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.emoji_check,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 24,
        library: lib
    };
}