(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;

    lib.hand = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("swipe-hand"));
        this.addChild(instance1);
    });

    lib.fade = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("swipe-fade"));
        this.addChild(instance1);
    });

    lib.swipe = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 39,
            framerate: 24
        });
        var instance2 = new lib.fade();
        var instance1 = new lib.hand();
        this.addTimedChild(instance2, 0, 19, {
                "0": {
                    x: 637.75,
                    y: 70.6,
                    sx: 0.035,
                    r: 1.571
                },
                "1": {
                    y: 85.654,
                    sx: 0.198
                },
                "2": {
                    y: 99.339,
                    sx: 0.348
                },
                "3": {
                    y: 111.792,
                    sx: 0.483
                },
                "4": {
                    x: 637.8,
                    y: 122.865,
                    sx: 0.604
                },
                "5": {
                    y: 132.667,
                    sx: 0.71
                },
                "6": {
                    y: 141.189,
                    sx: 0.803
                },
                "7": {
                    y: 148.378,
                    sx: 0.881
                },
                "8": {
                    y: 154.236,
                    sx: 0.945
                },
                "9": {
                    y: 158.774,
                    sx: 0.995
                },
                "10": {
                    y: 162.032,
                    sx: 1.03
                },
                "11": {
                    y: 163.989,
                    sx: 1.052
                },
                "12": {
                    y: 165.55,
                    sx: 1.059
                }
            })
            .addTimedChild(instance1, 0, 39, {
                "0": {
                    x: 605.2,
                    y: 61.7,
                    sx: 0.8,
                    sy: 0.8
                },
                "1": {
                    x: 605.241,
                    y: 121.599
                },
                "2": {
                    x: 605.2,
                    y: 176.25
                },
                "3": {
                    y: 225.75
                },
                "4": {
                    y: 270
                },
                "5": {
                    y: 309.05
                },
                "6": {
                    x: 605.219,
                    y: 342.902
                },
                "7": {
                    y: 371.552
                },
                "8": {
                    y: 395.002
                },
                "9": {
                    y: 413.202
                },
                "10": {
                    y: 426.252
                },
                "11": {
                    y: 434.052
                },
                "12": {
                    x: 605.2,
                    y: 436.7
                },
                "19": {
                    x: 605.587,
                    y: 432.902,
                    sx: 0.805,
                    sy: 0.805
                },
                "20": {
                    x: 606.734,
                    y: 421.385,
                    sx: 0.819,
                    sy: 0.819
                },
                "21": {
                    x: 608.615,
                    y: 402.179,
                    sx: 0.842,
                    sy: 0.842
                },
                "22": {
                    x: 611.278,
                    y: 375.334,
                    sx: 0.875,
                    sy: 0.875
                },
                "23": {
                    x: 614.634,
                    y: 340.806,
                    sx: 0.917,
                    sy: 0.917
                },
                "24": {
                    x: 618.791,
                    y: 298.603,
                    sx: 0.969,
                    sy: 0.969
                },
                "25": {
                    x: 623.631,
                    y: 248.711,
                    sx: 1.03,
                    sy: 1.03
                },
                "26": {
                    x: 629.3,
                    y: 191.1,
                    sx: 1.1,
                    sy: 1.1
                },
                "27": {
                    x: 624.166,
                    y: 160.832,
                    sx: 1.03,
                    sy: 1.03
                },
                "28": {
                    x: 619.61,
                    y: 134.497,
                    sx: 0.969,
                    sy: 0.969
                },
                "29": {
                    x: 615.861,
                    y: 112.289,
                    sx: 0.917,
                    sy: 0.917
                },
                "30": {
                    x: 612.78,
                    y: 94.112,
                    sx: 0.875,
                    sy: 0.875
                },
                "31": {
                    x: 610.308,
                    y: 79.961,
                    sx: 0.842,
                    sy: 0.842
                },
                "32": {
                    x: 608.603,
                    y: 69.84,
                    sx: 0.819,
                    sy: 0.819
                },
                "33": {
                    x: 607.556,
                    y: 63.747,
                    sx: 0.805,
                    sy: 0.805
                },
                "34": {
                    x: 607.2,
                    y: 61.75,
                    sx: 0.8,
                    sy: 0.8
                }
            });
    });

    lib.swipe.assets = {
        "swipe_atlas_1": "images/swipe_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.swipe,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 24,
        totalFrames: 39,
        library: lib
    };
}