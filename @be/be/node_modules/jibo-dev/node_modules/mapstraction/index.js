var fs = require('fs');
var path = require('path');
var through = require('through2');
var convert = require('convert-source-map');

var SEARCH_KEY = '//# sourceMappingURL=';

module.exports = function (browserify, options) {
    // debug mode only
    if (browserify._options.debug) {

        // Get the map file name
        var map = options._ ? options._[0] : browserify.argv.outfile + '.map';

        // create a transform stream
        var createStream = function () {
            var code = '';
            var stream = through.obj(function (buf, enc, next) {
                // accumulate the code chunks
                code += buf.toString();
                next();
            }, function (next) {
                var index = code.indexOf(SEARCH_KEY);
                var sourcemap = code.substr(index);
                var json = convert.fromComment(sourcemap).toJSON(2);
                fs.writeFileSync(map, json);
                code = code.substr(0, index) + SEARCH_KEY + path.basename(map);

                this.push(new Buffer(code));
                next();
            });
            stream.label = "mapstraction";
            return stream;
        };

        //  hook into the bundle generation pipeline of Browserify
        browserify.pipeline.get("wrap").push(createStream());
        browserify.on("reset", function () {
            browserify.pipeline.get("wrap").push(createStream());
        });
    }
};
