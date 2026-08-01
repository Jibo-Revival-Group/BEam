(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Text = PIXI.Text;

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 68, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Back1"))
            .setTransform(-416.95, -334.3, 1.167, 1.167);
        this.addTimedChild(instance1);
    });

    var Graphic2 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 87, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Loop1"))
            .setTransform(-19.8, -58.8, 1.167, 1.167);
        this.addTimedChild(instance1);
    });

    var Graphic3 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 85, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Loop1"))
            .setTransform(-19.8, -58.8, 1.167, 1.167);
        this.addTimedChild(instance1);
    });

    var Graphic4 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 10, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page1"))
            .setTransform(-416.95, -334.25, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic5 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 10, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page3"))
            .setTransform(-416.95, 310.65, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic6 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 10, loop: false });
        var instance2 = new Graphic5(MovieClip.SYNCHED);
        var instance1 = new Graphic4(MovieClip.SYNCHED);
        this.addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic7 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 28, loop: false });
        var instance1 = new Sprite(fromFrame("Date-PageFold1"));
        var instance2 = new Sprite(fromFrame("Date-PageFold2"))
            .setTransform(-395.05, 51.2, 1.167, 1.167);
        this.addTimedChild(instance1, 0, 18, {
                "0": {
                    x: -403.35,
                    y: -23.2,
                    sx: 1.167,
                    sy: 1.167
                }
            })
            .addTimedChild(instance2, 18, 10);
    });

    var Graphic8 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 21, loop: false });
        var instance1 = new Sprite(fromFrame("Date-PageFold1"));
        var instance2 = new Sprite(fromFrame("Date-PageFold2"))
            .setTransform(-395.05, 51.2, 1.167, 1.167);
        this.addTimedChild(instance1, 0, 11, {
                "0": {
                    x: -403.35,
                    y: -23.2,
                    sx: 1.167,
                    sy: 1.167
                }
            })
            .addTimedChild(instance2, 11, 10);
    });

    var Graphic9 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 15, loop: false });
        var instance1 = new Sprite(fromFrame("Date-PageFold1"));
        var instance2 = new Sprite(fromFrame("Date-PageFold2"))
            .setTransform(-395.05, 51.2, 1.167, 1.167);
        this.addTimedChild(instance1, 0, 5, {
                "0": {
                    x: -403.35,
                    y: -23.2,
                    sx: 1.167,
                    sy: 1.167
                }
            })
            .addTimedChild(instance2, 5, 10);
    });

    var Graphic10 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 11, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Shadow1"))
            .setTransform(-416.2, -215.25, 1.145, 1.145);
        this.addTimedChild(instance1);
    });

    var Graphic11 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page1"))
            .setTransform(-416.95, -334.25, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic12 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page3"))
            .setTransform(-416.95, 310.65, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic13 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 44, loop: false });
        var instance2 = new Graphic12(MovieClip.SYNCHED);
        var instance1 = new Graphic11(MovieClip.SYNCHED);
        this.addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic14 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 46, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Bar1"))
            .setTransform(-92, -418.25, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic15 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 46, loop: false });
        var instance1 = new Graphic14(MovieClip.SYNCHED)
            .setTransform(0, -263.95, 1, 1, -1.571);
        this.addTimedChild(instance1);
    });

    lib.Graphic16 = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("Date-Bar1"))
            .setTransform(-92, -418.25, 1.166, 1.166);
        this.addChild(instance1);
    });

    var Graphic17 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 10, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page1"))
            .setTransform(-416.95, -334.25, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic18 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 30, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Bar1"))
            .setTransform(-92, -418.25, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic19 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 30, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page3"))
            .setTransform(-416.95, 310.65, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic20 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 30, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page1"))
            .setTransform(-416.95, -334.25, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic21 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new lib.Graphic16();
        var instance2 = new Graphic17(MovieClip.SYNCHED);
        var instance5 = new Graphic20(MovieClip.SYNCHED);
        var instance4 = new Graphic19(MovieClip.SYNCHED);
        var instance3 = new Graphic18(MovieClip.SYNCHED)
            .setTransform(0, -263.95, 1, 1, -1.571);
        this.addTimedChild(instance1, 0, 1, {
                "0": {
                    y: -263.95,
                    r: -1.571
                }
            })
            .addTimedChild(instance2, 1, 10)
            .addTimedChild(instance5, 11, 30)
            .addTimedChild(instance4, 11, 30)
            .addTimedChild(instance3, 11, 30);
    });

    var Graphic22 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 11, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Shadow1"))
            .setTransform(-416.2, -215.25, 1.145, 1.145);
        this.addTimedChild(instance1);
    });

    lib.Graphic23 = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("Date-Bar1"))
            .setTransform(-92, -418.25, 1.166, 1.166);
        this.addChild(instance1);
    });

    var Graphic24 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 5, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page3"))
            .setTransform(-416.95, 310.65, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic25 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 6, loop: false });
        var instance1 = new Graphic24(MovieClip.SYNCHED);
        var instance2 = new lib.Graphic23()
            .setTransform(0, -263.95, 1, 1, -1.571);
        this.addTimedChild(instance1, 0, 5)
            .addTimedChild(instance2, 5, 1);
    });

    var Graphic26 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 9, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page1"))
            .setTransform(-416.95, -334.25, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic27 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 9, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page3"))
            .setTransform(-416.95, 310.65, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic28 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 9, loop: false });
        var instance2 = new Graphic27(MovieClip.SYNCHED);
        var instance1 = new Graphic26(MovieClip.SYNCHED);
        this.addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    lib.Graphic29 = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("Date-Page3"))
            .setTransform(-416.95, 310.65, 1.166, 1.166);
        this.addChild(instance1);
    });

    lib.Graphic30 = Container.extend(function () {
        Container.call(this);
        var instance1 = new lib.Graphic29();
        this.addChild(instance1);
    });

    var Graphic31 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 30, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Back1"))
            .setTransform(-416.95, -334.3, 1.167, 1.167);
        this.addTimedChild(instance1);
    });

    lib.Date_Shadow = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("Date-Shadow1"))
            .setTransform(-416.2, -215.25, 1.145, 1.145);
        this.addChild(instance1);
    });

    lib.Date_Day = Container.extend(function () {
        Container.call(this);
        var instance1 = new Text("Thursday")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 80,
                fontWeight: "bold",
                fill: "#272631"
            })
            .setAlign("center")
            .setTransform(-5.799999999999983, -57.75);
        this[instance1.name = "dayText"] = instance1;
        this.addChild(instance1);
    });

    lib.Date_Month = Container.extend(function () {
        Container.call(this);
        var instance1 = new Text("SEPTEMBER")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 90,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(-6.949999999999974, -245.1);
        this[instance1.name = "dateMonthText"] = instance1;
        this.addChild(instance1);
    });

    lib.Date_Number = Container.extend(function () {
        Container.call(this);
        var instance2 = new Text("28")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 249,
                fontWeight: "bold",
                fill: "#272631"
            })
            .setAlign("center")
            .setTransform(-74.50999999999999, -223.49, 1.67, 1.67);
        this[instance2.name = "dayNumberText"] = instance2;
        var instance1 = new Text("th")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 175,
                fontWeight: "bold",
                fill: "#272631"
            })
            .setAlign("center")
            .setTransform(258, -204.8);
        this[instance1.name = "daySuffixText"] = instance1;
        this.addChild(instance2, instance1);
    });

    var Graphic32 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Bar1"))
            .setTransform(-92, -418.25, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic33 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page3"))
            .setTransform(-416.95, 310.65, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic34 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page1"))
            .setTransform(-416.95, -334.25, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic35 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 19, loop: false });
        var instance3 = new Graphic34(MovieClip.SYNCHED);
        var instance2 = new Graphic33(MovieClip.SYNCHED);
        var instance1 = new Graphic32(MovieClip.SYNCHED)
            .setTransform(0, -263.95, 1, 1, -1.571);
        this.addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic36 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 15, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page1"))
            .setTransform(-416.95, -334.25, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic37 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Page3"))
            .setTransform(-416.95, 310.65, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    var Graphic38 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 11, loop: false });
        var instance1 = new Sprite(fromFrame("Date-Bar1"))
            .setTransform(-92, -418.25, 1.166, 1.166);
        this.addTimedChild(instance1);
    });

    lib.Clock_Date_Ani = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 88,
            framerate: 30,
            loop: false,
            labels: {
                date_in: 0,
                page_flip: 19,
                menu_trans: 65,
                menu_trans_stop: 66,
                date_in_stop: 67,
                date_out: 68,
                date_out_stop: 87
            }
        });
        var instance4 = new Graphic6(MovieClip.SYNCHED);
        var instance14 = new Graphic28(MovieClip.SYNCHED);
        var instance9 = new Graphic13(MovieClip.SYNCHED);
        var instance1 = new Graphic1(MovieClip.SYNCHED);
        var instance8 = new Graphic10(MovieClip.SYNCHED);
        var instance21 = new Graphic35(MovieClip.SYNCHED);
        var instance16 = new Graphic31(MovieClip.SYNCHED);
        var instance11 = new Graphic21(MovieClip.SYNCHED);
        var instance13 = new Graphic25(MovieClip.SYNCHED);
        var instance15 = new lib.Graphic30();
        var instance23 = new Graphic37(MovieClip.SYNCHED);
        var instance22 = new Graphic36(MovieClip.SYNCHED);
        var instance10 = new Graphic15(MovieClip.SYNCHED);
        var instance12 = new Graphic22(MovieClip.SYNCHED);
        var instance17 = new lib.Date_Shadow();
        var instance24 = new Graphic38(MovieClip.SYNCHED);
        var instance3 = new Graphic3(MovieClip.SYNCHED);
        var instance2 = new Graphic2(MovieClip.SYNCHED);
        var instance7 = new Graphic9(MovieClip.SYNCHED);
        var instance6 = new Graphic8(MovieClip.SYNCHED);
        var instance5 = new Graphic7(MovieClip.SYNCHED);
        var instance20 = new lib.Date_Number();
        this[instance20.name = "dateNumber"] = instance20;
        var instance19 = new lib.Date_Month();
        this[instance19.name = "dateMonth"] = instance19;
        var instance18 = new lib.Date_Day();
        this[instance18.name = "dateDay"] = instance18;
        this.addTimedChild(instance4, 18, 10, {
                "18": {
                    x: 630.95,
                    y: 372.4,
                    sx: 0.828,
                    sy: 0.814
                },
                "19": {
                    y: 369.85
                },
                "20": {
                    y: 359.95
                },
                "21": {
                    y: 341.05
                },
                "22": {
                    y: 325.2
                },
                "23": {
                    y: 320.8
                },
                "24": {
                    y: 333.35
                },
                "25": {
                    y: 345.9
                },
                "26": {
                    y: 358.45
                }
            })
            .addTimedChild(instance14, 32, 9, {
                "32": {
                    x: 630.95,
                    y: 372.4,
                    sx: 0.828,
                    sy: 0.814
                },
                "33": {
                    y: 369.85
                },
                "34": {
                    y: 359.95
                },
                "35": {
                    y: 341.05
                },
                "36": {
                    y: 325.2
                },
                "37": {
                    y: 320.8
                },
                "38": {
                    y: 333.35
                },
                "39": {
                    y: 345.9
                },
                "40": {
                    y: 358.45
                }
            })
            .addTimedChild(instance9, 24, 44, {
                "24": {
                    x: 630.95,
                    y: 372.4,
                    sx: 0.828,
                    sy: 0.814
                },
                "25": {
                    y: 369.85
                },
                "26": {
                    y: 359.95
                },
                "27": {
                    y: 341.05
                },
                "28": {
                    y: 325.2
                },
                "29": {
                    y: 320.8
                },
                "30": {
                    y: 333.35
                },
                "31": {
                    y: 345.9
                },
                "32": {
                    y: 358.45
                }
            })
            .addTimedChild(instance1, 0, 68, {
                "0": {
                    x: 630.85,
                    y: 397.6,
                    sx: 1.022,
                    sy: 0.271,
                    c: [
                        0,
                        0.04,
                        0,
                        0.23,
                        0,
                        0.31
                    ]
                },
                "1": {
                    x: 630.823,
                    y: 397.347,
                    sx: 1.019,
                    sy: 0.281,
                    c: [
                        0.02,
                        0.04,
                        0.02,
                        0.23,
                        0.02,
                        0.31
                    ]
                },
                "2": {
                    x: 630.841,
                    y: 396.477,
                    sx: 1.009,
                    sy: 0.318,
                    c: [
                        0.07,
                        0.04,
                        0.07,
                        0.22,
                        0.07,
                        0.29
                    ]
                },
                "3": {
                    x: 630.824,
                    y: 394.897,
                    sx: 0.989,
                    sy: 0.388,
                    c: [
                        0.18,
                        0.04,
                        0.18,
                        0.19,
                        0.18,
                        0.25
                    ]
                },
                "4": {
                    x: 630.853,
                    y: 392.351,
                    sx: 0.959,
                    sy: 0.496,
                    c: [
                        0.35,
                        0.03,
                        0.35,
                        0.15,
                        0.35,
                        0.2
                    ]
                },
                "5": {
                    x: 630.85,
                    y: 389.201,
                    sx: 0.921,
                    sy: 0.632,
                    c: [
                        0.56,
                        0.02,
                        0.56,
                        0.1,
                        0.56,
                        0.14
                    ]
                },
                "6": {
                    x: 630.854,
                    y: 386.192,
                    sx: 0.884,
                    sy: 0.761,
                    c: [
                        0.76,
                        0.01,
                        0.76,
                        0.05,
                        0.76,
                        0.07
                    ]
                },
                "7": {
                    x: 630.827,
                    y: 384.079,
                    sx: 0.858,
                    sy: 0.853,
                    c: [
                        0.9,
                        0,
                        0.9,
                        0.02,
                        0.9,
                        0.03
                    ]
                },
                "8": {
                    x: 630.84,
                    y: 382.933,
                    sx: 0.844,
                    sy: 0.902,
                    c: [
                        0.98,
                        0,
                        0.98,
                        0,
                        0.98,
                        0.01
                    ]
                },
                "9": {
                    x: 630.85,
                    y: 382.6,
                    sx: 0.84,
                    sy: 0.917,
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
                    x: 630.87,
                    y: 382.613,
                    sx: 0.841,
                    sy: 0.916
                },
                "11": {
                    x: 630.853,
                    y: 382.624,
                    sx: 0.842,
                    sy: 0.911
                },
                "12": {
                    x: 630.844,
                    y: 382.619,
                    sx: 0.844,
                    sy: 0.903
                },
                "13": {
                    x: 630.87,
                    y: 382.588,
                    sx: 0.848,
                    sy: 0.89
                },
                "14": {
                    x: 630.863,
                    y: 382.601,
                    sx: 0.852,
                    sy: 0.876
                },
                "15": {
                    x: 630.864,
                    y: 382.624,
                    sx: 0.855,
                    sy: 0.865
                },
                "16": {
                    x: 630.825,
                    y: 382.587,
                    sx: 0.857,
                    sy: 0.859
                },
                "17": {
                    x: 630.85,
                    y: 382.6,
                    sy: 0.857
                }
            })
            .addTimedChild(instance8, 24, 11, {
                "24": {
                    x: 631.8,
                    y: 321.2,
                    sx: 0.857,
                    sy: 1.041,
                    a: 0
                },
                "25": {
                    y: 341.701,
                    sy: 0.979,
                    a: 0.33
                },
                "26": {
                    y: 362.153,
                    sy: 0.918,
                    a: 0.67
                },
                "27": {
                    y: 382.6,
                    sy: 0.857,
                    a: 1
                },
                "28": {
                    y: 407.503,
                    sy: 0.783,
                    a: 0.94
                },
                "29": {
                    y: 450.812,
                    sy: 0.653,
                    a: 0.84
                },
                "30": {
                    y: 505.354,
                    sy: 0.49,
                    a: 0.7
                },
                "31": {
                    y: 560.798,
                    sy: 0.324,
                    a: 0.57
                },
                "32": {
                    y: 606.865,
                    sy: 0.186,
                    a: 0.46
                },
                "33": {
                    y: 636.311,
                    sy: 0.098,
                    a: 0.38
                },
                "34": {
                    y: 646.2,
                    sy: 0.068,
                    a: 0.36
                }
            })
            .addTimedChild(instance21, 49, 19, {
                "49": {
                    x: 632.15,
                    y: 382,
                    sx: 0.857,
                    sy: 0.857
                }
            })
            .addTimedChild(instance16, 38, 30, {
                "38": {
                    x: 630.85,
                    y: 382.6,
                    sx: 0.857,
                    sy: 0.857
                }
            })
            .addTimedChild(instance11, 27, 41, {
                "27": {
                    x: 632.15,
                    y: 271.85,
                    sx: 0.857,
                    sy: 0.549
                },
                "28": {
                    x: 632.1,
                    y: 246.35,
                    sy: 0.051
                },
                "29": {
                    y: 269,
                    sy: 0.119
                },
                "30": {
                    y: 306.55,
                    sy: 0.231
                },
                "31": {
                    y: 346.2,
                    sy: 0.415
                },
                "32": {
                    y: 384.1,
                    sy: 0.511
                },
                "33": {
                    y: 412,
                    sy: 0.594
                },
                "34": {
                    y: 421.9,
                    sy: 0.624
                },
                "35": {
                    y: 427.05,
                    sy: 0.639
                },
                "36": {
                    y: 431.7,
                    sy: 0.653
                },
                "37": {
                    y: 435.3,
                    sy: 0.664
                },
                "38": {
                    x: 632.15,
                    y: 382,
                    sy: 0.857
                }
            })
            .addTimedChild(instance13, 32, 6, {
                "32": {
                    x: 632.1,
                    y: 296.1,
                    sx: 0.857,
                    sy: 0.794
                },
                "33": {
                    y: 352.5
                },
                "34": {
                    y: 371.7
                },
                "35": {
                    y: 381.7
                },
                "36": {
                    y: 390.7
                },
                "37": {
                    x: 632.15,
                    y: 382.3,
                    sy: 0.858
                }
            })
            .addTimedChild(instance15, 37, 1, {
                "37": {
                    x: 632.1,
                    y: 397.7,
                    sx: 0.857,
                    sy: 0.794
                }
            })
            .addTimedChild(instance23, 68, 16, {
                "68": {
                    x: 632.15,
                    y: 382,
                    sx: 0.857,
                    sy: 0.857
                }
            })
            .addTimedChild(instance22, 68, 15, {
                "68": {
                    x: 632.15,
                    y: 382,
                    sx: 0.857,
                    sy: 0.857
                },
                "75": {
                    y: 398.95,
                    sy: 0.803
                },
                "76": {
                    y: 415.45,
                    sy: 0.751
                },
                "77": {
                    y: 444.55,
                    sy: 0.658
                },
                "78": {
                    y: 480.45,
                    sy: 0.544
                },
                "79": {
                    y: 522.4,
                    sy: 0.411
                },
                "80": {
                    y: 576.25,
                    sy: 0.24
                },
                "81": {
                    y: 607.6,
                    sy: 0.141
                },
                "82": {
                    y: 626.05,
                    sy: 0.082
                }
            })
            .addTimedChild(instance10, 27, 46, {
                "27": {
                    x: 632.15,
                    y: 271.85,
                    sx: 0.857,
                    sy: 0.549
                },
                "28": {
                    x: 632.85,
                    y: 382.3,
                    sy: 0.858
                }
            })
            .addTimedChild(instance12, 30, 11, {
                "30": {
                    x: 631.8,
                    y: 308.4,
                    sx: 0.857,
                    sy: 1.079,
                    a: 0
                },
                "31": {
                    y: 331.319,
                    sy: 1.01,
                    a: 0.33
                },
                "32": {
                    y: 354.238,
                    sy: 0.942,
                    a: 0.67
                },
                "33": {
                    y: 377.15,
                    sy: 0.873,
                    a: 1
                },
                "34": {
                    y: 400.765,
                    sy: 0.803,
                    a: 0.94
                },
                "35": {
                    y: 441.844,
                    sy: 0.68,
                    a: 0.83
                },
                "36": {
                    y: 493.65,
                    sy: 0.525,
                    a: 0.7
                },
                "37": {
                    y: 552.521,
                    sy: 0.349,
                    a: 0.57
                },
                "38": {
                    y: 601.365,
                    sy: 0.203,
                    a: 0.45
                },
                "39": {
                    y: 632.656,
                    sy: 0.109,
                    a: 0.38
                },
                "40": {
                    y: 643.15,
                    sy: 0.078,
                    a: 0.36
                }
            })
            .addTimedChild(instance17, 40, 8, {
                "40": {
                    x: 631.8,
                    y: 377.15,
                    sx: 0.857,
                    sy: 0.873,
                    a: 1
                },
                "41": {
                    y: 400.809,
                    sy: 0.803,
                    a: 0.94
                },
                "42": {
                    y: 441.87,
                    sy: 0.68,
                    a: 0.83
                },
                "43": {
                    y: 493.65,
                    sy: 0.525,
                    a: 0.7
                },
                "44": {
                    x: 637.122,
                    y: 554.22,
                    sx: 0.844,
                    sy: 0.344,
                    a: 0.52
                },
                "45": {
                    x: 641.553,
                    y: 604.463,
                    sx: 0.834,
                    sy: 0.194,
                    a: 0.38
                },
                "46": {
                    x: 644.4,
                    y: 636.653,
                    sx: 0.827,
                    sy: 0.097,
                    a: 0.28
                },
                "47": {
                    x: 645.35,
                    y: 647.4,
                    sx: 0.825,
                    sy: 0.065,
                    a: 0.25
                }
            })
            .addTimedChild(instance24, 73, 11, {
                "73": {
                    x: 632.9,
                    y: 155.75,
                    sx: 0.857,
                    sy: 0.857,
                    r: -1.571,
                    c: [
                        1,
                        0,
                        1,
                        0,
                        1,
                        0
                    ]
                },
                "74": {
                    x: 632.89,
                    y: 161.619,
                    sx: 0.851,
                    c: [
                        0.99,
                        0,
                        0.99,
                        0.01,
                        0.99,
                        0.01
                    ]
                },
                "75": {
                    x: 632.84,
                    y: 180.956,
                    sx: 0.832,
                    c: [
                        0.95,
                        0,
                        0.95,
                        0.04,
                        0.95,
                        0.04
                    ]
                },
                "76": {
                    x: 632.788,
                    y: 216.104,
                    sx: 0.796,
                    c: [
                        0.88,
                        0.02,
                        0.88,
                        0.08,
                        0.88,
                        0.09
                    ]
                },
                "77": {
                    x: 632.738,
                    y: 269.357,
                    sx: 0.743,
                    c: [
                        0.76,
                        0.03,
                        0.76,
                        0.15,
                        0.76,
                        0.18
                    ]
                },
                "78": {
                    x: 632.636,
                    y: 341.015,
                    sx: 0.671,
                    c: [
                        0.61,
                        0.04,
                        0.61,
                        0.25,
                        0.61,
                        0.29
                    ]
                },
                "79": {
                    x: 632.486,
                    y: 426.065,
                    sx: 0.586,
                    c: [
                        0.43,
                        0.06,
                        0.43,
                        0.36,
                        0.43,
                        0.42
                    ]
                },
                "80": {
                    x: 632.386,
                    y: 511.287,
                    sx: 0.501,
                    c: [
                        0.26,
                        0.08,
                        0.26,
                        0.48,
                        0.26,
                        0.55
                    ]
                },
                "81": {
                    x: 632.286,
                    y: 579.638,
                    sx: 0.432,
                    c: [
                        0.11,
                        0.1,
                        0.11,
                        0.57,
                        0.11,
                        0.66
                    ]
                },
                "82": {
                    x: 632.186,
                    y: 620.709,
                    sx: 0.391,
                    c: [
                        0.03,
                        0.11,
                        0.03,
                        0.63,
                        0.03,
                        0.72
                    ]
                },
                "83": {
                    x: 632.15,
                    y: 633.6,
                    sx: 0.378,
                    c: [
                        0,
                        0.11,
                        0,
                        0.65,
                        0,
                        0.74
                    ]
                }
            })
            .addTimedChild(instance3, 3, 85, {
                "3": {
                    x: 912,
                    y: 426.05,
                    sx: 0.857,
                    sy: 0.857,
                    kx: 0,
                    ky: 0,
                    r: 0.427,
                    a: 0
                },
                "4": {
                    x: 912.095,
                    y: 415.768,
                    sx: 0.856,
                    sy: 0.856,
                    r: 0.779,
                    a: 0.03
                },
                "5": {
                    x: 912,
                    y: 379.798,
                    kx: 4.27,
                    ky: 2.013,
                    r: 0,
                    a: 0.13
                },
                "6": {
                    x: 911.943,
                    y: 309.957,
                    kx: 0,
                    ky: 0,
                    r: -1.877,
                    a: 0.32
                },
                "7": {
                    x: 912.102,
                    y: 213.266,
                    sx: 0.857,
                    sy: 0.857,
                    r: 1.439,
                    a: 0.59
                },
                "8": {
                    x: 911.99,
                    y: 126.856,
                    sx: 0.856,
                    sy: 0.856,
                    r: -1.886,
                    a: 0.83
                },
                "9": {
                    x: 912.105,
                    y: 78.582,
                    r: -0.228,
                    a: 0.96
                },
                "10": {
                    x: 912,
                    y: 64.95,
                    sx: 0.857,
                    sy: 0.857,
                    r: 0.239,
                    a: 1
                },
                "11": {
                    x: 911.999,
                    y: 67.597,
                    sx: 0.856,
                    sy: 0.856,
                    r: 0.591
                },
                "12": {
                    x: 912.035,
                    y: 77.191,
                    kx: 4.384,
                    ky: 1.899,
                    r: 0
                },
                "13": {
                    x: 912.107,
                    y: 93.865,
                    kx: 0,
                    ky: 0,
                    r: -2.157
                },
                "14": {
                    x: 912.041,
                    y: 106.391,
                    r: -0.473
                },
                "15": {
                    x: 912.05,
                    y: 109.95,
                    sx: 0.857,
                    sy: 0.857,
                    r: 0
                },
                "16": {
                    y: 108.7
                },
                "17": {
                    y: 104.15
                },
                "18": {
                    y: 96.4
                },
                "19": {
                    y: 90.5
                },
                "20": {
                    y: 88.85
                },
                "21": {
                    y: 89.15
                },
                "22": {
                    y: 90.3
                },
                "23": {
                    y: 92.5
                },
                "24": {
                    y: 95
                },
                "25": {
                    y: 96.5
                },
                "26": {
                    y: 96.95
                },
                "76": {
                    y: 91.466,
                    sx: 0.856,
                    sy: 0.856,
                    r: 0.21
                },
                "77": {
                    x: 912.007,
                    y: 85.897,
                    r: 0.424
                },
                "78": {
                    x: 912.013,
                    y: 80.416,
                    r: 0.635
                },
                "79": {
                    x: 911.984,
                    y: 74.888,
                    r: 0.849
                },
                "80": {
                    x: 912.009,
                    y: 69.316,
                    r: 1.063
                },
                "81": {
                    x: 912,
                    y: 63.8,
                    sx: 0.857,
                    sy: 0.857,
                    r: 1.273
                },
                "82": {
                    x: 912.04,
                    y: 71.718,
                    sx: 0.856,
                    sy: 0.856,
                    r: 1.317,
                    a: 0.98
                },
                "83": {
                    x: 911.995,
                    y: 96.896,
                    sx: 0.857,
                    sy: 0.857,
                    r: 1.456,
                    a: 0.93
                },
                "84": {
                    x: 912.019,
                    y: 142.482,
                    kx: 4.581,
                    ky: 1.702,
                    r: 0,
                    a: 0.82
                },
                "85": {
                    x: 912.015,
                    y: 213.172,
                    sx: 0.856,
                    sy: 0.856,
                    kx: 4.196,
                    ky: 2.088,
                    a: 0.66
                },
                "86": {
                    x: 912.057,
                    y: 318.529,
                    kx: 3.615,
                    ky: 2.669,
                    a: 0.43
                },
                "87": {
                    x: 912.1,
                    y: 510.65,
                    sx: 0.857,
                    sy: 0.857,
                    kx: 0,
                    ky: 0,
                    r: -2.566,
                    a: 0
                }
            })
            .addTimedChild(instance2, 1, 87, {
                "1": {
                    x: 341.25,
                    y: 373.9,
                    sx: 0.857,
                    sy: 0.857,
                    kx: 0,
                    ky: 0,
                    r: -0.427,
                    a: 0
                },
                "2": {
                    x: 341.245,
                    y: 364.895,
                    sx: 0.856,
                    sy: 0.856,
                    r: -0.228,
                    a: 0.03
                },
                "3": {
                    x: 341.217,
                    y: 333.232,
                    r: 0.468,
                    a: 0.13
                },
                "4": {
                    x: 341.178,
                    y: 271.983,
                    kx: 4.471,
                    ky: 1.812,
                    r: 0,
                    a: 0.32
                },
                "5": {
                    x: 341.249,
                    y: 187.028,
                    kx: 0,
                    ky: 0,
                    r: -2.599,
                    a: 0.59
                },
                "6": {
                    x: 341.257,
                    y: 111.41,
                    r: -0.932,
                    a: 0.83
                },
                "7": {
                    x: 341.187,
                    y: 69.031,
                    sx: 0.857,
                    sy: 0.857,
                    r: 0,
                    a: 0.96
                },
                "8": {
                    x: 341.2,
                    y: 56.9,
                    r: 0.266,
                    a: 1
                },
                "9": {
                    x: 341.188,
                    y: 59.588,
                    sx: 0.856,
                    sy: 0.856,
                    r: 0.503
                },
                "10": {
                    x: 341.187,
                    y: 69.246,
                    r: 1.361
                },
                "11": {
                    x: 341.183,
                    y: 87.513,
                    sx: 0.857,
                    sy: 0.857,
                    kx: 3.303,
                    ky: 2.98,
                    r: 0
                },
                "12": {
                    x: 341.216,
                    y: 108.478,
                    kx: 0,
                    ky: 0,
                    r: -1.453
                },
                "13": {
                    x: 341.232,
                    y: 121.317,
                    sx: 0.856,
                    sy: 0.856,
                    r: -0.315
                },
                "14": {
                    x: 341.2,
                    y: 124.95,
                    sx: 0.857,
                    sy: 0.857,
                    r: 0
                },
                "15": {
                    y: 121.6
                },
                "16": {
                    y: 109.15
                },
                "17": {
                    y: 94.45
                },
                "18": {
                    y: 89.95
                },
                "19": {
                    y: 90.35
                },
                "20": {
                    y: 91.85
                },
                "21": {
                    y: 94.45
                },
                "22": {
                    y: 96.4
                },
                "23": {
                    y: 96.95
                },
                "74": {
                    x: 341.214,
                    y: 94.639,
                    r: -0.114
                },
                "75": {
                    x: 341.243,
                    y: 87.484,
                    sx: 0.856,
                    sy: 0.856,
                    r: -0.464
                },
                "76": {
                    x: 341.246,
                    y: 77.465,
                    r: -0.959
                },
                "77": {
                    x: 341.264,
                    y: 69.536,
                    r: -1.352
                },
                "78": {
                    x: 341.25,
                    y: 66.85,
                    sx: 0.857,
                    sy: 0.857,
                    r: -1.483
                },
                "79": {
                    x: 341.264,
                    y: 71.906,
                    r: -1.575,
                    a: 0.99
                },
                "80": {
                    x: 341.238,
                    y: 88.047,
                    sx: 0.856,
                    sy: 0.856,
                    r: -1.872,
                    a: 0.95
                },
                "81": {
                    x: 341.23,
                    y: 116.656,
                    r: -2.398,
                    a: 0.88
                },
                "82": {
                    x: 341.162,
                    y: 160.074,
                    sx: 0.857,
                    sy: 0.857,
                    kx: 3.191,
                    ky: 3.093,
                    r: 0,
                    a: 0.77
                },
                "83": {
                    x: 341.13,
                    y: 221.735,
                    sx: 0.856,
                    sy: 0.856,
                    kx: 4.327,
                    ky: 1.956,
                    a: 0.61
                },
                "84": {
                    x: 341.168,
                    y: 308.844,
                    kx: 0,
                    ky: 0,
                    r: 0.359,
                    a: 0.39
                },
                "85": {
                    x: 341.25,
                    y: 461.7,
                    sx: 0.857,
                    sy: 0.857,
                    r: -2.444,
                    a: 0
                }
            })
            .addTimedChild(instance7, 23, 15, {
                "23": {
                    x: 629.8,
                    y: 47.25,
                    sx: 0.857,
                    sy: 0.547,
                    kx: 0,
                    ky: 0,
                    r: 0,
                    a: 1
                },
                "24": {
                    x: 630.29,
                    y: 54.742,
                    sx: 0.86,
                    sy: 0.695
                },
                "25": {
                    x: 632.394,
                    y: 84.777,
                    sx: 0.874,
                    sy: 1.287,
                    r: -0.005
                },
                "26": {
                    x: 635.236,
                    y: 126.148,
                    sx: 0.892,
                    sy: 2.103,
                    r: -0.013
                },
                "27": {
                    x: 636.05,
                    y: 139,
                    sx: 0.898,
                    sy: 2.356,
                    r: -0.016
                },
                "28": {
                    x: 630.95,
                    y: 19.1,
                    sx: 0.911,
                    sy: 1.493,
                    r: -0.014
                },
                "29": {
                    x: 633.45,
                    y: 85.95,
                    sx: 0.905,
                    sy: 1.36,
                    kx: -0.013,
                    ky: -0.009,
                    r: 0
                },
                "30": {
                    x: 637.765,
                    y: 203.941,
                    sx: 0.894,
                    sy: 1.127,
                    kx: -0.062,
                    ky: 0
                },
                "31": {
                    x: 642.917,
                    y: 345.493,
                    sx: 0.88,
                    sy: 0.847,
                    kx: -0.123,
                    ky: 0.009
                },
                "32": {
                    x: 647.719,
                    y: 473.831,
                    sx: 0.868,
                    sy: 0.593,
                    kx: -0.176,
                    ky: 0.018
                },
                "33": {
                    x: 650.803,
                    y: 559.523,
                    sx: 0.86,
                    sy: 0.424,
                    kx: -0.214,
                    ky: 0.023
                },
                "34": {
                    x: 651.9,
                    y: 588.8,
                    sx: 0.857,
                    sy: 0.366,
                    kx: -0.228,
                    ky: 0.027
                },
                "35": {
                    x: 651.866,
                    y: 604.279,
                    sx: 0.853,
                    sy: 0.293,
                    kx: -0.227,
                    ky: 0.026,
                    a: 0.55
                },
                "36": {
                    x: 651.882,
                    y: 615.818,
                    sx: 0.85,
                    sy: 0.238,
                    a: 0.22
                },
                "37": {
                    x: 651.9,
                    y: 623.6,
                    sx: 0.848,
                    sy: 0.202,
                    kx: -0.228,
                    ky: 0.027,
                    a: 0
                }
            })
            .addTimedChild(instance6, 23, 21, {
                "23": {
                    x: 629.8,
                    y: 47.25,
                    sx: 0.857,
                    sy: 0.547,
                    kx: 0,
                    ky: 0,
                    r: 0,
                    a: 0
                },
                "29": {
                    a: 1
                },
                "30": {
                    x: 630.29,
                    y: 54.742,
                    sx: 0.86,
                    sy: 0.695
                },
                "31": {
                    x: 632.394,
                    y: 84.777,
                    sx: 0.874,
                    sy: 1.287,
                    r: -0.005
                },
                "32": {
                    x: 635.236,
                    y: 126.148,
                    sx: 0.892,
                    sy: 2.103,
                    r: -0.013
                },
                "33": {
                    x: 636.05,
                    y: 139,
                    sx: 0.898,
                    sy: 2.356,
                    r: -0.016
                },
                "34": {
                    x: 630.95,
                    y: 19.1,
                    sx: 0.911,
                    sy: 1.493,
                    r: -0.014
                },
                "35": {
                    x: 633.426,
                    y: 86.024,
                    sx: 0.905,
                    sy: 1.36,
                    kx: -0.013,
                    ky: -0.009,
                    r: 0
                },
                "36": {
                    x: 637.741,
                    y: 204.061,
                    sx: 0.894,
                    sy: 1.127,
                    kx: -0.062,
                    ky: 0
                },
                "37": {
                    x: 642.932,
                    y: 345.503,
                    sx: 0.88,
                    sy: 0.847,
                    kx: -0.123,
                    ky: 0.009
                },
                "38": {
                    x: 647.653,
                    y: 473.859,
                    sx: 0.868,
                    sy: 0.593,
                    kx: -0.179,
                    ky: 0.018
                },
                "39": {
                    x: 650.781,
                    y: 559.57,
                    sx: 0.86,
                    sy: 0.424,
                    kx: -0.214,
                    ky: 0.023
                },
                "40": {
                    x: 651.9,
                    y: 588.8,
                    sx: 0.857,
                    sy: 0.366,
                    kx: -0.228,
                    ky: 0.027
                },
                "41": {
                    x: 651.866,
                    y: 604.279,
                    sx: 0.853,
                    sy: 0.293,
                    kx: -0.227,
                    ky: 0.026,
                    a: 0.55
                },
                "42": {
                    x: 651.882,
                    y: 615.818,
                    sx: 0.85,
                    sy: 0.238,
                    a: 0.22
                },
                "43": {
                    x: 651.9,
                    y: 623.6,
                    sx: 0.848,
                    sy: 0.202,
                    kx: -0.228,
                    ky: 0.027,
                    a: 0
                }
            })
            .addTimedChild(instance5, 23, 28, {
                "23": {
                    x: 629.8,
                    y: 47.25,
                    sx: 0.857,
                    sy: 0.547,
                    kx: 0,
                    ky: 0,
                    r: 0,
                    a: 0
                },
                "36": {
                    a: 1
                },
                "37": {
                    x: 630.29,
                    y: 54.742,
                    sx: 0.86,
                    sy: 0.695
                },
                "38": {
                    x: 632.394,
                    y: 84.777,
                    sx: 0.874,
                    sy: 1.287,
                    r: -0.005
                },
                "39": {
                    x: 635.236,
                    y: 126.148,
                    sx: 0.892,
                    sy: 2.103,
                    r: -0.013
                },
                "40": {
                    x: 636.05,
                    y: 139,
                    sx: 0.898,
                    sy: 2.356,
                    r: -0.016
                },
                "41": {
                    x: 630.95,
                    y: 19.1,
                    sx: 0.911,
                    sy: 1.493,
                    r: -0.014
                },
                "42": {
                    x: 633.426,
                    y: 86.024,
                    sx: 0.905,
                    sy: 1.36,
                    kx: -0.013,
                    ky: -0.009,
                    r: 0
                },
                "43": {
                    x: 637.741,
                    y: 204.061,
                    sx: 0.894,
                    sy: 1.127,
                    kx: -0.062,
                    ky: 0
                },
                "44": {
                    x: 642.932,
                    y: 345.503,
                    sx: 0.88,
                    sy: 0.847,
                    kx: -0.123,
                    ky: 0.009
                },
                "45": {
                    x: 647.653,
                    y: 473.859,
                    sx: 0.868,
                    sy: 0.593,
                    kx: -0.179,
                    ky: 0.018
                },
                "46": {
                    x: 650.781,
                    y: 559.57,
                    sx: 0.86,
                    sy: 0.424,
                    kx: -0.214,
                    ky: 0.023
                },
                "47": {
                    x: 651.9,
                    y: 588.8,
                    sx: 0.857,
                    sy: 0.366,
                    kx: -0.228,
                    ky: 0.027
                },
                "48": {
                    x: 651.866,
                    y: 604.279,
                    sx: 0.853,
                    sy: 0.293,
                    kx: -0.227,
                    ky: 0.026,
                    a: 0.55
                },
                "49": {
                    x: 651.882,
                    y: 615.818,
                    sx: 0.85,
                    sy: 0.238,
                    a: 0.22
                },
                "50": {
                    x: 651.9,
                    y: 623.6,
                    sx: 0.848,
                    sy: 0.202,
                    kx: -0.228,
                    ky: 0.027,
                    a: 0
                }
            })
            .addTimedChild(instance20, 44, 44, {
                "44": {
                    x: 632.1,
                    y: 487.25,
                    sx: 0.857,
                    sy: 0.857,
                    a: 0
                },
                "45": {
                    a: 0.01
                },
                "46": {
                    a: 0.04
                },
                "47": {
                    a: 0.09
                },
                "48": {
                    a: 0.18
                },
                "49": {
                    a: 0.3
                },
                "50": {
                    a: 0.45
                },
                "51": {
                    a: 0.61
                },
                "52": {
                    a: 0.76
                },
                "53": {
                    a: 0.87
                },
                "54": {
                    a: 0.95
                },
                "55": {
                    a: 0.99
                },
                "56": {
                    a: 1
                },
                "69": {
                    a: 0.97
                },
                "70": {
                    a: 0.87
                },
                "71": {
                    a: 0.68
                },
                "72": {
                    a: 0.41
                },
                "73": {
                    a: 0.17
                },
                "74": {
                    a: 0.04
                },
                "75": {
                    a: 0
                }
            })
            .addTimedChild(instance19, 44, 44, {
                "44": {
                    x: 638.1,
                    y: 323.9,
                    sx: 0.857,
                    sy: 0.857,
                    a: 0
                },
                "45": {
                    a: 0.01
                },
                "46": {
                    a: 0.04
                },
                "47": {
                    a: 0.09
                },
                "48": {
                    a: 0.18
                },
                "49": {
                    a: 0.3
                },
                "50": {
                    a: 0.45
                },
                "51": {
                    a: 0.61
                },
                "52": {
                    a: 0.76
                },
                "53": {
                    a: 0.87
                },
                "54": {
                    a: 0.95
                },
                "55": {
                    a: 0.99
                },
                "56": {
                    a: 1
                },
                "69": {
                    a: 0.97
                },
                "70": {
                    y: 323.85,
                    a: 0.87
                },
                "71": {
                    a: 0.68
                },
                "72": {
                    y: 323.8,
                    a: 0.41
                },
                "73": {
                    y: 323.75,
                    a: 0.17
                },
                "74": {
                    y: 323.7,
                    a: 0.04
                },
                "75": {
                    a: 0
                }
            })
            .addTimedChild(instance18, 44, 44, {
                "44": {
                    x: 637.8,
                    y: 307.45,
                    sx: 0.857,
                    sy: 0.857,
                    a: 0
                },
                "45": {
                    a: 0.01
                },
                "46": {
                    y: 307.4,
                    a: 0.04
                },
                "47": {
                    y: 307.35,
                    a: 0.09
                },
                "48": {
                    y: 307.25,
                    a: 0.18
                },
                "49": {
                    y: 307.15,
                    a: 0.3
                },
                "50": {
                    y: 307,
                    a: 0.45
                },
                "51": {
                    y: 306.85,
                    a: 0.61
                },
                "52": {
                    y: 306.7,
                    a: 0.76
                },
                "53": {
                    y: 306.6,
                    a: 0.87
                },
                "54": {
                    y: 306.5,
                    a: 0.95
                },
                "55": {
                    y: 306.45,
                    a: 0.99
                },
                "56": {
                    a: 1
                },
                "69": {
                    a: 0.97
                },
                "70": {
                    y: 306.4,
                    a: 0.87
                },
                "71": {
                    a: 0.68
                },
                "72": {
                    y: 306.35,
                    a: 0.41
                },
                "73": {
                    y: 306.3,
                    a: 0.17
                },
                "74": {
                    y: 306.25,
                    a: 0.04
                },
                "75": {
                    a: 0
                }
            });
    });

    lib.Clock_Date_Ani.assets = {
        "Clock_Date_Ani_atlas_1": "images/Clock_Date_Ani_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.Clock_Date_Ani,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 88,
        library: lib
    };
}