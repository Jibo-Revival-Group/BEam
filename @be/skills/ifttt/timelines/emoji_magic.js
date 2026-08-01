(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;

    var Graphic1 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 127, loop: false });
        var instance1 = new Sprite(fromFrame("magic-wand1"))
            .setTransform(-10.65, -151.6);
        this.addTimedChild(instance1);
    });

    var Graphic2 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic3 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic2(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic4 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic5 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic4(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic6 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic7 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic6(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic8 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic9 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic8(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic10 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic11 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic10(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic12 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic13 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic12(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic14 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic15 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic14(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic16 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic17 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic16(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic18 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic19 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic18(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic20 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance9 = new Graphic19(MovieClip.SYNCHED)
            .setTransform(-28, 82);
        var instance8 = new Graphic17(MovieClip.SYNCHED)
            .setTransform(-40.95, 122.4, 1, 1, 1.247);
        var instance7 = new Graphic15(MovieClip.SYNCHED)
            .setTransform(-80.4, 95.1, 1, 1, 0, 0.58, 2.561);
        var instance6 = new Graphic13(MovieClip.SYNCHED)
            .setTransform(-71.35, 68.25, 0.895, 0.895, -0.832);
        var instance5 = new Graphic11(MovieClip.SYNCHED)
            .setTransform(-74.25, 154.35, 0.824, 0.824, 0, 3.705, -0.564);
        var instance4 = new Graphic9(MovieClip.SYNCHED)
            .setTransform(-84.05, 103.3, 0.895, 0.895, 0, 3.937, -0.795);
        var instance3 = new Graphic7(MovieClip.SYNCHED)
            .setTransform(-66, 131, 1, 1, -2.806);
        var instance2 = new Graphic5(MovieClip.SYNCHED)
            .setTransform(-115, 125.05, 0.775, 0.775, -2.26);
        var instance1 = new Graphic3(MovieClip.SYNCHED)
            .setTransform(-116, 60.05, 0.774, 0.774, -1.117);
        this.addTimedChild(instance9)
            .addTimedChild(instance8)
            .addTimedChild(instance7)
            .addTimedChild(instance6)
            .addTimedChild(instance5)
            .addTimedChild(instance4)
            .addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic21 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic22 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic21(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic23 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic24 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic23(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic25 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic26 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic25(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic27 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic28 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic27(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic29 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic30 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic29(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic31 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance6 = new Graphic30(MovieClip.SYNCHED);
        var instance5 = new Graphic28(MovieClip.SYNCHED);
        var instance4 = new Graphic26(MovieClip.SYNCHED);
        var instance3 = new Graphic24(MovieClip.SYNCHED);
        var instance2 = new Graphic22(MovieClip.SYNCHED);
        var instance1 = new Graphic20(MovieClip.SYNCHED)
            .setTransform(40.85, -62.45, 0.765, 0.765);
        this.addTimedChild(instance6, 0, 41, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -4.65,
                    y: -1.95
                },
                "2": {
                    x: 3.6,
                    y: -8.75
                },
                "3": {
                    x: 11.15,
                    y: -15
                },
                "4": {
                    x: 18.05,
                    y: -20.7
                },
                "5": {
                    x: 24.3,
                    y: -25.85
                },
                "6": {
                    x: 29.85,
                    y: -30.5
                },
                "7": {
                    x: 34.8,
                    y: -34.55
                },
                "8": {
                    x: 39.05,
                    y: -38.1
                },
                "9": {
                    x: 42.7,
                    y: -41.1
                },
                "10": {
                    x: 45.65,
                    y: -43.55
                },
                "11": {
                    x: 47.95,
                    y: -45.45
                },
                "12": {
                    x: 49.6,
                    y: -46.8
                },
                "13": {
                    x: 50.55,
                    y: -47.65
                },
                "14": {
                    x: 50.9,
                    y: -47.9
                }
            })
            .addTimedChild(instance5, 0, 41, {
                "0": {
                    x: -26.05,
                    y: 12.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -25.85,
                    y: 26.6
                },
                "2": {
                    x: -25.7,
                    y: 39.65
                },
                "3": {
                    x: -25.55,
                    y: 51.6
                },
                "4": {
                    x: -25.45,
                    y: 62.4
                },
                "5": {
                    x: -25.3,
                    y: 72.05
                },
                "6": {
                    x: -25.2,
                    y: 80.55
                },
                "7": {
                    x: -25.1,
                    y: 87.95
                },
                "8": {
                    x: -25.05,
                    y: 94.2
                },
                "9": {
                    x: -24.95,
                    y: 99.3
                },
                "10": {
                    x: -24.9,
                    y: 103.3
                },
                "11": {
                    y: 106.15
                },
                "12": {
                    x: -24.85,
                    y: 107.85
                },
                "13": {
                    y: 108.4
                }
            })
            .addTimedChild(instance4, 0, 41, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -26.69,
                    y: 1.516,
                    sx: 0.492,
                    sy: 0.492
                },
                "2": {
                    x: -38.915,
                    y: -2.054,
                    sx: 0.476,
                    sy: 0.476
                },
                "3": {
                    x: -50.124,
                    y: -5.361,
                    sx: 0.462,
                    sy: 0.462
                },
                "4": {
                    x: -60.416,
                    y: -8.403,
                    sx: 0.448,
                    sy: 0.448
                },
                "5": {
                    x: -69.693,
                    y: -11.083,
                    sx: 0.436,
                    sy: 0.436
                },
                "6": {
                    x: -78.004,
                    y: -13.549,
                    sx: 0.425,
                    sy: 0.425
                },
                "7": {
                    x: -85.298,
                    y: -15.701,
                    sx: 0.415,
                    sy: 0.415
                },
                "8": {
                    x: -91.627,
                    y: -17.589,
                    sx: 0.407,
                    sy: 0.407
                },
                "9": {
                    x: -97.04,
                    y: -19.164,
                    sx: 0.4,
                    sy: 0.4
                },
                "10": {
                    x: -101.437,
                    y: -20.475,
                    sx: 0.394,
                    sy: 0.394
                },
                "11": {
                    x: -104.868,
                    y: -21.473,
                    sx: 0.39,
                    sy: 0.39
                },
                "12": {
                    x: -107.283,
                    y: -22.207,
                    sx: 0.386,
                    sy: 0.386
                },
                "13": {
                    x: -108.732,
                    y: -22.577,
                    sx: 0.384,
                    sy: 0.384
                },
                "14": {
                    x: -109.25,
                    y: -22.75
                }
            })
            .addTimedChild(instance3, 0, 41, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -6.89,
                    y: 12.566,
                    sx: 0.492,
                    sy: 0.492
                },
                "2": {
                    x: -0.815,
                    y: 19.196,
                    sx: 0.476,
                    sy: 0.476
                },
                "3": {
                    x: 4.876,
                    y: 25.289,
                    sx: 0.462,
                    sy: 0.462
                },
                "4": {
                    x: 9.934,
                    y: 30.847,
                    sx: 0.448,
                    sy: 0.448
                },
                "5": {
                    x: 14.607,
                    y: 35.917,
                    sx: 0.436,
                    sy: 0.436
                },
                "6": {
                    x: 18.746,
                    y: 40.401,
                    sx: 0.425,
                    sy: 0.425
                },
                "7": {
                    x: 22.452,
                    y: 44.399,
                    sx: 0.415,
                    sy: 0.415
                },
                "8": {
                    x: 25.623,
                    y: 47.861,
                    sx: 0.407,
                    sy: 0.407
                },
                "9": {
                    x: 28.31,
                    y: 50.736,
                    sx: 0.4,
                    sy: 0.4
                },
                "10": {
                    x: 30.513,
                    y: 53.125,
                    sx: 0.394,
                    sy: 0.394
                },
                "11": {
                    x: 32.182,
                    y: 54.977,
                    sx: 0.39,
                    sy: 0.39
                },
                "12": {
                    x: 33.417,
                    y: 56.343,
                    sx: 0.386,
                    sy: 0.386
                },
                "13": {
                    x: 34.168,
                    y: 57.173,
                    sx: 0.384,
                    sy: 0.384
                },
                "14": {
                    x: 34.4,
                    y: 57.4
                }
            })
            .addTimedChild(instance2, 0, 41, {
                "0": {
                    x: -18.4,
                    y: 11.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -20.7,
                    y: 6
                },
                "2": {
                    x: -22.75,
                    y: 1
                },
                "3": {
                    x: -24.7,
                    y: -3.55
                },
                "4": {
                    x: -26.4,
                    y: -7.65
                },
                "5": {
                    x: -27.95,
                    y: -11.35
                },
                "6": {
                    x: -29.35,
                    y: -14.6
                },
                "7": {
                    x: -30.5,
                    y: -17.4
                },
                "8": {
                    x: -31.5,
                    y: -19.8
                },
                "9": {
                    x: -32.35,
                    y: -21.75
                },
                "10": {
                    x: -33,
                    y: -23.25
                },
                "11": {
                    x: -33.45,
                    y: -24.35
                },
                "12": {
                    x: -33.7,
                    y: -25
                },
                "13": {
                    x: -33.8,
                    y: -25.2
                }
            })
            .addTimedChild(instance1);
    });

    var Graphic32 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic33 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic32(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic34 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic35 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic34(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic36 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic37 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic36(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic38 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic39 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic38(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic40 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic41 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic40(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic42 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic43 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic42(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic44 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic45 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic44(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic46 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic47 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic46(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic48 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic49 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic48(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 41, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic50 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance9 = new Graphic49(MovieClip.SYNCHED)
            .setTransform(-28, 82);
        var instance8 = new Graphic47(MovieClip.SYNCHED)
            .setTransform(-40.95, 122.4, 1, 1, 1.247);
        var instance7 = new Graphic45(MovieClip.SYNCHED)
            .setTransform(-80.4, 95.1, 1, 1, 0, 0.58, 2.561);
        var instance6 = new Graphic43(MovieClip.SYNCHED)
            .setTransform(-71.35, 68.25, 0.895, 0.895, -0.832);
        var instance5 = new Graphic41(MovieClip.SYNCHED)
            .setTransform(-74.25, 154.35, 0.824, 0.824, 0, 3.705, -0.564);
        var instance4 = new Graphic39(MovieClip.SYNCHED)
            .setTransform(-84.05, 103.3, 0.895, 0.895, 0, 3.937, -0.795);
        var instance3 = new Graphic37(MovieClip.SYNCHED)
            .setTransform(-66, 131, 1, 1, -2.806);
        var instance2 = new Graphic35(MovieClip.SYNCHED)
            .setTransform(-115, 125.05, 0.775, 0.775, -2.26);
        var instance1 = new Graphic33(MovieClip.SYNCHED)
            .setTransform(-116, 60.05, 0.774, 0.774, -1.117);
        this.addTimedChild(instance9)
            .addTimedChild(instance8)
            .addTimedChild(instance7)
            .addTimedChild(instance6)
            .addTimedChild(instance5)
            .addTimedChild(instance4)
            .addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic51 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic52 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic51(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic53 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic54 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic53(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic55 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic56 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic55(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic57 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic58 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic57(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic59 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic60 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance1 = new Graphic59(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic61 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 41, loop: false });
        var instance6 = new Graphic60(MovieClip.SYNCHED);
        var instance5 = new Graphic58(MovieClip.SYNCHED);
        var instance4 = new Graphic56(MovieClip.SYNCHED);
        var instance3 = new Graphic54(MovieClip.SYNCHED);
        var instance2 = new Graphic52(MovieClip.SYNCHED);
        var instance1 = new Graphic50(MovieClip.SYNCHED)
            .setTransform(40.85, -62.45, 0.765, 0.765);
        this.addTimedChild(instance6, 0, 41, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -4.65,
                    y: -1.95
                },
                "2": {
                    x: 3.6,
                    y: -8.75
                },
                "3": {
                    x: 11.15,
                    y: -15
                },
                "4": {
                    x: 18.05,
                    y: -20.7
                },
                "5": {
                    x: 24.3,
                    y: -25.85
                },
                "6": {
                    x: 29.85,
                    y: -30.5
                },
                "7": {
                    x: 34.8,
                    y: -34.55
                },
                "8": {
                    x: 39.05,
                    y: -38.1
                },
                "9": {
                    x: 42.7,
                    y: -41.1
                },
                "10": {
                    x: 45.65,
                    y: -43.55
                },
                "11": {
                    x: 47.95,
                    y: -45.45
                },
                "12": {
                    x: 49.6,
                    y: -46.8
                },
                "13": {
                    x: 50.55,
                    y: -47.65
                },
                "14": {
                    x: 50.9,
                    y: -47.9
                }
            })
            .addTimedChild(instance5, 0, 41, {
                "0": {
                    x: -26.05,
                    y: 12.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -25.85,
                    y: 26.6
                },
                "2": {
                    x: -25.7,
                    y: 39.65
                },
                "3": {
                    x: -25.55,
                    y: 51.6
                },
                "4": {
                    x: -25.45,
                    y: 62.4
                },
                "5": {
                    x: -25.3,
                    y: 72.05
                },
                "6": {
                    x: -25.2,
                    y: 80.55
                },
                "7": {
                    x: -25.1,
                    y: 87.95
                },
                "8": {
                    x: -25.05,
                    y: 94.2
                },
                "9": {
                    x: -24.95,
                    y: 99.3
                },
                "10": {
                    x: -24.9,
                    y: 103.3
                },
                "11": {
                    y: 106.15
                },
                "12": {
                    x: -24.85,
                    y: 107.85
                },
                "13": {
                    y: 108.4
                }
            })
            .addTimedChild(instance4, 0, 41, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -26.69,
                    y: 1.516,
                    sx: 0.492,
                    sy: 0.492
                },
                "2": {
                    x: -38.915,
                    y: -2.054,
                    sx: 0.476,
                    sy: 0.476
                },
                "3": {
                    x: -50.124,
                    y: -5.361,
                    sx: 0.462,
                    sy: 0.462
                },
                "4": {
                    x: -60.416,
                    y: -8.403,
                    sx: 0.448,
                    sy: 0.448
                },
                "5": {
                    x: -69.693,
                    y: -11.083,
                    sx: 0.436,
                    sy: 0.436
                },
                "6": {
                    x: -78.004,
                    y: -13.549,
                    sx: 0.425,
                    sy: 0.425
                },
                "7": {
                    x: -85.298,
                    y: -15.701,
                    sx: 0.415,
                    sy: 0.415
                },
                "8": {
                    x: -91.627,
                    y: -17.589,
                    sx: 0.407,
                    sy: 0.407
                },
                "9": {
                    x: -97.04,
                    y: -19.164,
                    sx: 0.4,
                    sy: 0.4
                },
                "10": {
                    x: -101.437,
                    y: -20.475,
                    sx: 0.394,
                    sy: 0.394
                },
                "11": {
                    x: -104.868,
                    y: -21.473,
                    sx: 0.39,
                    sy: 0.39
                },
                "12": {
                    x: -107.283,
                    y: -22.207,
                    sx: 0.386,
                    sy: 0.386
                },
                "13": {
                    x: -108.732,
                    y: -22.577,
                    sx: 0.384,
                    sy: 0.384
                },
                "14": {
                    x: -109.25,
                    y: -22.75
                }
            })
            .addTimedChild(instance3, 0, 41, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -6.89,
                    y: 12.566,
                    sx: 0.492,
                    sy: 0.492
                },
                "2": {
                    x: -0.815,
                    y: 19.196,
                    sx: 0.476,
                    sy: 0.476
                },
                "3": {
                    x: 4.876,
                    y: 25.289,
                    sx: 0.462,
                    sy: 0.462
                },
                "4": {
                    x: 9.934,
                    y: 30.847,
                    sx: 0.448,
                    sy: 0.448
                },
                "5": {
                    x: 14.607,
                    y: 35.917,
                    sx: 0.436,
                    sy: 0.436
                },
                "6": {
                    x: 18.746,
                    y: 40.401,
                    sx: 0.425,
                    sy: 0.425
                },
                "7": {
                    x: 22.452,
                    y: 44.399,
                    sx: 0.415,
                    sy: 0.415
                },
                "8": {
                    x: 25.623,
                    y: 47.861,
                    sx: 0.407,
                    sy: 0.407
                },
                "9": {
                    x: 28.31,
                    y: 50.736,
                    sx: 0.4,
                    sy: 0.4
                },
                "10": {
                    x: 30.513,
                    y: 53.125,
                    sx: 0.394,
                    sy: 0.394
                },
                "11": {
                    x: 32.182,
                    y: 54.977,
                    sx: 0.39,
                    sy: 0.39
                },
                "12": {
                    x: 33.417,
                    y: 56.343,
                    sx: 0.386,
                    sy: 0.386
                },
                "13": {
                    x: 34.168,
                    y: 57.173,
                    sx: 0.384,
                    sy: 0.384
                },
                "14": {
                    x: 34.4,
                    y: 57.4
                }
            })
            .addTimedChild(instance2, 0, 41, {
                "0": {
                    x: -18.4,
                    y: 11.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -20.7,
                    y: 6
                },
                "2": {
                    x: -22.75,
                    y: 1
                },
                "3": {
                    x: -24.7,
                    y: -3.55
                },
                "4": {
                    x: -26.4,
                    y: -7.65
                },
                "5": {
                    x: -27.95,
                    y: -11.35
                },
                "6": {
                    x: -29.35,
                    y: -14.6
                },
                "7": {
                    x: -30.5,
                    y: -17.4
                },
                "8": {
                    x: -31.5,
                    y: -19.8
                },
                "9": {
                    x: -32.35,
                    y: -21.75
                },
                "10": {
                    x: -33,
                    y: -23.25
                },
                "11": {
                    x: -33.45,
                    y: -24.35
                },
                "12": {
                    x: -33.7,
                    y: -25
                },
                "13": {
                    x: -33.8,
                    y: -25.2
                }
            })
            .addTimedChild(instance1);
    });

    var Graphic62 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 108, loop: false });
        var instance1 = new Sprite(fromFrame("magic-hat1"))
            .setTransform(-165.35, -107.5);
        this.addTimedChild(instance1);
    });

    var Graphic63 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 72, loop: false });
        var instance1 = new Sprite(fromFrame("magic-hat2"))
            .setTransform(-165.35, -147.4);
        this.addTimedChild(instance1);
    });

    var Graphic64 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 28, loop: false });
        var instance1 = new Sprite(fromFrame("Symbol 11"));
        this.addTimedChild(instance1);
    });

    var Graphic65 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 28, loop: false });
        var instance1 = new Sprite(fromFrame("Symbol 11"));
        this.addTimedChild(instance1);
    });

    var Graphic66 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 28, loop: false });
        var instance2 = new Graphic65(MovieClip.SYNCHED)
            .setTransform(-152.05, -28.45);
        var instance1 = new Graphic64(MovieClip.SYNCHED)
            .setTransform(97.95, -28.45);
        this.addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic67 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("rabbit-eye1"))
            .setTransform(-7.5, -7.5);
        this.addTimedChild(instance1);
    });

    var Graphic68 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("rabbit-eye1"))
            .setTransform(-7.5, -7.5);
        this.addTimedChild(instance1);
    });

    var Graphic69 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("rabbit-nose1"))
            .setTransform(-36.75, -22.35);
        this.addTimedChild(instance1);
    });

    var Graphic70 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance3 = new Graphic69(MovieClip.SYNCHED)
            .setTransform(0, 14.2);
        var instance2 = new Graphic68(MovieClip.SYNCHED)
            .setTransform(-19.55, -29.05);
        var instance1 = new Graphic67(MovieClip.SYNCHED)
            .setTransform(18.45, -29.05);
        this.addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic71 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 35, loop: false });
        var instance1 = new Sprite(fromFrame("rabbit-body1"))
            .setTransform(-72.9, -70.95);
        this.addTimedChild(instance1);
    });

    var Graphic72 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("rabbit-ear1"))
            .setTransform(-26.3, -84.7);
        this.addTimedChild(instance1);
    });

    var Graphic73 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("rabbit-ear1"))
            .setTransform(-26.3, -84.7);
        this.addTimedChild(instance1);
    });

    var Graphic74 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance2 = new Graphic73(MovieClip.SYNCHED);
        var instance1 = new Graphic72(MovieClip.SYNCHED);
        var instance4 = new Graphic71(MovieClip.SYNCHED);
        var instance3 = new Graphic70(MovieClip.SYNCHED);
        this.addTimedChild(instance2, 0, 36, {
                "0": {
                    x: -52.2,
                    y: 198.05,
                    sx: 1,
                    sy: 1,
                    kx: 0.552,
                    ky: 2.589
                },
                "1": {
                    x: -74.95,
                    y: 103.25
                },
                "2": {
                    x: -61.742,
                    y: 32.314,
                    sx: 0.999,
                    sy: 0.999,
                    kx: 0.333,
                    ky: 2.809
                },
                "3": {
                    x: -47.05,
                    y: -35.5,
                    sx: 1,
                    sy: 1,
                    kx: 0.118,
                    ky: 3.024
                },
                "4": {
                    x: -40.756,
                    y: -51.475,
                    kx: 0.031,
                    ky: 3.111
                },
                "5": {
                    x: -34.55,
                    y: -66.8,
                    kx: -0.052,
                    ky: -3.089
                },
                "6": {
                    x: -35.522,
                    y: -66.257,
                    kx: -0.04,
                    ky: -3.102
                },
                "7": {
                    x: -36.25,
                    y: -65.7,
                    kx: -0.03,
                    ky: -3.112
                },
                "8": {
                    x: -36.784,
                    y: -63.723,
                    kx: -0.022,
                    ky: -3.119
                },
                "9": {
                    x: -37.147,
                    y: -61.798,
                    kx: -0.018,
                    ky: -3.124
                },
                "10": {
                    x: -37.72,
                    y: -59.802,
                    kx: -0.01,
                    ky: -3.132
                },
                "11": {
                    x: -38.079,
                    y: -57.872,
                    kx: -0.005,
                    ky: -3.137
                },
                "12": {
                    x: -38.45,
                    y: -55.95,
                    kx: 0,
                    ky: 3.142
                }
            })
            .addTimedChild(instance1, 0, 36, {
                "0": {
                    x: 61.7,
                    y: 190.8,
                    sx: 1,
                    sy: 1,
                    r: 0.445
                },
                "1": {
                    x: 69.3,
                    y: 96
                },
                "2": {
                    x: 57.971,
                    y: 28.865,
                    sx: 0.999,
                    sy: 0.999,
                    r: 0.271
                },
                "3": {
                    x: 45.85,
                    y: -36.3,
                    sx: 1,
                    sy: 1,
                    r: 0.099
                },
                "4": {
                    x: 39.914,
                    y: -51.686,
                    r: 0.019
                },
                "5": {
                    x: 34.35,
                    y: -66.6,
                    r: -0.056
                },
                "6": {
                    x: 35.196,
                    y: -66.098,
                    r: -0.045
                },
                "7": {
                    x: 35.65,
                    y: -65.7,
                    r: -0.039
                },
                "8": {
                    x: 36.222,
                    y: -63.756,
                    r: -0.031
                },
                "9": {
                    x: 36.877,
                    y: -61.799,
                    r: -0.022
                },
                "10": {
                    x: 37.479,
                    y: -59.836,
                    r: -0.014
                },
                "11": {
                    x: 38.127,
                    y: -57.87,
                    r: -0.005
                },
                "12": {
                    x: 38.55,
                    y: -55.95,
                    r: 0
                }
            })
            .addTimedChild(instance4, 1, 35, {
                "1": {
                    y: 203.45
                },
                "2": {
                    y: 149.6
                },
                "3": {
                    y: 95.7
                },
                "4": {
                    y: 81.65
                },
                "5": {
                    y: 67.6
                },
                "6": {
                    y: 68
                },
                "7": {
                    y: 68.4
                },
                "8": {
                    y: 70.25
                },
                "9": {
                    y: 72.1
                },
                "10": {
                    y: 74
                },
                "11": {
                    y: 75.85
                },
                "12": {
                    y: 77.7
                }
            })
            .addTimedChild(instance3, 1, 35, {
                "1": {
                    x: 2.05,
                    y: 209.35
                },
                "2": {
                    y: 152.45
                },
                "3": {
                    y: 95.55
                },
                "4": {
                    y: 74.3
                },
                "5": {
                    y: 53.05
                },
                "6": {
                    y: 55.7
                },
                "7": {
                    y: 58.35
                },
                "8": {
                    y: 60.5
                },
                "9": {
                    y: 62.7
                },
                "10": {
                    y: 64.85
                },
                "11": {
                    y: 67.05
                },
                "12": {
                    y: 69.2
                }
            });
    });

    var Graphic75 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 36, loop: false });
        var instance1 = new Sprite(fromFrame("magic-hat2"))
            .setTransform(-165.35, -147.4);
        this.addTimedChild(instance1);
    });

    var Graphic76 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic77 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic76(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 23, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            }
        });
    });

    var Graphic78 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic79 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic78(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 23, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            }
        });
    });

    var Graphic80 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic81 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic80(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 23, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            }
        });
    });

    var Graphic82 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic83 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic82(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 23, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            }
        });
    });

    var Graphic84 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic85 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic84(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 23, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            }
        });
    });

    var Graphic86 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic87 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic86(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 23, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            }
        });
    });

    var Graphic88 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic89 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic88(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 23, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            }
        });
    });

    var Graphic90 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic91 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic90(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 23, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            }
        });
    });

    var Graphic92 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic93 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic92(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 23, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            }
        });
    });

    var Graphic94 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance9 = new Graphic93(MovieClip.SYNCHED)
            .setTransform(-28, 82);
        var instance8 = new Graphic91(MovieClip.SYNCHED)
            .setTransform(-40.95, 122.4, 1, 1, 1.247);
        var instance7 = new Graphic89(MovieClip.SYNCHED)
            .setTransform(-80.4, 95.1, 1, 1, 0, 0.58, 2.561);
        var instance6 = new Graphic87(MovieClip.SYNCHED)
            .setTransform(-71.35, 68.25, 0.895, 0.895, -0.832);
        var instance5 = new Graphic85(MovieClip.SYNCHED)
            .setTransform(-74.25, 154.35, 0.824, 0.824, 0, 3.705, -0.564);
        var instance4 = new Graphic83(MovieClip.SYNCHED)
            .setTransform(-84.05, 103.3, 0.895, 0.895, 0, 3.937, -0.795);
        var instance3 = new Graphic81(MovieClip.SYNCHED)
            .setTransform(-66, 131, 1, 1, -2.806);
        var instance2 = new Graphic79(MovieClip.SYNCHED)
            .setTransform(-115, 125.05, 0.775, 0.775, -2.26);
        var instance1 = new Graphic77(MovieClip.SYNCHED)
            .setTransform(-116, 60.05, 0.774, 0.774, -1.117);
        this.addTimedChild(instance9)
            .addTimedChild(instance8)
            .addTimedChild(instance7)
            .addTimedChild(instance6)
            .addTimedChild(instance5)
            .addTimedChild(instance4)
            .addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic95 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic96 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic95(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic97 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic98 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic97(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic99 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic100 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic99(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic101 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic102 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic101(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic103 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic104 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance1 = new Graphic103(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic105 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 23, loop: false });
        var instance6 = new Graphic104(MovieClip.SYNCHED);
        var instance5 = new Graphic102(MovieClip.SYNCHED);
        var instance4 = new Graphic100(MovieClip.SYNCHED);
        var instance3 = new Graphic98(MovieClip.SYNCHED);
        var instance2 = new Graphic96(MovieClip.SYNCHED);
        var instance1 = new Graphic94(MovieClip.SYNCHED)
            .setTransform(40.85, -62.45, 0.765, 0.765);
        this.addTimedChild(instance6, 0, 23, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -4.65,
                    y: -1.95
                },
                "2": {
                    x: 3.6,
                    y: -8.75
                },
                "3": {
                    x: 11.15,
                    y: -15
                },
                "4": {
                    x: 18.05,
                    y: -20.7
                },
                "5": {
                    x: 24.3,
                    y: -25.85
                },
                "6": {
                    x: 29.85,
                    y: -30.5
                },
                "7": {
                    x: 34.8,
                    y: -34.55
                },
                "8": {
                    x: 39.05,
                    y: -38.1
                },
                "9": {
                    x: 42.7,
                    y: -41.1
                },
                "10": {
                    x: 45.65,
                    y: -43.55
                },
                "11": {
                    x: 47.95,
                    y: -45.45
                },
                "12": {
                    x: 49.6,
                    y: -46.8
                },
                "13": {
                    x: 50.55,
                    y: -47.65
                },
                "14": {
                    x: 50.9,
                    y: -47.9
                }
            })
            .addTimedChild(instance5, 0, 23, {
                "0": {
                    x: -26.05,
                    y: 12.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -25.85,
                    y: 26.6
                },
                "2": {
                    x: -25.7,
                    y: 39.65
                },
                "3": {
                    x: -25.55,
                    y: 51.6
                },
                "4": {
                    x: -25.45,
                    y: 62.4
                },
                "5": {
                    x: -25.3,
                    y: 72.05
                },
                "6": {
                    x: -25.2,
                    y: 80.55
                },
                "7": {
                    x: -25.1,
                    y: 87.95
                },
                "8": {
                    x: -25.05,
                    y: 94.2
                },
                "9": {
                    x: -24.95,
                    y: 99.3
                },
                "10": {
                    x: -24.9,
                    y: 103.3
                },
                "11": {
                    y: 106.15
                },
                "12": {
                    x: -24.85,
                    y: 107.85
                },
                "13": {
                    y: 108.4
                }
            })
            .addTimedChild(instance4, 0, 23, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -26.69,
                    y: 1.516,
                    sx: 0.492,
                    sy: 0.492
                },
                "2": {
                    x: -38.915,
                    y: -2.054,
                    sx: 0.476,
                    sy: 0.476
                },
                "3": {
                    x: -50.124,
                    y: -5.361,
                    sx: 0.462,
                    sy: 0.462
                },
                "4": {
                    x: -60.416,
                    y: -8.403,
                    sx: 0.448,
                    sy: 0.448
                },
                "5": {
                    x: -69.693,
                    y: -11.083,
                    sx: 0.436,
                    sy: 0.436
                },
                "6": {
                    x: -78.004,
                    y: -13.549,
                    sx: 0.425,
                    sy: 0.425
                },
                "7": {
                    x: -85.298,
                    y: -15.701,
                    sx: 0.415,
                    sy: 0.415
                },
                "8": {
                    x: -91.627,
                    y: -17.589,
                    sx: 0.407,
                    sy: 0.407
                },
                "9": {
                    x: -97.04,
                    y: -19.164,
                    sx: 0.4,
                    sy: 0.4
                },
                "10": {
                    x: -101.437,
                    y: -20.475,
                    sx: 0.394,
                    sy: 0.394
                },
                "11": {
                    x: -104.868,
                    y: -21.473,
                    sx: 0.39,
                    sy: 0.39
                },
                "12": {
                    x: -107.283,
                    y: -22.207,
                    sx: 0.386,
                    sy: 0.386
                },
                "13": {
                    x: -108.732,
                    y: -22.577,
                    sx: 0.384,
                    sy: 0.384
                },
                "14": {
                    x: -109.25,
                    y: -22.75
                }
            })
            .addTimedChild(instance3, 0, 23, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -6.89,
                    y: 12.566,
                    sx: 0.492,
                    sy: 0.492
                },
                "2": {
                    x: -0.815,
                    y: 19.196,
                    sx: 0.476,
                    sy: 0.476
                },
                "3": {
                    x: 4.876,
                    y: 25.289,
                    sx: 0.462,
                    sy: 0.462
                },
                "4": {
                    x: 9.934,
                    y: 30.847,
                    sx: 0.448,
                    sy: 0.448
                },
                "5": {
                    x: 14.607,
                    y: 35.917,
                    sx: 0.436,
                    sy: 0.436
                },
                "6": {
                    x: 18.746,
                    y: 40.401,
                    sx: 0.425,
                    sy: 0.425
                },
                "7": {
                    x: 22.452,
                    y: 44.399,
                    sx: 0.415,
                    sy: 0.415
                },
                "8": {
                    x: 25.623,
                    y: 47.861,
                    sx: 0.407,
                    sy: 0.407
                },
                "9": {
                    x: 28.31,
                    y: 50.736,
                    sx: 0.4,
                    sy: 0.4
                },
                "10": {
                    x: 30.513,
                    y: 53.125,
                    sx: 0.394,
                    sy: 0.394
                },
                "11": {
                    x: 32.182,
                    y: 54.977,
                    sx: 0.39,
                    sy: 0.39
                },
                "12": {
                    x: 33.417,
                    y: 56.343,
                    sx: 0.386,
                    sy: 0.386
                },
                "13": {
                    x: 34.168,
                    y: 57.173,
                    sx: 0.384,
                    sy: 0.384
                },
                "14": {
                    x: 34.4,
                    y: 57.4
                }
            })
            .addTimedChild(instance2, 0, 23, {
                "0": {
                    x: -18.4,
                    y: 11.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -20.7,
                    y: 6
                },
                "2": {
                    x: -22.75,
                    y: 1
                },
                "3": {
                    x: -24.7,
                    y: -3.55
                },
                "4": {
                    x: -26.4,
                    y: -7.65
                },
                "5": {
                    x: -27.95,
                    y: -11.35
                },
                "6": {
                    x: -29.35,
                    y: -14.6
                },
                "7": {
                    x: -30.5,
                    y: -17.4
                },
                "8": {
                    x: -31.5,
                    y: -19.8
                },
                "9": {
                    x: -32.35,
                    y: -21.75
                },
                "10": {
                    x: -33,
                    y: -23.25
                },
                "11": {
                    x: -33.45,
                    y: -24.35
                },
                "12": {
                    x: -33.7,
                    y: -25
                },
                "13": {
                    x: -33.8,
                    y: -25.2
                }
            })
            .addTimedChild(instance1);
    });

    var Graphic106 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic107 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic106(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic108 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic109 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic108(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic110 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic111 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic110(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic112 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic113 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic112(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic114 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic115 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic114(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic116 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic117 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic116(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic118 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic119 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic118(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic120 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic121 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic120(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic122 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic123 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic122(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic124 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance9 = new Graphic123(MovieClip.SYNCHED)
            .setTransform(-28, 82);
        var instance8 = new Graphic121(MovieClip.SYNCHED)
            .setTransform(-40.95, 122.4, 1, 1, 1.247);
        var instance7 = new Graphic119(MovieClip.SYNCHED)
            .setTransform(-80.4, 95.1, 1, 1, 0, 0.58, 2.561);
        var instance6 = new Graphic117(MovieClip.SYNCHED)
            .setTransform(-71.35, 68.25, 0.895, 0.895, -0.832);
        var instance5 = new Graphic115(MovieClip.SYNCHED)
            .setTransform(-74.25, 154.35, 0.824, 0.824, 0, 3.705, -0.564);
        var instance4 = new Graphic113(MovieClip.SYNCHED)
            .setTransform(-84.05, 103.3, 0.895, 0.895, 0, 3.937, -0.795);
        var instance3 = new Graphic111(MovieClip.SYNCHED)
            .setTransform(-66, 131, 1, 1, -2.806);
        var instance2 = new Graphic109(MovieClip.SYNCHED)
            .setTransform(-115, 125.05, 0.775, 0.775, -2.26);
        var instance1 = new Graphic107(MovieClip.SYNCHED)
            .setTransform(-116, 60.05, 0.774, 0.774, -1.117);
        this.addTimedChild(instance9)
            .addTimedChild(instance8)
            .addTimedChild(instance7)
            .addTimedChild(instance6)
            .addTimedChild(instance5)
            .addTimedChild(instance4)
            .addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic125 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic126 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic125(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic127 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic128 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic127(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic129 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic130 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic129(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic131 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic132 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic131(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic133 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic134 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic133(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic135 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance6 = new Graphic134(MovieClip.SYNCHED);
        var instance5 = new Graphic132(MovieClip.SYNCHED);
        var instance4 = new Graphic130(MovieClip.SYNCHED);
        var instance3 = new Graphic128(MovieClip.SYNCHED);
        var instance2 = new Graphic126(MovieClip.SYNCHED);
        var instance1 = new Graphic124(MovieClip.SYNCHED)
            .setTransform(40.85, -62.45, 0.765, 0.765);
        this.addTimedChild(instance6, 0, 47, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -4.65,
                    y: -1.95
                },
                "2": {
                    x: 3.6,
                    y: -8.75
                },
                "3": {
                    x: 11.15,
                    y: -15
                },
                "4": {
                    x: 18.05,
                    y: -20.7
                },
                "5": {
                    x: 24.3,
                    y: -25.85
                },
                "6": {
                    x: 29.85,
                    y: -30.5
                },
                "7": {
                    x: 34.8,
                    y: -34.55
                },
                "8": {
                    x: 39.05,
                    y: -38.1
                },
                "9": {
                    x: 42.7,
                    y: -41.1
                },
                "10": {
                    x: 45.65,
                    y: -43.55
                },
                "11": {
                    x: 47.95,
                    y: -45.45
                },
                "12": {
                    x: 49.6,
                    y: -46.8
                },
                "13": {
                    x: 50.55,
                    y: -47.65
                },
                "14": {
                    x: 50.9,
                    y: -47.9
                }
            })
            .addTimedChild(instance5, 0, 47, {
                "0": {
                    x: -26.05,
                    y: 12.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -25.85,
                    y: 26.6
                },
                "2": {
                    x: -25.7,
                    y: 39.65
                },
                "3": {
                    x: -25.55,
                    y: 51.6
                },
                "4": {
                    x: -25.45,
                    y: 62.4
                },
                "5": {
                    x: -25.3,
                    y: 72.05
                },
                "6": {
                    x: -25.2,
                    y: 80.55
                },
                "7": {
                    x: -25.1,
                    y: 87.95
                },
                "8": {
                    x: -25.05,
                    y: 94.2
                },
                "9": {
                    x: -24.95,
                    y: 99.3
                },
                "10": {
                    x: -24.9,
                    y: 103.3
                },
                "11": {
                    y: 106.15
                },
                "12": {
                    x: -24.85,
                    y: 107.85
                },
                "13": {
                    y: 108.4
                }
            })
            .addTimedChild(instance4, 0, 47, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -26.69,
                    y: 1.516,
                    sx: 0.492,
                    sy: 0.492
                },
                "2": {
                    x: -38.915,
                    y: -2.054,
                    sx: 0.476,
                    sy: 0.476
                },
                "3": {
                    x: -50.124,
                    y: -5.361,
                    sx: 0.462,
                    sy: 0.462
                },
                "4": {
                    x: -60.416,
                    y: -8.403,
                    sx: 0.448,
                    sy: 0.448
                },
                "5": {
                    x: -69.693,
                    y: -11.083,
                    sx: 0.436,
                    sy: 0.436
                },
                "6": {
                    x: -78.004,
                    y: -13.549,
                    sx: 0.425,
                    sy: 0.425
                },
                "7": {
                    x: -85.298,
                    y: -15.701,
                    sx: 0.415,
                    sy: 0.415
                },
                "8": {
                    x: -91.627,
                    y: -17.589,
                    sx: 0.407,
                    sy: 0.407
                },
                "9": {
                    x: -97.04,
                    y: -19.164,
                    sx: 0.4,
                    sy: 0.4
                },
                "10": {
                    x: -101.437,
                    y: -20.475,
                    sx: 0.394,
                    sy: 0.394
                },
                "11": {
                    x: -104.868,
                    y: -21.473,
                    sx: 0.39,
                    sy: 0.39
                },
                "12": {
                    x: -107.283,
                    y: -22.207,
                    sx: 0.386,
                    sy: 0.386
                },
                "13": {
                    x: -108.732,
                    y: -22.577,
                    sx: 0.384,
                    sy: 0.384
                },
                "14": {
                    x: -109.25,
                    y: -22.75
                }
            })
            .addTimedChild(instance3, 0, 47, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -6.89,
                    y: 12.566,
                    sx: 0.492,
                    sy: 0.492
                },
                "2": {
                    x: -0.815,
                    y: 19.196,
                    sx: 0.476,
                    sy: 0.476
                },
                "3": {
                    x: 4.876,
                    y: 25.289,
                    sx: 0.462,
                    sy: 0.462
                },
                "4": {
                    x: 9.934,
                    y: 30.847,
                    sx: 0.448,
                    sy: 0.448
                },
                "5": {
                    x: 14.607,
                    y: 35.917,
                    sx: 0.436,
                    sy: 0.436
                },
                "6": {
                    x: 18.746,
                    y: 40.401,
                    sx: 0.425,
                    sy: 0.425
                },
                "7": {
                    x: 22.452,
                    y: 44.399,
                    sx: 0.415,
                    sy: 0.415
                },
                "8": {
                    x: 25.623,
                    y: 47.861,
                    sx: 0.407,
                    sy: 0.407
                },
                "9": {
                    x: 28.31,
                    y: 50.736,
                    sx: 0.4,
                    sy: 0.4
                },
                "10": {
                    x: 30.513,
                    y: 53.125,
                    sx: 0.394,
                    sy: 0.394
                },
                "11": {
                    x: 32.182,
                    y: 54.977,
                    sx: 0.39,
                    sy: 0.39
                },
                "12": {
                    x: 33.417,
                    y: 56.343,
                    sx: 0.386,
                    sy: 0.386
                },
                "13": {
                    x: 34.168,
                    y: 57.173,
                    sx: 0.384,
                    sy: 0.384
                },
                "14": {
                    x: 34.4,
                    y: 57.4
                }
            })
            .addTimedChild(instance2, 0, 47, {
                "0": {
                    x: -18.4,
                    y: 11.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -20.7,
                    y: 6
                },
                "2": {
                    x: -22.75,
                    y: 1
                },
                "3": {
                    x: -24.7,
                    y: -3.55
                },
                "4": {
                    x: -26.4,
                    y: -7.65
                },
                "5": {
                    x: -27.95,
                    y: -11.35
                },
                "6": {
                    x: -29.35,
                    y: -14.6
                },
                "7": {
                    x: -30.5,
                    y: -17.4
                },
                "8": {
                    x: -31.5,
                    y: -19.8
                },
                "9": {
                    x: -32.35,
                    y: -21.75
                },
                "10": {
                    x: -33,
                    y: -23.25
                },
                "11": {
                    x: -33.45,
                    y: -24.35
                },
                "12": {
                    x: -33.7,
                    y: -25
                },
                "13": {
                    x: -33.8,
                    y: -25.2
                }
            })
            .addTimedChild(instance1);
    });

    var Graphic136 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic137 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic136(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic138 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic139 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic138(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic140 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic141 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic140(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic142 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic143 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic142(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic144 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic145 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic144(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic146 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic147 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic146(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic148 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic149 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic148(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic150 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic151 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic150(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic152 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Sprite(fromFrame("+1"))
            .setTransform(-20.05, -20.05, 0.851, 0.851);
        this.addTimedChild(instance1);
    });

    var Graphic153 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic152(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 47, {
            "0": {
                x: 0,
                y: 0,
                sx: 0.201,
                sy: 0.201,
                r: 0,
                a: 1
            },
            "1": {
                x: 1.1,
                y: -3.6,
                sx: 0.221,
                sy: 0.221,
                r: -0.001
            },
            "2": {
                x: 2.55,
                y: -8.25,
                sx: 0.247,
                sy: 0.247,
                r: -0.009
            },
            "3": {
                x: 4.3,
                y: -13.9,
                sx: 0.279,
                sy: 0.279,
                r: -0.014
            },
            "4": {
                x: 6.35,
                y: -20.6,
                sx: 0.317,
                sy: 0.317,
                r: -0.023
            },
            "5": {
                x: 8.7,
                y: -28.35,
                sx: 0.361,
                sy: 0.361,
                r: -0.031
            },
            "6": {
                x: 11.4,
                y: -37.1,
                sx: 0.41,
                sy: 0.41,
                r: -0.044
            },
            "7": {
                x: 14.45,
                y: -46.9,
                sx: 0.465,
                sy: 0.465,
                r: -0.053
            },
            "8": {
                x: 17.75,
                y: -57.7,
                sx: 0.527,
                sy: 0.527,
                r: -0.066
            },
            "9": {
                x: 21.4,
                y: -69.55,
                sx: 0.594,
                sy: 0.594,
                r: -0.083
            },
            "10": {
                x: 23.876,
                y: -73.151,
                sx: 0.619,
                sy: 0.619,
                a: 0.87
            },
            "11": {
                x: 26.141,
                y: -76.464,
                sx: 0.643,
                sy: 0.643,
                a: 0.75
            },
            "12": {
                x: 28.191,
                y: -79.666,
                sx: 0.665,
                sy: 0.665,
                a: 0.64
            },
            "13": {
                x: 30.179,
                y: -82.462,
                sx: 0.686,
                sy: 0.686,
                a: 0.54
            },
            "14": {
                x: 32.002,
                y: -85.15,
                sx: 0.705,
                sy: 0.705,
                a: 0.45
            },
            "15": {
                x: 33.562,
                y: -87.429,
                sx: 0.721,
                sy: 0.721,
                a: 0.36
            },
            "16": {
                x: 35.006,
                y: -89.549,
                sx: 0.737,
                sy: 0.737,
                a: 0.29
            },
            "17": {
                x: 36.288,
                y: -91.411,
                sx: 0.75,
                sy: 0.75,
                a: 0.22
            },
            "18": {
                x: 37.453,
                y: -93.014,
                sx: 0.761,
                sy: 0.761,
                a: 0.16
            },
            "19": {
                x: 38.356,
                y: -94.46,
                sx: 0.771,
                sy: 0.771,
                a: 0.11
            },
            "20": {
                x: 39.096,
                y: -95.549,
                sx: 0.779,
                sy: 0.779,
                a: 0.07
            },
            "21": {
                x: 39.719,
                y: -96.478,
                sx: 0.785,
                sy: 0.785,
                a: 0.04
            },
            "22": {
                x: 40.129,
                y: -97.049,
                sx: 0.79,
                sy: 0.79,
                a: 0.02
            },
            "23": {
                x: 40.326,
                y: -97.411,
                sx: 0.793,
                sy: 0.793,
                a: 0
            },
            "24": {
                x: 40.45,
                y: -97.5,
                sx: 0.794,
                sy: 0.794
            }
        });
    });

    var Graphic154 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance9 = new Graphic153(MovieClip.SYNCHED)
            .setTransform(-28, 82);
        var instance8 = new Graphic151(MovieClip.SYNCHED)
            .setTransform(-40.95, 122.4, 1, 1, 1.247);
        var instance7 = new Graphic149(MovieClip.SYNCHED)
            .setTransform(-80.4, 95.1, 1, 1, 0, 0.58, 2.561);
        var instance6 = new Graphic147(MovieClip.SYNCHED)
            .setTransform(-71.35, 68.25, 0.895, 0.895, -0.832);
        var instance5 = new Graphic145(MovieClip.SYNCHED)
            .setTransform(-74.25, 154.35, 0.824, 0.824, 0, 3.705, -0.564);
        var instance4 = new Graphic143(MovieClip.SYNCHED)
            .setTransform(-84.05, 103.3, 0.895, 0.895, 0, 3.937, -0.795);
        var instance3 = new Graphic141(MovieClip.SYNCHED)
            .setTransform(-66, 131, 1, 1, -2.806);
        var instance2 = new Graphic139(MovieClip.SYNCHED)
            .setTransform(-115, 125.05, 0.775, 0.775, -2.26);
        var instance1 = new Graphic137(MovieClip.SYNCHED)
            .setTransform(-116, 60.05, 0.774, 0.774, -1.117);
        this.addTimedChild(instance9)
            .addTimedChild(instance8)
            .addTimedChild(instance7)
            .addTimedChild(instance6)
            .addTimedChild(instance5)
            .addTimedChild(instance4)
            .addTimedChild(instance3)
            .addTimedChild(instance2)
            .addTimedChild(instance1);
    });

    var Graphic155 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic156 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic155(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic157 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic158 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic157(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic159 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic160 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic159(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic161 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic162 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic161(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic163 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 16, loop: false });
        var instance1 = new Sprite(fromFrame("star1"))
            .setTransform(-21.8, -21.85, 0.759, 0.759);
        this.addTimedChild(instance1);
    });

    var Graphic164 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance1 = new Graphic163(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 16, {
            "0": {
                sx: 0.381,
                sy: 0.381,
                r: -0.427,
                a: 1
            },
            "1": {
                sx: 0.467,
                sy: 0.467,
                r: -0.368
            },
            "2": {
                sx: 0.554,
                sy: 0.554,
                r: -0.31
            },
            "3": {
                sx: 0.64,
                sy: 0.64,
                r: -0.253
            },
            "4": {
                sx: 0.727,
                sy: 0.727,
                r: -0.193
            },
            "5": {
                sx: 0.814,
                sy: 0.814,
                r: -0.136
            },
            "6": {
                sx: 0.9,
                sy: 0.9,
                r: -0.079
            },
            "7": {
                sx: 0.987,
                sy: 0.987,
                r: -0.022
            },
            "8": {
                sx: 1.03,
                sy: 1.03,
                r: 0.005,
                a: 0.88
            },
            "9": {
                sx: 1.074,
                sy: 1.074,
                r: 0.035,
                a: 0.75
            },
            "10": {
                sx: 1.117,
                sy: 1.117,
                r: 0.062,
                a: 0.63
            },
            "11": {
                sx: 1.16,
                sy: 1.16,
                r: 0.092,
                a: 0.5
            },
            "12": {
                sx: 1.203,
                sy: 1.203,
                r: 0.122,
                a: 0.38
            },
            "13": {
                sx: 1.246,
                sy: 1.246,
                r: 0.149,
                a: 0.25
            },
            "14": {
                sx: 1.289,
                sy: 1.289,
                r: 0.179,
                a: 0.13
            },
            "15": {
                sx: 1.333,
                sy: 1.333,
                r: 0.209,
                a: 0
            }
        });
    });

    var Graphic165 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 47, loop: false });
        var instance6 = new Graphic164(MovieClip.SYNCHED);
        var instance5 = new Graphic162(MovieClip.SYNCHED);
        var instance4 = new Graphic160(MovieClip.SYNCHED);
        var instance3 = new Graphic158(MovieClip.SYNCHED);
        var instance2 = new Graphic156(MovieClip.SYNCHED);
        var instance1 = new Graphic154(MovieClip.SYNCHED)
            .setTransform(40.85, -62.45, 0.765, 0.765);
        this.addTimedChild(instance6, 0, 47, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -4.65,
                    y: -1.95
                },
                "2": {
                    x: 3.6,
                    y: -8.75
                },
                "3": {
                    x: 11.15,
                    y: -15
                },
                "4": {
                    x: 18.05,
                    y: -20.7
                },
                "5": {
                    x: 24.3,
                    y: -25.85
                },
                "6": {
                    x: 29.85,
                    y: -30.5
                },
                "7": {
                    x: 34.8,
                    y: -34.55
                },
                "8": {
                    x: 39.05,
                    y: -38.1
                },
                "9": {
                    x: 42.7,
                    y: -41.1
                },
                "10": {
                    x: 45.65,
                    y: -43.55
                },
                "11": {
                    x: 47.95,
                    y: -45.45
                },
                "12": {
                    x: 49.6,
                    y: -46.8
                },
                "13": {
                    x: 50.55,
                    y: -47.65
                },
                "14": {
                    x: 50.9,
                    y: -47.9
                }
            })
            .addTimedChild(instance5, 0, 47, {
                "0": {
                    x: -26.05,
                    y: 12.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -25.85,
                    y: 26.6
                },
                "2": {
                    x: -25.7,
                    y: 39.65
                },
                "3": {
                    x: -25.55,
                    y: 51.6
                },
                "4": {
                    x: -25.45,
                    y: 62.4
                },
                "5": {
                    x: -25.3,
                    y: 72.05
                },
                "6": {
                    x: -25.2,
                    y: 80.55
                },
                "7": {
                    x: -25.1,
                    y: 87.95
                },
                "8": {
                    x: -25.05,
                    y: 94.2
                },
                "9": {
                    x: -24.95,
                    y: 99.3
                },
                "10": {
                    x: -24.9,
                    y: 103.3
                },
                "11": {
                    y: 106.15
                },
                "12": {
                    x: -24.85,
                    y: 107.85
                },
                "13": {
                    y: 108.4
                }
            })
            .addTimedChild(instance4, 0, 47, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -26.69,
                    y: 1.516,
                    sx: 0.492,
                    sy: 0.492
                },
                "2": {
                    x: -38.915,
                    y: -2.054,
                    sx: 0.476,
                    sy: 0.476
                },
                "3": {
                    x: -50.124,
                    y: -5.361,
                    sx: 0.462,
                    sy: 0.462
                },
                "4": {
                    x: -60.416,
                    y: -8.403,
                    sx: 0.448,
                    sy: 0.448
                },
                "5": {
                    x: -69.693,
                    y: -11.083,
                    sx: 0.436,
                    sy: 0.436
                },
                "6": {
                    x: -78.004,
                    y: -13.549,
                    sx: 0.425,
                    sy: 0.425
                },
                "7": {
                    x: -85.298,
                    y: -15.701,
                    sx: 0.415,
                    sy: 0.415
                },
                "8": {
                    x: -91.627,
                    y: -17.589,
                    sx: 0.407,
                    sy: 0.407
                },
                "9": {
                    x: -97.04,
                    y: -19.164,
                    sx: 0.4,
                    sy: 0.4
                },
                "10": {
                    x: -101.437,
                    y: -20.475,
                    sx: 0.394,
                    sy: 0.394
                },
                "11": {
                    x: -104.868,
                    y: -21.473,
                    sx: 0.39,
                    sy: 0.39
                },
                "12": {
                    x: -107.283,
                    y: -22.207,
                    sx: 0.386,
                    sy: 0.386
                },
                "13": {
                    x: -108.732,
                    y: -22.577,
                    sx: 0.384,
                    sy: 0.384
                },
                "14": {
                    x: -109.25,
                    y: -22.75
                }
            })
            .addTimedChild(instance3, 0, 47, {
                "0": {
                    x: -13.5,
                    y: 5.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -6.89,
                    y: 12.566,
                    sx: 0.492,
                    sy: 0.492
                },
                "2": {
                    x: -0.815,
                    y: 19.196,
                    sx: 0.476,
                    sy: 0.476
                },
                "3": {
                    x: 4.876,
                    y: 25.289,
                    sx: 0.462,
                    sy: 0.462
                },
                "4": {
                    x: 9.934,
                    y: 30.847,
                    sx: 0.448,
                    sy: 0.448
                },
                "5": {
                    x: 14.607,
                    y: 35.917,
                    sx: 0.436,
                    sy: 0.436
                },
                "6": {
                    x: 18.746,
                    y: 40.401,
                    sx: 0.425,
                    sy: 0.425
                },
                "7": {
                    x: 22.452,
                    y: 44.399,
                    sx: 0.415,
                    sy: 0.415
                },
                "8": {
                    x: 25.623,
                    y: 47.861,
                    sx: 0.407,
                    sy: 0.407
                },
                "9": {
                    x: 28.31,
                    y: 50.736,
                    sx: 0.4,
                    sy: 0.4
                },
                "10": {
                    x: 30.513,
                    y: 53.125,
                    sx: 0.394,
                    sy: 0.394
                },
                "11": {
                    x: 32.182,
                    y: 54.977,
                    sx: 0.39,
                    sy: 0.39
                },
                "12": {
                    x: 33.417,
                    y: 56.343,
                    sx: 0.386,
                    sy: 0.386
                },
                "13": {
                    x: 34.168,
                    y: 57.173,
                    sx: 0.384,
                    sy: 0.384
                },
                "14": {
                    x: 34.4,
                    y: 57.4
                }
            })
            .addTimedChild(instance2, 0, 47, {
                "0": {
                    x: -18.4,
                    y: 11.4,
                    sx: 0.51,
                    sy: 0.51
                },
                "1": {
                    x: -20.7,
                    y: 6
                },
                "2": {
                    x: -22.75,
                    y: 1
                },
                "3": {
                    x: -24.7,
                    y: -3.55
                },
                "4": {
                    x: -26.4,
                    y: -7.65
                },
                "5": {
                    x: -27.95,
                    y: -11.35
                },
                "6": {
                    x: -29.35,
                    y: -14.6
                },
                "7": {
                    x: -30.5,
                    y: -17.4
                },
                "8": {
                    x: -31.5,
                    y: -19.8
                },
                "9": {
                    x: -32.35,
                    y: -21.75
                },
                "10": {
                    x: -33,
                    y: -23.25
                },
                "11": {
                    x: -33.45,
                    y: -24.35
                },
                "12": {
                    x: -33.7,
                    y: -25
                },
                "13": {
                    x: -33.8,
                    y: -25.2
                }
            })
            .addTimedChild(instance1);
    });

    var Graphic166 = MovieClip.extend(function (mode) {
        MovieClip.call(this, { mode: mode, duration: 149, loop: false });
        var instance4 = new Graphic165(MovieClip.SYNCHED);
        var instance3 = new Graphic135(MovieClip.SYNCHED);
        var instance6 = new Graphic105(MovieClip.SYNCHED);
        var instance2 = new Graphic63(MovieClip.SYNCHED);
        var instance8 = new Graphic75(MovieClip.SYNCHED);
        var instance7 = new Graphic74(MovieClip.SYNCHED);
        var instance9 = new Graphic66(MovieClip.SYNCHED);
        var instance1 = new Graphic62(MovieClip.SYNCHED);
        var instance11 = new Graphic61(MovieClip.SYNCHED)
            .setTransform(27.55, 28.3, 1.146, 1.146, 0, 3.399, 2.884);
        var instance10 = new Graphic31(MovieClip.SYNCHED)
            .setTransform(29.95, -27.1, 1.437, 1.437, 0, 0.162, 2.98);
        var instance5 = new Graphic1(MovieClip.SYNCHED);
        this.addTimedChild(instance4, 0, 47, {
                "0": {
                    x: 3,
                    y: 16,
                    sx: 1.545,
                    sy: 1.545,
                    kx: 3.399,
                    ky: 2.884
                }
            })
            .addTimedChild(instance3, 0, 47, {
                "0": {
                    x: 6.3,
                    y: -58.7,
                    sx: 1.937,
                    sy: 1.937,
                    kx: 0.162,
                    ky: 2.98
                }
            })
            .addTimedChild(instance6, 24, 23, {
                "24": {
                    x: -228.2,
                    y: -109.6,
                    sx: 0.793,
                    sy: 0.793,
                    kx: 3.399,
                    ky: 2.884
                }
            })
            .addTimedChild(instance2, 0, 72, {
                "0": {
                    x: 49.25,
                    y: -24.75,
                    sx: 0.432,
                    sy: 0.432,
                    r: 0,
                    a: 0
                },
                "1": {
                    x: 49.259,
                    y: -25.261,
                    sx: 0.453,
                    sy: 0.453,
                    a: 0.03
                },
                "2": {
                    x: 49.276,
                    y: -26.865,
                    sx: 0.525,
                    sy: 0.525,
                    a: 0.13
                },
                "3": {
                    x: 49.261,
                    y: -29.795,
                    sx: 0.656,
                    sy: 0.656,
                    a: 0.32
                },
                "4": {
                    x: 49.271,
                    y: -33.852,
                    sx: 0.834,
                    sy: 0.834,
                    a: 0.57
                },
                "5": {
                    x: 49.259,
                    y: -37.67,
                    sx: 1.003,
                    sy: 1.003,
                    a: 0.81
                },
                "6": {
                    x: 49.253,
                    y: -40.047,
                    sx: 1.107,
                    sy: 1.107,
                    a: 0.96
                },
                "7": {
                    x: 49.25,
                    y: -40.75,
                    sx: 1.139,
                    sy: 1.139,
                    a: 1
                },
                "8": {
                    x: 49.251,
                    y: -40.444,
                    sx: 1.133,
                    sy: 1.133
                },
                "9": {
                    x: 49.246,
                    y: -39.437,
                    sx: 1.114,
                    sy: 1.114
                },
                "10": {
                    x: 49.214,
                    y: -37.669,
                    sx: 1.078,
                    sy: 1.078
                },
                "11": {
                    x: 49.227,
                    y: -35.59,
                    sx: 1.037,
                    sy: 1.037
                },
                "12": {
                    x: 49.26,
                    y: -34.183,
                    sx: 1.009,
                    sy: 1.009
                },
                "13": {
                    x: 49.25,
                    y: -33.75,
                    sx: 1,
                    sy: 1
                },
                "15": {
                    x: 49.232,
                    y: -27.525,
                    r: -0.001
                },
                "16": {
                    x: 49.269,
                    y: -8.961,
                    r: -0.005
                },
                "17": {
                    x: 49.241,
                    y: 22.036,
                    r: -0.018
                },
                "18": {
                    x: 49.272,
                    y: 65.438,
                    r: -0.031
                },
                "19": {
                    x: 49.25,
                    y: 121.2,
                    r: -0.051
                },
                "20": {
                    x: 54.35,
                    y: 116.7,
                    r: 0.034
                },
                "21": {
                    x: 53.8,
                    y: 121.8,
                    r: 0.03
                },
                "22": {
                    x: 52.152,
                    y: 121.562,
                    r: 0.018
                },
                "23": {
                    x: 47.159,
                    y: 120.73,
                    r: -0.013
                },
                "24": {
                    x: 44.75,
                    y: 120.35,
                    r: -0.03
                },
                "25": {
                    x: 45.532,
                    y: 121.275,
                    r: -0.023
                },
                "26": {
                    x: 47.997,
                    y: 123.871,
                    r: -0.005
                },
                "27": {
                    x: 49.25,
                    y: 125.2,
                    r: 0
                }
            })
            .addTimedChild(instance8, 72, 36, {
                "72": {
                    x: 49.25,
                    y: 125.2
                }
            })
            .addTimedChild(instance7, 72, 36, {
                "72": {
                    x: 50.15,
                    y: -100.5
                }
            })
            .addTimedChild(instance9, 80, 28, {
                "80": {
                    x: 49.4,
                    y: 73.2
                }
            })
            .addTimedChild(instance1, 0, 108, {
                "0": {
                    x: 49.25,
                    y: -24.75,
                    sx: 0.432,
                    sy: 0.432,
                    r: 0,
                    a: 0
                },
                "1": {
                    x: 49.259,
                    y: -25.261,
                    sx: 0.453,
                    sy: 0.453,
                    a: 0.03
                },
                "2": {
                    x: 49.276,
                    y: -26.865,
                    sx: 0.525,
                    sy: 0.525,
                    a: 0.13
                },
                "3": {
                    x: 49.261,
                    y: -29.795,
                    sx: 0.656,
                    sy: 0.656,
                    a: 0.32
                },
                "4": {
                    x: 49.271,
                    y: -33.852,
                    sx: 0.834,
                    sy: 0.834,
                    a: 0.57
                },
                "5": {
                    x: 49.259,
                    y: -37.67,
                    sx: 1.003,
                    sy: 1.003,
                    a: 0.81
                },
                "6": {
                    x: 49.253,
                    y: -40.047,
                    sx: 1.107,
                    sy: 1.107,
                    a: 0.96
                },
                "7": {
                    x: 49.25,
                    y: -40.75,
                    sx: 1.139,
                    sy: 1.139,
                    a: 1
                },
                "8": {
                    x: 49.251,
                    y: -40.444,
                    sx: 1.133,
                    sy: 1.133
                },
                "9": {
                    x: 49.246,
                    y: -39.437,
                    sx: 1.114,
                    sy: 1.114
                },
                "10": {
                    x: 49.214,
                    y: -37.669,
                    sx: 1.078,
                    sy: 1.078
                },
                "11": {
                    x: 49.227,
                    y: -35.59,
                    sx: 1.037,
                    sy: 1.037
                },
                "12": {
                    x: 49.26,
                    y: -34.183,
                    sx: 1.009,
                    sy: 1.009
                },
                "13": {
                    x: 49.25,
                    y: -33.75,
                    sx: 1,
                    sy: 1
                },
                "15": {
                    x: 49.232,
                    y: -27.525,
                    r: -0.001
                },
                "16": {
                    x: 49.269,
                    y: -8.961,
                    r: -0.005
                },
                "17": {
                    x: 49.241,
                    y: 22.036,
                    r: -0.018
                },
                "18": {
                    x: 49.272,
                    y: 65.438,
                    r: -0.031
                },
                "19": {
                    x: 49.25,
                    y: 121.2,
                    r: -0.051
                },
                "20": {
                    x: 54.35,
                    y: 116.7,
                    r: 0.034
                },
                "21": {
                    x: 53.8,
                    y: 121.8,
                    r: 0.03
                },
                "22": {
                    x: 52.152,
                    y: 121.562,
                    r: 0.018
                },
                "23": {
                    x: 47.159,
                    y: 120.73,
                    r: -0.013
                },
                "24": {
                    x: 44.75,
                    y: 120.35,
                    r: -0.03
                },
                "25": {
                    x: 45.532,
                    y: 121.275,
                    r: -0.023
                },
                "26": {
                    x: 47.997,
                    y: 123.871,
                    r: -0.005
                },
                "27": {
                    x: 49.25,
                    y: 125.2,
                    r: 0
                }
            })
            .addTimedChild(instance11, 108, 41)
            .addTimedChild(instance10, 108, 41)
            .addTimedChild(instance5, 22, 127, {
                "22": {
                    x: -218.2,
                    y: -100.9,
                    sx: 0.434,
                    sy: 0.164,
                    kx: 0,
                    ky: 0,
                    r: 0,
                    a: 1
                },
                "23": {
                    x: -218.225,
                    y: -100.902,
                    sx: 0.5,
                    sy: 0.261
                },
                "24": {
                    x: -218.211,
                    y: -100.901,
                    sx: 0.728,
                    sy: 0.597
                },
                "25": {
                    x: -218.238,
                    y: -100.906,
                    sx: 1.008,
                    sy: 1.008
                },
                "26": {
                    x: -218.15,
                    y: -100.9,
                    sx: 1.106,
                    sy: 1.152
                },
                "27": {
                    x: -218.188,
                    sx: 1.101,
                    sy: 1.146
                },
                "28": {
                    x: -218.175,
                    y: -100.908,
                    sx: 1.086,
                    sy: 1.124
                },
                "29": {
                    x: -218.169,
                    y: -100.916,
                    sx: 1.059,
                    sy: 1.085
                },
                "30": {
                    x: -218.181,
                    y: -100.913,
                    sx: 1.028,
                    sy: 1.04
                },
                "31": {
                    x: -218.164,
                    y: -100.921,
                    sx: 1.007,
                    sy: 1.009
                },
                "32": {
                    x: -218.15,
                    y: -100.9,
                    sx: 1,
                    sy: 1
                },
                "40": {
                    x: -219.394,
                    y: -101.822,
                    r: -0.004
                },
                "41": {
                    x: -223.861,
                    y: -104.853,
                    r: -0.018
                },
                "42": {
                    x: -231.168,
                    y: -109.856,
                    r: -0.048
                },
                "43": {
                    x: -237.185,
                    y: -113.974,
                    r: -0.07
                },
                "44": {
                    x: -239.1,
                    y: -115.3,
                    r: -0.079
                },
                "45": {
                    x: -233.627,
                    y: -108.816,
                    r: 0.023
                },
                "46": {
                    x: -214.512,
                    y: -86.031,
                    sx: 0.999,
                    sy: 0.999,
                    r: 0.385
                },
                "47": {
                    x: -183.173,
                    y: -48.734,
                    sx: 0.998,
                    sy: 0.998,
                    r: 0.976
                },
                "48": {
                    x: -157.29,
                    y: -17.884,
                    sx: 1,
                    sy: 1,
                    r: 1.465
                },
                "49": {
                    x: -149.1,
                    y: -8.2,
                    kx: 4.666,
                    ky: 1.617,
                    r: 0
                },
                "50": {
                    x: -153.72,
                    y: -27.252,
                    kx: 0,
                    ky: 0,
                    r: 1.488
                },
                "51": {
                    x: -157.073,
                    y: -41.027,
                    sx: 0.999,
                    sy: 0.999,
                    r: 1.395
                },
                "52": {
                    x: -159.886,
                    y: -52.64,
                    r: 1.317
                },
                "53": {
                    x: -162.193,
                    y: -61.955,
                    r: 1.251
                },
                "54": {
                    x: -163.827,
                    y: -68.638,
                    r: 1.207
                },
                "55": {
                    x: -164.5,
                    y: -71.3,
                    sx: 1,
                    sy: 1,
                    r: 1.186
                },
                "56": {
                    x: -162.991,
                    y: -64.388,
                    sx: 0.999,
                    sy: 0.999,
                    r: 1.234
                },
                "57": {
                    x: -157.764,
                    y: -40.476,
                    r: 1.396
                },
                "58": {
                    x: -151.337,
                    y: -11.214,
                    sx: 1,
                    sy: 1,
                    kx: 4.69,
                    ky: 1.593,
                    r: 0
                },
                "59": {
                    x: -149.1,
                    y: -1,
                    kx: 4.619,
                    ky: 1.665
                },
                "60": {
                    x: -149.058,
                    y: -2.85,
                    kx: 4.633,
                    ky: 1.65
                },
                "61": {
                    x: -149.096,
                    y: -4.432,
                    kx: 4.642,
                    ky: 1.641
                },
                "62": {
                    x: -149.073,
                    y: -5.731,
                    kx: 4.651,
                    ky: 1.632
                },
                "63": {
                    x: -149.088,
                    y: -6.843,
                    kx: 4.659,
                    ky: 1.624
                },
                "64": {
                    x: -149.066,
                    y: -7.653,
                    kx: 4.664,
                    ky: 1.619
                },
                "65": {
                    x: -149.1,
                    y: -8.2,
                    kx: 4.666,
                    ky: 1.617
                },
                "68": {
                    x: -151.663,
                    y: -10.442,
                    kx: 4.695,
                    ky: 1.588
                },
                "69": {
                    x: -160.364,
                    y: -17.858,
                    kx: 0,
                    ky: 0,
                    r: 1.496
                },
                "70": {
                    x: -176.272,
                    y: -31.403,
                    sx: 0.999,
                    sy: 0.999,
                    r: 1.326
                },
                "71": {
                    x: -199.18,
                    y: -50.965,
                    r: 1.081
                },
                "72": {
                    x: -225.336,
                    y: -73.215,
                    sx: 0.998,
                    sy: 0.998,
                    r: 0.8
                },
                "73": {
                    x: -247.524,
                    y: -92.134,
                    r: 0.56
                },
                "74": {
                    x: -260.821,
                    y: -103.515,
                    sx: 0.999,
                    sy: 0.999,
                    r: 0.416
                },
                "75": {
                    x: -264.95,
                    y: -106.95,
                    sx: 1,
                    sy: 1,
                    r: 0.375
                },
                "76": {
                    x: -264.588,
                    y: -106.734,
                    sx: 0.999,
                    sy: 0.999,
                    r: 0.376
                },
                "77": {
                    x: -263.371,
                    y: -106.07,
                    r: 0.385
                },
                "78": {
                    x: -261.089,
                    y: -104.889,
                    r: 0.402
                },
                "79": {
                    x: -258.539,
                    y: -103.566,
                    r: 0.42
                },
                "80": {
                    x: -256.695,
                    y: -102.63,
                    r: 0.433
                },
                "81": {
                    x: -256.15,
                    y: -102.35,
                    sx: 1,
                    sy: 1,
                    r: 0.44
                },
                "98": {
                    x: -262.575,
                    y: -105.687,
                    sx: 0.999,
                    sy: 0.999,
                    r: 0.407
                },
                "99": {
                    x: -267.857,
                    y: -108.425,
                    r: 0.381
                },
                "100": {
                    x: -271.925,
                    y: -110.597,
                    r: 0.359
                },
                "101": {
                    x: -274.905,
                    y: -112.103,
                    r: 0.346
                },
                "102": {
                    x: -276.629,
                    y: -112.994,
                    r: 0.337
                },
                "103": {
                    x: -277.3,
                    y: -113.35,
                    sx: 1,
                    sy: 1,
                    r: 0.336
                },
                "104": {
                    x: -274.571,
                    y: -109.441,
                    sx: 0.999,
                    sy: 0.999,
                    r: 0.39
                },
                "105": {
                    x: -266.56,
                    y: -97.51,
                    sx: 0.998,
                    sy: 0.998,
                    r: 0.56
                },
                "106": {
                    x: -253.14,
                    y: -77.71,
                    r: 0.845
                },
                "107": {
                    x: -234.258,
                    y: -50.016,
                    sx: 0.999,
                    sy: 0.999,
                    r: 1.242
                },
                "108": {
                    x: -210.15,
                    y: -14.35,
                    sx: 1,
                    sy: 1,
                    kx: 4.535,
                    ky: 1.748,
                    r: 0
                },
                "109": {
                    x: -210.436,
                    y: -15.845,
                    kx: 4.59,
                    ky: 1.693
                },
                "110": {
                    x: -210.715,
                    y: -17.151,
                    kx: 4.637,
                    ky: 1.646
                },
                "111": {
                    x: -210.905,
                    y: -18.169,
                    kx: 4.672,
                    ky: 1.611
                },
                "112": {
                    x: -211.07,
                    y: -18.862,
                    kx: 4.698,
                    ky: 1.585
                },
                "113": {
                    x: -211.15,
                    y: -19.35,
                    kx: 0,
                    ky: 0,
                    r: 1.57
                },
                "116": {
                    x: -209.143,
                    y: -19.201,
                    r: 1.561
                },
                "117": {
                    x: -203.104,
                    y: -18.823,
                    sx: 0.999,
                    sy: 0.999,
                    r: 1.522
                },
                "118": {
                    x: -192.621,
                    y: -18.034,
                    sx: 0.997,
                    sy: 0.997,
                    r: 1.461
                },
                "119": {
                    x: -177.64,
                    y: -17.008,
                    sx: 0.995,
                    sy: 0.995,
                    r: 1.369
                },
                "120": {
                    x: -158.138,
                    y: -15.62,
                    sx: 0.992,
                    sy: 0.992,
                    r: 1.251
                },
                "121": {
                    x: -134.155,
                    y: -13.865,
                    sx: 0.988,
                    sy: 0.988,
                    r: 1.107
                },
                "122": {
                    x: -106.434,
                    y: -11.952,
                    sx: 0.984,
                    sy: 0.984,
                    r: 0.94
                },
                "123": {
                    x: -76.024,
                    y: -9.82,
                    sx: 0.979,
                    sy: 0.979,
                    r: 0.756
                },
                "124": {
                    x: -44.729,
                    y: -7.532,
                    sx: 0.975,
                    sy: 0.975,
                    r: 0.565
                },
                "125": {
                    x: -14.575,
                    y: -5.459,
                    sx: 0.971,
                    sy: 0.971,
                    r: 0.384
                },
                "126": {
                    x: 11.901,
                    y: -3.526,
                    sx: 0.968,
                    sy: 0.968,
                    r: 0.223
                },
                "127": {
                    x: 32.354,
                    y: -2.077,
                    sx: 0.965,
                    sy: 0.965,
                    r: 0.101
                },
                "128": {
                    x: 45.238,
                    y: -1.252,
                    sx: 0.964,
                    sy: 0.964,
                    r: 0.022
                },
                "129": {
                    x: 49.6,
                    y: -0.9,
                    sx: 0.963,
                    sy: 0.963,
                    r: -0.003
                },
                "131": {
                    x: 49.603,
                    y: -0.891,
                    r: 0
                },
                "132": {
                    x: 49.606,
                    y: -0.892,
                    r: 0.013
                },
                "133": {
                    x: 49.592,
                    y: -0.886,
                    r: 0.036
                },
                "134": {
                    x: 49.622,
                    y: -0.887,
                    r: 0.07
                },
                "135": {
                    x: 49.56,
                    y: -0.918,
                    r: 0.101
                },
                "136": {
                    x: 49.573,
                    y: -0.878,
                    r: 0.119
                },
                "137": {
                    x: 49.6,
                    y: -0.9,
                    r: 0.127
                },
                "138": {
                    x: 49.548,
                    y: -0.88,
                    r: -0.005,
                    a: 0.99
                },
                "139": {
                    x: 49.566,
                    y: -0.868,
                    sx: 0.962,
                    sy: 0.962,
                    r: -0.438,
                    a: 0.96
                },
                "140": {
                    x: 49.611,
                    y: -0.827,
                    r: -1.212,
                    a: 0.92
                },
                "141": {
                    x: 49.653,
                    y: -0.88,
                    r: -2.359,
                    a: 0.85
                },
                "142": {
                    x: 49.61,
                    y: -0.938,
                    kx: 3.912,
                    ky: 2.371,
                    r: 0,
                    a: 0.75
                },
                "143": {
                    x: 49.536,
                    y: -0.883,
                    kx: 0,
                    ky: 0,
                    r: 0.441,
                    a: 0.63
                },
                "144": {
                    x: 49.609,
                    y: -0.842,
                    sx: 0.963,
                    sy: 0.963,
                    r: -1.759,
                    a: 0.5
                },
                "145": {
                    x: 49.636,
                    y: -0.941,
                    sx: 0.962,
                    sy: 0.962,
                    kx: 4.034,
                    ky: 2.249,
                    r: 0,
                    a: 0.36
                },
                "146": {
                    x: 49.524,
                    y: -0.904,
                    sx: 0.963,
                    sy: 0.963,
                    kx: 0,
                    ky: 0,
                    r: 0.162,
                    a: 0.23
                },
                "147": {
                    x: 49.645,
                    y: -0.816,
                    r: -1.523,
                    a: 0.13
                },
                "148": {
                    x: 49.647,
                    y: -0.927,
                    sx: 0.962,
                    sy: 0.962,
                    r: -2.708,
                    a: 0.05
                }
            });
    });

    lib.emoji_magic = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 150,
            framerate: 30,
            loop: false,
            labels: {
                HOLD_SAFE: 84
            }
        });
        var instance1 = new Graphic166(MovieClip.SYNCHED);
        this.addTimedChild(instance1, 0, 149, {
            "0": {
                x: 592.55,
                y: 356.45
            }
        });
    });

    lib.emoji_magic.assets = {
        "emoji_magic_atlas_1": "images/emoji_magic_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.emoji_magic,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 150,
        library: lib
    };
}