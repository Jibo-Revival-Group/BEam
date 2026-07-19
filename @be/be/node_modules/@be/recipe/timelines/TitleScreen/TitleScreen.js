(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Sprite = PIXI.Sprite;
    var fromFrame = PIXI.Texture.fromFrame;
    var Text = PIXI.Text;
    var Graphics = PIXI.Graphics;
    var shapes = PIXI.animate.ShapesCache;

    lib.VideoButton = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 7,
            labels: {
                play: 0,
                pause: 1,
                volume: 2,
                stop: 3,
                volumeOff: 4,
                close: 5,
                refresh: 6
            }
        });
        var instance2 = new Graphics()
            .drawCommands(shapes.TitleScreen[7]);
        var instance1 = new Graphics()
            .drawCommands(shapes.TitleScreen[0]);
        var instance3 = new Graphics()
            .drawCommands(shapes.TitleScreen[1]);
        var instance4 = new Graphics()
            .drawCommands(shapes.TitleScreen[2]);
        var instance5 = new Graphics()
            .drawCommands(shapes.TitleScreen[3]);
        var instance7 = new Graphics()
            .drawCommands(shapes.TitleScreen[4]);
        var instance6 = new Graphics()
            .drawCommands(shapes.TitleScreen[2]);
        var instance8 = new Graphics()
            .drawCommands(shapes.TitleScreen[5]);
        var instance9 = new Graphics()
            .drawCommands(shapes.TitleScreen[6]);
        this.addTimedChild(instance2)
            .addTimedChild(instance1, 0, 1)
            .addTimedChild(instance3, 1, 1)
            .addTimedChild(instance4, 2, 1)
            .addTimedChild(instance5, 3, 1)
            .addTimedChild(instance7, 4, 1)
            .addTimedChild(instance6, 4, 1, {
                "4": {
                    x: 0.15
                }
            })
            .addTimedChild(instance8, 5, 1)
            .addTimedChild(instance9, 6, 1)
            .addAction(function () {
                this.stop();
            }, 0)
            .addAction(function () {
                this.stop();
            }, 1)
            .addAction(function () {
                this.stop();
            }, 2)
            .addAction(function () {
                this.stop();
            }, 3)
            .addAction(function () {
                this.stop();
            }, 4)
            .addAction(function () {
                this.stop();
            }, 5)
            .addAction(function () {
                this.stop();
            }, 6);
    });

    lib.SubTitleClip = Container.extend(function () {
        Container.call(this);
        var instance1 = this.subTitle = new Text("Static")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 50,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setTransform(2, 2);
        this.addChild(instance1);
    });

    lib.TitleClip = Container.extend(function () {
        Container.call(this);
        var instance1 = this.selectionTitle = new Text("selection title")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 50,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setTransform(2, 2);
        this.addChild(instance1);
    });

    lib.Clip = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 20,
            labels: {
                fade_in: 0,
                fade_in_stop: 9
            }
        });
        var instance1 = this.clip = new lib.TitleClip();
        this.addTimedChild(instance1, 0, 20, {
                "0": {
                    x: 440,
                    a: 0
                },
                "1": {
                    x: 391.1,
                    a: 0.11
                },
                "2": {
                    x: 342.2,
                    a: 0.22
                },
                "3": {
                    x: 293.35,
                    a: 0.33
                },
                "4": {
                    x: 244.45,
                    a: 0.45
                },
                "5": {
                    x: 195.55,
                    a: 0.55
                },
                "6": {
                    x: 146.65,
                    a: 0.67
                },
                "7": {
                    x: 97.8,
                    a: 0.78
                },
                "8": {
                    x: 48.9,
                    a: 0.89
                },
                "9": {
                    x: 0,
                    a: 1
                },
                "11": {
                    x: 48.9,
                    a: 0.89
                },
                "12": {
                    x: 97.8,
                    a: 0.78
                },
                "13": {
                    x: 146.65,
                    a: 0.67
                },
                "14": {
                    x: 195.55,
                    a: 0.55
                },
                "15": {
                    x: 244.45,
                    a: 0.45
                },
                "16": {
                    x: 293.35,
                    a: 0.33
                },
                "17": {
                    x: 342.2,
                    a: 0.22
                },
                "18": {
                    x: 391.1,
                    a: 0.11
                },
                "19": {
                    x: 440,
                    a: 0
                }
            })
            .addAction(function () {
                this.stop();
            }, 0)
            .addAction(function () {
                this.stop();
            }, 9)
            .addAction(function () {
                this.stop();
            }, 19);
    });

    lib.TitleScreen = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 1,
            framerate: 30
        });
        var instance5 = this.title = new Text("")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 120,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(642.025, 38.85);
        var instance4 = new lib.Clip()
            .setTransform(22.05, 779.35);
        var instance3 = this.subClip = new lib.SubTitleClip()
            .setTransform(890, 743.45);
        var instance2 = this.closeBtn = new lib.VideoButton()
            .setTransform(1096.05, 53.2);
        var instance1 = new Sprite(fromFrame("Screen Shot 2016-11-07 at 7.18.16 PM"))
            .setTransform(1321, 329);
        this.addChild(instance5, instance4, instance3, instance2, instance1);
    });

    lib.TitleScreen.assets = {
        "TitleScreen": "images/TitleScreen.shapes.json",
        "TitleScreen_atlas_1": "images/TitleScreen_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.TitleScreen,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 1,
        library: lib
    };
}