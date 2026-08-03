(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 51, loop: false });
        var instance1 = new Sprite(fromFrame("fingerscrossed-finger1"));
        var instance2 = new Sprite(fromFrame("fingerscrossed-finger3"));
        var instance3 = new Sprite(fromFrame("fingerscrossed-finger5"));
        var instance4 = new Sprite(fromFrame("fingerscrossed-finger7"));
        var instance5 = new Sprite(fromFrame("fingerscrossed-finger8"));
        var instance6 = new Sprite(fromFrame("fingerscrossed-finger10"));
        var instance7 = new Sprite(fromFrame("fingerscrossed-finger12"))
            .setTransform(-129, -136.35);
        this.addTimedChild(instance1, 0, 11, {
                "0": {
                    x: -129.15,
                    y: -169.85
                }
            })
            .addTimedChild(instance2, 11, 2, {
                "11": {
                    x: -136.5,
                    y: -169.55
                }
            })
            .addTimedChild(instance3, 13, 2, {
                "13": {
                    x: -127.6,
                    y: -175.2
                }
            })
            .addTimedChild(instance4, 15, 1, {
                "15": {
                    x: -129.25,
                    y: -142.5
                }
            })
            .addTimedChild(instance5, 16, 2, {
                "16": {
                    x: -129.25,
                    y: -132.25
                }
            })
            .addTimedChild(instance6, 18, 2, {
                "18": {
                    x: -129.05,
                    y: -135.25
                }
            })
            .addTimedChild(instance7, 20, 31);
    });

    var Graphic2 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 37, loop: false });
        var instance1 = new Sprite(fromFrame("fingerscrossed-shadow1"))
            .setTransform(-29.1, -36.5);
        this.addTimedChild(instance1);
    });

    var Graphic3 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 51, loop: false });
        var instance1 = new Sprite(fromFrame("fingerscrossed-hand1"))
            .setTransform(-164.4, -100.1);
        this.addTimedChild(instance1);
    });

    var Graphic4 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 51, loop: false });
        var instance1 = new Sprite(fromFrame("fingerscrossed-finger21"));
        var instance2 = new Sprite(fromFrame("fingerscrossed-finger23"));
        var instance3 = new Sprite(fromFrame("fingerscrossed-finger25"));
        var instance4 = new Sprite(fromFrame("fingerscrossed-finger27"));
        var instance5 = new Sprite(fromFrame("fingerscrossed-finger28"));
        var instance6 = new Sprite(fromFrame("fingerscrossed-finger210"));
        var instance7 = new Sprite(fromFrame("fingerscrossed-finger212"))
            .setTransform(-61.4, -295.6);
        this.addTimedChild(instance1, 0, 11, {
                "0": {
                    x: -41.25,
                    y: -295.6
                }
            })
            .addTimedChild(instance2, 11, 2, {
                "11": {
                    x: -41.3,
                    y: -295.45
                }
            })
            .addTimedChild(instance3, 13, 2, {
                "13": {
                    x: -49.4,
                    y: -296.7
                }
            })
            .addTimedChild(instance4, 15, 1, {
                "15": {
                    x: -62.85,
                    y: -296.7
                }
            })
            .addTimedChild(instance5, 16, 2, {
                "16": {
                    x: -67.45,
                    y: -296.25
                }
            })
            .addTimedChild(instance6, 18, 2, {
                "18": {
                    x: -63.5,
                    y: -295.45
                }
            })
            .addTimedChild(instance7, 20, 31);
    });

    var Graphic5 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 51, loop: false });
        var instance3 = new Graphic4(MovieClip.SYNCHED);
        var instance2 = new Graphic3(MovieClip.SYNCHED);
        var instance4 = new Graphic2(MovieClip.SYNCHED);
        var instance1 = new Graphic1(MovieClip.SYNCHED);
        this.addTimedChild(instance3, 0, 51, {
                "0": {
                    y: 279.5,
                    sx: 1,
                    sy: 0.092,
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
                    y: 253.02,
                    sx: 0.998,
                    sy: 0.178,
                    c: [
                        0.09,
                        0.9,
                        0.09,
                        0.9,
                        0.09,
                        0.9
                    ]
                },
                "2": {
                    y: 165.821,
                    sx: 0.993,
                    sy: 0.461,
                    c: [
                        0.4,
                        0.6,
                        0.4,
                        0.6,
                        0.4,
                        0.6
                    ]
                },
                "3": {
                    y: 47.603,
                    sx: 0.985,
                    sy: 0.846,
                    c: [
                        0.82,
                        0.18,
                        0.82,
                        0.18,
                        0.82,
                        0.18
                    ]
                },
                "4": {
                    y: -4.5,
                    sx: 0.982,
                    sy: 1.015,
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
                    y: -4.246,
                    sx: 0.983,
                    sy: 1.014
                },
                "6": {
                    y: -3.333,
                    sx: 0.986,
                    sy: 1.011
                },
                "7": {
                    y: -1.911,
                    sx: 0.992,
                    sy: 1.007
                },
                "8": {
                    y: -0.54,
                    sx: 0.998,
                    sy: 1.002
                },
                "9": {
                    y: 0,
                    sx: 1,
                    sy: 1
                },
                "42": {
                    y: -0.3,
                    sx: 0.998,
                    sy: 1.001
                },
                "43": {
                    y: -1.4,
                    sx: 0.989,
                    sy: 1.005
                },
                "44": {
                    y: -3.15,
                    sx: 0.976,
                    sy: 1.011
                },
                "45": {
                    y: -4.85,
                    sx: 0.962,
                    sy: 1.016
                },
                "46": {
                    y: -5.5,
                    sx: 0.957,
                    sy: 1.019
                },
                "47": {
                    y: 22.025,
                    sx: 0.961,
                    sy: 0.931,
                    c: [
                        0.91,
                        0.09,
                        0.91,
                        0.09,
                        0.91,
                        0.09
                    ]
                },
                "48": {
                    y: 112.386,
                    sx: 0.974,
                    sy: 0.642,
                    c: [
                        0.6,
                        0.4,
                        0.6,
                        0.4,
                        0.6,
                        0.4
                    ]
                },
                "49": {
                    y: 235.003,
                    sx: 0.992,
                    sy: 0.249,
                    c: [
                        0.18,
                        0.81,
                        0.18,
                        0.81,
                        0.18,
                        0.81
                    ]
                },
                "50": {
                    y: 289,
                    sx: 1,
                    sy: 0.077,
                    c: [
                        0,
                        0.99,
                        0,
                        0.99,
                        0,
                        0.99
                    ]
                }
            })
            .addTimedChild(instance2, 0, 51, {
                "0": {
                    y: 258.5,
                    sx: 1,
                    sy: 0.092,
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
                    y: 233.965,
                    sx: 0.998,
                    sy: 0.178,
                    c: [
                        0.09,
                        0.9,
                        0.09,
                        0.9,
                        0.09,
                        0.9
                    ]
                },
                "2": {
                    y: 153.204,
                    sx: 0.993,
                    sy: 0.461,
                    c: [
                        0.4,
                        0.6,
                        0.4,
                        0.6,
                        0.4,
                        0.6
                    ]
                },
                "3": {
                    y: 43.75,
                    sx: 0.985,
                    sy: 0.846,
                    c: [
                        0.82,
                        0.18,
                        0.82,
                        0.18,
                        0.82,
                        0.18
                    ]
                },
                "4": {
                    y: -4.5,
                    sx: 0.982,
                    sy: 1.015,
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
                    y: -4.246,
                    sx: 0.983,
                    sy: 1.014
                },
                "6": {
                    y: -3.333,
                    sx: 0.986,
                    sy: 1.011
                },
                "7": {
                    y: -1.911,
                    sx: 0.992,
                    sy: 1.007
                },
                "8": {
                    y: -0.54,
                    sx: 0.998,
                    sy: 1.002
                },
                "9": {
                    y: 0,
                    sx: 1,
                    sy: 1
                },
                "42": {
                    y: -0.3,
                    sx: 0.998,
                    sy: 1.001
                },
                "43": {
                    y: -1.4,
                    sx: 0.989,
                    sy: 1.005
                },
                "44": {
                    y: -3.15,
                    sx: 0.976,
                    sy: 1.011
                },
                "45": {
                    y: -4.85,
                    sx: 0.962,
                    sy: 1.016
                },
                "46": {
                    y: -5.5,
                    sx: 0.957,
                    sy: 1.019
                },
                "47": {
                    y: 20.525,
                    sx: 0.961,
                    sy: 0.931,
                    c: [
                        0.91,
                        0.09,
                        0.91,
                        0.09,
                        0.91,
                        0.09
                    ]
                },
                "48": {
                    y: 105.986,
                    sx: 0.974,
                    sy: 0.642,
                    c: [
                        0.6,
                        0.4,
                        0.6,
                        0.4,
                        0.6,
                        0.4
                    ]
                },
                "49": {
                    y: 221.903,
                    sx: 0.992,
                    sy: 0.249,
                    c: [
                        0.18,
                        0.81,
                        0.18,
                        0.81,
                        0.18,
                        0.81
                    ]
                },
                "50": {
                    y: 273,
                    sx: 1,
                    sy: 0.077,
                    c: [
                        0,
                        0.99,
                        0,
                        0.99,
                        0,
                        0.99
                    ]
                }
            })
            .addTimedChild(instance4, 14, 37, {
                "14": {
                    x: -0.85,
                    y: -71.05,
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
                "15": {
                    a: 0.2
                },
                "16": {
                    a: 0.4
                },
                "17": {
                    a: 0.6
                },
                "18": {
                    a: 0.8
                },
                "19": {
                    a: 1
                },
                "42": {
                    x: -0.848,
                    y: -71.427,
                    sx: 0.998,
                    sy: 1.001
                },
                "43": {
                    x: -0.841,
                    y: -72.733,
                    sx: 0.989,
                    sy: 1.005
                },
                "44": {
                    x: -0.779,
                    y: -74.955,
                    sx: 0.976,
                    sy: 1.011
                },
                "45": {
                    x: -0.818,
                    y: -77.065,
                    sx: 0.962,
                    sy: 1.016
                },
                "46": {
                    x: -0.8,
                    y: -77.85,
                    sx: 0.957,
                    sy: 1.019
                },
                "47": {
                    x: -0.803,
                    y: -45.58,
                    sx: 0.961,
                    sy: 0.931,
                    c: [
                        0.91,
                        0.09,
                        0.91,
                        0.09,
                        0.91,
                        0.09
                    ]
                },
                "48": {
                    x: -0.764,
                    y: 60.47,
                    sx: 0.974,
                    sy: 0.642,
                    c: [
                        0.6,
                        0.4,
                        0.6,
                        0.4,
                        0.6,
                        0.4
                    ]
                },
                "49": {
                    x: -0.829,
                    y: 204.238,
                    sx: 0.992,
                    sy: 0.249,
                    c: [
                        0.18,
                        0.81,
                        0.18,
                        0.81,
                        0.18,
                        0.81
                    ]
                },
                "50": {
                    x: -0.85,
                    y: 267.55,
                    sx: 1,
                    sy: 0.077,
                    c: [
                        0,
                        0.99,
                        0,
                        0.99,
                        0,
                        0.99
                    ]
                }
            })
            .addTimedChild(instance1, 0, 51, {
                "0": {
                    x: -18.95,
                    y: 261.25,
                    sx: 1,
                    sy: 0.092,
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
                    x: -18.918,
                    y: 224.795,
                    sx: 0.998,
                    sy: 0.178,
                    c: [
                        0.09,
                        0.9,
                        0.09,
                        0.9,
                        0.09,
                        0.9
                    ]
                },
                "2": {
                    x: -18.811,
                    y: 104.972,
                    sx: 0.993,
                    sy: 0.461,
                    c: [
                        0.4,
                        0.6,
                        0.4,
                        0.6,
                        0.4,
                        0.6
                    ]
                },
                "3": {
                    x: -18.667,
                    y: -57.523,
                    sx: 0.985,
                    sy: 0.846,
                    c: [
                        0.82,
                        0.18,
                        0.82,
                        0.18,
                        0.82,
                        0.18
                    ]
                },
                "4": {
                    x: -18.6,
                    y: -129.1,
                    sx: 0.982,
                    sy: 1.015,
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
                    x: -18.62,
                    y: -128.788,
                    sx: 0.983,
                    sy: 1.014
                },
                "6": {
                    x: -18.687,
                    y: -127.513,
                    sx: 0.986,
                    sy: 1.011
                },
                "7": {
                    x: -18.797,
                    y: -125.445,
                    sx: 0.992,
                    sy: 1.007
                },
                "8": {
                    x: -18.905,
                    y: -123.492,
                    sx: 0.998,
                    sy: 1.002
                },
                "9": {
                    x: -18.95,
                    y: -122.75,
                    sx: 1,
                    sy: 1
                },
                "42": {
                    x: -18.903,
                    y: -123.183,
                    sx: 0.998,
                    sy: 1.001
                },
                "43": {
                    x: -18.747,
                    y: -124.675,
                    sx: 0.989,
                    sy: 1.005
                },
                "44": {
                    x: -18.489,
                    y: -127.204,
                    sx: 0.976,
                    sy: 1.011
                },
                "45": {
                    x: -18.239,
                    y: -129.663,
                    sx: 0.962,
                    sy: 1.016
                },
                "46": {
                    x: -18.15,
                    y: -130.55,
                    sx: 0.957,
                    sy: 1.019
                },
                "47": {
                    x: -18.225,
                    y: -92.281,
                    sx: 0.961,
                    sy: 0.931,
                    c: [
                        0.91,
                        0.09,
                        0.91,
                        0.09,
                        0.91,
                        0.09
                    ]
                },
                "48": {
                    x: -18.473,
                    y: 33.629,
                    sx: 0.974,
                    sy: 0.642,
                    c: [
                        0.6,
                        0.4,
                        0.6,
                        0.4,
                        0.6,
                        0.4
                    ]
                },
                "49": {
                    x: -18.809,
                    y: 204.334,
                    sx: 0.992,
                    sy: 0.249,
                    c: [
                        0.18,
                        0.81,
                        0.18,
                        0.81,
                        0.18,
                        0.81
                    ]
                },
                "50": {
                    x: -18.95,
                    y: 279.6,
                    sx: 1,
                    sy: 0.077,
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

    var Graphic6 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-3.35, -5.25, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic7 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Graphic6(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 50, {
            "0": {
                y: 114.983,
                sy: 1.535,
                a: 1
            },
            "1": {
                y: 83.631,
                sy: 1.323
            },
            "2": {
                y: 51.498,
                sy: 1.105
            },
            "3": {
                y: 24.145,
                sy: 0.919
            },
            "4": {
                y: 5.803,
                sy: 0.795
            },
            "5": {
                y: -1.25,
                sy: 0.747
            },
            "6": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "7": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "8": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "9": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "10": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "11": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "12": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "13": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "14": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic8 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-3.35, -5.25, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic9 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Graphic8(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 50, {
            "0": {
                y: 114.983,
                sy: 1.535,
                a: 1
            },
            "1": {
                y: 83.631,
                sy: 1.323
            },
            "2": {
                y: 51.498,
                sy: 1.105
            },
            "3": {
                y: 24.145,
                sy: 0.919
            },
            "4": {
                y: 5.803,
                sy: 0.795
            },
            "5": {
                y: -1.25,
                sy: 0.747
            },
            "6": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "7": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "8": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "9": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "10": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "11": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "12": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "13": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "14": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic10 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-3.35, -5.25, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic11 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Graphic10(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 50, {
            "0": {
                y: 114.983,
                sy: 1.535,
                a: 1
            },
            "1": {
                y: 83.631,
                sy: 1.323
            },
            "2": {
                y: 51.498,
                sy: 1.105
            },
            "3": {
                y: 24.145,
                sy: 0.919
            },
            "4": {
                y: 5.803,
                sy: 0.795
            },
            "5": {
                y: -1.25,
                sy: 0.747
            },
            "6": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "7": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "8": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "9": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "10": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "11": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "12": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "13": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "14": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic12 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-3.35, -5.25, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic13 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Graphic12(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 50, {
            "0": {
                y: 114.983,
                sy: 1.535,
                a: 1
            },
            "1": {
                y: 83.631,
                sy: 1.323
            },
            "2": {
                y: 51.498,
                sy: 1.105
            },
            "3": {
                y: 24.145,
                sy: 0.919
            },
            "4": {
                y: 5.803,
                sy: 0.795
            },
            "5": {
                y: -1.25,
                sy: 0.747
            },
            "6": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "7": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "8": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "9": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "10": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "11": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "12": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "13": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "14": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic14 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-3.35, -5.25, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic15 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Graphic14(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 50, {
            "0": {
                y: 114.983,
                sy: 1.535,
                a: 1
            },
            "1": {
                y: 83.631,
                sy: 1.323
            },
            "2": {
                y: 51.498,
                sy: 1.105
            },
            "3": {
                y: 24.145,
                sy: 0.919
            },
            "4": {
                y: 5.803,
                sy: 0.795
            },
            "5": {
                y: -1.25,
                sy: 0.747
            },
            "6": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "7": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "8": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "9": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "10": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "11": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "12": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "13": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "14": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic16 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-3.35, -5.25, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic17 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Graphic16(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 50, {
            "0": {
                y: 114.983,
                sy: 1.535,
                a: 1
            },
            "1": {
                y: 83.631,
                sy: 1.323
            },
            "2": {
                y: 51.498,
                sy: 1.105
            },
            "3": {
                y: 24.145,
                sy: 0.919
            },
            "4": {
                y: 5.803,
                sy: 0.795
            },
            "5": {
                y: -1.25,
                sy: 0.747
            },
            "6": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "7": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "8": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "9": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "10": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "11": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "12": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "13": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "14": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic18 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-3.35, -5.25, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic19 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Graphic18(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 50, {
            "0": {
                y: 114.983,
                sy: 1.535,
                a: 1
            },
            "1": {
                y: 83.631,
                sy: 1.323
            },
            "2": {
                y: 51.498,
                sy: 1.105
            },
            "3": {
                y: 24.145,
                sy: 0.919
            },
            "4": {
                y: 5.803,
                sy: 0.795
            },
            "5": {
                y: -1.25,
                sy: 0.747
            },
            "6": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "7": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "8": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "9": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "10": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "11": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "12": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "13": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "14": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic20 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-3.35, -5.25, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic21 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Graphic20(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 50, {
            "0": {
                y: 114.983,
                sy: 1.535,
                a: 1
            },
            "1": {
                y: 83.631,
                sy: 1.323
            },
            "2": {
                y: 51.498,
                sy: 1.105
            },
            "3": {
                y: 24.145,
                sy: 0.919
            },
            "4": {
                y: 5.803,
                sy: 0.795
            },
            "5": {
                y: -1.25,
                sy: 0.747
            },
            "6": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "7": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "8": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "9": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "10": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "11": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "12": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "13": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "14": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic22 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-3.35, -5.25, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic23 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Graphic22(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 50, {
            "0": {
                y: 114.983,
                sy: 1.535,
                a: 1
            },
            "1": {
                y: 83.631,
                sy: 1.323
            },
            "2": {
                y: 51.498,
                sy: 1.105
            },
            "3": {
                y: 24.145,
                sy: 0.919
            },
            "4": {
                y: 5.803,
                sy: 0.795
            },
            "5": {
                y: -1.25,
                sy: 0.747
            },
            "6": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "7": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "8": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "9": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "10": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "11": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "12": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "13": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "14": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    var Graphic24 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Sprite(fromFrame("line1"))
            .setTransform(-3.35, -5.25, 1.361, 1.361);
        this.addTimedChild(instance1);
    });

    var Graphic25 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 50, loop: false });
        var instance1 = new Graphic24(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 50, {
            "0": {
                y: 114.983,
                sy: 1.535,
                a: 1
            },
            "1": {
                y: 83.631,
                sy: 1.323
            },
            "2": {
                y: 51.498,
                sy: 1.105
            },
            "3": {
                y: 24.145,
                sy: 0.919
            },
            "4": {
                y: 5.803,
                sy: 0.795
            },
            "5": {
                y: -1.25,
                sy: 0.747
            },
            "6": {
                y: -9.252,
                sy: 0.689,
                a: 0.84
            },
            "7": {
                y: -16.612,
                sy: 0.635,
                a: 0.69
            },
            "8": {
                y: -23.38,
                sy: 0.586,
                a: 0.55
            },
            "9": {
                y: -29.555,
                sy: 0.541,
                a: 0.43
            },
            "10": {
                y: -35.037,
                sy: 0.501,
                a: 0.32
            },
            "11": {
                y: -39.977,
                sy: 0.465,
                a: 0.22
            },
            "12": {
                y: -44.275,
                sy: 0.433,
                a: 0.14
            },
            "13": {
                y: -47.93,
                sy: 0.406,
                a: 0.06
            },
            "14": {
                y: -51.05,
                sy: 0.384,
                a: 0
            }
        });
    });

    lib.fingers_crossed = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 52,
            framerate: 30
        });
        var instance11 = new Graphic25(MovieClip.SYNCHED)
            .setTransform(808.55, 214.45, 0.735, 0.735, 0.449)
            .setColorTransform(0, 0.14, 0, 0.92, 0, 0.96);
        var instance10 = new Graphic23(MovieClip.SYNCHED)
            .setTransform(881.05, 308.4, 0.735, 0.735, 1.037)
            .setColorTransform(0, 0.14, 0, 0.92, 0, 0.96);
        var instance9 = new Graphic21(MovieClip.SYNCHED)
            .setTransform(904.15, 421, 0.735, 0.735, 1.565)
            .setColorTransform(0, 0.14, 0, 0.92, 0, 0.96);
        var instance8 = new Graphic19(MovieClip.SYNCHED)
            .setTransform(822.05, 628.2, 0.735, 0.735, 0, 3.591, -0.449)
            .setColorTransform(0, 0.14, 0, 0.92, 0, 0.96);
        var instance7 = new Graphic17(MovieClip.SYNCHED)
            .setTransform(894.55, 534.25, 0.735, 0.735, 0, 4.179, -1.037)
            .setColorTransform(0, 0.14, 0, 0.92, 0, 0.96);
        var instance6 = new Graphic15(MovieClip.SYNCHED)
            .setTransform(479.4, 214.45, 0.735, 0.735, 0, 0.449, 2.692)
            .setColorTransform(0, 0.14, 0, 0.92, 0, 0.96);
        var instance5 = new Graphic13(MovieClip.SYNCHED)
            .setTransform(406.9, 308.4, 0.735, 0.735, 0, 1.037, 2.104)
            .setColorTransform(0, 0.14, 0, 0.92, 0, 0.96);
        var instance4 = new Graphic11(MovieClip.SYNCHED)
            .setTransform(379.8, 421, 0.735, 0.735, 0, 1.565, 1.577)
            .setColorTransform(0, 0.14, 0, 0.92, 0, 0.96);
        var instance3 = new Graphic9(MovieClip.SYNCHED)
            .setTransform(465.9, 628.2, 0.735, 0.735, -2.692)
            .setColorTransform(0, 0.14, 0, 0.92, 0, 0.96);
        var instance2 = new Graphic7(MovieClip.SYNCHED)
            .setTransform(401.4, 534.25, 0.735, 0.735, -2.104)
            .setColorTransform(0, 0.14, 0, 0.92, 0, 0.96);
        var instance1 = new Graphic5(MovieClip.SYNCHED);
        this.addTimedChild(instance11, 2, 50)
            .addTimedChild(instance10, 2, 50)
            .addTimedChild(instance9, 2, 50)
            .addTimedChild(instance8, 2, 50)
            .addTimedChild(instance7, 2, 50)
            .addTimedChild(instance6, 2, 50)
            .addTimedChild(instance5, 2, 50)
            .addTimedChild(instance4, 2, 50)
            .addTimedChild(instance3, 2, 50)
            .addTimedChild(instance2, 2, 50)
            .addTimedChild(instance1, 0, 51, {
                "0": {
                    x: 640.95,
                    y: 341.45
                }
            });
    });

    lib.fingers_crossed.assets = {
        "fingers_crossed_atlas_1": "images/fingers_crossed_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.fingers_crossed,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 52,
        library: lib
    };
}