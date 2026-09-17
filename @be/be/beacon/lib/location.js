'use strict';

/**
 * Local robot-home location management.
 *
 * Jibo's runtime reads /jibo/location/{home,timezone} from the local KB
 * service. This module deliberately does not use the cloud Loop client.
 */

const http = require('http');
const https = require('https');
const querystring = require('querystring');
const url = require('url');
const spawnSync = require('child_process').spawnSync;

const paths = require('./paths');

const IP_API_URL = process.env.BEACON_IP_API_URL ||
    'http://ip-api.com/json/?fields=status,message,country,countryCode,region,' +
    'regionName,city,zip,lat,lon,timezone,offset,query';
const GEOCODE_URL = process.env.BEACON_GEOCODE_URL ||
    'https://geocoding-api.open-meteo.com/v1/search';
const MAX_RESPONSE = 64 * 1024;
const REQUEST_TIMEOUT = 10000;
const SEARCH_COUNT = 8;
const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_LENGTH = 80;

// Open-Meteo returns full admin1 names; abbreviate for US/CA dropdown labels.
const US_STATE_ABBR = {
    Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
    Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
    Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
    Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
    Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
    Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
    Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
    Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI',
    Wyoming: 'WY', 'District of Columbia': 'DC'
};
const CA_PROVINCE_ABBR = {
    Alberta: 'AB', 'British Columbia': 'BC', Manitoba: 'MB',
    'New Brunswick': 'NB', 'Newfoundland and Labrador': 'NL',
    'Northwest Territories': 'NT', 'Nova Scotia': 'NS', Nunavut: 'NU',
    Ontario: 'ON', 'Prince Edward Island': 'PE', Quebec: 'QC',
    Saskatchewan: 'SK', Yukon: 'YT'
};

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 500;
    return err;
}

function stringValue (value, maxLength) {
    if (value === undefined || value === null) { return null; }
    const result = String(value).trim();
    if (!result || result.length > maxLength) { return null; }
    return result;
}

function numberValue (value, min, max) {
    const result = Number(value);
    return isFinite(result) && result >= min && result <= max ? result : null;
}

function requestJson (requestUrl) {
    return new Promise((resolve, reject) => {
        // Node 6 (robot Electron) only accepts a single options object for
        // http(s).get — no (url, options, cb) overload.
        const parsed = url.parse(requestUrl);
        const isHttps = parsed.protocol === 'https:';
        const client = isHttps ? https : http;
        const options = {
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            port: parsed.port,
            path: parsed.path,
            headers: { 'User-Agent': 'BEacon/BEam' }
        };
        const req = client.get(options, (res) => {
            let size = 0;
            let body = '';

            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                size += chunk.length;
                if (size > MAX_RESPONSE) {
                    req.destroy();
                    reject(fail('The location service returned too much data', 502));
                    return;
                }
                body += chunk;
            });
            res.on('error', reject);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(fail('The location service returned HTTP ' + res.statusCode, 502));
                    return;
                }
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    reject(fail('The location service returned invalid JSON', 502));
                }
            });
        });

        req.setTimeout(REQUEST_TIMEOUT, () => {
            req.destroy();
            reject(fail('The location service timed out', 504));
        });
        req.on('error', reject);
    });
}

function offsetFromTimezone (timezone) {
    // ip-api normally supplies offset (seconds), but older responses may only
    // include the IANA timezone. GNU/BusyBox date can resolve the current
    // offset without adding a timezone-data dependency to the robot bundle.
    try {
        const result = spawnSync('date', ['+%z'], {
            encoding: 'utf8',
            env: Object.assign({}, process.env, { TZ: timezone })
        });
        const match = /^([+-])(\d{2})(\d{2})/.exec(String(result.stdout || '').trim());
        if (match) {
            const minutes = (Number(match[2]) * 60) + Number(match[3]);
            return (match[1] === '-' ? -1 : 1) * minutes * 60;
        }
    } catch (err) { /* use the explicit API value or reject below */ }
    return null;
}

function timezoneRecord (timezone, offset) {
    const id = stringValue(timezone, 100);
    if (!id || !/^[A-Za-z0-9_+./-]+$/.test(id)) {
        throw fail('The location service returned an invalid timezone', 502);
    }

    let offsetSeconds = numberValue(offset, -24 * 60 * 60, 24 * 60 * 60);
    if (offsetSeconds === null) { offsetSeconds = offsetFromTimezone(id); }
    if (offsetSeconds === null) {
        throw fail('Could not determine the timezone offset for ' + id, 502);
    }

    return {
        __type: 'Timezone',
        offsetUTC: Math.round(offsetSeconds * 1000),
        // ip-api returns an IANA ID, not the older long display name. The ID
        // is stable and is sufficient for Jibo's date calculations.
        name: id,
        id: id
    };
}

function normalizeDetected (data) {
    if (!data || data.status !== 'success') {
        throw fail(
            'The location service could not locate this connection' +
            (data && data.message ? ': ' + data.message : ''),
            502
        );
    }

    const lat = numberValue(data.lat, -90, 90);
    const lng = numberValue(data.lon, -180, 180);
    if (lat === null || lng === null) {
        throw fail('The location service returned invalid coordinates', 502);
    }

    return {
        city: stringValue(data.city, 120),
        state: stringValue(data.regionName, 120),
        stateAbbr: stringValue(data.region, 20),
        country: stringValue(data.country, 120),
        countryCode: stringValue(data.countryCode, 10),
        zip: stringValue(data.zip, 40),
        lat: lat,
        lng: lng,
        timezone: timezoneRecord(data.timezone, data.offset),
        query: stringValue(data.query, 80)
    };
}

function normalizeForSave (input) {
    if (!input || typeof input !== 'object') {
        throw fail('A location object is required', 400);
    }

    const lat = numberValue(input.lat, -90, 90);
    const lng = numberValue(input.lng, -180, 180);
    if (lat === null || lng === null) {
        throw fail('Location latitude and longitude are required', 400);
    }

    const timezone = input.timezone || {};
    const id = stringValue(timezone.id, 100);
    if (!id || !/^[A-Za-z0-9_+./-]+$/.test(id)) {
        throw fail('A valid timezone id and offsetUTC are required', 400);
    }

    let offsetUTC = numberValue(timezone.offsetUTC, -24 * 60 * 60 * 1000,
        24 * 60 * 60 * 1000);
    if (offsetUTC === null) {
        const offsetSeconds = offsetFromTimezone(id);
        if (offsetSeconds === null) {
            throw fail('A valid timezone id and offsetUTC are required', 400);
        }
        offsetUTC = Math.round(offsetSeconds * 1000);
    }

    return {
        home: {
            city: stringValue(input.city, 120),
            state: stringValue(input.state, 120),
            stateAbbr: stringValue(input.stateAbbr, 20),
            country: stringValue(input.country, 120),
            countryCode: stringValue(input.countryCode, 10),
            lat: lat,
            lng: lng
        },
        timezone: {
            __type: 'Timezone',
            offsetUTC: Math.round(offsetUTC),
            name: stringValue(timezone.name, 120) || id,
            id: id
        }
    };
}

function regionAbbr (countryCode, admin1) {
    if (!admin1) { return null; }
    if (countryCode === 'US') { return US_STATE_ABBR[admin1] || null; }
    if (countryCode === 'CA') { return CA_PROVINCE_ABBR[admin1] || null; }
    return null;
}

function countryLabel (countryCode) {
    if (!countryCode) { return null; }
    if (countryCode === 'GB') { return 'UK'; }
    return countryCode;
}

function searchLabel (city, stateAbbr, state, countryCode) {
    const place = city || 'Unknown';
    if ((countryCode === 'US' || countryCode === 'CA') && (stateAbbr || state)) {
        return place + ', ' + (stateAbbr || state);
    }
    const country = countryLabel(countryCode);
    if (country) { return place + ', ' + country; }
    if (stateAbbr || state) { return place + ', ' + (stateAbbr || state); }
    return place;
}

function normalizeSearchHit (hit) {
    if (!hit || typeof hit !== 'object') { return null; }

    const lat = numberValue(hit.latitude, -90, 90);
    const lng = numberValue(hit.longitude, -180, 180);
    const timezoneId = stringValue(hit.timezone, 100);
    if (lat === null || lng === null || !timezoneId) { return null; }

    let timezone;
    try {
        timezone = timezoneRecord(timezoneId);
    } catch (err) {
        return null;
    }

    const city = stringValue(hit.name, 120);
    const state = stringValue(hit.admin1, 120);
    const countryCode = stringValue(hit.country_code, 10);
    const stateAbbr = regionAbbr(countryCode, state);

    return {
        label: searchLabel(city, stateAbbr, state, countryCode),
        city: city,
        state: state,
        stateAbbr: stateAbbr,
        country: stringValue(hit.country, 120),
        countryCode: countryCode,
        lat: lat,
        lng: lng,
        timezone: timezone
    };
}

function search (query) {
    const q = stringValue(query, SEARCH_MAX_LENGTH);
    if (!q || q.length < SEARCH_MIN_LENGTH) {
        throw fail('Enter at least ' + SEARCH_MIN_LENGTH + ' characters to search', 400);
    }

    const url = GEOCODE_URL + '?' + querystring.stringify({
        name: q,
        count: SEARCH_COUNT,
        language: 'en',
        format: 'json'
    });

    return requestJson(url).then((data) => {
        const raw = (data && data.results) || [];
        const results = [];
        for (let i = 0; i < raw.length; i++) {
            const hit = normalizeSearchHit(raw[i]);
            if (hit) { results.push(hit); }
        }
        return { query: q, results: results };
    });
}

function ensureRobot () {
    if (!paths.onRobot()) {
        throw fail('Location editing only works on the robot.', 503);
    }
    let jibo;
    try {
        jibo = require('jibo');
    } catch (err) {
        throw fail('The Jibo runtime is unavailable.', 503);
    }
    if (!jibo.kb || typeof jibo.kb.createModel !== 'function' ||
        typeof jibo.kb.onInit !== 'function') {
        throw fail('The local Knowledge Base is unavailable.', 503);
    }
    return jibo;
}

function loadLocationNodes () {
    const jibo = ensureRobot();
    return jibo.kb.onInit().then(() => {
        const model = jibo.kb.createModel('/jibo/location');
        return model.loadRoot().then((root) => {
            if (!root) { throw fail('The local location root is missing', 503); }
            const ids = root.getEdges(['home', 'timezone']);
            if (ids.length < 2) {
                throw fail('The local location records are incomplete', 503);
            }
            return model.load(ids).then((nodes) => {
                if (!nodes[0] || !nodes[1]) {
                    throw fail('The local location records could not be loaded', 503);
                }
                return { jibo: jibo, home: nodes[0], timezone: nodes[1] };
            });
        });
    });
}

function current () {
    return loadLocationNodes().then((loaded) => {
        const home = loaded.home.data || {};
        const timezone = loaded.timezone.data || {};
        return {
            available: true,
            location: {
                city: home.city || null,
                state: home.state || null,
                stateAbbr: home.stateAbbr || null,
                country: home.country || null,
                countryCode: home.countryCode || null,
                lat: home.lat,
                lng: home.lng,
                timezone: {
                    __type: 'Timezone',
                    offsetUTC: timezone.offsetUTC,
                    name: timezone.name,
                    id: timezone.id
                }
            }
        };
    });
}

function detect () {
    return requestJson(IP_API_URL).then(normalizeDetected);
}

function refreshInMemory (jibo, homeData, timezoneData) {
    try {
        const locationClass = jibo.utils && jibo.utils.Location;
        const home = locationClass && locationClass.jiboHome;
        if (!home) { return false; }
        home.city = homeData.city;
        home.state = homeData.state;
        home.stateAbbr = homeData.stateAbbr;
        home.country = homeData.country;
        home.countryCode = homeData.countryCode;
        home.lat = homeData.lat;
        home.lng = homeData.lng;
        home.timezone = new jibo.utils.Timezone(timezoneData);
        home.latLongBounds = null;
        home.calculatedRegions = null;
        return true;
    } catch (err) {
        return false;
    }
}

function apply (input) {
    const next = normalizeForSave(input);
    return loadLocationNodes().then((loaded) => {
        loaded.home.data = Object.assign({}, loaded.home.data, next.home);
        loaded.timezone.data = next.timezone;
        return loaded.home.save().then(() => loaded.timezone.save()).then(() => ({
            ok: true,
            location: {
                city: next.home.city,
                state: next.home.state,
                stateAbbr: next.home.stateAbbr,
                country: next.home.country,
                countryCode: next.home.countryCode,
                lat: next.home.lat,
                lng: next.home.lng,
                timezone: next.timezone
            },
            refreshedInMemory: refreshInMemory(loaded.jibo, next.home, next.timezone),
            note: 'Location saved locally. Restart Be if a running skill still uses the old location.'
        }));
    });
}

module.exports = {
    current: current,
    detect: detect,
    search: search,
    apply: apply,
    normalizeDetected: normalizeDetected,
    normalizeForSave: normalizeForSave,
    offsetFromTimezone: offsetFromTimezone,
    requestJson: requestJson
};
