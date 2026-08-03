(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 21, loop: false });
        var instance1 = new Sprite(fromFrame("camera-stuff1"))
            .setTransform(-41, -40.7, 0.321, 0.321);
        this.addTimedChild(instance1);
    });

    var Graphic2 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 6, loop: false });
        var instance1 = new Sprite(fromFrame("camera-shadow1"))
            .setTransform(0, 0.05, 0.981, 0.981);
        this.addTimedChild(instance1);
    });

    lib.camera_shadow = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("camera-shadow1"))
            .setTransform(0, 0.05, 0.981, 0.981);
        this.addChild(instance1);
    });

    var Graphic3 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("camera-glass1"))
            .setTransform(-44.55, -44.55, 0.321, 0.321);
        this.addTimedChild(instance1);
    });

    var Graphic4 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 24, loop: false });
        var instance1 = new Sprite(fromFrame("camera-ring1"))
            .setTransform(-61.8, -61.75, 0.321, 0.321);
        this.addTimedChild(instance1);
    });

    var Graphic5 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 5, loop: false });
        var instance1 = new Sprite(fromFrame("shadow-011"))
            .setTransform(0, 0.05, 0.981, 0.981);
        this.addTimedChild(instance1);
    });

    var Graphic6 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 5, loop: false });
        var instance1 = new Sprite(fromFrame("shadow-011"))
            .setTransform(0, 0.05, 0.981, 0.981);
        this.addTimedChild(instance1);
    });

    var Graphic7 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 5, loop: false });
        var instance2 = new Graphic6(MovieClip.SYNCHED)
            .setTransform(239, 195.45);
        var instance1 = new Graphic5(MovieClip.SYNCHED)
            .setTransform(138.45, 195.45, 1, 1, 0, 0, 3.142);
        this.addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    lib.Graphic8 = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("shadow-011"))
            .setTransform(0, 0.05, 0.981, 0.981);
        this.addChild(instance1);
    });

    lib.Graphic9 = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("shadow-011"))
            .setTransform(0, 0.05, 0.981, 0.981);
        this.addChild(instance1);
    });

    lib.shadow = Container.extend(function () {
        Container.call(this);
        var instance2 = new lib.Graphic9()
            .setTransform(239, 195.45);
        var instance1 = new lib.Graphic8()
            .setTransform(138.45, 195.45, 1, 1, 0, 0, 3.142);
        this.addChild(instance2, instance1);
    });

    var Graphic10 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("camera-flash1"))
            .setTransform(-24.5, -12.3, 0.321, 0.321);
        this.addTimedChild(instance1);
    });

    var Graphic11 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 13, loop: false });
        var instance1 = new Sprite(fromFrame("camera-dot1"))
            .setTransform(-4.1, -4.1, 0.321, 0.321);
        this.addTimedChild(instance1);
    });

    var Graphic12 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 22, loop: false });
        var instance1 = new Sprite(fromFrame("camera-body1"))
            .setTransform(-110.25, -67.9, 0.321, 0.321);
        this.addTimedChild(instance1);
    });

    var Graphic13 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 12, loop: false });
        var instance1 = new Sprite(fromFrame("camera-button1"))
            .setTransform(-17.55, -4.4, 0.321, 0.321);
        this.addTimedChild(instance1);
    });

    var Graphic14 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance11 = new Graphic13(MovieClip.SYNCHED);
        var instance4 = new Graphic12(MovieClip.SYNCHED);
        var instance10 = new Graphic11(MovieClip.SYNCHED);
        var instance8 = new Graphic10(MovieClip.SYNCHED);
        var instance7 = new Graphic7(MovieClip.SYNCHED);
        var instance9 = new lib.shadow()
            .setTransform(-84, -70.6, 0.224, 0.224)
            .setAlpha(0.2);
        var instance3 = new Graphic4(MovieClip.SYNCHED);
        var instance1 = new Graphic3(MovieClip.SYNCHED);
        var instance2 = new Graphic2(MovieClip.SYNCHED);
        var instance6 = new lib.camera_shadow()
            .setTransform(-72.3, -62.7, 0.224, 0.224)
            .setAlpha(0.3);
        var instance5 = new Graphic1(MovieClip.SYNCHED);
        this.addTimedChild(instance11, 17, 12, {
                "17": {
                    x: -95.3,
                    y: -78.5,
                    sx: 0.684,
                    sy: 0.684
                },
                "18": {
                    x: -95.349,
                    y: -78.749
                },
                "19": {
                    y: -79.649
                },
                "20": {
                    y: -81.199
                },
                "21": {
                    y: -82.499
                },
                "22": {
                    x: -95.3,
                    y: -82.9
                },
                "23": {
                    x: -95.349,
                    y: -82.899
                },
                "24": {
                    y: -82.799
                },
                "25": {
                    y: -82.599
                },
                "26": {
                    y: -82.449
                },
                "27": {
                    x: -95.3,
                    y: -82.35
                }
            })
            .addTimedChild(instance4, 7, 22, {
                "7": {
                    x: -43.6,
                    y: -38.9,
                    sx: 0.225,
                    sy: 0.225
                },
                "8": {
                    x: -43.626,
                    y: -38.913,
                    sx: 0.235,
                    sy: 0.235
                },
                "9": {
                    x: -43.605,
                    y: -38.917,
                    sx: 0.27,
                    sy: 0.27
                },
                "10": {
                    y: -38.942,
                    sx: 0.336,
                    sy: 0.336
                },
                "11": {
                    x: -43.641,
                    y: -38.921,
                    sx: 0.434,
                    sy: 0.434
                },
                "12": {
                    x: -43.65,
                    y: -38.952,
                    sx: 0.548,
                    sy: 0.548
                },
                "13": {
                    x: -43.657,
                    y: -38.951,
                    sx: 0.641,
                    sy: 0.641
                },
                "14": {
                    x: -43.643,
                    y: -38.923,
                    sx: 0.695,
                    sy: 0.695
                },
                "15": {
                    x: -43.6,
                    y: -38.85,
                    sx: 0.711,
                    sy: 0.711
                },
                "16": {
                    x: -43.654,
                    y: -38.859,
                    sx: 0.71,
                    sy: 0.71
                },
                "17": {
                    x: -43.65,
                    y: -38.872,
                    sx: 0.707,
                    sy: 0.707
                },
                "18": {
                    x: -43.655,
                    y: -38.859,
                    sx: 0.702,
                    sy: 0.702
                },
                "19": {
                    x: -43.641,
                    y: -38.89,
                    sx: 0.696,
                    sy: 0.696
                },
                "20": {
                    x: -43.646,
                    y: -38.888,
                    sx: 0.689,
                    sy: 0.689
                },
                "21": {
                    x: -43.611,
                    y: -38.878,
                    sx: 0.685,
                    sy: 0.685
                },
                "22": {
                    x: -43.6,
                    y: -38.85,
                    sx: 0.684,
                    sy: 0.684
                }
            })
            .addTimedChild(instance10, 16, 13, {
                "16": {
                    x: -77.4,
                    y: -70.9,
                    sx: 0.228,
                    sy: 0.228
                },
                "17": {
                    x: -77.401,
                    y: -70.922,
                    sx: 0.247,
                    sy: 0.247
                },
                "18": {
                    x: -77.437,
                    y: -70.924,
                    sx: 0.311,
                    sy: 0.311
                },
                "19": {
                    x: -77.419,
                    y: -70.918,
                    sx: 0.433,
                    sy: 0.433
                },
                "20": {
                    x: -77.428,
                    sx: 0.606,
                    sy: 0.606
                },
                "21": {
                    x: -77.434,
                    y: -70.904,
                    sx: 0.77,
                    sy: 0.77
                },
                "22": {
                    x: -77.405,
                    y: -70.936,
                    sx: 0.867,
                    sy: 0.867
                },
                "23": {
                    x: -77.4,
                    y: -70.85,
                    sx: 0.896,
                    sy: 0.896
                },
                "24": {
                    x: -77.458,
                    y: -70.896,
                    sx: 0.884,
                    sy: 0.884
                },
                "25": {
                    x: -77.431,
                    y: -70.889,
                    sx: 0.84,
                    sy: 0.84
                },
                "26": {
                    x: -77.424,
                    y: -70.882,
                    sx: 0.765,
                    sy: 0.765
                },
                "27": {
                    x: -77.464,
                    y: -70.876,
                    sx: 0.703,
                    sy: 0.703
                },
                "28": {
                    x: -77.4,
                    y: -70.85,
                    sx: 0.684,
                    sy: 0.684
                }
            })
            .addTimedChild(instance8, 13, 16, {
                "13": {
                    x: 9.15,
                    y: -72.6,
                    sx: 0.458,
                    sy: 0.458
                },
                "14": {
                    x: 9.173,
                    y: -72.622,
                    sx: 0.469,
                    sy: 0.469
                },
                "15": {
                    x: 9.164,
                    y: -72.596,
                    sx: 0.509,
                    sy: 0.509
                },
                "16": {
                    x: 9.145,
                    y: -72.598,
                    sx: 0.583,
                    sy: 0.583
                },
                "17": {
                    x: 9.172,
                    y: -72.643,
                    sx: 0.672,
                    sy: 0.672
                },
                "18": {
                    x: 9.149,
                    y: -72.638,
                    sx: 0.731,
                    sy: 0.731
                },
                "19": {
                    x: 9.15,
                    y: -72.6,
                    sx: 0.748,
                    sy: 0.748
                },
                "20": {
                    x: 9.155,
                    y: -72.597,
                    sx: 0.745,
                    sy: 0.745
                },
                "21": {
                    x: 9.144,
                    y: -72.617,
                    sx: 0.731,
                    sy: 0.731
                },
                "22": {
                    x: 9.166,
                    y: -72.613,
                    sx: 0.709,
                    sy: 0.709
                },
                "23": {
                    x: 9.138,
                    y: -72.598,
                    sx: 0.69,
                    sy: 0.69
                },
                "24": {
                    x: 9.15,
                    y: -72.6,
                    sx: 0.684,
                    sy: 0.684
                }
            })
            .addTimedChild(instance7, 11, 5, {
                "11": {
                    x: -84,
                    y: -70.6,
                    sx: 0.224,
                    sy: 0.224,
                    a: 0
                },
                "12": {
                    x: -83.999,
                    y: -70.599,
                    a: 0.01
                },
                "13": {
                    a: 0.05
                },
                "14": {
                    a: 0.13
                },
                "15": {
                    a: 0.18
                }
            })
            .addTimedChild(instance9, 16, 13)
            .addTimedChild(instance3, 5, 24, {
                "5": {
                    x: -41.8,
                    y: -32.2,
                    sx: 0.485,
                    sy: 0.485
                },
                "6": {
                    x: -41.852,
                    y: -32.206,
                    sx: 0.495,
                    sy: 0.495
                },
                "7": {
                    x: -41.823,
                    y: -32.234,
                    sx: 0.53,
                    sy: 0.53
                },
                "8": {
                    x: -41.833,
                    y: -32.193,
                    sx: 0.596,
                    sy: 0.596
                },
                "9": {
                    x: -41.82,
                    y: -32.222,
                    sx: 0.675,
                    sy: 0.675
                },
                "10": {
                    y: -32.188,
                    sx: 0.727,
                    sy: 0.727
                },
                "11": {
                    x: -41.8,
                    y: -32.2,
                    sx: 0.742,
                    sy: 0.742
                },
                "12": {
                    x: -41.858,
                    y: -32.229,
                    sx: 0.741,
                    sy: 0.741
                },
                "13": {
                    x: -41.843,
                    y: -32.237,
                    sx: 0.735,
                    sy: 0.735
                },
                "14": {
                    x: -41.844,
                    y: -32.225,
                    sx: 0.725,
                    sy: 0.725
                },
                "15": {
                    x: -41.849,
                    y: -32.224,
                    sx: 0.71,
                    sy: 0.71
                },
                "16": {
                    x: -41.846,
                    y: -32.206,
                    sx: 0.695,
                    sy: 0.695
                },
                "17": {
                    x: -41.816,
                    y: -32.236,
                    sx: 0.687,
                    sy: 0.687
                },
                "18": {
                    x: -41.8,
                    y: -32.2,
                    sx: 0.684,
                    sy: 0.684
                }
            })
            .addTimedChild(instance1, 0, 29, {
                "0": {
                    x: -41.8,
                    y: -32.2,
                    sx: 0.63,
                    sy: 0.63,
                    c: [
                        0,
                        0.17,
                        0,
                        0.17,
                        0,
                        0.22
                    ]
                },
                "1": {
                    x: -41.838,
                    y: -32.207,
                    sx: 0.632,
                    sy: 0.632,
                    c: [
                        0.04,
                        0.16,
                        0.04,
                        0.16,
                        0.04,
                        0.21
                    ]
                },
                "2": {
                    x: -41.831,
                    y: -32.236,
                    sx: 0.639,
                    sy: 0.639,
                    c: [
                        0.18,
                        0.14,
                        0.18,
                        0.14,
                        0.18,
                        0.18
                    ]
                },
                "3": {
                    x: -41.805,
                    y: -32.198,
                    sx: 0.653,
                    sy: 0.653,
                    c: [
                        0.43,
                        0.1,
                        0.43,
                        0.1,
                        0.43,
                        0.13
                    ]
                },
                "4": {
                    x: -41.812,
                    y: -32.2,
                    sx: 0.67,
                    sy: 0.67,
                    c: [
                        0.74,
                        0.05,
                        0.74,
                        0.05,
                        0.74,
                        0.06
                    ]
                },
                "5": {
                    x: -41.796,
                    y: -32.216,
                    sx: 0.681,
                    sy: 0.681,
                    c: [
                        0.94,
                        0.01,
                        0.94,
                        0.01,
                        0.94,
                        0.01
                    ]
                },
                "6": {
                    x: -41.8,
                    y: -32.2,
                    sx: 0.684,
                    sy: 0.684,
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
            .addTimedChild(instance2, 5, 6, {
                "5": {
                    x: -72.3,
                    y: -62.7,
                    sx: 0.224,
                    sy: 0.224,
                    a: 0
                },
                "6": {
                    x: -72.299,
                    y: -62.699,
                    a: 0.05
                },
                "7": {
                    a: 0.1
                },
                "8": {
                    a: 0.15
                },
                "9": {
                    a: 0.2
                },
                "10": {
                    a: 0.25
                }
            })
            .addTimedChild(instance6, 11, 18)
            .addTimedChild(instance5, 8, 21, {
                "8": {
                    x: -44.45,
                    y: -34.75,
                    sx: 0.684,
                    sy: 0.684,
                    a: 0
                },
                "9": {
                    x: -44.499,
                    y: -34.799,
                    a: 0.03
                },
                "10": {
                    a: 0.13
                },
                "11": {
                    a: 0.31
                },
                "12": {
                    a: 0.57
                },
                "13": {
                    a: 0.81
                },
                "14": {
                    a: 0.96
                },
                "15": {
                    x: -44.45,
                    y: -34.75,
                    a: 1
                }
            });
    });

    var Graphic15 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic16 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic17 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic18 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic19 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic20 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic21 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic22 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic23 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic24 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic25 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic26 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic27 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic28 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic29 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic30 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic31 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic32 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic33 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("circledots-dot1"))
            .setTransform(-16, -2.5, 1.097, 1.097);
        this.addTimedChild(instance1);
    });

    var Graphic34 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance19 = new Graphic33(MovieClip.SYNCHED)
            .setTransform(240.75, -9.25);
        var instance18 = new Graphic32(MovieClip.SYNCHED)
            .setTransform(325.1, 3.55, 1, 1, 0.319);
        var instance17 = new Graphic31(MovieClip.SYNCHED)
            .setTransform(400.25, 43.95, 1, 1, 0.667);
        var instance16 = new Graphic30(MovieClip.SYNCHED)
            .setTransform(458.6, 106.25, 1, 1, 0.986);
        var instance15 = new Graphic29(MovieClip.SYNCHED)
            .setTransform(492.75, 184.4, 1, 1, 1.335);
        var instance14 = new Graphic28(MovieClip.SYNCHED)
            .setTransform(500.25, 262.15, 1, 1, 0, 4.664, 1.619);
        var instance13 = new Graphic27(MovieClip.SYNCHED)
            .setTransform(482.05, 345.65, 1, 1, 0, 4.316, 1.967);
        var instance12 = new Graphic26(MovieClip.SYNCHED)
            .setTransform(436.95, 418.2, 1, 1, 0, 3.997, 2.286);
        var instance11 = new Graphic25(MovieClip.SYNCHED)
            .setTransform(371.4, 472.65, 1, 1, 0, 3.657, 2.627);
        var instance10 = new Graphic24(MovieClip.SYNCHED)
            .setTransform(292.1, 501.95, 1, 1, 0, 3.3, 2.983);
        var instance9 = new Graphic23(MovieClip.SYNCHED)
            .setTransform(206.4, 504.1, 1, 1, -2.989);
        var instance8 = new Graphic22(MovieClip.SYNCHED)
            .setTransform(124.95, 479.05, 1, 1, -2.671);
        var instance7 = new Graphic21(MovieClip.SYNCHED)
            .setTransform(56.9, 427.3, 1, 1, -2.322);
        var instance6 = new Graphic20(MovieClip.SYNCHED)
            .setTransform(7.9, 357.45, 1, 1, -2);
        var instance5 = new Graphic19(MovieClip.SYNCHED)
            .setTransform(-13.4, 274.1, 1, 1, -1.641);
        var instance4 = new Graphic18(MovieClip.SYNCHED)
            .setTransform(-8.5, 189.1, 1, 1, -1.37);
        var instance3 = new Graphic17(MovieClip.SYNCHED)
            .setTransform(23.75, 110.8, 1, 1, -1.019);
        var instance2 = new Graphic16(MovieClip.SYNCHED)
            .setTransform(81.8, 46.7, 1, 1, -0.661);
        var instance1 = new Graphic15(MovieClip.SYNCHED)
            .setTransform(156.2, 4.9, 1, 1, -0.364);
        this.addTimedChild(instance19)
            .addTimedChild(instance18)
            .addTimedChild(instance17)
            .addTimedChild(instance16)
            .addTimedChild(instance15)
            .addTimedChild(instance14)
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

    var Graphic35 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Graphic34(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 29, {
            "0": {
                x: 94.514,
                y: 69.247,
                sx: 0.664,
                sy: 0.664,
                r: 0.079,
                a: 1
            },
            "1": {
                x: 77.659,
                y: 31.295,
                sx: 0.781,
                sy: 0.781,
                r: 0.123
            },
            "2": {
                x: 63.66,
                y: -10.904,
                sx: 0.905,
                sy: 0.905,
                r: 0.171
            },
            "3": {
                x: 55.356,
                y: -48.466,
                sx: 1.009,
                sy: 1.009,
                r: 0.214
            },
            "4": {
                x: 50.788,
                y: -73.676,
                sx: 1.079,
                sy: 1.079,
                r: 0.241
            },
            "5": {
                x: 49.45,
                y: -86.3,
                sx: 1.112,
                sy: 1.112,
                r: 0.255
            },
            "6": {
                x: 57.594,
                y: -109.355,
                sx: 1.159,
                sy: 1.159,
                r: 0.302,
                a: 0.8
            },
            "7": {
                x: 68.101,
                y: -131.152,
                sx: 1.203,
                sy: 1.203,
                r: 0.349,
                a: 0.61
            },
            "8": {
                x: 77.826,
                y: -149.934,
                sx: 1.241,
                sy: 1.241,
                r: 0.389,
                a: 0.45
            },
            "9": {
                x: 87.486,
                y: -166.205,
                sx: 1.275,
                sy: 1.275,
                r: 0.424,
                a: 0.3
            },
            "10": {
                x: 95.402,
                y: -179.615,
                sx: 1.304,
                sy: 1.304,
                r: 0.451,
                a: 0.18
            },
            "11": {
                x: 103.865,
                y: -191.195,
                sx: 1.328,
                sy: 1.328,
                r: 0.477,
                a: 0.08
            },
            "12": {
                x: 110.9,
                y: -200.8,
                sx: 1.35,
                sy: 1.35,
                r: 0.498,
                a: 0
            }
        });
    });

    lib.emoji_camera_create = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 29,
            framerate: 30,
            loop: false
        });
        var instance2 = new Graphic35(MovieClip.SYNCHED)
            .setTransform(478.45, 227.85, 0.675, 0.675)
            .setColorTransform(0, 0.99, 0, 0.53, 0, 0.18);
        var instance1 = new Graphic14(MovieClip.SYNCHED)
            .setTransform(832.55, 541.95, 4.55, 4.55);
        this.addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    lib.emoji_camera_create.assets = {
        "emoji_camera_create_atlas_1": "images/emoji_camera_create_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.emoji_camera_create,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 29,
        library: lib
    };
}