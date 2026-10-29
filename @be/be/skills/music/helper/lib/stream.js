'use strict';

// On-robot buffered streaming. YouTube's adaptive AVC/AAC streams are
// fragmented MP4 with a tiny sidx index. We fetch the init segment and index,
// map a playback time to a fragment, and proxy the fragments to the media player over
// plain localhost HTTP as they are needed. No ffmpeg and no full-file download.
//
// googlevideo throttles an open-ended range (`bytes=N-`) to a few KB/s, while
// bounded ranges of a few MB arrive at full speed (yt-dlp downloads YouTube in
// chunks for the same reason). The proxy therefore reads the file in
// CHUNK_BYTES requests, each completely and at full speed, and feeds the
// player from memory while the next chunk is fetched. No upstream connection
// sits idle while the player's buffer is full (googlevideo lets those go dead),
// and a failed request is simply repeated: nothing of it reached the player.
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
const https = require('https');
const http = require('http');
const url = require('url');
const yt = require('./innertube');
const innertube = require('./innertube');

const {
  videoId
} = require('./util');
const INDEX_TTL_MS = 10 * 60 * 1000;
const CAPTION_TTL_MS = 30 * 60 * 1000;
const CHUNK_BYTES = 2 * 1024 * 1024;
const FIRST_CHUNK_BYTES = 512 * 1024;
const CHUNK_ATTEMPTS = 4;
const indexCache = new Map();
const captionCache = new Map();
function readUInt64(buffer, offset) {
  const high = buffer.readUInt32BE(offset);
  const low = buffer.readUInt32BE(offset + 4);
  return high * 4294967296 + low;
}
function parseSidx(buffer) {
  const marker = Buffer.from('sidx');
  const typeAt = buffer.indexOf(marker);
  if (typeAt < 4) throw new Error('sidx_missing');
  const box = typeAt - 4;
  const version = buffer.readUInt8(box + 8);
  let offset = box + 12;
  offset += 4; // reference_ID
  const timescale = buffer.readUInt32BE(offset);
  offset += 4;
  let earliest, firstOffset;
  if (version === 0) {
    earliest = buffer.readUInt32BE(offset);
    offset += 4;
    firstOffset = buffer.readUInt32BE(offset);
    offset += 4;
  } else {
    earliest = readUInt64(buffer, offset);
    offset += 8;
    firstOffset = readUInt64(buffer, offset);
    offset += 8;
  }
  offset += 2; // reserved
  const count = buffer.readUInt16BE(offset);
  offset += 2;
  if (!timescale || offset + count * 12 > buffer.length) throw new Error('sidx_bad');
  const entries = [];
  for (let i = 0; i < count; i++) {
    const first = buffer.readUInt32BE(offset);
    offset += 4;
    const duration = buffer.readUInt32BE(offset);
    offset += 4;
    offset += 4; // SAP
    const referenceType = first >>> 31;
    const size = first & 0x7fffffff;
    if (!referenceType && size > 0) entries.push({
      size: size,
      duration: duration
    });
  }
  return {
    timescale: timescale,
    earliest: earliest,
    firstOffset: firstOffset,
    entries: entries
  };
}

// Buffer only an exact bounded range; redirects and body share one deadline.
function fetchRange(target, start, end, session, deadline) {
  const size = end - start + 1,
    util = require('./util');
  if (!isFinite(start) || !isFinite(end) || start < 0 || size < 1 || size > CHUNK_BYTES || Math.floor(start) !== start || Math.floor(end) !== end) return Promise.reject(util.failure('range_size'));
  return util.requestBuffer(target, {
    headers: {
      'User-Agent': innertube.PLAYER_USER_AGENT,
      'Accept-Encoding': 'identity',
      'Range': 'bytes=' + start + '-' + end
    },
    timeoutMs: deadline ? Math.max(1, Math.min(20000, deadline - util.now())) : 20000,
    maxBytes: size,
    retries: 0,
    registerCancel: session ? function (cancel) {
      session.current = cancel;
      if (session.closed) cancel();
    } : null
  }).then(function (result) {
    const range = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(result.headers['content-range'] || '');
    if (result.status !== 206 || !range || Number(range[1]) !== start || Number(range[2]) !== end) throw util.failure('range_mismatch');
    if (result.buffer.length !== size) throw util.failure('range_short');
    return result.buffer;
  }).then(function (bytes) {
    if (session) session.current = null;
    return bytes;
  }, function (error) {
    if (session) session.current = null;
    throw error;
  });
}
function loadIndex(_x, _x2) {
  return _loadIndex.apply(this, arguments);
}
function _loadIndex() {
  _loadIndex = _asyncToGenerator(function* (format, kind) {
    if (!format || !format.url || !format.initRange || !format.indexRange) throw new Error('no_' + kind + '_index');
    const key = format.itag + ':' + format.url;
    const hit = indexCache.get(key);
    if (hit && Date.now() - hit.at < INDEX_TTL_MS) return hit.value;
    const initStart = Number(format.initRange.start),
      initEnd = Number(format.initRange.end);
    const indexStart = Number(format.indexRange.start),
      indexEnd = Number(format.indexRange.end);
    const init = yield fetchRange(format.url, initStart, initEnd);
    const sidxBuffer = yield fetchRange(format.url, indexStart, indexEnd);
    const sidx = parseSidx(sidxBuffer);
    const base = indexEnd + 1 + sidx.firstOffset;
    let offset = base;
    const entries = [];
    let elapsed = sidx.earliest;
    sidx.entries.forEach(function (entry) {
      entries.push({
        offset: offset,
        size: entry.size,
        start: elapsed / sidx.timescale,
        duration: entry.duration / sidx.timescale
      });
      offset += entry.size;
      elapsed += entry.duration;
    });
    const value = {
      init: init,
      entries: entries,
      timescale: sidx.timescale,
      duration: elapsed / sidx.timescale,
      end: offset,
      size: format.contentLength || 0
    };
    indexCache.set(key, {
      at: Date.now(),
      value: value
    });
    if (indexCache.size > 8) indexCache.delete(indexCache.keys().next().value);
    return value;
  });
  return _loadIndex.apply(this, arguments);
}
function choose(entries, seconds) {
  if (!entries.length) return 0;
  let chosen = 0;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].start <= seconds + 0.05) chosen = i;else break;
  }
  return chosen;
}
function chooseNearest(entries, seconds) {
  if (!entries.length) return 0;
  let chosen = 0;
  let distance = Math.abs(entries[0].start - seconds);
  for (let i = 1; i < entries.length; i++) {
    const next = Math.abs(entries[i].start - seconds);
    if (next < distance) {
      chosen = i;
      distance = next;
    }
  }
  return chosen;
}
function chooseAtOrAfter(entries, seconds) {
  if (!entries.length) return 0;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].start >= seconds - 0.05) return i;
  }
  return entries.length - 1;
}
function streamPath(id, kind, frag, start) {
  return '/stream/' + id + '/' + kind + '?frag=' + frag + '&t=' + Number(start || 0).toFixed(3);
}
function info(_x3, _x4, _x5) {
  return _info.apply(this, arguments);
}
function _info() {
  _info = _asyncToGenerator(function* (id, position, snap) {
    id = videoId(id);
    if (!id) throw new Error('bad_video_id');
    const video = yield yt.video(id);
    const segments = [];
    const candidates = video.formats.videoCandidates || [video.formats.video];
    let videoIndex = null,
      fallback = false;
    for (let i = 0; i < Math.min(3, candidates.length); i++) {
      try {
        videoIndex = yield loadIndex(candidates[i], 'video');
        video.formats.video = candidates[i];
        fallback = i > 0;
        break;
      } catch (error) {
        if (error.code === 'timeout') throw error;
      }
    }
    if (!videoIndex) throw require('./util').failure('unsupported_format');
    const audioIndex = video.formats.audio ? yield loadIndex(video.formats.audio, 'audio') : null;
    let at = Number(position) || 0;
    if (at < 0) at = 0;
    if (video.duration && at > video.duration - 0.5) at = Math.max(0, video.duration - 0.5);
    // Video can only start on a fragment's keyframe, so it sets the start;
    // the audio fragment that covers it is trimmed to the same instant.
    // Skips (SponsorBlock) snap forward so nothing skipped is shown again.
    const videoFrag = snap === 'after' ? chooseAtOrAfter(videoIndex.entries, at) : choose(videoIndex.entries, at);
    const start = videoIndex.entries[videoFrag] ? videoIndex.entries[videoFrag].start : 0;
    const audioFrag = audioIndex ? choose(audioIndex.entries, start) : 0;
    return {
      id: id,
      title: video.title,
      channel: video.channel,
      duration: video.duration,
      height: video.formats.video.height || 0,
      videoMime: video.formats.video.mimeType,
      audioMime: video.formats.audio ? video.formats.audio.mimeType : '',
      status: fallback ? 'format_fallback' : 'ready',
      start: start,
      video: streamPath(id, 'video', videoFrag, start),
      audio: audioIndex ? streamPath(id, 'audio', audioFrag, start) : '',
      segments: segments
    };
  });
  return _info.apply(this, arguments);
}
function readRange(session, start, end) {
  return fetchRange(session.target, start, end, session).then(function (bytes) {
    return {
      pieces: [bytes],
      length: bytes.length
    };
  });
}

// GStreamer 1.8's qtdemux takes fragment timestamps from each moof's tfdt
// box, so a stream that starts at 1:00 would hold its first frame for a full
// minute before playing. Rebasing every tfdt by the start time makes the
// stream begin at zero; the app adds the start back for its clock, captions
// and SponsorBlock. With `trim` (audio), samples before the start are cut
// from the first fragments so sound begins with the video's keyframe.
// Top-level boxes other than moof (and a held fragment's mdat) pass through.
function Rebaser(ticks, trim) {
  this.ticks = ticks;
  this.trim = !!trim;
  this.header = Buffer.alloc(0);
  this.box = null; // moof (or a held fragment's mdat) being collected
  this.held = null; // moof waiting for its mdat while trimming
  this.skip = 0; // bytes of a pass-through box still to copy
}
Rebaser.prototype.push = function (chunk, out) {
  let at = 0;
  while (at < chunk.length) {
    if (this.skip > 0) {
      const take = Math.min(this.skip, chunk.length - at);
      out.push(chunk.slice(at, at + take));
      this.skip -= take;
      at += take;
      continue;
    }
    if (this.box) {
      const take = Math.min(this.box.length - this.box.filled, chunk.length - at);
      chunk.copy(this.box, this.box.filled, at, at + take);
      this.box.filled += take;
      at += take;
      if (this.box.filled === this.box.length) this.complete(out);
      continue;
    }
    const need = 8 - this.header.length;
    this.header = Buffer.concat([this.header, chunk.slice(at, at + need)]);
    at += Math.min(need, chunk.length - at);
    if (this.header.length < 8) continue;
    const size = this.header.readUInt32BE(0);
    const type = this.header.toString('latin1', 4, 8);
    const header = this.header;
    this.header = Buffer.alloc(0);
    if (size === 1 || size < 8) {
      // 64-bit or to-end sizes never occur for fragments; stop rewriting.
      if (this.held) {
        out.push(this.rebased(this.held));
        this.held = null;
      }
      out.push(header);
      this.skip = Infinity;
      continue;
    }
    const collect = type === 'moof' ? size < 4 * 1024 * 1024 : type === 'mdat' && this.held && size < 16 * 1024 * 1024;
    if (collect) {
      this.box = Buffer.alloc(size);
      header.copy(this.box, 0);
      this.box.filled = 8;
      this.box.type = type;
    } else {
      if (this.held) {
        out.push(this.rebased(this.held));
        this.held = null;
        this.trim = false;
      }
      out.push(header);
      this.skip = size - 8;
    }
  }
};
Rebaser.prototype.complete = function (out) {
  const box = this.box;
  this.box = null;
  if (box.type === 'mdat') {
    const held = this.held;
    const parts = trimFragment(held, box, this.ticks);
    this.held = null;
    if (!parts) {
      out.push(this.rebased(held));
      out.push(box);
      this.trim = false;
      return;
    }
    if (parts.length) {
      out.push(this.rebased(parts[0]));
      out.push(parts[1]);
      this.trim = false;
    }
    return;
  }
  if (this.trim) this.held = box;else out.push(this.rebased(box));
};
Rebaser.prototype.rebased = function (moof) {
  const ticks = this.ticks;
  eachTfdt(moof, function (at) {
    if (moof.readUInt8(at + 8) === 1) {
      const time = Math.max(0, readUInt64(moof, at + 12) - ticks);
      moof.writeUInt32BE(Math.floor(time / 4294967296), at + 12);
      moof.writeUInt32BE(time % 4294967296, at + 16);
    } else {
      moof.writeUInt32BE(Math.max(0, moof.readUInt32BE(at + 12) - ticks), at + 12);
    }
  });
  return moof;
};
function eachTfdt(moof, visit) {
  eachBox(moof, 8, moof.length, function (type, start, end) {
    if (type === 'traf') eachBox(moof, start + 8, end, function (inner, at) {
      if (inner === 'tfdt') visit(at);
    });
  });
}
function findBoxes(buffer, start, end) {
  const found = {};
  eachBox(buffer, start, end, function (type, at, stop) {
    if (!found[type]) found[type] = {
      at: at,
      end: stop
    };
  });
  return found;
}
// Drop the samples of one fragment (single traf/trun, data in the mdat that
// follows) whose decode time is before `ticks`. Returns [moof, mdat], [] when
// the whole fragment is early, or null (left untouched) for other layouts.
function trimFragment(moof, mdat, ticks) {
  const top = findBoxes(moof, 8, moof.length);
  if (!top.traf) return null;
  const traf = findBoxes(moof, top.traf.at + 8, top.traf.end);
  if (!traf.tfhd || !traf.tfdt || !traf.trun) return null;
  const tfhdFlags = moof.readUInt32BE(traf.tfhd.at + 8) & 0xffffff;
  let field = traf.tfhd.at + 16; // after track_ID
  if (tfhdFlags & 0x1) field += 8;
  if (tfhdFlags & 0x2) field += 4;
  const defaultDuration = tfhdFlags & 0x8 ? moof.readUInt32BE(field) : 0;
  if (tfhdFlags & 0x8) field += 4;
  const defaultSize = tfhdFlags & 0x10 ? moof.readUInt32BE(field) : 0;
  const trun = traf.trun.at;
  const flags = moof.readUInt32BE(trun + 8) & 0xffffff;
  const count = moof.readUInt32BE(trun + 12);
  if (!(flags & 0x1)) return null;
  let entries = trun + 20;
  if (flags & 0x4) entries += 4;
  const entrySize = 4 * ((flags & 0x100 ? 1 : 0) + (flags & 0x200 ? 1 : 0) + (flags & 0x400 ? 1 : 0) + (flags & 0x800 ? 1 : 0));
  if (moof.readInt32BE(trun + 16) !== moof.length + 8 || entries + count * entrySize > traf.trun.end) return null;
  const tfdtV1 = moof.readUInt8(traf.tfdt.at + 8) === 1;
  let time = tfdtV1 ? readUInt64(moof, traf.tfdt.at + 12) : moof.readUInt32BE(traf.tfdt.at + 12);
  let drop = 0,
    dropBytes = 0;
  while (drop < count) {
    const entry = entries + drop * entrySize;
    const duration = flags & 0x100 ? moof.readUInt32BE(entry) : defaultDuration;
    const size = flags & 0x200 ? moof.readUInt32BE(entry + (flags & 0x100 ? 4 : 0)) : defaultSize;
    if (!duration || time + duration / 2 > ticks) break;
    time += duration;
    dropBytes += size;
    drop++;
  }
  if (drop === count) return [];
  if (!drop) return [moof, mdat];
  const cut = drop * entrySize;
  const trimmed = Buffer.concat([moof.slice(0, entries), moof.slice(entries + cut)]);
  trimmed.writeUInt32BE(trimmed.length, 0);
  trimmed.writeUInt32BE(top.traf.end - top.traf.at - cut, top.traf.at);
  trimmed.writeUInt32BE(traf.trun.end - traf.trun.at - cut, trun);
  trimmed.writeUInt32BE(count - drop, trun + 12);
  trimmed.writeInt32BE(trimmed.length + 8, trun + 16);
  if (tfdtV1) {
    trimmed.writeUInt32BE(Math.floor(time / 4294967296), traf.tfdt.at + 12);
    trimmed.writeUInt32BE(time % 4294967296, traf.tfdt.at + 16);
  } else {
    trimmed.writeUInt32BE(time, traf.tfdt.at + 12);
  }
  const payload = mdat.slice(8 + dropBytes);
  const box = Buffer.alloc(8);
  box.writeUInt32BE(payload.length + 8, 0);
  box.write('mdat', 4, 'latin1');
  return [trimmed, Buffer.concat([box, payload])];
}
function eachBox(buffer, start, end, visit) {
  let at = start;
  while (at + 8 <= end) {
    const size = buffer.readUInt32BE(at);
    if (size < 8 || at + size > end) return;
    visit(buffer.toString('latin1', at + 4, at + 8), at, at + size);
    at += size;
  }
}

// Node 6 frees Buffer memory lazily; streamed chunks (MBs) otherwise pile up
// on a robot with no swap. The launcher passes --expose-gc.
let lastGc = 0;
function collectGarbage() {
  if (typeof global.gc !== 'function' || Date.now() - lastGc < 3000) return;
  lastGc = Date.now();
  try {
    global.gc();
  } catch (_) {}
}
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

// The signed URL can expire or be refused mid-video; fetch a fresh one for the
// same itag (the byte layout is identical) before giving up.
function refreshUrl(_x6, _x7, _x8) {
  return _refreshUrl.apply(this, arguments);
}
function _refreshUrl() {
  _refreshUrl = _asyncToGenerator(function* (id, kind, itag) {
    innertube.forget(id);
    const video = yield yt.video(id);
    const candidates = kind === 'audio' ? [video.formats.audio] : video.formats.videoCandidates || [video.formats.video];
    const format = candidates.filter(function (f) {
      return f && String(f.itag) === String(itag);
    })[0];
    if (!format) throw new Error('format_changed');
    return format.url;
  });
  return _refreshUrl.apply(this, arguments);
}
let activeProxies = 0;
function proxy(_x9, _x0, _x1, _x10, _x11, _x12) {
  return _proxy.apply(this, arguments);
}
function _proxy() {
  _proxy = _asyncToGenerator(function* (id, kind, frag, start, request, response) {
    if (activeProxies >= 2) throw require('./util').failure('provider_busy');
    activeProxies++;
    const session = {
      closed: false,
      current: null,
      rebaser: null
    };
    const close = function () {
      if (session.closed) return;
      session.closed = true;
      if (session.current) session.current();
    };
    session.close = close;
    request.on('aborted', close);
    response.on('close', close);
    try {
      return yield proxyOwned(id, kind, frag, start, request, response, session);
    } finally {
      close();
      request.removeListener('aborted', close);
      response.removeListener('close', close);
      activeProxies--;
    }
  });
  return _proxy.apply(this, arguments);
}
function proxyOwned(_x13, _x14, _x15, _x16, _x17, _x18, _x19) {
  return _proxyOwned.apply(this, arguments);
}
function _proxyOwned() {
  _proxyOwned = _asyncToGenerator(function* (id, kind, frag, start, request, response, session) {
    id = videoId(id);
    if (!id || kind !== 'video' && kind !== 'audio') throw new Error('bad_stream');
    const video = yield yt.video(id);
    const format = kind === 'audio' ? video.formats.audio : video.formats.video;
    if (!format) throw new Error('no_' + kind + '_stream');
    const index = yield loadIndex(format, kind);
    if (!index.entries.length) throw new Error('empty_stream');
    let at = Math.floor(Number(frag) || 0);
    if (at < 0) at = 0;
    if (at >= index.entries.length) at = index.entries.length - 1;
    const base = Math.max(0, Number(start) || 0);
    if (session.closed || request.aborted || response.destroyed) return;
    session.rebaser = new Rebaser(Math.round(base * index.timescale), kind === 'audio');
    response.writeHead(200, {
      'Content-Type': kind === 'audio' ? 'audio/mp4' : 'video/mp4',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
      'Accept-Ranges': 'none',
      'X-JiboTube-Start': String(index.entries[at].start)
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    const last = index.end - 1;
    let offset = index.entries[at].offset;
    session.target = format.url;
    // One chunk ahead, with retries; a 403/410 means the signed URL expired.
    const fetchChunk = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (from, size) {
        const end = Math.min(last, from + (size || CHUNK_BYTES) - 1);
        for (let failures = 1;; failures++) {
          try {
            const data = yield readRange(session, from, end);
            if (data.length) return data;
            throw new Error('range_empty');
          } catch (error) {
            if (session.closed) return null;
            console.error('stream ' + id + ' ' + kind + ' @' + from + ': ' + require('./util').safeCode(error) + ' (attempt ' + failures + ')');
            if (failures >= CHUNK_ATTEMPTS) throw error;
            if (error.status === 403 || error.status === 410) {
              try {
                session.target = yield refreshUrl(id, kind, format.itag);
              } catch (refreshError) {
                console.error('stream ' + id + ' refresh: ' + require('./util').safeCode(refreshError));
              }
            } else {
              yield sleep(500 * failures);
            }
          }
        }
      });
      return function fetchChunk(_x21, _x22) {
        return _ref.apply(this, arguments);
      };
    }();
    // The player pauses reading while its buffer is full (minutes for audio);
    // that is normal backpressure, so wait for drain or the player closing.
    const drained = function () {
      return new Promise(function (resolve) {
        const done = function () {
          response.removeListener('drain', done);
          response.removeListener('close', done);
          resolve();
        };
        response.on('drain', done);
        response.on('close', done);
      });
    };
    const send = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (data) {
        while (data.pieces.length && !session.closed) {
          const parts = [];
          session.rebaser.push(data.pieces.shift(), parts);
          for (let i = 0; i < parts.length && !session.closed; i++) {
            if (!response.write(parts[i])) yield drained();
          }
        }
      });
      return function send(_x23) {
        return _ref2.apply(this, arguments);
      };
    }();
    response.write(index.init);
    let next = fetchChunk(offset, FIRST_CHUNK_BYTES); // a small first read starts playback sooner
    try {
      while (!session.closed && offset <= last) {
        const data = yield next;
        if (!data) break;
        offset += data.length;
        next = offset <= last ? fetchChunk(offset) : null;
        if (next) next.catch(function () {});
        yield send(data);
        collectGarbage();
      }
    } catch (error) {
      console.error('stream ' + id + ' ' + kind + ': giving up at byte ' + offset + ' (' + require('./util').safeCode(error) + ')');
      try {
        response.destroy();
      } catch (_) {}
      return;
    }
    console.log('stream ' + id + ' ' + kind + ' frag ' + at + ': ' + (session.closed ? 'player closed' : 'complete') + ' at byte ' + offset + '/' + (last + 1));
    if (!session.closed) response.end();
  });
  return _proxyOwned.apply(this, arguments);
}
function captions(_x20) {
  return _captions.apply(this, arguments);
}
function _captions() {
  _captions = _asyncToGenerator(function* (id) {
    id = videoId(id);
    if (!id) throw new Error('bad_video_id');
    const video = yield yt.video(id);
    if (!video.captionUrl) return [];
    const key = id + ':' + video.captionUrl;
    const hit = captionCache.get(key);
    if (hit && Date.now() - hit.at < CAPTION_TTL_MS) return hit.cues;
    const cues = (yield yt.captions(video.captionUrl).catch(function () {
      return [];
    })).slice(0, 4000);
    captionCache.set(key, {
      at: Date.now(),
      cues: cues
    });
    if (captionCache.size > 8) captionCache.delete(captionCache.keys().next().value);
    return cues;
  });
  return _captions.apply(this, arguments);
}
module.exports = {
  CHUNK_BYTES: CHUNK_BYTES,
  info: info,
  proxy: proxy,
  captions: captions,
  parseSidx: parseSidx,
  choose: choose,
  chooseNearest: chooseNearest,
  chooseAtOrAfter: chooseAtOrAfter,
  loadIndex: loadIndex,
  Rebaser: Rebaser
};
