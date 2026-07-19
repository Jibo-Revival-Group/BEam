(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 32, loop: false });
        var instance1 = new Sprite(fromFrame("tail1"))
            .setTransform(-66.6, -12.1);
        this.addTimedChild(instance1);
    });

    var Graphic2 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 27, loop: false });
        var instance1 = new Sprite(fromFrame("windshield1"));
        var instance2 = new Sprite(fromFrame("windshield2"));
        var instance3 = new Sprite(fromFrame("windshield3"));
        var instance4 = new Sprite(fromFrame("windshield4"));
        var instance5 = new Sprite(fromFrame("windshield5"));
        var instance6 = new Sprite(fromFrame("windshield6"));
        var instance7 = new Sprite(fromFrame("windshield57"));
        var instance8 = new Sprite(fromFrame("windshield58"));
        var instance9 = new Sprite(fromFrame("windshield59"));
        var instance10 = new Sprite(fromFrame("windshield60"));
        var instance11 = new Sprite(fromFrame("windshield61"));
        var instance12 = new Sprite(fromFrame("windshield62"))
            .setTransform(2.6, -12.55);
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    x: 2.6,
                    y: -12.55
                }
            })
            .addTimedChild(instance2, 1, 1, {
                "1": {
                    x: -2.9,
                    y: -17.3
                }
            })
            .addTimedChild(instance3, 2, 1, {
                "2": {
                    x: -8.3,
                    y: -19.7
                }
            })
            .addTimedChild(instance4, 3, 1, {
                "3": {
                    x: -12.35,
                    y: -20.4
                }
            })
            .addTimedChild(instance5, 4, 1, {
                "4": {
                    x: -16.95,
                    y: -20.5
                }
            })
            .addTimedChild(instance6, 5, 16, {
                "5": {
                    x: -20.5,
                    y: -20.5
                }
            })
            .addTimedChild(instance7, 21, 1, {
                "21": {
                    x: -20.5,
                    y: -20.5
                }
            })
            .addTimedChild(instance8, 22, 1, {
                "22": {
                    x: -16.95,
                    y: -20.5
                }
            })
            .addTimedChild(instance9, 23, 1, {
                "23": {
                    x: -12.35,
                    y: -20.4
                }
            })
            .addTimedChild(instance10, 24, 1, {
                "24": {
                    x: -8.3,
                    y: -19.7
                }
            })
            .addTimedChild(instance11, 25, 1, {
                "25": {
                    x: -2.9,
                    y: -17.3
                }
            })
            .addTimedChild(instance12, 26, 1);
    });

    var Graphic3 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("body1"))
            .setTransform(-180.95, -181.4);
        this.addTimedChild(instance1);
    });

    var Graphic4 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 33, loop: false });
        var instance1 = new Sprite(fromFrame("tail31"))
            .setTransform(-32.75, -60.1);
        this.addTimedChild(instance1);
    });

    var Graphic5 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 33, loop: false });
        var instance1 = new Sprite(fromFrame("tail21"))
            .setTransform(-60.15, -32.65);
        this.addTimedChild(instance1);
    });

    lib.plane_shadow = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("plane-shadow1"))
            .setTransform(-5.5);
        this.addChild(instance1);
    });

    var Graphic6 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new lib.plane_shadow()
            .setTransform(-77.25, -77.25)
            .setAlpha(0.15);
        this.addTimedChild(instance1);
    });

    var Graphic7 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("wing11"))
            .setTransform(-148.5, -67.4);
        this.addTimedChild(instance1);
    });

    var Graphic8 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("wing41"))
            .setTransform(-67.35, -148.5);
        this.addTimedChild(instance1);
    });

    var Graphic9 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Sprite(fromFrame("jet 31"))
            .setTransform(-34.15, -34.15);
        this.addTimedChild(instance1);
    });

    var Graphic10 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 29, loop: false });
        var instance1 = new Graphic9(MovieClip.SYNCHED)
            .setTransform(0.15, 0.15);
        this.addTimedChild(instance1);
    });

    var Graphic11 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 28, loop: false });
        var instance1 = new Sprite(fromFrame("jet 31"))
            .setTransform(-34.15, -34.15);
        this.addTimedChild(instance1);
    });

    var Graphic12 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 27, loop: false });
        var instance1 = new Sprite(fromFrame("jet 31"))
            .setTransform(-34.15, -34.15);
        this.addTimedChild(instance1);
    });

    var Graphic13 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 27, loop: false });
        var instance1 = new Graphic12(MovieClip.SYNCHED)
            .setTransform(0.15, 0.15);
        this.addTimedChild(instance1);
    });

    var Graphic14 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("jet 31"))
            .setTransform(-34.15, -34.15);
        this.addTimedChild(instance1);
    });

    var Graphic15 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic14(MovieClip.SYNCHED)
            .setTransform(0.15, 0.15);
        this.addTimedChild(instance1);
    });

    var Graphic16 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance12 = new Graphic15(MovieClip.SYNCHED);
        var instance10 = new Graphic13(MovieClip.SYNCHED);
        var instance9 = new Graphic11(MovieClip.SYNCHED);
        var instance8 = new Graphic10(MovieClip.SYNCHED);
        var instance4 = new Graphic8(MovieClip.SYNCHED);
        var instance3 = new Graphic7(MovieClip.SYNCHED);
        var instance2 = new Graphic6(MovieClip.SYNCHED);
        var instance6 = new Graphic5(MovieClip.SYNCHED);
        var instance5 = new Graphic4(MovieClip.SYNCHED);
        var instance1 = new Graphic3(MovieClip.SYNCHED);
        var instance11 = new Graphic2(MovieClip.SYNCHED);
        var instance7 = new Graphic1(MovieClip.SYNCHED);
        this.addTimedChild(instance12, 14, 25, {
                "14": {
                    x: -45.8,
                    y: -94.65,
                    sx: 0.983,
                    sy: 0.709,
                    kx: 0.244,
                    ky: -0.129
                },
                "15": {
                    x: -40.911,
                    y: -99.27,
                    sx: 0.987,
                    sy: 0.786,
                    kx: 0.179,
                    ky: -0.092
                },
                "16": {
                    x: -36.74,
                    y: -103.172,
                    sx: 0.991,
                    sy: 0.851,
                    kx: 0.123,
                    ky: -0.066
                },
                "17": {
                    x: -33.367,
                    y: -106.461,
                    sx: 0.994,
                    sy: 0.905,
                    kx: 0.079,
                    ky: -0.04
                },
                "18": {
                    x: -30.73,
                    y: -108.91,
                    sx: 0.997,
                    sy: 0.946,
                    kx: 0.044,
                    ky: -0.022
                },
                "19": {
                    x: -28.891,
                    y: -110.714,
                    sx: 0.999,
                    sy: 0.976,
                    kx: 0.018,
                    ky: -0.009
                },
                "20": {
                    x: -27.754,
                    y: -111.8,
                    sx: 1,
                    sy: 0.994,
                    kx: 0.005,
                    ky: -0.001
                },
                "21": {
                    x: -27.6,
                    y: -112.35,
                    sy: 1,
                    kx: 0,
                    ky: 0
                },
                "36": {
                    x: -30.113,
                    y: -109.304,
                    sx: 0.998,
                    sy: 0.968,
                    kx: 0.026,
                    ky: -0.013
                },
                "37": {
                    x: -37.602,
                    y: -100.101,
                    sx: 0.992,
                    sy: 0.871,
                    kx: 0.106,
                    ky: -0.057
                },
                "38": {
                    x: -49.8,
                    y: -84.65,
                    sx: 0.983,
                    sy: 0.709,
                    kx: 0.244,
                    ky: -0.129
                }
            })
            .addTimedChild(instance10, 12, 27, {
                "12": {
                    x: -109.2,
                    y: -117.5,
                    sx: 0.952,
                    sy: 0.662,
                    kx: 0.584,
                    ky: -0.061
                },
                "13": {
                    x: -107.259,
                    y: -119.865,
                    sx: 0.965,
                    sy: 0.751,
                    kx: 0.429,
                    ky: -0.044
                },
                "14": {
                    x: -105.629,
                    y: -121.949,
                    sx: 0.976,
                    sy: 0.827,
                    kx: 0.297,
                    ky: -0.031
                },
                "15": {
                    x: -104.33,
                    y: -123.666,
                    sx: 0.984,
                    sy: 0.889,
                    kx: 0.189,
                    ky: -0.018
                },
                "16": {
                    x: -103.264,
                    y: -124.982,
                    sx: 0.991,
                    sy: 0.938,
                    kx: 0.105,
                    ky: -0.009
                },
                "17": {
                    x: -102.584,
                    y: -125.875,
                    sx: 0.996,
                    sy: 0.972,
                    kx: 0.045,
                    ky: -0.005
                },
                "18": {
                    x: -102.145,
                    y: -126.447,
                    sx: 0.999,
                    sy: 0.993,
                    kx: 0.01,
                    ky: 0
                },
                "19": {
                    x: -102.25,
                    y: -127.35,
                    sx: 1,
                    sy: 1,
                    kx: 0
                },
                "36": {
                    x: -99.756,
                    y: -124.057,
                    sx: 0.995,
                    sy: 0.962,
                    kx: 0.062,
                    ky: -0.005
                },
                "37": {
                    x: -92.255,
                    y: -114.228,
                    sx: 0.979,
                    sy: 0.849,
                    kx: 0.258,
                    ky: -0.026
                },
                "38": {
                    x: -79.2,
                    y: -97.5,
                    sx: 0.952,
                    sy: 0.662,
                    kx: 0.584,
                    ky: -0.061
                }
            })
            .addTimedChild(instance9, 11, 28, {
                "11": {
                    x: 91.05,
                    y: 44.6,
                    sy: 0.802,
                    kx: 0.135
                },
                "12": {
                    x: 96.721,
                    y: 40.119,
                    sy: 0.854,
                    kx: 0.097
                },
                "13": {
                    x: 101.529,
                    y: 36.23,
                    sy: 0.899,
                    kx: 0.066
                },
                "14": {
                    x: 105.43,
                    y: 33.135,
                    sy: 0.935,
                    kx: 0.044
                },
                "15": {
                    x: 108.505,
                    y: 30.662,
                    sy: 0.964,
                    kx: 0.023
                },
                "16": {
                    x: 110.648,
                    y: 28.96,
                    sy: 0.984,
                    kx: 0.009
                },
                "17": {
                    x: 111.922,
                    y: 27.944,
                    sy: 0.996,
                    kx: 0.001
                },
                "18": {
                    x: 112.45,
                    y: 27.7,
                    sy: 1,
                    kx: 0
                },
                "36": {
                    x: 109.567,
                    y: 28.337,
                    sy: 0.978,
                    kx: 0.014
                },
                "37": {
                    x: 100.753,
                    y: 30.366,
                    sy: 0.912,
                    kx: 0.058
                },
                "38": {
                    x: 86.05,
                    y: 33.6,
                    sy: 0.802,
                    kx: 0.135
                }
            })
            .addTimedChild(instance8, 10, 29, {
                "10": {
                    x: 113.35,
                    y: 114.05,
                    sy: 0.717,
                    kx: 0.464
                },
                "11": {
                    x: 117.046,
                    y: 110.94,
                    sy: 0.791,
                    kx: 0.341
                },
                "12": {
                    x: 120.212,
                    y: 108.284,
                    sy: 0.855,
                    kx: 0.236
                },
                "13": {
                    x: 122.778,
                    y: 106.077,
                    sy: 0.907,
                    kx: 0.149
                },
                "14": {
                    x: 124.801,
                    y: 104.443,
                    sy: 0.948,
                    kx: 0.084
                },
                "15": {
                    x: 126.185,
                    y: 103.228,
                    sy: 0.977,
                    kx: 0.036
                },
                "16": {
                    x: 127.018,
                    y: 102.523,
                    sy: 0.994,
                    kx: 0.009
                },
                "17": {
                    x: 127.45,
                    y: 102.35,
                    sy: 1,
                    kx: 0
                },
                "36": {
                    x: 123.445,
                    y: 97.75,
                    sy: 0.968,
                    kx: 0.049
                },
                "37": {
                    x: 111.452,
                    y: 83.999,
                    sy: 0.874,
                    kx: 0.206
                },
                "38": {
                    x: 91.35,
                    y: 61.05,
                    sy: 0.717,
                    kx: 0.464
                }
            })
            .addTimedChild(instance4, 6, 35, {
                "6": {
                    x: 45.8,
                    y: -22.95,
                    sx: 0.866,
                    sy: 0.327,
                    kx: -0.329
                },
                "7": {
                    x: 51.688,
                    y: -7.606,
                    sx: 0.886,
                    sy: 0.438,
                    kx: -0.275
                },
                "8": {
                    x: 60.357,
                    y: 14.608,
                    sx: 0.915,
                    sy: 0.598,
                    kx: -0.197
                },
                "9": {
                    x: 71.538,
                    y: 43.908,
                    sx: 0.953,
                    sy: 0.81,
                    kx: -0.092
                },
                "10": {
                    x: 85.65,
                    y: 80,
                    sx: 1,
                    sy: 1.071,
                    kx: 0.032
                },
                "11": {
                    x: 84.143,
                    y: 76.84,
                    sy: 1.049,
                    kx: 0.022
                },
                "12": {
                    x: 82.805,
                    y: 74.175,
                    sy: 1.032,
                    kx: 0.013
                },
                "13": {
                    x: 81.823,
                    y: 72.15,
                    sy: 1.018,
                    kx: 0.005
                },
                "14": {
                    x: 81.09,
                    y: 70.662,
                    sy: 1.008,
                    kx: 0.001
                },
                "15": {
                    x: 80.689,
                    y: 69.821,
                    sy: 1.002,
                    kx: 0
                },
                "16": {
                    x: 80.6,
                    y: 69.6,
                    sy: 1
                },
                "36": {
                    x: 79.232,
                    y: 65.868,
                    sx: 0.995,
                    sy: 0.973,
                    kx: -0.013
                },
                "37": {
                    x: 75.021,
                    y: 54.813,
                    sx: 0.979,
                    sy: 0.892,
                    kx: -0.052
                },
                "38": {
                    x: 68.165,
                    y: 36.307,
                    sx: 0.952,
                    sy: 0.758,
                    kx: -0.118
                },
                "39": {
                    x: 58.405,
                    y: 10.339,
                    sx: 0.915,
                    sy: 0.569,
                    kx: -0.21
                },
                "40": {
                    x: 45.8,
                    y: -22.95,
                    sx: 0.866,
                    sy: 0.327,
                    kx: -0.329
                }
            })
            .addTimedChild(instance3, 6, 35, {
                "6": {
                    x: 11.9,
                    y: -36.65,
                    sx: 0.288,
                    kx: -0.008,
                    ky: -0.352
                },
                "7": {
                    x: -2.296,
                    y: -43.566,
                    sx: 0.408,
                    kx: -0.005,
                    ky: -0.297
                },
                "8": {
                    x: -23.206,
                    y: -53.833,
                    sx: 0.585,
                    ky: -0.214
                },
                "9": {
                    x: -50.754,
                    y: -67.294,
                    sx: 0.818,
                    kx: -0.001,
                    ky: -0.106
                },
                "10": {
                    x: -84.5,
                    y: -84.45,
                    sx: 1.108,
                    kx: 0,
                    ky: 0.024
                },
                "11": {
                    x: -79.895,
                    y: -83.247,
                    sx: 1.075,
                    ky: 0.014
                },
                "12": {
                    x: -76.19,
                    y: -82.235,
                    sx: 1.048,
                    ky: 0.009
                },
                "13": {
                    x: -73.241,
                    y: -81.471,
                    sx: 1.027,
                    ky: 0.005
                },
                "14": {
                    x: -71.146,
                    y: -80.948,
                    sx: 1.012,
                    ky: 0.001
                },
                "15": {
                    x: -69.861,
                    y: -80.609,
                    sx: 1.003,
                    ky: 0
                },
                "16": {
                    x: -69.55,
                    y: -80.5,
                    sx: 1
                },
                "36": {
                    x: -66.303,
                    y: -78.749,
                    sx: 0.971,
                    ky: -0.013
                },
                "37": {
                    x: -56.5,
                    y: -73.562,
                    sx: 0.886,
                    ky: -0.053
                },
                "38": {
                    x: -40.223,
                    y: -64.869,
                    sx: 0.743,
                    kx: -0.001,
                    ky: -0.127
                },
                "39": {
                    x: -17.311,
                    y: -52.718,
                    sx: 0.544,
                    kx: -0.005,
                    ky: -0.223
                },
                "40": {
                    x: 11.9,
                    y: -36.65,
                    sx: 0.288,
                    kx: -0.008,
                    ky: -0.352
                }
            })
            .addTimedChild(instance2, 6, 41, {
                "6": {
                    x: 45.15,
                    y: -45.1
                }
            })
            .addTimedChild(instance6, 8, 33, {
                "8": {
                    x: -114.85,
                    y: 105.15,
                    sx: 0.458,
                    sy: 0.873,
                    ky: -0.682
                },
                "9": {
                    x: -121.638,
                    y: 101.671,
                    sx: 0.555,
                    sy: 0.892,
                    ky: -0.577
                },
                "10": {
                    x: -131.473,
                    y: 96.705,
                    sx: 0.696,
                    sy: 0.92,
                    ky: -0.424
                },
                "11": {
                    x: -144.232,
                    y: 90.24,
                    sx: 0.88,
                    sy: 0.956,
                    ky: -0.224
                },
                "12": {
                    x: -160.1,
                    y: 82.5,
                    sx: 1.108,
                    sy: 1,
                    ky: 0.019
                },
                "13": {
                    x: -158.131,
                    y: 82.83,
                    sx: 1.075,
                    ky: 0.01
                },
                "14": {
                    x: -156.53,
                    y: 83.141,
                    sx: 1.048,
                    ky: 0.005
                },
                "15": {
                    x: -155.239,
                    y: 83.393,
                    sx: 1.027,
                    ky: 0.004
                },
                "16": {
                    x: -154.319,
                    y: 83.577,
                    sx: 1.012,
                    ky: 0.001
                },
                "17": {
                    x: -153.817,
                    y: 83.633,
                    sx: 1.003,
                    ky: 0
                },
                "18": {
                    x: -153.65,
                    y: 83.7,
                    sx: 1
                },
                "36": {
                    x: -152.103,
                    y: 84.549,
                    sx: 0.978,
                    sy: 0.995,
                    ky: -0.026
                },
                "37": {
                    x: -147.494,
                    y: 87.168,
                    sx: 0.913,
                    sy: 0.98,
                    ky: -0.106
                },
                "38": {
                    x: -139.741,
                    y: 91.521,
                    sx: 0.804,
                    sy: 0.954,
                    ky: -0.245
                },
                "39": {
                    x: -128.801,
                    y: 97.506,
                    sx: 0.652,
                    sy: 0.919,
                    ky: -0.434
                },
                "40": {
                    x: -114.85,
                    y: 105.15,
                    sx: 0.458,
                    sy: 0.873,
                    ky: -0.682
                }
            })
            .addTimedChild(instance5, 8, 33, {
                "8": {
                    x: -100.85,
                    y: 112.95,
                    sx: 0.879,
                    sy: 0.392,
                    kx: -0.604
                },
                "9": {
                    x: -97.958,
                    y: 119.802,
                    sx: 0.897,
                    sy: 0.495,
                    kx: -0.507
                },
                "10": {
                    x: -93.709,
                    y: 129.721,
                    sx: 0.923,
                    sy: 0.645,
                    kx: -0.368
                },
                "11": {
                    x: -88.238,
                    y: 142.608,
                    sx: 0.958,
                    sy: 0.841,
                    kx: -0.189
                },
                "12": {
                    x: -81.65,
                    y: 158.65,
                    sx: 1,
                    sy: 1.084,
                    kx: 0.031
                },
                "13": {
                    x: -82.267,
                    y: 157.196,
                    sy: 1.058,
                    kx: 0.018
                },
                "14": {
                    x: -82.761,
                    y: 155.896,
                    sy: 1.037,
                    kx: 0.013
                },
                "15": {
                    x: -83.146,
                    y: 154.981,
                    sy: 1.021,
                    kx: 0.005
                },
                "16": {
                    x: -83.445,
                    y: 154.279,
                    sy: 1.009,
                    kx: 0.001
                },
                "17": {
                    x: -83.589,
                    y: 153.86,
                    sy: 1.002,
                    kx: 0
                },
                "18": {
                    x: -83.6,
                    y: 153.7,
                    sy: 1
                },
                "36": {
                    x: -84.303,
                    y: 152.06,
                    sx: 0.995,
                    sy: 0.976,
                    kx: -0.022
                },
                "37": {
                    x: -86.446,
                    y: 147.205,
                    sx: 0.981,
                    sy: 0.902,
                    kx: -0.096
                },
                "38": {
                    x: -89.822,
                    y: 139.048,
                    sx: 0.956,
                    sy: 0.78,
                    kx: -0.215
                },
                "39": {
                    x: -94.769,
                    y: 127.633,
                    sx: 0.922,
                    sy: 0.61,
                    kx: -0.385
                },
                "40": {
                    x: -100.85,
                    y: 112.95,
                    sx: 0.879,
                    sy: 0.392,
                    kx: -0.604
                }
            })
            .addTimedChild(instance1, 0, 47, {
                "0": {
                    x: -10.8,
                    y: 117.3,
                    sx: 1.014,
                    sy: 1.006,
                    kx: -0.702,
                    ky: 0.503,
                    r: 0
                },
                "1": {
                    x: 12.726,
                    y: 16.897,
                    sx: 1.005,
                    sy: 1.002,
                    kx: -0.262,
                    ky: 0.18
                },
                "2": {
                    x: 20.794,
                    y: -17.462,
                    sx: 1.003,
                    sy: 1.001,
                    kx: -0.11,
                    ky: 0.07
                },
                "3": {
                    x: 25.042,
                    y: -35.636,
                    sx: 1.001,
                    sy: 1,
                    kx: -0.031,
                    ky: 0.013
                },
                "4": {
                    x: 27.334,
                    y: -45.435,
                    sx: 1,
                    kx: 0.009,
                    ky: -0.014
                },
                "5": {
                    x: 28.405,
                    y: -49.927,
                    kx: 0.027,
                    ky: -0.031
                },
                "6": {
                    x: 28.7,
                    y: -50.9,
                    kx: 0,
                    ky: 0,
                    r: -0.035
                },
                "7": {
                    x: 28.667,
                    y: -50.899,
                    r: -0.032
                },
                "8": {
                    x: 28.824,
                    y: -50.645,
                    r: -0.031
                },
                "9": {
                    x: 29.089,
                    y: -50.136
                },
                "10": {
                    x: 29.613,
                    y: -49.373
                },
                "11": {
                    x: 30.319,
                    y: -48.107,
                    r: -0.027
                },
                "12": {
                    x: 31.445,
                    y: -46.177,
                    r: -0.022
                },
                "13": {
                    x: 33.111,
                    y: -43.383,
                    r: -0.014
                },
                "14": {
                    x: 34.866,
                    y: -40.483,
                    r: -0.009
                },
                "15": {
                    x: 36.056,
                    y: -38.448,
                    r: -0.001
                },
                "16": {
                    x: 36.69,
                    y: -37.378,
                    r: 0
                },
                "17": {
                    x: 37.006,
                    y: -36.869
                },
                "18": {
                    x: 37.15,
                    y: -36.7
                }
            })
            .addTimedChild(instance11, 14, 27, {
                "14": {
                    x: 165.35,
                    y: -165.2
                }
            })
            .addTimedChild(instance7, 9, 32, {
                "9": {
                    x: -78.45,
                    y: 78.05,
                    sx: 0.045,
                    r: -0.785
                },
                "10": {
                    x: -85.151,
                    y: 84.751,
                    sx: 0.187
                },
                "11": {
                    x: -95.898,
                    y: 95.498,
                    sx: 0.414
                },
                "12": {
                    x: -110.684,
                    y: 110.284,
                    sx: 0.727
                },
                "13": {
                    x: -129.3,
                    y: 128.9,
                    sx: 1.125
                },
                "14": {
                    x: -127.201,
                    y: 126.801,
                    sx: 1.08
                },
                "15": {
                    x: -125.548,
                    y: 125.148,
                    sx: 1.045
                },
                "16": {
                    x: -124.437,
                    y: 124.037,
                    sx: 1.02
                },
                "17": {
                    x: -123.72,
                    y: 123.32,
                    sx: 1.005
                },
                "18": {
                    x: -123.5,
                    y: 123.1,
                    sx: 1
                },
                "36": {
                    x: -121.685,
                    y: 121.285,
                    sx: 0.962
                },
                "37": {
                    x: -116.298,
                    y: 115.898,
                    sx: 0.847
                },
                "38": {
                    x: -107.239,
                    y: 106.839,
                    sx: 0.656
                },
                "39": {
                    x: -94.658,
                    y: 94.258,
                    sx: 0.389
                },
                "40": {
                    x: -78.45,
                    y: 78.05,
                    sx: 0.045
                }
            });
    });

    var Graphic17 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic16(MovieClip.SYNCHED)
            .setTransform(218.05, 218.1);
        this.addTimedChild(instance1);
    });

    var Graphic18 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic19 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic18(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic20 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic21 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic20(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic22 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic23 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic22(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic24 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic25 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic24(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic26 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic27 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic26(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic28 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic29 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic28(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic30 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic31 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic30(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic32 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic33 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic32(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic34 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic35 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic34(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic36 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic37 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic36(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic38 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic39 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic38(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic40 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-4.2, -6.5);
        this.addTimedChild(instance1);
    });

    var Graphic41 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance1 = new Graphic40(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 25, {
            "0": {
                y: 226.2,
                sy: 0.512,
                a: 1
            },
            "1": {
                y: 212.816,
                sy: 0.526
            },
            "2": {
                y: 173.916,
                sy: 0.566
            },
            "3": {
                y: 117.154,
                sy: 0.625
            },
            "4": {
                y: 58.479,
                sy: 0.685
            },
            "5": {
                y: 15.46,
                sy: 0.73
            },
            "6": {
                y: -1.25,
                sy: 0.747
            },
            "7": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "8": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "9": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "10": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "11": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "12": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "13": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "14": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "15": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic42 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 25, loop: false });
        var instance12 = new Graphic41(MovieClip.SYNCHED)
            .setTransform(-1.45, -226.15, 0.735, 0.735);
        var instance11 = new Graphic39(MovieClip.SYNCHED)
            .setTransform(125.15, -192.05, 0.735, 0.735, 0.61);
        var instance10 = new Graphic37(MovieClip.SYNCHED)
            .setTransform(-129.75, -188.05, 0.735, 0.735, 0, 0.636, 2.506);
        var instance9 = new Graphic35(MovieClip.SYNCHED)
            .setTransform(1, 217.15, 0.735, 0.735, 0, 3.142, 3.142);
        var instance8 = new Graphic33(MovieClip.SYNCHED)
            .setTransform(-120, 185.1, 0.735, 0.735, -2.575);
        var instance7 = new Graphic31(MovieClip.SYNCHED)
            .setTransform(132.4, 180.15, 0.735, 0.735, 0, 3.781, -0.64);
        var instance6 = new Graphic29(MovieClip.SYNCHED)
            .setTransform(222.4, -10, 0.735, 0.735, 0, 4.712, 1.571);
        var instance5 = new Graphic27(MovieClip.SYNCHED)
            .setTransform(191.4, 109.95, 0.735, 0.735, 0, 4.146, 2.137);
        var instance4 = new Graphic25(MovieClip.SYNCHED)
            .setTransform(193.2, -126.7, 0.735, 0.735, 0, -1.004, -2.137);
        var instance3 = new Graphic23(MovieClip.SYNCHED)
            .setTransform(-222.4, -10, 0.735, 0.735, 0, 1.571, 1.571);
        var instance2 = new Graphic21(MovieClip.SYNCHED)
            .setTransform(-195.45, 113.95, 0.735, 0.735, 0, 2.137, 1.004);
        var instance1 = new Graphic19(MovieClip.SYNCHED)
            .setTransform(-191.2, -123.7, 0.735, 0.735, -1.004);
        this.addTimedChild(instance12)
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

    lib.emoji_airplane = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 48,
            framerate: 30
        });
        var instance2 = new Graphic42(MovieClip.SYNCHED);
        var instance1 = new Graphic17(MovieClip.SYNCHED);
        this.addTimedChild(instance2, 9, 25, {
                "9": {
                    x: 640.15,
                    y: 362.75,
                    sx: 1.274,
                    sy: 1.274,
                    c: [
                        0,
                        0.96,
                        0,
                        0.71,
                        0,
                        0.16
                    ]
                }
            })
            .addTimedChild(instance1, 0, 47, {
                "0": {
                    x: 422.1,
                    y: 142.95,
                    sx: 1,
                    sy: 1,
                    r: 0
                },
                "37": {
                    x: 422.278,
                    y: 143.739,
                    r: 0.001
                },
                "38": {
                    x: 425.064,
                    y: 144.126,
                    r: 0.013
                },
                "39": {
                    x: 428.973,
                    y: 145.757,
                    r: 0.031
                },
                "40": {
                    x: 435.048,
                    y: 148.314,
                    r: 0.057
                },
                "41": {
                    x: 443.53,
                    y: 152.386,
                    r: 0.092
                },
                "42": {
                    x: 456.241,
                    y: 157.569,
                    r: 0.144
                },
                "43": {
                    x: 473.14,
                    y: 166.008,
                    sx: 0.999,
                    sy: 0.999,
                    r: 0.21
                },
                "44": {
                    x: 496.656,
                    y: 179.078,
                    r: 0.298
                },
                "45": {
                    x: 531.23,
                    y: 200.054,
                    r: 0.42
                },
                "46": {
                    x: 584.2,
                    y: 238.05,
                    sx: 1,
                    sy: 1,
                    r: 0.597
                }
            });
    });

    lib.emoji_airplane.assets = {
        "emoji_airplane_atlas_1": "images/emoji_airplane_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.emoji_airplane,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 48,
        library: lib
    };
}