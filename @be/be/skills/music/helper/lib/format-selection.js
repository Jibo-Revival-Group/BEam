'use strict';
function audioRank(format) {
    const track = format.audioTrack || {};
    if (track.audioIsDefault === true) return 4;
    const language = String(track.id || format.language || format.audioLanguage || '').toLowerCase();
    const label = typeof track.displayName === 'string' ? track.displayName.toLowerCase() : '';
    if (/^en(?:[.\-_]|$)/.test(language) || /\benglish\b/.test(label)) return 3;
    if (/\boriginal\b/.test(label)) return 2;
    return !track.id && !track.displayName && !format.language && !format.audioLanguage ? 1 : 0;
}
function select(formats, config) {
    let video = null, audio = null;
    const videos = [];
    (formats || []).forEach(format => {
        if (!format.url) return;
        const mime = String(format.mimeType || '');
        if (/video\/mp4/.test(mime) && /avc1/.test(mime)) {
            const height = Number(format.height) || 0, fps = Number(format.fps) || 30;
            if (height <= 0 || height > config.maxHeight || fps > (config.maxFps || 30)) return;
            videos.push(format);
            if (!video || height > Number(video.height) || (height === Number(video.height) && fps < (Number(video.fps) || 30))) video = format;
        } else if (/audio\/mp4/.test(mime) && /mp4a/.test(mime)) {
            const rank = audioRank(format), previous = audio ? audioRank(audio) : -1;
            const preferred = Number(format.itag) === 140;
            if (!audio || rank > previous || (rank === previous && preferred && Number(audio.itag) !== 140) ||
                (rank === previous && preferred === (Number(audio.itag) === 140) && Number(format.bitrate) > Number(audio.bitrate))) audio = format;
        }
    });
    function item(format, sound) {
        if (!format) return null;
        const result = { url: format.url, contentLength: Number(format.contentLength) || 0, itag: format.itag,
            mimeType: String(format.mimeType || ''), initRange: format.initRange, indexRange: format.indexRange };
        if (sound) { result.sampleRate = Number(format.audioSampleRate) || 0; result.audioTrack = format.audioTrack || null; }
        else { result.height = Number(format.height) || 0; result.fps = Number(format.fps) || 30; }
        return result;
    }
    videos.sort((a, b) => Number(b.height) - Number(a.height) || (Number(a.fps) || 30) - (Number(b.fps) || 30));
    return { video: item(video, false), audio: item(audio, true), videoCandidates: videos.slice(0, 3).map(format => item(format, false)) };
}
module.exports = { select: select, audioRank: audioRank };
