'use strict';
// Copied verbatim from JiboTube (jibotube/draw.js) for the Wi-Fi password keyboard.

// Rect-only vector drawing for the archived renderer. Its rounded-geometry
// paths (arcs, circles, rounded rectangles) are unreliable on the robot, so
// every icon below is scan-converted into horizontal drawRect spans. Shapes
// keep straight or curved silhouettes while the GPU only sees rectangles.
function spans(points, y) {
    const xs = [], count = points.length / 2;
    for (let i = 0; i < count; i++) {
        const j = (i + 1) % count, x1 = points[2 * i], y1 = points[2 * i + 1], x2 = points[2 * j], y2 = points[2 * j + 1];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }
    return xs.sort((a, b) => a - b);
}
function polygon(g, points) {
    let top = Infinity, bottom = -Infinity;
    for (let i = 1; i < points.length; i += 2) { top = Math.min(top, points[i]); bottom = Math.max(bottom, points[i]); }
    for (let y = Math.floor(top); y < Math.ceil(bottom); y++) {
        const xs = spans(points, y + 0.5);
        for (let k = 0; k + 1 < xs.length; k += 2) if (xs[k + 1] - xs[k] > 0.2) g.drawRect(xs[k], y, xs[k + 1] - xs[k], 1);
    }
}
// Filled disc and ring, one span (or two for a ring) per pixel row.
function disc(g, cx, cy, r) {
    for (let y = Math.floor(cy - r); y < Math.ceil(cy + r); y++) {
        const dy = y + 0.5 - cy, d = r * r - dy * dy;
        if (d > 0) { const w = Math.sqrt(d); g.drawRect(cx - w, y, 2 * w, 1); }
    }
}
function ring(g, cx, cy, r, width) {
    const inner = r - width;
    for (let y = Math.floor(cy - r); y < Math.ceil(cy + r); y++) {
        const dy = y + 0.5 - cy, d = r * r - dy * dy;
        if (d <= 0) continue;
        const w = Math.sqrt(d), e = inner * inner - dy * dy;
        if (e <= 0) { g.drawRect(cx - w, y, 2 * w, 1); continue; }
        const v = Math.sqrt(e);
        g.drawRect(cx - w, y, w - v, 1); g.drawRect(cx + v, y, w - v, 1);
    }
}
function line(g, x1, y1, x2, y2, width) {
    const dx = x2 - x1, dy = y2 - y1, length = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / length * width / 2, ny = dx / length * width / 2;
    polygon(g, [x1 + nx, y1 + ny, x2 + nx, y2 + ny, x2 - nx, y2 - ny, x1 - nx, y1 - ny]);
}
function box(g, x, y, w, h, stroke) {
    g.drawRect(x, y, w, stroke); g.drawRect(x, y + h - stroke, w, stroke);
    g.drawRect(x, y + stroke, stroke, h - 2 * stroke); g.drawRect(x + w - stroke, y + stroke, stroke, h - 2 * stroke);
}

// Icons are drawn inside a square of side s whose top-left corner is (x, y).
const ICONS = {
    play(g, x, y, s) { polygon(g, [x + s * 0.24, y + s * 0.12, x + s * 0.9, y + s * 0.5, x + s * 0.24, y + s * 0.88]); },
    pause(g, x, y, s) { g.drawRect(x + s * 0.22, y + s * 0.14, s * 0.2, s * 0.72); g.drawRect(x + s * 0.58, y + s * 0.14, s * 0.2, s * 0.72); },
    next(g, x, y, s) { polygon(g, [x + s * 0.14, y + s * 0.16, x + s * 0.7, y + s * 0.5, x + s * 0.14, y + s * 0.84]); g.drawRect(x + s * 0.72, y + s * 0.16, s * 0.13, s * 0.68); },
    previous(g, x, y, s) { polygon(g, [x + s * 0.86, y + s * 0.16, x + s * 0.3, y + s * 0.5, x + s * 0.86, y + s * 0.84]); g.drawRect(x + s * 0.15, y + s * 0.16, s * 0.13, s * 0.68); },
    shuffle(g, x, y, s) {
        const w = Math.max(2, s * 0.09);
        line(g, x + s * 0.08, y + s * 0.28, x + s * 0.3, y + s * 0.28, w); line(g, x + s * 0.3, y + s * 0.28, x + s * 0.62, y + s * 0.72, w);
        line(g, x + s * 0.62, y + s * 0.72, x + s * 0.78, y + s * 0.72, w);
        line(g, x + s * 0.08, y + s * 0.72, x + s * 0.3, y + s * 0.72, w); line(g, x + s * 0.3, y + s * 0.72, x + s * 0.62, y + s * 0.28, w);
        line(g, x + s * 0.62, y + s * 0.28, x + s * 0.78, y + s * 0.28, w);
        polygon(g, [x + s * 0.76, y + s * 0.14, x + s * 0.96, y + s * 0.28, x + s * 0.76, y + s * 0.42]);
        polygon(g, [x + s * 0.76, y + s * 0.58, x + s * 0.96, y + s * 0.72, x + s * 0.76, y + s * 0.86]);
    },
    repeat(g, x, y, s) {
        const w = Math.max(2, s * 0.09);
        line(g, x + s * 0.12, y + s * 0.62, x + s * 0.12, y + s * 0.3, w); line(g, x + s * 0.12, y + s * 0.3, x + s * 0.72, y + s * 0.3, w);
        line(g, x + s * 0.88, y + s * 0.38, x + s * 0.88, y + s * 0.7, w); line(g, x + s * 0.88, y + s * 0.7, x + s * 0.28, y + s * 0.7, w);
        polygon(g, [x + s * 0.68, y + s * 0.14, x + s * 0.9, y + s * 0.3, x + s * 0.68, y + s * 0.46]);
        polygon(g, [x + s * 0.32, y + s * 0.54, x + s * 0.1, y + s * 0.7, x + s * 0.32, y + s * 0.86]);
    },
    home(g, x, y, s) {
        polygon(g, [x + s * 0.5, y + s * 0.08, x + s * 0.94, y + s * 0.46, x + s * 0.82, y + s * 0.46, x + s * 0.82, y + s * 0.9,
            x + s * 0.6, y + s * 0.9, x + s * 0.6, y + s * 0.62, x + s * 0.4, y + s * 0.62, x + s * 0.4, y + s * 0.9,
            x + s * 0.18, y + s * 0.9, x + s * 0.18, y + s * 0.46, x + s * 0.06, y + s * 0.46]);
    },
    search(g, x, y, s) { ring(g, x + s * 0.42, y + s * 0.42, s * 0.32, Math.max(2, s * 0.1)); line(g, x + s * 0.64, y + s * 0.64, x + s * 0.9, y + s * 0.9, Math.max(3, s * 0.13)); },
    library(g, x, y, s) {
        g.drawRect(x + s * 0.12, y + s * 0.1, s * 0.12, s * 0.8); g.drawRect(x + s * 0.36, y + s * 0.1, s * 0.12, s * 0.8);
        line(g, x + s * 0.62, y + s * 0.14, x + s * 0.84, y + s * 0.88, s * 0.12);
    },
    queue(g, x, y, s) {
        g.drawRect(x + s * 0.08, y + s * 0.18, s * 0.6, s * 0.1); g.drawRect(x + s * 0.08, y + s * 0.45, s * 0.6, s * 0.1);
        g.drawRect(x + s * 0.08, y + s * 0.72, s * 0.4, s * 0.1);
        polygon(g, [x + s * 0.6, y + s * 0.6, x + s * 0.94, y + s * 0.77, x + s * 0.6, y + s * 0.94]);
    },
    close(g, x, y, s) { const w = Math.max(3, s * 0.12); line(g, x + s * 0.18, y + s * 0.18, x + s * 0.82, y + s * 0.82, w); line(g, x + s * 0.82, y + s * 0.18, x + s * 0.18, y + s * 0.82, w); },
    back(g, x, y, s) { const w = Math.max(3, s * 0.13); line(g, x + s * 0.66, y + s * 0.12, x + s * 0.3, y + s * 0.5, w); line(g, x + s * 0.3, y + s * 0.5, x + s * 0.66, y + s * 0.88, w); },
    chevron(g, x, y, s) { const w = Math.max(3, s * 0.13); line(g, x + s * 0.34, y + s * 0.12, x + s * 0.7, y + s * 0.5, w); line(g, x + s * 0.7, y + s * 0.5, x + s * 0.34, y + s * 0.88, w); },
    up(g, x, y, s) { const w = Math.max(3, s * 0.13); line(g, x + s * 0.12, y + s * 0.66, x + s * 0.5, y + s * 0.28, w); line(g, x + s * 0.5, y + s * 0.28, x + s * 0.88, y + s * 0.66, w); },
    down(g, x, y, s) { const w = Math.max(3, s * 0.13); line(g, x + s * 0.12, y + s * 0.34, x + s * 0.5, y + s * 0.72, w); line(g, x + s * 0.5, y + s * 0.72, x + s * 0.88, y + s * 0.34, w); },
    plus(g, x, y, s) { const w = Math.max(3, s * 0.12); g.drawRect(x + s * 0.5 - w / 2, y + s * 0.14, w, s * 0.72); g.drawRect(x + s * 0.14, y + s * 0.5 - w / 2, s * 0.72, w); },
    minus(g, x, y, s) { const w = Math.max(3, s * 0.12); g.drawRect(x + s * 0.14, y + s * 0.5 - w / 2, s * 0.72, w); },
    playNext(g, x, y, s) {
        g.drawRect(x + s * 0.06, y + s * 0.2, s * 0.5, s * 0.1); g.drawRect(x + s * 0.06, y + s * 0.45, s * 0.36, s * 0.1);
        g.drawRect(x + s * 0.06, y + s * 0.7, s * 0.36, s * 0.1);
        polygon(g, [x + s * 0.56, y + s * 0.36, x + s * 0.94, y + s * 0.6, x + s * 0.56, y + s * 0.84]);
    },
    addQueue(g, x, y, s) {
        g.drawRect(x + s * 0.06, y + s * 0.2, s * 0.56, s * 0.1); g.drawRect(x + s * 0.06, y + s * 0.45, s * 0.36, s * 0.1);
        g.drawRect(x + s * 0.06, y + s * 0.7, s * 0.36, s * 0.1);
        const w = s * 0.1; g.drawRect(x + s * 0.72 - w / 2, y + s * 0.42, w, s * 0.46); g.drawRect(x + s * 0.49, y + s * 0.65 - w / 2, s * 0.46, w);
    },
    note(g, x, y, s) {
        disc(g, x + s * 0.34, y + s * 0.72, s * 0.17); g.drawRect(x + s * 0.44, y + s * 0.12, s * 0.08, s * 0.6);
        polygon(g, [x + s * 0.44, y + s * 0.12, x + s * 0.8, y + s * 0.26, x + s * 0.8, y + s * 0.4, x + s * 0.52, y + s * 0.3]);
    },
    album(g, x, y, s) { ring(g, x + s * 0.5, y + s * 0.5, s * 0.42, s * 0.25); disc(g, x + s * 0.5, y + s * 0.5, s * 0.06); },
    playlist(g, x, y, s) {
        g.drawRect(x + s * 0.08, y + s * 0.16, s * 0.56, s * 0.09); g.drawRect(x + s * 0.08, y + s * 0.38, s * 0.56, s * 0.09);
        g.drawRect(x + s * 0.08, y + s * 0.6, s * 0.32, s * 0.09);
        disc(g, x + s * 0.62, y + s * 0.78, s * 0.12); g.drawRect(x + s * 0.7, y + s * 0.36, s * 0.07, s * 0.44);
        g.drawRect(x + s * 0.7, y + s * 0.36, s * 0.2, s * 0.07);
    },
    artist(g, x, y, s) { disc(g, x + s * 0.5, y + s * 0.32, s * 0.2); polygon(g, [x + s * 0.18, y + s * 0.92, x + s * 0.26, y + s * 0.62, x + s * 0.74, y + s * 0.62, x + s * 0.82, y + s * 0.92]); },
    trending(g, x, y, s) {
        g.drawRect(x + s * 0.1, y + s * 0.52, s * 0.16, s * 0.38);
        g.drawRect(x + s * 0.34, y + s * 0.34, s * 0.16, s * 0.56);
        g.drawRect(x + s * 0.58, y + s * 0.18, s * 0.16, s * 0.72);
        g.drawRect(x + s * 0.82, y + s * 0.44, s * 0.08, s * 0.46);
        const w = Math.max(2, s * 0.07);
        line(g, x + s * 0.12, y + s * 0.38, x + s * 0.46, y + s * 0.22, w);
        line(g, x + s * 0.46, y + s * 0.22, x + s * 0.9, y + s * 0.1, w);
    },
    mic(g, x, y, s) {
        const w = Math.max(2, s * 0.12);
        g.drawRect(x + s * 0.38, y + s * 0.08, s * 0.24, s * 0.48);
        ring(g, x + s * 0.5, y + s * 0.56, s * 0.3, w);
        g.drawRect(x + s * 0.46, y + s * 0.84, s * 0.08, s * 0.12);
        g.drawRect(x + s * 0.34, y + s * 0.94, s * 0.32, s * 0.06);
    },
    shield(g, x, y, s) {
        polygon(g, [x + s * 0.5, y + s * 0.06, x + s * 0.88, y + s * 0.22, x + s * 0.82, y + s * 0.58,
            x + s * 0.5, y + s * 0.94, x + s * 0.18, y + s * 0.58, x + s * 0.12, y + s * 0.22]);
    },
    check(g, x, y, s) {
        const w = Math.max(3, s * 0.14);
        line(g, x + s * 0.16, y + s * 0.52, x + s * 0.42, y + s * 0.78, w);
        line(g, x + s * 0.42, y + s * 0.78, x + s * 0.86, y + s * 0.22, w);
    },
    gear(g, x, y, s) {
        disc(g, x + s * 0.5, y + s * 0.5, s * 0.3);
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4;
            line(g, x + s * 0.5 + Math.cos(a) * s * 0.3, y + s * 0.5 + Math.sin(a) * s * 0.3,
                x + s * 0.5 + Math.cos(a) * s * 0.46, y + s * 0.5 + Math.sin(a) * s * 0.46, s * 0.09);
        }
    },
    rewind(g, x, y, s) {
        polygon(g, [x + s * 0.46, y + s * 0.18, x + s * 0.1, y + s * 0.5, x + s * 0.46, y + s * 0.82]);
        polygon(g, [x + s * 0.9, y + s * 0.18, x + s * 0.54, y + s * 0.5, x + s * 0.9, y + s * 0.82]);
    },
    forward(g, x, y, s) {
        polygon(g, [x + s * 0.54, y + s * 0.18, x + s * 0.9, y + s * 0.5, x + s * 0.54, y + s * 0.82]);
        polygon(g, [x + s * 0.1, y + s * 0.18, x + s * 0.46, y + s * 0.5, x + s * 0.1, y + s * 0.82]);
    },
    backspace(g, x, y, s) {
        const w = Math.max(2, s * 0.075);
        line(g, x + s * 0.08, y + s * 0.5, x + s * 0.32, y + s * 0.16, w);
        line(g, x + s * 0.32, y + s * 0.16, x + s * 0.94, y + s * 0.16, w);
        line(g, x + s * 0.94, y + s * 0.16, x + s * 0.94, y + s * 0.84, w);
        line(g, x + s * 0.94, y + s * 0.84, x + s * 0.32, y + s * 0.84, w);
        line(g, x + s * 0.32, y + s * 0.84, x + s * 0.08, y + s * 0.5, w);
        line(g, x + s * 0.48, y + s * 0.34, x + s * 0.78, y + s * 0.66, w);
        line(g, x + s * 0.78, y + s * 0.34, x + s * 0.48, y + s * 0.66, w);
    },
    heart(g, x, y, s) {
        disc(g, x + s * 0.31, y + s * 0.36, s * 0.22); disc(g, x + s * 0.69, y + s * 0.36, s * 0.22);
        polygon(g, [x + s * 0.1, y + s * 0.44, x + s * 0.9, y + s * 0.44, x + s * 0.5, y + s * 0.9]);
    },
    // A clock face: recent searches.
    history(g, x, y, s) {
        ring(g, x + s * 0.5, y + s * 0.5, s * 0.44, Math.max(2, s * 0.1));
        g.drawRect(x + s * 0.45, y + s * 0.22, s * 0.1, s * 0.32);
        g.drawRect(x + s * 0.45, y + s * 0.45, s * 0.28, s * 0.1);
    },
};
function icon(g, name, x, y, s, color) {
    const draw = ICONS[name];
    if (!draw) return;
    g.lineStyle(0, 0, 0).beginFill(color, 1); draw(g, x, y, s); g.endFill();
}

// Rounded rectangle scan-converted into one-pixel horizontal spans.
function roundedRect(g, x, y, w, h, r, color, alpha) {
    r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    g.beginFill(color, alpha === undefined ? 1 : alpha);
    if (r < 0.5) { g.drawRect(x, y, w, h); g.endFill(); return; }
    for (let row = 0; row < h; row += 1) {
        const py = row + 0.5;
        let inset = 0;
        if (py < r) { const dy = r - py; inset = r - Math.sqrt(Math.max(0, r * r - dy * dy)); }
        else if (py > h - r) { const dy = py - (h - r); inset = r - Math.sqrt(Math.max(0, r * r - dy * dy)); }
        g.drawRect(x + inset, y + row, w - inset * 2, 1);
    }
    g.endFill();
}
module.exports = { ICONS, icon, polygon, roundedRect, disc, ring, line, box };
