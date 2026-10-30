'use strict';
// Jukebox lists music/Artist/Album/ albums, including ones BEacon creates with an artist.
var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var paths = require('../@be/be/beacon/lib/paths');
var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-jukebox-'));
paths.musicDir = function () { return dir; };
var jukebox = require('../@be/be/beacon/lib/jukebox');
function ids() { return jukebox.scan().albums.map(function (a) { return a.id + ':' + a.tracks.length; }).sort(); }

fs.mkdirSync(dir + '/Beatles'); fs.mkdirSync(dir + '/Beatles/Abbey_Road');
fs.writeFileSync(dir + '/Beatles/Abbey_Road/Come_Together.mp3', 'ID3');
fs.mkdirSync(dir + '/Flat'); fs.writeFileSync(dir + '/Flat/One.mp3', 'ID3'); fs.mkdirSync(dir + '/Flat/extras');
fs.mkdirSync(dir + '/Empty');
assert.deepStrictEqual(ids(), ['Beatles/Abbey_Road:1', 'Empty:0', 'Flat:1']);

jukebox.createAlbum('Queen', 'Jazz');
assert.deepStrictEqual(ids(), ['Beatles/Abbey_Road:1', 'Empty:0', 'Flat:1', 'Queen/Jazz:0']);
jukebox.saveFile('Queen/Jazz', 'Mustapha.mp3', new Buffer('ID3'));
var jazz = jukebox.scan().albums.filter(function (a) { return a.id === 'Queen/Jazz'; })[0];
assert.strictEqual(jazz.artist, 'Queen');
assert.deepStrictEqual(jazz.tracks.map(function (t) { return t.rel; }), ['Queen/Jazz/Mustapha.mp3']);
console.log('PASS jukebox lists and opens Artist/Album albums');
