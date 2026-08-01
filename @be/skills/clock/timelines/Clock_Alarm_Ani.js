(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Text = PIXI.Text;

    lib.Alarm_QuestionMark = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("Alarm_QuestionMark1"))
            .setTransform(-83.7, -140.6);
        this.addChild(instance1);
    });

    lib.Alarm_Time = Container.extend(function () {
        Container.call(this);
        var instance4 = new lib.Alarm_QuestionMark()
            .setTransform(4.6, -8.15);
        this[instance4.name = "question"] = instance4;
        var instance3 = new Text(":")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 162,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(-2.049999999999997, -132.05);
        this[instance3.name = "time"] = instance3;
        var instance2 = new Text("AM? PM?")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 77,
                fontWeight: "bold",
                fill: "#11bed0"
            })
            .setAlign("center")
            .setTransform(2.1500000000000057, 43.1);
        this[instance2.name = "am_pm"] = instance2;
        var instance1 = new Text("tap to edit")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 48,
                fontWeight: "bold",
                fill: "#6c6e80"
            })
            .setAlign("center")
            .setTransform(1.9750000000000227, 136.95);
        this[instance1.name = "tapToEdit"] = instance1;
        this.addChild(instance4, instance3, instance2, instance1);
    });

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 103, loop: false });
        var instance1 = new Sprite(fromFrame("Alarm_Bell1"))
            .setTransform(-104.75, -93.65);
        this.addTimedChild(instance1);
    });

    var Graphic2 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 103, loop: false });
        var instance1 = new Sprite(fromFrame("Alarm_Bell1"))
            .setTransform(-104.75, -93.65);
        this.addTimedChild(instance1);
    });

    var Graphic3 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 103, loop: false });
        var instance1 = new Sprite(fromFrame("body1"));
        this.addTimedChild(instance1);
    });

    var Graphic4 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 4, loop: false });
        var instance1 = new Sprite(fromFrame("Alarm_Bell1"))
            .setTransform(-104.75, -93.65);
        this.addTimedChild(instance1);
    });

    var Graphic5 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 4, loop: false });
        var instance1 = new Sprite(fromFrame("Alarm_Bell1"))
            .setTransform(-104.75, -93.65);
        this.addTimedChild(instance1);
    });

    var Graphic6 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 46, loop: false });
        var instance1 = new Sprite(fromFrame("Alarm_Bell1"))
            .setTransform(-104.75, -93.65);
        this.addTimedChild(instance1);
    });

    var Graphic7 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 46, loop: false });
        var instance1 = new Sprite(fromFrame("Alarm_Bell1"))
            .setTransform(-104.75, -93.65);
        this.addTimedChild(instance1);
    });

    lib.Clock_Alarm_Ani = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 103,
            framerate: 30,
            labels: {
                alarm_in_stop: 0,
                alarm_ring_start: 1,
                alarm_ring_start_stop: 4,
                alarm_ring: 5,
                alarm_ring_loop: 7,
                alarm_ring_end: 8,
                alarm_ring_end_stop: 17,
                startBody: 27,
                alarm_body_ring: 27,
                "playAudio-alarmRing": 30,
                alarm_body_ring_loop: 102
            }
        });
        var instance4 = new Graphic3(MovieClip.SYNCHED);
        var instance3 = new Graphic2(MovieClip.SYNCHED);
        var instance6 = new Graphic5(MovieClip.SYNCHED);
        var instance8 = new Graphic7(MovieClip.SYNCHED);
        var instance2 = new Graphic1(MovieClip.SYNCHED);
        var instance5 = new Graphic4(MovieClip.SYNCHED);
        var instance7 = new Graphic6(MovieClip.SYNCHED);
        var instance1 = new lib.Alarm_Time();
        this[instance1.name = "timeClip"] = instance1;
        this.addTimedChild(instance4, 0, 103, {
                "0": {
                    x: 369.55,
                    y: 50.6,
                    sx: 1,
                    sy: 1,
                    r: 0
                },
                "1": {
                    x: 364.8,
                    y: 70.6,
                    sx: 1.02,
                    sy: 0.972
                },
                "3": {
                    x: 359.75,
                    y: 83.4,
                    sx: 1.039,
                    sy: 0.954
                },
                "5": {
                    x: 354.8,
                    y: 53.85,
                    sx: 1,
                    sy: 1,
                    r: -0.047
                },
                "6": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "7": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "8": {
                    x: 364.05,
                    y: 51,
                    sx: 0.995,
                    sy: 1.004,
                    r: -0.017
                },
                "9": {
                    x: 359.8,
                    y: 72.65,
                    sx: 1.029,
                    sy: 0.976,
                    r: 0
                },
                "11": {
                    x: 373.85,
                    y: 43.5,
                    sx: 0.987,
                    sy: 1.011
                },
                "13": {
                    x: 369.85,
                    y: 49.9,
                    sx: 1,
                    sy: 1
                },
                "27": {
                    x: 369.55,
                    y: 50.6
                },
                "28": {
                    x: 364.8,
                    y: 70.6,
                    sx: 1.02,
                    sy: 0.972
                },
                "30": {
                    x: 359.75,
                    y: 83.4,
                    sx: 1.039,
                    sy: 0.954
                },
                "32": {
                    x: 354.8,
                    y: 53.85,
                    sx: 1,
                    sy: 1,
                    r: -0.047
                },
                "33": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "34": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "35": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "36": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "37": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "38": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "39": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "40": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "41": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "42": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "43": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "44": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "45": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "46": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "47": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "48": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "49": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "50": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "51": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "52": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "53": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "54": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "55": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "56": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "57": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "58": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "59": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "60": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "61": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "62": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "63": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "64": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "65": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "66": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "67": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "68": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "69": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "70": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "71": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "72": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "73": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "74": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "75": {
                    x: 382.1,
                    y: 28.6,
                    r: 0.039
                },
                "76": {
                    x: 353.8,
                    y: 51.85,
                    r: -0.047
                },
                "77": {
                    x: 364.05,
                    y: 51,
                    sx: 0.995,
                    sy: 1.004,
                    r: -0.017
                },
                "78": {
                    x: 359.8,
                    y: 72.65,
                    sx: 1.029,
                    sy: 0.976,
                    r: 0
                },
                "80": {
                    x: 373.85,
                    y: 43.5,
                    sx: 0.987,
                    sy: 1.011
                },
                "82": {
                    x: 369.85,
                    y: 49.9,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance3, 0, 103, {
                "0": {
                    x: 839.05,
                    y: 144.65,
                    sx: 1,
                    sy: 1,
                    kx: 0,
                    ky: 3.142
                },
                "1": {
                    x: 843,
                    y: 162.05,
                    sx: 1.02,
                    sy: 0.972
                },
                "3": {
                    x: 846.95,
                    y: 174.3,
                    sx: 1.039,
                    sy: 0.954
                },
                "5": {
                    x: 828.2,
                    y: 123.2,
                    sx: 1,
                    sy: 1,
                    kx: -0.11,
                    ky: -3.032
                },
                "6": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "7": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "8": {
                    x: 833.95,
                    y: 137.3,
                    sx: 0.995,
                    sy: 1.004,
                    kx: -0.139,
                    ky: -3
                },
                "9": {
                    x: 845,
                    y: 183.35,
                    sx: 1.029,
                    sy: 0.976,
                    kx: 0,
                    ky: 3.142
                },
                "11": {
                    x: 836.4,
                    y: 167.65,
                    sx: 0.987,
                    sy: 1.011
                },
                "12": {
                    x: 837.495,
                    y: 155.558,
                    sx: 0.992,
                    sy: 1.006
                },
                "13": {
                    x: 839.05,
                    y: 138.65,
                    sx: 1,
                    sy: 1
                },
                "14": {
                    y: 139.7
                },
                "15": {
                    y: 142.95
                },
                "16": {
                    y: 144.65
                },
                "28": {
                    x: 843,
                    y: 162.05,
                    sx: 1.02,
                    sy: 0.972
                },
                "30": {
                    x: 846.95,
                    y: 174.3,
                    sx: 1.039,
                    sy: 0.954
                },
                "32": {
                    x: 828.2,
                    y: 123.2,
                    sx: 1,
                    sy: 1,
                    kx: -0.11,
                    ky: -3.032
                },
                "33": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "34": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "35": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "36": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "37": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "38": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "39": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "40": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "41": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "42": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "43": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "44": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "45": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "46": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "47": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "48": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "49": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "50": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "51": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "52": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "53": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "54": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "55": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "56": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "57": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "58": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "59": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "60": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "61": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "62": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "63": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "64": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "65": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "66": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "67": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "68": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "69": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "70": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "71": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "72": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "73": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "74": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "75": {
                    x: 847.6,
                    y: 140.4,
                    kx: 0.092,
                    ky: 3.049
                },
                "76": {
                    x: 828.2,
                    y: 123.2,
                    kx: -0.11,
                    ky: -3.032
                },
                "77": {
                    x: 833.95,
                    y: 137.3,
                    sx: 0.995,
                    sy: 1.004,
                    kx: -0.139,
                    ky: -3
                },
                "78": {
                    x: 845,
                    y: 183.35,
                    sx: 1.029,
                    sy: 0.976,
                    kx: 0,
                    ky: 3.142
                },
                "80": {
                    x: 836.4,
                    y: 167.65,
                    sx: 0.987,
                    sy: 1.011
                },
                "81": {
                    x: 837.495,
                    y: 155.558,
                    sx: 0.992,
                    sy: 1.006
                },
                "82": {
                    x: 839.05,
                    y: 138.65,
                    sx: 1,
                    sy: 1
                },
                "83": {
                    y: 139.7
                },
                "84": {
                    y: 142.95
                },
                "85": {
                    y: 144.65
                }
            })
            .addTimedChild(instance6, 5, 4, {
                "5": {
                    x: 828.25,
                    y: 123.2,
                    sx: 1,
                    sy: 1,
                    kx: 0.331,
                    ky: 2.811,
                    a: 0.45
                },
                "6": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "7": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "8": {
                    x: 834,
                    y: 137.3,
                    sx: 0.995,
                    sy: 1.003,
                    kx: 0.298,
                    ky: 2.838
                }
            })
            .addTimedChild(instance8, 32, 46, {
                "32": {
                    x: 828.25,
                    y: 123.2,
                    sx: 1,
                    sy: 1,
                    kx: 0.331,
                    ky: 2.811,
                    a: 0.45
                },
                "33": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "34": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "35": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "36": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "37": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "38": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "39": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "40": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "41": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "42": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "43": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "44": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "45": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "46": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "47": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "48": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "49": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "50": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "51": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "52": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "53": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "54": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "55": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "56": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "57": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "58": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "59": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "60": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "61": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "62": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "63": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "64": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "65": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "66": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "67": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "68": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "69": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "70": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "71": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "72": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "73": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "74": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "75": {
                    x: 847.6,
                    y: 140.4,
                    kx: -0.222,
                    ky: -2.92
                },
                "76": {
                    x: 828.25,
                    y: 123.2,
                    kx: 0.331,
                    ky: 2.811
                },
                "77": {
                    x: 834,
                    y: 137.3,
                    sx: 0.995,
                    sy: 1.003,
                    kx: 0.298,
                    ky: 2.838
                }
            })
            .addTimedChild(instance2, 0, 103, {
                "0": {
                    x: 437.75,
                    y: 141.65,
                    sx: 1,
                    sy: 1,
                    kx: 0,
                    ky: 0,
                    r: 0
                },
                "1": {
                    x: 433.8,
                    y: 159.05,
                    sx: 1.02,
                    sy: 0.972
                },
                "3": {
                    x: 429.85,
                    y: 171.3,
                    sx: 1.039,
                    sy: 0.954
                },
                "5": {
                    x: 427.4,
                    y: 139.3,
                    sx: 1,
                    sy: 1,
                    r: 0.062
                },
                "6": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "7": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "8": {
                    x: 434.9,
                    y: 141.15,
                    sx: 0.995,
                    sy: 1.004,
                    kx: -0.092,
                    ky: 0.093,
                    r: 0
                },
                "9": {
                    x: 431.8,
                    y: 180.35,
                    sx: 1.029,
                    sy: 0.976,
                    kx: 0,
                    ky: 0
                },
                "11": {
                    x: 440.4,
                    y: 164.65,
                    sx: 0.987,
                    sy: 1.011
                },
                "12": {
                    x: 439.319,
                    y: 152.571,
                    sx: 0.992,
                    sy: 1.006
                },
                "13": {
                    x: 437.75,
                    y: 135.65,
                    sx: 1,
                    sy: 1
                },
                "14": {
                    y: 136.7
                },
                "15": {
                    y: 139.95
                },
                "16": {
                    y: 141.65
                },
                "28": {
                    x: 433.8,
                    y: 159.05,
                    sx: 1.02,
                    sy: 0.972
                },
                "30": {
                    x: 429.85,
                    y: 171.3,
                    sx: 1.039,
                    sy: 0.954
                },
                "32": {
                    x: 427.4,
                    y: 139.3,
                    sx: 1,
                    sy: 1,
                    r: 0.062
                },
                "33": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "34": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "35": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "36": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "37": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "38": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "39": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "40": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "41": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "42": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "43": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "44": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "45": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "46": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "47": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "48": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "49": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "50": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "51": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "52": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "53": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "54": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "55": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "56": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "57": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "58": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "59": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "60": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "61": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "62": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "63": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "64": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "65": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "66": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "67": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "68": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "69": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "70": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "71": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "72": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "73": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "74": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "75": {
                    x: 446.6,
                    y: 121.8,
                    r: -0.105
                },
                "76": {
                    x: 427.4,
                    y: 139.3,
                    r: 0.062
                },
                "77": {
                    x: 434.9,
                    y: 141.15,
                    sx: 0.995,
                    sy: 1.004,
                    kx: -0.092,
                    ky: 0.093,
                    r: 0
                },
                "78": {
                    x: 431.8,
                    y: 180.35,
                    sx: 1.029,
                    sy: 0.976,
                    kx: 0,
                    ky: 0
                },
                "80": {
                    x: 440.4,
                    y: 164.65,
                    sx: 0.987,
                    sy: 1.011
                },
                "81": {
                    x: 439.319,
                    y: 152.571,
                    sx: 0.992,
                    sy: 1.006
                },
                "82": {
                    x: 437.75,
                    y: 135.65,
                    sx: 1,
                    sy: 1
                },
                "83": {
                    y: 136.7
                },
                "84": {
                    y: 139.95
                },
                "85": {
                    y: 141.65
                }
            })
            .addTimedChild(instance5, 5, 4, {
                "5": {
                    x: 427.4,
                    y: 139.25,
                    sx: 1,
                    sy: 1,
                    kx: 0,
                    ky: 0,
                    r: -0.361,
                    a: 0.45
                },
                "6": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "7": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "8": {
                    x: 434.95,
                    y: 141.1,
                    sx: 0.996,
                    sy: 1.003,
                    kx: 0.328,
                    ky: -0.334,
                    r: 0
                }
            })
            .addTimedChild(instance7, 32, 46, {
                "32": {
                    x: 427.4,
                    y: 139.25,
                    sx: 1,
                    sy: 1,
                    kx: 0,
                    ky: 0,
                    r: -0.361,
                    a: 0.45
                },
                "33": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "34": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "35": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "36": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "37": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "38": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "39": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "40": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "41": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "42": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "43": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "44": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "45": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "46": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "47": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "48": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "49": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "50": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "51": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "52": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "53": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "54": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "55": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "56": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "57": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "58": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "59": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "60": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "61": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "62": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "63": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "64": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "65": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "66": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "67": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "68": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "69": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "70": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "71": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "72": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "73": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "74": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "75": {
                    x: 446.6,
                    y: 121.8,
                    r: 0.126
                },
                "76": {
                    x: 427.4,
                    y: 139.25,
                    r: -0.361
                },
                "77": {
                    x: 434.95,
                    y: 141.1,
                    sx: 0.996,
                    sy: 1.003,
                    kx: 0.328,
                    ky: -0.334,
                    r: 0
                }
            })
            .addTimedChild(instance1, 0, 103, {
                "0": {
                    x: 638.85,
                    y: 403.3,
                    sx: 1,
                    sy: 1,
                    r: 0
                },
                "1": {
                    y: 413.5,
                    sx: 1.02,
                    sy: 0.972
                },
                "3": {
                    y: 420.95,
                    sx: 1.039,
                    sy: 0.954
                },
                "5": {
                    x: 640.6,
                    y: 391.2,
                    sx: 1,
                    sy: 1,
                    r: -0.047
                },
                "6": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "7": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "8": {
                    x: 639.3,
                    y: 400.4,
                    sx: 0.995,
                    sy: 1.004,
                    r: -0.017
                },
                "9": {
                    x: 638.8,
                    y: 418.6,
                    sx: 1.029,
                    sy: 0.976,
                    r: 0
                },
                "11": {
                    x: 638.85,
                    y: 400.1,
                    sx: 0.987,
                    sy: 1.011
                },
                "13": {
                    y: 403.3,
                    sx: 1,
                    sy: 1
                },
                "28": {
                    y: 413.5,
                    sx: 1.02,
                    sy: 0.972
                },
                "30": {
                    y: 420.95,
                    sx: 1.039,
                    sy: 0.954
                },
                "32": {
                    x: 640.6,
                    y: 391.2,
                    sx: 1,
                    sy: 1,
                    r: -0.047
                },
                "33": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "34": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "35": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "36": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "37": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "38": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "39": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "40": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "41": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "42": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "43": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "44": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "45": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "46": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "47": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "48": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "49": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "50": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "51": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "52": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "53": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "54": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "55": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "56": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "57": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "58": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "59": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "60": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "61": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "62": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "63": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "64": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "65": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "66": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "67": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "68": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "69": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "70": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "71": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "72": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "73": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "74": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "75": {
                    x: 637.4,
                    y: 391,
                    r: 0.039
                },
                "76": {
                    x: 640.6,
                    y: 391.2,
                    r: -0.047
                },
                "77": {
                    x: 639.3,
                    y: 400.4,
                    sx: 0.995,
                    sy: 1.004,
                    r: -0.017
                },
                "78": {
                    x: 638.8,
                    y: 418.6,
                    sx: 1.029,
                    sy: 0.976,
                    r: 0
                },
                "80": {
                    x: 638.85,
                    y: 400.1,
                    sx: 0.987,
                    sy: 1.011
                },
                "82": {
                    y: 403.3,
                    sx: 1,
                    sy: 1
                }
            });
    });

    lib.Clock_Alarm_Ani.assets = {
        "Clock_Alarm_Ani_atlas_1": "images/Clock_Alarm_Ani_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.Clock_Alarm_Ani,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 103,
        library: lib
    };
}