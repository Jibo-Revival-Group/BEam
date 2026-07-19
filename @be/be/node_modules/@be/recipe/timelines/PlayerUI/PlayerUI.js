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
            duration: 8,
            labels: {
                play: 0,
                pause: 1,
                volume: 2,
                stop: 3,
                volumeOff: 4,
                close: 5,
                refresh: 6,
                settings: 7
            }
        });
        var instance2 = new Sprite(fromFrame("YellowCircleBg"));
        var instance1 = new Sprite(fromFrame("VideoPlay"));
        var instance3 = new Sprite(fromFrame("VideoPause"));
        var instance4 = new Sprite(fromFrame("VideoVolume"));
        var instance5 = new Sprite(fromFrame("VideoStop"));
        var instance6 = new Sprite(fromFrame("VideoVolumeOff"));
        var instance7 = new Sprite(fromFrame("VideoClose"));
        var instance8 = new Sprite(fromFrame("VideoRefresh"));
        var instance9 = new Sprite(fromFrame("VideoSettings"))
            .setTransform(11, 12);
        this.addTimedChild(instance2)
            .addTimedChild(instance1, 0, 1, {
                "0": {
                    x: 25,
                    y: 16
                }
            })
            .addTimedChild(instance3, 1, 1, {
                "1": {
                    x: 25,
                    y: 16
                }
            })
            .addTimedChild(instance4, 2, 1, {
                "2": {
                    x: 24,
                    y: 16
                }
            })
            .addTimedChild(instance5, 3, 1, {
                "3": {
                    x: 21,
                    y: 21
                }
            })
            .addTimedChild(instance6, 4, 1, {
                "4": {
                    x: 10,
                    y: 16
                }
            })
            .addTimedChild(instance7, 5, 1, {
                "5": {
                    x: 18,
                    y: 18
                }
            })
            .addTimedChild(instance8, 6, 1, {
                "6": {
                    x: 16,
                    y: 14
                }
            })
            .addTimedChild(instance9, 7, 1)
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
            }, 6)
            .addAction(function () {
                this.stop();
            }, 7);
    });

    lib.VideoRunTime = Container.extend(function () {
        Container.call(this);
        var instance4 = new Sprite(fromFrame("VideoRunTimeBg"));
        var instance3 = this.currentTime_txt = new Text("00:00")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 18,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("right")
            .setTransform(65.55);
        var instance2 = new Text("/")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 18,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(70.35);
        var instance1 = this.totalTime_txt = new Text("00:00")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 18,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setTransform(77.35, 2);
        this.addChild(instance4, instance3, instance2, instance1);
    });

    lib.Marker = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 2,
            labels: {
                unactive: 0,
                active: 1
            }
        });
        var instance2 = new Sprite(fromFrame("MarkerDefault"));
        var instance3 = new Sprite(fromFrame("MarkerActive"))
            .setTransform(-31, -31);
        var instance1 = this.marker_txt = new Text("1")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 30,
                fontWeight: "bold"
            })
            .setAlign("center")
            .setTransform(-0.9000000000000057, -18.4);
        this.addTimedChild(instance2, 0, 1, {
                "0": {
                    x: -21,
                    y: -21
                }
            })
            .addTimedChild(instance3, 1, 1)
            .addTimedChild(instance1)
            .addAction(function () {
                this.stop();
            }, 0)
            .addAction(function () {
                this.stop()
            }, 1);
    });

    lib.PreloaderBar = Container.extend(function () {
        Container.call(this);
        var instance1 = new Graphics()
            .drawCommands(shapes.PlayerUI[0]);
        this.addChild(instance1);
    });

    lib.Progress_Bar = Container.extend(function () {
        Container.call(this);
        var instance1 = new Graphics()
            .drawCommands(shapes.PlayerUI[2]);
        this.addChild(instance1);
    });

    lib.Bar = Container.extend(function () {
        Container.call(this);
        var instance1 = new Sprite(fromFrame("BarImg"));
        this.addChild(instance1);
    });

    lib.PlayerUI = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 1,
            framerate: 30
        });
        var instance8 = new Graphics()
            .drawCommands(shapes.PlayerUI[1])
            .setRenderable(false)
            .setTransform(199.9, 630);
        var instance10 = this.track = new lib.Bar()
            .setTransform(200, 900);
        var instance9 = this.bar = new lib.Progress_Bar()
            .setTransform(200, 900)
            .setMask(instance8);
        var instance7 = this.pBar = new lib.PreloaderBar()
            .setTransform(191.1, 827.05);
        var instance6 = new lib.Marker()
            .setTransform(1434.4, 1041.5);
        var instance5 = this.videoruntime = new lib.VideoRunTime()
            .setTransform(1300, 630);
        var instance4 = this.playBtn = new lib.VideoButton()
            .setTransform(-100, 600);
        var instance3 = this.closeBtn = new lib.VideoButton()
            .setTransform(1300, 40);
        var instance2 = new Sprite(fromFrame("Screen Shot 2016-11-07 at 7.18.16 PM"))
            .setTransform(1345);
        var instance1 = this.volumeBtn = new lib.VideoButton()
            .setTransform(1300, 160);
        this.addChild(instance8, instance10, instance9, instance7, instance6, instance5, instance4, instance3, instance2, instance1);
    });

    lib.PlayerUI.assets = {
        "PlayerUI": "images/PlayerUI.shapes.json",
        "PlayerUI_atlas_1": "images/PlayerUI_atlas_1.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.PlayerUI,
        background: 0x990000,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 1,
        library: lib
    };
}
