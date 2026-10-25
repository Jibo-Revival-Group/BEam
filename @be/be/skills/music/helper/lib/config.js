'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
function env(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}
function readToken() {
  if (process.env.BE_MUSIC_TOKEN) return process.env.BE_MUSIC_TOKEN.trim();
  const file = env('BE_MUSIC_TOKEN_FILE', path.join(os.homedir(), '.config', 'music', 'token'));
  try {
    const value = fs.readFileSync(file, 'utf8').trim();
    if (value) return value;
  } catch (_) {}
  const directory = path.dirname(file);
  try {
    if (!fs.existsSync(directory)) fs.mkdirSync(directory, 0o700);
    const token = crypto.randomBytes(24).toString('hex');
    fs.writeFileSync(file, token + '\n', {
      mode: 0o600
    });
    return token;
  } catch (_) {
    return crypto.randomBytes(24).toString('hex');
  }
}
const config = {
  port: Number(env('BE_MUSIC_PORT', 18701)),
  host: env('BE_MUSIC_HOST', '127.0.0.1'),
  token: readToken(),
  cacheDir: env('BE_MUSIC_CACHE_DIR', path.join(os.homedir(), '.cache', 'music')),
  maxHeight: Number(env('BE_MUSIC_MAX_HEIGHT', 480)),
  maxFps: Number(env('BE_MUSIC_MAX_FPS', 30)),
  maxSearch: Number(env('BE_MUSIC_MAX_SEARCH', 24)),
  requestTimeoutMs: Number(env('BE_MUSIC_REQUEST_TIMEOUT_MS', 25000)),
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
};
config.cacheDir = path.resolve(config.cacheDir);
module.exports = config;
