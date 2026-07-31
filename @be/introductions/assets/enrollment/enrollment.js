(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Graphics = PIXI.Graphics;
    var shapes = PIXI.animate.ShapesCache;

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 99, loop: false });
        var instance1 = new Sprite(fromFrame("Name1"))
            .setTransform(-229.65, -102);
        this.addTimedChild(instance1);
    });

    var Graphic2 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 60, loop: false });
        var instance1 = new Sprite(fromFrame("NameCorrected1"));
        var instance2 = new Sprite(fromFrame("NameCorrected2"))
            .setTransform(-229.65, -102);
        this.addTimedChild(instance1, 0, 5, {
                "0": {
                    x: -229.65,
                    y: -102
                }
            })
            .addTimedChild(instance2, 5, 55);
    });

    var Graphic3 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("HeyJibo1"))
            .setTransform(-478.45, -102);
        this.addTimedChild(instance1);
    });

    var Graphic4 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 17, loop: false });
        var instance1 = new Sprite(fromFrame("party-popper-outside1"))
            .setTransform(-161.75, -142.05);
        this.addTimedChild(instance1);
    });

    var Graphic5 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti5"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic6 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic7 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic8 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic9 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic10 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti4"))
            .setTransform(-4.9, -2.35);
        this.addTimedChild(instance1);
    });

    var Graphic11 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic12 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti2"))
            .setTransform(-5.65, -6.85);
        this.addTimedChild(instance1);
    });

    var Graphic13 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti4"))
            .setTransform(-4.9, -2.35);
        this.addTimedChild(instance1);
    });

    var Graphic14 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic15 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic16 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic17 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic18 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti2"))
            .setTransform(-5.65, -6.85);
        this.addTimedChild(instance1);
    });

    var Graphic19 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti4"))
            .setTransform(-4.9, -2.35);
        this.addTimedChild(instance1);
    });

    var Graphic20 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic21 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic22 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic23 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti5"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic24 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic25 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance20 = new Graphic24(MovieClip.SYNCHED);
        var instance19 = new Graphic23(MovieClip.SYNCHED);
        var instance18 = new Graphic22(MovieClip.SYNCHED);
        var instance17 = new Graphic21(MovieClip.SYNCHED);
        var instance16 = new Graphic20(MovieClip.SYNCHED);
        var instance15 = new Graphic19(MovieClip.SYNCHED);
        var instance14 = new Graphic18(MovieClip.SYNCHED);
        var instance13 = new Graphic17(MovieClip.SYNCHED);
        var instance12 = new Graphic16(MovieClip.SYNCHED);
        var instance11 = new Graphic15(MovieClip.SYNCHED);
        var instance10 = new Graphic14(MovieClip.SYNCHED);
        var instance9 = new Graphic13(MovieClip.SYNCHED);
        var instance8 = new Graphic12(MovieClip.SYNCHED);
        var instance7 = new Graphic11(MovieClip.SYNCHED);
        var instance6 = new Graphic10(MovieClip.SYNCHED);
        var instance5 = new Graphic9(MovieClip.SYNCHED);
        var instance4 = new Graphic8(MovieClip.SYNCHED);
        var instance3 = new Graphic7(MovieClip.SYNCHED);
        var instance2 = new Graphic6(MovieClip.SYNCHED);
        var instance1 = new Graphic5(MovieClip.SYNCHED);
        this.addTimedChild(instance20, 0, 35, {
                "0": {
                    x: 181.283,
                    y: -20.441,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 265.393,
                    y: -58.447,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 321.4,
                    y: -83.8,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 328.138,
                    y: -86.322,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 334.911,
                    y: -88.962
                },
                "5": {
                    x: 341.624,
                    y: -91.555
                },
                "6": {
                    x: 348.338,
                    y: -94.037,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 355.112,
                    y: -96.627
                },
                "8": {
                    x: 361.88,
                    y: -99.216
                },
                "9": {
                    x: 368.6,
                    y: -101.75,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 368.733,
                    y: -101.057,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 369.183,
                    y: -98.807,
                    a: 0.99
                },
                "12": {
                    x: 369.933,
                    y: -94.907,
                    a: 0.98
                },
                "13": {
                    x: 371.033,
                    y: -89.207,
                    a: 0.96
                },
                "14": {
                    x: 372.533,
                    y: -81.607,
                    a: 0.95
                },
                "15": {
                    x: 374.433,
                    y: -71.857,
                    a: 0.92
                },
                "16": {
                    x: 376.783,
                    y: -59.907,
                    a: 0.89
                },
                "17": {
                    x: 379.583,
                    y: -45.607,
                    a: 0.85
                },
                "18": {
                    x: 382.883,
                    y: -28.857,
                    a: 0.8
                },
                "19": {
                    x: 386.633,
                    y: -9.707,
                    a: 0.75
                },
                "20": {
                    x: 390.833,
                    y: 11.743,
                    a: 0.7
                },
                "21": {
                    x: 395.433,
                    y: 35.193,
                    a: 0.63
                },
                "22": {
                    x: 400.383,
                    y: 60.193,
                    a: 0.56
                },
                "23": {
                    x: 405.433,
                    y: 86.093,
                    a: 0.5
                },
                "24": {
                    x: 410.533,
                    y: 112.093,
                    a: 0.43
                },
                "25": {
                    x: 415.533,
                    y: 137.443,
                    a: 0.36
                },
                "26": {
                    x: 420.233,
                    y: 161.343,
                    a: 0.29
                },
                "27": {
                    x: 424.533,
                    y: 183.243,
                    a: 0.23
                },
                "28": {
                    x: 428.333,
                    y: 202.743,
                    a: 0.18
                },
                "29": {
                    x: 431.633,
                    y: 219.643,
                    a: 0.14
                },
                "30": {
                    x: 434.433,
                    y: 233.893,
                    a: 0.1
                },
                "31": {
                    x: 436.733,
                    y: 245.543,
                    a: 0.07
                },
                "32": {
                    x: 438.533,
                    y: 254.693,
                    a: 0.04
                },
                "33": {
                    x: 439.883,
                    y: 261.543,
                    a: 0.02
                },
                "34": {
                    x: 440.783,
                    y: 266.193,
                    a: 0.01
                }
            })
            .addTimedChild(instance19, 0, 35, {
                "0": {
                    x: 203.56,
                    y: -5.612,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 260.141,
                    y: -26.656,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 297.85,
                    y: -40.65,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 302.755,
                    y: -42.04,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 307.625,
                    y: -43.418
                },
                "5": {
                    x: 312.536,
                    y: -44.799
                },
                "6": {
                    x: 317.398,
                    y: -46.271,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 322.268,
                    y: -47.7
                },
                "8": {
                    x: 327.134,
                    y: -49.077
                },
                "9": {
                    x: 332.05,
                    y: -50.5,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 332.204,
                    y: -49.752,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 332.654,
                    y: -47.452,
                    a: 0.99
                },
                "12": {
                    x: 333.454,
                    y: -43.452,
                    a: 0.98
                },
                "13": {
                    x: 334.604,
                    y: -37.552,
                    a: 0.96
                },
                "14": {
                    x: 336.154,
                    y: -29.652,
                    a: 0.95
                },
                "15": {
                    x: 338.154,
                    y: -19.652,
                    a: 0.92
                },
                "16": {
                    x: 340.604,
                    y: -7.252,
                    a: 0.89
                },
                "17": {
                    x: 343.554,
                    y: 7.498,
                    a: 0.85
                },
                "18": {
                    x: 346.954,
                    y: 24.798,
                    a: 0.8
                },
                "19": {
                    x: 350.854,
                    y: 44.598,
                    a: 0.75
                },
                "20": {
                    x: 355.254,
                    y: 66.748,
                    a: 0.7
                },
                "21": {
                    x: 360.054,
                    y: 90.998,
                    a: 0.63
                },
                "22": {
                    x: 365.154,
                    y: 116.848,
                    a: 0.56
                },
                "23": {
                    x: 370.454,
                    y: 143.598,
                    a: 0.5
                },
                "24": {
                    x: 375.754,
                    y: 170.498,
                    a: 0.43
                },
                "25": {
                    x: 380.954,
                    y: 196.648,
                    a: 0.36
                },
                "26": {
                    x: 385.854,
                    y: 221.348,
                    a: 0.29
                },
                "27": {
                    x: 390.304,
                    y: 243.998,
                    a: 0.23
                },
                "28": {
                    x: 394.304,
                    y: 264.148,
                    a: 0.18
                },
                "29": {
                    x: 397.754,
                    y: 281.648,
                    a: 0.14
                },
                "30": {
                    x: 400.654,
                    y: 296.348,
                    a: 0.1
                },
                "31": {
                    x: 403.054,
                    y: 308.398,
                    a: 0.07
                },
                "32": {
                    x: 404.954,
                    y: 317.848,
                    a: 0.04
                },
                "33": {
                    x: 406.304,
                    y: 324.898,
                    a: 0.02
                },
                "34": {
                    x: 407.304,
                    y: 329.748,
                    a: 0.01
                }
            })
            .addTimedChild(instance18, 0, 35, {
                "0": {
                    x: 124.65,
                    y: 3.75,
                    a: 1
                },
                "1": {
                    x: 170.9,
                    y: -1.6
                },
                "2": {
                    x: 201.7,
                    y: -5.2
                },
                "3": {
                    x: 205.9,
                    y: -5.55
                },
                "4": {
                    x: 210.1,
                    y: -5.95
                },
                "5": {
                    x: 214.3,
                    y: -6.3
                },
                "6": {
                    x: 218.45,
                    y: -6.65
                },
                "7": {
                    x: 222.65,
                    y: -7
                },
                "8": {
                    x: 226.85,
                    y: -7.4
                },
                "9": {
                    x: 231.05,
                    y: -7.75
                },
                "10": {
                    x: 231.15,
                    y: -7.2
                },
                "11": {
                    x: 231.55,
                    y: -5.5,
                    a: 0.99
                },
                "12": {
                    x: 232.2,
                    y: -2.5,
                    a: 0.98
                },
                "13": {
                    x: 233.2,
                    y: 1.85,
                    a: 0.96
                },
                "14": {
                    x: 234.5,
                    y: 7.7,
                    a: 0.95
                },
                "15": {
                    x: 236.15,
                    y: 15.15,
                    a: 0.92
                },
                "16": {
                    x: 238.2,
                    y: 24.3,
                    a: 0.89
                },
                "17": {
                    x: 240.65,
                    y: 35.25,
                    a: 0.85
                },
                "18": {
                    x: 243.5,
                    y: 48.05,
                    a: 0.8
                },
                "19": {
                    x: 246.8,
                    y: 62.7,
                    a: 0.75
                },
                "20": {
                    x: 250.45,
                    y: 79.15,
                    a: 0.7
                },
                "21": {
                    x: 254.5,
                    y: 97.1,
                    a: 0.63
                },
                "22": {
                    x: 258.75,
                    y: 116.2,
                    a: 0.56
                },
                "23": {
                    x: 263.2,
                    y: 136.05,
                    a: 0.5
                },
                "24": {
                    x: 267.65,
                    y: 155.95,
                    a: 0.43
                },
                "25": {
                    x: 271.95,
                    y: 175.35,
                    a: 0.36
                },
                "26": {
                    x: 276.05,
                    y: 193.65,
                    a: 0.29
                },
                "27": {
                    x: 279.8,
                    y: 210.45,
                    a: 0.23
                },
                "28": {
                    x: 283.15,
                    y: 225.35,
                    a: 0.18
                },
                "29": {
                    x: 286.05,
                    y: 238.3,
                    a: 0.14
                },
                "30": {
                    x: 288.45,
                    y: 249.2,
                    a: 0.1
                },
                "31": {
                    x: 290.45,
                    y: 258.15,
                    a: 0.07
                },
                "32": {
                    x: 292.05,
                    y: 265.15,
                    a: 0.04
                },
                "33": {
                    x: 293.2,
                    y: 270.35,
                    a: 0.02
                },
                "34": {
                    x: 294,
                    y: 273.95,
                    a: 0.01
                }
            })
            .addTimedChild(instance17, 0, 35, {
                "0": {
                    x: 181.647,
                    y: -34.374,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 246.642,
                    y: -93.184,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 290.05,
                    y: -132.45,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 295.498,
                    y: -136.416,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 300.961,
                    y: -140.366
                },
                "5": {
                    x: 306.413,
                    y: -144.367
                },
                "6": {
                    x: 311.869,
                    y: -148.308,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 317.281,
                    y: -152.258
                },
                "8": {
                    x: 322.79,
                    y: -156.306
                },
                "9": {
                    x: 328.2,
                    y: -160.25,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 328.348,
                    y: -159.582,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 328.798,
                    y: -157.482,
                    a: 0.99
                },
                "12": {
                    x: 329.548,
                    y: -153.732,
                    a: 0.98
                },
                "13": {
                    x: 330.648,
                    y: -148.332,
                    a: 0.96
                },
                "14": {
                    x: 332.148,
                    y: -141.032,
                    a: 0.95
                },
                "15": {
                    x: 334.048,
                    y: -131.782,
                    a: 0.92
                },
                "16": {
                    x: 336.398,
                    y: -120.382,
                    a: 0.89
                },
                "17": {
                    x: 339.198,
                    y: -106.732,
                    a: 0.85
                },
                "18": {
                    x: 342.498,
                    y: -90.732,
                    a: 0.8
                },
                "19": {
                    x: 346.248,
                    y: -72.482,
                    a: 0.75
                },
                "20": {
                    x: 350.448,
                    y: -52.032,
                    a: 0.7
                },
                "21": {
                    x: 355.048,
                    y: -29.632,
                    a: 0.63
                },
                "22": {
                    x: 359.948,
                    y: -5.782,
                    a: 0.56
                },
                "23": {
                    x: 365.048,
                    y: 18.918,
                    a: 0.5
                },
                "24": {
                    x: 370.148,
                    y: 43.718,
                    a: 0.43
                },
                "25": {
                    x: 375.098,
                    y: 67.868,
                    a: 0.36
                },
                "26": {
                    x: 379.798,
                    y: 90.718,
                    a: 0.29
                },
                "27": {
                    x: 384.098,
                    y: 111.618,
                    a: 0.23
                },
                "28": {
                    x: 387.898,
                    y: 130.218,
                    a: 0.18
                },
                "29": {
                    x: 391.248,
                    y: 146.318,
                    a: 0.14
                },
                "30": {
                    x: 393.998,
                    y: 159.918,
                    a: 0.1
                },
                "31": {
                    x: 396.298,
                    y: 171.018,
                    a: 0.07
                },
                "32": {
                    x: 398.098,
                    y: 179.768,
                    a: 0.04
                },
                "33": {
                    x: 399.448,
                    y: 186.268,
                    a: 0.02
                },
                "34": {
                    x: 400.348,
                    y: 190.718,
                    a: 0.01
                }
            })
            .addTimedChild(instance16, 0, 35, {
                "0": {
                    x: 140.05,
                    y: -25.15,
                    a: 1
                },
                "1": {
                    x: 216.5,
                    y: -62.1
                },
                "2": {
                    x: 267.5,
                    y: -86.75
                },
                "3": {
                    x: 273.75,
                    y: -89.25
                },
                "4": {
                    x: 279.95,
                    y: -91.7
                },
                "5": {
                    x: 286.2,
                    y: -94.2
                },
                "6": {
                    x: 292.4,
                    y: -96.7
                },
                "7": {
                    x: 298.65,
                    y: -99.2
                },
                "8": {
                    x: 304.85,
                    y: -101.65
                },
                "9": {
                    x: 311.1,
                    y: -104.15
                },
                "10": {
                    x: 311.25,
                    y: -103.4
                },
                "11": {
                    x: 311.65,
                    y: -101.05,
                    a: 0.99
                },
                "12": {
                    x: 312.35,
                    y: -97,
                    a: 0.98
                },
                "13": {
                    x: 313.35,
                    y: -91.1,
                    a: 0.96
                },
                "14": {
                    x: 314.7,
                    y: -83.15,
                    a: 0.95
                },
                "15": {
                    x: 316.45,
                    y: -73,
                    a: 0.92
                },
                "16": {
                    x: 318.6,
                    y: -60.55,
                    a: 0.89
                },
                "17": {
                    x: 321.2,
                    y: -45.65,
                    a: 0.85
                },
                "18": {
                    x: 324.2,
                    y: -28.2,
                    a: 0.8
                },
                "19": {
                    x: 327.6,
                    y: -8.25,
                    a: 0.75
                },
                "20": {
                    x: 331.45,
                    y: 14.1,
                    a: 0.7
                },
                "21": {
                    x: 335.65,
                    y: 38.55,
                    a: 0.63
                },
                "22": {
                    x: 340.15,
                    y: 64.55,
                    a: 0.56
                },
                "23": {
                    x: 344.8,
                    y: 91.55,
                    a: 0.5
                },
                "24": {
                    x: 349.45,
                    y: 118.65,
                    a: 0.43
                },
                "25": {
                    x: 354,
                    y: 145.05,
                    a: 0.36
                },
                "26": {
                    x: 358.3,
                    y: 169.95,
                    a: 0.29
                },
                "27": {
                    x: 362.25,
                    y: 192.8,
                    a: 0.23
                },
                "28": {
                    x: 365.75,
                    y: 213.1,
                    a: 0.18
                },
                "29": {
                    x: 368.75,
                    y: 230.7,
                    a: 0.14
                },
                "30": {
                    x: 371.3,
                    y: 245.55,
                    a: 0.1
                },
                "31": {
                    x: 373.4,
                    y: 257.7,
                    a: 0.07
                },
                "32": {
                    x: 375.05,
                    y: 267.25,
                    a: 0.04
                },
                "33": {
                    x: 376.3,
                    y: 274.35,
                    a: 0.02
                },
                "34": {
                    x: 377.1,
                    y: 279.2,
                    a: 0.01
                }
            })
            .addTimedChild(instance15, 0, 35, {
                "0": {
                    x: 163.662,
                    y: -56.589,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 204.753,
                    y: -113.034,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 232.15,
                    y: -150.6,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 236.034,
                    y: -154.362,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 239.832,
                    y: -158.163
                },
                "5": {
                    x: 243.67,
                    y: -162.013
                },
                "6": {
                    x: 247.462,
                    y: -165.755,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 251.36,
                    y: -169.556
                },
                "8": {
                    x: 255.154,
                    y: -173.355
                },
                "9": {
                    x: 259.05,
                    y: -177.15,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 259.188,
                    y: -176.173,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 259.588,
                    y: -172.973,
                    a: 0.99
                },
                "12": {
                    x: 260.338,
                    y: -167.423,
                    a: 0.98
                },
                "13": {
                    x: 261.388,
                    y: -159.323,
                    a: 0.96
                },
                "14": {
                    x: 262.838,
                    y: -148.473,
                    a: 0.95
                },
                "15": {
                    x: 264.638,
                    y: -134.673,
                    a: 0.92
                },
                "16": {
                    x: 266.888,
                    y: -117.673,
                    a: 0.89
                },
                "17": {
                    x: 269.588,
                    y: -97.273,
                    a: 0.85
                },
                "18": {
                    x: 272.738,
                    y: -73.473,
                    a: 0.8
                },
                "19": {
                    x: 276.338,
                    y: -46.223,
                    a: 0.75
                },
                "20": {
                    x: 280.338,
                    y: -15.723,
                    a: 0.7
                },
                "21": {
                    x: 284.738,
                    y: 17.627,
                    a: 0.63
                },
                "22": {
                    x: 289.438,
                    y: 53.177,
                    a: 0.56
                },
                "23": {
                    x: 294.288,
                    y: 90.027,
                    a: 0.5
                },
                "24": {
                    x: 299.188,
                    y: 127.027,
                    a: 0.43
                },
                "25": {
                    x: 303.938,
                    y: 163.077,
                    a: 0.36
                },
                "26": {
                    x: 308.438,
                    y: 197.077,
                    a: 0.29
                },
                "27": {
                    x: 312.538,
                    y: 228.277,
                    a: 0.23
                },
                "28": {
                    x: 316.188,
                    y: 256.027,
                    a: 0.18
                },
                "29": {
                    x: 319.388,
                    y: 280.077,
                    a: 0.14
                },
                "30": {
                    x: 322.038,
                    y: 300.327,
                    a: 0.1
                },
                "31": {
                    x: 324.238,
                    y: 316.927,
                    a: 0.07
                },
                "32": {
                    x: 325.988,
                    y: 329.927,
                    a: 0.04
                },
                "33": {
                    x: 327.238,
                    y: 339.627,
                    a: 0.02
                },
                "34": {
                    x: 328.138,
                    y: 346.277,
                    a: 0.01
                }
            })
            .addTimedChild(instance14, 0, 35, {
                "0": {
                    x: 129.51,
                    y: -26.921,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 177.123,
                    y: -61.672,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 208.8,
                    y: -84.75,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 213.093,
                    y: -87.06,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 217.339,
                    y: -89.394
                },
                "5": {
                    x: 221.627,
                    y: -91.728
                },
                "6": {
                    x: 225.968,
                    y: -94.005,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 230.263,
                    y: -96.339
                },
                "8": {
                    x: 234.456,
                    y: -98.671
                },
                "9": {
                    x: 238.8,
                    y: -101.05,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 238.94,
                    y: -100.53,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 239.34,
                    y: -98.88,
                    a: 0.99
                },
                "12": {
                    x: 240.04,
                    y: -96.03,
                    a: 0.98
                },
                "13": {
                    x: 241.04,
                    y: -91.83,
                    a: 0.96
                },
                "14": {
                    x: 242.39,
                    y: -86.23,
                    a: 0.95
                },
                "15": {
                    x: 244.14,
                    y: -79.08,
                    a: 0.92
                },
                "16": {
                    x: 246.29,
                    y: -70.28,
                    a: 0.89
                },
                "17": {
                    x: 248.89,
                    y: -59.73,
                    a: 0.85
                },
                "18": {
                    x: 251.89,
                    y: -47.38,
                    a: 0.8
                },
                "19": {
                    x: 255.29,
                    y: -33.28,
                    a: 0.75
                },
                "20": {
                    x: 259.14,
                    y: -17.48,
                    a: 0.7
                },
                "21": {
                    x: 263.34,
                    y: -0.23,
                    a: 0.63
                },
                "22": {
                    x: 267.84,
                    y: 18.17,
                    a: 0.56
                },
                "23": {
                    x: 272.49,
                    y: 37.27,
                    a: 0.5
                },
                "24": {
                    x: 277.14,
                    y: 56.42,
                    a: 0.43
                },
                "25": {
                    x: 281.69,
                    y: 75.07,
                    a: 0.36
                },
                "26": {
                    x: 285.99,
                    y: 92.67,
                    a: 0.29
                },
                "27": {
                    x: 289.94,
                    y: 108.82,
                    a: 0.23
                },
                "28": {
                    x: 293.44,
                    y: 123.17,
                    a: 0.18
                },
                "29": {
                    x: 296.44,
                    y: 135.62,
                    a: 0.14
                },
                "30": {
                    x: 298.99,
                    y: 146.12,
                    a: 0.1
                },
                "31": {
                    x: 301.09,
                    y: 154.72,
                    a: 0.07
                },
                "32": {
                    x: 302.74,
                    y: 161.47,
                    a: 0.04
                },
                "33": {
                    x: 303.99,
                    y: 166.47,
                    a: 0.02
                },
                "34": {
                    x: 304.79,
                    y: 169.92,
                    a: 0.01
                }
            })
            .addTimedChild(instance13, 0, 35, {
                "0": {
                    x: 85.163,
                    y: -2.775,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 116.434,
                    y: -39.243,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 137.25,
                    y: -63.65,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 140.434,
                    y: -66.114,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 143.613,
                    y: -68.538
                },
                "5": {
                    x: 146.838,
                    y: -71.012
                },
                "6": {
                    x: 149.964,
                    y: -73.582,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 153.144,
                    y: -76.006
                },
                "8": {
                    x: 156.322,
                    y: -78.479
                },
                "9": {
                    x: 159.5,
                    y: -80.85,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 159.533,
                    y: -80.348,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 159.833,
                    y: -78.748,
                    a: 0.99
                },
                "12": {
                    x: 160.333,
                    y: -75.998,
                    a: 0.98
                },
                "13": {
                    x: 161.033,
                    y: -71.948,
                    a: 0.96
                },
                "14": {
                    x: 162.033,
                    y: -66.498,
                    a: 0.95
                },
                "15": {
                    x: 163.283,
                    y: -59.598,
                    a: 0.92
                },
                "16": {
                    x: 164.833,
                    y: -51.098,
                    a: 0.89
                },
                "17": {
                    x: 166.683,
                    y: -40.898,
                    a: 0.85
                },
                "18": {
                    x: 168.833,
                    y: -28.998,
                    a: 0.8
                },
                "19": {
                    x: 171.333,
                    y: -15.398,
                    a: 0.75
                },
                "20": {
                    x: 174.083,
                    y: -0.148,
                    a: 0.7
                },
                "21": {
                    x: 177.133,
                    y: 16.552,
                    a: 0.63
                },
                "22": {
                    x: 180.333,
                    y: 34.352,
                    a: 0.56
                },
                "23": {
                    x: 183.683,
                    y: 52.752,
                    a: 0.5
                },
                "24": {
                    x: 187.083,
                    y: 71.252,
                    a: 0.43
                },
                "25": {
                    x: 190.333,
                    y: 89.302,
                    a: 0.36
                },
                "26": {
                    x: 193.433,
                    y: 106.302,
                    a: 0.29
                },
                "27": {
                    x: 196.233,
                    y: 121.852,
                    a: 0.23
                },
                "28": {
                    x: 198.783,
                    y: 135.752,
                    a: 0.18
                },
                "29": {
                    x: 200.983,
                    y: 147.752,
                    a: 0.14
                },
                "30": {
                    x: 202.783,
                    y: 157.902,
                    a: 0.1
                },
                "31": {
                    x: 204.283,
                    y: 166.202,
                    a: 0.07
                },
                "32": {
                    x: 205.483,
                    y: 172.702,
                    a: 0.04
                },
                "33": {
                    x: 206.383,
                    y: 177.552,
                    a: 0.02
                },
                "34": {
                    x: 206.983,
                    y: 180.902,
                    a: 0.01
                }
            })
            .addTimedChild(instance12, 0, 35, {
                "0": {
                    x: 107.1,
                    y: -24.35,
                    a: 1
                },
                "1": {
                    x: 137.9,
                    y: -78.75
                },
                "2": {
                    x: 158.45,
                    y: -115
                },
                "3": {
                    x: 161.6,
                    y: -118.65
                },
                "4": {
                    x: 164.75,
                    y: -122.35
                },
                "5": {
                    x: 167.9,
                    y: -126
                },
                "6": {
                    x: 171.05,
                    y: -129.65
                },
                "7": {
                    x: 174.2,
                    y: -133.3
                },
                "8": {
                    x: 177.35,
                    y: -137
                },
                "9": {
                    x: 180.5,
                    y: -140.65
                },
                "10": {
                    x: 180.6,
                    y: -139.75
                },
                "11": {
                    x: 181,
                    y: -137.05,
                    a: 0.99
                },
                "12": {
                    x: 181.65,
                    y: -132.25,
                    a: 0.98
                },
                "13": {
                    x: 182.65,
                    y: -125.3,
                    a: 0.96
                },
                "14": {
                    x: 183.95,
                    y: -115.95,
                    a: 0.95
                },
                "15": {
                    x: 185.6,
                    y: -104,
                    a: 0.92
                },
                "16": {
                    x: 187.65,
                    y: -89.35,
                    a: 0.89
                },
                "17": {
                    x: 190.1,
                    y: -71.8,
                    a: 0.85
                },
                "18": {
                    x: 192.95,
                    y: -51.3,
                    a: 0.8
                },
                "19": {
                    x: 196.25,
                    y: -27.8,
                    a: 0.75
                },
                "20": {
                    x: 199.9,
                    y: -1.5,
                    a: 0.7
                },
                "21": {
                    x: 203.95,
                    y: 27.25,
                    a: 0.63
                },
                "22": {
                    x: 208.2,
                    y: 57.9,
                    a: 0.56
                },
                "23": {
                    x: 212.65,
                    y: 89.65,
                    a: 0.5
                },
                "24": {
                    x: 217.1,
                    y: 121.5,
                    a: 0.43
                },
                "25": {
                    x: 221.4,
                    y: 152.6,
                    a: 0.36
                },
                "26": {
                    x: 225.5,
                    y: 181.9,
                    a: 0.29
                },
                "27": {
                    x: 229.25,
                    y: 208.75,
                    a: 0.23
                },
                "28": {
                    x: 232.6,
                    y: 232.65,
                    a: 0.18
                },
                "29": {
                    x: 235.5,
                    y: 253.4,
                    a: 0.14
                },
                "30": {
                    x: 237.9,
                    y: 270.85,
                    a: 0.1
                },
                "31": {
                    x: 239.9,
                    y: 285.15,
                    a: 0.07
                },
                "32": {
                    x: 241.5,
                    y: 296.35,
                    a: 0.04
                },
                "33": {
                    x: 242.65,
                    y: 304.75,
                    a: 0.02
                },
                "34": {
                    x: 243.45,
                    y: 310.45,
                    a: 0.01
                }
            })
            .addTimedChild(instance11, 0, 35, {
                "0": {
                    x: 66.074,
                    y: -28.222,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 84.797,
                    y: -81.538,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 97.3,
                    y: -117.1,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 99.607,
                    y: -120.705,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 101.874,
                    y: -124.29
                },
                "5": {
                    x: 104.236,
                    y: -127.972
                },
                "6": {
                    x: 106.601,
                    y: -131.451,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 108.918,
                    y: -135.036
                },
                "8": {
                    x: 111.233,
                    y: -138.669
                },
                "9": {
                    x: 113.65,
                    y: -142.25,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 113.761,
                    y: -141.728,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 114.061,
                    y: -140.228,
                    a: 0.99
                },
                "12": {
                    x: 114.561,
                    y: -137.578,
                    a: 0.98
                },
                "13": {
                    x: 115.261,
                    y: -133.728,
                    a: 0.96
                },
                "14": {
                    x: 116.261,
                    y: -128.578,
                    a: 0.95
                },
                "15": {
                    x: 117.511,
                    y: -121.978,
                    a: 0.92
                },
                "16": {
                    x: 119.061,
                    y: -113.878,
                    a: 0.89
                },
                "17": {
                    x: 120.911,
                    y: -104.178,
                    a: 0.85
                },
                "18": {
                    x: 123.061,
                    y: -92.828,
                    a: 0.8
                },
                "19": {
                    x: 125.561,
                    y: -79.828,
                    a: 0.75
                },
                "20": {
                    x: 128.311,
                    y: -65.278,
                    a: 0.7
                },
                "21": {
                    x: 131.361,
                    y: -49.378,
                    a: 0.63
                },
                "22": {
                    x: 134.561,
                    y: -32.428,
                    a: 0.56
                },
                "23": {
                    x: 137.911,
                    y: -14.878,
                    a: 0.5
                },
                "24": {
                    x: 141.311,
                    y: 2.722,
                    a: 0.43
                },
                "25": {
                    x: 144.561,
                    y: 19.922,
                    a: 0.36
                },
                "26": {
                    x: 147.661,
                    y: 36.122,
                    a: 0.29
                },
                "27": {
                    x: 150.461,
                    y: 50.972,
                    a: 0.23
                },
                "28": {
                    x: 153.011,
                    y: 64.222,
                    a: 0.18
                },
                "29": {
                    x: 155.211,
                    y: 75.672,
                    a: 0.14
                },
                "30": {
                    x: 157.011,
                    y: 85.322,
                    a: 0.1
                },
                "31": {
                    x: 158.511,
                    y: 93.222,
                    a: 0.07
                },
                "32": {
                    x: 159.711,
                    y: 99.422,
                    a: 0.04
                },
                "33": {
                    x: 160.611,
                    y: 104.072,
                    a: 0.02
                },
                "34": {
                    x: 161.211,
                    y: 107.222,
                    a: 0.01
                }
            })
            .addTimedChild(instance10, 0, 35, {
                "0": {
                    x: -116.859,
                    y: 9.704,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -138.068,
                    y: -8.626,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -152.25,
                    y: -20.85,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -154.534,
                    y: -22.075,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -156.822,
                    y: -23.321
                },
                "5": {
                    x: -159.056,
                    y: -24.513
                },
                "6": {
                    x: -161.39,
                    y: -25.761,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -163.578,
                    y: -27.007
                },
                "8": {
                    x: -165.914,
                    y: -28.252
                },
                "9": {
                    x: -168.15,
                    y: -29.5,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -168.23,
                    y: -29.14,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -168.48,
                    y: -28.09,
                    a: 0.99
                },
                "12": {
                    x: -168.88,
                    y: -26.29,
                    a: 0.98
                },
                "13": {
                    x: -169.43,
                    y: -23.64,
                    a: 0.96
                },
                "14": {
                    x: -170.18,
                    y: -20.04,
                    a: 0.95
                },
                "15": {
                    x: -171.18,
                    y: -15.49,
                    a: 0.92
                },
                "16": {
                    x: -172.33,
                    y: -9.89,
                    a: 0.89
                },
                "17": {
                    x: -173.78,
                    y: -3.19,
                    a: 0.85
                },
                "18": {
                    x: -175.43,
                    y: 4.66,
                    a: 0.8
                },
                "19": {
                    x: -177.33,
                    y: 13.66,
                    a: 0.75
                },
                "20": {
                    x: -179.48,
                    y: 23.71,
                    a: 0.7
                },
                "21": {
                    x: -181.83,
                    y: 34.71,
                    a: 0.63
                },
                "22": {
                    x: -184.33,
                    y: 46.41,
                    a: 0.56
                },
                "23": {
                    x: -186.88,
                    y: 58.56,
                    a: 0.5
                },
                "24": {
                    x: -189.48,
                    y: 70.71,
                    a: 0.43
                },
                "25": {
                    x: -191.98,
                    y: 82.61,
                    a: 0.36
                },
                "26": {
                    x: -194.38,
                    y: 93.81,
                    a: 0.29
                },
                "27": {
                    x: -196.58,
                    y: 104.06,
                    a: 0.23
                },
                "28": {
                    x: -198.53,
                    y: 113.21,
                    a: 0.18
                },
                "29": {
                    x: -200.18,
                    y: 121.16,
                    a: 0.14
                },
                "30": {
                    x: -201.63,
                    y: 127.81,
                    a: 0.1
                },
                "31": {
                    x: -202.78,
                    y: 133.26,
                    a: 0.07
                },
                "32": {
                    x: -203.68,
                    y: 137.56,
                    a: 0.04
                },
                "33": {
                    x: -204.38,
                    y: 140.76,
                    a: 0.02
                },
                "34": {
                    x: -204.83,
                    y: 142.96,
                    a: 0.01
                }
            })
            .addTimedChild(instance9, 0, 35, {
                "0": {
                    x: -151.43,
                    y: 26.467,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -196.839,
                    y: 10.13,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -227.15,
                    y: -0.8,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -231.038,
                    y: -1.929,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -234.943,
                    y: -3.015
                },
                "5": {
                    x: -238.842,
                    y: -4.148
                },
                "6": {
                    x: -242.69,
                    y: -5.188,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -246.546,
                    y: -6.274
                },
                "8": {
                    x: -250.498,
                    y: -7.46
                },
                "9": {
                    x: -254.4,
                    y: -8.5,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -254.478,
                    y: -8.021,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -254.828,
                    y: -6.621,
                    a: 0.99
                },
                "12": {
                    x: -255.428,
                    y: -4.221,
                    a: 0.98
                },
                "13": {
                    x: -256.278,
                    y: -0.671,
                    a: 0.96
                },
                "14": {
                    x: -257.378,
                    y: 4.079,
                    a: 0.95
                },
                "15": {
                    x: -258.878,
                    y: 10.179,
                    a: 0.92
                },
                "16": {
                    x: -260.628,
                    y: 17.629,
                    a: 0.89
                },
                "17": {
                    x: -262.778,
                    y: 26.529,
                    a: 0.85
                },
                "18": {
                    x: -265.278,
                    y: 36.979,
                    a: 0.8
                },
                "19": {
                    x: -268.178,
                    y: 48.929,
                    a: 0.75
                },
                "20": {
                    x: -271.378,
                    y: 62.279,
                    a: 0.7
                },
                "21": {
                    x: -274.878,
                    y: 76.879,
                    a: 0.63
                },
                "22": {
                    x: -278.628,
                    y: 92.479,
                    a: 0.56
                },
                "23": {
                    x: -282.528,
                    y: 108.629,
                    a: 0.5
                },
                "24": {
                    x: -286.428,
                    y: 124.829,
                    a: 0.43
                },
                "25": {
                    x: -290.228,
                    y: 140.629,
                    a: 0.36
                },
                "26": {
                    x: -293.778,
                    y: 155.529,
                    a: 0.29
                },
                "27": {
                    x: -297.078,
                    y: 169.179,
                    a: 0.23
                },
                "28": {
                    x: -299.978,
                    y: 181.379,
                    a: 0.18
                },
                "29": {
                    x: -302.528,
                    y: 191.879,
                    a: 0.14
                },
                "30": {
                    x: -304.678,
                    y: 200.779,
                    a: 0.1
                },
                "31": {
                    x: -306.428,
                    y: 208.029,
                    a: 0.07
                },
                "32": {
                    x: -307.778,
                    y: 213.779,
                    a: 0.04
                },
                "33": {
                    x: -308.778,
                    y: 218.029,
                    a: 0.02
                },
                "34": {
                    x: -309.478,
                    y: 220.929,
                    a: 0.01
                }
            })
            .addTimedChild(instance8, 0, 35, {
                "0": {
                    x: -129.467,
                    y: 15.987,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -221.92,
                    y: -4.536,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -283.55,
                    y: -18.3,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -290.604,
                    y: -19.724,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -297.625,
                    y: -21.062
                },
                "5": {
                    x: -304.737,
                    y: -22.494
                },
                "6": {
                    x: -311.798,
                    y: -23.885,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -318.868,
                    y: -25.322
                },
                "8": {
                    x: -325.934,
                    y: -26.609
                },
                "9": {
                    x: -332.95,
                    y: -28,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -333.019,
                    y: -27.474,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -333.269,
                    y: -25.774,
                    a: 0.99
                },
                "12": {
                    x: -333.669,
                    y: -22.774,
                    a: 0.98
                },
                "13": {
                    x: -334.219,
                    y: -18.424,
                    a: 0.96
                },
                "14": {
                    x: -334.969,
                    y: -12.574,
                    a: 0.95
                },
                "15": {
                    x: -335.969,
                    y: -5.124,
                    a: 0.92
                },
                "16": {
                    x: -337.119,
                    y: 4.026,
                    a: 0.89
                },
                "17": {
                    x: -338.569,
                    y: 14.976,
                    a: 0.85
                },
                "18": {
                    x: -340.219,
                    y: 27.776,
                    a: 0.8
                },
                "19": {
                    x: -342.119,
                    y: 42.426,
                    a: 0.75
                },
                "20": {
                    x: -344.269,
                    y: 58.876,
                    a: 0.7
                },
                "21": {
                    x: -346.619,
                    y: 76.826,
                    a: 0.63
                },
                "22": {
                    x: -349.119,
                    y: 95.976,
                    a: 0.56
                },
                "23": {
                    x: -351.669,
                    y: 115.776,
                    a: 0.5
                },
                "24": {
                    x: -354.269,
                    y: 135.726,
                    a: 0.43
                },
                "25": {
                    x: -356.769,
                    y: 155.126,
                    a: 0.36
                },
                "26": {
                    x: -359.169,
                    y: 173.426,
                    a: 0.29
                },
                "27": {
                    x: -361.369,
                    y: 190.176,
                    a: 0.23
                },
                "28": {
                    x: -363.319,
                    y: 205.126,
                    a: 0.18
                },
                "29": {
                    x: -364.969,
                    y: 218.076,
                    a: 0.14
                },
                "30": {
                    x: -366.419,
                    y: 228.976,
                    a: 0.1
                },
                "31": {
                    x: -367.569,
                    y: 237.926,
                    a: 0.07
                },
                "32": {
                    x: -368.469,
                    y: 244.926,
                    a: 0.04
                },
                "33": {
                    x: -369.169,
                    y: 250.126,
                    a: 0.02
                },
                "34": {
                    x: -369.619,
                    y: 253.726,
                    a: 0.01
                }
            })
            .addTimedChild(instance7, 0, 35, {
                "0": {
                    x: -55.384,
                    y: -60.392,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -69.517,
                    y: -113.252,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -78.85,
                    y: -148.45,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -80.59,
                    y: -152.024,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -82.368,
                    y: -155.605
                },
                "5": {
                    x: -84.146,
                    y: -159.131
                },
                "6": {
                    x: -85.92,
                    y: -162.659,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -87.698,
                    y: -166.24
                },
                "8": {
                    x: -89.475,
                    y: -169.82
                },
                "9": {
                    x: -91.25,
                    y: -173.35,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -91.308,
                    y: -172.778,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -91.558,
                    y: -170.978,
                    a: 0.99
                },
                "12": {
                    x: -91.958,
                    y: -167.878,
                    a: 0.98
                },
                "13": {
                    x: -92.508,
                    y: -163.328,
                    a: 0.96
                },
                "14": {
                    x: -93.258,
                    y: -157.228,
                    a: 0.95
                },
                "15": {
                    x: -94.258,
                    y: -149.428,
                    a: 0.92
                },
                "16": {
                    x: -95.408,
                    y: -139.878,
                    a: 0.89
                },
                "17": {
                    x: -96.858,
                    y: -128.428,
                    a: 0.85
                },
                "18": {
                    x: -98.508,
                    y: -115.078,
                    a: 0.8
                },
                "19": {
                    x: -100.408,
                    y: -99.778,
                    a: 0.75
                },
                "20": {
                    x: -102.558,
                    y: -82.628,
                    a: 0.7
                },
                "21": {
                    x: -104.908,
                    y: -63.878,
                    a: 0.63
                },
                "22": {
                    x: -107.408,
                    y: -43.928,
                    a: 0.56
                },
                "23": {
                    x: -109.958,
                    y: -23.228,
                    a: 0.5
                },
                "24": {
                    x: -112.558,
                    y: -2.428,
                    a: 0.43
                },
                "25": {
                    x: -115.058,
                    y: 17.822,
                    a: 0.36
                },
                "26": {
                    x: -117.458,
                    y: 36.922,
                    a: 0.29
                },
                "27": {
                    x: -119.658,
                    y: 54.422,
                    a: 0.23
                },
                "28": {
                    x: -121.608,
                    y: 70.022,
                    a: 0.18
                },
                "29": {
                    x: -123.258,
                    y: 83.522,
                    a: 0.14
                },
                "30": {
                    x: -124.708,
                    y: 94.922,
                    a: 0.1
                },
                "31": {
                    x: -125.858,
                    y: 104.222,
                    a: 0.07
                },
                "32": {
                    x: -126.758,
                    y: 111.572,
                    a: 0.04
                },
                "33": {
                    x: -127.458,
                    y: 117.022,
                    a: 0.02
                },
                "34": {
                    x: -127.908,
                    y: 120.722,
                    a: 0.01
                }
            })
            .addTimedChild(instance6, 0, 35, {
                "0": {
                    x: -83.616,
                    y: -35.423,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -120.101,
                    y: -80.691,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -144.4,
                    y: -110.8,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -147.713,
                    y: -113.849,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -150.955,
                    y: -116.817
                },
                "5": {
                    x: -154.244,
                    y: -119.879
                },
                "6": {
                    x: -157.53,
                    y: -122.946,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -160.772,
                    y: -126.015
                },
                "8": {
                    x: -164.062,
                    y: -129.031
                },
                "9": {
                    x: -167.35,
                    y: -132.05,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -167.406,
                    y: -131.624,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -167.656,
                    y: -130.324,
                    a: 0.99
                },
                "12": {
                    x: -168.056,
                    y: -128.124,
                    a: 0.98
                },
                "13": {
                    x: -168.606,
                    y: -124.824,
                    a: 0.96
                },
                "14": {
                    x: -169.356,
                    y: -120.474,
                    a: 0.95
                },
                "15": {
                    x: -170.356,
                    y: -114.874,
                    a: 0.92
                },
                "16": {
                    x: -171.506,
                    y: -108.024,
                    a: 0.89
                },
                "17": {
                    x: -172.956,
                    y: -99.824,
                    a: 0.85
                },
                "18": {
                    x: -174.606,
                    y: -90.224,
                    a: 0.8
                },
                "19": {
                    x: -176.506,
                    y: -79.274,
                    a: 0.75
                },
                "20": {
                    x: -178.656,
                    y: -66.974,
                    a: 0.7
                },
                "21": {
                    x: -181.006,
                    y: -53.524,
                    a: 0.63
                },
                "22": {
                    x: -183.506,
                    y: -39.224,
                    a: 0.56
                },
                "23": {
                    x: -186.056,
                    y: -24.374,
                    a: 0.5
                },
                "24": {
                    x: -188.656,
                    y: -9.424,
                    a: 0.43
                },
                "25": {
                    x: -191.156,
                    y: 5.076,
                    a: 0.36
                },
                "26": {
                    x: -193.556,
                    y: 18.776,
                    a: 0.29
                },
                "27": {
                    x: -195.756,
                    y: 31.326,
                    a: 0.23
                },
                "28": {
                    x: -197.706,
                    y: 42.526,
                    a: 0.18
                },
                "29": {
                    x: -199.356,
                    y: 52.226,
                    a: 0.14
                },
                "30": {
                    x: -200.806,
                    y: 60.376,
                    a: 0.1
                },
                "31": {
                    x: -201.956,
                    y: 67.076,
                    a: 0.07
                },
                "32": {
                    x: -202.856,
                    y: 72.326,
                    a: 0.04
                },
                "33": {
                    x: -203.556,
                    y: 76.226,
                    a: 0.02
                },
                "34": {
                    x: -204.006,
                    y: 78.876,
                    a: 0.01
                }
            })
            .addTimedChild(instance5, 0, 35, {
                "0": {
                    x: -137.841,
                    y: -49.617,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -165.99,
                    y: -96.137,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -184.8,
                    y: -127.2,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -187.552,
                    y: -130.34,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -190.254,
                    y: -133.46
                },
                "5": {
                    x: -193.004,
                    y: -136.673
                },
                "6": {
                    x: -195.749,
                    y: -139.742,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -198.502,
                    y: -142.862
                },
                "8": {
                    x: -201.202,
                    y: -146.079
                },
                "9": {
                    x: -203.95,
                    y: -149.2,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -204.018,
                    y: -148.609,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -204.268,
                    y: -146.759,
                    a: 0.99
                },
                "12": {
                    x: -204.668,
                    y: -143.559,
                    a: 0.98
                },
                "13": {
                    x: -205.218,
                    y: -138.809,
                    a: 0.96
                },
                "14": {
                    x: -205.968,
                    y: -132.509,
                    a: 0.95
                },
                "15": {
                    x: -206.968,
                    y: -124.459,
                    a: 0.92
                },
                "16": {
                    x: -208.118,
                    y: -114.559,
                    a: 0.89
                },
                "17": {
                    x: -209.568,
                    y: -102.709,
                    a: 0.85
                },
                "18": {
                    x: -211.218,
                    y: -88.809,
                    a: 0.8
                },
                "19": {
                    x: -213.118,
                    y: -72.959,
                    a: 0.75
                },
                "20": {
                    x: -215.268,
                    y: -55.209,
                    a: 0.7
                },
                "21": {
                    x: -217.618,
                    y: -35.759,
                    a: 0.63
                },
                "22": {
                    x: -220.118,
                    y: -15.059,
                    a: 0.56
                },
                "23": {
                    x: -222.668,
                    y: 6.391,
                    a: 0.5
                },
                "24": {
                    x: -225.268,
                    y: 27.941,
                    a: 0.43
                },
                "25": {
                    x: -227.768,
                    y: 48.941,
                    a: 0.36
                },
                "26": {
                    x: -230.168,
                    y: 68.741,
                    a: 0.29
                },
                "27": {
                    x: -232.368,
                    y: 86.891,
                    a: 0.23
                },
                "28": {
                    x: -234.318,
                    y: 103.041,
                    a: 0.18
                },
                "29": {
                    x: -235.968,
                    y: 117.041,
                    a: 0.14
                },
                "30": {
                    x: -237.418,
                    y: 128.84,
                    a: 0.1
                },
                "31": {
                    x: -238.568,
                    y: 138.49,
                    a: 0.07
                },
                "32": {
                    x: -239.468,
                    y: 146.091,
                    a: 0.04
                },
                "33": {
                    x: -240.168,
                    y: 151.74,
                    a: 0.02
                },
                "34": {
                    x: -240.618,
                    y: 155.591,
                    a: 0.01
                }
            })
            .addTimedChild(instance4, 0, 35, {
                "0": {
                    x: -128.9,
                    y: -31.75,
                    a: 1
                },
                "1": {
                    x: -170.75,
                    y: -54.35
                },
                "2": {
                    x: -198.65,
                    y: -69.45
                },
                "3": {
                    x: -202.3,
                    y: -70.95
                },
                "4": {
                    x: -205.95,
                    y: -72.5
                },
                "5": {
                    x: -209.6,
                    y: -74
                },
                "6": {
                    x: -213.25,
                    y: -75.55
                },
                "7": {
                    x: -216.9,
                    y: -77.05
                },
                "8": {
                    x: -220.55,
                    y: -78.6
                },
                "9": {
                    x: -224.2,
                    y: -80.1
                },
                "10": {
                    x: -224.3,
                    y: -79.35
                },
                "11": {
                    x: -224.6,
                    y: -77.05,
                    a: 0.99
                },
                "12": {
                    x: -225.15,
                    y: -73,
                    a: 0.98
                },
                "13": {
                    x: -225.95,
                    y: -67.1,
                    a: 0.96
                },
                "14": {
                    x: -227.05,
                    y: -59.2,
                    a: 0.95
                },
                "15": {
                    x: -228.45,
                    y: -49.1,
                    a: 0.92
                },
                "16": {
                    x: -230.1,
                    y: -36.7,
                    a: 0.89
                },
                "17": {
                    x: -232.15,
                    y: -21.85,
                    a: 0.85
                },
                "18": {
                    x: -234.5,
                    y: -4.45,
                    a: 0.8
                },
                "19": {
                    x: -237.2,
                    y: 15.4,
                    a: 0.75
                },
                "20": {
                    x: -240.25,
                    y: 37.65,
                    a: 0.7
                },
                "21": {
                    x: -243.55,
                    y: 62,
                    a: 0.63
                },
                "22": {
                    x: -247.1,
                    y: 87.95,
                    a: 0.56
                },
                "23": {
                    x: -250.75,
                    y: 114.8,
                    a: 0.5
                },
                "24": {
                    x: -254.45,
                    y: 141.8,
                    a: 0.43
                },
                "25": {
                    x: -258.05,
                    y: 168.1,
                    a: 0.36
                },
                "26": {
                    x: -261.4,
                    y: 192.9,
                    a: 0.29
                },
                "27": {
                    x: -264.5,
                    y: 215.65,
                    a: 0.23
                },
                "28": {
                    x: -267.25,
                    y: 235.9,
                    a: 0.18
                },
                "29": {
                    x: -269.65,
                    y: 253.4,
                    a: 0.14
                },
                "30": {
                    x: -271.7,
                    y: 268.2,
                    a: 0.1
                },
                "31": {
                    x: -273.35,
                    y: 280.3,
                    a: 0.07
                },
                "32": {
                    x: -274.6,
                    y: 289.8,
                    a: 0.04
                },
                "33": {
                    x: -275.6,
                    y: 296.9,
                    a: 0.02
                },
                "34": {
                    x: -276.25,
                    y: 301.7,
                    a: 0.01
                }
            })
            .addTimedChild(instance3, 0, 35, {
                "0": {
                    x: -177.096,
                    y: -13.193,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -223.641,
                    y: -48.076,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -254.65,
                    y: -71.4,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -258.575,
                    y: -73.741,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -262.642,
                    y: -76.043
                },
                "5": {
                    x: -266.552,
                    y: -78.439
                },
                "6": {
                    x: -270.459,
                    y: -80.793,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -274.426,
                    y: -83.095
                },
                "8": {
                    x: -278.438,
                    y: -85.495
                },
                "9": {
                    x: -282.4,
                    y: -87.85,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -282.497,
                    y: -87.342,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -282.797,
                    y: -85.842,
                    a: 0.99
                },
                "12": {
                    x: -283.347,
                    y: -83.192,
                    a: 0.98
                },
                "13": {
                    x: -284.147,
                    y: -79.292,
                    a: 0.96
                },
                "14": {
                    x: -285.247,
                    y: -74.092,
                    a: 0.95
                },
                "15": {
                    x: -286.597,
                    y: -67.442,
                    a: 0.92
                },
                "16": {
                    x: -288.297,
                    y: -59.292,
                    a: 0.89
                },
                "17": {
                    x: -290.347,
                    y: -49.542,
                    a: 0.85
                },
                "18": {
                    x: -292.697,
                    y: -38.142,
                    a: 0.8
                },
                "19": {
                    x: -295.397,
                    y: -25.092,
                    a: 0.75
                },
                "20": {
                    x: -298.447,
                    y: -10.442,
                    a: 0.7
                },
                "21": {
                    x: -301.747,
                    y: 5.558,
                    a: 0.63
                },
                "22": {
                    x: -305.297,
                    y: 22.608,
                    a: 0.56
                },
                "23": {
                    x: -308.947,
                    y: 40.258,
                    a: 0.5
                },
                "24": {
                    x: -312.597,
                    y: 58.008,
                    a: 0.43
                },
                "25": {
                    x: -316.197,
                    y: 75.258,
                    a: 0.36
                },
                "26": {
                    x: -319.597,
                    y: 91.558,
                    a: 0.29
                },
                "27": {
                    x: -322.647,
                    y: 106.508,
                    a: 0.23
                },
                "28": {
                    x: -325.447,
                    y: 119.808,
                    a: 0.18
                },
                "29": {
                    x: -327.797,
                    y: 131.358,
                    a: 0.14
                },
                "30": {
                    x: -329.847,
                    y: 141.058,
                    a: 0.1
                },
                "31": {
                    x: -331.497,
                    y: 149.008,
                    a: 0.07
                },
                "32": {
                    x: -332.797,
                    y: 155.258,
                    a: 0.04
                },
                "33": {
                    x: -333.747,
                    y: 159.908,
                    a: 0.02
                },
                "34": {
                    x: -334.397,
                    y: 163.108,
                    a: 0.01
                }
            })
            .addTimedChild(instance2, 0, 35, {
                "0": {
                    x: -166.719,
                    y: -2.288,
                    sx: 0.999,
                    sy: 0.999,
                    r: -2.818,
                    a: 1
                },
                "1": {
                    x: -253.339,
                    y: -47.047,
                    sx: 0.998,
                    sy: 0.998
                },
                "2": {
                    x: -311.1,
                    y: -76.95,
                    sx: 0.999,
                    sy: 0.999,
                    r: -2.817
                },
                "3": {
                    x: -317.78,
                    y: -79.969,
                    sx: 0.998,
                    sy: 0.998,
                    r: -2.818
                },
                "4": {
                    x: -324.418,
                    y: -82.999
                },
                "5": {
                    x: -331.054,
                    y: -85.988
                },
                "6": {
                    x: -337.694,
                    y: -89.028,
                    sx: 0.999,
                    sy: 0.999
                },
                "7": {
                    x: -344.38,
                    y: -92.017
                },
                "8": {
                    x: -351.065,
                    y: -95.106
                },
                "9": {
                    x: -357.75,
                    y: -98.1,
                    sx: 1,
                    sy: 1,
                    r: -2.815
                },
                "10": {
                    x: -357.792,
                    y: -97.652,
                    sx: 0.999,
                    sy: 0.999,
                    r: -2.817
                },
                "11": {
                    x: -358.142,
                    y: -96.052,
                    a: 0.99
                },
                "12": {
                    x: -358.792,
                    y: -93.302,
                    a: 0.98
                },
                "13": {
                    x: -359.692,
                    y: -89.302,
                    a: 0.96
                },
                "14": {
                    x: -360.892,
                    y: -83.902,
                    a: 0.95
                },
                "15": {
                    x: -362.442,
                    y: -77.002,
                    a: 0.92
                },
                "16": {
                    x: -364.292,
                    y: -68.552,
                    a: 0.89
                },
                "17": {
                    x: -366.592,
                    y: -58.452,
                    a: 0.85
                },
                "18": {
                    x: -369.242,
                    y: -46.602,
                    a: 0.8
                },
                "19": {
                    x: -372.242,
                    y: -33.052,
                    a: 0.75
                },
                "20": {
                    x: -375.642,
                    y: -17.902,
                    a: 0.7
                },
                "21": {
                    x: -379.342,
                    y: -1.302,
                    a: 0.63
                },
                "22": {
                    x: -383.292,
                    y: 16.348,
                    a: 0.56
                },
                "23": {
                    x: -387.392,
                    y: 34.648,
                    a: 0.5
                },
                "24": {
                    x: -391.492,
                    y: 53.048,
                    a: 0.43
                },
                "25": {
                    x: -395.492,
                    y: 70.998,
                    a: 0.36
                },
                "26": {
                    x: -399.292,
                    y: 87.898,
                    a: 0.29
                },
                "27": {
                    x: -402.742,
                    y: 103.398,
                    a: 0.23
                },
                "28": {
                    x: -405.842,
                    y: 117.148,
                    a: 0.18
                },
                "29": {
                    x: -408.542,
                    y: 129.148,
                    a: 0.14
                },
                "30": {
                    x: -410.792,
                    y: 139.198,
                    a: 0.1
                },
                "31": {
                    x: -412.592,
                    y: 147.448,
                    a: 0.07
                },
                "32": {
                    x: -414.042,
                    y: 153.898,
                    a: 0.04
                },
                "33": {
                    x: -415.142,
                    y: 158.748,
                    a: 0.02
                },
                "34": {
                    x: -415.892,
                    y: 162.048,
                    a: 0.01
                }
            })
            .addTimedChild(instance1, 0, 35, {
                "0": {
                    x: -135.95,
                    y: -43.613,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -202.43,
                    y: -100.286,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -246.75,
                    y: -138.05,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -252.013,
                    y: -141.847,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -257.381,
                    y: -145.716
                },
                "5": {
                    x: -262.645,
                    y: -149.476
                },
                "6": {
                    x: -267.954,
                    y: -153.295,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -273.272,
                    y: -157.113
                },
                "8": {
                    x: -278.637,
                    y: -160.93
                },
                "9": {
                    x: -283.95,
                    y: -164.75,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -284.064,
                    y: -163.721,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -284.414,
                    y: -160.521,
                    a: 0.99
                },
                "12": {
                    x: -285.064,
                    y: -154.871,
                    a: 0.98
                },
                "13": {
                    x: -285.964,
                    y: -146.671,
                    a: 0.96
                },
                "14": {
                    x: -287.164,
                    y: -135.671,
                    a: 0.95
                },
                "15": {
                    x: -288.714,
                    y: -121.621,
                    a: 0.92
                },
                "16": {
                    x: -290.564,
                    y: -104.371,
                    a: 0.89
                },
                "17": {
                    x: -292.864,
                    y: -83.721,
                    a: 0.85
                },
                "18": {
                    x: -295.514,
                    y: -59.571,
                    a: 0.8
                },
                "19": {
                    x: -298.514,
                    y: -31.921,
                    a: 0.75
                },
                "20": {
                    x: -301.914,
                    y: -0.921,
                    a: 0.7
                },
                "21": {
                    x: -305.614,
                    y: 32.929,
                    a: 0.63
                },
                "22": {
                    x: -309.564,
                    y: 68.979,
                    a: 0.56
                },
                "23": {
                    x: -313.664,
                    y: 106.379,
                    a: 0.5
                },
                "24": {
                    x: -317.764,
                    y: 143.929,
                    a: 0.43
                },
                "25": {
                    x: -321.764,
                    y: 180.529,
                    a: 0.36
                },
                "26": {
                    x: -325.564,
                    y: 215.029,
                    a: 0.29
                },
                "27": {
                    x: -329.014,
                    y: 246.629,
                    a: 0.23
                },
                "28": {
                    x: -332.114,
                    y: 274.829,
                    a: 0.18
                },
                "29": {
                    x: -334.814,
                    y: 299.229,
                    a: 0.14
                },
                "30": {
                    x: -337.064,
                    y: 319.779,
                    a: 0.1
                },
                "31": {
                    x: -338.864,
                    y: 336.579,
                    a: 0.07
                },
                "32": {
                    x: -340.314,
                    y: 349.829,
                    a: 0.04
                },
                "33": {
                    x: -341.414,
                    y: 359.679,
                    a: 0.02
                },
                "34": {
                    x: -342.164,
                    y: 366.429,
                    a: 0.01
                }
            });
    });

    var Graphic26 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti5"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic27 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic28 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic29 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic30 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic31 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti4"))
            .setTransform(-4.9, -2.35);
        this.addTimedChild(instance1);
    });

    var Graphic32 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic33 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti2"))
            .setTransform(-5.65, -6.85);
        this.addTimedChild(instance1);
    });

    var Graphic34 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti4"))
            .setTransform(-4.9, -2.35);
        this.addTimedChild(instance1);
    });

    var Graphic35 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic36 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic37 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic38 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic39 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti2"))
            .setTransform(-5.65, -6.85);
        this.addTimedChild(instance1);
    });

    var Graphic40 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti4"))
            .setTransform(-4.9, -2.35);
        this.addTimedChild(instance1);
    });

    var Graphic41 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic42 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic43 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic44 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti5"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic45 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic46 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance20 = new Graphic45(MovieClip.SYNCHED);
        var instance19 = new Graphic44(MovieClip.SYNCHED);
        var instance18 = new Graphic43(MovieClip.SYNCHED);
        var instance17 = new Graphic42(MovieClip.SYNCHED);
        var instance16 = new Graphic41(MovieClip.SYNCHED);
        var instance15 = new Graphic40(MovieClip.SYNCHED);
        var instance14 = new Graphic39(MovieClip.SYNCHED);
        var instance13 = new Graphic38(MovieClip.SYNCHED);
        var instance12 = new Graphic37(MovieClip.SYNCHED);
        var instance11 = new Graphic36(MovieClip.SYNCHED);
        var instance10 = new Graphic35(MovieClip.SYNCHED);
        var instance9 = new Graphic34(MovieClip.SYNCHED);
        var instance8 = new Graphic33(MovieClip.SYNCHED);
        var instance7 = new Graphic32(MovieClip.SYNCHED);
        var instance6 = new Graphic31(MovieClip.SYNCHED);
        var instance5 = new Graphic30(MovieClip.SYNCHED);
        var instance4 = new Graphic29(MovieClip.SYNCHED);
        var instance3 = new Graphic28(MovieClip.SYNCHED);
        var instance2 = new Graphic27(MovieClip.SYNCHED);
        var instance1 = new Graphic26(MovieClip.SYNCHED);
        this.addTimedChild(instance20, 0, 36, {
                "0": {
                    x: 69.15,
                    y: 30.35,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: 181.283,
                    y: -20.441,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: 265.393,
                    y: -58.447,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: 321.4,
                    y: -83.8,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: 328.138,
                    y: -86.322,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: 334.911,
                    y: -88.962
                },
                "6": {
                    x: 341.624,
                    y: -91.555
                },
                "7": {
                    x: 348.338,
                    y: -94.037,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: 355.112,
                    y: -96.627
                },
                "9": {
                    x: 361.88,
                    y: -99.216
                },
                "10": {
                    x: 368.6,
                    y: -101.75,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: 368.733,
                    y: -101.057,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: 369.183,
                    y: -98.807,
                    a: 0.99
                },
                "13": {
                    x: 369.933,
                    y: -94.907,
                    a: 0.98
                },
                "14": {
                    x: 371.033,
                    y: -89.207,
                    a: 0.96
                },
                "15": {
                    x: 372.533,
                    y: -81.607,
                    a: 0.95
                },
                "16": {
                    x: 374.433,
                    y: -71.857,
                    a: 0.92
                },
                "17": {
                    x: 376.783,
                    y: -59.907,
                    a: 0.89
                },
                "18": {
                    x: 379.583,
                    y: -45.607,
                    a: 0.85
                },
                "19": {
                    x: 382.883,
                    y: -28.857,
                    a: 0.8
                },
                "20": {
                    x: 386.633,
                    y: -9.707,
                    a: 0.75
                },
                "21": {
                    x: 390.833,
                    y: 11.743,
                    a: 0.7
                },
                "22": {
                    x: 395.433,
                    y: 35.193,
                    a: 0.63
                },
                "23": {
                    x: 400.383,
                    y: 60.193,
                    a: 0.56
                },
                "24": {
                    x: 405.433,
                    y: 86.093,
                    a: 0.5
                },
                "25": {
                    x: 410.533,
                    y: 112.093,
                    a: 0.43
                },
                "26": {
                    x: 415.533,
                    y: 137.443,
                    a: 0.36
                },
                "27": {
                    x: 420.233,
                    y: 161.343,
                    a: 0.29
                },
                "28": {
                    x: 424.533,
                    y: 183.243,
                    a: 0.23
                },
                "29": {
                    x: 428.333,
                    y: 202.743,
                    a: 0.18
                },
                "30": {
                    x: 431.633,
                    y: 219.643,
                    a: 0.14
                },
                "31": {
                    x: 434.433,
                    y: 233.893,
                    a: 0.1
                },
                "32": {
                    x: 436.733,
                    y: 245.543,
                    a: 0.07
                },
                "33": {
                    x: 438.533,
                    y: 254.693,
                    a: 0.04
                },
                "34": {
                    x: 439.883,
                    y: 261.543,
                    a: 0.02
                },
                "35": {
                    x: 440.783,
                    y: 266.193,
                    a: 0.01
                }
            })
            .addTimedChild(instance19, 0, 36, {
                "0": {
                    x: 128.2,
                    y: 22.55,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: 203.56,
                    y: -5.612,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: 260.141,
                    y: -26.656,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: 297.85,
                    y: -40.65,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: 302.755,
                    y: -42.04,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: 307.625,
                    y: -43.418
                },
                "6": {
                    x: 312.536,
                    y: -44.799
                },
                "7": {
                    x: 317.398,
                    y: -46.271,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: 322.268,
                    y: -47.7
                },
                "9": {
                    x: 327.134,
                    y: -49.077
                },
                "10": {
                    x: 332.05,
                    y: -50.5,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: 332.204,
                    y: -49.752,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: 332.654,
                    y: -47.452,
                    a: 0.99
                },
                "13": {
                    x: 333.454,
                    y: -43.452,
                    a: 0.98
                },
                "14": {
                    x: 334.604,
                    y: -37.552,
                    a: 0.96
                },
                "15": {
                    x: 336.154,
                    y: -29.652,
                    a: 0.95
                },
                "16": {
                    x: 338.154,
                    y: -19.652,
                    a: 0.92
                },
                "17": {
                    x: 340.604,
                    y: -7.252,
                    a: 0.89
                },
                "18": {
                    x: 343.554,
                    y: 7.498,
                    a: 0.85
                },
                "19": {
                    x: 346.954,
                    y: 24.798,
                    a: 0.8
                },
                "20": {
                    x: 350.854,
                    y: 44.598,
                    a: 0.75
                },
                "21": {
                    x: 355.254,
                    y: 66.748,
                    a: 0.7
                },
                "22": {
                    x: 360.054,
                    y: 90.998,
                    a: 0.63
                },
                "23": {
                    x: 365.154,
                    y: 116.848,
                    a: 0.56
                },
                "24": {
                    x: 370.454,
                    y: 143.598,
                    a: 0.5
                },
                "25": {
                    x: 375.754,
                    y: 170.498,
                    a: 0.43
                },
                "26": {
                    x: 380.954,
                    y: 196.648,
                    a: 0.36
                },
                "27": {
                    x: 385.854,
                    y: 221.348,
                    a: 0.29
                },
                "28": {
                    x: 390.304,
                    y: 243.998,
                    a: 0.23
                },
                "29": {
                    x: 394.304,
                    y: 264.148,
                    a: 0.18
                },
                "30": {
                    x: 397.754,
                    y: 281.648,
                    a: 0.14
                },
                "31": {
                    x: 400.654,
                    y: 296.348,
                    a: 0.1
                },
                "32": {
                    x: 403.054,
                    y: 308.398,
                    a: 0.07
                },
                "33": {
                    x: 404.954,
                    y: 317.848,
                    a: 0.04
                },
                "34": {
                    x: 406.304,
                    y: 324.898,
                    a: 0.02
                },
                "35": {
                    x: 407.304,
                    y: 329.748,
                    a: 0.01
                }
            })
            .addTimedChild(instance18, 0, 36, {
                "0": {
                    x: 63,
                    y: 10.9,
                    a: 1
                },
                "1": {
                    x: 124.65,
                    y: 3.75
                },
                "2": {
                    x: 170.9,
                    y: -1.6
                },
                "3": {
                    x: 201.7,
                    y: -5.2
                },
                "4": {
                    x: 205.9,
                    y: -5.55
                },
                "5": {
                    x: 210.1,
                    y: -5.95
                },
                "6": {
                    x: 214.3,
                    y: -6.3
                },
                "7": {
                    x: 218.45,
                    y: -6.65
                },
                "8": {
                    x: 222.65,
                    y: -7
                },
                "9": {
                    x: 226.85,
                    y: -7.4
                },
                "10": {
                    x: 231.05,
                    y: -7.75
                },
                "11": {
                    x: 231.15,
                    y: -7.2
                },
                "12": {
                    x: 231.55,
                    y: -5.5,
                    a: 0.99
                },
                "13": {
                    x: 232.2,
                    y: -2.5,
                    a: 0.98
                },
                "14": {
                    x: 233.2,
                    y: 1.85,
                    a: 0.96
                },
                "15": {
                    x: 234.5,
                    y: 7.7,
                    a: 0.95
                },
                "16": {
                    x: 236.15,
                    y: 15.15,
                    a: 0.92
                },
                "17": {
                    x: 238.2,
                    y: 24.3,
                    a: 0.89
                },
                "18": {
                    x: 240.65,
                    y: 35.25,
                    a: 0.85
                },
                "19": {
                    x: 243.5,
                    y: 48.05,
                    a: 0.8
                },
                "20": {
                    x: 246.8,
                    y: 62.7,
                    a: 0.75
                },
                "21": {
                    x: 250.45,
                    y: 79.15,
                    a: 0.7
                },
                "22": {
                    x: 254.5,
                    y: 97.1,
                    a: 0.63
                },
                "23": {
                    x: 258.75,
                    y: 116.2,
                    a: 0.56
                },
                "24": {
                    x: 263.2,
                    y: 136.05,
                    a: 0.5
                },
                "25": {
                    x: 267.65,
                    y: 155.95,
                    a: 0.43
                },
                "26": {
                    x: 271.95,
                    y: 175.35,
                    a: 0.36
                },
                "27": {
                    x: 276.05,
                    y: 193.65,
                    a: 0.29
                },
                "28": {
                    x: 279.8,
                    y: 210.45,
                    a: 0.23
                },
                "29": {
                    x: 283.15,
                    y: 225.35,
                    a: 0.18
                },
                "30": {
                    x: 286.05,
                    y: 238.3,
                    a: 0.14
                },
                "31": {
                    x: 288.45,
                    y: 249.2,
                    a: 0.1
                },
                "32": {
                    x: 290.45,
                    y: 258.15,
                    a: 0.07
                },
                "33": {
                    x: 292.05,
                    y: 265.15,
                    a: 0.04
                },
                "34": {
                    x: 293.2,
                    y: 270.35,
                    a: 0.02
                },
                "35": {
                    x: 294,
                    y: 273.95,
                    a: 0.01
                }
            })
            .addTimedChild(instance17, 0, 36, {
                "0": {
                    x: 94.85,
                    y: 44.15,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: 181.647,
                    y: -34.374,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: 246.642,
                    y: -93.184,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: 290.05,
                    y: -132.45,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: 295.498,
                    y: -136.416,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: 300.961,
                    y: -140.366
                },
                "6": {
                    x: 306.413,
                    y: -144.367
                },
                "7": {
                    x: 311.869,
                    y: -148.308,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: 317.281,
                    y: -152.258
                },
                "9": {
                    x: 322.79,
                    y: -156.306
                },
                "10": {
                    x: 328.2,
                    y: -160.25,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: 328.348,
                    y: -159.582,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: 328.798,
                    y: -157.482,
                    a: 0.99
                },
                "13": {
                    x: 329.548,
                    y: -153.732,
                    a: 0.98
                },
                "14": {
                    x: 330.648,
                    y: -148.332,
                    a: 0.96
                },
                "15": {
                    x: 332.148,
                    y: -141.032,
                    a: 0.95
                },
                "16": {
                    x: 334.048,
                    y: -131.782,
                    a: 0.92
                },
                "17": {
                    x: 336.398,
                    y: -120.382,
                    a: 0.89
                },
                "18": {
                    x: 339.198,
                    y: -106.732,
                    a: 0.85
                },
                "19": {
                    x: 342.498,
                    y: -90.732,
                    a: 0.8
                },
                "20": {
                    x: 346.248,
                    y: -72.482,
                    a: 0.75
                },
                "21": {
                    x: 350.448,
                    y: -52.032,
                    a: 0.7
                },
                "22": {
                    x: 355.048,
                    y: -29.632,
                    a: 0.63
                },
                "23": {
                    x: 359.948,
                    y: -5.782,
                    a: 0.56
                },
                "24": {
                    x: 365.048,
                    y: 18.918,
                    a: 0.5
                },
                "25": {
                    x: 370.148,
                    y: 43.718,
                    a: 0.43
                },
                "26": {
                    x: 375.098,
                    y: 67.868,
                    a: 0.36
                },
                "27": {
                    x: 379.798,
                    y: 90.718,
                    a: 0.29
                },
                "28": {
                    x: 384.098,
                    y: 111.618,
                    a: 0.23
                },
                "29": {
                    x: 387.898,
                    y: 130.218,
                    a: 0.18
                },
                "30": {
                    x: 391.248,
                    y: 146.318,
                    a: 0.14
                },
                "31": {
                    x: 393.998,
                    y: 159.918,
                    a: 0.1
                },
                "32": {
                    x: 396.298,
                    y: 171.018,
                    a: 0.07
                },
                "33": {
                    x: 398.098,
                    y: 179.768,
                    a: 0.04
                },
                "34": {
                    x: 399.448,
                    y: 186.268,
                    a: 0.02
                },
                "35": {
                    x: 400.348,
                    y: 190.718,
                    a: 0.01
                }
            })
            .addTimedChild(instance16, 0, 36, {
                "0": {
                    x: 38.1,
                    y: 24.1,
                    a: 1
                },
                "1": {
                    x: 140.05,
                    y: -25.15
                },
                "2": {
                    x: 216.5,
                    y: -62.1
                },
                "3": {
                    x: 267.5,
                    y: -86.75
                },
                "4": {
                    x: 273.75,
                    y: -89.25
                },
                "5": {
                    x: 279.95,
                    y: -91.7
                },
                "6": {
                    x: 286.2,
                    y: -94.2
                },
                "7": {
                    x: 292.4,
                    y: -96.7
                },
                "8": {
                    x: 298.65,
                    y: -99.2
                },
                "9": {
                    x: 304.85,
                    y: -101.65
                },
                "10": {
                    x: 311.1,
                    y: -104.15
                },
                "11": {
                    x: 311.25,
                    y: -103.4
                },
                "12": {
                    x: 311.65,
                    y: -101.05,
                    a: 0.99
                },
                "13": {
                    x: 312.35,
                    y: -97,
                    a: 0.98
                },
                "14": {
                    x: 313.35,
                    y: -91.1,
                    a: 0.96
                },
                "15": {
                    x: 314.7,
                    y: -83.15,
                    a: 0.95
                },
                "16": {
                    x: 316.45,
                    y: -73,
                    a: 0.92
                },
                "17": {
                    x: 318.6,
                    y: -60.55,
                    a: 0.89
                },
                "18": {
                    x: 321.2,
                    y: -45.65,
                    a: 0.85
                },
                "19": {
                    x: 324.2,
                    y: -28.2,
                    a: 0.8
                },
                "20": {
                    x: 327.6,
                    y: -8.25,
                    a: 0.75
                },
                "21": {
                    x: 331.45,
                    y: 14.1,
                    a: 0.7
                },
                "22": {
                    x: 335.65,
                    y: 38.55,
                    a: 0.63
                },
                "23": {
                    x: 340.15,
                    y: 64.55,
                    a: 0.56
                },
                "24": {
                    x: 344.8,
                    y: 91.55,
                    a: 0.5
                },
                "25": {
                    x: 349.45,
                    y: 118.65,
                    a: 0.43
                },
                "26": {
                    x: 354,
                    y: 145.05,
                    a: 0.36
                },
                "27": {
                    x: 358.3,
                    y: 169.95,
                    a: 0.29
                },
                "28": {
                    x: 362.25,
                    y: 192.8,
                    a: 0.23
                },
                "29": {
                    x: 365.75,
                    y: 213.1,
                    a: 0.18
                },
                "30": {
                    x: 368.75,
                    y: 230.7,
                    a: 0.14
                },
                "31": {
                    x: 371.3,
                    y: 245.55,
                    a: 0.1
                },
                "32": {
                    x: 373.4,
                    y: 257.7,
                    a: 0.07
                },
                "33": {
                    x: 375.05,
                    y: 267.25,
                    a: 0.04
                },
                "34": {
                    x: 376.3,
                    y: 274.35,
                    a: 0.02
                },
                "35": {
                    x: 377.1,
                    y: 279.2,
                    a: 0.01
                }
            })
            .addTimedChild(instance15, 0, 36, {
                "0": {
                    x: 108.85,
                    y: 18.7,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: 163.662,
                    y: -56.589,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: 204.753,
                    y: -113.034,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: 232.15,
                    y: -150.6,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: 236.034,
                    y: -154.362,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: 239.832,
                    y: -158.163
                },
                "6": {
                    x: 243.67,
                    y: -162.013
                },
                "7": {
                    x: 247.462,
                    y: -165.755,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: 251.36,
                    y: -169.556
                },
                "9": {
                    x: 255.154,
                    y: -173.355
                },
                "10": {
                    x: 259.05,
                    y: -177.15,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: 259.188,
                    y: -176.173,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: 259.588,
                    y: -172.973,
                    a: 0.99
                },
                "13": {
                    x: 260.338,
                    y: -167.423,
                    a: 0.98
                },
                "14": {
                    x: 261.388,
                    y: -159.323,
                    a: 0.96
                },
                "15": {
                    x: 262.838,
                    y: -148.473,
                    a: 0.95
                },
                "16": {
                    x: 264.638,
                    y: -134.673,
                    a: 0.92
                },
                "17": {
                    x: 266.888,
                    y: -117.673,
                    a: 0.89
                },
                "18": {
                    x: 269.588,
                    y: -97.273,
                    a: 0.85
                },
                "19": {
                    x: 272.738,
                    y: -73.473,
                    a: 0.8
                },
                "20": {
                    x: 276.338,
                    y: -46.223,
                    a: 0.75
                },
                "21": {
                    x: 280.338,
                    y: -15.723,
                    a: 0.7
                },
                "22": {
                    x: 284.738,
                    y: 17.627,
                    a: 0.63
                },
                "23": {
                    x: 289.438,
                    y: 53.177,
                    a: 0.56
                },
                "24": {
                    x: 294.288,
                    y: 90.027,
                    a: 0.5
                },
                "25": {
                    x: 299.188,
                    y: 127.027,
                    a: 0.43
                },
                "26": {
                    x: 303.938,
                    y: 163.077,
                    a: 0.36
                },
                "27": {
                    x: 308.438,
                    y: 197.077,
                    a: 0.29
                },
                "28": {
                    x: 312.538,
                    y: 228.277,
                    a: 0.23
                },
                "29": {
                    x: 316.188,
                    y: 256.027,
                    a: 0.18
                },
                "30": {
                    x: 319.388,
                    y: 280.077,
                    a: 0.14
                },
                "31": {
                    x: 322.038,
                    y: 300.327,
                    a: 0.1
                },
                "32": {
                    x: 324.238,
                    y: 316.927,
                    a: 0.07
                },
                "33": {
                    x: 325.988,
                    y: 329.927,
                    a: 0.04
                },
                "34": {
                    x: 327.238,
                    y: 339.627,
                    a: 0.02
                },
                "35": {
                    x: 328.138,
                    y: 346.277,
                    a: 0.01
                }
            })
            .addTimedChild(instance14, 0, 36, {
                "0": {
                    x: 66.05,
                    y: 19.4,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: 129.51,
                    y: -26.921,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: 177.123,
                    y: -61.672,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: 208.8,
                    y: -84.75,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: 213.093,
                    y: -87.06,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: 217.339,
                    y: -89.394
                },
                "6": {
                    x: 221.627,
                    y: -91.728
                },
                "7": {
                    x: 225.968,
                    y: -94.005,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: 230.263,
                    y: -96.339
                },
                "9": {
                    x: 234.456,
                    y: -98.671
                },
                "10": {
                    x: 238.8,
                    y: -101.05,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: 238.94,
                    y: -100.53,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: 239.34,
                    y: -98.88,
                    a: 0.99
                },
                "13": {
                    x: 240.04,
                    y: -96.03,
                    a: 0.98
                },
                "14": {
                    x: 241.04,
                    y: -91.83,
                    a: 0.96
                },
                "15": {
                    x: 242.39,
                    y: -86.23,
                    a: 0.95
                },
                "16": {
                    x: 244.14,
                    y: -79.08,
                    a: 0.92
                },
                "17": {
                    x: 246.29,
                    y: -70.28,
                    a: 0.89
                },
                "18": {
                    x: 248.89,
                    y: -59.73,
                    a: 0.85
                },
                "19": {
                    x: 251.89,
                    y: -47.38,
                    a: 0.8
                },
                "20": {
                    x: 255.29,
                    y: -33.28,
                    a: 0.75
                },
                "21": {
                    x: 259.14,
                    y: -17.48,
                    a: 0.7
                },
                "22": {
                    x: 263.34,
                    y: -0.23,
                    a: 0.63
                },
                "23": {
                    x: 267.84,
                    y: 18.17,
                    a: 0.56
                },
                "24": {
                    x: 272.49,
                    y: 37.27,
                    a: 0.5
                },
                "25": {
                    x: 277.14,
                    y: 56.42,
                    a: 0.43
                },
                "26": {
                    x: 281.69,
                    y: 75.07,
                    a: 0.36
                },
                "27": {
                    x: 285.99,
                    y: 92.67,
                    a: 0.29
                },
                "28": {
                    x: 289.94,
                    y: 108.82,
                    a: 0.23
                },
                "29": {
                    x: 293.44,
                    y: 123.17,
                    a: 0.18
                },
                "30": {
                    x: 296.44,
                    y: 135.62,
                    a: 0.14
                },
                "31": {
                    x: 298.99,
                    y: 146.12,
                    a: 0.1
                },
                "32": {
                    x: 301.09,
                    y: 154.72,
                    a: 0.07
                },
                "33": {
                    x: 302.74,
                    y: 161.47,
                    a: 0.04
                },
                "34": {
                    x: 303.99,
                    y: 166.47,
                    a: 0.02
                },
                "35": {
                    x: 304.79,
                    y: 169.92,
                    a: 0.01
                }
            })
            .addTimedChild(instance13, 0, 36, {
                "0": {
                    x: 43.5,
                    y: 45.85,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: 85.163,
                    y: -2.775,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: 116.434,
                    y: -39.243,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: 137.25,
                    y: -63.65,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: 140.434,
                    y: -66.114,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: 143.613,
                    y: -68.538
                },
                "6": {
                    x: 146.838,
                    y: -71.012
                },
                "7": {
                    x: 149.964,
                    y: -73.582,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: 153.144,
                    y: -76.006
                },
                "9": {
                    x: 156.322,
                    y: -78.479
                },
                "10": {
                    x: 159.5,
                    y: -80.85,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: 159.533,
                    y: -80.348,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: 159.833,
                    y: -78.748,
                    a: 0.99
                },
                "13": {
                    x: 160.333,
                    y: -75.998,
                    a: 0.98
                },
                "14": {
                    x: 161.033,
                    y: -71.948,
                    a: 0.96
                },
                "15": {
                    x: 162.033,
                    y: -66.498,
                    a: 0.95
                },
                "16": {
                    x: 163.283,
                    y: -59.598,
                    a: 0.92
                },
                "17": {
                    x: 164.833,
                    y: -51.098,
                    a: 0.89
                },
                "18": {
                    x: 166.683,
                    y: -40.898,
                    a: 0.85
                },
                "19": {
                    x: 168.833,
                    y: -28.998,
                    a: 0.8
                },
                "20": {
                    x: 171.333,
                    y: -15.398,
                    a: 0.75
                },
                "21": {
                    x: 174.083,
                    y: -0.148,
                    a: 0.7
                },
                "22": {
                    x: 177.133,
                    y: 16.552,
                    a: 0.63
                },
                "23": {
                    x: 180.333,
                    y: 34.352,
                    a: 0.56
                },
                "24": {
                    x: 183.683,
                    y: 52.752,
                    a: 0.5
                },
                "25": {
                    x: 187.083,
                    y: 71.252,
                    a: 0.43
                },
                "26": {
                    x: 190.333,
                    y: 89.302,
                    a: 0.36
                },
                "27": {
                    x: 193.433,
                    y: 106.302,
                    a: 0.29
                },
                "28": {
                    x: 196.233,
                    y: 121.852,
                    a: 0.23
                },
                "29": {
                    x: 198.783,
                    y: 135.752,
                    a: 0.18
                },
                "30": {
                    x: 200.983,
                    y: 147.752,
                    a: 0.14
                },
                "31": {
                    x: 202.783,
                    y: 157.902,
                    a: 0.1
                },
                "32": {
                    x: 204.283,
                    y: 166.202,
                    a: 0.07
                },
                "33": {
                    x: 205.483,
                    y: 172.702,
                    a: 0.04
                },
                "34": {
                    x: 206.383,
                    y: 177.552,
                    a: 0.02
                },
                "35": {
                    x: 206.983,
                    y: 180.902,
                    a: 0.01
                }
            })
            .addTimedChild(instance12, 0, 36, {
                "0": {
                    x: 66.05,
                    y: 48.2,
                    a: 1
                },
                "1": {
                    x: 107.1,
                    y: -24.35
                },
                "2": {
                    x: 137.9,
                    y: -78.75
                },
                "3": {
                    x: 158.45,
                    y: -115
                },
                "4": {
                    x: 161.6,
                    y: -118.65
                },
                "5": {
                    x: 164.75,
                    y: -122.35
                },
                "6": {
                    x: 167.9,
                    y: -126
                },
                "7": {
                    x: 171.05,
                    y: -129.65
                },
                "8": {
                    x: 174.2,
                    y: -133.3
                },
                "9": {
                    x: 177.35,
                    y: -137
                },
                "10": {
                    x: 180.5,
                    y: -140.65
                },
                "11": {
                    x: 180.6,
                    y: -139.75
                },
                "12": {
                    x: 181,
                    y: -137.05,
                    a: 0.99
                },
                "13": {
                    x: 181.65,
                    y: -132.25,
                    a: 0.98
                },
                "14": {
                    x: 182.65,
                    y: -125.3,
                    a: 0.96
                },
                "15": {
                    x: 183.95,
                    y: -115.95,
                    a: 0.95
                },
                "16": {
                    x: 185.6,
                    y: -104,
                    a: 0.92
                },
                "17": {
                    x: 187.65,
                    y: -89.35,
                    a: 0.89
                },
                "18": {
                    x: 190.1,
                    y: -71.8,
                    a: 0.85
                },
                "19": {
                    x: 192.95,
                    y: -51.3,
                    a: 0.8
                },
                "20": {
                    x: 196.25,
                    y: -27.8,
                    a: 0.75
                },
                "21": {
                    x: 199.9,
                    y: -1.5,
                    a: 0.7
                },
                "22": {
                    x: 203.95,
                    y: 27.25,
                    a: 0.63
                },
                "23": {
                    x: 208.2,
                    y: 57.9,
                    a: 0.56
                },
                "24": {
                    x: 212.65,
                    y: 89.65,
                    a: 0.5
                },
                "25": {
                    x: 217.1,
                    y: 121.5,
                    a: 0.43
                },
                "26": {
                    x: 221.4,
                    y: 152.6,
                    a: 0.36
                },
                "27": {
                    x: 225.5,
                    y: 181.9,
                    a: 0.29
                },
                "28": {
                    x: 229.25,
                    y: 208.75,
                    a: 0.23
                },
                "29": {
                    x: 232.6,
                    y: 232.65,
                    a: 0.18
                },
                "30": {
                    x: 235.5,
                    y: 253.4,
                    a: 0.14
                },
                "31": {
                    x: 237.9,
                    y: 270.85,
                    a: 0.1
                },
                "32": {
                    x: 239.9,
                    y: 285.15,
                    a: 0.07
                },
                "33": {
                    x: 241.5,
                    y: 296.35,
                    a: 0.04
                },
                "34": {
                    x: 242.65,
                    y: 304.75,
                    a: 0.02
                },
                "35": {
                    x: 243.45,
                    y: 310.45,
                    a: 0.01
                }
            })
            .addTimedChild(instance11, 0, 36, {
                "0": {
                    x: 41.2,
                    y: 42.75,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: 66.074,
                    y: -28.222,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: 84.797,
                    y: -81.538,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: 97.3,
                    y: -117.1,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: 99.607,
                    y: -120.705,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: 101.874,
                    y: -124.29
                },
                "6": {
                    x: 104.236,
                    y: -127.972
                },
                "7": {
                    x: 106.601,
                    y: -131.451,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: 108.918,
                    y: -135.036
                },
                "9": {
                    x: 111.233,
                    y: -138.669
                },
                "10": {
                    x: 113.65,
                    y: -142.25,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: 113.761,
                    y: -141.728,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: 114.061,
                    y: -140.228,
                    a: 0.99
                },
                "13": {
                    x: 114.561,
                    y: -137.578,
                    a: 0.98
                },
                "14": {
                    x: 115.261,
                    y: -133.728,
                    a: 0.96
                },
                "15": {
                    x: 116.261,
                    y: -128.578,
                    a: 0.95
                },
                "16": {
                    x: 117.511,
                    y: -121.978,
                    a: 0.92
                },
                "17": {
                    x: 119.061,
                    y: -113.878,
                    a: 0.89
                },
                "18": {
                    x: 120.911,
                    y: -104.178,
                    a: 0.85
                },
                "19": {
                    x: 123.061,
                    y: -92.828,
                    a: 0.8
                },
                "20": {
                    x: 125.561,
                    y: -79.828,
                    a: 0.75
                },
                "21": {
                    x: 128.311,
                    y: -65.278,
                    a: 0.7
                },
                "22": {
                    x: 131.361,
                    y: -49.378,
                    a: 0.63
                },
                "23": {
                    x: 134.561,
                    y: -32.428,
                    a: 0.56
                },
                "24": {
                    x: 137.911,
                    y: -14.878,
                    a: 0.5
                },
                "25": {
                    x: 141.311,
                    y: 2.722,
                    a: 0.43
                },
                "26": {
                    x: 144.561,
                    y: 19.922,
                    a: 0.36
                },
                "27": {
                    x: 147.661,
                    y: 36.122,
                    a: 0.29
                },
                "28": {
                    x: 150.461,
                    y: 50.972,
                    a: 0.23
                },
                "29": {
                    x: 153.011,
                    y: 64.222,
                    a: 0.18
                },
                "30": {
                    x: 155.211,
                    y: 75.672,
                    a: 0.14
                },
                "31": {
                    x: 157.011,
                    y: 85.322,
                    a: 0.1
                },
                "32": {
                    x: 158.511,
                    y: 93.222,
                    a: 0.07
                },
                "33": {
                    x: 159.711,
                    y: 99.422,
                    a: 0.04
                },
                "34": {
                    x: 160.611,
                    y: 104.072,
                    a: 0.02
                },
                "35": {
                    x: 161.211,
                    y: 107.222,
                    a: 0.01
                }
            })
            .addTimedChild(instance10, 0, 36, {
                "0": {
                    x: -88.6,
                    y: 34.25,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: -116.859,
                    y: 9.704,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: -138.068,
                    y: -8.626,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: -152.25,
                    y: -20.85,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: -154.534,
                    y: -22.075,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: -156.822,
                    y: -23.321
                },
                "6": {
                    x: -159.056,
                    y: -24.513
                },
                "7": {
                    x: -161.39,
                    y: -25.761,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: -163.578,
                    y: -27.007
                },
                "9": {
                    x: -165.914,
                    y: -28.252
                },
                "10": {
                    x: -168.15,
                    y: -29.5,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: -168.23,
                    y: -29.14,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: -168.48,
                    y: -28.09,
                    a: 0.99
                },
                "13": {
                    x: -168.88,
                    y: -26.29,
                    a: 0.98
                },
                "14": {
                    x: -169.43,
                    y: -23.64,
                    a: 0.96
                },
                "15": {
                    x: -170.18,
                    y: -20.04,
                    a: 0.95
                },
                "16": {
                    x: -171.18,
                    y: -15.49,
                    a: 0.92
                },
                "17": {
                    x: -172.33,
                    y: -9.89,
                    a: 0.89
                },
                "18": {
                    x: -173.78,
                    y: -3.19,
                    a: 0.85
                },
                "19": {
                    x: -175.43,
                    y: 4.66,
                    a: 0.8
                },
                "20": {
                    x: -177.33,
                    y: 13.66,
                    a: 0.75
                },
                "21": {
                    x: -179.48,
                    y: 23.71,
                    a: 0.7
                },
                "22": {
                    x: -181.83,
                    y: 34.71,
                    a: 0.63
                },
                "23": {
                    x: -184.33,
                    y: 46.41,
                    a: 0.56
                },
                "24": {
                    x: -186.88,
                    y: 58.56,
                    a: 0.5
                },
                "25": {
                    x: -189.48,
                    y: 70.71,
                    a: 0.43
                },
                "26": {
                    x: -191.98,
                    y: 82.61,
                    a: 0.36
                },
                "27": {
                    x: -194.38,
                    y: 93.81,
                    a: 0.29
                },
                "28": {
                    x: -196.58,
                    y: 104.06,
                    a: 0.23
                },
                "29": {
                    x: -198.53,
                    y: 113.21,
                    a: 0.18
                },
                "30": {
                    x: -200.18,
                    y: 121.16,
                    a: 0.14
                },
                "31": {
                    x: -201.63,
                    y: 127.81,
                    a: 0.1
                },
                "32": {
                    x: -202.78,
                    y: 133.26,
                    a: 0.07
                },
                "33": {
                    x: -203.68,
                    y: 137.56,
                    a: 0.04
                },
                "34": {
                    x: -204.38,
                    y: 140.76,
                    a: 0.02
                },
                "35": {
                    x: -204.83,
                    y: 142.96,
                    a: 0.01
                }
            })
            .addTimedChild(instance9, 0, 36, {
                "0": {
                    x: -90.9,
                    y: 48.25,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: -151.43,
                    y: 26.467,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: -196.839,
                    y: 10.13,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: -227.15,
                    y: -0.8,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: -231.038,
                    y: -1.929,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: -234.943,
                    y: -3.015
                },
                "6": {
                    x: -238.842,
                    y: -4.148
                },
                "7": {
                    x: -242.69,
                    y: -5.188,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: -246.546,
                    y: -6.274
                },
                "9": {
                    x: -250.498,
                    y: -7.46
                },
                "10": {
                    x: -254.4,
                    y: -8.5,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: -254.478,
                    y: -8.021,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: -254.828,
                    y: -6.621,
                    a: 0.99
                },
                "13": {
                    x: -255.428,
                    y: -4.221,
                    a: 0.98
                },
                "14": {
                    x: -256.278,
                    y: -0.671,
                    a: 0.96
                },
                "15": {
                    x: -257.378,
                    y: 4.079,
                    a: 0.95
                },
                "16": {
                    x: -258.878,
                    y: 10.179,
                    a: 0.92
                },
                "17": {
                    x: -260.628,
                    y: 17.629,
                    a: 0.89
                },
                "18": {
                    x: -262.778,
                    y: 26.529,
                    a: 0.85
                },
                "19": {
                    x: -265.278,
                    y: 36.979,
                    a: 0.8
                },
                "20": {
                    x: -268.178,
                    y: 48.929,
                    a: 0.75
                },
                "21": {
                    x: -271.378,
                    y: 62.279,
                    a: 0.7
                },
                "22": {
                    x: -274.878,
                    y: 76.879,
                    a: 0.63
                },
                "23": {
                    x: -278.628,
                    y: 92.479,
                    a: 0.56
                },
                "24": {
                    x: -282.528,
                    y: 108.629,
                    a: 0.5
                },
                "25": {
                    x: -286.428,
                    y: 124.829,
                    a: 0.43
                },
                "26": {
                    x: -290.228,
                    y: 140.629,
                    a: 0.36
                },
                "27": {
                    x: -293.778,
                    y: 155.529,
                    a: 0.29
                },
                "28": {
                    x: -297.078,
                    y: 169.179,
                    a: 0.23
                },
                "29": {
                    x: -299.978,
                    y: 181.379,
                    a: 0.18
                },
                "30": {
                    x: -302.528,
                    y: 191.879,
                    a: 0.14
                },
                "31": {
                    x: -304.678,
                    y: 200.779,
                    a: 0.1
                },
                "32": {
                    x: -306.428,
                    y: 208.029,
                    a: 0.07
                },
                "33": {
                    x: -307.778,
                    y: 213.779,
                    a: 0.04
                },
                "34": {
                    x: -308.778,
                    y: 218.029,
                    a: 0.02
                },
                "35": {
                    x: -309.478,
                    y: 220.929,
                    a: 0.01
                }
            })
            .addTimedChild(instance8, 0, 36, {
                "0": {
                    x: -6.2,
                    y: 43.55,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: -129.467,
                    y: 15.987,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: -221.92,
                    y: -4.536,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: -283.55,
                    y: -18.3,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: -290.604,
                    y: -19.724,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: -297.625,
                    y: -21.062
                },
                "6": {
                    x: -304.737,
                    y: -22.494
                },
                "7": {
                    x: -311.798,
                    y: -23.885,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: -318.868,
                    y: -25.322
                },
                "9": {
                    x: -325.934,
                    y: -26.609
                },
                "10": {
                    x: -332.95,
                    y: -28,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: -333.019,
                    y: -27.474,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: -333.269,
                    y: -25.774,
                    a: 0.99
                },
                "13": {
                    x: -333.669,
                    y: -22.774,
                    a: 0.98
                },
                "14": {
                    x: -334.219,
                    y: -18.424,
                    a: 0.96
                },
                "15": {
                    x: -334.969,
                    y: -12.574,
                    a: 0.95
                },
                "16": {
                    x: -335.969,
                    y: -5.124,
                    a: 0.92
                },
                "17": {
                    x: -337.119,
                    y: 4.026,
                    a: 0.89
                },
                "18": {
                    x: -338.569,
                    y: 14.976,
                    a: 0.85
                },
                "19": {
                    x: -340.219,
                    y: 27.776,
                    a: 0.8
                },
                "20": {
                    x: -342.119,
                    y: 42.426,
                    a: 0.75
                },
                "21": {
                    x: -344.269,
                    y: 58.876,
                    a: 0.7
                },
                "22": {
                    x: -346.619,
                    y: 76.826,
                    a: 0.63
                },
                "23": {
                    x: -349.119,
                    y: 95.976,
                    a: 0.56
                },
                "24": {
                    x: -351.669,
                    y: 115.776,
                    a: 0.5
                },
                "25": {
                    x: -354.269,
                    y: 135.726,
                    a: 0.43
                },
                "26": {
                    x: -356.769,
                    y: 155.126,
                    a: 0.36
                },
                "27": {
                    x: -359.169,
                    y: 173.426,
                    a: 0.29
                },
                "28": {
                    x: -361.369,
                    y: 190.176,
                    a: 0.23
                },
                "29": {
                    x: -363.319,
                    y: 205.126,
                    a: 0.18
                },
                "30": {
                    x: -364.969,
                    y: 218.076,
                    a: 0.14
                },
                "31": {
                    x: -366.419,
                    y: 228.976,
                    a: 0.1
                },
                "32": {
                    x: -367.569,
                    y: 237.926,
                    a: 0.07
                },
                "33": {
                    x: -368.469,
                    y: 244.926,
                    a: 0.04
                },
                "34": {
                    x: -369.169,
                    y: 250.126,
                    a: 0.02
                },
                "35": {
                    x: -369.619,
                    y: 253.726,
                    a: 0.01
                }
            })
            .addTimedChild(instance7, 0, 36, {
                "0": {
                    x: -36.5,
                    y: 10.05,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: -55.384,
                    y: -60.392,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: -69.517,
                    y: -113.252,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: -78.85,
                    y: -148.45,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: -80.59,
                    y: -152.024,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: -82.368,
                    y: -155.605
                },
                "6": {
                    x: -84.146,
                    y: -159.131
                },
                "7": {
                    x: -85.92,
                    y: -162.659,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: -87.698,
                    y: -166.24
                },
                "9": {
                    x: -89.475,
                    y: -169.82
                },
                "10": {
                    x: -91.25,
                    y: -173.35,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: -91.308,
                    y: -172.778,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: -91.558,
                    y: -170.978,
                    a: 0.99
                },
                "13": {
                    x: -91.958,
                    y: -167.878,
                    a: 0.98
                },
                "14": {
                    x: -92.508,
                    y: -163.328,
                    a: 0.96
                },
                "15": {
                    x: -93.258,
                    y: -157.228,
                    a: 0.95
                },
                "16": {
                    x: -94.258,
                    y: -149.428,
                    a: 0.92
                },
                "17": {
                    x: -95.408,
                    y: -139.878,
                    a: 0.89
                },
                "18": {
                    x: -96.858,
                    y: -128.428,
                    a: 0.85
                },
                "19": {
                    x: -98.508,
                    y: -115.078,
                    a: 0.8
                },
                "20": {
                    x: -100.408,
                    y: -99.778,
                    a: 0.75
                },
                "21": {
                    x: -102.558,
                    y: -82.628,
                    a: 0.7
                },
                "22": {
                    x: -104.908,
                    y: -63.878,
                    a: 0.63
                },
                "23": {
                    x: -107.408,
                    y: -43.928,
                    a: 0.56
                },
                "24": {
                    x: -109.958,
                    y: -23.228,
                    a: 0.5
                },
                "25": {
                    x: -112.558,
                    y: -2.428,
                    a: 0.43
                },
                "26": {
                    x: -115.058,
                    y: 17.822,
                    a: 0.36
                },
                "27": {
                    x: -117.458,
                    y: 36.922,
                    a: 0.29
                },
                "28": {
                    x: -119.658,
                    y: 54.422,
                    a: 0.23
                },
                "29": {
                    x: -121.608,
                    y: 70.022,
                    a: 0.18
                },
                "30": {
                    x: -123.258,
                    y: 83.522,
                    a: 0.14
                },
                "31": {
                    x: -124.708,
                    y: 94.922,
                    a: 0.1
                },
                "32": {
                    x: -125.858,
                    y: 104.222,
                    a: 0.07
                },
                "33": {
                    x: -126.758,
                    y: 111.572,
                    a: 0.04
                },
                "34": {
                    x: -127.458,
                    y: 117.022,
                    a: 0.02
                },
                "35": {
                    x: -127.908,
                    y: 120.722,
                    a: 0.01
                }
            })
            .addTimedChild(instance6, 0, 36, {
                "0": {
                    x: -34.9,
                    y: 24.95,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: -83.616,
                    y: -35.423,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: -120.101,
                    y: -80.691,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: -144.4,
                    y: -110.8,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: -147.713,
                    y: -113.849,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: -150.955,
                    y: -116.817
                },
                "6": {
                    x: -154.244,
                    y: -119.879
                },
                "7": {
                    x: -157.53,
                    y: -122.946,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: -160.772,
                    y: -126.015
                },
                "9": {
                    x: -164.062,
                    y: -129.031
                },
                "10": {
                    x: -167.35,
                    y: -132.05,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: -167.406,
                    y: -131.624,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: -167.656,
                    y: -130.324,
                    a: 0.99
                },
                "13": {
                    x: -168.056,
                    y: -128.124,
                    a: 0.98
                },
                "14": {
                    x: -168.606,
                    y: -124.824,
                    a: 0.96
                },
                "15": {
                    x: -169.356,
                    y: -120.474,
                    a: 0.95
                },
                "16": {
                    x: -170.356,
                    y: -114.874,
                    a: 0.92
                },
                "17": {
                    x: -171.506,
                    y: -108.024,
                    a: 0.89
                },
                "18": {
                    x: -172.956,
                    y: -99.824,
                    a: 0.85
                },
                "19": {
                    x: -174.606,
                    y: -90.224,
                    a: 0.8
                },
                "20": {
                    x: -176.506,
                    y: -79.274,
                    a: 0.75
                },
                "21": {
                    x: -178.656,
                    y: -66.974,
                    a: 0.7
                },
                "22": {
                    x: -181.006,
                    y: -53.524,
                    a: 0.63
                },
                "23": {
                    x: -183.506,
                    y: -39.224,
                    a: 0.56
                },
                "24": {
                    x: -186.056,
                    y: -24.374,
                    a: 0.5
                },
                "25": {
                    x: -188.656,
                    y: -9.424,
                    a: 0.43
                },
                "26": {
                    x: -191.156,
                    y: 5.076,
                    a: 0.36
                },
                "27": {
                    x: -193.556,
                    y: 18.776,
                    a: 0.29
                },
                "28": {
                    x: -195.756,
                    y: 31.326,
                    a: 0.23
                },
                "29": {
                    x: -197.706,
                    y: 42.526,
                    a: 0.18
                },
                "30": {
                    x: -199.356,
                    y: 52.226,
                    a: 0.14
                },
                "31": {
                    x: -200.806,
                    y: 60.376,
                    a: 0.1
                },
                "32": {
                    x: -201.956,
                    y: 67.076,
                    a: 0.07
                },
                "33": {
                    x: -202.856,
                    y: 72.326,
                    a: 0.04
                },
                "34": {
                    x: -203.556,
                    y: 76.226,
                    a: 0.02
                },
                "35": {
                    x: -204.006,
                    y: 78.876,
                    a: 0.01
                }
            })
            .addTimedChild(instance5, 0, 36, {
                "0": {
                    x: -100.3,
                    y: 12.45,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: -137.841,
                    y: -49.617,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: -165.99,
                    y: -96.137,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: -184.8,
                    y: -127.2,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: -187.552,
                    y: -130.34,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: -190.254,
                    y: -133.46
                },
                "6": {
                    x: -193.004,
                    y: -136.673
                },
                "7": {
                    x: -195.749,
                    y: -139.742,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: -198.502,
                    y: -142.862
                },
                "9": {
                    x: -201.202,
                    y: -146.079
                },
                "10": {
                    x: -203.95,
                    y: -149.2,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: -204.018,
                    y: -148.609,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: -204.268,
                    y: -146.759,
                    a: 0.99
                },
                "13": {
                    x: -204.668,
                    y: -143.559,
                    a: 0.98
                },
                "14": {
                    x: -205.218,
                    y: -138.809,
                    a: 0.96
                },
                "15": {
                    x: -205.968,
                    y: -132.509,
                    a: 0.95
                },
                "16": {
                    x: -206.968,
                    y: -124.459,
                    a: 0.92
                },
                "17": {
                    x: -208.118,
                    y: -114.559,
                    a: 0.89
                },
                "18": {
                    x: -209.568,
                    y: -102.709,
                    a: 0.85
                },
                "19": {
                    x: -211.218,
                    y: -88.809,
                    a: 0.8
                },
                "20": {
                    x: -213.118,
                    y: -72.959,
                    a: 0.75
                },
                "21": {
                    x: -215.268,
                    y: -55.209,
                    a: 0.7
                },
                "22": {
                    x: -217.618,
                    y: -35.759,
                    a: 0.63
                },
                "23": {
                    x: -220.118,
                    y: -15.059,
                    a: 0.56
                },
                "24": {
                    x: -222.668,
                    y: 6.391,
                    a: 0.5
                },
                "25": {
                    x: -225.268,
                    y: 27.941,
                    a: 0.43
                },
                "26": {
                    x: -227.768,
                    y: 48.941,
                    a: 0.36
                },
                "27": {
                    x: -230.168,
                    y: 68.741,
                    a: 0.29
                },
                "28": {
                    x: -232.368,
                    y: 86.891,
                    a: 0.23
                },
                "29": {
                    x: -234.318,
                    y: 103.041,
                    a: 0.18
                },
                "30": {
                    x: -235.968,
                    y: 117.041,
                    a: 0.14
                },
                "31": {
                    x: -237.418,
                    y: 128.84,
                    a: 0.1
                },
                "32": {
                    x: -238.568,
                    y: 138.49,
                    a: 0.07
                },
                "33": {
                    x: -239.468,
                    y: 146.091,
                    a: 0.04
                },
                "34": {
                    x: -240.168,
                    y: 151.74,
                    a: 0.02
                },
                "35": {
                    x: -240.618,
                    y: 155.591,
                    a: 0.01
                }
            })
            .addTimedChild(instance4, 0, 36, {
                "0": {
                    x: -73.1,
                    y: -1.6,
                    a: 1
                },
                "1": {
                    x: -128.9,
                    y: -31.75
                },
                "2": {
                    x: -170.75,
                    y: -54.35
                },
                "3": {
                    x: -198.65,
                    y: -69.45
                },
                "4": {
                    x: -202.3,
                    y: -70.95
                },
                "5": {
                    x: -205.95,
                    y: -72.5
                },
                "6": {
                    x: -209.6,
                    y: -74
                },
                "7": {
                    x: -213.25,
                    y: -75.55
                },
                "8": {
                    x: -216.9,
                    y: -77.05
                },
                "9": {
                    x: -220.55,
                    y: -78.6
                },
                "10": {
                    x: -224.2,
                    y: -80.1
                },
                "11": {
                    x: -224.3,
                    y: -79.35
                },
                "12": {
                    x: -224.6,
                    y: -77.05,
                    a: 0.99
                },
                "13": {
                    x: -225.15,
                    y: -73,
                    a: 0.98
                },
                "14": {
                    x: -225.95,
                    y: -67.1,
                    a: 0.96
                },
                "15": {
                    x: -227.05,
                    y: -59.2,
                    a: 0.95
                },
                "16": {
                    x: -228.45,
                    y: -49.1,
                    a: 0.92
                },
                "17": {
                    x: -230.1,
                    y: -36.7,
                    a: 0.89
                },
                "18": {
                    x: -232.15,
                    y: -21.85,
                    a: 0.85
                },
                "19": {
                    x: -234.5,
                    y: -4.45,
                    a: 0.8
                },
                "20": {
                    x: -237.2,
                    y: 15.4,
                    a: 0.75
                },
                "21": {
                    x: -240.25,
                    y: 37.65,
                    a: 0.7
                },
                "22": {
                    x: -243.55,
                    y: 62,
                    a: 0.63
                },
                "23": {
                    x: -247.1,
                    y: 87.95,
                    a: 0.56
                },
                "24": {
                    x: -250.75,
                    y: 114.8,
                    a: 0.5
                },
                "25": {
                    x: -254.45,
                    y: 141.8,
                    a: 0.43
                },
                "26": {
                    x: -258.05,
                    y: 168.1,
                    a: 0.36
                },
                "27": {
                    x: -261.4,
                    y: 192.9,
                    a: 0.29
                },
                "28": {
                    x: -264.5,
                    y: 215.65,
                    a: 0.23
                },
                "29": {
                    x: -267.25,
                    y: 235.9,
                    a: 0.18
                },
                "30": {
                    x: -269.65,
                    y: 253.4,
                    a: 0.14
                },
                "31": {
                    x: -271.7,
                    y: 268.2,
                    a: 0.1
                },
                "32": {
                    x: -273.35,
                    y: 280.3,
                    a: 0.07
                },
                "33": {
                    x: -274.6,
                    y: 289.8,
                    a: 0.04
                },
                "34": {
                    x: -275.6,
                    y: 296.9,
                    a: 0.02
                },
                "35": {
                    x: -276.25,
                    y: 301.7,
                    a: 0.01
                }
            })
            .addTimedChild(instance3, 0, 36, {
                "0": {
                    x: -115,
                    y: 33.4,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: -177.096,
                    y: -13.193,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: -223.641,
                    y: -48.076,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: -254.65,
                    y: -71.4,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: -258.575,
                    y: -73.741,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: -262.642,
                    y: -76.043
                },
                "6": {
                    x: -266.552,
                    y: -78.439
                },
                "7": {
                    x: -270.459,
                    y: -80.793,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: -274.426,
                    y: -83.095
                },
                "9": {
                    x: -278.438,
                    y: -85.495
                },
                "10": {
                    x: -282.4,
                    y: -87.85,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: -282.497,
                    y: -87.342,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: -282.797,
                    y: -85.842,
                    a: 0.99
                },
                "13": {
                    x: -283.347,
                    y: -83.192,
                    a: 0.98
                },
                "14": {
                    x: -284.147,
                    y: -79.292,
                    a: 0.96
                },
                "15": {
                    x: -285.247,
                    y: -74.092,
                    a: 0.95
                },
                "16": {
                    x: -286.597,
                    y: -67.442,
                    a: 0.92
                },
                "17": {
                    x: -288.297,
                    y: -59.292,
                    a: 0.89
                },
                "18": {
                    x: -290.347,
                    y: -49.542,
                    a: 0.85
                },
                "19": {
                    x: -292.697,
                    y: -38.142,
                    a: 0.8
                },
                "20": {
                    x: -295.397,
                    y: -25.092,
                    a: 0.75
                },
                "21": {
                    x: -298.447,
                    y: -10.442,
                    a: 0.7
                },
                "22": {
                    x: -301.747,
                    y: 5.558,
                    a: 0.63
                },
                "23": {
                    x: -305.297,
                    y: 22.608,
                    a: 0.56
                },
                "24": {
                    x: -308.947,
                    y: 40.258,
                    a: 0.5
                },
                "25": {
                    x: -312.597,
                    y: 58.008,
                    a: 0.43
                },
                "26": {
                    x: -316.197,
                    y: 75.258,
                    a: 0.36
                },
                "27": {
                    x: -319.597,
                    y: 91.558,
                    a: 0.29
                },
                "28": {
                    x: -322.647,
                    y: 106.508,
                    a: 0.23
                },
                "29": {
                    x: -325.447,
                    y: 119.808,
                    a: 0.18
                },
                "30": {
                    x: -327.797,
                    y: 131.358,
                    a: 0.14
                },
                "31": {
                    x: -329.847,
                    y: 141.058,
                    a: 0.1
                },
                "32": {
                    x: -331.497,
                    y: 149.008,
                    a: 0.07
                },
                "33": {
                    x: -332.797,
                    y: 155.258,
                    a: 0.04
                },
                "34": {
                    x: -333.747,
                    y: 159.908,
                    a: 0.02
                },
                "35": {
                    x: -334.397,
                    y: 163.108,
                    a: 0.01
                }
            })
            .addTimedChild(instance2, 0, 36, {
                "0": {
                    x: -51.25,
                    y: 57.35,
                    sx: 1,
                    sy: 1,
                    r: -2.815,
                    a: 1
                },
                "1": {
                    x: -166.719,
                    y: -2.288,
                    sx: 0.999,
                    sy: 0.999,
                    r: -2.818
                },
                "2": {
                    x: -253.339,
                    y: -47.047,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -311.1,
                    y: -76.95,
                    sx: 0.999,
                    sy: 0.999,
                    r: -2.817
                },
                "4": {
                    x: -317.78,
                    y: -79.969,
                    sx: 0.998,
                    sy: 0.998,
                    r: -2.818
                },
                "5": {
                    x: -324.418,
                    y: -82.999
                },
                "6": {
                    x: -331.054,
                    y: -85.988
                },
                "7": {
                    x: -337.694,
                    y: -89.028,
                    sx: 0.999,
                    sy: 0.999
                },
                "8": {
                    x: -344.38,
                    y: -92.017
                },
                "9": {
                    x: -351.065,
                    y: -95.106
                },
                "10": {
                    x: -357.75,
                    y: -98.1,
                    sx: 1,
                    sy: 1,
                    r: -2.815
                },
                "11": {
                    x: -357.792,
                    y: -97.652,
                    sx: 0.999,
                    sy: 0.999,
                    r: -2.817
                },
                "12": {
                    x: -358.142,
                    y: -96.052,
                    a: 0.99
                },
                "13": {
                    x: -358.792,
                    y: -93.302,
                    a: 0.98
                },
                "14": {
                    x: -359.692,
                    y: -89.302,
                    a: 0.96
                },
                "15": {
                    x: -360.892,
                    y: -83.902,
                    a: 0.95
                },
                "16": {
                    x: -362.442,
                    y: -77.002,
                    a: 0.92
                },
                "17": {
                    x: -364.292,
                    y: -68.552,
                    a: 0.89
                },
                "18": {
                    x: -366.592,
                    y: -58.452,
                    a: 0.85
                },
                "19": {
                    x: -369.242,
                    y: -46.602,
                    a: 0.8
                },
                "20": {
                    x: -372.242,
                    y: -33.052,
                    a: 0.75
                },
                "21": {
                    x: -375.642,
                    y: -17.902,
                    a: 0.7
                },
                "22": {
                    x: -379.342,
                    y: -1.302,
                    a: 0.63
                },
                "23": {
                    x: -383.292,
                    y: 16.348,
                    a: 0.56
                },
                "24": {
                    x: -387.392,
                    y: 34.648,
                    a: 0.5
                },
                "25": {
                    x: -391.492,
                    y: 53.048,
                    a: 0.43
                },
                "26": {
                    x: -395.492,
                    y: 70.998,
                    a: 0.36
                },
                "27": {
                    x: -399.292,
                    y: 87.898,
                    a: 0.29
                },
                "28": {
                    x: -402.742,
                    y: 103.398,
                    a: 0.23
                },
                "29": {
                    x: -405.842,
                    y: 117.148,
                    a: 0.18
                },
                "30": {
                    x: -408.542,
                    y: 129.148,
                    a: 0.14
                },
                "31": {
                    x: -410.792,
                    y: 139.198,
                    a: 0.1
                },
                "32": {
                    x: -412.592,
                    y: 147.448,
                    a: 0.07
                },
                "33": {
                    x: -414.042,
                    y: 153.898,
                    a: 0.04
                },
                "34": {
                    x: -415.142,
                    y: 158.748,
                    a: 0.02
                },
                "35": {
                    x: -415.892,
                    y: 162.048,
                    a: 0.01
                }
            })
            .addTimedChild(instance1, 0, 36, {
                "0": {
                    x: -47.35,
                    y: 31.85,
                    sx: 1,
                    sy: 1,
                    r: -0.663,
                    a: 1
                },
                "1": {
                    x: -135.95,
                    y: -43.613,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "2": {
                    x: -202.43,
                    y: -100.286,
                    sx: 0.997,
                    sy: 0.997
                },
                "3": {
                    x: -246.75,
                    y: -138.05,
                    sx: 0.998,
                    sy: 0.998
                },
                "4": {
                    x: -252.013,
                    y: -141.847,
                    sx: 0.997,
                    sy: 0.997
                },
                "5": {
                    x: -257.381,
                    y: -145.716
                },
                "6": {
                    x: -262.645,
                    y: -149.476
                },
                "7": {
                    x: -267.954,
                    y: -153.295,
                    sx: 0.998,
                    sy: 0.998
                },
                "8": {
                    x: -273.272,
                    y: -157.113
                },
                "9": {
                    x: -278.637,
                    y: -160.93
                },
                "10": {
                    x: -283.95,
                    y: -164.75,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "11": {
                    x: -284.064,
                    y: -163.721,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "12": {
                    x: -284.414,
                    y: -160.521,
                    a: 0.99
                },
                "13": {
                    x: -285.064,
                    y: -154.871,
                    a: 0.98
                },
                "14": {
                    x: -285.964,
                    y: -146.671,
                    a: 0.96
                },
                "15": {
                    x: -287.164,
                    y: -135.671,
                    a: 0.95
                },
                "16": {
                    x: -288.714,
                    y: -121.621,
                    a: 0.92
                },
                "17": {
                    x: -290.564,
                    y: -104.371,
                    a: 0.89
                },
                "18": {
                    x: -292.864,
                    y: -83.721,
                    a: 0.85
                },
                "19": {
                    x: -295.514,
                    y: -59.571,
                    a: 0.8
                },
                "20": {
                    x: -298.514,
                    y: -31.921,
                    a: 0.75
                },
                "21": {
                    x: -301.914,
                    y: -0.921,
                    a: 0.7
                },
                "22": {
                    x: -305.614,
                    y: 32.929,
                    a: 0.63
                },
                "23": {
                    x: -309.564,
                    y: 68.979,
                    a: 0.56
                },
                "24": {
                    x: -313.664,
                    y: 106.379,
                    a: 0.5
                },
                "25": {
                    x: -317.764,
                    y: 143.929,
                    a: 0.43
                },
                "26": {
                    x: -321.764,
                    y: 180.529,
                    a: 0.36
                },
                "27": {
                    x: -325.564,
                    y: 215.029,
                    a: 0.29
                },
                "28": {
                    x: -329.014,
                    y: 246.629,
                    a: 0.23
                },
                "29": {
                    x: -332.114,
                    y: 274.829,
                    a: 0.18
                },
                "30": {
                    x: -334.814,
                    y: 299.229,
                    a: 0.14
                },
                "31": {
                    x: -337.064,
                    y: 319.779,
                    a: 0.1
                },
                "32": {
                    x: -338.864,
                    y: 336.579,
                    a: 0.07
                },
                "33": {
                    x: -340.314,
                    y: 349.829,
                    a: 0.04
                },
                "34": {
                    x: -341.414,
                    y: 359.679,
                    a: 0.02
                },
                "35": {
                    x: -342.164,
                    y: 366.429,
                    a: 0.01
                }
            });
    });

    var Graphic47 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti5"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic48 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic49 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic50 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic51 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic52 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti4"))
            .setTransform(-4.9, -2.35);
        this.addTimedChild(instance1);
    });

    var Graphic53 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic54 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti2"))
            .setTransform(-5.65, -6.85);
        this.addTimedChild(instance1);
    });

    var Graphic55 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti4"))
            .setTransform(-4.9, -2.35);
        this.addTimedChild(instance1);
    });

    var Graphic56 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic57 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic58 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic59 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic60 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti2"))
            .setTransform(-5.65, -6.85);
        this.addTimedChild(instance1);
    });

    var Graphic61 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti4"))
            .setTransform(-4.9, -2.35);
        this.addTimedChild(instance1);
    });

    var Graphic62 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic63 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti6"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic64 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti1"))
            .setTransform(-7, -4.7);
        this.addTimedChild(instance1);
    });

    var Graphic65 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti5"))
            .setTransform(-6.05, -3);
        this.addTimedChild(instance1);
    });

    var Graphic66 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("confetti3"))
            .setTransform(-4.65, -2.8);
        this.addTimedChild(instance1);
    });

    var Graphic67 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance20 = new Graphic66(MovieClip.SYNCHED);
        var instance19 = new Graphic65(MovieClip.SYNCHED);
        var instance18 = new Graphic64(MovieClip.SYNCHED);
        var instance17 = new Graphic63(MovieClip.SYNCHED);
        var instance16 = new Graphic62(MovieClip.SYNCHED);
        var instance15 = new Graphic61(MovieClip.SYNCHED);
        var instance14 = new Graphic60(MovieClip.SYNCHED);
        var instance13 = new Graphic59(MovieClip.SYNCHED);
        var instance12 = new Graphic58(MovieClip.SYNCHED);
        var instance11 = new Graphic57(MovieClip.SYNCHED);
        var instance10 = new Graphic56(MovieClip.SYNCHED);
        var instance9 = new Graphic55(MovieClip.SYNCHED);
        var instance8 = new Graphic54(MovieClip.SYNCHED);
        var instance7 = new Graphic53(MovieClip.SYNCHED);
        var instance6 = new Graphic52(MovieClip.SYNCHED);
        var instance5 = new Graphic51(MovieClip.SYNCHED);
        var instance4 = new Graphic50(MovieClip.SYNCHED);
        var instance3 = new Graphic49(MovieClip.SYNCHED);
        var instance2 = new Graphic48(MovieClip.SYNCHED);
        var instance1 = new Graphic47(MovieClip.SYNCHED);
        this.addTimedChild(instance20, 0, 37, {
                "0": {
                    x: 181.283,
                    y: -20.441,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 265.393,
                    y: -58.447,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 321.4,
                    y: -83.8,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 328.138,
                    y: -86.322,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 334.911,
                    y: -88.962
                },
                "5": {
                    x: 341.624,
                    y: -91.555
                },
                "6": {
                    x: 348.338,
                    y: -94.037,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 355.112,
                    y: -96.627
                },
                "8": {
                    x: 361.88,
                    y: -99.216
                },
                "9": {
                    x: 368.6,
                    y: -101.75,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 368.733,
                    y: -101.057,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 369.183,
                    y: -98.807,
                    a: 0.99
                },
                "12": {
                    x: 369.933,
                    y: -94.907,
                    a: 0.98
                },
                "13": {
                    x: 371.033,
                    y: -89.207,
                    a: 0.96
                },
                "14": {
                    x: 372.533,
                    y: -81.607,
                    a: 0.95
                },
                "15": {
                    x: 374.433,
                    y: -71.857,
                    a: 0.92
                },
                "16": {
                    x: 376.783,
                    y: -59.907,
                    a: 0.89
                },
                "17": {
                    x: 379.583,
                    y: -45.607,
                    a: 0.85
                },
                "18": {
                    x: 382.883,
                    y: -28.857,
                    a: 0.8
                },
                "19": {
                    x: 386.633,
                    y: -9.707,
                    a: 0.75
                },
                "20": {
                    x: 390.833,
                    y: 11.743,
                    a: 0.7
                },
                "21": {
                    x: 395.433,
                    y: 35.193,
                    a: 0.63
                },
                "22": {
                    x: 400.383,
                    y: 60.193,
                    a: 0.56
                },
                "23": {
                    x: 405.433,
                    y: 86.093,
                    a: 0.5
                },
                "24": {
                    x: 410.533,
                    y: 112.093,
                    a: 0.43
                },
                "25": {
                    x: 415.533,
                    y: 137.443,
                    a: 0.36
                },
                "26": {
                    x: 420.233,
                    y: 161.343,
                    a: 0.29
                },
                "27": {
                    x: 424.533,
                    y: 183.243,
                    a: 0.23
                },
                "28": {
                    x: 428.333,
                    y: 202.743,
                    a: 0.18
                },
                "29": {
                    x: 431.633,
                    y: 219.643,
                    a: 0.14
                },
                "30": {
                    x: 434.433,
                    y: 233.893,
                    a: 0.1
                },
                "31": {
                    x: 436.733,
                    y: 245.543,
                    a: 0.07
                },
                "32": {
                    x: 438.533,
                    y: 254.693,
                    a: 0.04
                },
                "33": {
                    x: 439.883,
                    y: 261.543,
                    a: 0.02
                },
                "34": {
                    x: 440.783,
                    y: 266.193,
                    a: 0.01
                },
                "35": {
                    x: 441.333,
                    y: 268.893,
                    a: 0
                },
                "36": {
                    x: 441.5,
                    y: 269.75,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance19, 0, 37, {
                "0": {
                    x: 203.56,
                    y: -5.612,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 260.141,
                    y: -26.656,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 297.85,
                    y: -40.65,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 302.755,
                    y: -42.04,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 307.625,
                    y: -43.418
                },
                "5": {
                    x: 312.536,
                    y: -44.799
                },
                "6": {
                    x: 317.398,
                    y: -46.271,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 322.268,
                    y: -47.7
                },
                "8": {
                    x: 327.134,
                    y: -49.077
                },
                "9": {
                    x: 332.05,
                    y: -50.5,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 332.204,
                    y: -49.752,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 332.654,
                    y: -47.452,
                    a: 0.99
                },
                "12": {
                    x: 333.454,
                    y: -43.452,
                    a: 0.98
                },
                "13": {
                    x: 334.604,
                    y: -37.552,
                    a: 0.96
                },
                "14": {
                    x: 336.154,
                    y: -29.652,
                    a: 0.95
                },
                "15": {
                    x: 338.154,
                    y: -19.652,
                    a: 0.92
                },
                "16": {
                    x: 340.604,
                    y: -7.252,
                    a: 0.89
                },
                "17": {
                    x: 343.554,
                    y: 7.498,
                    a: 0.85
                },
                "18": {
                    x: 346.954,
                    y: 24.798,
                    a: 0.8
                },
                "19": {
                    x: 350.854,
                    y: 44.598,
                    a: 0.75
                },
                "20": {
                    x: 355.254,
                    y: 66.748,
                    a: 0.7
                },
                "21": {
                    x: 360.054,
                    y: 90.998,
                    a: 0.63
                },
                "22": {
                    x: 365.154,
                    y: 116.848,
                    a: 0.56
                },
                "23": {
                    x: 370.454,
                    y: 143.598,
                    a: 0.5
                },
                "24": {
                    x: 375.754,
                    y: 170.498,
                    a: 0.43
                },
                "25": {
                    x: 380.954,
                    y: 196.648,
                    a: 0.36
                },
                "26": {
                    x: 385.854,
                    y: 221.348,
                    a: 0.29
                },
                "27": {
                    x: 390.304,
                    y: 243.998,
                    a: 0.23
                },
                "28": {
                    x: 394.304,
                    y: 264.148,
                    a: 0.18
                },
                "29": {
                    x: 397.754,
                    y: 281.648,
                    a: 0.14
                },
                "30": {
                    x: 400.654,
                    y: 296.348,
                    a: 0.1
                },
                "31": {
                    x: 403.054,
                    y: 308.398,
                    a: 0.07
                },
                "32": {
                    x: 404.954,
                    y: 317.848,
                    a: 0.04
                },
                "33": {
                    x: 406.304,
                    y: 324.898,
                    a: 0.02
                },
                "34": {
                    x: 407.304,
                    y: 329.748,
                    a: 0.01
                },
                "35": {
                    x: 407.804,
                    y: 332.498,
                    a: 0
                },
                "36": {
                    x: 408,
                    y: 333.4,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance18, 0, 37, {
                "0": {
                    x: 124.65,
                    y: 3.75,
                    a: 1
                },
                "1": {
                    x: 170.9,
                    y: -1.6
                },
                "2": {
                    x: 201.7,
                    y: -5.2
                },
                "3": {
                    x: 205.9,
                    y: -5.55
                },
                "4": {
                    x: 210.1,
                    y: -5.95
                },
                "5": {
                    x: 214.3,
                    y: -6.3
                },
                "6": {
                    x: 218.45,
                    y: -6.65
                },
                "7": {
                    x: 222.65,
                    y: -7
                },
                "8": {
                    x: 226.85,
                    y: -7.4
                },
                "9": {
                    x: 231.05,
                    y: -7.75
                },
                "10": {
                    x: 231.15,
                    y: -7.2
                },
                "11": {
                    x: 231.55,
                    y: -5.5,
                    a: 0.99
                },
                "12": {
                    x: 232.2,
                    y: -2.5,
                    a: 0.98
                },
                "13": {
                    x: 233.2,
                    y: 1.85,
                    a: 0.96
                },
                "14": {
                    x: 234.5,
                    y: 7.7,
                    a: 0.95
                },
                "15": {
                    x: 236.15,
                    y: 15.15,
                    a: 0.92
                },
                "16": {
                    x: 238.2,
                    y: 24.3,
                    a: 0.89
                },
                "17": {
                    x: 240.65,
                    y: 35.25,
                    a: 0.85
                },
                "18": {
                    x: 243.5,
                    y: 48.05,
                    a: 0.8
                },
                "19": {
                    x: 246.8,
                    y: 62.7,
                    a: 0.75
                },
                "20": {
                    x: 250.45,
                    y: 79.15,
                    a: 0.7
                },
                "21": {
                    x: 254.5,
                    y: 97.1,
                    a: 0.63
                },
                "22": {
                    x: 258.75,
                    y: 116.2,
                    a: 0.56
                },
                "23": {
                    x: 263.2,
                    y: 136.05,
                    a: 0.5
                },
                "24": {
                    x: 267.65,
                    y: 155.95,
                    a: 0.43
                },
                "25": {
                    x: 271.95,
                    y: 175.35,
                    a: 0.36
                },
                "26": {
                    x: 276.05,
                    y: 193.65,
                    a: 0.29
                },
                "27": {
                    x: 279.8,
                    y: 210.45,
                    a: 0.23
                },
                "28": {
                    x: 283.15,
                    y: 225.35,
                    a: 0.18
                },
                "29": {
                    x: 286.05,
                    y: 238.3,
                    a: 0.14
                },
                "30": {
                    x: 288.45,
                    y: 249.2,
                    a: 0.1
                },
                "31": {
                    x: 290.45,
                    y: 258.15,
                    a: 0.07
                },
                "32": {
                    x: 292.05,
                    y: 265.15,
                    a: 0.04
                },
                "33": {
                    x: 293.2,
                    y: 270.35,
                    a: 0.02
                },
                "34": {
                    x: 294,
                    y: 273.95,
                    a: 0.01
                },
                "35": {
                    x: 294.45,
                    y: 276,
                    a: 0
                },
                "36": {
                    x: 294.6,
                    y: 276.65
                }
            })
            .addTimedChild(instance17, 0, 37, {
                "0": {
                    x: 181.647,
                    y: -34.374,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 246.642,
                    y: -93.184,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 290.05,
                    y: -132.45,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 295.498,
                    y: -136.416,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 300.961,
                    y: -140.366
                },
                "5": {
                    x: 306.413,
                    y: -144.367
                },
                "6": {
                    x: 311.869,
                    y: -148.308,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 317.281,
                    y: -152.258
                },
                "8": {
                    x: 322.79,
                    y: -156.306
                },
                "9": {
                    x: 328.2,
                    y: -160.25,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 328.348,
                    y: -159.582,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 328.798,
                    y: -157.482,
                    a: 0.99
                },
                "12": {
                    x: 329.548,
                    y: -153.732,
                    a: 0.98
                },
                "13": {
                    x: 330.648,
                    y: -148.332,
                    a: 0.96
                },
                "14": {
                    x: 332.148,
                    y: -141.032,
                    a: 0.95
                },
                "15": {
                    x: 334.048,
                    y: -131.782,
                    a: 0.92
                },
                "16": {
                    x: 336.398,
                    y: -120.382,
                    a: 0.89
                },
                "17": {
                    x: 339.198,
                    y: -106.732,
                    a: 0.85
                },
                "18": {
                    x: 342.498,
                    y: -90.732,
                    a: 0.8
                },
                "19": {
                    x: 346.248,
                    y: -72.482,
                    a: 0.75
                },
                "20": {
                    x: 350.448,
                    y: -52.032,
                    a: 0.7
                },
                "21": {
                    x: 355.048,
                    y: -29.632,
                    a: 0.63
                },
                "22": {
                    x: 359.948,
                    y: -5.782,
                    a: 0.56
                },
                "23": {
                    x: 365.048,
                    y: 18.918,
                    a: 0.5
                },
                "24": {
                    x: 370.148,
                    y: 43.718,
                    a: 0.43
                },
                "25": {
                    x: 375.098,
                    y: 67.868,
                    a: 0.36
                },
                "26": {
                    x: 379.798,
                    y: 90.718,
                    a: 0.29
                },
                "27": {
                    x: 384.098,
                    y: 111.618,
                    a: 0.23
                },
                "28": {
                    x: 387.898,
                    y: 130.218,
                    a: 0.18
                },
                "29": {
                    x: 391.248,
                    y: 146.318,
                    a: 0.14
                },
                "30": {
                    x: 393.998,
                    y: 159.918,
                    a: 0.1
                },
                "31": {
                    x: 396.298,
                    y: 171.018,
                    a: 0.07
                },
                "32": {
                    x: 398.098,
                    y: 179.768,
                    a: 0.04
                },
                "33": {
                    x: 399.448,
                    y: 186.268,
                    a: 0.02
                },
                "34": {
                    x: 400.348,
                    y: 190.718,
                    a: 0.01
                },
                "35": {
                    x: 400.898,
                    y: 193.318,
                    a: 0
                },
                "36": {
                    x: 401.05,
                    y: 194.15,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance16, 0, 37, {
                "0": {
                    x: 140.05,
                    y: -25.15,
                    a: 1
                },
                "1": {
                    x: 216.5,
                    y: -62.1
                },
                "2": {
                    x: 267.5,
                    y: -86.75
                },
                "3": {
                    x: 273.75,
                    y: -89.25
                },
                "4": {
                    x: 279.95,
                    y: -91.7
                },
                "5": {
                    x: 286.2,
                    y: -94.2
                },
                "6": {
                    x: 292.4,
                    y: -96.7
                },
                "7": {
                    x: 298.65,
                    y: -99.2
                },
                "8": {
                    x: 304.85,
                    y: -101.65
                },
                "9": {
                    x: 311.1,
                    y: -104.15
                },
                "10": {
                    x: 311.25,
                    y: -103.4
                },
                "11": {
                    x: 311.65,
                    y: -101.05,
                    a: 0.99
                },
                "12": {
                    x: 312.35,
                    y: -97,
                    a: 0.98
                },
                "13": {
                    x: 313.35,
                    y: -91.1,
                    a: 0.96
                },
                "14": {
                    x: 314.7,
                    y: -83.15,
                    a: 0.95
                },
                "15": {
                    x: 316.45,
                    y: -73,
                    a: 0.92
                },
                "16": {
                    x: 318.6,
                    y: -60.55,
                    a: 0.89
                },
                "17": {
                    x: 321.2,
                    y: -45.65,
                    a: 0.85
                },
                "18": {
                    x: 324.2,
                    y: -28.2,
                    a: 0.8
                },
                "19": {
                    x: 327.6,
                    y: -8.25,
                    a: 0.75
                },
                "20": {
                    x: 331.45,
                    y: 14.1,
                    a: 0.7
                },
                "21": {
                    x: 335.65,
                    y: 38.55,
                    a: 0.63
                },
                "22": {
                    x: 340.15,
                    y: 64.55,
                    a: 0.56
                },
                "23": {
                    x: 344.8,
                    y: 91.55,
                    a: 0.5
                },
                "24": {
                    x: 349.45,
                    y: 118.65,
                    a: 0.43
                },
                "25": {
                    x: 354,
                    y: 145.05,
                    a: 0.36
                },
                "26": {
                    x: 358.3,
                    y: 169.95,
                    a: 0.29
                },
                "27": {
                    x: 362.25,
                    y: 192.8,
                    a: 0.23
                },
                "28": {
                    x: 365.75,
                    y: 213.1,
                    a: 0.18
                },
                "29": {
                    x: 368.75,
                    y: 230.7,
                    a: 0.14
                },
                "30": {
                    x: 371.3,
                    y: 245.55,
                    a: 0.1
                },
                "31": {
                    x: 373.4,
                    y: 257.7,
                    a: 0.07
                },
                "32": {
                    x: 375.05,
                    y: 267.25,
                    a: 0.04
                },
                "33": {
                    x: 376.3,
                    y: 274.35,
                    a: 0.02
                },
                "34": {
                    x: 377.1,
                    y: 279.2,
                    a: 0.01
                },
                "35": {
                    x: 377.6,
                    y: 282,
                    a: 0
                },
                "36": {
                    x: 377.75,
                    y: 282.9
                }
            })
            .addTimedChild(instance15, 0, 37, {
                "0": {
                    x: 163.662,
                    y: -56.589,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 204.753,
                    y: -113.034,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 232.15,
                    y: -150.6,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 236.034,
                    y: -154.362,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 239.832,
                    y: -158.163
                },
                "5": {
                    x: 243.67,
                    y: -162.013
                },
                "6": {
                    x: 247.462,
                    y: -165.755,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 251.36,
                    y: -169.556
                },
                "8": {
                    x: 255.154,
                    y: -173.355
                },
                "9": {
                    x: 259.05,
                    y: -177.15,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 259.188,
                    y: -176.173,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 259.588,
                    y: -172.973,
                    a: 0.99
                },
                "12": {
                    x: 260.338,
                    y: -167.423,
                    a: 0.98
                },
                "13": {
                    x: 261.388,
                    y: -159.323,
                    a: 0.96
                },
                "14": {
                    x: 262.838,
                    y: -148.473,
                    a: 0.95
                },
                "15": {
                    x: 264.638,
                    y: -134.673,
                    a: 0.92
                },
                "16": {
                    x: 266.888,
                    y: -117.673,
                    a: 0.89
                },
                "17": {
                    x: 269.588,
                    y: -97.273,
                    a: 0.85
                },
                "18": {
                    x: 272.738,
                    y: -73.473,
                    a: 0.8
                },
                "19": {
                    x: 276.338,
                    y: -46.223,
                    a: 0.75
                },
                "20": {
                    x: 280.338,
                    y: -15.723,
                    a: 0.7
                },
                "21": {
                    x: 284.738,
                    y: 17.627,
                    a: 0.63
                },
                "22": {
                    x: 289.438,
                    y: 53.177,
                    a: 0.56
                },
                "23": {
                    x: 294.288,
                    y: 90.027,
                    a: 0.5
                },
                "24": {
                    x: 299.188,
                    y: 127.027,
                    a: 0.43
                },
                "25": {
                    x: 303.938,
                    y: 163.077,
                    a: 0.36
                },
                "26": {
                    x: 308.438,
                    y: 197.077,
                    a: 0.29
                },
                "27": {
                    x: 312.538,
                    y: 228.277,
                    a: 0.23
                },
                "28": {
                    x: 316.188,
                    y: 256.027,
                    a: 0.18
                },
                "29": {
                    x: 319.388,
                    y: 280.077,
                    a: 0.14
                },
                "30": {
                    x: 322.038,
                    y: 300.327,
                    a: 0.1
                },
                "31": {
                    x: 324.238,
                    y: 316.927,
                    a: 0.07
                },
                "32": {
                    x: 325.988,
                    y: 329.927,
                    a: 0.04
                },
                "33": {
                    x: 327.238,
                    y: 339.627,
                    a: 0.02
                },
                "34": {
                    x: 328.138,
                    y: 346.277,
                    a: 0.01
                },
                "35": {
                    x: 328.638,
                    y: 350.077,
                    a: 0
                },
                "36": {
                    x: 328.8,
                    y: 351.35,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance14, 0, 37, {
                "0": {
                    x: 129.51,
                    y: -26.921,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 177.123,
                    y: -61.672,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 208.8,
                    y: -84.75,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 213.093,
                    y: -87.06,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 217.339,
                    y: -89.394
                },
                "5": {
                    x: 221.627,
                    y: -91.728
                },
                "6": {
                    x: 225.968,
                    y: -94.005,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 230.263,
                    y: -96.339
                },
                "8": {
                    x: 234.456,
                    y: -98.671
                },
                "9": {
                    x: 238.8,
                    y: -101.05,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 238.94,
                    y: -100.53,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 239.34,
                    y: -98.88,
                    a: 0.99
                },
                "12": {
                    x: 240.04,
                    y: -96.03,
                    a: 0.98
                },
                "13": {
                    x: 241.04,
                    y: -91.83,
                    a: 0.96
                },
                "14": {
                    x: 242.39,
                    y: -86.23,
                    a: 0.95
                },
                "15": {
                    x: 244.14,
                    y: -79.08,
                    a: 0.92
                },
                "16": {
                    x: 246.29,
                    y: -70.28,
                    a: 0.89
                },
                "17": {
                    x: 248.89,
                    y: -59.73,
                    a: 0.85
                },
                "18": {
                    x: 251.89,
                    y: -47.38,
                    a: 0.8
                },
                "19": {
                    x: 255.29,
                    y: -33.28,
                    a: 0.75
                },
                "20": {
                    x: 259.14,
                    y: -17.48,
                    a: 0.7
                },
                "21": {
                    x: 263.34,
                    y: -0.23,
                    a: 0.63
                },
                "22": {
                    x: 267.84,
                    y: 18.17,
                    a: 0.56
                },
                "23": {
                    x: 272.49,
                    y: 37.27,
                    a: 0.5
                },
                "24": {
                    x: 277.14,
                    y: 56.42,
                    a: 0.43
                },
                "25": {
                    x: 281.69,
                    y: 75.07,
                    a: 0.36
                },
                "26": {
                    x: 285.99,
                    y: 92.67,
                    a: 0.29
                },
                "27": {
                    x: 289.94,
                    y: 108.82,
                    a: 0.23
                },
                "28": {
                    x: 293.44,
                    y: 123.17,
                    a: 0.18
                },
                "29": {
                    x: 296.44,
                    y: 135.62,
                    a: 0.14
                },
                "30": {
                    x: 298.99,
                    y: 146.12,
                    a: 0.1
                },
                "31": {
                    x: 301.09,
                    y: 154.72,
                    a: 0.07
                },
                "32": {
                    x: 302.74,
                    y: 161.47,
                    a: 0.04
                },
                "33": {
                    x: 303.99,
                    y: 166.47,
                    a: 0.02
                },
                "34": {
                    x: 304.79,
                    y: 169.92,
                    a: 0.01
                },
                "35": {
                    x: 305.29,
                    y: 171.87,
                    a: 0
                },
                "36": {
                    x: 305.45,
                    y: 172.55,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance13, 0, 37, {
                "0": {
                    x: 85.163,
                    y: -2.775,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 116.434,
                    y: -39.243,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 137.25,
                    y: -63.65,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 140.434,
                    y: -66.114,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 143.613,
                    y: -68.538
                },
                "5": {
                    x: 146.838,
                    y: -71.012
                },
                "6": {
                    x: 149.964,
                    y: -73.582,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 153.144,
                    y: -76.006
                },
                "8": {
                    x: 156.322,
                    y: -78.479
                },
                "9": {
                    x: 159.5,
                    y: -80.85,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 159.533,
                    y: -80.348,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 159.833,
                    y: -78.748,
                    a: 0.99
                },
                "12": {
                    x: 160.333,
                    y: -75.998,
                    a: 0.98
                },
                "13": {
                    x: 161.033,
                    y: -71.948,
                    a: 0.96
                },
                "14": {
                    x: 162.033,
                    y: -66.498,
                    a: 0.95
                },
                "15": {
                    x: 163.283,
                    y: -59.598,
                    a: 0.92
                },
                "16": {
                    x: 164.833,
                    y: -51.098,
                    a: 0.89
                },
                "17": {
                    x: 166.683,
                    y: -40.898,
                    a: 0.85
                },
                "18": {
                    x: 168.833,
                    y: -28.998,
                    a: 0.8
                },
                "19": {
                    x: 171.333,
                    y: -15.398,
                    a: 0.75
                },
                "20": {
                    x: 174.083,
                    y: -0.148,
                    a: 0.7
                },
                "21": {
                    x: 177.133,
                    y: 16.552,
                    a: 0.63
                },
                "22": {
                    x: 180.333,
                    y: 34.352,
                    a: 0.56
                },
                "23": {
                    x: 183.683,
                    y: 52.752,
                    a: 0.5
                },
                "24": {
                    x: 187.083,
                    y: 71.252,
                    a: 0.43
                },
                "25": {
                    x: 190.333,
                    y: 89.302,
                    a: 0.36
                },
                "26": {
                    x: 193.433,
                    y: 106.302,
                    a: 0.29
                },
                "27": {
                    x: 196.233,
                    y: 121.852,
                    a: 0.23
                },
                "28": {
                    x: 198.783,
                    y: 135.752,
                    a: 0.18
                },
                "29": {
                    x: 200.983,
                    y: 147.752,
                    a: 0.14
                },
                "30": {
                    x: 202.783,
                    y: 157.902,
                    a: 0.1
                },
                "31": {
                    x: 204.283,
                    y: 166.202,
                    a: 0.07
                },
                "32": {
                    x: 205.483,
                    y: 172.702,
                    a: 0.04
                },
                "33": {
                    x: 206.383,
                    y: 177.552,
                    a: 0.02
                },
                "34": {
                    x: 206.983,
                    y: 180.902,
                    a: 0.01
                },
                "35": {
                    x: 207.333,
                    y: 182.802,
                    a: 0
                },
                "36": {
                    x: 207.5,
                    y: 183.4,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance12, 0, 37, {
                "0": {
                    x: 107.1,
                    y: -24.35,
                    a: 1
                },
                "1": {
                    x: 137.9,
                    y: -78.75
                },
                "2": {
                    x: 158.45,
                    y: -115
                },
                "3": {
                    x: 161.6,
                    y: -118.65
                },
                "4": {
                    x: 164.75,
                    y: -122.35
                },
                "5": {
                    x: 167.9,
                    y: -126
                },
                "6": {
                    x: 171.05,
                    y: -129.65
                },
                "7": {
                    x: 174.2,
                    y: -133.3
                },
                "8": {
                    x: 177.35,
                    y: -137
                },
                "9": {
                    x: 180.5,
                    y: -140.65
                },
                "10": {
                    x: 180.6,
                    y: -139.75
                },
                "11": {
                    x: 181,
                    y: -137.05,
                    a: 0.99
                },
                "12": {
                    x: 181.65,
                    y: -132.25,
                    a: 0.98
                },
                "13": {
                    x: 182.65,
                    y: -125.3,
                    a: 0.96
                },
                "14": {
                    x: 183.95,
                    y: -115.95,
                    a: 0.95
                },
                "15": {
                    x: 185.6,
                    y: -104,
                    a: 0.92
                },
                "16": {
                    x: 187.65,
                    y: -89.35,
                    a: 0.89
                },
                "17": {
                    x: 190.1,
                    y: -71.8,
                    a: 0.85
                },
                "18": {
                    x: 192.95,
                    y: -51.3,
                    a: 0.8
                },
                "19": {
                    x: 196.25,
                    y: -27.8,
                    a: 0.75
                },
                "20": {
                    x: 199.9,
                    y: -1.5,
                    a: 0.7
                },
                "21": {
                    x: 203.95,
                    y: 27.25,
                    a: 0.63
                },
                "22": {
                    x: 208.2,
                    y: 57.9,
                    a: 0.56
                },
                "23": {
                    x: 212.65,
                    y: 89.65,
                    a: 0.5
                },
                "24": {
                    x: 217.1,
                    y: 121.5,
                    a: 0.43
                },
                "25": {
                    x: 221.4,
                    y: 152.6,
                    a: 0.36
                },
                "26": {
                    x: 225.5,
                    y: 181.9,
                    a: 0.29
                },
                "27": {
                    x: 229.25,
                    y: 208.75,
                    a: 0.23
                },
                "28": {
                    x: 232.6,
                    y: 232.65,
                    a: 0.18
                },
                "29": {
                    x: 235.5,
                    y: 253.4,
                    a: 0.14
                },
                "30": {
                    x: 237.9,
                    y: 270.85,
                    a: 0.1
                },
                "31": {
                    x: 239.9,
                    y: 285.15,
                    a: 0.07
                },
                "32": {
                    x: 241.5,
                    y: 296.35,
                    a: 0.04
                },
                "33": {
                    x: 242.65,
                    y: 304.75,
                    a: 0.02
                },
                "34": {
                    x: 243.45,
                    y: 310.45,
                    a: 0.01
                },
                "35": {
                    x: 243.9,
                    y: 313.75,
                    a: 0
                },
                "36": {
                    x: 244.05,
                    y: 314.8
                }
            })
            .addTimedChild(instance11, 0, 37, {
                "0": {
                    x: 66.074,
                    y: -28.222,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: 84.797,
                    y: -81.538,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: 97.3,
                    y: -117.1,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: 99.607,
                    y: -120.705,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: 101.874,
                    y: -124.29
                },
                "5": {
                    x: 104.236,
                    y: -127.972
                },
                "6": {
                    x: 106.601,
                    y: -131.451,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: 108.918,
                    y: -135.036
                },
                "8": {
                    x: 111.233,
                    y: -138.669
                },
                "9": {
                    x: 113.65,
                    y: -142.25,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: 113.761,
                    y: -141.728,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: 114.061,
                    y: -140.228,
                    a: 0.99
                },
                "12": {
                    x: 114.561,
                    y: -137.578,
                    a: 0.98
                },
                "13": {
                    x: 115.261,
                    y: -133.728,
                    a: 0.96
                },
                "14": {
                    x: 116.261,
                    y: -128.578,
                    a: 0.95
                },
                "15": {
                    x: 117.511,
                    y: -121.978,
                    a: 0.92
                },
                "16": {
                    x: 119.061,
                    y: -113.878,
                    a: 0.89
                },
                "17": {
                    x: 120.911,
                    y: -104.178,
                    a: 0.85
                },
                "18": {
                    x: 123.061,
                    y: -92.828,
                    a: 0.8
                },
                "19": {
                    x: 125.561,
                    y: -79.828,
                    a: 0.75
                },
                "20": {
                    x: 128.311,
                    y: -65.278,
                    a: 0.7
                },
                "21": {
                    x: 131.361,
                    y: -49.378,
                    a: 0.63
                },
                "22": {
                    x: 134.561,
                    y: -32.428,
                    a: 0.56
                },
                "23": {
                    x: 137.911,
                    y: -14.878,
                    a: 0.5
                },
                "24": {
                    x: 141.311,
                    y: 2.722,
                    a: 0.43
                },
                "25": {
                    x: 144.561,
                    y: 19.922,
                    a: 0.36
                },
                "26": {
                    x: 147.661,
                    y: 36.122,
                    a: 0.29
                },
                "27": {
                    x: 150.461,
                    y: 50.972,
                    a: 0.23
                },
                "28": {
                    x: 153.011,
                    y: 64.222,
                    a: 0.18
                },
                "29": {
                    x: 155.211,
                    y: 75.672,
                    a: 0.14
                },
                "30": {
                    x: 157.011,
                    y: 85.322,
                    a: 0.1
                },
                "31": {
                    x: 158.511,
                    y: 93.222,
                    a: 0.07
                },
                "32": {
                    x: 159.711,
                    y: 99.422,
                    a: 0.04
                },
                "33": {
                    x: 160.611,
                    y: 104.072,
                    a: 0.02
                },
                "34": {
                    x: 161.211,
                    y: 107.222,
                    a: 0.01
                },
                "35": {
                    x: 161.561,
                    y: 109.022,
                    a: 0
                },
                "36": {
                    x: 161.65,
                    y: 109.6,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance10, 0, 37, {
                "0": {
                    x: -116.859,
                    y: 9.704,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -138.068,
                    y: -8.626,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -152.25,
                    y: -20.85,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -154.534,
                    y: -22.075,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -156.822,
                    y: -23.321
                },
                "5": {
                    x: -159.056,
                    y: -24.513
                },
                "6": {
                    x: -161.39,
                    y: -25.761,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -163.578,
                    y: -27.007
                },
                "8": {
                    x: -165.914,
                    y: -28.252
                },
                "9": {
                    x: -168.15,
                    y: -29.5,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -168.23,
                    y: -29.14,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -168.48,
                    y: -28.09,
                    a: 0.99
                },
                "12": {
                    x: -168.88,
                    y: -26.29,
                    a: 0.98
                },
                "13": {
                    x: -169.43,
                    y: -23.64,
                    a: 0.96
                },
                "14": {
                    x: -170.18,
                    y: -20.04,
                    a: 0.95
                },
                "15": {
                    x: -171.18,
                    y: -15.49,
                    a: 0.92
                },
                "16": {
                    x: -172.33,
                    y: -9.89,
                    a: 0.89
                },
                "17": {
                    x: -173.78,
                    y: -3.19,
                    a: 0.85
                },
                "18": {
                    x: -175.43,
                    y: 4.66,
                    a: 0.8
                },
                "19": {
                    x: -177.33,
                    y: 13.66,
                    a: 0.75
                },
                "20": {
                    x: -179.48,
                    y: 23.71,
                    a: 0.7
                },
                "21": {
                    x: -181.83,
                    y: 34.71,
                    a: 0.63
                },
                "22": {
                    x: -184.33,
                    y: 46.41,
                    a: 0.56
                },
                "23": {
                    x: -186.88,
                    y: 58.56,
                    a: 0.5
                },
                "24": {
                    x: -189.48,
                    y: 70.71,
                    a: 0.43
                },
                "25": {
                    x: -191.98,
                    y: 82.61,
                    a: 0.36
                },
                "26": {
                    x: -194.38,
                    y: 93.81,
                    a: 0.29
                },
                "27": {
                    x: -196.58,
                    y: 104.06,
                    a: 0.23
                },
                "28": {
                    x: -198.53,
                    y: 113.21,
                    a: 0.18
                },
                "29": {
                    x: -200.18,
                    y: 121.16,
                    a: 0.14
                },
                "30": {
                    x: -201.63,
                    y: 127.81,
                    a: 0.1
                },
                "31": {
                    x: -202.78,
                    y: 133.26,
                    a: 0.07
                },
                "32": {
                    x: -203.68,
                    y: 137.56,
                    a: 0.04
                },
                "33": {
                    x: -204.38,
                    y: 140.76,
                    a: 0.02
                },
                "34": {
                    x: -204.83,
                    y: 142.96,
                    a: 0.01
                },
                "35": {
                    x: -205.08,
                    y: 144.21,
                    a: 0
                },
                "36": {
                    x: -205.15,
                    y: 144.6,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance9, 0, 37, {
                "0": {
                    x: -151.43,
                    y: 26.467,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -196.839,
                    y: 10.13,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -227.15,
                    y: -0.8,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -231.038,
                    y: -1.929,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -234.943,
                    y: -3.015
                },
                "5": {
                    x: -238.842,
                    y: -4.148
                },
                "6": {
                    x: -242.69,
                    y: -5.188,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -246.546,
                    y: -6.274
                },
                "8": {
                    x: -250.498,
                    y: -7.46
                },
                "9": {
                    x: -254.4,
                    y: -8.5,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -254.478,
                    y: -8.021,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -254.828,
                    y: -6.621,
                    a: 0.99
                },
                "12": {
                    x: -255.428,
                    y: -4.221,
                    a: 0.98
                },
                "13": {
                    x: -256.278,
                    y: -0.671,
                    a: 0.96
                },
                "14": {
                    x: -257.378,
                    y: 4.079,
                    a: 0.95
                },
                "15": {
                    x: -258.878,
                    y: 10.179,
                    a: 0.92
                },
                "16": {
                    x: -260.628,
                    y: 17.629,
                    a: 0.89
                },
                "17": {
                    x: -262.778,
                    y: 26.529,
                    a: 0.85
                },
                "18": {
                    x: -265.278,
                    y: 36.979,
                    a: 0.8
                },
                "19": {
                    x: -268.178,
                    y: 48.929,
                    a: 0.75
                },
                "20": {
                    x: -271.378,
                    y: 62.279,
                    a: 0.7
                },
                "21": {
                    x: -274.878,
                    y: 76.879,
                    a: 0.63
                },
                "22": {
                    x: -278.628,
                    y: 92.479,
                    a: 0.56
                },
                "23": {
                    x: -282.528,
                    y: 108.629,
                    a: 0.5
                },
                "24": {
                    x: -286.428,
                    y: 124.829,
                    a: 0.43
                },
                "25": {
                    x: -290.228,
                    y: 140.629,
                    a: 0.36
                },
                "26": {
                    x: -293.778,
                    y: 155.529,
                    a: 0.29
                },
                "27": {
                    x: -297.078,
                    y: 169.179,
                    a: 0.23
                },
                "28": {
                    x: -299.978,
                    y: 181.379,
                    a: 0.18
                },
                "29": {
                    x: -302.528,
                    y: 191.879,
                    a: 0.14
                },
                "30": {
                    x: -304.678,
                    y: 200.779,
                    a: 0.1
                },
                "31": {
                    x: -306.428,
                    y: 208.029,
                    a: 0.07
                },
                "32": {
                    x: -307.778,
                    y: 213.779,
                    a: 0.04
                },
                "33": {
                    x: -308.778,
                    y: 218.029,
                    a: 0.02
                },
                "34": {
                    x: -309.478,
                    y: 220.929,
                    a: 0.01
                },
                "35": {
                    x: -309.878,
                    y: 222.579,
                    a: 0
                },
                "36": {
                    x: -310.05,
                    y: 223.1,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance8, 0, 37, {
                "0": {
                    x: -129.467,
                    y: 15.987,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -221.92,
                    y: -4.536,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -283.55,
                    y: -18.3,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -290.604,
                    y: -19.724,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -297.625,
                    y: -21.062
                },
                "5": {
                    x: -304.737,
                    y: -22.494
                },
                "6": {
                    x: -311.798,
                    y: -23.885,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -318.868,
                    y: -25.322
                },
                "8": {
                    x: -325.934,
                    y: -26.609
                },
                "9": {
                    x: -332.95,
                    y: -28,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -333.019,
                    y: -27.474,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -333.269,
                    y: -25.774,
                    a: 0.99
                },
                "12": {
                    x: -333.669,
                    y: -22.774,
                    a: 0.98
                },
                "13": {
                    x: -334.219,
                    y: -18.424,
                    a: 0.96
                },
                "14": {
                    x: -334.969,
                    y: -12.574,
                    a: 0.95
                },
                "15": {
                    x: -335.969,
                    y: -5.124,
                    a: 0.92
                },
                "16": {
                    x: -337.119,
                    y: 4.026,
                    a: 0.89
                },
                "17": {
                    x: -338.569,
                    y: 14.976,
                    a: 0.85
                },
                "18": {
                    x: -340.219,
                    y: 27.776,
                    a: 0.8
                },
                "19": {
                    x: -342.119,
                    y: 42.426,
                    a: 0.75
                },
                "20": {
                    x: -344.269,
                    y: 58.876,
                    a: 0.7
                },
                "21": {
                    x: -346.619,
                    y: 76.826,
                    a: 0.63
                },
                "22": {
                    x: -349.119,
                    y: 95.976,
                    a: 0.56
                },
                "23": {
                    x: -351.669,
                    y: 115.776,
                    a: 0.5
                },
                "24": {
                    x: -354.269,
                    y: 135.726,
                    a: 0.43
                },
                "25": {
                    x: -356.769,
                    y: 155.126,
                    a: 0.36
                },
                "26": {
                    x: -359.169,
                    y: 173.426,
                    a: 0.29
                },
                "27": {
                    x: -361.369,
                    y: 190.176,
                    a: 0.23
                },
                "28": {
                    x: -363.319,
                    y: 205.126,
                    a: 0.18
                },
                "29": {
                    x: -364.969,
                    y: 218.076,
                    a: 0.14
                },
                "30": {
                    x: -366.419,
                    y: 228.976,
                    a: 0.1
                },
                "31": {
                    x: -367.569,
                    y: 237.926,
                    a: 0.07
                },
                "32": {
                    x: -368.469,
                    y: 244.926,
                    a: 0.04
                },
                "33": {
                    x: -369.169,
                    y: 250.126,
                    a: 0.02
                },
                "34": {
                    x: -369.619,
                    y: 253.726,
                    a: 0.01
                },
                "35": {
                    x: -369.869,
                    y: 255.776,
                    a: 0
                },
                "36": {
                    x: -369.95,
                    y: 256.45,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance7, 0, 37, {
                "0": {
                    x: -55.384,
                    y: -60.392,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -69.517,
                    y: -113.252,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -78.85,
                    y: -148.45,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -80.59,
                    y: -152.024,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -82.368,
                    y: -155.605
                },
                "5": {
                    x: -84.146,
                    y: -159.131
                },
                "6": {
                    x: -85.92,
                    y: -162.659,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -87.698,
                    y: -166.24
                },
                "8": {
                    x: -89.475,
                    y: -169.82
                },
                "9": {
                    x: -91.25,
                    y: -173.35,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -91.308,
                    y: -172.778,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -91.558,
                    y: -170.978,
                    a: 0.99
                },
                "12": {
                    x: -91.958,
                    y: -167.878,
                    a: 0.98
                },
                "13": {
                    x: -92.508,
                    y: -163.328,
                    a: 0.96
                },
                "14": {
                    x: -93.258,
                    y: -157.228,
                    a: 0.95
                },
                "15": {
                    x: -94.258,
                    y: -149.428,
                    a: 0.92
                },
                "16": {
                    x: -95.408,
                    y: -139.878,
                    a: 0.89
                },
                "17": {
                    x: -96.858,
                    y: -128.428,
                    a: 0.85
                },
                "18": {
                    x: -98.508,
                    y: -115.078,
                    a: 0.8
                },
                "19": {
                    x: -100.408,
                    y: -99.778,
                    a: 0.75
                },
                "20": {
                    x: -102.558,
                    y: -82.628,
                    a: 0.7
                },
                "21": {
                    x: -104.908,
                    y: -63.878,
                    a: 0.63
                },
                "22": {
                    x: -107.408,
                    y: -43.928,
                    a: 0.56
                },
                "23": {
                    x: -109.958,
                    y: -23.228,
                    a: 0.5
                },
                "24": {
                    x: -112.558,
                    y: -2.428,
                    a: 0.43
                },
                "25": {
                    x: -115.058,
                    y: 17.822,
                    a: 0.36
                },
                "26": {
                    x: -117.458,
                    y: 36.922,
                    a: 0.29
                },
                "27": {
                    x: -119.658,
                    y: 54.422,
                    a: 0.23
                },
                "28": {
                    x: -121.608,
                    y: 70.022,
                    a: 0.18
                },
                "29": {
                    x: -123.258,
                    y: 83.522,
                    a: 0.14
                },
                "30": {
                    x: -124.708,
                    y: 94.922,
                    a: 0.1
                },
                "31": {
                    x: -125.858,
                    y: 104.222,
                    a: 0.07
                },
                "32": {
                    x: -126.758,
                    y: 111.572,
                    a: 0.04
                },
                "33": {
                    x: -127.458,
                    y: 117.022,
                    a: 0.02
                },
                "34": {
                    x: -127.908,
                    y: 120.722,
                    a: 0.01
                },
                "35": {
                    x: -128.158,
                    y: 122.872,
                    a: 0
                },
                "36": {
                    x: -128.25,
                    y: 123.55,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance6, 0, 37, {
                "0": {
                    x: -83.616,
                    y: -35.423,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -120.101,
                    y: -80.691,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -144.4,
                    y: -110.8,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -147.713,
                    y: -113.849,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -150.955,
                    y: -116.817
                },
                "5": {
                    x: -154.244,
                    y: -119.879
                },
                "6": {
                    x: -157.53,
                    y: -122.946,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -160.772,
                    y: -126.015
                },
                "8": {
                    x: -164.062,
                    y: -129.031
                },
                "9": {
                    x: -167.35,
                    y: -132.05,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -167.406,
                    y: -131.624,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -167.656,
                    y: -130.324,
                    a: 0.99
                },
                "12": {
                    x: -168.056,
                    y: -128.124,
                    a: 0.98
                },
                "13": {
                    x: -168.606,
                    y: -124.824,
                    a: 0.96
                },
                "14": {
                    x: -169.356,
                    y: -120.474,
                    a: 0.95
                },
                "15": {
                    x: -170.356,
                    y: -114.874,
                    a: 0.92
                },
                "16": {
                    x: -171.506,
                    y: -108.024,
                    a: 0.89
                },
                "17": {
                    x: -172.956,
                    y: -99.824,
                    a: 0.85
                },
                "18": {
                    x: -174.606,
                    y: -90.224,
                    a: 0.8
                },
                "19": {
                    x: -176.506,
                    y: -79.274,
                    a: 0.75
                },
                "20": {
                    x: -178.656,
                    y: -66.974,
                    a: 0.7
                },
                "21": {
                    x: -181.006,
                    y: -53.524,
                    a: 0.63
                },
                "22": {
                    x: -183.506,
                    y: -39.224,
                    a: 0.56
                },
                "23": {
                    x: -186.056,
                    y: -24.374,
                    a: 0.5
                },
                "24": {
                    x: -188.656,
                    y: -9.424,
                    a: 0.43
                },
                "25": {
                    x: -191.156,
                    y: 5.076,
                    a: 0.36
                },
                "26": {
                    x: -193.556,
                    y: 18.776,
                    a: 0.29
                },
                "27": {
                    x: -195.756,
                    y: 31.326,
                    a: 0.23
                },
                "28": {
                    x: -197.706,
                    y: 42.526,
                    a: 0.18
                },
                "29": {
                    x: -199.356,
                    y: 52.226,
                    a: 0.14
                },
                "30": {
                    x: -200.806,
                    y: 60.376,
                    a: 0.1
                },
                "31": {
                    x: -201.956,
                    y: 67.076,
                    a: 0.07
                },
                "32": {
                    x: -202.856,
                    y: 72.326,
                    a: 0.04
                },
                "33": {
                    x: -203.556,
                    y: 76.226,
                    a: 0.02
                },
                "34": {
                    x: -204.006,
                    y: 78.876,
                    a: 0.01
                },
                "35": {
                    x: -204.256,
                    y: 80.426,
                    a: 0
                },
                "36": {
                    x: -204.35,
                    y: 80.9,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance5, 0, 37, {
                "0": {
                    x: -137.841,
                    y: -49.617,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -165.99,
                    y: -96.137,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -184.8,
                    y: -127.2,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -187.552,
                    y: -130.34,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -190.254,
                    y: -133.46
                },
                "5": {
                    x: -193.004,
                    y: -136.673
                },
                "6": {
                    x: -195.749,
                    y: -139.742,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -198.502,
                    y: -142.862
                },
                "8": {
                    x: -201.202,
                    y: -146.079
                },
                "9": {
                    x: -203.95,
                    y: -149.2,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -204.018,
                    y: -148.609,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -204.268,
                    y: -146.759,
                    a: 0.99
                },
                "12": {
                    x: -204.668,
                    y: -143.559,
                    a: 0.98
                },
                "13": {
                    x: -205.218,
                    y: -138.809,
                    a: 0.96
                },
                "14": {
                    x: -205.968,
                    y: -132.509,
                    a: 0.95
                },
                "15": {
                    x: -206.968,
                    y: -124.459,
                    a: 0.92
                },
                "16": {
                    x: -208.118,
                    y: -114.559,
                    a: 0.89
                },
                "17": {
                    x: -209.568,
                    y: -102.709,
                    a: 0.85
                },
                "18": {
                    x: -211.218,
                    y: -88.809,
                    a: 0.8
                },
                "19": {
                    x: -213.118,
                    y: -72.959,
                    a: 0.75
                },
                "20": {
                    x: -215.268,
                    y: -55.209,
                    a: 0.7
                },
                "21": {
                    x: -217.618,
                    y: -35.759,
                    a: 0.63
                },
                "22": {
                    x: -220.118,
                    y: -15.059,
                    a: 0.56
                },
                "23": {
                    x: -222.668,
                    y: 6.391,
                    a: 0.5
                },
                "24": {
                    x: -225.268,
                    y: 27.941,
                    a: 0.43
                },
                "25": {
                    x: -227.768,
                    y: 48.941,
                    a: 0.36
                },
                "26": {
                    x: -230.168,
                    y: 68.741,
                    a: 0.29
                },
                "27": {
                    x: -232.368,
                    y: 86.891,
                    a: 0.23
                },
                "28": {
                    x: -234.318,
                    y: 103.041,
                    a: 0.18
                },
                "29": {
                    x: -235.968,
                    y: 117.041,
                    a: 0.14
                },
                "30": {
                    x: -237.418,
                    y: 128.84,
                    a: 0.1
                },
                "31": {
                    x: -238.568,
                    y: 138.49,
                    a: 0.07
                },
                "32": {
                    x: -239.468,
                    y: 146.091,
                    a: 0.04
                },
                "33": {
                    x: -240.168,
                    y: 151.74,
                    a: 0.02
                },
                "34": {
                    x: -240.618,
                    y: 155.591,
                    a: 0.01
                },
                "35": {
                    x: -240.868,
                    y: 157.841,
                    a: 0
                },
                "36": {
                    x: -240.95,
                    y: 158.55,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance4, 0, 37, {
                "0": {
                    x: -128.9,
                    y: -31.75,
                    a: 1
                },
                "1": {
                    x: -170.75,
                    y: -54.35
                },
                "2": {
                    x: -198.65,
                    y: -69.45
                },
                "3": {
                    x: -202.3,
                    y: -70.95
                },
                "4": {
                    x: -205.95,
                    y: -72.5
                },
                "5": {
                    x: -209.6,
                    y: -74
                },
                "6": {
                    x: -213.25,
                    y: -75.55
                },
                "7": {
                    x: -216.9,
                    y: -77.05
                },
                "8": {
                    x: -220.55,
                    y: -78.6
                },
                "9": {
                    x: -224.2,
                    y: -80.1
                },
                "10": {
                    x: -224.3,
                    y: -79.35
                },
                "11": {
                    x: -224.6,
                    y: -77.05,
                    a: 0.99
                },
                "12": {
                    x: -225.15,
                    y: -73,
                    a: 0.98
                },
                "13": {
                    x: -225.95,
                    y: -67.1,
                    a: 0.96
                },
                "14": {
                    x: -227.05,
                    y: -59.2,
                    a: 0.95
                },
                "15": {
                    x: -228.45,
                    y: -49.1,
                    a: 0.92
                },
                "16": {
                    x: -230.1,
                    y: -36.7,
                    a: 0.89
                },
                "17": {
                    x: -232.15,
                    y: -21.85,
                    a: 0.85
                },
                "18": {
                    x: -234.5,
                    y: -4.45,
                    a: 0.8
                },
                "19": {
                    x: -237.2,
                    y: 15.4,
                    a: 0.75
                },
                "20": {
                    x: -240.25,
                    y: 37.65,
                    a: 0.7
                },
                "21": {
                    x: -243.55,
                    y: 62,
                    a: 0.63
                },
                "22": {
                    x: -247.1,
                    y: 87.95,
                    a: 0.56
                },
                "23": {
                    x: -250.75,
                    y: 114.8,
                    a: 0.5
                },
                "24": {
                    x: -254.45,
                    y: 141.8,
                    a: 0.43
                },
                "25": {
                    x: -258.05,
                    y: 168.1,
                    a: 0.36
                },
                "26": {
                    x: -261.4,
                    y: 192.9,
                    a: 0.29
                },
                "27": {
                    x: -264.5,
                    y: 215.65,
                    a: 0.23
                },
                "28": {
                    x: -267.25,
                    y: 235.9,
                    a: 0.18
                },
                "29": {
                    x: -269.65,
                    y: 253.4,
                    a: 0.14
                },
                "30": {
                    x: -271.7,
                    y: 268.2,
                    a: 0.1
                },
                "31": {
                    x: -273.35,
                    y: 280.3,
                    a: 0.07
                },
                "32": {
                    x: -274.6,
                    y: 289.8,
                    a: 0.04
                },
                "33": {
                    x: -275.6,
                    y: 296.9,
                    a: 0.02
                },
                "34": {
                    x: -276.25,
                    y: 301.7,
                    a: 0.01
                },
                "35": {
                    x: -276.65,
                    y: 304.5,
                    a: 0
                },
                "36": {
                    x: -276.75,
                    y: 305.4
                }
            })
            .addTimedChild(instance3, 0, 37, {
                "0": {
                    x: -177.096,
                    y: -13.193,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -223.641,
                    y: -48.076,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -254.65,
                    y: -71.4,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -258.575,
                    y: -73.741,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -262.642,
                    y: -76.043
                },
                "5": {
                    x: -266.552,
                    y: -78.439
                },
                "6": {
                    x: -270.459,
                    y: -80.793,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -274.426,
                    y: -83.095
                },
                "8": {
                    x: -278.438,
                    y: -85.495
                },
                "9": {
                    x: -282.4,
                    y: -87.85,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -282.497,
                    y: -87.342,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -282.797,
                    y: -85.842,
                    a: 0.99
                },
                "12": {
                    x: -283.347,
                    y: -83.192,
                    a: 0.98
                },
                "13": {
                    x: -284.147,
                    y: -79.292,
                    a: 0.96
                },
                "14": {
                    x: -285.247,
                    y: -74.092,
                    a: 0.95
                },
                "15": {
                    x: -286.597,
                    y: -67.442,
                    a: 0.92
                },
                "16": {
                    x: -288.297,
                    y: -59.292,
                    a: 0.89
                },
                "17": {
                    x: -290.347,
                    y: -49.542,
                    a: 0.85
                },
                "18": {
                    x: -292.697,
                    y: -38.142,
                    a: 0.8
                },
                "19": {
                    x: -295.397,
                    y: -25.092,
                    a: 0.75
                },
                "20": {
                    x: -298.447,
                    y: -10.442,
                    a: 0.7
                },
                "21": {
                    x: -301.747,
                    y: 5.558,
                    a: 0.63
                },
                "22": {
                    x: -305.297,
                    y: 22.608,
                    a: 0.56
                },
                "23": {
                    x: -308.947,
                    y: 40.258,
                    a: 0.5
                },
                "24": {
                    x: -312.597,
                    y: 58.008,
                    a: 0.43
                },
                "25": {
                    x: -316.197,
                    y: 75.258,
                    a: 0.36
                },
                "26": {
                    x: -319.597,
                    y: 91.558,
                    a: 0.29
                },
                "27": {
                    x: -322.647,
                    y: 106.508,
                    a: 0.23
                },
                "28": {
                    x: -325.447,
                    y: 119.808,
                    a: 0.18
                },
                "29": {
                    x: -327.797,
                    y: 131.358,
                    a: 0.14
                },
                "30": {
                    x: -329.847,
                    y: 141.058,
                    a: 0.1
                },
                "31": {
                    x: -331.497,
                    y: 149.008,
                    a: 0.07
                },
                "32": {
                    x: -332.797,
                    y: 155.258,
                    a: 0.04
                },
                "33": {
                    x: -333.747,
                    y: 159.908,
                    a: 0.02
                },
                "34": {
                    x: -334.397,
                    y: 163.108,
                    a: 0.01
                },
                "35": {
                    x: -334.797,
                    y: 164.908,
                    a: 0
                },
                "36": {
                    x: -334.9,
                    y: 165.5,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            })
            .addTimedChild(instance2, 0, 37, {
                "0": {
                    x: -166.719,
                    y: -2.288,
                    sx: 0.999,
                    sy: 0.999,
                    r: -2.818,
                    a: 1
                },
                "1": {
                    x: -253.339,
                    y: -47.047,
                    sx: 0.998,
                    sy: 0.998
                },
                "2": {
                    x: -311.1,
                    y: -76.95,
                    sx: 0.999,
                    sy: 0.999,
                    r: -2.817
                },
                "3": {
                    x: -317.78,
                    y: -79.969,
                    sx: 0.998,
                    sy: 0.998,
                    r: -2.818
                },
                "4": {
                    x: -324.418,
                    y: -82.999
                },
                "5": {
                    x: -331.054,
                    y: -85.988
                },
                "6": {
                    x: -337.694,
                    y: -89.028,
                    sx: 0.999,
                    sy: 0.999
                },
                "7": {
                    x: -344.38,
                    y: -92.017
                },
                "8": {
                    x: -351.065,
                    y: -95.106
                },
                "9": {
                    x: -357.75,
                    y: -98.1,
                    sx: 1,
                    sy: 1,
                    r: -2.815
                },
                "10": {
                    x: -357.792,
                    y: -97.652,
                    sx: 0.999,
                    sy: 0.999,
                    r: -2.817
                },
                "11": {
                    x: -358.142,
                    y: -96.052,
                    a: 0.99
                },
                "12": {
                    x: -358.792,
                    y: -93.302,
                    a: 0.98
                },
                "13": {
                    x: -359.692,
                    y: -89.302,
                    a: 0.96
                },
                "14": {
                    x: -360.892,
                    y: -83.902,
                    a: 0.95
                },
                "15": {
                    x: -362.442,
                    y: -77.002,
                    a: 0.92
                },
                "16": {
                    x: -364.292,
                    y: -68.552,
                    a: 0.89
                },
                "17": {
                    x: -366.592,
                    y: -58.452,
                    a: 0.85
                },
                "18": {
                    x: -369.242,
                    y: -46.602,
                    a: 0.8
                },
                "19": {
                    x: -372.242,
                    y: -33.052,
                    a: 0.75
                },
                "20": {
                    x: -375.642,
                    y: -17.902,
                    a: 0.7
                },
                "21": {
                    x: -379.342,
                    y: -1.302,
                    a: 0.63
                },
                "22": {
                    x: -383.292,
                    y: 16.348,
                    a: 0.56
                },
                "23": {
                    x: -387.392,
                    y: 34.648,
                    a: 0.5
                },
                "24": {
                    x: -391.492,
                    y: 53.048,
                    a: 0.43
                },
                "25": {
                    x: -395.492,
                    y: 70.998,
                    a: 0.36
                },
                "26": {
                    x: -399.292,
                    y: 87.898,
                    a: 0.29
                },
                "27": {
                    x: -402.742,
                    y: 103.398,
                    a: 0.23
                },
                "28": {
                    x: -405.842,
                    y: 117.148,
                    a: 0.18
                },
                "29": {
                    x: -408.542,
                    y: 129.148,
                    a: 0.14
                },
                "30": {
                    x: -410.792,
                    y: 139.198,
                    a: 0.1
                },
                "31": {
                    x: -412.592,
                    y: 147.448,
                    a: 0.07
                },
                "32": {
                    x: -414.042,
                    y: 153.898,
                    a: 0.04
                },
                "33": {
                    x: -415.142,
                    y: 158.748,
                    a: 0.02
                },
                "34": {
                    x: -415.892,
                    y: 162.048,
                    a: 0.01
                },
                "35": {
                    x: -416.292,
                    y: 163.948,
                    a: 0
                },
                "36": {
                    x: -416.5,
                    y: 164.6,
                    sx: 1,
                    sy: 1,
                    r: -2.815
                }
            })
            .addTimedChild(instance1, 0, 37, {
                "0": {
                    x: -135.95,
                    y: -43.613,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661,
                    a: 1
                },
                "1": {
                    x: -202.43,
                    y: -100.286,
                    sx: 0.997,
                    sy: 0.997
                },
                "2": {
                    x: -246.75,
                    y: -138.05,
                    sx: 0.998,
                    sy: 0.998
                },
                "3": {
                    x: -252.013,
                    y: -141.847,
                    sx: 0.997,
                    sy: 0.997
                },
                "4": {
                    x: -257.381,
                    y: -145.716
                },
                "5": {
                    x: -262.645,
                    y: -149.476
                },
                "6": {
                    x: -267.954,
                    y: -153.295,
                    sx: 0.998,
                    sy: 0.998
                },
                "7": {
                    x: -273.272,
                    y: -157.113
                },
                "8": {
                    x: -278.637,
                    y: -160.93
                },
                "9": {
                    x: -283.95,
                    y: -164.75,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                },
                "10": {
                    x: -284.064,
                    y: -163.721,
                    sx: 0.998,
                    sy: 0.998,
                    r: -0.661
                },
                "11": {
                    x: -284.414,
                    y: -160.521,
                    a: 0.99
                },
                "12": {
                    x: -285.064,
                    y: -154.871,
                    a: 0.98
                },
                "13": {
                    x: -285.964,
                    y: -146.671,
                    a: 0.96
                },
                "14": {
                    x: -287.164,
                    y: -135.671,
                    a: 0.95
                },
                "15": {
                    x: -288.714,
                    y: -121.621,
                    a: 0.92
                },
                "16": {
                    x: -290.564,
                    y: -104.371,
                    a: 0.89
                },
                "17": {
                    x: -292.864,
                    y: -83.721,
                    a: 0.85
                },
                "18": {
                    x: -295.514,
                    y: -59.571,
                    a: 0.8
                },
                "19": {
                    x: -298.514,
                    y: -31.921,
                    a: 0.75
                },
                "20": {
                    x: -301.914,
                    y: -0.921,
                    a: 0.7
                },
                "21": {
                    x: -305.614,
                    y: 32.929,
                    a: 0.63
                },
                "22": {
                    x: -309.564,
                    y: 68.979,
                    a: 0.56
                },
                "23": {
                    x: -313.664,
                    y: 106.379,
                    a: 0.5
                },
                "24": {
                    x: -317.764,
                    y: 143.929,
                    a: 0.43
                },
                "25": {
                    x: -321.764,
                    y: 180.529,
                    a: 0.36
                },
                "26": {
                    x: -325.564,
                    y: 215.029,
                    a: 0.29
                },
                "27": {
                    x: -329.014,
                    y: 246.629,
                    a: 0.23
                },
                "28": {
                    x: -332.114,
                    y: 274.829,
                    a: 0.18
                },
                "29": {
                    x: -334.814,
                    y: 299.229,
                    a: 0.14
                },
                "30": {
                    x: -337.064,
                    y: 319.779,
                    a: 0.1
                },
                "31": {
                    x: -338.864,
                    y: 336.579,
                    a: 0.07
                },
                "32": {
                    x: -340.314,
                    y: 349.829,
                    a: 0.04
                },
                "33": {
                    x: -341.414,
                    y: 359.679,
                    a: 0.02
                },
                "34": {
                    x: -342.164,
                    y: 366.429,
                    a: 0.01
                },
                "35": {
                    x: -342.564,
                    y: 370.279,
                    a: 0
                },
                "36": {
                    x: -342.7,
                    y: 371.55,
                    sx: 1,
                    sy: 1,
                    r: -0.663
                }
            });
    });

    var Graphic68 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("party-streamer-red1"));
        var instance2 = new Sprite(fromFrame("party-streamer-red2"));
        var instance3 = new Sprite(fromFrame("party-streamer-red3"));
        var instance4 = new Sprite(fromFrame("party-streamer-red4"));
        var instance5 = new Sprite(fromFrame("party-streamer-red5"));
        var instance6 = new Sprite(fromFrame("party-streamer-red6"));
        var instance7 = new Sprite(fromFrame("party-streamer-red7"));
        var instance8 = new Sprite(fromFrame("party-streamer-red8"));
        var instance9 = new Sprite(fromFrame("party-streamer-red9"));
        var instance10 = new Sprite(fromFrame("party-streamer-red11"));
        var instance11 = new Sprite(fromFrame("party-streamer-red13"));
        var instance12 = new Sprite(fromFrame("party-streamer-red15"));
        var instance13 = new Sprite(fromFrame("party-streamer-red17"));
        var instance14 = new Sprite(fromFrame("party-streamer-red19"));
        var instance15 = new Sprite(fromFrame("party-streamer-red21"));
        var instance16 = new Sprite(fromFrame("party-streamer-red23"))
            .setTransform(234.55, 364.2);
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: 45.15,
                    y: -15.75
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: 2.8,
                    y: -61.85
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -103.85,
                    y: -68.3
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -134.05,
                    y: -66.55
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -142.55,
                    y: -66.2
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -140.5,
                    y: -49.8
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -144.35,
                    y: -5.3
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -143.85,
                    y: 28.25
                }
            })
            .addTimedChild(instance9, 8, 2, {
                "8": {
                    x: -122.6,
                    y: 68.85
                }
            })
            .addTimedChild(instance10, 10, 2, {
                "10": {
                    x: -72.95,
                    y: 100.75
                }
            })
            .addTimedChild(instance11, 12, 2, {
                "12": {
                    x: -21.9,
                    y: 127.3
                }
            })
            .addTimedChild(instance12, 14, 2, {
                "14": {
                    x: 15.15,
                    y: 180.25
                }
            })
            .addTimedChild(instance13, 16, 2, {
                "16": {
                    x: 61.25,
                    y: 219.2
                }
            })
            .addTimedChild(instance14, 18, 2, {
                "18": {
                    x: 123.1,
                    y: 272.3
                }
            })
            .addTimedChild(instance15, 20, 2, {
                "20": {
                    x: 186.7,
                    y: 330.6
                }
            })
            .addTimedChild(instance16, 22, 1);
    });

    var Graphic69 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("party-streamer-red1"));
        var instance2 = new Sprite(fromFrame("party-streamer-red2"));
        var instance3 = new Sprite(fromFrame("party-streamer-red3"));
        var instance4 = new Sprite(fromFrame("party-streamer-red4"));
        var instance5 = new Sprite(fromFrame("party-streamer-red5"));
        var instance6 = new Sprite(fromFrame("party-streamer-red6"));
        var instance7 = new Sprite(fromFrame("party-streamer-red7"));
        var instance8 = new Sprite(fromFrame("party-streamer-red8"));
        var instance9 = new Sprite(fromFrame("party-streamer-red9"));
        var instance10 = new Sprite(fromFrame("party-streamer-red11"));
        var instance11 = new Sprite(fromFrame("party-streamer-red13"));
        var instance12 = new Sprite(fromFrame("party-streamer-red15"));
        var instance13 = new Sprite(fromFrame("party-streamer-red17"));
        var instance14 = new Sprite(fromFrame("party-streamer-red19"));
        var instance15 = new Sprite(fromFrame("party-streamer-red21"));
        var instance16 = new Sprite(fromFrame("party-streamer-red23"))
            .setTransform(234.55, 364.2);
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: 45.15,
                    y: -15.75
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: 2.8,
                    y: -61.85
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -103.85,
                    y: -68.3
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -134.05,
                    y: -66.55
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -142.55,
                    y: -66.2
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -140.5,
                    y: -49.8
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -144.35,
                    y: -5.3
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -143.85,
                    y: 28.25
                }
            })
            .addTimedChild(instance9, 8, 2, {
                "8": {
                    x: -122.6,
                    y: 68.85
                }
            })
            .addTimedChild(instance10, 10, 2, {
                "10": {
                    x: -72.95,
                    y: 100.75
                }
            })
            .addTimedChild(instance11, 12, 2, {
                "12": {
                    x: -21.9,
                    y: 127.3
                }
            })
            .addTimedChild(instance12, 14, 2, {
                "14": {
                    x: 15.15,
                    y: 180.25
                }
            })
            .addTimedChild(instance13, 16, 2, {
                "16": {
                    x: 61.25,
                    y: 219.2
                }
            })
            .addTimedChild(instance14, 18, 2, {
                "18": {
                    x: 123.1,
                    y: 272.3
                }
            })
            .addTimedChild(instance15, 20, 2, {
                "20": {
                    x: 186.7,
                    y: 330.6
                }
            })
            .addTimedChild(instance16, 22, 1);
    });

    var Graphic70 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("party-streamer-red1"));
        var instance2 = new Sprite(fromFrame("party-streamer-red2"));
        var instance3 = new Sprite(fromFrame("party-streamer-red3"));
        var instance4 = new Sprite(fromFrame("party-streamer-red4"));
        var instance5 = new Sprite(fromFrame("party-streamer-red5"));
        var instance6 = new Sprite(fromFrame("party-streamer-red6"));
        var instance7 = new Sprite(fromFrame("party-streamer-red7"));
        var instance8 = new Sprite(fromFrame("party-streamer-red8"));
        var instance9 = new Sprite(fromFrame("party-streamer-red9"));
        var instance10 = new Sprite(fromFrame("party-streamer-red11"));
        var instance11 = new Sprite(fromFrame("party-streamer-red13"));
        var instance12 = new Sprite(fromFrame("party-streamer-red15"));
        var instance13 = new Sprite(fromFrame("party-streamer-red17"));
        var instance14 = new Sprite(fromFrame("party-streamer-red19"));
        var instance15 = new Sprite(fromFrame("party-streamer-red21"));
        var instance16 = new Sprite(fromFrame("party-streamer-red23"))
            .setTransform(234.55, 364.2);
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: 45.15,
                    y: -15.75
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: 2.8,
                    y: -61.85
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -103.85,
                    y: -68.3
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -134.05,
                    y: -66.55
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -142.55,
                    y: -66.2
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -140.5,
                    y: -49.8
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -144.35,
                    y: -5.3
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -143.85,
                    y: 28.25
                }
            })
            .addTimedChild(instance9, 8, 2, {
                "8": {
                    x: -122.6,
                    y: 68.85
                }
            })
            .addTimedChild(instance10, 10, 2, {
                "10": {
                    x: -72.95,
                    y: 100.75
                }
            })
            .addTimedChild(instance11, 12, 2, {
                "12": {
                    x: -21.9,
                    y: 127.3
                }
            })
            .addTimedChild(instance12, 14, 2, {
                "14": {
                    x: 15.15,
                    y: 180.25
                }
            })
            .addTimedChild(instance13, 16, 2, {
                "16": {
                    x: 61.25,
                    y: 219.2
                }
            })
            .addTimedChild(instance14, 18, 2, {
                "18": {
                    x: 123.1,
                    y: 272.3
                }
            })
            .addTimedChild(instance15, 20, 2, {
                "20": {
                    x: 186.7,
                    y: 330.6
                }
            })
            .addTimedChild(instance16, 22, 1);
    });

    var Graphic71 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 24, loop: false });
        var instance1 = new Sprite(fromFrame("party-streamer-purple1"));
        var instance2 = new Sprite(fromFrame("party-streamer-purple2"));
        var instance3 = new Sprite(fromFrame("party-streamer-purple3"));
        var instance4 = new Sprite(fromFrame("party-streamer-purple4"));
        var instance5 = new Sprite(fromFrame("party-streamer-purple5"));
        var instance6 = new Sprite(fromFrame("party-streamer-purple6"));
        var instance7 = new Sprite(fromFrame("party-streamer-purple7"));
        var instance8 = new Sprite(fromFrame("party-streamer-purple8"));
        var instance9 = new Sprite(fromFrame("party-streamer-purple9"));
        var instance10 = new Sprite(fromFrame("party-streamer-purple10"));
        var instance11 = new Sprite(fromFrame("party-streamer-purple11"));
        var instance12 = new Sprite(fromFrame("party-streamer-purple13"));
        var instance13 = new Sprite(fromFrame("party-streamer-purple15"));
        var instance14 = new Sprite(fromFrame("party-streamer-purple16"));
        var instance15 = new Sprite(fromFrame("party-streamer-purple17"));
        var instance16 = new Sprite(fromFrame("party-streamer-purple18"));
        var instance17 = new Sprite(fromFrame("party-streamer-purple20"));
        var instance18 = new Sprite(fromFrame("party-streamer-purple22"));
        var instance19 = new Sprite(fromFrame("party-streamer-purple24"))
            .setTransform(244.95, 6.45);
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: -11.2,
                    y: 123.2
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: -9.5,
                    y: 60.35
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -9.25,
                    y: -6.15
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -20.1,
                    y: -40.35
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -27.7,
                    y: -88.5
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -30.35,
                    y: -116.4
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -31.7,
                    y: -135.3
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -30.3,
                    y: -148.05
                }
            })
            .addTimedChild(instance9, 8, 1, {
                "8": {
                    x: -29.35,
                    y: -150.35
                }
            })
            .addTimedChild(instance10, 9, 1, {
                "9": {
                    x: -30.65,
                    y: -149.3
                }
            })
            .addTimedChild(instance11, 10, 2, {
                "10": {
                    x: -27.65,
                    y: -151.05
                }
            })
            .addTimedChild(instance12, 12, 2, {
                "12": {
                    x: -12.4,
                    y: -152.4
                }
            })
            .addTimedChild(instance13, 14, 1, {
                "14": {
                    x: 0.15,
                    y: -153.15
                }
            })
            .addTimedChild(instance14, 15, 1, {
                "15": {
                    x: 23.55,
                    y: -153.25
                }
            })
            .addTimedChild(instance15, 16, 1, {
                "16": {
                    x: 50.75,
                    y: -149.35
                }
            })
            .addTimedChild(instance16, 17, 2, {
                "17": {
                    x: 99.6,
                    y: -116.95
                }
            })
            .addTimedChild(instance17, 19, 2, {
                "19": {
                    x: 148.5,
                    y: -68.25
                }
            })
            .addTimedChild(instance18, 21, 2, {
                "21": {
                    x: 192.85,
                    y: -45.4
                }
            })
            .addTimedChild(instance19, 23, 1);
    });

    var Graphic72 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 24, loop: false });
        var instance1 = new Sprite(fromFrame("party-streamer-purple1"));
        var instance2 = new Sprite(fromFrame("party-streamer-purple2"));
        var instance3 = new Sprite(fromFrame("party-streamer-purple3"));
        var instance4 = new Sprite(fromFrame("party-streamer-purple4"));
        var instance5 = new Sprite(fromFrame("party-streamer-purple5"));
        var instance6 = new Sprite(fromFrame("party-streamer-purple6"));
        var instance7 = new Sprite(fromFrame("party-streamer-purple7"));
        var instance8 = new Sprite(fromFrame("party-streamer-purple8"));
        var instance9 = new Sprite(fromFrame("party-streamer-purple9"));
        var instance10 = new Sprite(fromFrame("party-streamer-purple10"));
        var instance11 = new Sprite(fromFrame("party-streamer-purple11"));
        var instance12 = new Sprite(fromFrame("party-streamer-purple13"));
        var instance13 = new Sprite(fromFrame("party-streamer-purple15"));
        var instance14 = new Sprite(fromFrame("party-streamer-purple16"));
        var instance15 = new Sprite(fromFrame("party-streamer-purple17"));
        var instance16 = new Sprite(fromFrame("party-streamer-purple18"));
        var instance17 = new Sprite(fromFrame("party-streamer-purple20"));
        var instance18 = new Sprite(fromFrame("party-streamer-purple22"));
        var instance19 = new Sprite(fromFrame("party-streamer-purple24"))
            .setTransform(244.95, 6.45);
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: -11.2,
                    y: 123.2
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: -9.5,
                    y: 60.35
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -9.25,
                    y: -6.15
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -20.1,
                    y: -40.35
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -27.7,
                    y: -88.5
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -30.35,
                    y: -116.4
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -31.7,
                    y: -135.3
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -30.3,
                    y: -148.05
                }
            })
            .addTimedChild(instance9, 8, 1, {
                "8": {
                    x: -29.35,
                    y: -150.35
                }
            })
            .addTimedChild(instance10, 9, 1, {
                "9": {
                    x: -30.65,
                    y: -149.3
                }
            })
            .addTimedChild(instance11, 10, 2, {
                "10": {
                    x: -27.65,
                    y: -151.05
                }
            })
            .addTimedChild(instance12, 12, 2, {
                "12": {
                    x: -12.4,
                    y: -152.4
                }
            })
            .addTimedChild(instance13, 14, 1, {
                "14": {
                    x: 0.15,
                    y: -153.15
                }
            })
            .addTimedChild(instance14, 15, 1, {
                "15": {
                    x: 23.55,
                    y: -153.25
                }
            })
            .addTimedChild(instance15, 16, 1, {
                "16": {
                    x: 50.75,
                    y: -149.35
                }
            })
            .addTimedChild(instance16, 17, 2, {
                "17": {
                    x: 99.6,
                    y: -116.95
                }
            })
            .addTimedChild(instance17, 19, 2, {
                "19": {
                    x: 148.5,
                    y: -68.25
                }
            })
            .addTimedChild(instance18, 21, 2, {
                "21": {
                    x: 192.85,
                    y: -45.4
                }
            })
            .addTimedChild(instance19, 23, 1);
    });

    var Graphic73 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 31, loop: false });
        var instance1 = new Sprite(fromFrame("party-streamer-orange1"));
        var instance2 = new Sprite(fromFrame("party-streamer-orange2"));
        var instance3 = new Sprite(fromFrame("party-streamer-orange3"));
        var instance4 = new Sprite(fromFrame("party-streamer-orange4"));
        var instance5 = new Sprite(fromFrame("party-streamer-orange5"));
        var instance6 = new Sprite(fromFrame("party-streamer-orange6"));
        var instance7 = new Sprite(fromFrame("party-streamer-orange7"));
        var instance8 = new Sprite(fromFrame("party-streamer-orange8"));
        var instance9 = new Sprite(fromFrame("party-streamer-orange9"));
        var instance10 = new Sprite(fromFrame("party-streamer-orange10"));
        var instance11 = new Sprite(fromFrame("party-streamer-orange11"));
        var instance12 = new Sprite(fromFrame("party-streamer-orange12"));
        var instance13 = new Sprite(fromFrame("party-streamer-orange13"));
        var instance14 = new Sprite(fromFrame("party-streamer-orange14"));
        var instance15 = new Sprite(fromFrame("party-streamer-orange15"));
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: -91.05,
                    y: 152.45
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: -89.65,
                    y: 115.65
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -79.7,
                    y: 84.25
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -75.3,
                    y: 49.75
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -65.1,
                    y: 14.15
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -49.85,
                    y: 4.05
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -27.6,
                    y: 4.85
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -6.5,
                    y: 4.95
                }
            })
            .addTimedChild(instance9, 8, 1, {
                "8": {
                    x: 0.45,
                    y: 5.4
                }
            })
            .addTimedChild(instance10, 9, 1, {
                "9": {
                    x: 35.6,
                    y: 6
                }
            })
            .addTimedChild(instance11, 10, 1, {
                "10": {
                    x: 114.05,
                    y: 28.6
                }
            })
            .addTimedChild(instance12, 11, 1, {
                "11": {
                    x: 177.1,
                    y: 86
                }
            })
            .addTimedChild(instance13, 12, 1, {
                "12": {
                    x: 177.1,
                    y: 86
                }
            })
            .addTimedChild(instance14, 13, 1, {
                "13": {
                    x: 296.9,
                    y: 205.8
                }
            })
            .addTimedChild(instance15, 14, 1, {
                "14": {
                    x: 378.75,
                    y: 287.65
                }
            });
    });

    var Graphic74 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("party-streamer-orange1"));
        var instance2 = new Sprite(fromFrame("party-streamer-orange2"));
        var instance3 = new Sprite(fromFrame("party-streamer-orange3"));
        var instance4 = new Sprite(fromFrame("party-streamer-orange4"));
        var instance5 = new Sprite(fromFrame("party-streamer-orange5"));
        var instance6 = new Sprite(fromFrame("party-streamer-orange6"));
        var instance7 = new Sprite(fromFrame("party-streamer-orange7"));
        var instance8 = new Sprite(fromFrame("party-streamer-orange8"));
        var instance9 = new Sprite(fromFrame("party-streamer-orange9"));
        var instance10 = new Sprite(fromFrame("party-streamer-orange10"));
        var instance11 = new Sprite(fromFrame("party-streamer-orange11"));
        var instance12 = new Sprite(fromFrame("party-streamer-orange12"));
        var instance13 = new Sprite(fromFrame("party-streamer-orange13"));
        var instance14 = new Sprite(fromFrame("party-streamer-orange14"));
        var instance15 = new Sprite(fromFrame("party-streamer-orange15"));
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: -91.05,
                    y: 152.45
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: -89.65,
                    y: 115.65
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -79.7,
                    y: 84.25
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -75.3,
                    y: 49.75
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -65.1,
                    y: 14.15
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -49.85,
                    y: 4.05
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -27.6,
                    y: 4.85
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -6.5,
                    y: 4.95
                }
            })
            .addTimedChild(instance9, 8, 1, {
                "8": {
                    x: 0.45,
                    y: 5.4
                }
            })
            .addTimedChild(instance10, 9, 1, {
                "9": {
                    x: 35.6,
                    y: 6
                }
            })
            .addTimedChild(instance11, 10, 1, {
                "10": {
                    x: 114.05,
                    y: 28.6
                }
            })
            .addTimedChild(instance12, 11, 1, {
                "11": {
                    x: 177.1,
                    y: 86
                }
            })
            .addTimedChild(instance13, 12, 1, {
                "12": {
                    x: 177.1,
                    y: 86
                }
            })
            .addTimedChild(instance14, 13, 1, {
                "13": {
                    x: 296.9,
                    y: 205.8
                }
            })
            .addTimedChild(instance15, 14, 1, {
                "14": {
                    x: 378.75,
                    y: 287.65
                }
            });
    });

    var Graphic75 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("party-streamer-orange1"));
        var instance2 = new Sprite(fromFrame("party-streamer-orange2"));
        var instance3 = new Sprite(fromFrame("party-streamer-orange3"));
        var instance4 = new Sprite(fromFrame("party-streamer-orange4"));
        var instance5 = new Sprite(fromFrame("party-streamer-orange5"));
        var instance6 = new Sprite(fromFrame("party-streamer-orange6"));
        var instance7 = new Sprite(fromFrame("party-streamer-orange7"));
        var instance8 = new Sprite(fromFrame("party-streamer-orange8"));
        var instance9 = new Sprite(fromFrame("party-streamer-orange9"));
        var instance10 = new Sprite(fromFrame("party-streamer-orange10"));
        var instance11 = new Sprite(fromFrame("party-streamer-orange11"));
        var instance12 = new Sprite(fromFrame("party-streamer-orange12"));
        var instance13 = new Sprite(fromFrame("party-streamer-orange13"));
        var instance14 = new Sprite(fromFrame("party-streamer-orange14"));
        var instance15 = new Sprite(fromFrame("party-streamer-orange15"));
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: -91.05,
                    y: 152.45
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: -89.65,
                    y: 115.65
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -79.7,
                    y: 84.25
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -75.3,
                    y: 49.75
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -65.1,
                    y: 14.15
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -49.85,
                    y: 4.05
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -27.6,
                    y: 4.85
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -6.5,
                    y: 4.95
                }
            })
            .addTimedChild(instance9, 8, 1, {
                "8": {
                    x: 0.45,
                    y: 5.4
                }
            })
            .addTimedChild(instance10, 9, 1, {
                "9": {
                    x: 35.6,
                    y: 6
                }
            })
            .addTimedChild(instance11, 10, 1, {
                "10": {
                    x: 114.05,
                    y: 28.6
                }
            })
            .addTimedChild(instance12, 11, 1, {
                "11": {
                    x: 177.1,
                    y: 86
                }
            })
            .addTimedChild(instance13, 12, 1, {
                "12": {
                    x: 177.1,
                    y: 86
                }
            })
            .addTimedChild(instance14, 13, 1, {
                "13": {
                    x: 296.9,
                    y: 205.8
                }
            })
            .addTimedChild(instance15, 14, 1, {
                "14": {
                    x: 378.75,
                    y: 287.65
                }
            });
    });

    var Graphic76 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 32, loop: false });
        var instance1 = new Sprite(fromFrame("party-streamer-green1"));
        var instance2 = new Sprite(fromFrame("party-streamer-green2"));
        var instance3 = new Sprite(fromFrame("party-streamer-green3"));
        var instance4 = new Sprite(fromFrame("party-streamer-green4"));
        var instance5 = new Sprite(fromFrame("party-streamer-green5"));
        var instance6 = new Sprite(fromFrame("party-streamer-green6"));
        var instance7 = new Sprite(fromFrame("party-streamer-green7"));
        var instance8 = new Sprite(fromFrame("party-streamer-green8"));
        var instance9 = new Sprite(fromFrame("party-streamer-green9"));
        var instance10 = new Sprite(fromFrame("party-streamer-green10"));
        var instance11 = new Sprite(fromFrame("party-streamer-green11"));
        var instance12 = new Sprite(fromFrame("party-streamer-green12"));
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: -127.75,
                    y: 305.1
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: -128,
                    y: 276.7
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -128.25,
                    y: 251.15
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -125.15,
                    y: 224.3
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -118.1,
                    y: 201.9
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -105,
                    y: 172.9
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -92,
                    y: 153.65
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -73.7,
                    y: 134.8
                }
            })
            .addTimedChild(instance9, 8, 1, {
                "8": {
                    x: -57.65,
                    y: 117.95
                }
            })
            .addTimedChild(instance10, 9, 1, {
                "9": {
                    x: -39.55,
                    y: 104.35
                }
            })
            .addTimedChild(instance11, 10, 1, {
                "10": {
                    x: -26,
                    y: 95.5
                }
            })
            .addTimedChild(instance12, 11, 1, {
                "11": {
                    x: -9.9,
                    y: 92.6
                }
            });
    });

    var Graphic77 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 30, loop: false });
        var instance1 = new Sprite(fromFrame("party-streamer-green1"));
        var instance2 = new Sprite(fromFrame("party-streamer-green2"));
        var instance3 = new Sprite(fromFrame("party-streamer-green3"));
        var instance4 = new Sprite(fromFrame("party-streamer-green4"));
        var instance5 = new Sprite(fromFrame("party-streamer-green5"));
        var instance6 = new Sprite(fromFrame("party-streamer-green6"));
        var instance7 = new Sprite(fromFrame("party-streamer-green7"));
        var instance8 = new Sprite(fromFrame("party-streamer-green8"));
        var instance9 = new Sprite(fromFrame("party-streamer-green9"));
        var instance10 = new Sprite(fromFrame("party-streamer-green10"));
        var instance11 = new Sprite(fromFrame("party-streamer-green11"));
        var instance12 = new Sprite(fromFrame("party-streamer-green12"));
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: -127.75,
                    y: 305.1
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: -128,
                    y: 276.7
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -128.25,
                    y: 251.15
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -125.15,
                    y: 224.3
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -118.1,
                    y: 201.9
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -105,
                    y: 172.9
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -92,
                    y: 153.65
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -73.7,
                    y: 134.8
                }
            })
            .addTimedChild(instance9, 8, 1, {
                "8": {
                    x: -57.65,
                    y: 117.95
                }
            })
            .addTimedChild(instance10, 9, 1, {
                "9": {
                    x: -39.55,
                    y: 104.35
                }
            })
            .addTimedChild(instance11, 10, 1, {
                "10": {
                    x: -26,
                    y: 95.5
                }
            })
            .addTimedChild(instance12, 11, 1, {
                "11": {
                    x: -9.9,
                    y: 92.6
                }
            });
    });

    var Graphic78 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 32, loop: false });
        var instance1 = new Sprite(fromFrame("party-streamer-green1"));
        var instance2 = new Sprite(fromFrame("party-streamer-green2"));
        var instance3 = new Sprite(fromFrame("party-streamer-green3"));
        var instance4 = new Sprite(fromFrame("party-streamer-green4"));
        var instance5 = new Sprite(fromFrame("party-streamer-green5"));
        var instance6 = new Sprite(fromFrame("party-streamer-green6"));
        var instance7 = new Sprite(fromFrame("party-streamer-green7"));
        var instance8 = new Sprite(fromFrame("party-streamer-green8"));
        var instance9 = new Sprite(fromFrame("party-streamer-green9"));
        var instance10 = new Sprite(fromFrame("party-streamer-green10"));
        var instance11 = new Sprite(fromFrame("party-streamer-green11"));
        var instance12 = new Sprite(fromFrame("party-streamer-green12"));
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: -127.75,
                    y: 305.1
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: -128,
                    y: 276.7
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -128.25,
                    y: 251.15
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -125.15,
                    y: 224.3
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -118.1,
                    y: 201.9
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -105,
                    y: 172.9
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -92,
                    y: 153.65
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -73.7,
                    y: 134.8
                }
            })
            .addTimedChild(instance9, 8, 1, {
                "8": {
                    x: -57.65,
                    y: 117.95
                }
            })
            .addTimedChild(instance10, 9, 1, {
                "9": {
                    x: -39.55,
                    y: 104.35
                }
            })
            .addTimedChild(instance11, 10, 1, {
                "10": {
                    x: -26,
                    y: 95.5
                }
            })
            .addTimedChild(instance12, 11, 1, {
                "11": {
                    x: -9.9,
                    y: 92.6
                }
            });
    });

    var Graphic79 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 32, loop: false });
        var instance5 = new Graphic78(MovieClip.SYNCHED)
            .setTransform(-106.45, -107.15, 1, 1, -0.419)
            .setColorTransform(0, 0.93, 0, 0.68, 0, 0.17);
        var instance7 = new Graphic77(MovieClip.SYNCHED)
            .setTransform(69.8, -78.65)
            .setColorTransform(0, 0.13, 0, 0.73, 0, 0.33);
        var instance4 = new Graphic76(MovieClip.SYNCHED)
            .setTransform(163.6, -76.15)
            .setColorTransform(0, 0.84, 0, 0.02, 0, 0.19);
        var instance3 = new Graphic75(MovieClip.SYNCHED);
        var instance9 = new Graphic74(MovieClip.SYNCHED);
        var instance6 = new Graphic73(MovieClip.SYNCHED);
        var instance2 = new Graphic72(MovieClip.SYNCHED);
        var instance10 = new Graphic71(MovieClip.SYNCHED);
        var instance1 = new Graphic70(MovieClip.SYNCHED);
        var instance8 = new Graphic69(MovieClip.SYNCHED);
        var instance11 = new Graphic68(MovieClip.SYNCHED);
        this.addTimedChild(instance5)
            .addTimedChild(instance7, 2, 30)
            .addTimedChild(instance4)
            .addTimedChild(instance3, 0, 16, {
                "0": {
                    x: 146.35,
                    y: 70.85,
                    a: 1,
                    c: [
                        0,
                        0.13,
                        0,
                        0.73,
                        0,
                        0.33
                    ]
                },
                "12": {
                    a: 0.75
                },
                "13": {
                    a: 0.5
                },
                "14": {
                    a: 0.25
                },
                "15": {
                    a: 0
                }
            })
            .addTimedChild(instance9, 3, 29, {
                "3": {
                    x: 74.85,
                    y: 63.75,
                    a: 1,
                    c: [
                        0,
                        0.93,
                        0,
                        0.68,
                        0,
                        0.17
                    ]
                },
                "14": {
                    x: 74.836,
                    y: 63.764,
                    a: 0.67
                },
                "15": {
                    a: 0.33
                },
                "16": {
                    x: 74.85,
                    y: 63.75,
                    a: 0
                }
            })
            .addTimedChild(instance6, 1, 31, {
                "1": {
                    x: -9.05,
                    y: 128.8,
                    sx: 0.652,
                    sy: 0.652,
                    a: 1,
                    c: [
                        0,
                        0.45,
                        0,
                        0.26,
                        0,
                        0.71
                    ]
                },
                "15": {
                    a: 0.75
                },
                "16": {
                    a: 0.5
                },
                "17": {
                    a: 0.25
                },
                "18": {
                    a: 0
                }
            })
            .addTimedChild(instance2, 0, 24, {
                "0": {
                    x: 8.75,
                    y: 66.55,
                    a: 1,
                    c: [
                        0,
                        0.45,
                        0,
                        0.26,
                        0,
                        0.71
                    ]
                },
                "19": {
                    a: 0.8
                },
                "20": {
                    a: 0.6
                },
                "21": {
                    a: 0.4
                },
                "22": {
                    a: 0.2
                },
                "23": {
                    a: 0
                }
            })
            .addTimedChild(instance10, 4, 24, {
                "4": {
                    x: -175.4,
                    y: 71.15,
                    sx: 0.915,
                    sy: 0.915,
                    r: 0.121,
                    a: 1,
                    c: [
                        0,
                        0.13,
                        0,
                        0.73,
                        0,
                        0.33
                    ]
                },
                "23": {
                    x: -175.403,
                    y: 71.208,
                    r: 0.119,
                    a: 0.8
                },
                "24": {
                    a: 0.6
                },
                "25": {
                    a: 0.4
                },
                "26": {
                    a: 0.2
                },
                "27": {
                    x: -175.4,
                    y: 71.15,
                    r: 0.121,
                    a: 0
                }
            })
            .addTimedChild(instance1, 0, 23, {
                "0": {
                    x: -169,
                    y: 103,
                    a: 1,
                    c: [
                        0,
                        0.93,
                        0,
                        0.68,
                        0,
                        0.17
                    ]
                },
                "18": {
                    a: 0.8
                },
                "19": {
                    a: 0.6
                },
                "20": {
                    a: 0.4
                },
                "21": {
                    a: 0.2
                },
                "22": {
                    a: 0
                }
            })
            .addTimedChild(instance8, 3, 23, {
                "3": {
                    x: -194.3,
                    y: 181.5,
                    sx: 0.834,
                    sy: 0.834,
                    a: 1,
                    c: [
                        0,
                        0.84,
                        0,
                        0.02,
                        0,
                        0.19
                    ]
                },
                "21": {
                    a: 0.8
                },
                "22": {
                    a: 0.6
                },
                "23": {
                    a: 0.4
                },
                "24": {
                    a: 0.2
                },
                "25": {
                    a: 0
                }
            })
            .addTimedChild(instance11, 5, 23, {
                "5": {
                    x: -61.9,
                    y: 191.7,
                    sx: 0.734,
                    sy: 0.734,
                    kx: 1.637,
                    ky: 1.505,
                    a: 1,
                    c: [
                        0,
                        0.84,
                        0,
                        0.02,
                        0,
                        0.19
                    ]
                },
                "23": {
                    x: -61.95,
                    y: 191.719,
                    kx: 1.636,
                    a: 0.8
                },
                "24": {
                    a: 0.6
                },
                "25": {
                    a: 0.4
                },
                "26": {
                    a: 0.2
                },
                "27": {
                    x: -61.9,
                    y: 191.7,
                    kx: 1.637,
                    a: 0
                }
            });
    });

    var Graphic80 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 68, loop: false });
        var instance1 = new Sprite(fromFrame("party-popper-inside1"))
            .setTransform(-162.05, -24.9);
        this.addTimedChild(instance1);
    });

    var Graphic81 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 11, loop: false });
        var instance1 = new Sprite(fromFrame("party-popper-outside1"))
            .setTransform(-161.75, -142.05);
        this.addTimedChild(instance1);
    });

    var Graphic82 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Sprite(fromFrame("party-popper-outside1"))
            .setTransform(-161.75, -142.05);
        this.addTimedChild(instance1);
    });

    var Graphic83 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 68, loop: false });
        var instance2 = new Graphic81(MovieClip.SYNCHED);
        var instance8 = new Graphic82(MovieClip.SYNCHED);
        var instance1 = new Graphic80(MovieClip.SYNCHED);
        var instance4 = new Graphic79(MovieClip.SYNCHED);
        var instance5 = new Graphic67(MovieClip.SYNCHED);
        var instance6 = new Graphic46(MovieClip.SYNCHED);
        var instance7 = new Graphic25(MovieClip.SYNCHED);
        var instance3 = new Graphic4(MovieClip.SYNCHED);
        this.addTimedChild(instance2, 0, 11, {
                "0": {
                    x: -6.35,
                    y: 7,
                    sy: 0.104
                },
                "1": {
                    y: 17.539,
                    sy: 0.178
                },
                "2": {
                    y: 66.292,
                    sy: 0.521
                },
                "3": {
                    y: 134.532,
                    sy: 1.002
                },
                "4": {
                    y: 151.25,
                    sy: 1.12
                },
                "5": {
                    y: 150.775,
                    sy: 1.116
                },
                "6": {
                    y: 148.807,
                    sy: 1.102
                },
                "7": {
                    y: 144.265,
                    sy: 1.07
                },
                "8": {
                    y: 138.23,
                    sy: 1.028
                },
                "9": {
                    y: 134.986,
                    sy: 1.005
                },
                "10": {
                    y: 134.25,
                    sy: 1
                }
            })
            .addTimedChild(instance8, 28, 40, {
                "28": {
                    x: -6.35,
                    y: 134.25,
                    sy: 1
                },
                "62": {
                    y: 130.844,
                    sy: 0.976
                },
                "63": {
                    y: 117.663,
                    sy: 0.883
                },
                "64": {
                    y: 87.789,
                    sy: 0.673
                },
                "65": {
                    y: 46.883,
                    sy: 0.385
                },
                "66": {
                    y: 23.921,
                    sy: 0.223
                },
                "67": {
                    y: 18.3,
                    sy: 0.184
                }
            })
            .addTimedChild(instance1, 0, 68, {
                "0": {
                    x: -6.8,
                    y: -9.65,
                    sx: 1,
                    sy: 1,
                    c: [
                        0,
                        0.07,
                        0,
                        0.34,
                        0,
                        0.45
                    ]
                },
                "1": {
                    c: [
                        0.03,
                        0.07,
                        0.03,
                        0.33,
                        0.03,
                        0.44
                    ]
                },
                "2": {
                    c: [
                        0.14,
                        0.06,
                        0.14,
                        0.29,
                        0.14,
                        0.38
                    ]
                },
                "3": {
                    c: [
                        0.41,
                        0.04,
                        0.41,
                        0.2,
                        0.41,
                        0.26
                    ]
                },
                "4": {
                    c: [
                        0.77,
                        0.02,
                        0.77,
                        0.08,
                        0.77,
                        0.11
                    ]
                },
                "5": {
                    c: [
                        0.95,
                        0,
                        0.95,
                        0.02,
                        0.95,
                        0.02
                    ]
                },
                "6": {
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "12": {
                    x: -6.814,
                    y: -7.062,
                    sx: 1.002,
                    sy: 0.991
                },
                "13": {
                    x: -6.775,
                    y: 4.374,
                    sx: 1.011,
                    sy: 0.951
                },
                "14": {
                    x: -6.864,
                    y: 30.402,
                    sx: 1.032,
                    sy: 0.86
                },
                "15": {
                    x: -6.857,
                    y: 47.687,
                    sx: 1.045,
                    sy: 0.799
                },
                "16": {
                    x: -6.85,
                    y: 51.45,
                    sx: 1.048,
                    sy: 0.786
                },
                "18": {
                    x: -6.821,
                    y: 31.999,
                    sx: 1.021,
                    sy: 0.854
                },
                "19": {
                    x: -6.715,
                    y: -55.417,
                    sx: 0.897,
                    sy: 1.16
                },
                "20": {
                    x: -6.75,
                    y: -84.45,
                    sx: 0.856,
                    sy: 1.262
                },
                "22": {
                    x: -6.746,
                    y: -61.55,
                    sx: 0.9,
                    sy: 1.182
                },
                "23": {
                    x: -6.779,
                    y: -42.874,
                    sx: 0.936,
                    sy: 1.116
                },
                "24": {
                    x: -6.8,
                    y: -28.269,
                    sx: 0.964,
                    sy: 1.065
                },
                "25": {
                    x: -6.807,
                    y: -17.888,
                    sx: 0.984,
                    sy: 1.029
                },
                "26": {
                    x: -6.801,
                    y: -11.678,
                    sx: 0.996,
                    sy: 1.007
                },
                "27": {
                    x: -6.8,
                    y: -9.65,
                    sx: 1,
                    sy: 1
                },
                "62": {
                    c: [
                        0.97,
                        0,
                        0.97,
                        0.01,
                        0.97,
                        0.01
                    ]
                },
                "63": {
                    c: [
                        0.86,
                        0.01,
                        0.86,
                        0.05,
                        0.86,
                        0.06
                    ]
                },
                "64": {
                    c: [
                        0.6,
                        0.03,
                        0.6,
                        0.14,
                        0.6,
                        0.18
                    ]
                },
                "65": {
                    c: [
                        0.25,
                        0.05,
                        0.25,
                        0.26,
                        0.25,
                        0.34
                    ]
                },
                "66": {
                    c: [
                        0.05,
                        0.07,
                        0.05,
                        0.33,
                        0.05,
                        0.42
                    ]
                },
                "67": {
                    c: [
                        0,
                        0.07,
                        0,
                        0.34,
                        0,
                        0.45
                    ]
                }
            })
            .addTimedChild(instance4, 20, 32, {
                "20": {
                    x: 22.6,
                    y: -261.15
                }
            })
            .addTimedChild(instance5, 21, 37, {
                "21": {
                    x: -23.75,
                    y: -32.55,
                    kx: 0.785,
                    ky: 2.356
                }
            })
            .addTimedChild(instance6, 22, 36, {
                "22": {
                    x: -184.4,
                    y: -68.85,
                    kx: 0.681,
                    ky: 2.461
                }
            })
            .addTimedChild(instance7, 23, 35, {
                "23": {
                    x: -183.15,
                    y: -5.85,
                    kx: 0.729,
                    ky: 2.413
                }
            })
            .addTimedChild(instance3, 11, 17, {
                "11": {
                    x: -6.35,
                    y: 134.25,
                    sx: 1,
                    sy: 1
                },
                "12": {
                    x: -6.363,
                    y: 135.529,
                    sx: 1.002,
                    sy: 0.991
                },
                "13": {
                    x: -6.37,
                    y: 141.21,
                    sx: 1.011,
                    sy: 0.951
                },
                "14": {
                    x: -6.35,
                    y: 154.137,
                    sx: 1.032,
                    sy: 0.86
                },
                "15": {
                    x: -6.337,
                    y: 162.758,
                    sx: 1.045,
                    sy: 0.799
                },
                "16": {
                    x: -6.35,
                    y: 164.6,
                    sx: 1.048,
                    sy: 0.786
                },
                "18": {
                    x: -6.384,
                    y: 154.933,
                    sx: 1.021,
                    sy: 0.854
                },
                "19": {
                    x: -6.387,
                    y: 111.566,
                    sx: 0.897,
                    sy: 1.16
                },
                "20": {
                    x: -6.4,
                    y: 97.05,
                    sx: 0.856,
                    sy: 1.262
                },
                "22": {
                    x: -6.428,
                    y: 108.351,
                    sx: 0.9,
                    sy: 1.182
                },
                "23": {
                    x: -6.397,
                    y: 117.672,
                    sx: 0.936,
                    sy: 1.116
                },
                "24": {
                    x: -6.355,
                    y: 124.91,
                    sx: 0.964,
                    sy: 1.065
                },
                "25": {
                    y: 130.066,
                    sx: 0.984,
                    sy: 1.029
                },
                "26": {
                    x: -6.394,
                    y: 133.188,
                    sx: 0.996,
                    sy: 1.007
                },
                "27": {
                    x: -6.35,
                    y: 134.25,
                    sx: 1,
                    sy: 1
                }
            });
    });

    var Graphic84 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic85 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic84(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic86 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic87 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic86(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic88 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 17, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic89 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 17, loop: false });
        var instance1 = new Graphic88(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 17, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic90 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 17, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic91 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 17, loop: false });
        var instance1 = new Graphic90(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 17, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic92 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 17, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic93 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 17, loop: false });
        var instance1 = new Graphic92(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 17, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic94 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 15, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic95 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 15, loop: false });
        var instance1 = new Graphic94(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 15, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic96 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 15, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic97 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 15, loop: false });
        var instance1 = new Graphic96(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 15, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic98 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 10, loop: false });
        var instance1 = new Sprite(fromFrame("HeyJibo1"))
            .setTransform(-478.45, -102);
        this.addTimedChild(instance1);
    });

    var Graphic99 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-cloud2"))
            .setTransform(-69.8, -39.15);
        this.addTimedChild(instance1);
    });

    var Graphic100 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 51, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-cloud3"))
            .setTransform(-169.05, -97.55);
        this.addTimedChild(instance1);
    });

    var Graphic101 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 49, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-cloud1"))
            .setTransform(-178.7, -72.95);
        this.addTimedChild(instance1);
    });

    var Graphic102 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 51, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow1"));
        var instance2 = new Sprite(fromFrame("rainbow2"));
        var instance3 = new Sprite(fromFrame("rainbow3"));
        var instance4 = new Sprite(fromFrame("rainbow4"));
        var instance5 = new Sprite(fromFrame("rainbow5"));
        var instance6 = new Sprite(fromFrame("rainbow6"));
        var instance7 = new Sprite(fromFrame("rainbow7"));
        var instance8 = new Sprite(fromFrame("rainbow8"));
        var instance9 = new Sprite(fromFrame("rainbow9"));
        var instance10 = new Sprite(fromFrame("rainbow10"));
        var instance11 = new Sprite(fromFrame("rainbow11"));
        var instance12 = new Sprite(fromFrame("rainbow12"));
        var instance13 = new Sprite(fromFrame("rainbow13"));
        var instance14 = new Sprite(fromFrame("rainbow14"));
        var instance15 = new Sprite(fromFrame("rainbow15"));
        var instance16 = new Sprite(fromFrame("rainbow16"))
            .setTransform(-334.15, -167.15);
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: -334.15,
                    y: 61.05
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: -334.15,
                    y: 56.75
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -334.15,
                    y: 41.4
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -334.15,
                    y: 12.3
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -334.15,
                    y: -32.35
                }
            })
            .addTimedChild(instance6, 5, 1, {
                "5": {
                    x: -334.15,
                    y: -89.1
                }
            })
            .addTimedChild(instance7, 6, 1, {
                "6": {
                    x: -334.15,
                    y: -145.15
                }
            })
            .addTimedChild(instance8, 7, 1, {
                "7": {
                    x: -334.15,
                    y: -167.15
                }
            })
            .addTimedChild(instance9, 8, 1, {
                "8": {
                    x: -334.15,
                    y: -167.15
                }
            })
            .addTimedChild(instance10, 9, 1, {
                "9": {
                    x: -334.15,
                    y: -167.15
                }
            })
            .addTimedChild(instance11, 10, 1, {
                "10": {
                    x: -334.15,
                    y: -167.15
                }
            })
            .addTimedChild(instance12, 11, 1, {
                "11": {
                    x: -334.15,
                    y: -167.15
                }
            })
            .addTimedChild(instance13, 12, 1, {
                "12": {
                    x: -334.15,
                    y: -167.15
                }
            })
            .addTimedChild(instance14, 13, 1, {
                "13": {
                    x: -334.15,
                    y: -167.15
                }
            })
            .addTimedChild(instance15, 14, 1, {
                "14": {
                    x: -334.15,
                    y: -167.15
                }
            })
            .addTimedChild(instance16, 15, 36);
    });

    var Graphic103 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 57, loop: false });
        var instance4 = new Graphic102(MovieClip.SYNCHED);
        var instance3 = new Graphic101(MovieClip.SYNCHED);
        var instance2 = new Graphic100(MovieClip.SYNCHED);
        var instance1 = new Graphic99(MovieClip.SYNCHED);
        this.addTimedChild(instance4, 6, 51, {
                "6": {
                    x: 2.35,
                    y: -30.1,
                    sx: 1,
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
                "46": {
                    x: 2.342,
                    y: -30.703,
                    sx: 0.997,
                    sy: 1.003
                },
                "47": {
                    x: 2.361,
                    y: -33.023,
                    sx: 0.983,
                    sy: 1.017
                },
                "48": {
                    x: 2.341,
                    y: -38.26,
                    sx: 0.954,
                    sy: 1.049
                },
                "49": {
                    x: 2.368,
                    y: -43.688,
                    sx: 0.923,
                    sy: 1.081
                },
                "50": {
                    x: 2.335,
                    y: -46.238,
                    sx: 0.908,
                    sy: 1.096
                },
                "51": {
                    x: 2.35,
                    y: -46.85,
                    sx: 0.905,
                    sy: 1.1
                },
                "52": {
                    x: 1.924,
                    y: -36.484,
                    sx: 0.895,
                    sy: 1.057,
                    c: [
                        0.96,
                        0.04,
                        0.96,
                        0.04,
                        0.96,
                        0.04
                    ]
                },
                "53": {
                    x: 0.271,
                    y: 4.105,
                    sx: 0.855,
                    sy: 0.889,
                    c: [
                        0.79,
                        0.21,
                        0.79,
                        0.21,
                        0.79,
                        0.21
                    ]
                },
                "54": {
                    x: -3.249,
                    y: 90.617,
                    sx: 0.77,
                    sy: 0.532,
                    c: [
                        0.44,
                        0.56,
                        0.44,
                        0.56,
                        0.44,
                        0.56
                    ]
                },
                "55": {
                    x: -6.713,
                    y: 174.702,
                    sx: 0.688,
                    sy: 0.185,
                    c: [
                        0.09,
                        0.91,
                        0.09,
                        0.91,
                        0.09,
                        0.91
                    ]
                },
                "56": {
                    x: -7.65,
                    y: 198,
                    sx: 0.665,
                    sy: 0.089,
                    c: [
                        0,
                        1,
                        0,
                        1,
                        0,
                        1
                    ]
                }
            })
            .addTimedChild(instance3, 4, 49, {
                "4": {
                    x: 222.5,
                    y: 101.5,
                    sx: 0.133,
                    sy: 0.133,
                    a: 1,
                    c: [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                "5": {
                    x: 222.513,
                    y: 101.521,
                    sx: 0.187,
                    sy: 0.187,
                    c: [
                        0.05,
                        0,
                        0.05,
                        0,
                        0.05,
                        0
                    ]
                },
                "6": {
                    x: 222.485,
                    y: 101.498,
                    sx: 0.42,
                    sy: 0.42,
                    c: [
                        0.28,
                        0,
                        0.28,
                        0,
                        0.28,
                        0
                    ]
                },
                "7": {
                    x: 222.461,
                    y: 101.51,
                    sx: 0.861,
                    sy: 0.861,
                    c: [
                        0.7,
                        0,
                        0.7,
                        0,
                        0.7,
                        0
                    ]
                },
                "8": {
                    x: 222.474,
                    y: 101.483,
                    sx: 1.111,
                    sy: 1.111,
                    c: [
                        0.95,
                        0,
                        0.95,
                        0,
                        0.95,
                        0
                    ]
                },
                "9": {
                    x: 222.5,
                    y: 101.5,
                    sx: 1.168,
                    sy: 1.168,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "10": {
                    x: 222.463,
                    y: 101.532,
                    sx: 1.165,
                    sy: 1.165
                },
                "11": {
                    x: 222.476,
                    y: 101.535,
                    sx: 1.153,
                    sy: 1.153
                },
                "12": {
                    x: 222.477,
                    y: 101.518,
                    sx: 1.128,
                    sy: 1.128
                },
                "13": {
                    y: 101.496,
                    sx: 1.086,
                    sy: 1.086
                },
                "14": {
                    x: 222.471,
                    y: 101.534,
                    sx: 1.042,
                    sy: 1.042
                },
                "15": {
                    x: 222.486,
                    y: 101.514,
                    sx: 1.016,
                    sy: 1.016
                },
                "16": {
                    x: 222.45,
                    y: 101.499,
                    sx: 1.003,
                    sy: 1.003
                },
                "17": {
                    x: 222.5,
                    y: 101.5,
                    sx: 1,
                    sy: 1
                },
                "42": {
                    x: 222.485,
                    y: 101.482,
                    sx: 1.006,
                    sy: 1.006
                },
                "43": {
                    y: 101.492,
                    sx: 1.033,
                    sy: 1.033
                },
                "44": {
                    x: 222.516,
                    y: 101.483,
                    sx: 1.085,
                    sy: 1.085
                },
                "45": {
                    x: 222.487,
                    y: 101.485,
                    sx: 1.114,
                    sy: 1.114
                },
                "46": {
                    x: 222.5,
                    y: 101.5,
                    sx: 1.12,
                    sy: 1.12
                },
                "47": {
                    x: 222.507,
                    y: 101.483,
                    sx: 1.085,
                    sy: 1.085,
                    a: 0.97
                },
                "48": {
                    x: 222.508,
                    y: 101.519,
                    sx: 0.943,
                    sy: 0.943,
                    a: 0.86
                },
                "49": {
                    x: 222.516,
                    y: 101.506,
                    sx: 0.626,
                    sy: 0.626,
                    a: 0.6
                },
                "50": {
                    x: 222.504,
                    y: 101.48,
                    sx: 0.296,
                    sy: 0.296,
                    a: 0.33
                },
                "51": {
                    x: 222.485,
                    y: 101.494,
                    sx: 0.143,
                    sy: 0.143,
                    a: 0.21
                },
                "52": {
                    x: 222.5,
                    y: 101.5,
                    sx: 0.106,
                    sy: 0.106,
                    a: 0.18
                }
            })
            .addTimedChild(instance2, 3, 51, {
                "3": {
                    x: -234.5,
                    y: 118.5,
                    sx: 0.179,
                    sy: 0.18,
                    a: 1,
                    c: [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                "4": {
                    x: -234.485,
                    y: 118.492,
                    sx: 0.229,
                    sy: 0.231,
                    c: [
                        0.05,
                        0,
                        0.05,
                        0,
                        0.05,
                        0
                    ]
                },
                "5": {
                    x: -234.478,
                    y: 118.498,
                    sx: 0.449,
                    sy: 0.45,
                    c: [
                        0.28,
                        0,
                        0.28,
                        0,
                        0.28,
                        0
                    ]
                },
                "6": {
                    x: -234.504,
                    y: 118.482,
                    sx: 0.862,
                    sy: 0.862,
                    c: [
                        0.7,
                        0,
                        0.7,
                        0,
                        0.7,
                        0
                    ]
                },
                "7": {
                    x: -234.527,
                    y: 118.489,
                    sx: 1.096,
                    sy: 1.096,
                    c: [
                        0.95,
                        0,
                        0.95,
                        0,
                        0.95,
                        0
                    ]
                },
                "8": {
                    x: -234.5,
                    y: 118.5,
                    sx: 1.15,
                    sy: 1.15,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "9": {
                    x: -234.499,
                    y: 118.52,
                    sx: 1.146,
                    sy: 1.146
                },
                "10": {
                    x: -234.504,
                    y: 118.507,
                    sx: 1.132,
                    sy: 1.132
                },
                "11": {
                    x: -234.513,
                    y: 118.527,
                    sx: 1.1,
                    sy: 1.1
                },
                "12": {
                    x: -234.516,
                    y: 118.528,
                    sx: 1.053,
                    sy: 1.053
                },
                "13": {
                    x: -234.5,
                    y: 118.533,
                    sx: 1.019,
                    sy: 1.019
                },
                "14": {
                    x: -234.505,
                    y: 118.519,
                    sx: 1.004,
                    sy: 1.004
                },
                "15": {
                    x: -234.5,
                    y: 118.5,
                    sx: 1,
                    sy: 1
                },
                "44": {
                    x: -234.485,
                    y: 118.477,
                    sx: 1.007,
                    sy: 1.007
                },
                "45": {
                    x: -234.5,
                    y: 118.499,
                    sx: 1.04,
                    sy: 1.04
                },
                "46": {
                    x: -234.487,
                    y: 118.494,
                    sx: 1.1,
                    sy: 1.1
                },
                "47": {
                    x: -234.481,
                    y: 118.484,
                    sx: 1.135,
                    sy: 1.135
                },
                "48": {
                    x: -234.5,
                    y: 118.5,
                    sx: 1.143,
                    sy: 1.143
                },
                "49": {
                    x: -234.486,
                    y: 118.51,
                    sx: 1.089,
                    sy: 1.089,
                    a: 0.96
                },
                "50": {
                    x: -234.521,
                    y: 118.497,
                    sx: 0.856,
                    sy: 0.856,
                    a: 0.77
                },
                "51": {
                    x: -234.515,
                    y: 118.515,
                    sx: 0.418,
                    sy: 0.418,
                    a: 0.42
                },
                "52": {
                    x: -234.512,
                    sx: 0.168,
                    sy: 0.168,
                    a: 0.23
                },
                "53": {
                    x: -234.5,
                    y: 118.5,
                    sx: 0.112,
                    sy: 0.112,
                    a: 0.18
                }
            })
            .addTimedChild(instance1, 0, 52, {
                "0": {
                    x: 272.5,
                    y: 167.5,
                    sx: 0.178,
                    sy: 1,
                    a: 1
                },
                "1": {
                    x: 272.512,
                    sx: 0.23
                },
                "2": {
                    x: 272.486,
                    sx: 0.458
                },
                "3": {
                    x: 272.513,
                    sx: 0.887
                },
                "4": {
                    x: 272.498,
                    sx: 1.131
                },
                "5": {
                    x: 272.5,
                    sx: 1.186
                },
                "6": {
                    x: 272.488,
                    sx: 1.177
                },
                "7": {
                    x: 272.471,
                    sx: 1.134
                },
                "8": {
                    x: 272.483,
                    sx: 1.055
                },
                "9": {
                    x: 272.492,
                    sx: 1.01
                },
                "10": {
                    x: 272.5,
                    sx: 1
                },
                "42": {
                    x: 272.517,
                    y: 167.49,
                    sx: 1.007,
                    sy: 1.007
                },
                "43": {
                    x: 272.507,
                    y: 167.493,
                    sx: 1.04,
                    sy: 1.04
                },
                "44": {
                    x: 272.497,
                    y: 167.51,
                    sx: 1.1,
                    sy: 1.1
                },
                "45": {
                    x: 272.503,
                    y: 167.491,
                    sx: 1.135,
                    sy: 1.135
                },
                "46": {
                    x: 272.5,
                    y: 167.5,
                    sx: 1.143,
                    sy: 1.143
                },
                "47": {
                    x: 272.514,
                    y: 167.496,
                    sx: 1.106,
                    sy: 1.105,
                    a: 0.96
                },
                "48": {
                    x: 272.524,
                    y: 167.469,
                    sx: 0.944,
                    sy: 0.94,
                    a: 0.77
                },
                "49": {
                    y: 167.465,
                    sx: 0.64,
                    sy: 0.628,
                    a: 0.42
                },
                "50": {
                    x: 272.493,
                    y: 167.491,
                    sx: 0.467,
                    sy: 0.452,
                    a: 0.23
                },
                "51": {
                    x: 272.5,
                    y: 167.5,
                    sx: 0.427,
                    sy: 0.411,
                    a: 0.18
                }
            });
    });

    var Graphic104 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic105 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Graphic104(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 18, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic106 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic107 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Graphic106(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 18, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic108 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-+1"))
            .setTransform(-20.5, -20.5);
        this.addTimedChild(instance1);
    });

    var Graphic109 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Graphic108(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 18, {
            "0": {
                sx: 0.201,
                sy: 0.201,
                a: 0
            },
            "1": {
                sx: 0.222,
                sy: 0.222,
                a: 0.05
            },
            "2": {
                sx: 0.249,
                sy: 0.249,
                a: 0.11
            },
            "3": {
                sx: 0.281,
                sy: 0.281,
                a: 0.18
            },
            "4": {
                sx: 0.319,
                sy: 0.319,
                a: 0.26
            },
            "5": {
                sx: 0.362,
                sy: 0.362,
                a: 0.35
            },
            "6": {
                sx: 0.411,
                sy: 0.411,
                a: 0.46
            },
            "7": {
                sx: 0.466,
                sy: 0.466,
                a: 0.57
            },
            "8": {
                sx: 0.526,
                sy: 0.526,
                a: 0.7
            },
            "9": {
                sx: 0.591,
                sy: 0.591,
                a: 0.85
            },
            "10": {
                sx: 0.662,
                sy: 0.662,
                a: 1
            },
            "11": {
                sx: 0.697,
                sy: 0.697,
                a: 0.73
            },
            "12": {
                sx: 0.727,
                sy: 0.727,
                a: 0.51
            },
            "13": {
                sx: 0.751,
                sy: 0.751,
                a: 0.32
            },
            "14": {
                sx: 0.77,
                sy: 0.77,
                a: 0.18
            },
            "15": {
                sx: 0.783,
                sy: 0.783,
                a: 0.08
            },
            "16": {
                sx: 0.791,
                sy: 0.791,
                a: 0.02
            },
            "17": {
                sx: 0.794,
                sy: 0.794,
                a: 0
            }
        });
    });

    var Graphic110 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic111 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Graphic110(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 18, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic112 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-+1"))
            .setTransform(-20.5, -20.5);
        this.addTimedChild(instance1);
    });

    var Graphic113 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Graphic112(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 18, {
            "0": {
                sx: 0.201,
                sy: 0.201,
                a: 0
            },
            "1": {
                sx: 0.222,
                sy: 0.222,
                a: 0.05
            },
            "2": {
                sx: 0.249,
                sy: 0.249,
                a: 0.11
            },
            "3": {
                sx: 0.281,
                sy: 0.281,
                a: 0.18
            },
            "4": {
                sx: 0.319,
                sy: 0.319,
                a: 0.26
            },
            "5": {
                sx: 0.362,
                sy: 0.362,
                a: 0.35
            },
            "6": {
                sx: 0.411,
                sy: 0.411,
                a: 0.46
            },
            "7": {
                sx: 0.466,
                sy: 0.466,
                a: 0.57
            },
            "8": {
                sx: 0.526,
                sy: 0.526,
                a: 0.7
            },
            "9": {
                sx: 0.591,
                sy: 0.591,
                a: 0.85
            },
            "10": {
                sx: 0.662,
                sy: 0.662,
                a: 1
            },
            "11": {
                sx: 0.697,
                sy: 0.697,
                a: 0.73
            },
            "12": {
                sx: 0.727,
                sy: 0.727,
                a: 0.51
            },
            "13": {
                sx: 0.751,
                sy: 0.751,
                a: 0.32
            },
            "14": {
                sx: 0.77,
                sy: 0.77,
                a: 0.18
            },
            "15": {
                sx: 0.783,
                sy: 0.783,
                a: 0.08
            },
            "16": {
                sx: 0.791,
                sy: 0.791,
                a: 0.02
            },
            "17": {
                sx: 0.794,
                sy: 0.794,
                a: 0
            }
        });
    });

    var Graphic114 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-+1"))
            .setTransform(-20.5, -20.5);
        this.addTimedChild(instance1);
    });

    var Graphic115 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Graphic114(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 18, {
            "0": {
                sx: 0.201,
                sy: 0.201,
                a: 0
            },
            "1": {
                sx: 0.222,
                sy: 0.222,
                a: 0.05
            },
            "2": {
                sx: 0.249,
                sy: 0.249,
                a: 0.11
            },
            "3": {
                sx: 0.281,
                sy: 0.281,
                a: 0.18
            },
            "4": {
                sx: 0.319,
                sy: 0.319,
                a: 0.26
            },
            "5": {
                sx: 0.362,
                sy: 0.362,
                a: 0.35
            },
            "6": {
                sx: 0.411,
                sy: 0.411,
                a: 0.46
            },
            "7": {
                sx: 0.466,
                sy: 0.466,
                a: 0.57
            },
            "8": {
                sx: 0.526,
                sy: 0.526,
                a: 0.7
            },
            "9": {
                sx: 0.591,
                sy: 0.591,
                a: 0.85
            },
            "10": {
                sx: 0.662,
                sy: 0.662,
                a: 1
            },
            "11": {
                sx: 0.697,
                sy: 0.697,
                a: 0.73
            },
            "12": {
                sx: 0.727,
                sy: 0.727,
                a: 0.51
            },
            "13": {
                sx: 0.751,
                sy: 0.751,
                a: 0.32
            },
            "14": {
                sx: 0.77,
                sy: 0.77,
                a: 0.18
            },
            "15": {
                sx: 0.783,
                sy: 0.783,
                a: 0.08
            },
            "16": {
                sx: 0.791,
                sy: 0.791,
                a: 0.02
            },
            "17": {
                sx: 0.794,
                sy: 0.794,
                a: 0
            }
        });
    });

    var Graphic116 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-+1"))
            .setTransform(-20.5, -20.5);
        this.addTimedChild(instance1);
    });

    var Graphic117 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 18, loop: false });
        var instance1 = new Graphic116(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 18, {
            "0": {
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 0
            },
            "1": {
                sx: 0.208,
                sy: 0.208,
                r: -0.005,
                a: 0.01
            },
            "2": {
                sx: 0.229,
                sy: 0.229,
                r: -0.027,
                a: 0.04
            },
            "3": {
                sx: 0.267,
                sy: 0.267,
                r: -0.062,
                a: 0.08
            },
            "4": {
                sx: 0.321,
                sy: 0.321,
                r: -0.114,
                a: 0.15
            },
            "5": {
                sx: 0.393,
                sy: 0.393,
                r: -0.184,
                a: 0.23
            },
            "6": {
                sx: 0.48,
                sy: 0.48,
                r: -0.267,
                a: 0.34
            },
            "7": {
                sx: 0.581,
                sy: 0.581,
                r: -0.363,
                a: 0.46
            },
            "8": {
                sx: 0.692,
                sy: 0.692,
                r: -0.468,
                a: 0.6
            },
            "9": {
                sx: 0.807,
                sy: 0.807,
                r: -0.581,
                a: 0.74
            },
            "10": {
                sx: 0.919,
                sy: 0.919,
                r: -0.687,
                a: 0.88
            },
            "11": {
                sx: 1.023,
                sy: 1.023,
                r: -0.786,
                a: 1
            },
            "12": {
                sx: 1.086,
                sy: 1.086,
                r: -0.81,
                a: 0.73
            },
            "13": {
                sx: 1.141,
                sy: 1.141,
                r: -0.831,
                a: 0.51
            },
            "14": {
                sx: 1.187,
                sy: 1.187,
                r: -0.849,
                a: 0.32
            },
            "15": {
                sx: 1.222,
                sy: 1.222,
                r: -0.862,
                a: 0.18
            },
            "16": {
                sx: 1.247,
                sy: 1.247,
                r: -0.871,
                a: 0.08
            },
            "17": {
                sx: 1.261,
                sy: 1.261,
                r: -0.875,
                a: 0.02
            }
        });
    });

    var Graphic118 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-+1"))
            .setTransform(-20.5, -20.5);
        this.addTimedChild(instance1);
    });

    var Graphic119 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Graphic118(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.201,
                sy: 0.201,
                a: 0
            },
            "1": {
                sx: 0.222,
                sy: 0.222,
                a: 0.05
            },
            "2": {
                sx: 0.249,
                sy: 0.249,
                a: 0.11
            },
            "3": {
                sx: 0.281,
                sy: 0.281,
                a: 0.18
            },
            "4": {
                sx: 0.319,
                sy: 0.319,
                a: 0.26
            },
            "5": {
                sx: 0.362,
                sy: 0.362,
                a: 0.35
            },
            "6": {
                sx: 0.411,
                sy: 0.411,
                a: 0.46
            },
            "7": {
                sx: 0.466,
                sy: 0.466,
                a: 0.57
            },
            "8": {
                sx: 0.526,
                sy: 0.526,
                a: 0.7
            },
            "9": {
                sx: 0.591,
                sy: 0.591,
                a: 0.85
            },
            "10": {
                sx: 0.662,
                sy: 0.662,
                a: 1
            },
            "11": {
                sx: 0.697,
                sy: 0.697,
                a: 0.73
            },
            "12": {
                sx: 0.727,
                sy: 0.727,
                a: 0.51
            },
            "13": {
                sx: 0.751,
                sy: 0.751,
                a: 0.32
            },
            "14": {
                sx: 0.77,
                sy: 0.77,
                a: 0.18
            },
            "15": {
                sx: 0.783,
                sy: 0.783,
                a: 0.08
            }
        });
    });

    var Graphic120 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic121 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Graphic120(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic122 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 14, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic123 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 14, loop: false });
        var instance1 = new Graphic122(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 14, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic124 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 14, loop: false });
        var instance1 = new Sprite(fromFrame("rainbow-star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic125 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 14, loop: false });
        var instance1 = new Graphic124(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 14, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic126 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 10, loop: false });
        var instance1 = new Sprite(fromFrame("HeyJibo1"))
            .setTransform(-478.45, -102);
        this.addTimedChild(instance1);
    });

    var Graphic127 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 30, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic128 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 30, loop: false });
        var instance1 = new Graphic127(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 30, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic129 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 27, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic130 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 27, loop: false });
        var instance1 = new Graphic129(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 27, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic131 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 30, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic132 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 30, loop: false });
        var instance1 = new Graphic131(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 30, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic133 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic134 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic133(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.482,
                sy: 0.482,
                r: -0.359
            },
            "2": {
                sx: 0.583,
                sy: 0.583,
                r: -0.289
            },
            "3": {
                sx: 0.684,
                sy: 0.684,
                r: -0.223
            },
            "4": {
                sx: 0.785,
                sy: 0.785,
                r: -0.154
            },
            "5": {
                sx: 0.886,
                sy: 0.886,
                r: -0.088
            },
            "6": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "7": {
                sx: 1.056,
                sy: 1.056,
                r: 0.022,
                a: 0.8
            },
            "8": {
                sx: 1.125,
                sy: 1.125,
                r: 0.07,
                a: 0.6
            },
            "9": {
                sx: 1.194,
                sy: 1.194,
                r: 0.114,
                a: 0.4
            },
            "10": {
                sx: 1.263,
                sy: 1.263,
                r: 0.162,
                a: 0.2
            },
            "11": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic135 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("emoji-star-sparkle1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic136 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 28, loop: false });
        var instance1 = new Sprite(fromFrame("emoji-star-sparkle1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic137 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 21, loop: false });
        var instance1 = new Sprite(fromFrame("emoji-star-sparkle1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic138 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("emoji-star-sparkle1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic139 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 24, loop: false });
        var instance1 = new Sprite(fromFrame("emoji-star-sparkle1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic140 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 24, loop: false });
        var instance1 = new Sprite(fromFrame("emoji-star-sparkle1"))
            .setTransform(-21.85, -21.9);
        this.addTimedChild(instance1);
    });

    var Graphic141 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance3 = new Graphic140(MovieClip.SYNCHED);
        var instance2 = new Graphic139(MovieClip.SYNCHED);
        var instance6 = new Graphic138(MovieClip.SYNCHED);
        var instance5 = new Graphic137(MovieClip.SYNCHED);
        var instance4 = new Graphic136(MovieClip.SYNCHED);
        var instance1 = new Graphic135(MovieClip.SYNCHED);
        var instance10 = new Graphic134(MovieClip.SYNCHED)
            .setTransform(240, -103.1, 0.893, 0.893, 0.615);
        var instance8 = new Graphic132(MovieClip.SYNCHED)
            .setTransform(-228.95, 54.9, 0.593, 0.593, 1.098);
        var instance9 = new Graphic130(MovieClip.SYNCHED)
            .setTransform(14, 248.85, 0.819, 0.819);
        var instance7 = new Graphic128(MovieClip.SYNCHED)
            .setTransform(-95, -190.1, 0.819, 0.819);
        this.addTimedChild(instance3, 0, 24, {
                "0": {
                    x: -34.1,
                    y: 7.9,
                    sx: 0.395,
                    sy: 0.395,
                    kx: 4.096,
                    ky: 2.187,
                    r: 0,
                    a: 1
                },
                "1": {
                    x: -34.535,
                    y: 7.907,
                    kx: 4.104,
                    ky: 2.179
                },
                "2": {
                    x: -36.081,
                    y: 7.924,
                    kx: 4.122,
                    ky: 2.161
                },
                "3": {
                    x: -38.702,
                    y: 8.01,
                    kx: 4.157,
                    ky: 2.126
                },
                "4": {
                    x: -42.793,
                    y: 8.124,
                    kx: 4.213,
                    ky: 2.07
                },
                "5": {
                    x: -48.374,
                    y: 8.24,
                    kx: 4.288,
                    ky: 1.995
                },
                "6": {
                    x: -55.754,
                    y: 8.365,
                    kx: 4.385,
                    ky: 1.898
                },
                "7": {
                    x: -65.266,
                    y: 8.67,
                    kx: 4.515,
                    ky: 1.768
                },
                "8": {
                    x: -77.217,
                    y: 8.909,
                    kx: 4.673,
                    ky: 1.61
                },
                "9": {
                    x: -92.158,
                    y: 9.292,
                    kx: 0,
                    ky: 0,
                    r: 1.417
                },
                "10": {
                    x: -110.108,
                    y: 9.737,
                    r: 1.177
                },
                "11": {
                    x: -131.379,
                    y: 10.242,
                    r: 0.892
                },
                "12": {
                    x: -155.548,
                    y: 10.865,
                    r: 0.569
                },
                "13": {
                    x: -181.178,
                    y: 11.492,
                    r: 0.224
                },
                "14": {
                    x: -206.439,
                    y: 12.088,
                    r: -0.109
                },
                "15": {
                    x: -229.201,
                    y: 12.656,
                    r: -0.415
                },
                "16": {
                    x: -248.5,
                    y: 13.1,
                    r: -0.672
                },
                "17": {
                    x: -263.775,
                    y: 10.788,
                    sx: 0.394,
                    sy: 0.394,
                    r: -0.845,
                    a: 0.69
                },
                "18": {
                    x: -275.635,
                    y: 8.995,
                    sx: 0.395,
                    sy: 0.395,
                    r: -0.98,
                    a: 0.45
                },
                "19": {
                    x: -284.462,
                    y: 7.624,
                    r: -1.081,
                    a: 0.27
                },
                "20": {
                    x: -290.811,
                    y: 6.697,
                    r: -1.155,
                    a: 0.14
                },
                "21": {
                    x: -294.883,
                    y: 6.17,
                    r: -1.199,
                    a: 0.06
                },
                "22": {
                    x: -297.178,
                    y: 5.735,
                    r: -1.225,
                    a: 0.02
                },
                "23": {
                    x: -297.75,
                    y: 5.6,
                    r: -1.233,
                    a: 0
                }
            })
            .addTimedChild(instance2, 0, 24, {
                "0": {
                    x: 15.95,
                    y: 4.5,
                    sx: 1.045,
                    sy: 1.045,
                    r: 0.233,
                    a: 1
                },
                "1": {
                    x: 16.99,
                    y: 4.99,
                    sx: 1.044,
                    sy: 1.044,
                    r: 0.232
                },
                "2": {
                    x: 20.32,
                    y: 6.36,
                    r: 0.237
                },
                "3": {
                    x: 26.479,
                    y: 9.048,
                    r: 0.245
                },
                "4": {
                    x: 36.066,
                    y: 13.155,
                    r: 0.258
                },
                "5": {
                    x: 50.025,
                    y: 19.037,
                    r: 0.276
                },
                "6": {
                    x: 69.282,
                    y: 27.247,
                    r: 0.302
                },
                "7": {
                    x: 94.926,
                    y: 38.188,
                    r: 0.337
                },
                "8": {
                    x: 127.417,
                    y: 52.005,
                    r: 0.385
                },
                "9": {
                    x: 165.212,
                    y: 68.133,
                    r: 0.433
                },
                "10": {
                    x: 203.144,
                    y: 84.291,
                    r: 0.486
                },
                "11": {
                    x: 235.563,
                    y: 98.06,
                    r: 0.53
                },
                "12": {
                    x: 259.945,
                    y: 108.385,
                    r: 0.564
                },
                "13": {
                    x: 276.632,
                    y: 115.533,
                    r: 0.586
                },
                "14": {
                    x: 287.05,
                    y: 120.011,
                    r: 0.6
                },
                "15": {
                    x: 292.566,
                    y: 122.323,
                    r: 0.608
                },
                "16": {
                    x: 294.25,
                    y: 123,
                    sx: 1.045,
                    sy: 1.045,
                    r: 0.611
                },
                "17": {
                    x: 294.291,
                    y: 122.951,
                    sx: 1.044,
                    sy: 1.044,
                    r: 0.612,
                    a: 0.86
                },
                "18": {
                    a: 0.71
                },
                "19": {
                    a: 0.57
                },
                "20": {
                    a: 0.43
                },
                "21": {
                    a: 0.29
                },
                "22": {
                    a: 0.14
                },
                "23": {
                    x: 294.25,
                    y: 123,
                    sx: 1.045,
                    sy: 1.045,
                    r: 0.611,
                    a: 0
                }
            })
            .addTimedChild(instance6, 2, 23, {
                "2": {
                    x: 12.5,
                    y: 5.7,
                    sx: 1.648,
                    sy: 1.648,
                    r: -0.776,
                    a: 1
                },
                "3": {
                    x: 12.767,
                    y: 5.218,
                    sx: 1.646,
                    sy: 1.646,
                    r: -0.774
                },
                "4": {
                    x: 13.765,
                    y: 3.979,
                    r: -0.765
                },
                "5": {
                    x: 15.561,
                    y: 1.644,
                    r: -0.748
                },
                "6": {
                    x: 18.149,
                    y: -1.736,
                    r: -0.722
                },
                "7": {
                    x: 21.867,
                    y: -6.512,
                    r: -0.686
                },
                "8": {
                    x: 26.826,
                    y: -12.846,
                    r: -0.638
                },
                "9": {
                    x: 33.176,
                    y: -21.112,
                    r: -0.573
                },
                "10": {
                    x: 41.256,
                    y: -31.516,
                    r: -0.495
                },
                "11": {
                    x: 51.296,
                    y: -44.453,
                    r: -0.398
                },
                "12": {
                    x: 63.465,
                    y: -60.051,
                    r: -0.28
                },
                "13": {
                    x: 77.517,
                    y: -78.356,
                    sx: 1.647,
                    sy: 1.647,
                    r: -0.141
                },
                "14": {
                    x: 92.958,
                    y: -98.312,
                    r: 0.005
                },
                "15": {
                    x: 108.401,
                    y: -118.383,
                    sx: 1.646,
                    sy: 1.646,
                    r: 0.157
                },
                "16": {
                    x: 122.553,
                    y: -136.727,
                    sx: 1.645,
                    sy: 1.645,
                    r: 0.293
                },
                "17": {
                    x: 134.492,
                    y: -152.21,
                    sx: 1.644,
                    sy: 1.644,
                    r: 0.411
                },
                "18": {
                    x: 143.8,
                    y: -164.4,
                    sx: 1.646,
                    sy: 1.646,
                    r: 0.503
                },
                "19": {
                    x: 150.21,
                    y: -172.759,
                    sx: 1.644,
                    sy: 1.644,
                    r: 0.565,
                    a: 0.65
                },
                "20": {
                    x: 154.962,
                    y: -178.928,
                    sx: 1.645,
                    sy: 1.645,
                    r: 0.613,
                    a: 0.39
                },
                "21": {
                    x: 158.315,
                    y: -183.25,
                    r: 0.647,
                    a: 0.21
                },
                "22": {
                    x: 160.564,
                    y: -186.155,
                    sx: 1.646,
                    sy: 1.646,
                    r: 0.669,
                    a: 0.09
                },
                "23": {
                    x: 161.746,
                    y: -187.781,
                    r: 0.682,
                    a: 0.02
                },
                "24": {
                    x: 162,
                    y: -188.4,
                    sx: 1.648,
                    sy: 1.648,
                    r: 0.684,
                    a: 0
                }
            })
            .addTimedChild(instance5, 1, 21, {
                "1": {
                    x: 10.55,
                    y: 8.65,
                    sx: 1,
                    sy: 1,
                    r: -1.578,
                    a: 1
                },
                "2": {
                    x: 9.879,
                    y: 8.176,
                    r: -1.576
                },
                "3": {
                    x: 7.828,
                    y: 6.777
                },
                "4": {
                    x: 4.126,
                    y: 4.228
                },
                "5": {
                    x: -1.576,
                    y: 0.331,
                    r: -1.575
                },
                "6": {
                    x: -9.629,
                    y: -5.216
                },
                "7": {
                    x: -20.512,
                    y: -12.678,
                    r: -1.571
                },
                "8": {
                    x: -34.818,
                    y: -22.522
                },
                "9": {
                    x: -53.125,
                    y: -35.115,
                    r: -1.57
                },
                "10": {
                    x: -75.813,
                    y: -50.672,
                    r: -1.566
                },
                "11": {
                    x: -102.353,
                    y: -68.928,
                    sx: 0.999,
                    sy: 0.999,
                    r: -1.562
                },
                "12": {
                    x: -130.843,
                    y: -88.484,
                    r: -1.557
                },
                "13": {
                    x: -157.933,
                    y: -107.139,
                    r: -1.553
                },
                "14": {
                    x: -180.95,
                    y: -122.9,
                    r: -1.547
                },
                "15": {
                    x: -194.401,
                    y: -131.041,
                    r: -1.526,
                    a: 0.69
                },
                "16": {
                    x: -204.872,
                    y: -137.275,
                    r: -1.509,
                    a: 0.45
                },
                "17": {
                    x: -212.617,
                    y: -141.995,
                    sx: 1,
                    sy: 1,
                    r: -1.496,
                    a: 0.27
                },
                "18": {
                    x: -218.104,
                    y: -145.269,
                    r: -1.483,
                    a: 0.14
                },
                "19": {
                    x: -221.667,
                    y: -147.457,
                    r: -1.479,
                    a: 0.06
                },
                "20": {
                    x: -223.659,
                    y: -148.672,
                    r: -1.475,
                    a: 0.02
                },
                "21": {
                    x: -224.2,
                    y: -148.95,
                    r: -1.473,
                    a: 0
                }
            })
            .addTimedChild(instance4, 1, 28, {
                "1": {
                    x: 13.65,
                    y: 3.95,
                    sx: 0.395,
                    sy: 0.395,
                    kx: 0,
                    ky: 0,
                    r: -0.644,
                    a: 1
                },
                "2": {
                    x: 13.958,
                    y: 4.265,
                    r: -0.639
                },
                "3": {
                    x: 15.152,
                    y: 5.299,
                    r: -0.625
                },
                "4": {
                    x: 17.137,
                    y: 7.104,
                    r: -0.599
                },
                "5": {
                    x: 20.148,
                    y: 9.78,
                    r: -0.559
                },
                "6": {
                    x: 24.292,
                    y: 13.417,
                    r: -0.503
                },
                "7": {
                    x: 29.752,
                    y: 18.364,
                    r: -0.433
                },
                "8": {
                    x: 36.736,
                    y: 24.582,
                    r: -0.341
                },
                "9": {
                    x: 45.573,
                    y: 32.378,
                    r: -0.227
                },
                "10": {
                    x: 56.311,
                    y: 41.992,
                    r: -0.084
                },
                "11": {
                    x: 69.418,
                    y: 53.666,
                    r: 0.083
                },
                "12": {
                    x: 84.907,
                    y: 67.478,
                    r: 0.285
                },
                "13": {
                    x: 102.913,
                    y: 83.521,
                    r: 0.52
                },
                "14": {
                    x: 122.853,
                    y: 101.249,
                    sx: 0.394,
                    sy: 0.394,
                    r: 0.779
                },
                "15": {
                    x: 143.611,
                    y: 119.808,
                    sx: 0.395,
                    sy: 0.395,
                    r: 1.054
                },
                "16": {
                    x: 163.823,
                    y: 137.753,
                    r: 1.317
                },
                "17": {
                    x: 182.013,
                    y: 153.934,
                    r: 1.553
                },
                "18": {
                    x: 197.423,
                    y: 167.663,
                    kx: 4.532,
                    ky: 1.751,
                    r: 0
                },
                "19": {
                    x: 209.906,
                    y: 178.738,
                    sx: 0.394,
                    sy: 0.394,
                    kx: 4.367,
                    ky: 1.916
                },
                "20": {
                    x: 219.55,
                    y: 187.45,
                    sx: 0.395,
                    sy: 0.395,
                    kx: 4.24,
                    ky: 2.043
                },
                "21": {
                    x: 224.4,
                    y: 191.761,
                    sx: 0.394,
                    sy: 0.394,
                    kx: 4.178,
                    ky: 2.105,
                    a: 0.74
                },
                "22": {
                    x: 228.362,
                    y: 195.341,
                    sx: 0.395,
                    sy: 0.395,
                    kx: 4.126,
                    ky: 2.157,
                    a: 0.52
                },
                "23": {
                    x: 231.585,
                    y: 198.184,
                    kx: 4.083,
                    ky: 2.2,
                    a: 0.35
                },
                "24": {
                    x: 234.067,
                    y: 200.378,
                    kx: 4.052,
                    ky: 2.231,
                    a: 0.21
                },
                "25": {
                    x: 235.868,
                    y: 201.978,
                    kx: 4.029,
                    ky: 2.254,
                    a: 0.12
                },
                "26": {
                    x: 237.017,
                    y: 203.077,
                    kx: 4.012,
                    ky: 2.271,
                    a: 0.05
                },
                "27": {
                    x: 237.81,
                    y: 203.705,
                    kx: 4.003,
                    ky: 2.28,
                    a: 0.01
                },
                "28": {
                    x: 238.05,
                    y: 203.85,
                    kx: 3.999,
                    ky: 2.284,
                    a: 0
                }
            })
            .addTimedChild(instance1, 0, 23, {
                "0": {
                    x: 3.55,
                    y: 3.9,
                    sx: 0.836,
                    sy: 0.836,
                    kx: 3.539,
                    ky: 2.744,
                    r: 0,
                    a: 1
                },
                "1": {
                    x: 3.031,
                    y: 4.159,
                    sx: 0.835,
                    sy: 0.835,
                    kx: 3.535,
                    ky: 2.748
                },
                "2": {
                    x: 1.446,
                    y: 5.14,
                    kx: 3.526,
                    ky: 2.757
                },
                "3": {
                    x: -1.323,
                    y: 6.75,
                    kx: 3.509,
                    ky: 2.774
                },
                "4": {
                    x: -5.678,
                    y: 9.289,
                    kx: 3.483,
                    ky: 2.8
                },
                "5": {
                    x: -11.624,
                    y: 12.803,
                    kx: 3.448,
                    ky: 2.836
                },
                "6": {
                    x: -19.58,
                    y: 17.501,
                    kx: 3.399,
                    ky: 2.884
                },
                "7": {
                    x: -29.917,
                    y: 23.585,
                    kx: 3.335,
                    ky: 2.948
                },
                "8": {
                    x: -42.981,
                    y: 31.282,
                    sx: 0.836,
                    sy: 0.836,
                    kx: 3.256,
                    ky: 3.027
                },
                "9": {
                    x: -59.197,
                    y: 40.835,
                    kx: 3.16,
                    ky: 3.123
                },
                "10": {
                    x: -78.824,
                    y: 52.362,
                    sx: 0.835,
                    sy: 0.835,
                    kx: 0,
                    ky: 0,
                    r: -3.045
                },
                "11": {
                    x: -101.679,
                    y: 65.835,
                    r: -2.909
                },
                "12": {
                    x: -126.63,
                    y: 80.558,
                    sx: 0.834,
                    sy: 0.834,
                    r: -2.757
                },
                "13": {
                    x: -151.709,
                    y: 95.413,
                    r: -2.607
                },
                "14": {
                    x: -174.617,
                    y: 108.921,
                    r: -2.468
                },
                "15": {
                    x: -193.939,
                    y: 120.334,
                    r: -2.35
                },
                "16": {
                    x: -209.25,
                    y: 129.4,
                    sx: 0.835,
                    sy: 0.835,
                    r: -2.259
                },
                "17": {
                    x: -213.809,
                    y: 132.123,
                    sx: 0.834,
                    sy: 0.834,
                    r: -2.196,
                    a: 0.65
                },
                "18": {
                    x: -217.202,
                    y: 134.16,
                    r: -2.148,
                    a: 0.39
                },
                "19": {
                    x: -219.639,
                    y: 135.583,
                    sx: 0.835,
                    sy: 0.835,
                    r: -2.114,
                    a: 0.21
                },
                "20": {
                    x: -221.215,
                    y: 136.531,
                    r: -2.092,
                    a: 0.09
                },
                "21": {
                    x: -222.124,
                    y: 137.056,
                    r: -2.082,
                    a: 0.02
                },
                "22": {
                    x: -222.3,
                    y: 137.3,
                    sx: 0.836,
                    sy: 0.836,
                    r: -2.078,
                    a: 0
                }
            })
            .addTimedChild(instance10, 15, 25)
            .addTimedChild(instance8, 10, 30)
            .addTimedChild(instance9, 13, 27)
            .addTimedChild(instance7, 10, 30);
    });

    var Graphic142 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 51, loop: false });
        var instance1 = new Sprite(fromFrame("emoji-star1"))
            .setTransform(-233.1, -268.35);
        this.addTimedChild(instance1);
    });

    var Graphic143 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 14, loop: false });
        var instance1 = new Graphics()
            .drawCommands(shapes.enrollment[1]);
        this.addTimedChild(instance1);
    });

    var Graphic144 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 14, loop: false });
        var instance1 = new Graphics()
            .drawCommands(shapes.enrollment[0])
            .setRenderable(false);
        var instance2 = new Graphic143(MovieClip.SYNCHED)
            .setMask(instance1);
        this.addTimedChild(instance1)
            .addTimedChild(instance2, 0, 14, {
                "0": {
                    x: -126.1,
                    y: -131.85,
                    a: 0.25
                },
                "1": {
                    x: -124.2,
                    y: -129.95
                },
                "2": {
                    x: -117.8,
                    y: -123.55
                },
                "3": {
                    x: -105.9,
                    y: -111.65
                },
                "4": {
                    x: -87,
                    y: -92.75
                },
                "5": {
                    x: -59.05,
                    y: -64.8
                },
                "6": {
                    x: -19.7,
                    y: -25.45
                },
                "7": {
                    x: 32.35,
                    y: 26.6
                },
                "8": {
                    x: 93.85,
                    y: 88.1
                },
                "9": {
                    x: 154.1,
                    y: 148.35
                },
                "10": {
                    x: 202.25,
                    y: 196.5
                },
                "11": {
                    x: 235.35,
                    y: 229.6
                },
                "12": {
                    x: 255.7,
                    y: 249.95
                },
                "13": {
                    x: 266.2,
                    y: 260.45
                }
            });
    });

    var Graphic145 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 10, loop: false });
        var instance1 = new Sprite(fromFrame("HeyJibo1"))
            .setTransform(-478.45, -102);
        this.addTimedChild(instance1);
    });

    var Graphic146 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 6, loop: false });
        var instance1 = new Sprite(fromFrame("sunglasses-morph1"));
        var instance2 = new Sprite(fromFrame("sunglasses-morph3"));
        var instance3 = new Sprite(fromFrame("sunglasses-morph4"));
        var instance4 = new Sprite(fromFrame("sunglasses-morph5"))
            .setTransform(-342.75, -129.55);
        this.addTimedChild(instance1, 0, 2, {
                "0": {
                    x: -279.55,
                    y: -135.05
                }
            })
            .addTimedChild(instance2, 2, 1, {
                "2": {
                    x: -306.75,
                    y: -127.55
                }
            })
            .addTimedChild(instance3, 3, 1, {
                "3": {
                    x: -326.75,
                    y: -117.6
                }
            })
            .addTimedChild(instance4, 4, 2);
    });

    var Graphic147 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 56, loop: false });
        var instance1 = new Sprite(fromFrame("sunglasses-shine1"))
            .setTransform(-468.65, -146.4);
        this.addTimedChild(instance1);
    });

    var Graphic148 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 60, loop: false });
        var instance1 = new Sprite(fromFrame("sunglasses-lensR1"))
            .setTransform(-151.85, -120.4);
        this.addTimedChild(instance1);
    });

    var Graphic149 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 60, loop: false });
        var instance1 = new Sprite(fromFrame("sunglasses-lensL1"))
            .setTransform(-151.85, -120.4);
        this.addTimedChild(instance1);
    });

    var Graphic150 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 56, loop: false });
        var instance1 = new Sprite(fromFrame("sunglasses-whitedot1"))
            .setTransform(-17, -8.45);
        this.addTimedChild(instance1);
    });

    var Graphic151 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 51, loop: false });
        var instance1 = new Sprite(fromFrame("sunglasses-whitedot1"))
            .setTransform(-17, -8.45);
        this.addTimedChild(instance1);
    });

    var Graphic152 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 64, loop: false });
        var instance1 = new Sprite(fromFrame("sunglasses-frame1"))
            .setTransform(-423.85, -153.5);
        this.addTimedChild(instance1);
    });

    var Graphic153 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 66, loop: false });
        var instance2 = new Graphic152(MovieClip.SYNCHED);
        var instance1 = new Graphic146(MovieClip.SYNCHED);
        var instance7 = new Graphic151(MovieClip.SYNCHED);
        var instance6 = new Graphic150(MovieClip.SYNCHED);
        var instance4 = new Graphic149(MovieClip.SYNCHED);
        var instance3 = new Graphic148(MovieClip.SYNCHED);
        var instance5 = new Graphic147(MovieClip.SYNCHED);
        this.addTimedChild(instance2, 2, 64, {
                "2": {
                    sx: 0.446,
                    sy: 0.446,
                    c: [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                "3": {
                    sx: 0.486,
                    sy: 0.486,
                    c: [
                        0.07,
                        0,
                        0.07,
                        0,
                        0.07,
                        0
                    ]
                },
                "4": {
                    sx: 0.614,
                    sy: 0.614,
                    c: [
                        0.27,
                        0,
                        0.27,
                        0,
                        0.27,
                        0
                    ]
                },
                "5": {
                    sx: 0.812,
                    sy: 0.812,
                    c: [
                        0.59,
                        0,
                        0.59,
                        0,
                        0.59,
                        0
                    ]
                },
                "6": {
                    sx: 0.995,
                    sy: 0.995,
                    c: [
                        0.89,
                        0,
                        0.89,
                        0,
                        0.89,
                        0
                    ]
                },
                "7": {
                    sx: 1.066,
                    sy: 1.066,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "8": {
                    sx: 1.064,
                    sy: 1.064
                },
                "9": {
                    sx: 1.057,
                    sy: 1.057
                },
                "10": {
                    sx: 1.045,
                    sy: 1.045
                },
                "11": {
                    sx: 1.03,
                    sy: 1.03
                },
                "12": {
                    sx: 1.015,
                    sy: 1.015
                },
                "13": {
                    sx: 1.004,
                    sy: 1.004
                },
                "14": {
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance1, 0, 6, {
                "0": {
                    x: 3.25,
                    y: -4.25,
                    a: 0,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "1": {
                    a: 0.2,
                    c: [
                        0.8,
                        0.02,
                        0.8,
                        0.02,
                        0.8,
                        0.02
                    ]
                },
                "2": {
                    a: 0.4,
                    c: [
                        0.6,
                        0.04,
                        0.6,
                        0.04,
                        0.6,
                        0.05
                    ]
                },
                "3": {
                    a: 0.6,
                    c: [
                        0.4,
                        0.07,
                        0.4,
                        0.07,
                        0.4,
                        0.07
                    ]
                },
                "4": {
                    a: 0.8,
                    c: [
                        0.2,
                        0.09,
                        0.2,
                        0.09,
                        0.2,
                        0.1
                    ]
                },
                "5": {
                    a: 1,
                    c: [
                        0,
                        0.11,
                        0,
                        0.11,
                        0,
                        0.13
                    ]
                }
            })
            .addTimedChild(instance7, 15, 51, {
                "15": {
                    x: 388.4,
                    y: -105.3,
                    sx: 0.298,
                    sy: 0.298,
                    ky: 3.142,
                    a: 0.18
                },
                "16": {
                    x: 388.418,
                    y: -105.28,
                    sx: 0.327,
                    sy: 0.327,
                    a: 0.21
                },
                "17": {
                    x: 388.383,
                    y: -105.286,
                    sx: 0.419,
                    sy: 0.419,
                    a: 0.29
                },
                "18": {
                    x: 388.368,
                    y: -105.3,
                    sx: 0.574,
                    sy: 0.574,
                    a: 0.44
                },
                "19": {
                    x: 388.403,
                    y: -105.297,
                    sx: 0.777,
                    sy: 0.777,
                    a: 0.63
                },
                "20": {
                    x: 388.404,
                    y: -105.329,
                    sx: 0.982,
                    sy: 0.982,
                    a: 0.81
                },
                "21": {
                    x: 388.391,
                    y: -105.332,
                    sx: 1.13,
                    sy: 1.13,
                    a: 0.95
                },
                "22": {
                    x: 388.35,
                    y: -105.25,
                    sx: 1.182,
                    sy: 1.182,
                    a: 1
                },
                "23": {
                    x: 388.348,
                    y: -105.268,
                    sx: 1.174,
                    sy: 1.174
                },
                "24": {
                    x: 388.359,
                    y: -105.253,
                    sx: 1.148,
                    sy: 1.148
                },
                "25": {
                    x: 388.323,
                    y: -105.286,
                    sx: 1.105,
                    sy: 1.105
                },
                "26": {
                    x: 388.369,
                    sx: 1.055,
                    sy: 1.055
                },
                "27": {
                    x: 388.346,
                    y: -105.266,
                    sx: 1.015,
                    sy: 1.015
                },
                "28": {
                    x: 388.35,
                    y: -105.25,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance6, 10, 56, {
                "10": {
                    x: -382.05,
                    y: -105.3,
                    sx: 0.209,
                    sy: 0.209,
                    a: 0.18
                },
                "11": {
                    x: -382.029,
                    y: -105.326,
                    sx: 0.242,
                    sy: 0.242,
                    a: 0.21
                },
                "12": {
                    x: -382.045,
                    y: -105.307,
                    sx: 0.348,
                    sy: 0.348,
                    a: 0.29
                },
                "13": {
                    x: -382.024,
                    y: -105.289,
                    sx: 0.527,
                    sy: 0.527,
                    a: 0.44
                },
                "14": {
                    x: -382.017,
                    y: -105.324,
                    sx: 0.76,
                    sy: 0.76,
                    a: 0.63
                },
                "15": {
                    x: -382.035,
                    y: -105.314,
                    sx: 0.996,
                    sy: 0.996,
                    a: 0.81
                },
                "16": {
                    x: -382.047,
                    y: -105.288,
                    sx: 1.166,
                    sy: 1.166,
                    a: 0.95
                },
                "17": {
                    x: -382,
                    y: -105.25,
                    sx: 1.226,
                    sy: 1.226,
                    a: 1
                },
                "18": {
                    x: -382.023,
                    y: -105.275,
                    sx: 1.216,
                    sy: 1.216
                },
                "19": {
                    x: -382.013,
                    y: -105.253,
                    sx: 1.184,
                    sy: 1.184
                },
                "20": {
                    x: -382.03,
                    y: -105.284,
                    sx: 1.131,
                    sy: 1.131
                },
                "21": {
                    y: -105.247,
                    sx: 1.068,
                    sy: 1.068
                },
                "22": {
                    x: -382.019,
                    y: -105.274,
                    sx: 1.018,
                    sy: 1.018
                },
                "23": {
                    x: -382,
                    y: -105.25,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance4, 6, 60, {
                "6": {
                    x: 225.3,
                    y: -4.7,
                    sx: 0.928,
                    sy: 1.133
                },
                "7": {
                    x: 224.956,
                    y: -4.69,
                    sx: 0.929,
                    sy: 1.131
                },
                "8": {
                    x: 223.772,
                    y: -4.707,
                    sx: 0.933,
                    sy: 1.123
                },
                "9": {
                    x: 221.577,
                    y: -4.693,
                    sx: 0.942,
                    sy: 1.107
                },
                "10": {
                    x: 218.05,
                    y: -4.69,
                    sx: 0.955,
                    sy: 1.082
                },
                "11": {
                    x: 213.501,
                    y: -4.708,
                    sx: 0.972,
                    sy: 1.05
                },
                "12": {
                    x: 209.407,
                    y: -4.689,
                    sx: 0.988,
                    sy: 1.022
                },
                "13": {
                    x: 206.985,
                    y: -4.719,
                    sx: 0.997,
                    sy: 1.005
                },
                "14": {
                    x: 206.3,
                    y: -4.7,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance3, 6, 60, {
                "6": {
                    x: -223.1,
                    y: -4.7,
                    sx: 0.924,
                    sy: 1.074
                },
                "7": {
                    x: -222.77,
                    y: -4.744,
                    sx: 0.926,
                    sy: 1.073
                },
                "8": {
                    x: -221.623,
                    y: -4.725,
                    sx: 0.93,
                    sy: 1.069
                },
                "9": {
                    x: -219.314,
                    y: -4.737,
                    sx: 0.939,
                    sy: 1.06
                },
                "10": {
                    x: -215.672,
                    y: -4.726,
                    sx: 0.953,
                    sy: 1.046
                },
                "11": {
                    x: -210.993,
                    y: -4.748,
                    sx: 0.971,
                    sy: 1.028
                },
                "12": {
                    x: -206.755,
                    y: -4.728,
                    sx: 0.988,
                    sy: 1.012
                },
                "13": {
                    x: -204.224,
                    y: -4.736,
                    sx: 0.997,
                    sy: 1.003
                },
                "14": {
                    x: -203.6,
                    y: -4.7,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance5, 10, 56, {
                "10": {
                    x: 1.35,
                    y: -13.7,
                    sx: 0.761,
                    sy: 0.761,
                    a: 0
                },
                "12": {
                    a: 0.01
                },
                "13": {
                    a: 0.02
                },
                "14": {
                    a: 0.04
                },
                "15": {
                    a: 0.07
                },
                "16": {
                    a: 0.09
                },
                "17": {
                    a: 0.13
                },
                "18": {
                    a: 0.17
                },
                "19": {
                    a: 0.21
                },
                "20": {
                    a: 0.26
                },
                "21": {
                    a: 0.3
                },
                "22": {
                    a: 0.35
                },
                "23": {
                    a: 0.39
                },
                "24": {
                    a: 0.43
                },
                "25": {
                    a: 0.46
                },
                "26": {
                    a: 0.48
                },
                "27": {
                    a: 0.5
                }
            });
    });

    var Graphic154 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 10, loop: false });
        var instance1 = new Sprite(fromFrame("HeyJibo1"))
            .setTransform(-478.45, -102);
        this.addTimedChild(instance1);
    });

    var Graphic155 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup1"))
            .setTransform(-209.35, -261.45);
        this.addTimedChild(instance1);
    });

    var Graphic156 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Graphic155(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 44, {
            "0": {
                y: -19,
                sx: 1.377,
                sy: 0.409,
                c: [
                    0,
                    0.99,
                    0,
                    0.99,
                    0,
                    0.99
                ]
            },
            "1": {
                y: -18.225,
                sx: 1.358,
                sy: 0.435,
                c: [
                    0.04,
                    0.95,
                    0.04,
                    0.95,
                    0.04,
                    0.95
                ]
            },
            "2": {
                y: -15.748,
                sx: 1.296,
                sy: 0.522,
                c: [
                    0.17,
                    0.82,
                    0.17,
                    0.82,
                    0.17,
                    0.82
                ]
            },
            "3": {
                y: -11.41,
                sx: 1.188,
                sy: 0.673,
                c: [
                    0.4,
                    0.6,
                    0.4,
                    0.6,
                    0.4,
                    0.6
                ]
            },
            "4": {
                y: -5.963,
                sx: 1.053,
                sy: 0.862,
                c: [
                    0.69,
                    0.31,
                    0.69,
                    0.31,
                    0.69,
                    0.31
                ]
            },
            "5": {
                y: -1.553,
                sx: 0.943,
                sy: 1.014,
                c: [
                    0.92,
                    0.08,
                    0.92,
                    0.08,
                    0.92,
                    0.08
                ]
            },
            "6": {
                y: 0,
                sx: 0.904,
                sy: 1.069,
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
                sx: 0.907,
                sy: 1.067
            },
            "8": {
                sx: 0.916,
                sy: 1.06
            },
            "9": {
                sx: 0.932,
                sy: 1.049
            },
            "10": {
                sx: 0.954,
                sy: 1.033
            },
            "11": {
                sx: 0.977,
                sy: 1.016
            },
            "12": {
                sx: 0.994,
                sy: 1.004
            },
            "13": {
                sx: 1,
                sy: 1
            },
            "34": {
                sx: 0.996,
                sy: 1.002
            },
            "35": {
                sx: 0.984,
                sy: 1.009
            },
            "36": {
                sx: 0.964,
                sy: 1.021
            },
            "37": {
                sx: 0.938,
                sy: 1.037
            },
            "38": {
                sx: 0.917,
                sy: 1.049
            },
            "39": {
                sx: 0.909,
                sy: 1.054
            },
            "40": {
                sx: 0.941,
                sy: 0.985,
                c: [
                    0.91,
                    0.09,
                    0.91,
                    0.09,
                    0.91,
                    0.09
                ]
            },
            "41": {
                sx: 1.047,
                sy: 0.761,
                c: [
                    0.6,
                    0.4,
                    0.6,
                    0.4,
                    0.6,
                    0.4
                ]
            },
            "42": {
                sx: 1.19,
                sy: 0.457,
                c: [
                    0.18,
                    0.81,
                    0.18,
                    0.81,
                    0.18,
                    0.81
                ]
            },
            "43": {
                sx: 1.253,
                sy: 0.323,
                c: [
                    0,
                    0.99,
                    0,
                    0.99,
                    0,
                    0.99
                ]
            }
        });
    });

    var Graphic157 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic158 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Graphic157(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 44, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic159 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic160 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Graphic159(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 44, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic161 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic162 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Graphic161(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 44, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic163 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic164 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Graphic163(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 44, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic165 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic166 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Graphic165(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 40, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic167 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic168 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Graphic167(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 40, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic169 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic170 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Graphic169(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 40, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic171 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic172 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Graphic171(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 40, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic173 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic174 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Graphic173(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 40, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic175 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic176 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Graphic175(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 40, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic177 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic178 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Graphic177(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 40, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic179 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Sprite(fromFrame("thumbsup-line1"))
            .setTransform(-2.4, -0.55, 1.047, 1.047);
        this.addTimedChild(instance1);
    });

    var Graphic180 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 40, loop: false });
        var instance1 = new Graphic179(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 40, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic181 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance12 = new Graphic180(MovieClip.SYNCHED)
            .setTransform(105.35, -162.7, 0.619, 0.619, 0.61);
        var instance11 = new Graphic178(MovieClip.SYNCHED)
            .setTransform(-109.6, -159.35, 0.619, 0.619, 0, 0.636, 2.506);
        var instance10 = new Graphic176(MovieClip.SYNCHED)
            .setTransform(-101.4, 155.35, 0.619, 0.619, -2.575);
        var instance9 = new Graphic174(MovieClip.SYNCHED)
            .setTransform(111.45, 151.2, 0.619, 0.619, 0, 3.781, -0.64);
        var instance8 = new Graphic172(MovieClip.SYNCHED)
            .setTransform(161.2, 92, 0.619, 0.619, 0, 4.146, 2.137);
        var instance7 = new Graphic170(MovieClip.SYNCHED)
            .setTransform(162.75, -107.6, 0.619, 0.619, 0, -1.004, -2.137);
        var instance6 = new Graphic168(MovieClip.SYNCHED)
            .setTransform(-165.05, 95.35, 0.619, 0.619, 0, 2.137, 1.004);
        var instance5 = new Graphic166(MovieClip.SYNCHED)
            .setTransform(-161.45, -105.05, 0.619, 0.619, -1.004);
        var instance4 = new Graphic164(MovieClip.SYNCHED)
            .setTransform(-1.45, -226.15, 0.735, 0.735);
        var instance3 = new Graphic162(MovieClip.SYNCHED)
            .setTransform(1, 217.15, 0.735, 0.735, 0, 3.142, 3.142);
        var instance2 = new Graphic160(MovieClip.SYNCHED)
            .setTransform(222.4, -10, 0.735, 0.735, 0, 4.712, 1.571);
        var instance1 = new Graphic158(MovieClip.SYNCHED)
            .setTransform(-222.4, -10, 0.735, 0.735, 0, 1.571, 1.571);
        this.addTimedChild(instance12, 4, 40)
            .addTimedChild(instance11, 4, 40)
            .addTimedChild(instance10, 4, 40)
            .addTimedChild(instance9, 4, 40)
            .addTimedChild(instance8, 4, 40)
            .addTimedChild(instance7, 4, 40)
            .addTimedChild(instance6, 4, 40)
            .addTimedChild(instance5, 4, 40)
            .addTimedChild(instance4)
            .addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic182 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 10, loop: false });
        var instance1 = new Sprite(fromFrame("HeyJibo1"))
            .setTransform(-478.45, -102);
        this.addTimedChild(instance1);
    });

    var Graphic183 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-bloop1"))
            .setTransform(-28.2, -46.85, 1.445, 1.445);
        this.addTimedChild(instance1);
    });

    var Graphic184 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-shape2"))
            .setTransform(-210.2, -289.4, 1.445, 1.445);
        this.addTimedChild(instance1);
    });

    var Graphic185 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 32, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-arrow3"));
        var instance2 = new Sprite(fromFrame("heartarrow-arrow1"))
            .setTransform(-458.95, 62.45, 1.445, 1.445);
        this.addTimedChild(instance1, 0, 26, {
                "0": {
                    x: -459.05,
                    y: -282.45,
                    sx: 1.445,
                    sy: 1.445
                }
            })
            .addTimedChild(instance2, 26, 6);
    });

    var Graphic186 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 55, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrowshine1"))
            .setTransform(-73.05, -93.3, 1.445, 1.445);
        this.addTimedChild(instance1);
    });

    var Graphic187 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 60, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-shape1"))
            .setTransform(-347.35, -289.4, 1.445, 1.445);
        this.addTimedChild(instance1);
    });

    var Graphic188 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 7, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-arrow2"))
            .setTransform(322.65, -282.45, 1.445, 1.445);
        this.addTimedChild(instance1);
    });

    var Graphic189 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 61, loop: false });
        var instance6 = new Graphic188(MovieClip.SYNCHED);
        var instance1 = new Graphic187(MovieClip.SYNCHED);
        var instance2 = new Graphic186(MovieClip.SYNCHED);
        var instance4 = new Graphic185(MovieClip.SYNCHED);
        var instance5 = new Graphic184(MovieClip.SYNCHED);
        var instance3 = new Graphic183(MovieClip.SYNCHED);
        this.addTimedChild(instance6, 50, 7, {
                "50": {
                    x: -14.2,
                    y: -13.5,
                    sx: 1,
                    sy: 1,
                    r: 0,
                    t: "#fff"
                },
                "51": {
                    x: -17.45,
                    y: -3.257,
                    r: 0.018,
                    t: "#f7f7f7"
                },
                "52": {
                    x: -29.187,
                    y: 29.7,
                    r: 0.093,
                    t: "#dbdbdb"
                },
                "53": {
                    x: -46.958,
                    y: 93.063,
                    sx: 0.999,
                    sy: 0.999,
                    r: 0.241,
                    t: "#a3a3a3"
                },
                "54": {
                    x: -58.212,
                    y: 180.256,
                    r: 0.455,
                    t: "#545454"
                },
                "55": {
                    x: -54.794,
                    y: 250.07,
                    sx: 0.998,
                    sy: 0.998,
                    r: 0.626,
                    t: "#141414"
                },
                "56": {
                    x: -52,
                    y: 271.15,
                    sx: 1,
                    sy: 1,
                    r: 0.68,
                    t: "#000"
                }
            })
            .addTimedChild(instance1, 0, 60, {
                "0": {
                    y: 0,
                    sx: 0.914,
                    sy: 0.087,
                    c: [
                        0,
                        0.6,
                        0,
                        0.06,
                        0,
                        0.24
                    ]
                },
                "1": {
                    sx: 0.919,
                    sy: 0.17,
                    c: [
                        0.08,
                        0.55,
                        0.08,
                        0.06,
                        0.08,
                        0.22
                    ]
                },
                "2": {
                    sx: 0.933,
                    sy: 0.404,
                    c: [
                        0.31,
                        0.42,
                        0.31,
                        0.04,
                        0.31,
                        0.17
                    ]
                },
                "3": {
                    sx: 0.951,
                    sy: 0.722,
                    c: [
                        0.63,
                        0.23,
                        0.63,
                        0.02,
                        0.63,
                        0.09
                    ]
                },
                "4": {
                    sx: 0.968,
                    sy: 0.994,
                    c: [
                        0.89,
                        0.06,
                        0.89,
                        0.01,
                        0.89,
                        0.03
                    ]
                },
                "5": {
                    sx: 0.974,
                    sy: 1.101,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "6": {
                    sx: 0.979,
                    sy: 1.088
                },
                "7": {
                    sx: 0.994,
                    sy: 1.051
                },
                "8": {
                    sx: 1.013,
                    sy: 1.001
                },
                "9": {
                    sx: 1.031,
                    sy: 0.958
                },
                "10": {
                    sx: 1.037,
                    sy: 0.942
                },
                "11": {
                    sx: 1.028,
                    sy: 0.955
                },
                "12": {
                    sx: 1.021,
                    sy: 0.968
                },
                "13": {
                    sx: 1.014,
                    sy: 0.978
                },
                "14": {
                    sx: 1.008,
                    sy: 0.987
                },
                "15": {
                    sx: 1.004,
                    sy: 0.994
                },
                "16": {
                    sx: 1,
                    sy: 1
                },
                "26": {
                    sx: 0.993,
                    sy: 1.013
                },
                "27": {
                    sx: 0.972,
                    sy: 1.048
                },
                "28": {
                    sx: 0.964,
                    sy: 1.064
                },
                "29": {
                    sx: 0.965,
                    sy: 1.062
                },
                "30": {
                    sx: 0.969,
                    sy: 1.054
                },
                "31": {
                    sx: 0.976,
                    sy: 1.042
                },
                "32": {
                    sx: 0.985,
                    sy: 1.026
                },
                "33": {
                    sx: 0.994,
                    sy: 1.011
                },
                "34": {
                    sx: 0.998,
                    sy: 1.003
                },
                "35": {
                    sx: 1,
                    sy: 1
                },
                "48": {
                    y: -0.55,
                    sx: 0.999,
                    sy: 1.001
                },
                "49": {
                    y: -2.6,
                    sx: 0.993,
                    sy: 1.005
                },
                "50": {
                    y: -7.15,
                    sx: 0.98,
                    sy: 1.015
                },
                "51": {
                    y: -12.9,
                    sx: 0.965,
                    sy: 1.027
                },
                "52": {
                    y: -16,
                    sx: 0.956,
                    sy: 1.033
                },
                "53": {
                    y: -16.75,
                    sx: 0.954,
                    sy: 1.035
                },
                "54": {
                    y: -6.056,
                    sx: 0.96,
                    sy: 1.007
                },
                "55": {
                    y: 35.777,
                    sx: 0.984,
                    sy: 0.9
                },
                "56": {
                    y: 128.524,
                    sx: 1.036,
                    sy: 0.663
                },
                "57": {
                    y: 245.84,
                    sx: 1.102,
                    sy: 0.362
                },
                "58": {
                    y: 308.801,
                    sx: 1.137,
                    sy: 0.201
                },
                "59": {
                    y: 324.35,
                    sx: 1.146,
                    sy: 0.161
                }
            })
            .addTimedChild(instance2, 5, 55, {
                "5": {
                    x: -203.45,
                    y: -191.75,
                    sx: 1,
                    sy: 1,
                    r: 0.725,
                    a: 0
                },
                "6": {
                    x: -205.658,
                    y: -190.393,
                    sx: 0.998,
                    sy: 0.998,
                    r: 0.687,
                    a: 0.04
                },
                "7": {
                    x: -212.044,
                    y: -186.119,
                    r: 0.578,
                    a: 0.16
                },
                "8": {
                    x: -220.729,
                    y: -178.337,
                    sx: 0.999,
                    sy: 0.999,
                    r: 0.411,
                    a: 0.36
                },
                "9": {
                    x: -229.253,
                    y: -167.51,
                    r: 0.214,
                    a: 0.58
                },
                "10": {
                    x: -235.181,
                    y: -155.788,
                    sx: 1,
                    sy: 1,
                    r: 0.027,
                    a: 0.79
                },
                "11": {
                    x: -237.894,
                    y: -147.205,
                    r: -0.101,
                    a: 0.95
                },
                "12": {
                    x: -238.75,
                    y: -143.7,
                    r: -0.152,
                    a: 1
                },
                "13": {
                    x: -238.541,
                    y: -144.467,
                    r: -0.141
                },
                "14": {
                    x: -238.179,
                    y: -146.064,
                    r: -0.118
                },
                "15": {
                    x: -237.548,
                    y: -148.729,
                    r: -0.079
                },
                "16": {
                    x: -236.763,
                    y: -151.34,
                    r: -0.04
                },
                "17": {
                    x: -236.063,
                    y: -153.367,
                    r: -0.009
                },
                "18": {
                    x: -235.9,
                    y: -154,
                    r: 0
                },
                "26": {
                    x: -234.154,
                    y: -155.997,
                    sx: 0.993,
                    sy: 1.013
                },
                "27": {
                    x: -229.403,
                    y: -161.376,
                    sx: 0.972,
                    sy: 1.048
                },
                "28": {
                    x: -227.3,
                    y: -163.8,
                    sx: 0.964,
                    sy: 1.064
                },
                "29": {
                    x: -227.588,
                    y: -163.47,
                    sx: 0.965,
                    sy: 1.062
                },
                "30": {
                    x: -228.556,
                    y: -162.365,
                    sx: 0.969,
                    sy: 1.054
                },
                "31": {
                    x: -230.265,
                    y: -160.413,
                    sx: 0.976,
                    sy: 1.042
                },
                "32": {
                    x: -232.44,
                    y: -157.929,
                    sx: 0.985,
                    sy: 1.026
                },
                "33": {
                    x: -234.372,
                    y: -155.722,
                    sx: 0.994,
                    sy: 1.011
                },
                "34": {
                    x: -235.537,
                    y: -154.387,
                    sx: 0.998,
                    sy: 1.003
                },
                "35": {
                    x: -235.9,
                    y: -154,
                    sx: 1,
                    sy: 1
                },
                "48": {
                    x: -235.562,
                    y: -154.669,
                    sx: 0.999,
                    sy: 1.001
                },
                "49": {
                    x: -234.237,
                    y: -157.427,
                    sx: 0.993,
                    sy: 1.005
                },
                "50": {
                    x: -231.3,
                    y: -163.389,
                    sx: 0.98,
                    sy: 1.015
                },
                "51": {
                    x: -227.589,
                    y: -171.038,
                    sx: 0.965,
                    sy: 1.027
                },
                "52": {
                    x: -225.544,
                    y: -175.132,
                    sx: 0.956,
                    sy: 1.033
                },
                "53": {
                    x: -225.1,
                    y: -176.15,
                    sx: 0.954,
                    sy: 1.035
                },
                "54": {
                    x: -226.515,
                    y: -161.234,
                    sx: 0.96,
                    sy: 1.007,
                    a: 0.97
                },
                "55": {
                    x: -232.052,
                    y: -102.908,
                    sx: 0.984,
                    sy: 0.9,
                    a: 0.85
                },
                "56": {
                    x: -244.381,
                    y: 26.455,
                    sx: 1.036,
                    sy: 0.663,
                    a: 0.57
                },
                "57": {
                    x: -259.917,
                    y: 190.071,
                    sx: 1.102,
                    sy: 0.362,
                    a: 0.23
                },
                "58": {
                    x: -268.256,
                    y: 277.882,
                    sx: 1.137,
                    sy: 0.201,
                    a: 0.05
                },
                "59": {
                    x: -270.25,
                    y: 299.55,
                    sx: 1.146,
                    sy: 0.161,
                    a: 0
                }
            })
            .addTimedChild(instance4, 24, 32, {
                "24": {
                    x: -678.8,
                    y: 325.15,
                    sx: 1,
                    sy: 1,
                    r: 0,
                    a: 0,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "25": {
                    x: -627.65,
                    y: 299.15,
                    a: 0.07
                },
                "26": {
                    x: -430.2,
                    y: 198.8,
                    a: 0.36
                },
                "27": {
                    x: -112.15,
                    y: 37.15,
                    a: 0.82
                },
                "28": {
                    x: 14.7,
                    y: -27.3,
                    a: 1
                },
                "29": {
                    x: 9.9,
                    y: -24.65
                },
                "30": {
                    x: 5.05,
                    y: -22
                },
                "31": {
                    x: 0.25,
                    y: -19.35
                },
                "32": {
                    x: -4.55,
                    y: -16.7
                },
                "33": {
                    x: -9.4,
                    y: -14.05
                },
                "34": {
                    x: -14.2,
                    y: -11.4
                },
                "50": {
                    y: -13.5
                },
                "51": {
                    x: -16.641,
                    y: -9.789,
                    r: -0.018,
                    c: [
                        0.95,
                        0,
                        0.95,
                        0,
                        0.95,
                        0
                    ]
                },
                "52": {
                    x: -27.68,
                    y: 2.222,
                    r: -0.092,
                    c: [
                        0.79,
                        0,
                        0.79,
                        0,
                        0.79,
                        0
                    ]
                },
                "53": {
                    x: -53.792,
                    y: 27.926,
                    sx: 0.999,
                    sy: 0.999,
                    r: -0.24,
                    c: [
                        0.46,
                        0,
                        0.46,
                        0,
                        0.46,
                        0
                    ]
                },
                "54": {
                    x: -86.019,
                    y: 59.783,
                    r: -0.393,
                    c: [
                        0.11,
                        0,
                        0.11,
                        0,
                        0.11,
                        0
                    ]
                },
                "55": {
                    x: -97.5,
                    y: 71.1,
                    sx: 1,
                    sy: 1,
                    r: -0.444,
                    c: [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            })
            .addTimedChild(instance5, 25, 25, {
                "25": {
                    sx: 1,
                    sy: 1
                },
                "26": {
                    sx: 0.993,
                    sy: 1.013
                },
                "27": {
                    sx: 0.972,
                    sy: 1.048
                },
                "28": {
                    sx: 0.964,
                    sy: 1.064
                },
                "29": {
                    sx: 0.965,
                    sy: 1.062
                },
                "30": {
                    sx: 0.969,
                    sy: 1.054
                },
                "31": {
                    sx: 0.976,
                    sy: 1.042
                },
                "32": {
                    sx: 0.985,
                    sy: 1.026
                },
                "33": {
                    sx: 0.994,
                    sy: 1.011
                },
                "34": {
                    sx: 0.998,
                    sy: 1.003
                },
                "35": {
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance3, 24, 37, {
                "24": {
                    x: -150.4,
                    y: 62.05,
                    a: 0
                },
                "25": {
                    a: 0.33
                },
                "26": {
                    a: 0.67
                },
                "27": {
                    a: 1
                },
                "50": {
                    a: 0.97
                },
                "51": {
                    a: 0.86
                },
                "52": {
                    a: 0.64
                },
                "53": {
                    a: 0.33
                },
                "54": {
                    a: 0.08
                },
                "55": {
                    a: 0
                }
            });
    });

    var Graphic190 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic191 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic190(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic192 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic193 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic192(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic194 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic195 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic194(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic196 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic197 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic196(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic198 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic199 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic198(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic200 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic201 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic200(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic202 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic203 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic202(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic204 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic205 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic204(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic206 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic207 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic206(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic208 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic209 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic208(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic210 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic211 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic210(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic212 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic213 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic212(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic214 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic215 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic214(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic216 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("heartarrow-line1"))
            .setTransform(-6.65, -6.25, 2.676, 2.676);
        this.addTimedChild(instance1);
    });

    var Graphic217 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Graphic216(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 19, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic218 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance14 = new Graphic217(MovieClip.SYNCHED)
            .setTransform(633.85, -542.55, 0.884, 0.884, 0.932);
        var instance13 = new Graphic215(MovieClip.SYNCHED)
            .setTransform(357.7, 572.4, 0.884, 0.884, 0, 3.833, -0.692);
        var instance12 = new Graphic213(MovieClip.SYNCHED)
            .setTransform(703.85, 71.6, 0.884, 0.884, 0, 4.465, 1.818);
        var instance11 = new Graphic211(MovieClip.SYNCHED)
            .setTransform(576.25, 342.25, 0.884, 0.884, 0, 4.046, 2.237);
        var instance10 = new Graphic209(MovieClip.SYNCHED)
            .setTransform(747.5, -266.4, 0.884, 0.884, 0, -1.351, -1.79);
        var instance9 = new Graphic207(MovieClip.SYNCHED)
            .setTransform(-619.8, -540.4, 0.884, 0.884, 0, 0.932, 2.209);
        var instance8 = new Graphic205(MovieClip.SYNCHED)
            .setTransform(-694.2, 71.6, 0.884, 0.884, 0, 1.818, 1.324);
        var instance7 = new Graphic203(MovieClip.SYNCHED)
            .setTransform(-566.6, 342.25, 0.884, 0.884, 0, 2.237, 0.904);
        var instance6 = new Graphic201(MovieClip.SYNCHED)
            .setTransform(-737.85, -266.4, 0.884, 0.884, -1.351);
        var instance5 = new Graphic199(MovieClip.SYNCHED)
            .setTransform(-351.4, 572.4, 0.884, 0.884, -2.45);
        var instance4 = new Graphic197(MovieClip.SYNCHED)
            .setTransform(-320.4, -679.95, 0.884, 0.884, 0, 0.3, 2.841);
        var instance3 = new Graphic195(MovieClip.SYNCHED)
            .setTransform(328.95, -677.75, 0.884, 0.884, 0.3);
        var instance2 = new Graphic193(MovieClip.SYNCHED)
            .setTransform(3.6, -713.25, 0.884, 0.884, -0.003);
        var instance1 = new Graphic191(MovieClip.SYNCHED)
            .setTransform(-8.25, 656.85, 0.884, 0.884, 0, 3.145, 3.139);
        this.addTimedChild(instance14)
            .addTimedChild(instance13)
            .addTimedChild(instance12)
            .addTimedChild(instance11)
            .addTimedChild(instance10)
            .addTimedChild(instance9)
            .addTimedChild(instance8)
            .addTimedChild(instance7)
            .addTimedChild(instance6)
            .addTimedChild(instance5)
            .addTimedChild(instance4)
            .addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic219 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 10, loop: false });
        var instance1 = new Sprite(fromFrame("HeyJibo1"))
            .setTransform(-478.45, -102);
        this.addTimedChild(instance1);
    });

    var Graphic220 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 64, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-lever1"))
            .setTransform(-24.6, -10.75);
        this.addTimedChild(instance1);
    });

    var Graphic221 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 68, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-slit1"))
            .setTransform(-6.6, -67.6);
        this.addTimedChild(instance1);
    });

    var Graphic222 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 80, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-front1"))
            .setTransform(-163.25, -111.35);
        this.addTimedChild(instance1);
    });

    var Graphic223 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 76, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-back1"))
            .setTransform(-18.3, -111.35);
        this.addTimedChild(instance1);
    });

    var Graphic224 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 74, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-toast1"))
            .setTransform(-116.15, -103.25);
        this.addTimedChild(instance1);
    });

    var Graphic225 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 74, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-toast2"))
            .setTransform(-115.95, -103.2);
        this.addTimedChild(instance1);
    });

    var Graphic226 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 71, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-feet1"))
            .setTransform(-187.95, -24.6);
        this.addTimedChild(instance1);
    });

    var Graphic227 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 83, loop: false });
        var instance5 = new Graphic226(MovieClip.SYNCHED);
        var instance4 = new Graphic225(MovieClip.SYNCHED);
        var instance3 = new Graphic224(MovieClip.SYNCHED);
        var instance2 = new Graphic223(MovieClip.SYNCHED);
        var instance1 = new Graphic222(MovieClip.SYNCHED);
        var instance6 = new Graphic221(MovieClip.SYNCHED);
        var instance7 = new Graphic220(MovieClip.SYNCHED);
        this.addTimedChild(instance5, 9, 71, {
                "9": {
                    x: 1.9,
                    y: 124.4,
                    sx: 1,
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
                "10": {
                    y: 125.85
                },
                "11": {
                    y: 130.45
                },
                "12": {
                    y: 136.9
                },
                "13": {
                    y: 141.8
                },
                "14": {
                    y: 143.4
                },
                "15": {
                    y: 143.25
                },
                "16": {
                    y: 142.75
                },
                "17": {
                    y: 141.95
                },
                "18": {
                    y: 141.1
                },
                "19": {
                    y: 140.55
                },
                "20": {
                    y: 140.4
                },
                "66": {
                    x: 1.899,
                    y: 140.409,
                    sx: 0.999,
                    sy: 1.001
                },
                "67": {
                    x: 1.895,
                    y: 140.293,
                    sx: 0.997,
                    sy: 1.004
                },
                "68": {
                    x: 1.887,
                    y: 140.182,
                    sx: 0.993,
                    sy: 1.009
                },
                "69": {
                    x: 1.925,
                    y: 139.987,
                    sx: 0.987,
                    sy: 1.017
                },
                "70": {
                    x: 1.862,
                    y: 139.752,
                    sx: 0.98,
                    sy: 1.025
                },
                "71": {
                    x: 1.852,
                    y: 139.623,
                    sx: 0.975,
                    sy: 1.032
                },
                "72": {
                    x: 1.847,
                    y: 139.566,
                    sx: 0.972,
                    sy: 1.035
                },
                "73": {
                    x: 1.85,
                    y: 139.5,
                    sx: 0.971,
                    sy: 1.036
                },
                "74": {
                    x: 1.857,
                    y: 140.191,
                    sx: 0.975,
                    sy: 1.011,
                    c: [
                        0.97,
                        0.02,
                        0.97,
                        0.02,
                        0.97,
                        0.02
                    ]
                },
                "75": {
                    x: 1.877,
                    y: 142.364,
                    sx: 0.985,
                    sy: 0.937,
                    c: [
                        0.89,
                        0.07,
                        0.89,
                        0.08,
                        0.89,
                        0.08
                    ]
                },
                "76": {
                    x: 1.91,
                    y: 145.872,
                    sx: 1.002,
                    sy: 0.812,
                    c: [
                        0.75,
                        0.16,
                        0.75,
                        0.17,
                        0.75,
                        0.18
                    ]
                },
                "77": {
                    x: 1.956,
                    y: 150.807,
                    sx: 1.027,
                    sy: 0.637,
                    c: [
                        0.55,
                        0.29,
                        0.55,
                        0.31,
                        0.55,
                        0.31
                    ]
                },
                "78": {
                    x: 2.016,
                    y: 157.127,
                    sx: 1.058,
                    sy: 0.413,
                    c: [
                        0.3,
                        0.46,
                        0.3,
                        0.48,
                        0.3,
                        0.49
                    ]
                },
                "79": {
                    x: 2.05,
                    y: 164.95,
                    sx: 1.096,
                    sy: 0.138,
                    c: [
                        0,
                        0.66,
                        0,
                        0.69,
                        0,
                        0.71
                    ]
                }
            })
            .addTimedChild(instance4, 9, 74, {
                "9": {
                    x: 46.4,
                    y: 13.55,
                    sx: 1,
                    sy: 1,
                    kx: 0,
                    ky: 0,
                    r: 0,
                    a: 1
                },
                "10": {
                    y: 11.75
                },
                "11": {
                    y: 5.85
                },
                "12": {
                    y: -4.6
                },
                "13": {
                    y: -17.4
                },
                "14": {
                    y: -27.2
                },
                "15": {
                    y: -30.45
                },
                "16": {
                    y: -30.1
                },
                "17": {
                    y: -28.85
                },
                "18": {
                    y: -26.75
                },
                "19": {
                    y: -24.1
                },
                "20": {
                    y: -22.1
                },
                "21": {
                    y: -21.45
                },
                "27": {
                    y: -20.85
                },
                "28": {
                    y: -19
                },
                "29": {
                    y: -16.1
                },
                "30": {
                    y: -13.1
                },
                "31": {
                    y: -11.1
                },
                "32": {
                    y: -10.45
                },
                "33": {
                    y: -28.55
                },
                "34": {
                    y: -85.45
                },
                "35": {
                    y: -164.9
                },
                "36": {
                    y: -225.6
                },
                "37": {
                    y: -245.45
                },
                "38": {
                    y: -250.95
                },
                "39": {
                    y: -255.5
                },
                "40": {
                    y: -258.95
                },
                "41": {
                    y: -260.45
                },
                "42": {
                    y: -252.55
                },
                "43": {
                    y: -228.75
                },
                "44": {
                    y: -189.15
                },
                "45": {
                    y: -133.75
                },
                "46": {
                    y: -62.45
                },
                "47": {
                    y: -63.55
                },
                "48": {
                    y: -66.95
                },
                "49": {
                    y: -72.65
                },
                "50": {
                    y: -79.5
                },
                "51": {
                    y: -85.55
                },
                "52": {
                    y: -89.25
                },
                "53": {
                    y: -90.45
                },
                "66": {
                    y: -89.05
                },
                "67": {
                    y: -84.6
                },
                "68": {
                    y: -82.45
                },
                "69": {
                    x: 46.381,
                    y: -88.805,
                    r: -0.106
                },
                "70": {
                    x: 46.414,
                    y: -110.897,
                    sx: 0.999,
                    sy: 0.999,
                    r: -0.485
                },
                "71": {
                    x: 46.387,
                    y: -151.467,
                    r: -1.181
                },
                "72": {
                    x: 46.427,
                    y: -199.992,
                    r: -2.008
                },
                "73": {
                    x: 46.359,
                    y: -233.421,
                    sx: 0.998,
                    sy: 0.998,
                    r: -2.581
                },
                "74": {
                    x: 46.4,
                    y: -243.55,
                    sx: 1,
                    sy: 1,
                    r: -2.753
                },
                "75": {
                    x: 46.347,
                    y: -235.074,
                    sx: 0.999,
                    sy: 0.999,
                    r: -2.791,
                    a: 0.98
                },
                "76": {
                    x: 46.361,
                    y: -209.817,
                    r: -2.897,
                    a: 0.94
                },
                "77": {
                    x: 46.369,
                    y: -167.59,
                    sx: 1,
                    sy: 1,
                    r: -3.076,
                    a: 0.86
                },
                "78": {
                    x: 46.355,
                    y: -108.507,
                    sx: 0.999,
                    sy: 0.999,
                    kx: 3.321,
                    ky: 2.962,
                    r: 0,
                    a: 0.75
                },
                "79": {
                    x: 46.295,
                    y: -32.539,
                    sx: 0.998,
                    sy: 0.998,
                    kx: 3.645,
                    ky: 2.639,
                    a: 0.61
                },
                "80": {
                    x: 46.319,
                    y: 60.275,
                    sx: 0.997,
                    sy: 0.997,
                    kx: 4.038,
                    ky: 2.245,
                    a: 0.44
                },
                "81": {
                    x: 46.299,
                    y: 170.034,
                    sx: 0.998,
                    sy: 0.998,
                    kx: 4.502,
                    ky: 1.781,
                    a: 0.23
                },
                "82": {
                    x: 46.3,
                    y: 296.6,
                    kx: 0,
                    ky: 0,
                    r: 1.247,
                    a: 0
                }
            })
            .addTimedChild(instance3, 9, 74, {
                "9": {
                    x: -33.6,
                    y: 13.55,
                    sx: 1,
                    sy: 1,
                    kx: 0,
                    ky: 0,
                    r: 0,
                    a: 1
                },
                "10": {
                    y: 11.75
                },
                "11": {
                    y: 5.85
                },
                "12": {
                    y: -4.6
                },
                "13": {
                    y: -17.4
                },
                "14": {
                    y: -27.2
                },
                "15": {
                    y: -30.45
                },
                "16": {
                    y: -30.1
                },
                "17": {
                    y: -28.85
                },
                "18": {
                    y: -26.75
                },
                "19": {
                    y: -24.1
                },
                "20": {
                    y: -22.1
                },
                "21": {
                    y: -21.45
                },
                "27": {
                    y: -20.85
                },
                "28": {
                    y: -19
                },
                "29": {
                    y: -16.1
                },
                "30": {
                    y: -13.1
                },
                "31": {
                    y: -11.1
                },
                "32": {
                    y: -10.45
                },
                "33": {
                    y: -34.8
                },
                "34": {
                    y: -107.25
                },
                "35": {
                    y: -182.85
                },
                "36": {
                    y: -209.45
                },
                "37": {
                    y: -217.1
                },
                "38": {
                    y: -223.5
                },
                "39": {
                    y: -228.3
                },
                "40": {
                    y: -230.45
                },
                "41": {
                    y: -223.8
                },
                "42": {
                    y: -203.9
                },
                "43": {
                    y: -170.7
                },
                "44": {
                    y: -124.2
                },
                "45": {
                    y: -64.45
                },
                "46": {
                    y: -65.45
                },
                "47": {
                    y: -68.65
                },
                "48": {
                    y: -73.95
                },
                "49": {
                    y: -80.3
                },
                "50": {
                    y: -85.9
                },
                "51": {
                    y: -89.35
                },
                "52": {
                    y: -90.45
                },
                "66": {
                    y: -89.7
                },
                "67": {
                    y: -87.05
                },
                "68": {
                    y: -83.65
                },
                "69": {
                    y: -82.45
                },
                "70": {
                    x: -33.566,
                    y: -87.226,
                    r: 0.079
                },
                "71": {
                    x: -33.605,
                    y: -103.761,
                    sx: 0.999,
                    sy: 0.999,
                    r: 0.363
                },
                "72": {
                    x: -33.704,
                    y: -134.167,
                    sx: 0.998,
                    sy: 0.998,
                    r: 0.88
                },
                "73": {
                    x: -33.772,
                    y: -170.725,
                    sx: 1,
                    sy: 1,
                    r: 1.501
                },
                "74": {
                    x: -33.81,
                    y: -195.844,
                    sx: 0.999,
                    sy: 0.999,
                    kx: 4.358,
                    ky: 1.925,
                    r: 0
                },
                "75": {
                    x: -33.85,
                    y: -203.4,
                    sx: 1,
                    sy: 1,
                    kx: 4.227,
                    ky: 2.056
                },
                "76": {
                    x: -33.845,
                    y: -193.847,
                    sx: 0.999,
                    sy: 0.999,
                    kx: 4.183,
                    ky: 2.1,
                    a: 0.98
                },
                "77": {
                    x: -33.837,
                    y: -165.281,
                    sx: 0.998,
                    sy: 0.998,
                    kx: 4.052,
                    ky: 2.232,
                    a: 0.92
                },
                "78": {
                    x: -33.852,
                    y: -117.55,
                    kx: 3.829,
                    ky: 2.455,
                    a: 0.82
                },
                "79": {
                    x: -33.82,
                    y: -50.786,
                    kx: 3.518,
                    ky: 2.765,
                    a: 0.67
                },
                "80": {
                    x: -33.808,
                    y: 35.017,
                    sx: 0.999,
                    sy: 0.999,
                    kx: 0,
                    ky: 0,
                    r: -3.124,
                    a: 0.49
                },
                "81": {
                    x: -33.77,
                    y: 139.975,
                    sx: 0.997,
                    sy: 0.997,
                    r: -2.638,
                    a: 0.27
                },
                "82": {
                    x: -33.8,
                    y: 264,
                    sx: 0.998,
                    sy: 0.998,
                    r: -2.061,
                    a: 0
                }
            })
            .addTimedChild(instance2, 4, 76, {
                "4": {
                    x: -0.6,
                    y: 28,
                    sx: 1,
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
                "5": {
                    x: 2.55
                },
                "6": {
                    x: 12.5
                },
                "7": {
                    x: 26.35
                },
                "8": {
                    x: 36.95
                },
                "9": {
                    x: 40.4
                },
                "10": {
                    x: 39.8
                },
                "11": {
                    x: 37.95
                },
                "12": {
                    x: 36.05
                },
                "13": {
                    x: 35.4
                },
                "14": {
                    y: 28.1
                },
                "15": {
                    y: 28.3
                },
                "16": {
                    y: 28.65
                },
                "17": {
                    y: 28.9
                },
                "18": {
                    y: 29
                },
                "66": {
                    x: 35.378,
                    y: 28.923,
                    sx: 0.999,
                    sy: 1.001
                },
                "67": {
                    x: 35.301,
                    y: 28.502,
                    sx: 0.997,
                    sy: 1.004
                },
                "68": {
                    x: 35.154,
                    y: 27.804,
                    sx: 0.993,
                    sy: 1.009
                },
                "69": {
                    x: 34.932,
                    y: 26.733,
                    sx: 0.987,
                    sy: 1.017
                },
                "70": {
                    x: 34.689,
                    y: 25.534,
                    sx: 0.98,
                    sy: 1.025
                },
                "71": {
                    x: 34.504,
                    y: 24.674,
                    sx: 0.975,
                    sy: 1.032
                },
                "72": {
                    x: 34.456,
                    y: 24.176,
                    sx: 0.972,
                    sy: 1.035
                },
                "73": {
                    x: 34.4,
                    y: 24.05,
                    sx: 0.971,
                    sy: 1.036
                },
                "74": {
                    x: 34.523,
                    y: 27.921,
                    sx: 0.975,
                    sy: 1.011,
                    c: [
                        0.97,
                        0.02,
                        0.97,
                        0.02,
                        0.97,
                        0.02
                    ]
                },
                "75": {
                    x: 34.943,
                    y: 39.334,
                    sx: 0.985,
                    sy: 0.937,
                    c: [
                        0.89,
                        0.07,
                        0.89,
                        0.08,
                        0.89,
                        0.08
                    ]
                },
                "76": {
                    x: 35.509,
                    y: 58.539,
                    sx: 1.002,
                    sy: 0.812,
                    c: [
                        0.75,
                        0.16,
                        0.75,
                        0.17,
                        0.75,
                        0.18
                    ]
                },
                "77": {
                    x: 36.37,
                    y: 85.335,
                    sx: 1.027,
                    sy: 0.637,
                    c: [
                        0.55,
                        0.29,
                        0.55,
                        0.31,
                        0.55,
                        0.31
                    ]
                },
                "78": {
                    x: 37.479,
                    y: 119.823,
                    sx: 1.058,
                    sy: 0.413,
                    c: [
                        0.3,
                        0.46,
                        0.3,
                        0.48,
                        0.3,
                        0.49
                    ]
                },
                "79": {
                    x: 38.8,
                    y: 161.95,
                    sx: 1.096,
                    sy: 0.138,
                    c: [
                        0,
                        0.66,
                        0,
                        0.69,
                        0,
                        0.71
                    ]
                }
            })
            .addTimedChild(instance1, 0, 80, {
                "0": {
                    x: 8.5,
                    y: 28,
                    sx: 1,
                    sy: 1,
                    r: -0.156,
                    c: [
                        0,
                        0.66,
                        0,
                        0.69,
                        0,
                        0.71
                    ]
                },
                "1": {
                    x: 8.454,
                    y: 28.01,
                    r: -0.087,
                    c: [
                        0.44,
                        0.37,
                        0.44,
                        0.39,
                        0.44,
                        0.4
                    ]
                },
                "2": {
                    x: 8.479,
                    y: 28.014,
                    r: -0.036,
                    c: [
                        0.75,
                        0.16,
                        0.75,
                        0.17,
                        0.75,
                        0.18
                    ]
                },
                "3": {
                    x: 8.501,
                    y: 28.043,
                    r: -0.009,
                    c: [
                        0.94,
                        0.04,
                        0.94,
                        0.04,
                        0.94,
                        0.04
                    ]
                },
                "4": {
                    x: 8.5,
                    y: 28,
                    r: 0,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "5": {
                    x: 3.4
                },
                "6": {
                    x: -12.55
                },
                "7": {
                    x: -34.9
                },
                "8": {
                    x: -51.9
                },
                "9": {
                    x: -57.5
                },
                "10": {
                    x: -55.9
                },
                "11": {
                    x: -51.2
                },
                "12": {
                    x: -46.25
                },
                "13": {
                    x: -44.5
                },
                "14": {
                    y: 28.1
                },
                "15": {
                    y: 28.3
                },
                "16": {
                    y: 28.65
                },
                "17": {
                    y: 28.9
                },
                "18": {
                    y: 29
                },
                "66": {
                    x: -44.472,
                    y: 28.923,
                    sx: 0.999,
                    sy: 1.001
                },
                "67": {
                    x: -44.326,
                    y: 28.502,
                    sx: 0.997,
                    sy: 1.004
                },
                "68": {
                    x: -44.19,
                    y: 27.804,
                    sx: 0.993,
                    sy: 1.009
                },
                "69": {
                    x: -43.912,
                    y: 26.733,
                    sx: 0.987,
                    sy: 1.017
                },
                "70": {
                    x: -43.606,
                    y: 25.534,
                    sx: 0.98,
                    sy: 1.025
                },
                "71": {
                    x: -43.374,
                    y: 24.674,
                    sx: 0.975,
                    sy: 1.032
                },
                "72": {
                    x: -43.25,
                    y: 24.176,
                    sx: 0.972,
                    sy: 1.035
                },
                "73": {
                    x: -43.2,
                    y: 24.05,
                    sx: 0.971,
                    sy: 1.036
                },
                "74": {
                    x: -43.354,
                    y: 27.921,
                    sx: 0.975,
                    sy: 1.011,
                    c: [
                        0.97,
                        0.02,
                        0.97,
                        0.02,
                        0.97,
                        0.02
                    ]
                },
                "75": {
                    x: -43.769,
                    y: 39.334,
                    sx: 0.985,
                    sy: 0.937,
                    c: [
                        0.89,
                        0.07,
                        0.89,
                        0.08,
                        0.89,
                        0.08
                    ]
                },
                "76": {
                    x: -44.592,
                    y: 58.539,
                    sx: 1.002,
                    sy: 0.812,
                    c: [
                        0.75,
                        0.16,
                        0.75,
                        0.17,
                        0.75,
                        0.18
                    ]
                },
                "77": {
                    x: -45.675,
                    y: 85.335,
                    sx: 1.027,
                    sy: 0.637,
                    c: [
                        0.55,
                        0.29,
                        0.55,
                        0.31,
                        0.55,
                        0.31
                    ]
                },
                "78": {
                    x: -47.067,
                    y: 119.823,
                    sx: 1.058,
                    sy: 0.413,
                    c: [
                        0.3,
                        0.46,
                        0.3,
                        0.48,
                        0.3,
                        0.49
                    ]
                },
                "79": {
                    x: -48.8,
                    y: 161.95,
                    sx: 1.096,
                    sy: 0.138,
                    c: [
                        0,
                        0.66,
                        0,
                        0.69,
                        0,
                        0.71
                    ]
                }
            })
            .addTimedChild(instance6, 12, 68, {
                "12": {
                    x: 165.4,
                    y: 29,
                    sx: 1,
                    sy: 1,
                    a: 0,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "13": {
                    a: 0.11
                },
                "14": {
                    a: 0.22
                },
                "15": {
                    a: 0.33
                },
                "16": {
                    a: 0.45
                },
                "17": {
                    a: 0.55
                },
                "18": {
                    a: 0.67
                },
                "19": {
                    a: 0.78
                },
                "20": {
                    a: 0.89
                },
                "21": {
                    a: 1
                },
                "66": {
                    x: 165.297,
                    y: 28.923,
                    sx: 0.999,
                    sy: 1.001
                },
                "67": {
                    x: 164.938,
                    y: 28.502,
                    sx: 0.997,
                    sy: 1.004
                },
                "68": {
                    x: 164.249,
                    y: 27.804,
                    sx: 0.993,
                    sy: 1.009
                },
                "69": {
                    x: 163.214,
                    y: 26.733,
                    sx: 0.987,
                    sy: 1.017
                },
                "70": {
                    x: 162.026,
                    y: 25.534,
                    sx: 0.98,
                    sy: 1.025
                },
                "71": {
                    x: 161.216,
                    y: 24.674,
                    sx: 0.975,
                    sy: 1.032
                },
                "72": {
                    x: 160.754,
                    y: 24.176,
                    sx: 0.972,
                    sy: 1.035
                },
                "73": {
                    x: 160.6,
                    y: 24.05,
                    sx: 0.971,
                    sy: 1.036
                },
                "74": {
                    x: 161.173,
                    y: 27.921,
                    sx: 0.975,
                    sy: 1.011,
                    c: [
                        0.97,
                        0.02,
                        0.97,
                        0.02,
                        0.97,
                        0.02
                    ]
                },
                "75": {
                    x: 162.901,
                    y: 39.334,
                    sx: 0.985,
                    sy: 0.937,
                    c: [
                        0.89,
                        0.07,
                        0.89,
                        0.08,
                        0.89,
                        0.08
                    ]
                },
                "76": {
                    x: 165.776,
                    y: 58.539,
                    sx: 1.002,
                    sy: 0.812,
                    c: [
                        0.75,
                        0.16,
                        0.75,
                        0.17,
                        0.75,
                        0.18
                    ]
                },
                "77": {
                    x: 169.799,
                    y: 85.335,
                    sx: 1.027,
                    sy: 0.637,
                    c: [
                        0.55,
                        0.29,
                        0.55,
                        0.31,
                        0.55,
                        0.31
                    ]
                },
                "78": {
                    x: 174.975,
                    y: 119.823,
                    sx: 1.058,
                    sy: 0.413,
                    c: [
                        0.3,
                        0.46,
                        0.3,
                        0.48,
                        0.3,
                        0.49
                    ]
                },
                "79": {
                    x: 181.35,
                    y: 161.95,
                    sx: 1.096,
                    sy: 0.138,
                    c: [
                        0,
                        0.66,
                        0,
                        0.69,
                        0,
                        0.71
                    ]
                }
            })
            .addTimedChild(instance7, 16, 64, {
                "16": {
                    x: 166.75,
                    y: 79.2,
                    sx: 0.27,
                    sy: 0.27,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "17": {
                    x: 166.765,
                    y: 79.217,
                    sx: 0.335,
                    sy: 0.335
                },
                "18": {
                    x: 166.753,
                    y: 79.169,
                    sx: 0.542,
                    sy: 0.542
                },
                "19": {
                    x: 166.75,
                    y: 79.184,
                    sx: 0.83,
                    sy: 0.83
                },
                "20": {
                    x: 166.775,
                    y: 79.168,
                    sx: 1.05,
                    sy: 1.05
                },
                "21": {
                    x: 166.75,
                    y: 79.2,
                    sx: 1.122,
                    sy: 1.122
                },
                "22": {
                    x: 166.734,
                    y: 79.197,
                    sx: 1.107,
                    sy: 1.107
                },
                "23": {
                    x: 166.749,
                    y: 79.22,
                    sx: 1.063,
                    sy: 1.063
                },
                "24": {
                    x: 166.776,
                    y: 79.206,
                    sx: 1.016,
                    sy: 1.016
                },
                "25": {
                    x: 166.75,
                    y: 79.2,
                    sx: 1,
                    sy: 1
                },
                "26": {
                    y: 79.7
                },
                "27": {
                    y: 81.2
                },
                "28": {
                    y: 83.6
                },
                "29": {
                    y: 86.05
                },
                "30": {
                    y: 87.7
                },
                "31": {
                    y: 88.2
                },
                "32": {
                    y: 78.7
                },
                "33": {
                    y: 48.95
                },
                "34": {
                    y: 7.35
                },
                "35": {
                    y: -24.4
                },
                "36": {
                    y: -34.8
                },
                "37": {
                    y: -33.8
                },
                "38": {
                    y: -30.6
                },
                "39": {
                    y: -25.55
                },
                "40": {
                    y: -20.35
                },
                "41": {
                    y: -16.9
                },
                "42": {
                    y: -15.8
                },
                "66": {
                    x: 166.646,
                    y: -15.962,
                    sx: 0.999,
                    sy: 1.001
                },
                "67": {
                    x: 166.284,
                    y: -16.455,
                    sx: 0.997,
                    sy: 1.004
                },
                "68": {
                    x: 165.59,
                    y: -17.389,
                    sx: 0.993,
                    sy: 1.009
                },
                "69": {
                    x: 164.547,
                    y: -18.813,
                    sx: 0.987,
                    sy: 1.017
                },
                "70": {
                    x: 163.399,
                    y: -20.35,
                    sx: 0.98,
                    sy: 1.025
                },
                "71": {
                    x: 162.531,
                    y: -21.553,
                    sx: 0.975,
                    sy: 1.032
                },
                "72": {
                    x: 162.116,
                    y: -22.159,
                    sx: 0.972,
                    sy: 1.035
                },
                "73": {
                    x: 161.95,
                    y: -22.35,
                    sx: 0.971,
                    sy: 1.036
                },
                "74": {
                    x: 162.578,
                    y: -17.412,
                    sx: 0.975,
                    sy: 1.011,
                    c: [
                        0.97,
                        0.02,
                        0.97,
                        0.02,
                        0.97,
                        0.02
                    ]
                },
                "75": {
                    x: 164.27,
                    y: -2.547,
                    sx: 0.985,
                    sy: 0.937,
                    c: [
                        0.89,
                        0.07,
                        0.89,
                        0.08,
                        0.89,
                        0.08
                    ]
                },
                "76": {
                    x: 167.169,
                    y: 22.193,
                    sx: 1.002,
                    sy: 0.812,
                    c: [
                        0.75,
                        0.16,
                        0.75,
                        0.17,
                        0.75,
                        0.18
                    ]
                },
                "77": {
                    x: 171.227,
                    y: 56.86,
                    sx: 1.027,
                    sy: 0.637,
                    c: [
                        0.55,
                        0.29,
                        0.55,
                        0.31,
                        0.55,
                        0.31
                    ]
                },
                "78": {
                    x: 176.446,
                    y: 101.354,
                    sx: 1.058,
                    sy: 0.413,
                    c: [
                        0.3,
                        0.46,
                        0.3,
                        0.48,
                        0.3,
                        0.49
                    ]
                },
                "79": {
                    x: 182.8,
                    y: 155.8,
                    sx: 1.096,
                    sy: 0.138,
                    c: [
                        0,
                        0.66,
                        0,
                        0.69,
                        0,
                        0.71
                    ]
                }
            });
    });

    var Graphic228 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-line1"))
            .setTransform(-3.45, -4, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic229 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Graphic228(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 52, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic230 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-line1"))
            .setTransform(-3.45, -4, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic231 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Graphic230(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 52, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic232 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-line1"))
            .setTransform(-3.45, -4, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic233 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Graphic232(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 52, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic234 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-line1"))
            .setTransform(-3.45, -4, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic235 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Graphic234(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 52, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic236 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-line1"))
            .setTransform(-3.45, -4, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic237 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Graphic236(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 52, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic238 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-line1"))
            .setTransform(-3.45, -4, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic239 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Graphic238(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 52, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic240 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-line1"))
            .setTransform(-3.45, -4, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic241 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Graphic240(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 52, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic242 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Sprite(fromFrame("toaster-line1"))
            .setTransform(-3.45, -4, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic243 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 52, loop: false });
        var instance1 = new Graphic242(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 52, {
            "0": {
                y: 161.85,
                sy: 1.852,
                a: 1
            },
            "1": {
                y: 156.459,
                sy: 1.816
            },
            "2": {
                y: 140.404,
                sy: 1.707
            },
            "3": {
                y: 114.983,
                sy: 1.535
            },
            "4": {
                y: 83.631,
                sy: 1.323
            },
            "5": {
                y: 51.498,
                sy: 1.105
            },
            "6": {
                y: 24.145,
                sy: 0.919
            },
            "7": {
                y: 5.803,
                sy: 0.795
            },
            "8": {
                y: -1.25,
                sy: 0.747
            },
            "9": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "10": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "11": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "12": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "13": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "14": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "15": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "16": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "17": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic244 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 10, loop: false });
        var instance1 = new Sprite(fromFrame("HeyJibo1"))
            .setTransform(-478.45, -102);
        this.addTimedChild(instance1);
    });

    var Graphic245 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 13, loop: false });
        var instance1 = new Sprite(fromFrame("checkmark-highlight1"))
            .setTransform(-300.6, -181.8);
        this.addTimedChild(instance1);
    });

    var Graphic246 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("checkmark-small1"))
            .setTransform(-139.9, -40);
        this.addTimedChild(instance1);
    });

    var Graphic247 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 20, loop: false });
        var instance1 = new Sprite(fromFrame("checkmark-big1"))
            .setTransform(-317.35, -54.15);
        this.addTimedChild(instance1);
    });

    var Graphic248 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance2 = new Graphic247(MovieClip.SYNCHED);
        var instance1 = new Graphic246(MovieClip.SYNCHED);
        var instance3 = new Graphic245(MovieClip.SYNCHED);
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
                    x: -45.214,
                    y: 136.715,
                    sx: 0.304,
                    sy: 0.929,
                    c: [
                        0.2,
                        0.25,
                        0.2,
                        0.5,
                        0.2,
                        0.14
                    ]
                },
                "5": {
                    x: 17.085,
                    y: 73.927,
                    sx: 0.605,
                    sy: 0.959,
                    c: [
                        0.53,
                        0.15,
                        0.53,
                        0.29,
                        0.53,
                        0.08
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
                    x: 104.251,
                    y: -13.754,
                    sx: 1.026
                },
                "8": {
                    x: 102.106,
                    y: -11.609,
                    sx: 1.017
                },
                "9": {
                    x: 98.52,
                    y: -8.023,
                    sx: 1.001
                },
                "10": {
                    x: 95.824,
                    y: -5.327,
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
                    x: -247.131,
                    y: 44.746,
                    sx: 0.32,
                    sy: 0.719,
                    c: [
                        0.16,
                        0.4,
                        0.16,
                        0.71,
                        0.16,
                        0.19
                    ]
                },
                "2": {
                    x: -207.872,
                    y: 84.073,
                    sx: 0.79,
                    sy: 0.913,
                    c: [
                        0.74,
                        0.12,
                        0.74,
                        0.22,
                        0.74,
                        0.06
                    ]
                },
                "3": {
                    x: -190.25,
                    y: 101.7,
                    sx: 1,
                    sy: 1,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                }
            })
            .addTimedChild(instance3, 10, 13, {
                "10": {
                    y: -43.55,
                    a: 0
                },
                "11": {
                    a: 0.02
                },
                "12": {
                    a: 0.09
                },
                "13": {
                    a: 1
                }
            });
    });

    lib.enrollment = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 693,
            framerate: 30,
            labels: {
                "NAME CORRECT?": 0,
                NAMECONFIRMED: 49,
                "WRONG NAME CORRECTED CONFIRM": 99,
                "playAudio-ready_ssa-01": 159,
                hey_jibo: 159,
                hey_jibo_stop: 173,
                hey_jibo_fail: 174,
                hey_jibo_fail_stop: 184,
                "playAudio-correct_ssa-05": 185,
                emoji_party: 185,
                "playAudio-correct_ssa-06": 209,
                emoji_party_stop: 258,
                emoji_rainbow: 259,
                "playAudio-correct_ssa-08": 270,
                emoji_rainbow_stop: 319,
                emoji_star: 320,
                "playAudio-correct_ssa-09": 332,
                emoji_star_stop: 382,
                emoji_sunglasses: 383,
                "playAudio-correct_ssa-10": 391,
                emoji_sunglasses_stop: 452,
                emoji_thumbsup: 453,
                "playAudio-correct_ssa-11": 464,
                emoji_thumbsup_stop: 502,
                emoji_heartArrow: 503,
                "playAudio-correct_ssa-12": 672,
                emoji_heartArrow_stop: 569,
                emoji_toaster: 570,
                emoji_toaster_stop: 659,
                emoji_check: 660,
                emoji_check_stop: 692
            }
        });
        var instance1 = new Graphic1(MovieClip.SYNCHED);
        var instance2 = new Graphic2(MovieClip.SYNCHED);
        var instance13 = new Graphic93(MovieClip.SYNCHED);
        var instance12 = new Graphic91(MovieClip.SYNCHED);
        var instance11 = new Graphic89(MovieClip.SYNCHED);
        var instance10 = new Graphic87(MovieClip.SYNCHED);
        var instance9 = new Graphic85(MovieClip.SYNCHED);
        var instance15 = new Graphic97(MovieClip.SYNCHED);
        var instance14 = new Graphic95(MovieClip.SYNCHED);
        var instance7 = new Graphic83(MovieClip.SYNCHED);
        var instance5 = new Graphic3(MovieClip.SYNCHED);
        var instance17 = new Graphic103(MovieClip.SYNCHED);
        var instance16 = new Graphic98(MovieClip.SYNCHED);
        var instance27 = new Graphic121(MovieClip.SYNCHED);
        var instance26 = new Graphic119(MovieClip.SYNCHED);
        var instance25 = new Graphic117(MovieClip.SYNCHED);
        var instance24 = new Graphic115(MovieClip.SYNCHED);
        var instance23 = new Graphic113(MovieClip.SYNCHED);
        var instance22 = new Graphic111(MovieClip.SYNCHED);
        var instance21 = new Graphic109(MovieClip.SYNCHED);
        var instance20 = new Graphic107(MovieClip.SYNCHED);
        var instance19 = new Graphic105(MovieClip.SYNCHED);
        var instance29 = new Graphic125(MovieClip.SYNCHED);
        var instance28 = new Graphic123(MovieClip.SYNCHED);
        var instance31 = new Graphic141(MovieClip.SYNCHED);
        var instance30 = new Graphic126(MovieClip.SYNCHED);
        var instance32 = new Graphic142(MovieClip.SYNCHED);
        var instance34 = new Graphic144(MovieClip.SYNCHED);
        var instance36 = new Graphic153(MovieClip.SYNCHED);
        var instance35 = new Graphic145(MovieClip.SYNCHED);
        var instance40 = new Graphic181(MovieClip.SYNCHED);
        var instance39 = new Graphic156(MovieClip.SYNCHED);
        var instance38 = new Graphic154(MovieClip.SYNCHED);
        var instance45 = new Graphic218(MovieClip.SYNCHED);
        var instance43 = new Graphic189(MovieClip.SYNCHED);
        var instance42 = new Graphic182(MovieClip.SYNCHED);
        var instance55 = new Graphic243(MovieClip.SYNCHED);
        var instance54 = new Graphic241(MovieClip.SYNCHED);
        var instance53 = new Graphic239(MovieClip.SYNCHED);
        var instance52 = new Graphic237(MovieClip.SYNCHED);
        var instance51 = new Graphic235(MovieClip.SYNCHED);
        var instance50 = new Graphic233(MovieClip.SYNCHED);
        var instance49 = new Graphic231(MovieClip.SYNCHED);
        var instance48 = new Graphic229(MovieClip.SYNCHED);
        var instance47 = new Graphic227(MovieClip.SYNCHED);
        var instance46 = new Graphic219(MovieClip.SYNCHED);
        var instance58 = new Graphic248(MovieClip.SYNCHED);
        var instance57 = new Graphic244(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 99, {
                "0": {
                    x: 640.45,
                    y: 359.95,
                    a: 0
                },
                "1": {
                    a: 0.08
                },
                "2": {
                    a: 0.16
                },
                "3": {
                    a: 0.23
                },
                "4": {
                    a: 0.3
                },
                "5": {
                    a: 0.38
                },
                "6": {
                    a: 0.44
                },
                "7": {
                    a: 0.5
                },
                "8": {
                    a: 0.55
                },
                "9": {
                    a: 0.61
                },
                "10": {
                    a: 0.66
                },
                "11": {
                    a: 0.71
                },
                "12": {
                    a: 0.75
                },
                "13": {
                    a: 0.79
                },
                "14": {
                    a: 0.83
                },
                "15": {
                    a: 0.86
                },
                "16": {
                    a: 0.89
                },
                "17": {
                    a: 0.91
                },
                "18": {
                    a: 0.94
                },
                "19": {
                    a: 0.96
                },
                "20": {
                    a: 0.97
                },
                "21": {
                    a: 0.98
                },
                "22": {
                    a: 0.99
                },
                "23": {
                    a: 1
                },
                "50": {
                    a: 0.92
                },
                "51": {
                    a: 0.85
                },
                "52": {
                    a: 0.77
                },
                "53": {
                    a: 0.71
                },
                "54": {
                    a: 0.64
                },
                "55": {
                    a: 0.58
                },
                "56": {
                    a: 0.52
                },
                "57": {
                    a: 0.46
                },
                "58": {
                    a: 0.41
                },
                "59": {
                    a: 0.36
                },
                "60": {
                    a: 0.31
                },
                "61": {
                    a: 0.27
                },
                "62": {
                    a: 0.23
                },
                "63": {
                    a: 0.2
                },
                "64": {
                    a: 0.16
                },
                "65": {
                    a: 0.13
                },
                "66": {
                    a: 0.1
                },
                "67": {
                    a: 0.08
                },
                "68": {
                    a: 0.06
                },
                "69": {
                    a: 0.04
                },
                "70": {
                    a: 0.03
                },
                "71": {
                    a: 0.02
                },
                "72": {
                    a: 0.01
                },
                "73": {
                    a: 0
                }
            })
            .addTimedChild(instance2, 99, 60, {
                "99": {
                    x: 640.45,
                    y: 359.95,
                    a: 1
                },
                "134": {
                    a: 0.96
                },
                "135": {
                    a: 0.92
                },
                "136": {
                    a: 0.88
                },
                "137": {
                    a: 0.84
                },
                "138": {
                    a: 0.8
                },
                "139": {
                    a: 0.76
                },
                "140": {
                    a: 0.72
                },
                "141": {
                    a: 0.68
                },
                "142": {
                    a: 0.64
                },
                "143": {
                    a: 0.6
                },
                "144": {
                    a: 0.56
                },
                "145": {
                    a: 0.52
                },
                "146": {
                    a: 0.48
                },
                "147": {
                    a: 0.44
                },
                "148": {
                    a: 0.4
                },
                "149": {
                    a: 0.36
                },
                "150": {
                    a: 0.32
                },
                "151": {
                    a: 0.28
                },
                "152": {
                    a: 0.24
                },
                "153": {
                    a: 0.2
                },
                "154": {
                    a: 0.16
                },
                "155": {
                    a: 0.12
                },
                "156": {
                    a: 0.08
                },
                "157": {
                    a: 0.04
                },
                "158": {
                    a: 0
                }
            })
            .addTimedChild(instance13, 211, 17, {
                "211": {
                    x: 800,
                    y: 416.1,
                    sx: 1.279,
                    sy: 1.279,
                    r: 0.92,
                    c: [
                        0,
                        0.14,
                        0,
                        0.94,
                        0,
                        0.98
                    ]
                }
            })
            .addTimedChild(instance12, 211, 17, {
                "211": {
                    x: 506,
                    y: 196,
                    sx: 0.57,
                    sy: 0.57,
                    r: -2.255
                }
            })
            .addTimedChild(instance11, 211, 17, {
                "211": {
                    x: 728,
                    y: 157,
                    sx: 0.57,
                    sy: 0.57,
                    r: -1.261
                }
            })
            .addTimedChild(instance10, 209, 19, {
                "209": {
                    x: 669,
                    y: 296,
                    sx: 0.402,
                    sy: 0.402,
                    r: -1.261
                }
            })
            .addTimedChild(instance9, 209, 19, {
                "209": {
                    x: 683,
                    y: 72.05,
                    sx: 0.486,
                    sy: 0.486,
                    kx: 0.432,
                    ky: 2.709,
                    c: [
                        0,
                        1,
                        0,
                        0.68,
                        0,
                        0.17
                    ]
                }
            })
            .addTimedChild(instance15, 213, 15, {
                "213": {
                    x: 584,
                    y: 147,
                    sx: 1.514,
                    sy: 1.514,
                    ky: 3.142
                }
            })
            .addTimedChild(instance14, 213, 15, {
                "213": {
                    x: 897,
                    y: 255,
                    sx: 0.767,
                    sy: 0.767,
                    kx: -0.877,
                    ky: -2.265,
                    c: [
                        0,
                        1,
                        0,
                        0.68,
                        0,
                        0.17
                    ]
                }
            })
            .addTimedChild(instance7, 190, 68, {
                "190": {
                    x: 633.85,
                    y: 396,
                    r: 0.785
                }
            })
            .addTimedChild(instance5, 159, 37, {
                "159": {
                    x: 640,
                    y: 323.8,
                    sx: 0.7,
                    sy: 0.7,
                    a: 0
                },
                "160": {
                    x: 640.01,
                    y: 323.835,
                    sx: 0.705,
                    sy: 0.705,
                    a: 0.02
                },
                "161": {
                    x: 639.989,
                    y: 323.799,
                    sx: 0.71,
                    sy: 0.71,
                    a: 0.04
                },
                "162": {
                    x: 640.012,
                    y: 323.809,
                    sx: 0.719,
                    sy: 0.719,
                    a: 0.06
                },
                "163": {
                    x: 639.997,
                    y: 323.805,
                    sx: 0.733,
                    sy: 0.733,
                    a: 0.11
                },
                "164": {
                    x: 640.007,
                    y: 323.799,
                    sx: 0.754,
                    sy: 0.754,
                    a: 0.18
                },
                "165": {
                    x: 639.997,
                    y: 323.825,
                    sx: 0.783,
                    sy: 0.783,
                    a: 0.28
                },
                "166": {
                    x: 639.968,
                    y: 323.835,
                    sx: 0.82,
                    sy: 0.82,
                    a: 0.4
                },
                "167": {
                    x: 639.984,
                    y: 323.827,
                    sx: 0.863,
                    sy: 0.863,
                    a: 0.54
                },
                "168": {
                    x: 639.993,
                    y: 323.841,
                    sx: 0.906,
                    sy: 0.906,
                    a: 0.69
                },
                "169": {
                    x: 639.99,
                    y: 323.816,
                    sx: 0.943,
                    sy: 0.943,
                    a: 0.81
                },
                "170": {
                    x: 639.984,
                    y: 323.836,
                    sx: 0.971,
                    sy: 0.971,
                    a: 0.9
                },
                "171": {
                    x: 639.981,
                    y: 323.804,
                    sx: 0.988,
                    sy: 0.988,
                    a: 0.96
                },
                "172": {
                    x: 639.998,
                    y: 323.838,
                    sx: 0.997,
                    sy: 0.997,
                    a: 0.99
                },
                "173": {
                    x: 640,
                    y: 323.8,
                    sx: 1,
                    sy: 1,
                    a: 1
                },
                "175": {
                    x: 640.016,
                    y: 323.791,
                    sx: 0.943,
                    sy: 0.943,
                    a: 0.81
                },
                "176": {
                    x: 639.979,
                    y: 323.779,
                    sx: 0.892,
                    sy: 0.892,
                    a: 0.64
                },
                "177": {
                    x: 639.98,
                    y: 323.809,
                    sx: 0.847,
                    sy: 0.847,
                    a: 0.49
                },
                "178": {
                    x: 640.019,
                    y: 323.78,
                    sx: 0.808,
                    sy: 0.808,
                    a: 0.36
                },
                "179": {
                    x: 639.996,
                    y: 323.793,
                    sx: 0.775,
                    sy: 0.775,
                    a: 0.25
                },
                "180": {
                    x: 640.021,
                    y: 323.803,
                    sx: 0.748,
                    sy: 0.748,
                    a: 0.16
                },
                "181": {
                    x: 640.023,
                    y: 323.799,
                    sx: 0.727,
                    sy: 0.727,
                    a: 0.09
                },
                "182": {
                    x: 640.024,
                    y: 323.792,
                    sx: 0.712,
                    sy: 0.712,
                    a: 0.04
                },
                "183": {
                    x: 640.022,
                    y: 323.782,
                    sx: 0.703,
                    sy: 0.703,
                    a: 0.01
                },
                "184": {
                    x: 640,
                    y: 323.8,
                    sx: 0.7,
                    sy: 0.7,
                    a: 0
                },
                "185": {
                    sx: 1,
                    sy: 1,
                    a: 1
                },
                "186": {
                    x: 640.016,
                    y: 323.791,
                    sx: 0.943,
                    sy: 0.943,
                    a: 0.81
                },
                "187": {
                    x: 639.979,
                    y: 323.779,
                    sx: 0.892,
                    sy: 0.892,
                    a: 0.64
                },
                "188": {
                    x: 639.98,
                    y: 323.809,
                    sx: 0.847,
                    sy: 0.847,
                    a: 0.49
                },
                "189": {
                    x: 640.019,
                    y: 323.78,
                    sx: 0.808,
                    sy: 0.808,
                    a: 0.36
                },
                "190": {
                    x: 639.996,
                    y: 323.793,
                    sx: 0.775,
                    sy: 0.775,
                    a: 0.25
                },
                "191": {
                    x: 640.021,
                    y: 323.803,
                    sx: 0.748,
                    sy: 0.748,
                    a: 0.16
                },
                "192": {
                    x: 640.023,
                    y: 323.799,
                    sx: 0.727,
                    sy: 0.727,
                    a: 0.09
                },
                "193": {
                    x: 640.024,
                    y: 323.792,
                    sx: 0.712,
                    sy: 0.712,
                    a: 0.04
                },
                "194": {
                    x: 640.022,
                    y: 323.782,
                    sx: 0.703,
                    sy: 0.703,
                    a: 0.01
                },
                "195": {
                    x: 640,
                    y: 323.8,
                    sx: 0.7,
                    sy: 0.7,
                    a: 0
                }
            })
            .addTimedChild(instance17, 262, 57, {
                "262": {
                    x: 649.2,
                    y: 362.15
                }
            })
            .addTimedChild(instance16, 259, 10, {
                "259": {
                    x: 640,
                    y: 323.8,
                    sx: 1,
                    sy: 1,
                    a: 1
                },
                "260": {
                    x: 639.997,
                    y: 323.809,
                    sx: 0.937,
                    sy: 0.937,
                    a: 0.79
                },
                "261": {
                    x: 640,
                    y: 323.825,
                    sx: 0.881,
                    sy: 0.881,
                    a: 0.61
                },
                "262": {
                    x: 639.98,
                    y: 323.782,
                    sx: 0.833,
                    sy: 0.833,
                    a: 0.45
                },
                "263": {
                    x: 640.006,
                    y: 323.79,
                    sx: 0.793,
                    sy: 0.793,
                    a: 0.31
                },
                "264": {
                    x: 639.978,
                    y: 323.799,
                    sx: 0.759,
                    sy: 0.759,
                    a: 0.2
                },
                "265": {
                    x: 639.986,
                    y: 323.805,
                    sx: 0.733,
                    sy: 0.733,
                    a: 0.11
                },
                "266": {
                    x: 639.98,
                    y: 323.807,
                    sx: 0.715,
                    sy: 0.715,
                    a: 0.05
                },
                "267": {
                    x: 640.021,
                    y: 323.81,
                    sx: 0.704,
                    sy: 0.704,
                    a: 0.01
                },
                "268": {
                    x: 640,
                    y: 323.8,
                    sx: 0.7,
                    sy: 0.7,
                    a: 0
                }
            })
            .addTimedChild(instance27, 275, 16, {
                "275": {
                    x: 409,
                    y: 217.7
                }
            })
            .addTimedChild(instance26, 275, 16, {
                "275": {
                    x: 817.1,
                    y: 294,
                    sx: 1.304,
                    sy: 1.304,
                    r: 0.031
                }
            })
            .addTimedChild(instance25, 273, 18, {
                "273": {
                    x: 318.95,
                    y: 330.85
                }
            })
            .addTimedChild(instance24, 273, 18, {
                "273": {
                    x: 950.75,
                    y: 257.1
                }
            })
            .addTimedChild(instance23, 273, 18, {
                "273": {
                    x: 646.55,
                    y: 128.05,
                    sx: 1.427,
                    sy: 1.427,
                    r: -1.068
                }
            })
            .addTimedChild(instance22, 273, 18, {
                "273": {
                    x: 996.2,
                    y: 348.7,
                    sx: 0.475,
                    sy: 0.475,
                    r: 0.868
                }
            })
            .addTimedChild(instance21, 273, 18, {
                "273": {
                    x: 694.2,
                    y: 427.65,
                    sx: 1.304,
                    sy: 1.304,
                    r: 0.031
                }
            })
            .addTimedChild(instance20, 273, 18, {
                "273": {
                    x: 633.65,
                    y: 396.3,
                    sx: 0.422,
                    sy: 0.422,
                    r: 0.759
                }
            })
            .addTimedChild(instance19, 273, 18, {
                "273": {
                    x: 550.7,
                    y: 204.3,
                    sx: 0.422,
                    sy: 0.422,
                    r: -1.55
                }
            })
            .addTimedChild(instance29, 279, 14, {
                "279": {
                    x: 543.05,
                    y: 350.25,
                    sx: 0.662,
                    sy: 0.662
                }
            })
            .addTimedChild(instance28, 279, 14, {
                "279": {
                    x: 801.1,
                    y: 198.15,
                    sx: 0.988,
                    sy: 0.988,
                    r: 0.715
                }
            })
            .addTimedChild(instance31, 325, 40, {
                "325": {
                    x: 628,
                    y: 328.2
                }
            })
            .addTimedChild(instance30, 320, 10, {
                "320": {
                    x: 640,
                    y: 323.8,
                    sx: 1,
                    sy: 1,
                    a: 1
                },
                "321": {
                    x: 639.997,
                    y: 323.809,
                    sx: 0.937,
                    sy: 0.937,
                    a: 0.79
                },
                "322": {
                    x: 640,
                    y: 323.825,
                    sx: 0.881,
                    sy: 0.881,
                    a: 0.61
                },
                "323": {
                    x: 639.98,
                    y: 323.782,
                    sx: 0.833,
                    sy: 0.833,
                    a: 0.45
                },
                "324": {
                    x: 640.006,
                    y: 323.79,
                    sx: 0.793,
                    sy: 0.793,
                    a: 0.31
                },
                "325": {
                    x: 639.978,
                    y: 323.799,
                    sx: 0.759,
                    sy: 0.759,
                    a: 0.2
                },
                "326": {
                    x: 639.986,
                    y: 323.805,
                    sx: 0.733,
                    sy: 0.733,
                    a: 0.11
                },
                "327": {
                    x: 639.98,
                    y: 323.807,
                    sx: 0.715,
                    sy: 0.715,
                    a: 0.05
                },
                "328": {
                    x: 640.021,
                    y: 323.81,
                    sx: 0.704,
                    sy: 0.704,
                    a: 0.01
                },
                "329": {
                    x: 640,
                    y: 323.8,
                    sx: 0.7,
                    sy: 0.7,
                    a: 0
                }
            })
            .addTimedChild(instance32, 331, 51, {
                "331": {
                    x: 620.8,
                    y: 362.3,
                    sx: 1.081,
                    sy: 0.262,
                    kx: 0,
                    ky: 0,
                    r: 0,
                    c: [
                        0,
                        0.98,
                        0,
                        0.85,
                        0,
                        0.35
                    ]
                },
                "332": {
                    x: 620.782,
                    y: 363.448,
                    sx: 1.072,
                    sy: 0.319,
                    c: [
                        0.07,
                        0.91,
                        0.07,
                        0.79,
                        0.07,
                        0.33
                    ]
                },
                "333": {
                    x: 620.797,
                    y: 368.722,
                    sx: 1.029,
                    sy: 0.579,
                    c: [
                        0.4,
                        0.59,
                        0.4,
                        0.51,
                        0.4,
                        0.21
                    ]
                },
                "334": {
                    x: 620.79,
                    y: 376.366,
                    sx: 0.967,
                    sy: 0.955,
                    c: [
                        0.88,
                        0.12,
                        0.88,
                        0.11,
                        0.88,
                        0.04
                    ]
                },
                "335": {
                    x: 620.8,
                    y: 378.3,
                    sx: 0.951,
                    sy: 1.052,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "336": {
                    x: 620.781,
                    y: 378.302,
                    sx: 0.953,
                    sy: 1.05
                },
                "337": {
                    x: 620.784,
                    y: 378.277,
                    sx: 0.96,
                    sy: 1.043
                },
                "338": {
                    x: 620.799,
                    y: 378.318,
                    sx: 0.977,
                    sy: 1.026
                },
                "339": {
                    x: 620.79,
                    y: 378.284,
                    sx: 1,
                    sy: 1.002
                },
                "340": {
                    x: 620.795,
                    y: 378.295,
                    sx: 1.013,
                    sy: 0.989
                },
                "341": {
                    x: 620.8,
                    y: 378.3,
                    sx: 1.016,
                    sy: 0.986
                },
                "342": {
                    x: 620.825,
                    y: 378.312,
                    sx: 1.015
                },
                "343": {
                    x: 620.826,
                    y: 378.291,
                    sx: 1.013,
                    sy: 0.988
                },
                "344": {
                    x: 620.804,
                    y: 378.311,
                    sx: 1.009,
                    sy: 0.991
                },
                "345": {
                    x: 620.822,
                    y: 378.3,
                    sx: 1.004,
                    sy: 0.996
                },
                "346": {
                    x: 620.828,
                    y: 378.286,
                    sx: 1.001,
                    sy: 0.999
                },
                "347": {
                    x: 620.8,
                    y: 378.3,
                    sx: 1,
                    sy: 1
                },
                "366": {
                    x: 620.783,
                    y: 378.296,
                    sx: 1.002,
                    sy: 1.002
                },
                "367": {
                    x: 620.799,
                    y: 378.33,
                    sx: 1.009,
                    sy: 1.009,
                    r: -0.005
                },
                "368": {
                    x: 620.793,
                    y: 378.282,
                    sx: 1.023,
                    sy: 1.023,
                    r: -0.014
                },
                "369": {
                    x: 620.787,
                    y: 378.29,
                    sx: 1.048,
                    sy: 1.048,
                    r: -0.032
                },
                "370": {
                    x: 620.755,
                    y: 378.302,
                    sx: 1.08,
                    sy: 1.08,
                    r: -0.057
                },
                "371": {
                    x: 620.781,
                    y: 378.279,
                    sx: 1.104,
                    sy: 1.104,
                    r: -0.075
                },
                "372": {
                    x: 620.819,
                    y: 378.304,
                    sx: 1.116,
                    sy: 1.116,
                    r: -0.083
                },
                "373": {
                    x: 620.8,
                    y: 378.3,
                    sx: 1.119,
                    sy: 1.119,
                    r: -0.086
                },
                "374": {
                    x: 620.819,
                    y: 378.308,
                    sx: 1.106,
                    sy: 1.106,
                    r: -0.044,
                    c: [
                        0.98,
                        0.02,
                        0.98,
                        0.01,
                        0.98,
                        0
                    ]
                },
                "375": {
                    x: 620.792,
                    y: 378.297,
                    sx: 1.066,
                    sy: 1.066,
                    r: 0.07,
                    c: [
                        0.94,
                        0.06,
                        0.94,
                        0.05,
                        0.94,
                        0.02
                    ]
                },
                "376": {
                    x: 620.84,
                    y: 378.323,
                    sx: 0.999,
                    sy: 0.999,
                    r: 0.267,
                    c: [
                        0.86,
                        0.14,
                        0.86,
                        0.12,
                        0.86,
                        0.05
                    ]
                },
                "377": {
                    x: 620.752,
                    y: 378.264,
                    sx: 0.906,
                    sy: 0.906,
                    r: 0.543,
                    c: [
                        0.75,
                        0.25,
                        0.75,
                        0.22,
                        0.75,
                        0.09
                    ]
                },
                "378": {
                    x: 620.785,
                    y: 378.31,
                    sx: 0.787,
                    sy: 0.787,
                    r: 0.901,
                    c: [
                        0.61,
                        0.38,
                        0.61,
                        0.33,
                        0.61,
                        0.14
                    ]
                },
                "379": {
                    x: 620.766,
                    y: 378.261,
                    sx: 0.642,
                    sy: 0.642,
                    r: 1.334,
                    c: [
                        0.44,
                        0.55,
                        0.44,
                        0.48,
                        0.44,
                        0.2
                    ]
                },
                "380": {
                    x: 620.788,
                    y: 378.356,
                    sx: 0.47,
                    sy: 0.47,
                    kx: 4.441,
                    ky: 1.842,
                    r: 0,
                    c: [
                        0.23,
                        0.75,
                        0.23,
                        0.65,
                        0.23,
                        0.27
                    ]
                },
                "381": {
                    x: 620.8,
                    y: 378.3,
                    sx: 0.272,
                    sy: 0.272,
                    kx: 3.848,
                    ky: 2.436,
                    c: [
                        0,
                        0.98,
                        0,
                        0.85,
                        0,
                        0.35
                    ]
                }
            })
            .addTimedChild(instance34, 347, 14, {
                "347": {
                    x: 641.2,
                    y: 359.75
                }
            })
            .addTimedChild(instance36, 386, 66, {
                "386": {
                    x: 639.95,
                    y: 360,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "436": {
                    y: 359.15
                },
                "437": {
                    y: 356.45
                },
                "438": {
                    y: 351.95
                },
                "439": {
                    y: 346.7
                },
                "440": {
                    y: 342.5
                },
                "441": {
                    y: 341
                },
                "442": {
                    y: 349.95,
                    c: [
                        0.98,
                        0,
                        0.98,
                        0,
                        0.98,
                        0
                    ]
                },
                "443": {
                    y: 377.85,
                    c: [
                        0.93,
                        0,
                        0.93,
                        0,
                        0.93,
                        0
                    ]
                },
                "444": {
                    y: 425.95,
                    c: [
                        0.85,
                        0,
                        0.85,
                        0,
                        0.85,
                        0
                    ]
                },
                "445": {
                    y: 493.9,
                    c: [
                        0.73,
                        0,
                        0.73,
                        0,
                        0.73,
                        0
                    ]
                },
                "446": {
                    y: 578.6,
                    c: [
                        0.58,
                        0,
                        0.58,
                        0,
                        0.58,
                        0
                    ]
                },
                "447": {
                    y: 672.45,
                    c: [
                        0.41,
                        0,
                        0.41,
                        0,
                        0.41,
                        0
                    ]
                },
                "448": {
                    y: 763.6,
                    c: [
                        0.25,
                        0,
                        0.25,
                        0,
                        0.25,
                        0
                    ]
                },
                "449": {
                    y: 838.55,
                    c: [
                        0.11,
                        0,
                        0.11,
                        0,
                        0.11,
                        0
                    ]
                },
                "450": {
                    y: 886.7,
                    c: [
                        0.03,
                        0,
                        0.03,
                        0,
                        0.03,
                        0
                    ]
                },
                "451": {
                    y: 902.95,
                    c: [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            })
            .addTimedChild(instance35, 383, 10, {
                "383": {
                    x: 640,
                    y: 323.8,
                    sx: 1,
                    sy: 1,
                    a: 1
                },
                "384": {
                    x: 639.997,
                    y: 323.809,
                    sx: 0.937,
                    sy: 0.937,
                    a: 0.79
                },
                "385": {
                    x: 640,
                    y: 323.825,
                    sx: 0.881,
                    sy: 0.881,
                    a: 0.61
                },
                "386": {
                    x: 639.98,
                    y: 323.782,
                    sx: 0.833,
                    sy: 0.833,
                    a: 0.45
                },
                "387": {
                    x: 640.006,
                    y: 323.79,
                    sx: 0.793,
                    sy: 0.793,
                    a: 0.31
                },
                "388": {
                    x: 639.978,
                    y: 323.799,
                    sx: 0.759,
                    sy: 0.759,
                    a: 0.2
                },
                "389": {
                    x: 639.986,
                    y: 323.805,
                    sx: 0.733,
                    sy: 0.733,
                    a: 0.11
                },
                "390": {
                    x: 639.98,
                    y: 323.807,
                    sx: 0.715,
                    sy: 0.715,
                    a: 0.05
                },
                "391": {
                    x: 640.021,
                    y: 323.81,
                    sx: 0.704,
                    sy: 0.704,
                    a: 0.01
                },
                "392": {
                    x: 640,
                    y: 323.8,
                    sx: 0.7,
                    sy: 0.7,
                    a: 0
                }
            })
            .addTimedChild(instance40, 458, 44, {
                "458": {
                    x: 639.95,
                    y: 362.7,
                    sx: 1.3,
                    sy: 1.3,
                    a: 0,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "459": {
                    a: 0.2,
                    c: [
                        0.8,
                        0.03,
                        0.8,
                        0.18,
                        0.8,
                        0.19
                    ]
                },
                "460": {
                    a: 0.4,
                    c: [
                        0.6,
                        0.05,
                        0.6,
                        0.37,
                        0.6,
                        0.38
                    ]
                },
                "461": {
                    a: 0.6,
                    c: [
                        0.4,
                        0.08,
                        0.4,
                        0.55,
                        0.4,
                        0.57
                    ]
                },
                "462": {
                    a: 0.8,
                    c: [
                        0.2,
                        0.11,
                        0.2,
                        0.73,
                        0.2,
                        0.76
                    ]
                },
                "463": {
                    a: 1,
                    c: [
                        0,
                        0.14,
                        0,
                        0.92,
                        0,
                        0.96
                    ]
                },
                "498": {
                    a: 0.75,
                    c: [
                        0.25,
                        0.1,
                        0.25,
                        0.69,
                        0.25,
                        0.72
                    ]
                },
                "499": {
                    a: 0.5,
                    c: [
                        0.5,
                        0.07,
                        0.5,
                        0.46,
                        0.5,
                        0.48
                    ]
                },
                "500": {
                    a: 0.25,
                    c: [
                        0.75,
                        0.04,
                        0.75,
                        0.23,
                        0.75,
                        0.24
                    ]
                },
                "501": {
                    a: 0,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                }
            })
            .addTimedChild(instance39, 458, 44, {
                "458": {
                    x: 646.3,
                    y: 354.4,
                    a: 0
                },
                "459": {
                    a: 0.2
                },
                "460": {
                    a: 0.4
                },
                "461": {
                    a: 0.6
                },
                "462": {
                    a: 0.8
                },
                "463": {
                    a: 1
                },
                "498": {
                    a: 0.75
                },
                "499": {
                    a: 0.5
                },
                "500": {
                    a: 0.25
                },
                "501": {
                    a: 0
                }
            })
            .addTimedChild(instance38, 453, 10, {
                "453": {
                    x: 640,
                    y: 323.8,
                    sx: 1,
                    sy: 1,
                    a: 1
                },
                "454": {
                    x: 639.997,
                    y: 323.809,
                    sx: 0.937,
                    sy: 0.937,
                    a: 0.79
                },
                "455": {
                    x: 640,
                    y: 323.825,
                    sx: 0.881,
                    sy: 0.881,
                    a: 0.61
                },
                "456": {
                    x: 639.98,
                    y: 323.782,
                    sx: 0.833,
                    sy: 0.833,
                    a: 0.45
                },
                "457": {
                    x: 640.006,
                    y: 323.79,
                    sx: 0.793,
                    sy: 0.793,
                    a: 0.31
                },
                "458": {
                    x: 639.978,
                    y: 323.799,
                    sx: 0.759,
                    sy: 0.759,
                    a: 0.2
                },
                "459": {
                    x: 639.986,
                    y: 323.805,
                    sx: 0.733,
                    sy: 0.733,
                    a: 0.11
                },
                "460": {
                    x: 639.98,
                    y: 323.807,
                    sx: 0.715,
                    sy: 0.715,
                    a: 0.05
                },
                "461": {
                    x: 640.021,
                    y: 323.81,
                    sx: 0.704,
                    sy: 0.704,
                    a: 0.01
                },
                "462": {
                    x: 640,
                    y: 323.8,
                    sx: 0.7,
                    sy: 0.7,
                    a: 0
                }
            })
            .addTimedChild(instance45, 513, 19, {
                "513": {
                    x: 640,
                    y: 362.7,
                    sx: 0.423,
                    sy: 0.423,
                    c: [
                        0,
                        0.14,
                        0,
                        0.94,
                        0,
                        0.98
                    ]
                }
            })
            .addTimedChild(instance43, 509, 61, {
                "509": {
                    x: 640.15,
                    y: 360.05,
                    sx: 0.692,
                    sy: 0.692
                }
            })
            .addTimedChild(instance42, 503, 10, {
                "503": {
                    x: 640,
                    y: 323.8,
                    sx: 1,
                    sy: 1,
                    a: 1
                },
                "504": {
                    x: 639.997,
                    y: 323.809,
                    sx: 0.937,
                    sy: 0.937,
                    a: 0.79
                },
                "505": {
                    x: 640,
                    y: 323.825,
                    sx: 0.881,
                    sy: 0.881,
                    a: 0.61
                },
                "506": {
                    x: 639.98,
                    y: 323.782,
                    sx: 0.833,
                    sy: 0.833,
                    a: 0.45
                },
                "507": {
                    x: 640.006,
                    y: 323.79,
                    sx: 0.793,
                    sy: 0.793,
                    a: 0.31
                },
                "508": {
                    x: 639.978,
                    y: 323.799,
                    sx: 0.759,
                    sy: 0.759,
                    a: 0.2
                },
                "509": {
                    x: 639.986,
                    y: 323.805,
                    sx: 0.733,
                    sy: 0.733,
                    a: 0.11
                },
                "510": {
                    x: 639.98,
                    y: 323.807,
                    sx: 0.715,
                    sy: 0.715,
                    a: 0.05
                },
                "511": {
                    x: 640.021,
                    y: 323.81,
                    sx: 0.704,
                    sy: 0.704,
                    a: 0.01
                },
                "512": {
                    x: 640,
                    y: 323.8,
                    sx: 0.7,
                    sy: 0.7,
                    a: 0
                }
            })
            .addTimedChild(instance55, 608, 52, {
                "608": {
                    x: 371.9,
                    y: 364.1,
                    sx: 0.735,
                    sy: 0.735,
                    r: -1.571,
                    c: [
                        0,
                        0.13,
                        0,
                        0.86,
                        0,
                        0.91
                    ]
                }
            })
            .addTimedChild(instance54, 608, 52, {
                "608": {
                    x: 392.8,
                    y: 279.7,
                    sx: 0.735,
                    sy: 0.735,
                    r: -1.166,
                    c: [
                        0,
                        0.13,
                        0,
                        0.86,
                        0,
                        0.91
                    ]
                }
            })
            .addTimedChild(instance53, 608, 52, {
                "608": {
                    x: 897.65,
                    y: 364.1,
                    sx: 0.735,
                    sy: 0.735,
                    kx: -1.571,
                    ky: -1.571,
                    c: [
                        0,
                        0.13,
                        0,
                        0.86,
                        0,
                        0.91
                    ]
                }
            })
            .addTimedChild(instance52, 608, 52, {
                "608": {
                    x: 876.75,
                    y: 279.7,
                    sx: 0.735,
                    sy: 0.735,
                    kx: -1.166,
                    ky: -1.976,
                    c: [
                        0,
                        0.13,
                        0,
                        0.86,
                        0,
                        0.91
                    ]
                }
            })
            .addTimedChild(instance51, 608, 52, {
                "608": {
                    x: 371.9,
                    y: 450.15,
                    sx: 0.735,
                    sy: 0.735,
                    r: -1.571,
                    c: [
                        0,
                        0.13,
                        0,
                        0.86,
                        0,
                        0.91
                    ]
                }
            })
            .addTimedChild(instance50, 608, 52, {
                "608": {
                    x: 897.65,
                    y: 450.15,
                    sx: 0.735,
                    sy: 0.735,
                    kx: -1.571,
                    ky: -1.571,
                    c: [
                        0,
                        0.13,
                        0,
                        0.86,
                        0,
                        0.91
                    ]
                }
            })
            .addTimedChild(instance49, 608, 52, {
                "608": {
                    x: 393.75,
                    y: 547.3,
                    sx: 0.735,
                    sy: 0.735,
                    r: -2.299,
                    c: [
                        0,
                        0.13,
                        0,
                        0.86,
                        0,
                        0.91
                    ]
                }
            })
            .addTimedChild(instance48, 608, 52, {
                "608": {
                    x: 876.8,
                    y: 545.4,
                    sx: 0.735,
                    sy: 0.735,
                    kx: 4.215,
                    ky: -1.074,
                    c: [
                        0,
                        0.13,
                        0,
                        0.86,
                        0,
                        0.91
                    ]
                }
            })
            .addTimedChild(instance47, 577, 83, {
                "577": {
                    x: 634.85,
                    y: 389.35,
                    a: 0
                },
                "578": {
                    a: 0.17
                },
                "579": {
                    a: 0.33
                },
                "580": {
                    a: 0.5
                },
                "581": {
                    a: 0.67
                },
                "582": {
                    a: 0.83
                },
                "583": {
                    a: 1
                }
            })
            .addTimedChild(instance46, 570, 10, {
                "570": {
                    x: 640,
                    y: 323.8,
                    sx: 1,
                    sy: 1,
                    a: 1
                },
                "571": {
                    x: 639.997,
                    y: 323.809,
                    sx: 0.937,
                    sy: 0.937,
                    a: 0.79
                },
                "572": {
                    x: 640,
                    y: 323.825,
                    sx: 0.881,
                    sy: 0.881,
                    a: 0.61
                },
                "573": {
                    x: 639.98,
                    y: 323.782,
                    sx: 0.833,
                    sy: 0.833,
                    a: 0.45
                },
                "574": {
                    x: 640.006,
                    y: 323.79,
                    sx: 0.793,
                    sy: 0.793,
                    a: 0.31
                },
                "575": {
                    x: 639.978,
                    y: 323.799,
                    sx: 0.759,
                    sy: 0.759,
                    a: 0.2
                },
                "576": {
                    x: 639.986,
                    y: 323.805,
                    sx: 0.733,
                    sy: 0.733,
                    a: 0.11
                },
                "577": {
                    x: 639.98,
                    y: 323.807,
                    sx: 0.715,
                    sy: 0.715,
                    a: 0.05
                },
                "578": {
                    x: 640.021,
                    y: 323.81,
                    sx: 0.704,
                    sy: 0.704,
                    a: 0.01
                },
                "579": {
                    x: 640,
                    y: 323.8,
                    sx: 0.7,
                    sy: 0.7,
                    a: 0
                }
            })
            .addTimedChild(instance58, 669, 23, {
                "669": {
                    x: 639.95,
                    y: 359.95,
                    sx: 1,
                    sy: 1
                },
                "683": {
                    x: 639.948,
                    y: 359.948,
                    sx: 0.992,
                    sy: 1.007
                },
                "684": {
                    x: 639.945,
                    y: 359.932,
                    sx: 0.958,
                    sy: 1.036
                },
                "685": {
                    x: 639.958,
                    y: 359.974,
                    sx: 0.896,
                    sy: 1.091
                },
                "686": {
                    x: 639.934,
                    y: 359.965,
                    sx: 0.853,
                    sy: 1.128
                },
                "687": {
                    x: 639.95,
                    y: 359.95,
                    sx: 0.843,
                    sy: 1.137
                },
                "688": {
                    x: 639.975,
                    y: 359.939,
                    sy: 1.044
                },
                "689": {
                    x: 639.962,
                    y: 359.916,
                    sx: 0.844,
                    sy: 0.65
                },
                "690": {
                    x: 639.965,
                    y: 359.945,
                    sx: 0.846,
                    sy: 0.186
                },
                "691": {
                    x: 639.95,
                    y: 359.95,
                    sy: 0.067
                }
            })
            .addTimedChild(instance57, 660, 10, {
                "660": {
                    x: 640,
                    y: 323.8,
                    sx: 1,
                    sy: 1,
                    a: 1
                },
                "661": {
                    x: 639.997,
                    y: 323.809,
                    sx: 0.937,
                    sy: 0.937,
                    a: 0.79
                },
                "662": {
                    x: 640,
                    y: 323.825,
                    sx: 0.881,
                    sy: 0.881,
                    a: 0.61
                },
                "663": {
                    x: 639.98,
                    y: 323.782,
                    sx: 0.833,
                    sy: 0.833,
                    a: 0.45
                },
                "664": {
                    x: 640.006,
                    y: 323.79,
                    sx: 0.793,
                    sy: 0.793,
                    a: 0.31
                },
                "665": {
                    x: 639.978,
                    y: 323.799,
                    sx: 0.759,
                    sy: 0.759,
                    a: 0.2
                },
                "666": {
                    x: 639.986,
                    y: 323.805,
                    sx: 0.733,
                    sy: 0.733,
                    a: 0.11
                },
                "667": {
                    x: 639.98,
                    y: 323.807,
                    sx: 0.715,
                    sy: 0.715,
                    a: 0.05
                },
                "668": {
                    x: 640.021,
                    y: 323.81,
                    sx: 0.704,
                    sy: 0.704,
                    a: 0.01
                },
                "669": {
                    x: 640,
                    y: 323.8,
                    sx: 0.7,
                    sy: 0.7,
                    a: 0
                }
            });
    });

    lib.enrollment.assets = {
        "enrollment": "images/enrollment.shapes.json",
        "enrollment_atlas_1": "images/enrollment_atlas_1.json",
        "enrollment_atlas_2": "images/enrollment_atlas_2.json",
        "enrollment_atlas_3": "images/enrollment_atlas_3.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.enrollment,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 693,
        library: lib
    };
}