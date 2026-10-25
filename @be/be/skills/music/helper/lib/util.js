'use strict';

// All provider metadata/optional fetches share one bounded, redacting transport.
const https = require('https');
const http = require('http');
const zlib = require('zlib');
const url = require('url');
const config = require('./config');
const timers = require('timers');
// Moth search replies reached 6.6 MB decoded; retain 1.0.1's 8 MiB bound.
// The realistic-size regression fixture parses at this cap with a 48 MiB heap.
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_REDIRECTS = 5;
function now() {
  const t = process.hrtime();
  return t[0] * 1000 + t[1] / 1e6;
}
function failure(code, status) {
  const e = new Error(code);
  e.code = code;
  if (status) e.status = status;
  return e;
}
function safeCode(e) {
  const code = e && (e.code || e.message) || '';
  if (/^(timeout|provider_busy|provider_unavailable|provider_changed|network_unavailable|age_restricted|region|members_only|unavailable|unsupported_live|video_too_long|unsupported_format|audio_missing|storage_unavailable)$/.test(code)) return code;
  if (e && e.status === 429) return 'provider_busy';
  if (e && e.status >= 400) return 'provider_unavailable';
  if (/^(bad_response|bad_json|response_too_large|too_many_redirects|no_visitor_data)$/.test(code)) return 'provider_changed';
  if (/^(ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH)$/.test(e && e.code || '')) return 'network_unavailable';
  // Unknown/decoder/abort errors are not evidence that Jibo lost internet.
  return 'provider_changed';
}
function cleanText(value, limit) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/[\uD800-\uDFFF\uFE0F\u200D\u2600-\u27BF]/g, '').replace(/\s+/g, ' ').trim().slice(0, limit || 400);
}
function videoId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{11}$/.test(value) ? value : null;
}
function clamp(value, low, high) {
  value = Number(value);
  return isFinite(value) ? Math.max(low, Math.min(high, value)) : low;
}
function requestBuffer(target, options) {
  options = options || {};
  const budget = clamp(options.timeoutMs || config.requestTimeoutMs, 1, 40000);
  const maxBytes = clamp(options.maxBytes || MAX_BYTES, 1, MAX_BYTES);
  const retries = Math.min(1, Math.max(0, Number(options.retries) || 0));
  const deadline = now() + budget;
  return new Promise(function (resolve, reject) {
    let current = null,
      response = null,
      decoded = null,
      retryTimer = null,
      done = false,
      attempts = 0;
    function discard() {
      if (decoded && decoded !== response) {
        try {
          decoded.destroy();
        } catch (_) {}
      }
      if (response) {
        try {
          response.destroy();
        } catch (_) {}
      }
      if (current) {
        try {
          current.abort();
        } catch (_) {}
      }
    }
    function finish(error, value) {
      if (done) return;
      done = true;
      timers.clearTimeout(total);
      timers.clearTimeout(retryTimer);
      if (error) {
        discard();
        reject(error);
      } else resolve(value);
    }
    const total = timers.setTimeout(function () {
      finish(failure('timeout'));
    }, budget);
    function attempt(address, redirects) {
      if (done) return;
      let parsed;
      try {
        parsed = url.parse(address);
      } catch (_) {
        finish(failure('provider_changed'));
        return;
      }
      if (!/^https?:$/.test(parsed.protocol || '') || parsed.auth) {
        finish(failure('provider_changed'));
        return;
      }
      const lib = parsed.protocol === 'https:' ? https : http;
      const headers = Object.assign({
        'User-Agent': config.userAgent,
        'Accept-Encoding': 'gzip'
      }, options.headers || {});
      if (options.body) headers['Content-Length'] = Buffer.byteLength(options.body);
      let settled = false;
      function failed(error) {
        if (settled || done) return;
        settled = true;
        discard();
        const retryable = error.code === 'network_unavailable' || error.status === 429 || error.status >= 500;
        if (retryable && attempts < retries && now() < deadline) {
          attempts++;
          retryTimer = timers.setTimeout(function () {
            attempt(target, 0);
          }, clamp(options.retryDelayMs || 250, 1, 1000));
        } else finish(error);
      }
      try {
        current = lib.request({
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
          path: parsed.path,
          method: options.method || 'GET',
          headers: headers
        }, function (res) {
          if (done || settled) {
            res.destroy();
            return;
          }
          response = res;
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            settled = true;
            res.resume();
            if (redirects >= MAX_REDIRECTS) {
              finish(failure('too_many_redirects'));
              return;
            }
            attempt(url.resolve(address, res.headers.location), redirects + 1);
            return;
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            failed(failure(res.statusCode === 429 ? 'provider_busy' : 'provider_unavailable', res.statusCode));
            return;
          }
          const chunks = [];
          let size = 0;
          decoded = res;
          if (res.headers['content-encoding'] === 'gzip') decoded = res.pipe(zlib.createGunzip());else if (res.headers['content-encoding'] === 'deflate') decoded = res.pipe(zlib.createInflate());
          // Node 6 can emit aborted on normal socket close after the
          // complete gzip body arrived, while Gunzip is still draining.
          // An incomplete reply without an errno is a provider failure,
          // never evidence that a local cap/decoder abort lost internet.
          res.on('aborted', function () {
            if (!res.complete) failed(failure('provider_changed'));
          });
          res.on('error', function (error) {
            failed(failure(safeCode(error)));
          });
          decoded.on('data', function (chunk) {
            if (done || settled) return;
            size += chunk.length;
            if (size > maxBytes) {
              failed(failure('response_too_large'));
              return;
            }
            chunks.push(chunk);
          });
          decoded.on('error', function () {
            failed(failure('provider_changed'));
          });
          decoded.on('end', function () {
            if (done || settled) return;
            if (res.complete === false) {
              failed(failure('provider_changed'));
              return;
            }
            settled = true;
            finish(null, {
              buffer: Buffer.concat(chunks),
              headers: res.headers,
              status: res.statusCode
            });
          });
        });
        current.setTimeout(Math.max(1, deadline - now()), function () {
          failed(failure('timeout'));
        });
        current.on('error', function (error) {
          failed(failure(safeCode(error)));
        });
        if (options.body) current.write(options.body);
        current.end();
      } catch (error) {
        failed(failure(safeCode(error)));
      }
    }
    if (typeof options.registerCancel === 'function') options.registerCancel(function () {
      finish(failure('closed'));
    });
    attempt(target, 0);
  });
}
function fetchJson(target, options) {
  options = Object.assign({
    retries: 1
  }, options || {});
  return requestBuffer(target, options).then(function (response) {
    let value;
    try {
      value = JSON.parse(response.buffer.toString('utf8'));
    } catch (_) {
      throw failure('provider_changed');
    }
    if (!value || typeof value !== 'object') throw failure('provider_changed');
    return value;
  });
}
function fetchBuffer(target, options) {
  return requestBuffer(target, options || {}).then(function (response) {
    return {
      buffer: response.buffer,
      contentType: response.headers['content-type'] || 'image/jpeg'
    };
  });
}
module.exports = {
  cleanText,
  videoId,
  clamp,
  requestBuffer,
  fetchJson,
  fetchBuffer,
  safeCode,
  failure,
  now,
  MAX_BYTES,
  MAX_REDIRECTS
};
