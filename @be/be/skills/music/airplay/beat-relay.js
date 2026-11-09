'use strict';
// Run by ALSA (airplay/.asoundrc, pcm.airplay_beat): AirPlay's PCM (S16LE stereo 44.1 kHz) arrives on stdin and goes
// to the Music skill's tempo tracker over UDP 127.0.0.1:18703. UDP never blocks: with nobody listening it is dropped,
// and stdin is always drained so AirPlay playback can't stall on this tap.
const socket = require('dgram').createSocket('udp4');
socket.on('error', () => {});
process.stdin.on('data', bytes => {
    for (let i = 0; i < bytes.length; i += 8192) socket.send(bytes, i, Math.min(8192, bytes.length - i), 18703, '127.0.0.1', () => {});
});
process.stdin.on('end', () => process.exit(0));
process.stdin.on('error', () => process.exit(0));
