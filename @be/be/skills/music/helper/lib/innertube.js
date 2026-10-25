'use strict';

// On-robot YouTube client. Search uses the InnerTube "ANDROID" client; the
// player uses "VISIONOS", the client yt-dlp picks when it has no JavaScript
// runtime: its adaptive AVC/AAC URLs need no signature deciphering and no PO
// token, and they serve any byte range. VISIONOS is bot-checked without a
// visitor ID, so one is fetched from youtube.com and reused. ANDROID_VR is now
// bot-checked, and ANDROID's adaptive URLs stop serving after a few MB.
// No yt-dlp, no host service: search, metadata, captions, thumbnails and media
// all run on Jibo.
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
const https = require('https');
const http = require('http');
const zlib = require('zlib');
const url = require('url');
const config = require('./config');
const {
  cleanText,
  videoId
} = require('./util');
const CLIENT = {
  clientName: 'ANDROID',
  clientVersion: '20.10.38',
  androidSdkVersion: 34,
  hl: 'en',
  gl: 'US'
};
const USER_AGENT = 'com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip';
const PLAYER_CLIENT = {
  clientName: 'VISIONOS',
  clientVersion: '1.02',
  deviceMake: 'Apple',
  deviceModel: 'RealityDevice17,1',
  osName: 'visionOS',
  osVersion: '26.5.23O471',
  hl: 'en',
  gl: 'US'
};
const PLAYER_CLIENT_ID = '101';
const PLAYER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15';
const VISITOR_TTL = 6 * 60 * 60 * 1000;
let visitor = null;
const CACHE_TTL = 8 * 60 * 1000;
const cache = new Map();
let active = 0;
const waiting = [];
const inFlight = new Map();
function schedule(work) {
  return new Promise(function (resolve, reject) {
    const start = function () {
      active++;
      Promise.resolve().then(work).then(function (value) {
        active--;
        pump();
        resolve(value);
      }, function (error) {
        active--;
        pump();
        reject(error);
      });
    };
    if (active < 4) start();else if (waiting.length < 20) {
      let timer = null;
      const queued = function () {
        clearTimeout(timer);
        start();
      };
      timer = setTimeout(function () {
        const i = waiting.indexOf(queued);
        if (i >= 0) {
          waiting.splice(i, 1);
          reject(require('./util').failure('timeout'));
        }
      }, 10000);
      waiting.push(queued);
    } else reject(require('./util').failure('provider_busy'));
  });
}
function pump() {
  while (active < 4 && waiting.length) waiting.shift()();
}
function cached(key, ttl, work) {
  const now = Date.now(),
    hit = cache.get(key);
  if (hit && now - hit.at < ttl) return Promise.resolve(hit.value);
  if (inFlight.has(key)) return inFlight.get(key);
  if (inFlight.size >= 24) return Promise.reject(require('./util').failure('provider_busy'));
  const pending = Promise.resolve().then(work).then(function (value) {
    cache.set(key, {
      at: Date.now(),
      value: value
    });
    if (cache.size > 64) cache.delete(cache.keys().next().value);
    inFlight.delete(key);
    return value;
  }, function (error) {
    inFlight.delete(key);
    throw error;
  });
  inFlight.set(key, pending);
  return pending;
}
function thumbPath(id) {
  return '/thumb/' + id + '.jpg';
}
function requestBuffer(target, options) {
  return require('./util').requestBuffer(target, Object.assign({
    headers: {
      'User-Agent': USER_AGENT
    },
    retries: 1
  }, options || {}));
}
function post(_x, _x2, _x3) {
  return _post.apply(this, arguments);
} // The service worker data is a small JSON document that carries a fresh
// visitor ID, which is all the VISIONOS player needs to pass the bot check.
function _post() {
  _post = _asyncToGenerator(function* (path, payload, extraHeaders) {
    const body = Buffer.from(JSON.stringify(payload));
    const response = yield requestBuffer('https://www.youtube.com/youtubei/v1/' + path + '?prettyPrint=false', {
      method: 'POST',
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'Accept-Encoding': 'gzip'
      }, extraHeaders || {}),
      body: body,
      timeoutMs: 25000
    });
    let value;
    try {
      value = JSON.parse(response.buffer.toString('utf8'));
    } catch (_) {
      throw require('./util').failure('provider_changed');
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw require('./util').failure('provider_changed');
    return value;
  });
  return _post.apply(this, arguments);
}
function visitorData(_x4) {
  return _visitorData.apply(this, arguments);
}
function _visitorData() {
  _visitorData = _asyncToGenerator(function* (fresh) {
    if (!fresh && visitor && Date.now() - visitor.at < VISITOR_TTL) return visitor.value;
    const response = yield requestBuffer('https://www.youtube.com/sw.js_data', {
      headers: {
        'User-Agent': PLAYER_USER_AGENT,
        'Accept-Encoding': 'gzip'
      },
      timeoutMs: 15000
    });
    const match = /"(Cg[A-Za-z0-9_\-%]{10,}={0,2})"/.exec(response.buffer.toString('utf8'));
    if (!match) throw new Error('no_visitor_data');
    visitor = {
      at: Date.now(),
      value: decodeURIComponent(match[1])
    };
    return visitor.value;
  });
  return _visitorData.apply(this, arguments);
}
function player(_x5, _x6) {
  return _player.apply(this, arguments);
}
function _player() {
  _player = _asyncToGenerator(function* (id, fresh) {
    const visitorId = yield visitorData(fresh);
    return post('player', {
      context: {
        client: Object.assign({
          visitorData: visitorId
        }, PLAYER_CLIENT)
      },
      videoId: id,
      contentCheckOk: true,
      racyCheckOk: true
    }, {
      'User-Agent': PLAYER_USER_AGENT,
      'X-Goog-Visitor-Id': visitorId,
      'X-YouTube-Client-Name': PLAYER_CLIENT_ID,
      'X-YouTube-Client-Version': PLAYER_CLIENT.clientVersion,
      'Origin': 'https://www.youtube.com'
    });
  });
  return _player.apply(this, arguments);
}
function getText(_x7) {
  return _getText.apply(this, arguments);
}
function _getText() {
  _getText = _asyncToGenerator(function* (target) {
    const response = yield requestBuffer(target, {
      headers: {
        'Accept-Encoding': 'gzip'
      },
      timeoutMs: 20000
    });
    return response.buffer.toString('utf8');
  });
  return _getText.apply(this, arguments);
}
function textOf(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value.content === 'string') return value.content;
  if (typeof value.simpleText === 'string') return value.simpleText;
  if (Array.isArray(value.runs)) return value.runs.map(function (run) {
    return run.text || '';
  }).join('');
  return '';
}
function parseDuration(value) {
  const parts = String(value || '').trim().split(':').map(Number);
  if (!parts.length || parts.some(function (part) {
    return !isFinite(part);
  })) return 0;
  return parts.reduce(function (total, part) {
    return total * 60 + part;
  }, 0);
}
function parseCount(value) {
  const match = /([\d.,]+)\s*([KMB])?/i.exec(String(value || '').replace(/,/g, ''));
  if (!match) return 0;
  const base = Number(match[1]);
  if (!isFinite(base)) return 0;
  const suffix = (match[2] || '').toUpperCase();
  return Math.round(base * (suffix === 'B' ? 1e9 : suffix === 'M' ? 1e6 : suffix === 'K' ? 1e3 : 1));
}
function channelOf(value) {
  const runs = value && value.runs;
  if (runs && runs.length) {
    const run = runs[0];
    return {
      name: cleanText(run.text, 120),
      id: cleanText(run.navigationEndpoint && run.navigationEndpoint.browseEndpoint && run.navigationEndpoint.browseEndpoint.browseId, 40)
    };
  }
  return {
    name: cleanText(textOf(value), 120),
    id: ''
  };
}
function normalizeEntry(entry) {
  if (!entry) return null;
  const id = videoId(entry.videoId || entry.id);
  if (!id) return null;
  const channel = channelOf(entry.ownerText || entry.longBylineText || entry.shortBylineText);
  const thumbnails = entry.thumbnail && entry.thumbnail.thumbnails || [];
  return {
    id: id,
    title: cleanText(textOf(entry.title) || 'Untitled', 220),
    channel: channel.name,
    channelId: channel.id,
    duration: parseDuration(textOf(entry.lengthText)),
    views: parseCount(textOf(entry.viewCountText) || textOf(entry.shortViewCountText)),
    published: cleanText(textOf(entry.publishedTimeText), 40),
    live: textOf(entry.lengthText) === 'LIVE',
    thumb: thumbPath(id)
  };
}
function collect(value, out) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach(function (item) {
      collect(item, out);
    });
    return;
  }
  if (value.compactVideoRenderer) {
    const item = normalizeEntry(value.compactVideoRenderer);
    if (item) out.push(item);
  }
  if (value.videoRenderer) {
    const item = normalizeEntry(value.videoRenderer);
    if (item) out.push(item);
  }
  if (value.gridVideoRenderer) {
    const item = normalizeEntry(value.gridVideoRenderer);
    if (item) out.push(item);
  }
  Object.keys(value).forEach(function (key) {
    if (key !== 'compactVideoRenderer' && key !== 'videoRenderer' && key !== 'gridVideoRenderer') collect(value[key], out);
  });
}
function search(_x8, _x9) {
  return _search.apply(this, arguments);
}
function _search() {
  _search = _asyncToGenerator(function* (query, limit) {
    query = cleanText(query, 160);
    limit = Math.max(1, Math.min(config.maxSearch, Number(limit) || 18));
    if (!query) return [];
    return cached('search:' + limit + ':' + query.toLowerCase(), CACHE_TTL, function () {
      return schedule(/*#__PURE__*/_asyncToGenerator(function* () {
        const data = yield post('search', {
          context: {
            client: CLIENT
          },
          query: query
        });
        if (!data.contents || typeof data.contents !== 'object') throw require('./util').failure('provider_changed');
        const items = [];
        collect(data.contents || data, items);
        const seen = new Set();
        return items.filter(function (item) {
          if (!item || seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        }).slice(0, limit);
      }));
    });
  });
  return _search.apply(this, arguments);
}
function indexed(format) {
  return ['initRange', 'indexRange'].every(function (key) {
    const r = format[key],
      start = r && Number(r.start),
      end = r && Number(r.end);
    return isFinite(start) && isFinite(end) && start >= 0 && end >= start && end - start < 512 * 1024;
  });
}
function pickFormats(formats) {
  return require('./format-selection').select((Array.isArray(formats) ? formats : []).filter(function (format) {
    return format && /^https?:\/\//.test(format.url || '') && indexed(format);
  }), config);
}

function video(_x0) {
  return _video.apply(this, arguments);
}
function _video() {
  _video = _asyncToGenerator(function* (id) {
    id = videoId(id);
    if (!id) throw new Error('bad_video_id');
    return cached('video:' + id, 4 * 60 * 1000, function () {
      return schedule(/*#__PURE__*/_asyncToGenerator(function* () {
        let data = yield player(id, false);
        if ((data.playabilityStatus || {}).status === 'LOGIN_REQUIRED') data = yield player(id, true);
        const fail = require('./util').failure;
        const status = data && data.playabilityStatus;
        if (!status || typeof status.status !== 'string') throw fail('provider_changed');
        if (status.status !== 'OK') {
          const reason = String(status.reason || '');
          let code = 'unavailable';
          if (/live|premiere|upcoming/i.test(reason) || status.status === 'LIVE_STREAM_OFFLINE') code = 'unsupported_live';else if (/country|region/i.test(reason)) code = 'region';else if (/member|join this channel|subscription/i.test(reason)) code = 'members_only';else if (/not a bot|unusual traffic/i.test(reason)) code = 'provider_unavailable';else if (/age|sign in/i.test(reason)) code = 'age_restricted';
          throw fail(code);
        }
        const details = data.videoDetails || {};
        const duration = Number(details.lengthSeconds);
        if (details.isLiveContent || details.isUpcoming) throw fail('unsupported_live');
        if (!isFinite(duration) || duration <= 0 || !details.title) throw fail('provider_changed');
        if (duration > 6 * 60 * 60) throw fail('video_too_long');
        const micro = data.microformat && data.microformat.playerMicroformatRenderer || {};
        const rawFormats = data.streamingData && data.streamingData.adaptiveFormats;
        if (!Array.isArray(rawFormats)) throw fail('provider_changed');
        const formats = pickFormats(rawFormats);
        if (!formats.video) {
          if (rawFormats.some(function (f) {
            return f && (f.signatureCipher || f.cipher);
          })) throw fail('provider_changed');
          throw fail('unsupported_format');
        }
        if (!formats.audio) throw fail('audio_missing');
        const tracks = data.captions && data.captions.playerCaptionsTracklistRenderer && data.captions.playerCaptionsTracklistRenderer.captionTracks || [];
        let track = null;
        tracks.forEach(function (item) {
          if (!track && /^en/i.test(item.languageCode || '') && item.kind !== 'asr') track = item;
        });
        tracks.forEach(function (item) {
          if (!track && /^en/i.test(item.languageCode || '')) track = item;
        });
        let category = cleanText(micro.category || '', 80), categoryError = '';
        if (!category) {
          try {
            category = yield require('./music-category').lookup(id, requestBuffer);
            if (!category) categoryError = 'provider_changed';
          } catch (error) {
            categoryError = require('./util').safeCode(error);
          }
        }
        return {
          id: id,
          title: cleanText(details.title, 220),
          channel: cleanText(details.author, 120),
          channelId: cleanText(details.channelId, 40),
          duration: Number(details.lengthSeconds) || 0,
          views: Number(details.viewCount) || 0,
          likes: Number(details.likeCount) || 0,
          published: cleanText(micro.uploadDate || micro.publishDate || '', 40),
          description: cleanText(details.shortDescription || '', 1800),
          categories: category ? [category] : [],
          categoryError: categoryError,
          thumb: thumbPath(id),
          formats: formats,
          captionUrl: track ? track.baseUrl : '',
          captionLanguage: track ? track.languageCode : ''
        };
      }));
    });
  });
  return _video.apply(this, arguments);
}
function forget(id) {
  cache.delete('video:' + videoId(id));
}
function parseXmlCaptions(text) {
  const cues = [];
  const pattern = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  while (match = pattern.exec(text)) {
    const content = match[3].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
    if (content) cues.push({
      start: Number(match[1]) / 1000,
      end: (Number(match[1]) + Number(match[2])) / 1000,
      text: content
    });
  }
  return cues;
}
function parseVttCaptions(text) {
  const cues = [],
    lines = text.replace(/\r/g, '').split('\n');
  const seconds = function (value) {
    const parts = value.split(':').map(Number);
    return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
  };
  let current = null,
    buffer = [];
  const flush = function () {
    if (current) {
      const content = buffer.join(' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      if (content) cues.push({
        start: current.start,
        end: current.end,
        text: content
      });
    }
    current = null;
    buffer = [];
  };
  lines.forEach(function (line) {
    if (line.indexOf('-->') >= 0) {
      flush();
      const start = line.split('-->')[0].trim().replace(/,/g, '.');
      const end = line.split('-->')[1].trim().split(' ')[0].replace(/,/g, '.');
      current = {
        start: seconds(start),
        end: seconds(end)
      };
    } else if (!line.trim()) flush();else if (current) buffer.push(line);
  });
  flush();
  return cues;
}
function captions(_x1) {
  return _captions.apply(this, arguments);
}
function _captions() {
  _captions = _asyncToGenerator(function* (baseUrl) {
    if (!baseUrl) return [];
    const text = yield getText(baseUrl);
    return text.indexOf('<p ') >= 0 ? parseXmlCaptions(text) : parseVttCaptions(text);
  });
  return _captions.apply(this, arguments);
}
let healthPending = null;
function providerHealth() {
  if (healthPending) return healthPending;
  healthPending = visitorData(false).then(function () {
    return post('search', {
      context: {
        client: CLIENT
      },
      query: 'video'
    });
  }).then(function (data) {
    if (!data.contents || typeof data.contents !== 'object') throw require('./util').failure('provider_changed');
    return {
      ok: true,
      status: 'ready'
    };
  }).then(function (value) {
    healthPending = null;
    return value;
  }, function (error) {
    healthPending = null;
    throw error;
  });
  return healthPending;
}
module.exports = {
  search: search,
  video: video,
  forget: forget,
  captions: captions,
  providerHealth: providerHealth,
  PLAYER_USER_AGENT: PLAYER_USER_AGENT,
  thumbPath: thumbPath,
  requestBuffer: requestBuffer,
  textOf: textOf,
  parseCount: parseCount
};
