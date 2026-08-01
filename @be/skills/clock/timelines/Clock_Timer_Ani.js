(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Text = PIXI.Text;

    lib.tapToEdit = Container.extend(function () {
        Container.call(this);
        var instance1 = new Text("tap to edit")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 48,
                fontWeight: "bold",
                fill: "#6c6e80"
            })
            .setAlign("center")
            .setTransform(254.47500000000002);
        this[instance1.name = "tapToEditText"] = instance1;
        this.addChild(instance1);
    });

    lib.hoursAndMinutes = Container.extend(function () {
        Container.call(this);
        var instance4 = new Text("m")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 157,
                fontWeight: "bold",
                fill: "#0db8cf"
            })
            .setAlign("center")
            .setTransform(460.15200000000004, 46.668, 0.591, 0.591);
        var instance3 = new Text("59")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 253,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(330.60200000000003, 0.018000000000000016, 0.591, 0.591);
        this[instance3.name = "minutes"] = instance3;
        var instance2 = new Text("h")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 157,
                fontWeight: "bold",
                fill: "#0db8cf"
            })
            .setAlign("center")
            .setTransform(211.802, 46.668, 0.591, 0.591);
        var instance1 = new Text("24")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 253,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("right")
            .setTransform(181.63869999999997, 0.018000000000000016, 0.591, 0.591);
        this[instance1.name = "hours"] = instance1;
        this.addChild(instance4, instance3, instance2, instance1);
    });

    lib.secondsOnly = Container.extend(function () {
        Container.call(this);
        var instance2 = new Text("s")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 157,
                fontWeight: "bold",
                fill: "#0db8cf"
            })
            .setAlign("center")
            .setTransform(353.65, 74.65);
        var instance1 = new Text("30")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 253,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(154.975);
        this[instance1.name = "seconds"] = instance1;
        this.addChild(instance2, instance1);
    });

    lib.minutesOnly = Container.extend(function () {
        Container.call(this);
        var instance4 = new Text("59")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 253,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("right")
            .setTransform(140.22, 44.65, 0.6, 0.6);
        this[instance4.name = "minutes"] = instance4;
        var instance3 = new Text("m")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 157,
                fontWeight: "bold",
                fill: "#0db8cf"
            })
            .setAlign("center")
            .setTransform(183.60000000000002, 93.45, 0.6, 0.6);
        var instance2 = new Text("59")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 253,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(316.65999999999997, 44.65, 0.6, 0.6);
        this[instance2.name = "seconds"] = instance2;
        var instance1 = new Text("s")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 157,
                fontWeight: "bold",
                fill: "#0db8cf"
            })
            .setAlign("center")
            .setTransform(437.05000000000007, 93.45, 0.6, 0.6);
        this.addChild(instance4, instance3, instance2, instance1);
    });

    lib.QuestionMark = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("QuestionMark1"))
            .setTransform(-83.7, -140.6, 0.969, 0.969);
        this.addChild(instance1);
    });

    lib.Timer_Time = Container.extend(function () {
        Container.call(this);
        var instance5 = new lib.QuestionMark()
            .setTransform(2.65, 14.25)
            .setAlpha(0);
        this[instance5.name = "question"] = instance5;
        var instance4 = new lib.minutesOnly()
            .setTransform(-215.2, -124.65)
            .setAlpha(0);
        this[instance4.name = "minutesAndSeconds"] = instance4;
        var instance3 = new lib.secondsOnly()
            .setTransform(-190.8, -124.65)
            .setAlpha(0);
        this[instance3.name = "secondsOnly"] = instance3;
        var instance2 = new lib.hoursAndMinutes()
            .setTransform(-247.25, -75.35)
            .setAlpha(0);
        this[instance2.name = "hoursAndMinutes"] = instance2;
        var instance1 = new lib.tapToEdit()
            .setTransform(-259.3, 143.4)
            .setAlpha(0);
        this[instance1.name = "tapToEdit"] = instance1;
        this.addChild(instance5, instance4, instance3, instance2, instance1);
    });

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 27, loop: false });
        var instance1 = new Sprite(fromFrame("Timer_Zero2"))
            .setTransform(-124.4, -124.45, 1.107, 1.107);
        this.addTimedChild(instance1);
    });

    var Graphic2 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 27, loop: false });
        var instance1 = new Sprite(fromFrame("Timer_Zero1"))
            .setTransform(-124.4, -124.45, 1.107, 1.107);
        this.addTimedChild(instance1);
    });

    var Graphic3 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 27, loop: false });
        var instance1 = new Sprite(fromFrame("Ring1"))
            .setTransform(-161, -161, 1.074, 1.074);
        this.addTimedChild(instance1);
    });

    lib.Timer_Time_0 = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 27
        });
        var instance3 = new Graphic3(MovieClip.SYNCHED);
        var instance2 = new Graphic2(MovieClip.SYNCHED);
        var instance1 = new Graphic1(MovieClip.SYNCHED);
        this.addTimedChild(instance3, 0, 27, {
                "0": {
                    x: -7.5,
                    y: 7.5,
                    sx: 0.94,
                    sy: 0.94,
                    a: 0
                },
                "8": {
                    a: 1
                },
                "9": {
                    x: -7.465,
                    y: 7.465,
                    sx: 1.061,
                    sy: 1.061,
                    a: 0.85
                },
                "10": {
                    x: -7.483,
                    y: 7.483,
                    sx: 1.195,
                    sy: 1.195,
                    a: 0.68
                },
                "11": {
                    x: -7.464,
                    y: 7.464,
                    sx: 1.33,
                    sy: 1.33,
                    a: 0.51
                },
                "12": {
                    x: -7.46,
                    y: 7.46,
                    sx: 1.455,
                    sy: 1.455,
                    a: 0.35
                },
                "13": {
                    x: -7.441,
                    y: 7.441,
                    sx: 1.559,
                    sy: 1.559,
                    a: 0.22
                },
                "14": {
                    x: -7.472,
                    y: 7.472,
                    sx: 1.639,
                    sy: 1.639,
                    a: 0.12
                },
                "15": {
                    x: -7.45,
                    y: 7.45,
                    sx: 1.692,
                    sy: 1.692,
                    a: 0.05
                },
                "16": {
                    x: -7.44,
                    y: 7.44,
                    sx: 1.722,
                    sy: 1.722,
                    a: 0.01
                },
                "17": {
                    x: -7.5,
                    y: 7.5,
                    sx: 1.732,
                    sy: 1.732,
                    a: 0
                }
            })
            .addTimedChild(instance2, 0, 27, {
                "0": {
                    x: -6.4,
                    y: 7.4,
                    sx: 0.875,
                    sy: 0.875,
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
                    x: -6.403,
                    y: 7.396,
                    sx: 0.869,
                    sy: 0.869
                },
                "2": {
                    x: -6.428,
                    y: 7.393,
                    sx: 0.845,
                    sy: 0.845
                },
                "3": {
                    x: -6.405,
                    y: 7.412,
                    sx: 0.794,
                    sy: 0.794
                },
                "4": {
                    x: -6.425,
                    y: 7.399,
                    sx: 0.721,
                    sy: 0.721
                },
                "5": {
                    x: -6.421,
                    y: 7.39,
                    sx: 0.673,
                    sy: 0.673
                },
                "6": {
                    x: -6.4,
                    y: 7.4,
                    sx: 0.66,
                    sy: 0.66
                },
                "7": {
                    x: -6.428,
                    y: 7.406,
                    sx: 0.679,
                    sy: 0.679
                },
                "8": {
                    x: -6.393,
                    y: 7.424,
                    sx: 0.747,
                    sy: 0.747
                },
                "9": {
                    x: -6.406,
                    y: 7.408,
                    sx: 0.893,
                    sy: 0.893
                },
                "10": {
                    x: -6.411,
                    y: 7.427,
                    sx: 1.1,
                    sy: 1.1
                },
                "11": {
                    x: -6.402,
                    sx: 1.238,
                    sy: 1.238
                },
                "12": {
                    x: -6.4,
                    y: 7.4,
                    sx: 1.275,
                    sy: 1.275
                },
                "13": {
                    x: -6.424,
                    y: 7.412,
                    sx: 1.26,
                    sy: 1.26,
                    c: [
                        0.97,
                        0,
                        0.97,
                        0.02,
                        0.97,
                        0.02
                    ]
                },
                "14": {
                    x: -6.398,
                    y: 7.393,
                    sx: 1.205,
                    sy: 1.205,
                    c: [
                        0.87,
                        0.02,
                        0.87,
                        0.1,
                        0.87,
                        0.11
                    ]
                },
                "15": {
                    y: 7.408,
                    sx: 1.095,
                    sy: 1.095,
                    c: [
                        0.66,
                        0.04,
                        0.66,
                        0.26,
                        0.66,
                        0.27
                    ]
                },
                "16": {
                    x: -6.443,
                    y: 7.384,
                    sx: 0.945,
                    sy: 0.945,
                    c: [
                        0.39,
                        0.07,
                        0.39,
                        0.48,
                        0.39,
                        0.5
                    ]
                },
                "17": {
                    x: -6.419,
                    y: 7.413,
                    sx: 0.821,
                    sy: 0.821,
                    c: [
                        0.15,
                        0.09,
                        0.15,
                        0.66,
                        0.15,
                        0.69
                    ]
                },
                "18": {
                    x: -6.445,
                    y: 7.388,
                    sx: 0.756,
                    sy: 0.756,
                    c: [
                        0.03,
                        0.11,
                        0.03,
                        0.75,
                        0.03,
                        0.78
                    ]
                },
                "19": {
                    x: -6.4,
                    y: 7.4,
                    sx: 0.738,
                    sy: 0.738,
                    c: [
                        0,
                        0.11,
                        0,
                        0.78,
                        0,
                        0.81
                    ]
                },
                "20": {
                    x: -6.366,
                    y: 7.365,
                    sx: 0.775,
                    sy: 0.775,
                    c: [
                        0.27,
                        0.08,
                        0.27,
                        0.57,
                        0.27,
                        0.6
                    ]
                },
                "21": {
                    x: -6.383,
                    y: 7.374,
                    sx: 0.805,
                    sy: 0.805,
                    c: [
                        0.49,
                        0.05,
                        0.49,
                        0.4,
                        0.49,
                        0.42
                    ]
                },
                "22": {
                    x: -6.401,
                    y: 7.376,
                    sx: 0.831,
                    sy: 0.831,
                    c: [
                        0.67,
                        0.04,
                        0.67,
                        0.25,
                        0.67,
                        0.27
                    ]
                },
                "23": {
                    x: -6.371,
                    y: 7.372,
                    sx: 0.85,
                    sy: 0.85,
                    c: [
                        0.82,
                        0.02,
                        0.82,
                        0.14,
                        0.82,
                        0.15
                    ]
                },
                "24": {
                    x: -6.392,
                    y: 7.363,
                    sx: 0.864,
                    sy: 0.864,
                    c: [
                        0.92,
                        0.01,
                        0.92,
                        0.06,
                        0.92,
                        0.07
                    ]
                },
                "25": {
                    x: -6.365,
                    y: 7.397,
                    sx: 0.873,
                    sy: 0.873,
                    c: [
                        0.98,
                        0,
                        0.98,
                        0.02,
                        0.98,
                        0.02
                    ]
                },
                "26": {
                    x: -6.4,
                    y: 7.4,
                    sx: 0.875,
                    sy: 0.875,
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
            .addTimedChild(instance1, 0, 27, {
                "0": {
                    x: -7,
                    y: 8.2,
                    sx: 0.715,
                    sy: 0.715,
                    a: 0
                },
                "2": {
                    x: -6.86,
                    y: 8.045,
                    sx: 0.706,
                    sy: 0.706,
                    a: 0.07
                },
                "3": {
                    x: -6.235,
                    y: 7.505,
                    sx: 0.667,
                    sy: 0.667,
                    a: 0.38
                },
                "4": {
                    x: -5.305,
                    y: 6.625,
                    sx: 0.608,
                    sy: 0.608,
                    a: 0.85
                },
                "5": {
                    x: -5,
                    y: 6.3,
                    sx: 0.589,
                    sy: 0.589,
                    a: 1
                },
                "6": {
                    x: -5.008,
                    y: 6.288,
                    sx: 0.626,
                    sy: 0.626
                },
                "7": {
                    x: -5,
                    y: 6.316,
                    sx: 0.778,
                    sy: 0.778
                },
                "8": {
                    x: -4.998,
                    y: 6.284,
                    sx: 1.014,
                    sy: 1.014
                },
                "9": {
                    x: -5,
                    y: 6.25,
                    sx: 1.088,
                    sy: 1.088
                },
                "10": {
                    x: -4.985,
                    y: 6.243,
                    sx: 1.095,
                    sy: 1.095,
                    a: 0.98
                },
                "11": {
                    x: -5.009,
                    y: 6.249,
                    sx: 1.122,
                    sy: 1.122,
                    a: 0.9
                },
                "12": {
                    x: -5,
                    y: 6.2,
                    sx: 1.179,
                    sy: 1.179,
                    a: 0.74
                },
                "13": {
                    x: -4.99,
                    y: 6.184,
                    sx: 1.271,
                    sy: 1.271,
                    a: 0.48
                },
                "14": {
                    x: -5.004,
                    y: 6.097,
                    sx: 1.368,
                    sy: 1.368,
                    a: 0.2
                },
                "15": {
                    x: -4.99,
                    y: 6.09,
                    sx: 1.424,
                    sy: 1.424,
                    a: 0.04
                },
                "16": {
                    x: -5,
                    y: 6.2,
                    sx: 1.439,
                    sy: 1.439,
                    a: 0
                }
            });
    });

    var Graphic4 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 109, loop: false });
        var instance1 = new Sprite(fromFrame("Timer_Face1"))
            .setTransform(-270.7, -270.55, 0.969, 0.969);
        this.addTimedChild(instance1);
    });

    lib.Loader_Fill = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("Loader_Fill1"))
            .setTransform(-290.25, -290.25, 0.969, 0.969);
        this.addChild(instance1);
    });

    var Graphic5 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 962, loop: false });
        var instance1 = new Sprite(fromFrame("Ring_Empty1"))
            .setTransform(-290.25, -290.25);
        this.addTimedChild(instance1);
    });

    lib.Timer_Loader = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 962
        });
        var instance2 = new Graphic5(MovieClip.SYNCHED);
        var instance1 = new lib.Loader_Fill();
        this[instance1.name = "loaderFill"] = instance1;
        this.addTimedChild(instance2)
            .addTimedChild(instance1, 0, 961);
    });

    var Graphic6 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 109, loop: false });
        var instance1 = new Sprite(fromFrame("back1"));
        this.addTimedChild(instance1);
    });

    lib.Clock_Timer_Ani = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 109,
            framerate: 30,
            labels: {
                timer_in_stop: 0,
                timer_body_ring: 1,
                "playAudio-timerRing-01": 5,
                "playAudio-timerRing-02": 32,
                "playAudio-timerRing-03": 59,
                timer_body_ring_loop: 108
            }
        });
        var instance6 = new Graphic6(MovieClip.SYNCHED)
            .setTransform(346.15, 29.4);
        var instance5 = new lib.Timer_Loader();
        this[instance5.name = "loader"] = instance5;
        var instance4 = new lib.Loader_Fill();
        this[instance4.name = "loaderFill"] = instance4;
        var instance3 = new Graphic4(MovieClip.SYNCHED)
            .setTransform(637.85, 389.75);
        var instance2 = new lib.Timer_Time_0()
            .setTransform(643.2, 380.95);
        this[instance2.name = "time0"] = instance2;
        var instance1 = new lib.Timer_Time();
        this[instance1.name = "timeClip"] = instance1;
        this.addTimedChild(instance6)
            .addTimedChild(instance5, 0, 1, {
                "0": {
                    x: 636.4,
                    y: 389.6
                }
            })
            .addTimedChild(instance4, 0, 109, {
                "0": {
                    x: 636.6,
                    y: 389.75,
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
                "10": {
                    a: 0.33,
                    c: [
                        0.77,
                        0.03,
                        0.77,
                        0.21,
                        0.77,
                        0.22
                    ]
                },
                "11": {
                    a: 0.67,
                    c: [
                        0.55,
                        0.06,
                        0.55,
                        0.43,
                        0.55,
                        0.44
                    ]
                },
                "12": {
                    a: 1,
                    c: [
                        0.32,
                        0.09,
                        0.32,
                        0.64,
                        0.32,
                        0.66
                    ]
                },
                "17": {
                    a: 0.8,
                    c: [
                        0.46,
                        0.07,
                        0.46,
                        0.51,
                        0.46,
                        0.53
                    ]
                },
                "18": {
                    a: 0.6,
                    c: [
                        0.59,
                        0.05,
                        0.59,
                        0.38,
                        0.59,
                        0.4
                    ]
                },
                "19": {
                    a: 0.4,
                    c: [
                        0.73,
                        0.04,
                        0.73,
                        0.25,
                        0.73,
                        0.27
                    ]
                },
                "20": {
                    a: 0.2,
                    c: [
                        0.86,
                        0.02,
                        0.86,
                        0.13,
                        0.86,
                        0.13
                    ]
                },
                "21": {
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
                "37": {
                    a: 0.33,
                    c: [
                        0.77,
                        0.03,
                        0.77,
                        0.21,
                        0.77,
                        0.22
                    ]
                },
                "38": {
                    a: 0.67,
                    c: [
                        0.55,
                        0.06,
                        0.55,
                        0.43,
                        0.55,
                        0.44
                    ]
                },
                "39": {
                    a: 1,
                    c: [
                        0.32,
                        0.09,
                        0.32,
                        0.64,
                        0.32,
                        0.66
                    ]
                },
                "44": {
                    a: 0.8,
                    c: [
                        0.46,
                        0.07,
                        0.46,
                        0.51,
                        0.46,
                        0.53
                    ]
                },
                "45": {
                    a: 0.6,
                    c: [
                        0.59,
                        0.05,
                        0.59,
                        0.38,
                        0.59,
                        0.4
                    ]
                },
                "46": {
                    a: 0.4,
                    c: [
                        0.73,
                        0.04,
                        0.73,
                        0.25,
                        0.73,
                        0.27
                    ]
                },
                "47": {
                    a: 0.2,
                    c: [
                        0.86,
                        0.02,
                        0.86,
                        0.13,
                        0.86,
                        0.13
                    ]
                },
                "48": {
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
                "64": {
                    a: 0.33,
                    c: [
                        0.77,
                        0.03,
                        0.77,
                        0.21,
                        0.77,
                        0.22
                    ]
                },
                "65": {
                    a: 0.67,
                    c: [
                        0.55,
                        0.06,
                        0.55,
                        0.43,
                        0.55,
                        0.44
                    ]
                },
                "66": {
                    a: 1,
                    c: [
                        0.32,
                        0.09,
                        0.32,
                        0.64,
                        0.32,
                        0.66
                    ]
                },
                "71": {
                    a: 0.8,
                    c: [
                        0.46,
                        0.07,
                        0.46,
                        0.51,
                        0.46,
                        0.53
                    ]
                },
                "72": {
                    a: 0.6,
                    c: [
                        0.59,
                        0.05,
                        0.59,
                        0.38,
                        0.59,
                        0.4
                    ]
                },
                "73": {
                    a: 0.4,
                    c: [
                        0.73,
                        0.04,
                        0.73,
                        0.25,
                        0.73,
                        0.27
                    ]
                },
                "74": {
                    a: 0.2,
                    c: [
                        0.86,
                        0.02,
                        0.86,
                        0.13,
                        0.86,
                        0.13
                    ]
                },
                "75": {
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
                "91": {
                    a: 0.33,
                    c: [
                        0.77,
                        0.03,
                        0.77,
                        0.21,
                        0.77,
                        0.22
                    ]
                },
                "92": {
                    a: 0.67,
                    c: [
                        0.55,
                        0.06,
                        0.55,
                        0.43,
                        0.55,
                        0.44
                    ]
                },
                "93": {
                    a: 1,
                    c: [
                        0.32,
                        0.09,
                        0.32,
                        0.64,
                        0.32,
                        0.66
                    ]
                },
                "98": {
                    a: 0.8,
                    c: [
                        0.46,
                        0.07,
                        0.46,
                        0.51,
                        0.46,
                        0.53
                    ]
                },
                "99": {
                    a: 0.6,
                    c: [
                        0.59,
                        0.05,
                        0.59,
                        0.38,
                        0.59,
                        0.4
                    ]
                },
                "100": {
                    a: 0.4,
                    c: [
                        0.73,
                        0.04,
                        0.73,
                        0.25,
                        0.73,
                        0.27
                    ]
                },
                "101": {
                    a: 0.2,
                    c: [
                        0.86,
                        0.02,
                        0.86,
                        0.13,
                        0.86,
                        0.13
                    ]
                },
                "102": {
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
            .addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1, 0, 109, {
                "0": {
                    x: 642.2,
                    y: 380.75,
                    a: 1
                },
                "1": {
                    a: 0
                }
            });
    });

    lib.Clock_Timer_Ani.assets = {
        "Clock_Timer_Ani_atlas_1": "images/Clock_Timer_Ani_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.Clock_Timer_Ani,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 109,
        library: lib
    };
}