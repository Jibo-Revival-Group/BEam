(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Text = PIXI.Text;

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 15, loop: false });
        var instance1 = new Sprite(fromFrame("QR-Flash1"))
            .setTransform(-239.5, -236.5);
        this.addTimedChild(instance1);
    });

    var Graphic2 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 42, loop: false });
        var instance1 = new Sprite(fromFrame("QR-Code1"))
            .setTransform(-239.5, -236.5);
        this.addTimedChild(instance1);
    });

    var Graphic3 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 26, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_White41"))
            .setTransform(-222.9, -60.05);
        this.addTimedChild(instance1);
    });

    var Graphic4 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 34, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_White31"))
            .setTransform(-163, -48.75);
        this.addTimedChild(instance1);
    });

    var Graphic5 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 42, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_White21"))
            .setTransform(-102.4, -36.15);
        this.addTimedChild(instance1);
    });

    var Graphic6 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 49, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_White11"))
            .setTransform(-45.15, -45.5);
        this.addTimedChild(instance1);
    });

    var Graphic7 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 49, loop: false });
        var instance1 = new Graphic6(MovieClip.SYNCHED);
        var instance2 = new Graphic5(MovieClip.SYNCHED);
        var instance3 = new Graphic4(MovieClip.SYNCHED);
        var instance4 = new Graphic3(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 49, {
                "0": {
                    x: -0.05,
                    y: 124.5,
                    sx: 0.6,
                    sy: 0.6,
                    a: 0
                },
                "1": {
                    x: -0.054,
                    y: 124.509,
                    sx: 0.647,
                    sy: 0.647,
                    a: 0.1
                },
                "2": {
                    x: -0.02,
                    y: 124.476,
                    sx: 0.844,
                    sy: 0.844,
                    a: 0.5
                },
                "3": {
                    x: -0.037,
                    y: 124.501,
                    sx: 1.04,
                    sy: 1.04,
                    a: 0.91
                },
                "4": {
                    x: -0.05,
                    y: 124.5,
                    sx: 1.086,
                    sy: 1.086,
                    a: 1
                },
                "5": {
                    y: 124.516,
                    sx: 1.083,
                    sy: 1.083
                },
                "6": {
                    x: -0.049,
                    y: 124.504,
                    sx: 1.07,
                    sy: 1.07
                },
                "7": {
                    x: -0.048,
                    y: 124.473,
                    sx: 1.043,
                    sy: 1.043
                },
                "8": {
                    x: -0.047,
                    y: 124.516,
                    sx: 1.016,
                    sy: 1.016
                },
                "9": {
                    x: -0.046,
                    y: 124.477,
                    sx: 1.003,
                    sy: 1.003
                },
                "10": {
                    x: -0.05,
                    y: 124.5,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance2, 7, 42, {
                "7": {
                    y: 25.75,
                    sx: 0.682,
                    sy: 0.682,
                    a: 0
                },
                "8": {
                    y: 26.065,
                    sx: 0.707,
                    sy: 0.707,
                    a: 0.06
                },
                "9": {
                    y: 27.156,
                    sx: 0.813,
                    sy: 0.813,
                    a: 0.3
                },
                "10": {
                    y: 29.114,
                    sx: 0.992,
                    sy: 0.992,
                    a: 0.71
                },
                "11": {
                    y: 30.252,
                    sx: 1.096,
                    sy: 1.096,
                    a: 0.94
                },
                "12": {
                    y: 30.5,
                    sx: 1.122,
                    sy: 1.122,
                    a: 1
                },
                "13": {
                    y: 30.472,
                    sx: 1.117,
                    sy: 1.117
                },
                "14": {
                    y: 30.518,
                    sx: 1.098,
                    sy: 1.098
                },
                "15": {
                    y: 30.488,
                    sx: 1.06,
                    sy: 1.06
                },
                "16": {
                    y: 30.518,
                    sx: 1.023,
                    sy: 1.023
                },
                "17": {
                    y: 30.47,
                    sx: 1.005,
                    sy: 1.005
                },
                "18": {
                    y: 30.5,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance3, 15, 34, {
                "15": {
                    y: -44.55,
                    sx: 0.764,
                    sy: 0.764,
                    a: 0
                },
                "16": {
                    y: -44.228,
                    sx: 0.782,
                    sy: 0.782,
                    a: 0.06
                },
                "17": {
                    y: -43.092,
                    sx: 0.859,
                    sy: 0.859,
                    a: 0.3
                },
                "18": {
                    y: -41.099,
                    sx: 0.988,
                    sy: 0.988,
                    a: 0.71
                },
                "19": {
                    y: -40.002,
                    sx: 1.064,
                    sy: 1.064,
                    a: 0.94
                },
                "20": {
                    y: -39.8,
                    sx: 1.082,
                    sy: 1.082,
                    a: 1
                },
                "21": {
                    y: -39.783,
                    sx: 1.079,
                    sy: 1.079
                },
                "22": {
                    y: -39.771,
                    sx: 1.066,
                    sy: 1.066
                },
                "23": {
                    y: -39.83,
                    sx: 1.041,
                    sy: 1.041
                },
                "24": {
                    y: -39.847,
                    sx: 1.016,
                    sy: 1.016
                },
                "25": {
                    y: -39.842,
                    sx: 1.003,
                    sy: 1.003
                },
                "26": {
                    y: -39.8,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance4, 23, 26, {
                "23": {
                    y: -115.6,
                    sx: 0.808,
                    sy: 0.808,
                    a: 0
                },
                "24": {
                    y: -115.082,
                    sx: 0.833,
                    sy: 0.833,
                    a: 0.1
                },
                "25": {
                    y: -112.746,
                    sx: 0.935,
                    sy: 0.935,
                    a: 0.5
                },
                "26": {
                    y: -110.472,
                    sx: 1.036,
                    sy: 1.036,
                    a: 0.91
                },
                "27": {
                    y: -109.9,
                    sx: 1.06,
                    sy: 1.06,
                    a: 1
                },
                "28": {
                    y: -109.907,
                    sx: 1.058,
                    sy: 1.058
                },
                "29": {
                    y: -109.906,
                    sx: 1.049,
                    sy: 1.049
                },
                "30": {
                    y: -109.917,
                    sx: 1.03,
                    sy: 1.03
                },
                "31": {
                    y: -109.892,
                    sx: 1.011,
                    sy: 1.011
                },
                "32": {
                    y: -109.905,
                    sx: 1.002,
                    sy: 1.002
                },
                "33": {
                    y: -109.9,
                    sx: 1,
                    sy: 1
                }
            });
    });

    lib.ssid = Container.extend(function () {
        Container.call(this);
        var instance1 = this.ssid = new Text("name of wifi network")
            .setStyle({
                fontFamily: "Proxima Nova Light",
                fontSize: 45,
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(1.4499999999999886, -22.5);
        this.addChild(instance1);
    });

    var Graphic8 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 99, loop: false });
        var instance1 = new Text("Connecting to")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 80,
                fontWeight: "bold",
                fill: "#fff",
                letterSpacing: 1
            })
            .setAlign("center")
            .setTransform(2.5499999999999545, -39.5);
        this.addTimedChild(instance1);
    });

    var Graphic9 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 26, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_White41"))
            .setTransform(-222.9, -60.05);
        this.addTimedChild(instance1);
    });

    var Graphic10 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 34, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_White31"))
            .setTransform(-163, -48.75);
        this.addTimedChild(instance1);
    });

    var Graphic11 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 42, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_White21"))
            .setTransform(-102.4, -36.15);
        this.addTimedChild(instance1);
    });

    var Graphic12 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 49, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_White11"))
            .setTransform(-45.15, -45.5);
        this.addTimedChild(instance1);
    });

    var Graphic13 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 65, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_Black41"))
            .setTransform(-222.9, -60.05);
        this.addTimedChild(instance1);
    });

    var Graphic14 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 65, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_Black31"))
            .setTransform(-163, -48.75);
        this.addTimedChild(instance1);
    });

    var Graphic15 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 65, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_Black21"))
            .setTransform(-102.4, -36.15);
        this.addTimedChild(instance1);
    });

    var Graphic16 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 65, loop: false });
        var instance1 = new Sprite(fromFrame("Wifi_Black11"))
            .setTransform(-45.15, -45.5);
        this.addTimedChild(instance1);
    });

    var Graphic17 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 65, loop: false });
        var instance4 = new Graphic16(MovieClip.SYNCHED)
            .setTransform(-0.05, 124.5);
        var instance3 = new Graphic15(MovieClip.SYNCHED)
            .setTransform(0, 30.5);
        var instance2 = new Graphic14(MovieClip.SYNCHED)
            .setTransform(0, -39.8);
        var instance1 = new Graphic13(MovieClip.SYNCHED);
        var instance5 = new Graphic12(MovieClip.SYNCHED);
        var instance6 = new Graphic11(MovieClip.SYNCHED);
        var instance7 = new Graphic10(MovieClip.SYNCHED);
        var instance8 = new Graphic9(MovieClip.SYNCHED);
        this.addTimedChild(instance4)
            .addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1, 0, 65, {
                "0": {
                    y: -109.95
                }
            })
            .addTimedChild(instance5, 16, 49, {
                "16": {
                    x: -0.05,
                    y: 124.5,
                    sx: 0.6,
                    sy: 0.6,
                    a: 0
                },
                "17": {
                    x: -0.054,
                    y: 124.509,
                    sx: 0.647,
                    sy: 0.647,
                    a: 0.1
                },
                "18": {
                    x: -0.02,
                    y: 124.476,
                    sx: 0.844,
                    sy: 0.844,
                    a: 0.5
                },
                "19": {
                    x: -0.037,
                    y: 124.501,
                    sx: 1.04,
                    sy: 1.04,
                    a: 0.91
                },
                "20": {
                    x: -0.05,
                    y: 124.5,
                    sx: 1.086,
                    sy: 1.086,
                    a: 1
                },
                "21": {
                    y: 124.516,
                    sx: 1.083,
                    sy: 1.083
                },
                "22": {
                    x: -0.049,
                    y: 124.504,
                    sx: 1.07,
                    sy: 1.07
                },
                "23": {
                    x: -0.048,
                    y: 124.473,
                    sx: 1.043,
                    sy: 1.043
                },
                "24": {
                    x: -0.047,
                    y: 124.516,
                    sx: 1.016,
                    sy: 1.016
                },
                "25": {
                    x: -0.046,
                    y: 124.477,
                    sx: 1.003,
                    sy: 1.003
                },
                "26": {
                    x: -0.05,
                    y: 124.5,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance6, 23, 42, {
                "23": {
                    y: 25.75,
                    sx: 0.682,
                    sy: 0.682,
                    a: 0
                },
                "24": {
                    y: 26.065,
                    sx: 0.707,
                    sy: 0.707,
                    a: 0.06
                },
                "25": {
                    y: 27.156,
                    sx: 0.813,
                    sy: 0.813,
                    a: 0.3
                },
                "26": {
                    y: 29.114,
                    sx: 0.992,
                    sy: 0.992,
                    a: 0.71
                },
                "27": {
                    y: 30.252,
                    sx: 1.096,
                    sy: 1.096,
                    a: 0.94
                },
                "28": {
                    y: 30.5,
                    sx: 1.122,
                    sy: 1.122,
                    a: 1
                },
                "29": {
                    y: 30.472,
                    sx: 1.117,
                    sy: 1.117
                },
                "30": {
                    y: 30.518,
                    sx: 1.098,
                    sy: 1.098
                },
                "31": {
                    y: 30.488,
                    sx: 1.06,
                    sy: 1.06
                },
                "32": {
                    y: 30.518,
                    sx: 1.023,
                    sy: 1.023
                },
                "33": {
                    y: 30.47,
                    sx: 1.005,
                    sy: 1.005
                },
                "34": {
                    y: 30.5,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance7, 31, 34, {
                "31": {
                    y: -44.55,
                    sx: 0.764,
                    sy: 0.764,
                    a: 0
                },
                "32": {
                    y: -44.228,
                    sx: 0.782,
                    sy: 0.782,
                    a: 0.06
                },
                "33": {
                    y: -43.092,
                    sx: 0.859,
                    sy: 0.859,
                    a: 0.3
                },
                "34": {
                    y: -41.099,
                    sx: 0.988,
                    sy: 0.988,
                    a: 0.71
                },
                "35": {
                    y: -40.002,
                    sx: 1.064,
                    sy: 1.064,
                    a: 0.94
                },
                "36": {
                    y: -39.8,
                    sx: 1.082,
                    sy: 1.082,
                    a: 1
                },
                "37": {
                    y: -39.783,
                    sx: 1.079,
                    sy: 1.079
                },
                "38": {
                    y: -39.771,
                    sx: 1.066,
                    sy: 1.066
                },
                "39": {
                    y: -39.83,
                    sx: 1.041,
                    sy: 1.041
                },
                "40": {
                    y: -39.847,
                    sx: 1.016,
                    sy: 1.016
                },
                "41": {
                    y: -39.842,
                    sx: 1.003,
                    sy: 1.003
                },
                "42": {
                    y: -39.8,
                    sx: 1,
                    sy: 1
                }
            })
            .addTimedChild(instance8, 39, 26, {
                "39": {
                    y: -116.55,
                    sx: 0.808,
                    sy: 0.808,
                    a: 0
                },
                "40": {
                    y: -115.911,
                    sx: 0.833,
                    sy: 0.833,
                    a: 0.1
                },
                "41": {
                    y: -113.195,
                    sx: 0.935,
                    sy: 0.935,
                    a: 0.5
                },
                "42": {
                    y: -110.54,
                    sx: 1.036,
                    sy: 1.036,
                    a: 0.91
                },
                "43": {
                    y: -109.9,
                    sx: 1.06,
                    sy: 1.06,
                    a: 1
                },
                "44": {
                    y: -109.907,
                    sx: 1.058,
                    sy: 1.058
                },
                "45": {
                    y: -109.906,
                    sx: 1.049,
                    sy: 1.049
                },
                "46": {
                    y: -109.917,
                    sx: 1.03,
                    sy: 1.03
                },
                "47": {
                    y: -109.892,
                    sx: 1.011,
                    sy: 1.011
                },
                "48": {
                    y: -109.905,
                    sx: 1.002,
                    sy: 1.002
                },
                "49": {
                    y: -109.9,
                    sx: 1,
                    sy: 1
                }
            });
    });

    var Graphic18 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 58, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_Green41"))
            .setTransform(-222.9, -60.05);
        this.addTimedChild(instance1);
    });

    var Graphic19 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 58, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_Green31"))
            .setTransform(-163, -48.75);
        this.addTimedChild(instance1);
    });

    var Graphic20 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 58, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_Green21"))
            .setTransform(-102.3, -36.15);
        this.addTimedChild(instance1);
    });

    var Graphic21 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 58, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_Green11"))
            .setTransform(-45.15, -45.5);
        this.addTimedChild(instance1);
    });

    var Graphic22 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 58, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_Black41"))
            .setTransform(-222.9, -60.05);
        this.addTimedChild(instance1);
    });

    var Graphic23 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 58, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_Black31"))
            .setTransform(-163, -48.75);
        this.addTimedChild(instance1);
    });

    var Graphic24 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 58, loop: false });
        var instance1 = new Sprite(fromFrame("WiFi_Black21"))
            .setTransform(-102.4, -36.15);
        this.addTimedChild(instance1);
    });

    var Graphic25 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 58, loop: false });
        var instance1 = new Sprite(fromFrame("Wifi_Black11"))
            .setTransform(-45.15, -45.5);
        this.addTimedChild(instance1);
    });

    var Graphic26 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 58, loop: false });
        var instance8 = new Graphic25(MovieClip.SYNCHED)
            .setTransform(-0.05, 124.5);
        var instance7 = new Graphic24(MovieClip.SYNCHED)
            .setTransform(0, 30.5);
        var instance6 = new Graphic23(MovieClip.SYNCHED)
            .setTransform(0, -39.8);
        var instance5 = new Graphic22(MovieClip.SYNCHED)
            .setTransform(0, -109.95);
        var instance4 = new Graphic21(MovieClip.SYNCHED)
            .setTransform(-0.05, 124.5);
        var instance3 = new Graphic20(MovieClip.SYNCHED)
            .setTransform(0, 30.5);
        var instance2 = new Graphic19(MovieClip.SYNCHED)
            .setTransform(0, -39.8);
        var instance1 = new Graphic18(MovieClip.SYNCHED)
            .setTransform(0, -109.9);
        this.addTimedChild(instance8)
            .addTimedChild(instance7)
            .addTimedChild(instance6)
            .addTimedChild(instance5)
            .addTimedChild(instance4)
            .addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic27 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 60, loop: false });
        var instance1 = new Text("Connected!")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 80,
                fontWeight: "bold",
                fill: "#fff",
                letterSpacing: 1
            })
            .setAlign("center")
            .setTransform(0.8249999999999886, -56.35);
        this.addTimedChild(instance1);
    });

    lib.ErrorIcon = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("ErrorIcon1"))
            .setTransform(-81.5, -71.5);
        this.addChild(instance1);
    });

    lib.ErrorMessage = Container.extend(function () {
        Container.call(this);
        var instance4 = this.errorCode = new Text("Error Code Here")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 80,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(2, -60);
        var instance3 = this.message = new Text("Here's how to fix it...")
            .setStyle({
                fontFamily: "Proxima Nova Light",
                fontSize: 45,
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(2, 42);
        var instance2 = this.instructions = new Text("Tap here to connect with your new code...")
            .setStyle({
                fontFamily: "Proxima Nova Light",
                fontSize: 45,
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(1.4500000000000455, 214, 1.001, 0.991);
        var instance1 = this.macAddress = new Text("MAC Address:")
            .setStyle({
                fontFamily: "Proxima Nova Light",
                fontSize: 30,
                fill: "#828191"
            })
            .setAlign("center")
            .setTransform(-3.0499999999999545, 292, 1.008, 1.008);
        this.addChild(instance4, instance3, instance2, instance1);
    });

    lib.wifi = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 270,
            framerate: 30,
            loop: false,
            labels: {
                "playAudio-searchingToots": 0,
                QRScan: 0,
                QRScan_stop: 42,
                "playAudio-searching": 43,
                wifiSearch: 43,
                wifiSearch_stop: 91,
                wifiSearchLoop: 92,
                wifiSearchLoop_loop: 156,
                "playAudio-okDone": 157,
                wifiConnected: 157,
                wifiConnected_stop: 216,
                "playAudio-error": 217,
                wifiError: 217,
                wifiError_stop: 268
            }
        });
        var instance2 = new Graphic2(MovieClip.SYNCHED);
        var instance1 = new Graphic1(MovieClip.SYNCHED);
        var instance4 = this.ssid = new lib.ssid();
        var instance5 = new Graphic8(MovieClip.SYNCHED);
        var instance3 = new Graphic7(MovieClip.SYNCHED);
        var instance6 = new Graphic17(MovieClip.SYNCHED);
        var instance8 = new Graphic27(MovieClip.SYNCHED);
        var instance7 = new Graphic26(MovieClip.SYNCHED);
        var instance10 = this.errorMessage = new lib.ErrorMessage();
        var instance9 = new lib.ErrorIcon();
        var instance11 = new lib.ErrorIcon();
        var instance12 = new lib.ErrorIcon()
            .setTransform(640, 170);
        this.addTimedChild(instance2, 0, 42, {
                "0": {
                    x: 633,
                    y: 343,
                    sx: 1,
                    sy: 1,
                    a: 1
                },
                "26": {
                    x: 633.023,
                    y: 343.012,
                    sx: 1.014,
                    sy: 1.014
                },
                "27": {
                    x: 633.014,
                    y: 342.99,
                    sx: 1.026,
                    sy: 1.026
                },
                "28": {
                    x: 633.022,
                    y: 342.983,
                    sx: 1.035,
                    sy: 1.035
                },
                "29": {
                    x: 632.998,
                    y: 342.992,
                    sx: 1.041,
                    sy: 1.041
                },
                "30": {
                    x: 633.001,
                    y: 343.021,
                    sx: 1.045,
                    sy: 1.045
                },
                "31": {
                    x: 633,
                    y: 343,
                    sx: 1.046,
                    sy: 1.046
                },
                "32": {
                    x: 632.984,
                    y: 342.974,
                    sx: 1.038,
                    sy: 1.038,
                    a: 0.98
                },
                "33": {
                    x: 632.995,
                    y: 343.019,
                    sx: 1.018,
                    sy: 1.018,
                    a: 0.93
                },
                "34": {
                    x: 632.998,
                    y: 343.004,
                    sx: 0.981,
                    sy: 0.981,
                    a: 0.86
                },
                "35": {
                    x: 633.003,
                    y: 343.006,
                    sx: 0.923,
                    sy: 0.923,
                    a: 0.72
                },
                "36": {
                    x: 632.968,
                    y: 342.985,
                    sx: 0.84,
                    sy: 0.84,
                    a: 0.54
                },
                "37": {
                    x: 632.993,
                    y: 342.994,
                    sx: 0.748,
                    sy: 0.748,
                    a: 0.33
                },
                "38": {
                    x: 633.008,
                    y: 342.995,
                    sx: 0.676,
                    sy: 0.676,
                    a: 0.17
                },
                "39": {
                    x: 632.987,
                    y: 342.985,
                    sx: 0.631,
                    sy: 0.631,
                    a: 0.07
                },
                "40": {
                    x: 632.983,
                    y: 342.982,
                    sx: 0.609,
                    sy: 0.609,
                    a: 0.02
                },
                "41": {
                    x: 633,
                    y: 343,
                    sx: 0.601,
                    sy: 0.601,
                    a: 0
                }
            })
            .addTimedChild(instance1, 0, 15, {
                "0": {
                    x: 631.9,
                    y: 341.95,
                    a: 1
                },
                "1": {
                    a: 0.86
                },
                "2": {
                    a: 0.73
                },
                "3": {
                    a: 0.62
                },
                "4": {
                    a: 0.51
                },
                "5": {
                    a: 0.41
                },
                "6": {
                    a: 0.33
                },
                "7": {
                    a: 0.25
                },
                "8": {
                    a: 0.18
                },
                "9": {
                    a: 0.13
                },
                "10": {
                    a: 0.08
                },
                "11": {
                    a: 0.05
                },
                "12": {
                    a: 0.02
                },
                "13": {
                    a: 0
                }
            })
            .addTimedChild(instance4, 43, 172, {
                "43": {
                    x: 636.05,
                    y: 617.9,
                    a: 0
                },
                "63": {
                    a: 0.19
                },
                "64": {
                    a: 0.36
                },
                "65": {
                    a: 0.51
                },
                "66": {
                    a: 0.64
                },
                "67": {
                    a: 0.75
                },
                "68": {
                    a: 0.84
                },
                "69": {
                    a: 0.91
                },
                "70": {
                    a: 0.96
                },
                "71": {
                    a: 0.99
                },
                "72": {
                    a: 1
                },
                "208": {
                    a: 0.98
                },
                "209": {
                    a: 0.89
                },
                "210": {
                    a: 0.71
                },
                "211": {
                    a: 0.43
                },
                "212": {
                    a: 0.18
                },
                "213": {
                    a: 0.04
                },
                "214": {
                    a: 0
                }
            })
            .addTimedChild(instance5, 58, 99, {
                "58": {
                    x: 640.8,
                    y: 541.4,
                    sx: 0.8,
                    sy: 0.8,
                    a: 0
                },
                "59": {
                    x: 640.801,
                    y: 541.425,
                    sx: 0.83,
                    sy: 0.83,
                    a: 0.15
                },
                "60": {
                    x: 640.806,
                    y: 541.397,
                    sx: 0.857,
                    sy: 0.857,
                    a: 0.29
                },
                "61": {
                    x: 640.814,
                    y: 541.417,
                    sx: 0.882,
                    sy: 0.882,
                    a: 0.41
                },
                "62": {
                    x: 640.815,
                    y: 541.426,
                    sx: 0.904,
                    sy: 0.904,
                    a: 0.52
                },
                "63": {
                    x: 640.788,
                    y: 541.398,
                    sx: 0.924,
                    sy: 0.924,
                    a: 0.62
                },
                "64": {
                    x: 640.805,
                    y: 541.41,
                    sx: 0.942,
                    sy: 0.942,
                    a: 0.71
                },
                "65": {
                    x: 640.785,
                    y: 541.427,
                    sx: 0.957,
                    sy: 0.957,
                    a: 0.79
                },
                "66": {
                    x: 640.808,
                    y: 541.383,
                    sx: 0.97,
                    sy: 0.97,
                    a: 0.85
                },
                "67": {
                    x: 640.794,
                    y: 541.395,
                    sx: 0.981,
                    sy: 0.981,
                    a: 0.91
                },
                "68": {
                    x: 640.824,
                    y: 541.396,
                    sx: 0.989,
                    sy: 0.989,
                    a: 0.95
                },
                "69": {
                    x: 640.816,
                    y: 541.403,
                    sx: 0.995,
                    sy: 0.995,
                    a: 0.98
                },
                "70": {
                    x: 640.802,
                    y: 541.399,
                    sx: 0.999,
                    sy: 0.999,
                    a: 0.99
                },
                "71": {
                    x: 640.8,
                    y: 541.4,
                    sx: 1,
                    sy: 1,
                    a: 1
                }
            })
            .addTimedChild(instance3, 43, 49, {
                "43": {
                    x: 641.25,
                    y: 260.05
                }
            })
            .addTimedChild(instance6, 92, 65, {
                "92": {
                    x: 641.25,
                    y: 260.05
                }
            })
            .addTimedChild(instance8, 157, 60, {
                "157": {
                    x: 629.4,
                    y: 557.45,
                    a: 0
                },
                "158": {
                    a: 0.16
                },
                "159": {
                    a: 0.75
                },
                "160": {
                    a: 1
                },
                "205": {
                    a: 0.99
                },
                "206": {
                    a: 0.97
                },
                "207": {
                    a: 0.92
                },
                "208": {
                    a: 0.84
                },
                "209": {
                    a: 0.73
                },
                "210": {
                    a: 0.58
                },
                "211": {
                    a: 0.41
                },
                "212": {
                    a: 0.25
                },
                "213": {
                    a: 0.13
                },
                "214": {
                    a: 0.05
                },
                "215": {
                    a: 0.01
                },
                "216": {
                    a: 0
                }
            })
            .addTimedChild(instance7, 157, 58, {
                "157": {
                    x: 641.25,
                    y: 260.05,
                    sx: 1,
                    sy: 1,
                    a: 1
                },
                "158": {
                    x: 641.245,
                    y: 260.057,
                    sx: 1.011,
                    sy: 1.011
                },
                "159": {
                    x: 641.251,
                    y: 260.071,
                    sx: 1.057,
                    sy: 1.057
                },
                "160": {
                    x: 641.228,
                    y: 260.029,
                    sx: 1.118,
                    sy: 1.118
                },
                "161": {
                    x: 641.25,
                    y: 260.05,
                    sx: 1.135,
                    sy: 1.135
                },
                "162": {
                    x: 641.253,
                    y: 260.075,
                    sx: 1.133,
                    sy: 1.133
                },
                "163": {
                    x: 641.212,
                    y: 260.069,
                    sx: 1.127,
                    sy: 1.127
                },
                "164": {
                    x: 641.236,
                    y: 260.04,
                    sx: 1.115,
                    sy: 1.115
                },
                "165": {
                    x: 641.246,
                    y: 260.071,
                    sx: 1.095,
                    sy: 1.095
                },
                "166": {
                    x: 641.217,
                    y: 260.079,
                    sx: 1.066,
                    sy: 1.066
                },
                "167": {
                    x: 641.211,
                    y: 260.05,
                    sx: 1.031,
                    sy: 1.031
                },
                "168": {
                    x: 641.244,
                    y: 260.039,
                    sx: 1.001,
                    sy: 1.001
                },
                "169": {
                    x: 641.219,
                    y: 260.057,
                    sx: 0.982,
                    sy: 0.982
                },
                "170": {
                    x: 641.245,
                    y: 260.036,
                    sx: 0.972,
                    sy: 0.972
                },
                "171": {
                    x: 641.25,
                    y: 260.05,
                    sx: 0.969,
                    sy: 0.969
                },
                "172": {
                    x: 641.285,
                    y: 260.095
                },
                "173": {
                    x: 641.277,
                    y: 260.067,
                    sx: 0.97,
                    sy: 0.97
                },
                "174": {
                    x: 641.273,
                    y: 260.094,
                    sx: 0.973,
                    sy: 0.973
                },
                "175": {
                    x: 641.278,
                    y: 260.059,
                    sx: 0.976,
                    sy: 0.976
                },
                "176": {
                    x: 641.289,
                    y: 260.074,
                    sx: 0.982,
                    sy: 0.982
                },
                "177": {
                    x: 641.255,
                    y: 260.054,
                    sx: 0.988,
                    sy: 0.988
                },
                "178": {
                    x: 641.283,
                    y: 260.066,
                    sx: 0.994,
                    sy: 0.994
                },
                "179": {
                    x: 641.299,
                    y: 260.065,
                    sx: 0.998,
                    sy: 0.998
                },
                "180": {
                    x: 641.261,
                    y: 260.077,
                    sx: 0.999,
                    sy: 0.999
                },
                "181": {
                    x: 641.25,
                    y: 260.05,
                    sx: 1,
                    sy: 1
                },
                "194": {
                    x: 641.271,
                    y: 260.071,
                    sx: 1.001,
                    sy: 1.001
                },
                "195": {
                    x: 641.247,
                    y: 260.057,
                    sx: 1.002,
                    sy: 1.002
                },
                "196": {
                    x: 641.272,
                    y: 260.028,
                    sx: 1.005,
                    sy: 1.005
                },
                "197": {
                    x: 641.236,
                    y: 260.033,
                    sx: 1.011,
                    sy: 1.011
                },
                "198": {
                    x: 641.229,
                    y: 260.032,
                    sx: 1.02,
                    sy: 1.02
                },
                "199": {
                    x: 641.242,
                    y: 260.067,
                    sx: 1.034,
                    sy: 1.034
                },
                "200": {
                    x: 641.233,
                    y: 260.066,
                    sx: 1.049,
                    sy: 1.049
                },
                "201": {
                    x: 641.257,
                    y: 260.07,
                    sx: 1.058,
                    sy: 1.058
                },
                "202": {
                    x: 641.233,
                    y: 260.039,
                    sx: 1.064,
                    sy: 1.064
                },
                "203": {
                    x: 641.235,
                    y: 260.029,
                    sx: 1.066,
                    sy: 1.066
                },
                "204": {
                    x: 641.25,
                    y: 260.05,
                    sx: 1.067,
                    sy: 1.067
                },
                "205": {
                    x: 641.261,
                    y: 260.054,
                    sx: 1.061,
                    sy: 1.061,
                    a: 0.99
                },
                "206": {
                    x: 641.239,
                    y: 260.08,
                    sx: 1.045,
                    sy: 1.045,
                    a: 0.96
                },
                "207": {
                    x: 641.263,
                    y: 260.083,
                    sx: 1.013,
                    sy: 1.013,
                    a: 0.9
                },
                "208": {
                    x: 641.228,
                    y: 260.059,
                    sx: 0.955,
                    sy: 0.955,
                    a: 0.79
                },
                "209": {
                    x: 641.226,
                    y: 260.049,
                    sx: 0.857,
                    sy: 0.857,
                    a: 0.61
                },
                "210": {
                    x: 641.227,
                    y: 260.039,
                    sx: 0.721,
                    sy: 0.721,
                    a: 0.36
                },
                "211": {
                    x: 641.226,
                    y: 260.079,
                    sx: 0.619,
                    sy: 0.619,
                    a: 0.17
                },
                "212": {
                    x: 641.235,
                    y: 260.072,
                    sx: 0.565,
                    sy: 0.565,
                    a: 0.07
                },
                "213": {
                    x: 641.252,
                    y: 260.042,
                    sx: 0.538,
                    sy: 0.538,
                    a: 0.02
                },
                "214": {
                    x: 641.25,
                    y: 260.05,
                    sx: 0.529,
                    sy: 0.529,
                    a: 0
                }
            })
            .addTimedChild(instance10, 217, 53, {
                "217": {
                    x: 640,
                    y: 360,
                    a: 0
                },
                "218": {
                    a: 0.02
                },
                "219": {
                    a: 0.11
                },
                "220": {
                    a: 0.29
                },
                "221": {
                    a: 0.57
                },
                "222": {
                    a: 0.82
                },
                "223": {
                    a: 0.96
                },
                "224": {
                    a: 1
                }
            })
            .addTimedChild(instance9, 217, 11, {
                "217": {
                    x: 640,
                    y: 170
                }
            })
            .addTimedChild(instance11, 235, 13, {
                "235": {
                    x: 640,
                    y: 170
                }
            })
            .addTimedChild(instance12, 255, 15);
    });

    lib.wifi.assets = {
        "wifi_atlas_1": "images/anim/wifi_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.wifi,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 270,
        library: lib
    };
}