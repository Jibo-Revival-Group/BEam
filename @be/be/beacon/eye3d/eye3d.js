// The built-in "3D Eye" theme: Jibo's eye as a real 3D object (three.js r101) drawn by its own WebGL canvas over the
// face. Started and stopped by lib/eye3d.js when the theme is applied; window.__eye3d.stop() removes it at once.
// - Ball: a sphere mesh (Phoenix's grey DebugSphere material). Its vertices follow the flat eye's 3x3 control points,
//   so stock eye-shape animations (smile and the other White_Eye shape changes) physically reshape the 3D ball.
// - Blinks (the flat eye squashed evenly) are drawn with two eyelid meshes over an unsquashed ball instead.
// - Lights are fixed point lights in front of the screen, so shading shifts as the eye moves around.
// - Glow overlays (happy-glow) make the ball emissive and run an UnrealBloom pass; the White_Eye overlay (surprised,
//   "something went wrong") brightens it while the ball itself grows with the eye; the white-circle flash lights it up.
// - Black mask overlays (eye_shape_*: happy, laugh, head pats) reshape the sphere: vertices the mask covers are pushed
//   onto the mask's edge, so the ball itself becomes the happy crescent. The blurred eye (checking, waking) is the ball
//   seen out of focus.
// - Anything else (icons, emoji textures, other overlays, other views) shows the stock flat eye.
module.exports = function () {
    if (window.__eye3d) { window.__eye3d.stop(); }
    var DIR = __dirname + '/';
    var THREE = require(DIR + 'three.min.js');
    var E = jibo.face.eye, eye = E.eye, mesh = eye.eyeMesh, face = jibo.face.view;   // jibo.face is the PIXI renderer
    var W = face.width, H = face.height, D2R = Math.PI / 180;
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;pointer-events:none;z-index:10;';
    face.parentNode.insertBefore(canvas, face.nextSibling);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(W, H, false);
    var camera = new THREE.OrthographicCamera(0, W, 0, -H, -5000, 5000);            // screen pixels, y up
    var scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    // Fixed lights in front of the screen (same directions as the demo videos, seen from the screen centre).
    var key = new THREE.PointLight(0xffffff, 1.0, 0); key.position.set(W / 2 + 240, -H / 2 + 960, 600); scene.add(key);
    var blue = new THREE.PointLight(0x1a80ff, 0.0, 0); blue.position.set(W / 2 - 420, -H / 2 - 540, 720); scene.add(blue);

    var ballGeo = new THREE.SphereBufferGeometry(1, 64, 48);
    var unit = new Float32Array(ballGeo.attributes.position.array);                  // unit-sphere positions
    var ballMat = new THREE.MeshPhongMaterial({ color: 0x9d9d9d, specular: 0x1a1a1a, shininess: 20, transparent: true, opacity: 0.7 });
    var ball = new THREE.Mesh(ballGeo, ballMat); ball.frustumCulled = false; scene.add(ball);   // vertices are in pixels
    var lidMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    var upper = new THREE.Mesh(new THREE.SphereBufferGeometry(1.03, 64, 32, 0, 2 * Math.PI, 0, Math.PI / 2), lidMat);
    var lower = new THREE.Mesh(new THREE.SphereBufferGeometry(1.03, 64, 32, 0, 2 * Math.PI, Math.PI / 2, Math.PI / 2), lidMat);
    var lids = new THREE.Group(); lids.add(upper); lids.add(lower); scene.add(lids);

    var composer = null, bloom = null;
    function bloomPipeline() {
        if (composer) { return; }
        window.THREE = THREE;                                                          // the example scripts use a global THREE
        ['CopyShader', 'LuminosityHighPassShader', 'EffectComposer', 'RenderPass', 'ShaderPass', 'UnrealBloomPass']
            .forEach(function (n) { require(DIR + 'ex/' + n + '.js'); });
        composer = new THREE.EffectComposer(renderer);
        composer.addPass(new THREE.RenderPass(scene, camera));
        bloom = new THREE.UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0, 0.35, 0.62);
        bloom.renderToScreen = true;
        composer.addPass(bloom);
    }


    var listen = 0, lastKey = '', state = { on: false, frames: 0, c: 0, listen: 0, glow: 0, mode: '' };
    function place() {
        var r = face.getBoundingClientRect();
        canvas.style.left = face.offsetLeft + 'px'; canvas.style.top = face.offsetTop + 'px';
        canvas.style.width = r.width + 'px'; canvas.style.height = r.height + 'px';
    }
    // Is the flat eye only squashed evenly (a blink) rather than reshaped?
    function blinkLike(p) {
        var near = function (a, b) { return Math.abs(a - b) < 4; };
        return near(p[3].y, 0) && near(p[4].y, 0) && near(p[5].y, 0) && near(p[0].y, p[1].y) && near(p[1].y, p[2].y) &&
            near(p[6].y, p[7].y) && near(p[7].y, p[8].y) && near(p[0].y, -p[6].y) && near(p[0].x, -p[2].x) && near(p[3].x, -p[5].x);
    }
    function bilerp(a, b, c, d, fx, fy) {
        return { x: (a.x * (1 - fx) + b.x * fx) * (1 - fy) + (c.x * (1 - fx) + d.x * fx) * fy,
                 y: (a.y * (1 - fx) + b.y * fx) * (1 - fy) + (c.y * (1 - fx) + d.y * fx) * fy };
    }
    // Move every ball vertex: x,y through the flat eye's piecewise-bilinear 3x3 warp (as PIXI draws it), z by the radius.
    function shapeBall(p, t, depth, after) {
        var pos = ballGeo.attributes.position.array;
        for (var i = 0; i < pos.length; i += 3) {
            var gx = unit[i], gy = -unit[i + 1], cx = gx < 0 ? 0 : 1, ry = gy < 0 ? 0 : 1;
            var fx = gx < 0 ? gx + 1 : gx, fy = gy < 0 ? gy + 1 : gy, k = ry * 3 + cx;
            var q = bilerp(p[k], p[k + 1], p[k + 3], p[k + 4], fx, fy);
            pos[i] = t.a * q.x + t.c * q.y + t.tx;
            pos[i + 1] = -(t.b * q.x + t.d * q.y + t.ty);
            pos[i + 2] = unit[i + 2] * depth;
        }
        if (after) { after(pos); }
        ballGeo.attributes.position.needsUpdate = true;
        var n0 = performance.now(); ballGeo.computeVertexNormals(); state.normalsMs = performance.now() - n0;
    }

    // ---- Black mask overlays reshape the ball ----
    var MASK_RE = /(eye_shape_\d+|overlay-blackcircle|blackeye_blur1)\.png$/, MG = 64, maskCache = {};
    var mcan = document.createElement('canvas'); mcan.width = mcan.height = MG;
    // The mask texture's coverage as an MG x MG grid (1 = covered), read once per texture.
    function maskGrid(path) {
        if (maskCache[path]) { return maskCache[path]; }
        var tex = E.eyeOverlay._texture, src = tex && tex.baseTexture && tex.baseTexture.source;
        if (!src || !src.width) { return null; }
        var x = mcan.getContext('2d'); x.clearRect(0, 0, MG, MG); x.drawImage(src, 0, 0, MG, MG);
        var px = x.getImageData(0, 0, MG, MG).data, g = new Uint8Array(MG * MG);
        for (var i = 0; i < g.length; i++) { g[i] = px[i * 4 + 3] > 127 ? 1 : 0; }
        maskCache[path] = g; return g;
    }
    // Screen rectangle of the overlay mesh. shortcut: treats the overlay as an axis-aligned rectangle (true for every
    // stock mask animation recorded); a skewed or warped mask would need its 3x3 warp inverted.
    function overlayRect() {
        var om = E.eyeOverlay.eyeMesh, t = om.worldTransform, p = om.points, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        for (var i = 0; i < p.length; i++) {
            var x = t.a * p[i].x + t.c * p[i].y + t.tx, y = t.b * p[i].x + t.d * p[i].y + t.ty;
            x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        }
        return { x: x0, y: y0, w: Math.max(x1 - x0, 1), h: Math.max(y1 - y0, 1) };
    }
    // Push every ball vertex the mask covers along its column, away from the mask's middle (up for a mask rising from
    // below, as in happy), onto the mask's edge (positions are x, -y pixels). One direction for the whole ball, so it
    // folds into the uncovered part and never stretches past the mask.
    function applyMask(pos, g, rect, cy) {
        var sv = 0, n = 0;
        for (var q = 0; q < g.length; q++) { if (g[q]) { sv += Math.floor(q / MG) + 0.5; n++; } }
        var goUp = n ? rect.y + sv / n / MG * rect.h > cy : true;
        for (var i = 0; i < pos.length; i += 3) {
            var u = Math.floor((pos[i] - rect.x) / rect.w * MG), sy = -pos[i + 1], v = Math.floor((sy - rect.y) / rect.h * MG);
            if (u < 0 || u >= MG || v < 0 || v >= MG || !g[v * MG + u]) { continue; }
            var up = v, dn = v;
            while (up >= 0 && g[up * MG + u]) { up--; }
            while (dn < MG && g[dn * MG + u]) { dn++; }
            var ny = goUp ? rect.y + (up + 1) / MG * rect.h : rect.y + dn / MG * rect.h;   // the edge itself
            pos[i + 1] = -ny;
        }
    }

    function tick() {
        var t0 = performance.now(); tickBody(); var ms = performance.now() - t0; state.ms = state.ms ? state.ms * 0.9 + ms * 0.1 : ms;
    }
    function tickBody() {
        var d = E._currentDofValues || {}, view = jibo.face.views.currentView;
        var otex = d.overlayTextureInfixBn_r || '', oa = +d.overlay_alphaChannelBn_r || 0;
        var overlayOn = d.overlayVisibilityBn_r > 0.5 && oa > 0.02;              // fully transparent overlays are left on after some animations
        var masked = overlayOn && oa > 0.5 && MASK_RE.test(otex);
        var overlayOk = !overlayOn || masked || /(glow|empty|White_Eye|white-circle)[^/]*\.png$/i.test(otex);
        var etex = d.eyeTextureInfixBn_r || '', blurred = /whiteeye_blur1\.png$/.test(etex);
        var plain = (etex === '' || blurred || /(White|Default)_Eye\.png$/.test(etex)) && d.eyeVisibilityBn_r > 0.5 && overlayOk &&
            E.worldVisible && eye.worldVisible && mesh.worldAlpha > 0.01 && view && view.id === 'eyeView' && !window.__eye3dSuspended;
        state.on = !!plain; state.frames++;
        canvas.style.display = state.on ? '' : 'none';
        if (!window.__eye3dSuspended) { mesh.renderable = !state.on; }
        if (!state.on) { lastKey = ''; return; }
        place();
        var t = state.forceT || mesh.worldTransform, p = mesh.points, minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
        for (var i = 0; i < p.length; i++) {
            var x = t.a * p[i].x + t.c * p[i].y + t.tx, y = t.b * p[i].x + t.d * p[i].y + t.ty;
            minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
        var r = Math.max((maxX - minX) / 2, 1), cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, c = 0;
        var g = masked ? maskGrid(otex) : null, rect = g ? overlayRect() : null;
        var blink = blinkLike(p) && state.forceShape == null && !g;               // a masked eye is reshaped, never lidded
        var shapeKey = [blink ? 'b' : 's', Math.round(t.a * 1000), Math.round(t.d * 1000), Math.round(t.tx), Math.round(t.ty)]
            .concat(blink ? [Math.round(r)] : p.map(function (q) { return Math.round(q.x) + ',' + Math.round(q.y); }))
            .concat(g ? [otex, Math.round(rect.x), Math.round(rect.y), Math.round(rect.w), Math.round(rect.h)] : []).join('|');
        if (blink) {
            c = Math.min(Math.max(1 - (maxY - minY) / (2 * r), 0), 1);
            if (state.forceC != null) { c = state.forceC; }                          // test hook: hold the lids part-closed
            if (shapeKey !== lastKey) {                                              // unsquashed ball of the eye's width
                var s = r / 300, g = [];
                for (var k = 0; k < 9; k++) { g.push({ x: (k % 3 - 1) * 300, y: (Math.floor(k / 3) - 1) * 300 }); }
                shapeBall(g, { a: s, b: 0, c: 0, d: s, tx: cx, ty: cy }, r);
            }
            lids.visible = true; lids.position.set(cx, -cy, 0); lids.scale.set(r, r, r);
            upper.rotation.x = -(95 - 103 * c) * D2R; lower.rotation.x = -(-95 + 87 * c) * D2R;
        } else {
            if (shapeKey !== lastKey) {                                              // the ball itself takes the new shape
                shapeBall(state.forceShape || p, t, r, g ? function (pos) { applyMask(pos, g, rect, cy); } : null);
            }
            lids.visible = false;
        }
        lastKey = shapeKey; state.mode = blink ? 'blink' : 'shape';

        var tint = mesh.tint, tr = (tint >> 16 & 255) / 255, tg = (tint >> 8 & 255) / 255, tb = (tint & 255) / 255;
        var listening = state.forceListen || tb - tr > 0.2;                          // stock listening tints the eye blue
        var now = performance.now(), dt = Math.min((now - (state.t || now)) / 1000, 0.1); state.t = now;
        state.ramp = Math.min(Math.max((state.ramp || 0) + (listening ? dt / 0.3 : -dt / 0.5), 0), 1);
        listen = state.ramp * state.ramp * (3 - 2 * state.ramp);                     // eased cross-fade, no cuts
        var pulse = 0.5 - 0.5 * Math.cos(2 * Math.PI * now / 1200);                  // 1.2 s breathing while listening
        var glow = state.forceGlow != null ? state.forceGlow : overlayOn && /glow/i.test(otex) ? oa : 0;
        var flash = overlayOn && /white-circle\.png$/.test(otex) ? oa : 0;          // hue lights: the eye lights up white
        var bright = overlayOn && /White_Eye\.png$/.test(otex) ? oa : 0;          // surprised / oops: a brighter, bigger eye
        glow = Math.max(glow, flash);
        state.blur = (state.blur || 0) + ((blurred ? 6 : 0) - (state.blur || 0)) * Math.min(dt / 0.15, 1);
        var f = state.blur > 0.3 ? 'blur(' + state.blur.toFixed(1) + 'px)' : '';
        if (canvas.style.filter !== f) { canvas.style.filter = f; canvas.style.webkitFilter = f; }
        if (listen > 0) { ballMat.color.setRGB(0.616, 0.616, 0.616); } else { ballMat.color.setRGB(0.616 * tr, 0.616 * tg, 0.616 * tb); }
        var em = Math.min(0.22 * glow + 0.5 * flash + 0.25 * bright, 0.75);
        ballMat.emissive.setRGB(em, em, em);
        ballMat.opacity = Math.min(0.7 + 0.3 * Math.max(glow, bright), 1) * mesh.worldAlpha;
        key.intensity = 1 - 0.7 * listen + 0.3 * listen * pulse;
        blue.intensity = 1.5 * listen * (1 - 0.12 * pulse);
        state.key = key.intensity; state.blue = blue.intensity; state.c = c; state.listen = listen; state.glow = glow;
        if (glow > 0.01) {
            bloomPipeline();
            bloom.strength = 0.9 * glow;
            var b0 = performance.now(); composer.render(); state.bloomMs = performance.now() - b0;
        } else {
            renderer.render(scene, camera);
        }
    }
    bloomPipeline(); composer.render();                                              // compile the bloom shaders now, not mid-smile
    renderer.clear();
    PIXI.ticker.shared.add(tick);
    window.__eye3d = {
        state: state, three: { THREE: THREE, scene: scene, ball: ball, lids: lids, renderer: renderer },
        stop: function () {
            PIXI.ticker.shared.remove(tick); mesh.renderable = true;
            ballGeo.dispose(); renderer.dispose(); renderer.forceContextLoss();   // free the WebGL context: leaked ones OOM'd the renderer
            if (canvas.parentNode) { canvas.parentNode.removeChild(canvas); } delete window.__eye3d;
        }
    };
    return 'eye3d three.js r' + THREE.REVISION + ' on, webgl ' + !!renderer.context;
};
