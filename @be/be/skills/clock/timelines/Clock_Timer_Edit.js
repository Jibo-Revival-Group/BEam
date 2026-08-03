(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Text = PIXI.Text;

    lib.Clock_Timer_Edit = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 1,
            framerate: 30
        });
        var instance5 = new Text("m")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 120,
                fontWeight: "bold",
                fill: "#6e6e80"
            })
            .setAlign("right")
            .setTransform(916.2, 413);
        var instance4 = new Text("h")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 120,
                fontWeight: "bold",
                fill: "#6e6e80"
            })
            .setAlign("right")
            .setTransform(424.6, 413);
        var instance3 = this.hourCounter = new Text("0")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 260,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("right")
            .setTransform(355.2, 291);
        var instance2 = this.minuteTensCounter = new Text("0")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 260,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(570.6, 291);
        var instance1 = this.minuteOnesCounter = new Text("0")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 260,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(730.6, 291);
        this.addChild(instance5, instance4, instance3, instance2, instance1);
    });

    lib.Clock_Timer_Edit.assets = {};
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.Clock_Timer_Edit,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 1,
        library: lib
    };
}