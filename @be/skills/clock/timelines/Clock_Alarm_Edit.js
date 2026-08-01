(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Text = PIXI.Text;

    lib.Clock_Alarm_Edit = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 1,
            framerate: 24
        });
        var instance6 = this.hourCounter = new Text("12")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 260,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("right")
            .setTransform(355.2, 290);
        var instance5 = this.minuteTensCounter = new Text("0")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 260,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(484.6, 290);
        var instance4 = this.minuteOnesCounter = new Text("0")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 260,
                fontWeight: "bold",
                fill: "#fff"
            })
            .setAlign("center")
            .setTransform(644.6, 290);
        var instance3 = this.alarmColon = new Text(":")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 200,
                fontWeight: "bold",
                fill: "#6e6e80"
            })
            .setAlign("right")
            .setTransform(405.35, 302);
        var instance2 = this.amLabel = new Text("AM")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 110,
                fontWeight: "bold",
                fill: "#6e6e80"
            })
            .setAlign("center")
            .setTransform(841.6500000000001, 325);
        var instance1 = this.pmLabel = new Text("PM")
            .setStyle({
                fontFamily: "Proxima Nova Soft",
                fontSize: 110,
                fontWeight: "bold",
                fill: "#00d4f0"
            })
            .setAlign("center")
            .setTransform(843.825, 431);
        this.addChild(instance6, instance5, instance4, instance3, instance2, instance1);
    });

    lib.Clock_Alarm_Edit.assets = {};
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.Clock_Alarm_Edit,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 24,
        totalFrames: 1,
        library: lib
    };
}