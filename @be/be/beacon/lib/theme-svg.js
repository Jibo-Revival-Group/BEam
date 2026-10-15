'use strict';

// Static SVG subset: no scripts, foreign markup, entities, or network/file references.
const sax = require('sax');
const fail = require('./theme-package').fail;
const tags = 'svg g defs path rect circle ellipse line polyline polygon text tspan title desc linearGradient radialGradient stop clipPath mask use'.split(' ');
const attrs = ('xmlns xmlns:xlink id version width height viewBox preserveAspectRatio x y x1 y1 x2 y2 cx cy r rx ry d points transform fill fill-rule fill-opacity stroke stroke-width stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset stroke-opacity opacity color style offset stop-color stop-opacity gradientUnits gradientTransform spreadMethod fx fy clip-path clip-rule mask maskUnits maskContentUnits font-family font-size font-weight text-anchor dominant-baseline dx dy href xlink:href').split(' ');
module.exports = function(buf, name) {
    function invalid() { throw fail('Invalid or unsafe SVG icon: ' + name); }
    if (!Buffer.isBuffer(buf) || !buf.length || buf.length > 1024 * 1024) { invalid(); }
    const source = buf.toString('utf8');
    if (/<!DOCTYPE|<!ENTITY|<!\[CDATA\[|\ufffd/i.test(source)) { invalid(); }
    const parser = sax.parser(true, { strictEntities: true });
    let root = null; let count = 0;
    parser.onerror = invalid;
    parser.onprocessinginstruction = node => { if (node.name !== 'xml') { invalid(); } };
    parser.ondoctype = invalid;
    parser.onopentag = node => {
        if (++count > 10000 || tags.indexOf(node.name) < 0) { invalid(); }
        if (!root) { if (node.name !== 'svg') { invalid(); } root = node.attributes; }
        Object.keys(node.attributes).forEach(key => {
            const value = node.attributes[key];
            if (attrs.indexOf(key) < 0 || /[<>\\\u0000-\u001f]/.test(value)) { invalid(); }
            if (key === 'xmlns' || key === 'xmlns:xlink') {
                if (value !== (key === 'xmlns' ? 'http://www.w3.org/2000/svg' : 'http://www.w3.org/1999/xlink')) { invalid(); }
            } else if (key === 'href' || key === 'xlink:href') {
                if (!/^#[A-Za-z_][\w.-]*$/.test(value)) { invalid(); }
            } else {
                // CSS escapes, external URLs, imports and executable values are forbidden.
                const local = value.replace(/url\(\s*#[A-Za-z_][\w.-]*\s*\)/g, '');
                if (/url\s*\(|@|expression|javascript|data:|https?:|file:|\/\*/i.test(local)) { invalid(); }
                if (key === 'style' && value.split(';').some(rule => rule.trim() && !/^\s*(fill|fill-rule|fill-opacity|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-miterlimit|stroke-dasharray|stroke-dashoffset|stroke-opacity|opacity|color|stop-color|stop-opacity|font-family|font-size|font-weight|text-anchor|clip-path|clip-rule)\s*:/i.test(rule))) { invalid(); }
            }
        });
    };
    try { parser.write(source).close(); } catch (err) { invalid(); }
    if (!root) { invalid(); }
    const box = (root.viewBox || '').trim().split(/[\s,]+/).map(Number);
    const number = value => /^\d+(?:\.\d+)?(?:px)?$/.test(value || '') ? parseFloat(value) : null;
    const width = number(root.width) || (box.length === 4 && box[2]);
    const height = number(root.height) || (box.length === 4 && box[3]);
    if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0 || width > 4096 || height > 4096 || width * height * 4 > 64 * 1024 * 1024) { invalid(); }
    return { width: Math.ceil(width), height: Math.ceil(height) };
};

// The shipped loader has no SVG MIME type. Rasterize explicitly before WebGL upload.
module.exports.texture = function(PIXI, file, size) {
    return new Promise((resolve, reject) => {
        const image = new Image(); let done = false;
        const timer = setTimeout(() => finish(fail('SVG icon decoding timed out: ' + file)), 15000);
        function finish(err, texture) {
            if (done) { return; } done = true; clearTimeout(timer); image.onload = image.onerror = null;
            if (err) { reject(err); } else { resolve(texture); }
        }
        image.onerror = () => finish(fail('Unable to decode SVG icon: ' + file));
        image.onload = () => {
            try {
                const canvas = document.createElement('canvas'); canvas.width = Math.ceil(size.width); canvas.height = Math.ceil(size.height);
                canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                const base = new PIXI.BaseTexture(canvas); base.imageUrl = file;
                finish(null, new PIXI.Texture(base));
            } catch (err) { finish(err); }
        };
        try { image.src = 'data:image/svg+xml;base64,' + require('fs').readFileSync(file).toString('base64'); } catch (err) { finish(err); }
    });
};
