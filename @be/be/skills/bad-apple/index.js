(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bebadapple = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
const be_framework_1 = require("@be/be-framework");
const jibo = require("jibo");
const BadAppleView_1 = require("./views/BadAppleView");
class BadAppleSkill extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.view = null;
        this.exiting = false;
        this.screenGestureHandler = null;
    }
    postInit(done) {
        done();
    }
    preload(done) {
        const es = jibo.embodied && jibo.embodied.speech;
        if (es && typeof es.installDelegate === 'function') {
            es.installDelegate(this.assetPack);
        }
        done();
    }
    open(result) {
        this.exiting = false;
        this.subscribeSwipeDown();
        try {
            const banner = document.getElementById('menu-redirect-banner');
            if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }
        catch (e) { }
        const self = this;
        setTimeout(() => {
            try {
                self.view = new BadAppleView_1.default(self.assetPack, self.rootPath);
                self.view.start((err) => {
                    if (err) {
                        console.error('[bad-apple] start failed:', err);
                    }
                });
            }
            catch (err) {
                console.error('[bad-apple] open failed:', err);
            }
        }, 50);
    }
    close(done) {
        this.unsubscribeSwipeDown();
        if (this.view) {
            try {
                this.view.cleanup();
            }
            catch (e) { }
            this.view = null;
        }
        done();
    }
    subscribeSwipeDown() {
        try {
            const shared = jibo.globalEvents && jibo.globalEvents.shared;
            if (!shared || !shared.screenGesture) {
                return;
            }
            this.screenGestureHandler = (gesture) => {
                if (String(gesture).toLowerCase() !== 'swipedown' || this.exiting) {
                    return;
                }
                this.exiting = true;
                this.exit();
            };
            shared.screenGesture.on(this.screenGestureHandler);
        }
        catch (err) { }
    }
    unsubscribeSwipeDown() {
        if (!this.screenGestureHandler) {
            return;
        }
        try {
            const shared = jibo.globalEvents && jibo.globalEvents.shared;
            if (shared && shared.screenGesture) {
                shared.screenGesture.removeListener(this.screenGestureHandler);
            }
        }
        catch (err) { }
        this.screenGestureHandler = null;
    }
}
module.exports = BadAppleSkill;

},{"./views/BadAppleView":2,"@be/be-framework":undefined,"jibo":undefined}],2:[function(require,module,exports){
(function (__dirname){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const FACE_W = 1280;
const FACE_H = 720;
class BadAppleView {
    constructor(assetPack, rootPath) {
        this.root = null;
        this.video = null;
        this.status = null;
        this.cleaned = false;
        this.assetPack = assetPack;
        this.rootPath = rootPath || '';
    }
    start(done) {
        try {
            this.mountShell();
            const uri = this.resolveVideoUri();
            if (!uri) {
                this.showStatus('Missing video\n\nPlace bad-apple.mp4 in:\n@be/bad-apple/video/\n\nSwipe down to exit');
                done(new Error('missing bad-apple.mp4'));
                return;
            }
            this.showStatus('Loading Bad Apple…');
            this.play(uri, done);
        }
        catch (err) {
            this.showStatus('Failed to start\n\n' + String(err));
            done(err);
        }
    }
    cleanup() {
        this.cleaned = true;
        try {
            if (this.video) {
                this.video.pause();
                this.video.removeAttribute('src');
                try {
                    this.video.load();
                }
                catch (e) { }
                if (this.video.parentNode) {
                    this.video.parentNode.removeChild(this.video);
                }
            }
        }
        catch (e) { }
        this.video = null;
        try {
            if (this.root && this.root.parentNode) {
                this.root.parentNode.removeChild(this.root);
            }
        }
        catch (e) { }
        this.root = null;
        this.status = null;
    }
    mountShell() {
        this.root = document.createElement('div');
        this.root.id = 'bad-apple-root';
        this.applyStyle(this.root, {
            position: 'fixed',
            left: '0',
            top: '0',
            width: FACE_W + 'px',
            height: FACE_H + 'px',
            background: '#000',
            zIndex: '99999',
            overflow: 'hidden'
        });
        this.status = document.createElement('div');
        this.applyStyle(this.status, {
            position: 'absolute',
            left: '40px',
            top: '40px',
            right: '40px',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '28px',
            whiteSpace: 'pre-wrap',
            zIndex: '3',
            textShadow: '0 2px 4px #000'
        });
        this.status.textContent = 'Bad Apple';
        this.root.appendChild(this.status);
        const hint = document.createElement('div');
        this.applyStyle(hint, {
            position: 'absolute',
            left: '40px',
            bottom: '36px',
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'monospace',
            fontSize: '20px',
            zIndex: '3'
        });
        hint.textContent = 'Swipe down to exit';
        this.root.appendChild(hint);
        document.body.appendChild(this.root);
    }
    play(uri, done) {
        const video = document.createElement('video');
        this.video = video;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.preload = 'auto';
        video.loop = true;
        video.muted = false;
        video.volume = 0.20;
        this.applyStyle(video, {
            position: 'absolute',
            left: '0',
            top: '0',
            width: FACE_W + 'px',
            height: FACE_H + 'px',
            objectFit: 'contain',
            background: '#000',
            zIndex: '1'
        });
        this.root.insertBefore(video, this.root.firstChild);
        let settled = false;
        const finish = (err) => {
            if (settled || this.cleaned) {
                return;
            }
            settled = true;
            done(err);
        };
        video.addEventListener('loadeddata', () => {
            if (this.cleaned) {
                return;
            }
            this.hideStatus();
            const p = video.play();
            if (p && typeof p.then === 'function') {
                p.then(() => finish()).catch((err) => {
                    this.showStatus('Play blocked\nTap the screen\n\n' + String(err));
                    finish(err);
                });
            }
            else {
                finish();
            }
        });
        video.addEventListener('error', () => {
            const msg = (video.error && video.error.message)
                ? video.error.message
                : ('code ' + (video.error ? video.error.code : '?'));
            this.showStatus('Video error\n\n' + msg + '\n\n' + uri);
            finish(new Error(msg));
        });
        const unmute = () => {
            try {
                video.muted = false;
                video.volume = 0.20;
                video.play();
            }
            catch (e) { }
        };
        this.root.addEventListener('pointerdown', unmute, false);
        this.root.addEventListener('touchstart', unmute, false);
        video.src = uri;
        video.load();
        setTimeout(() => {
            if (!settled && !this.cleaned) {
                this.showStatus('Still loading…\n\n' + uri);
            }
        }, 8000);
    }
    resolveVideoUri() {
        const candidates = [
            'video/bad-apple.mp4',
            'video/badapple.mp4',
            'resources/bad-apple.mp4'
        ];
        const path = require('path');
        const fs = require('fs');
        for (let i = 0; i < candidates.length; i++) {
            const rel = candidates[i];
            try {
                const PathUtils = jibo.utils && jibo.utils.PathUtils;
                if (PathUtils && typeof PathUtils.getAssetUri === 'function') {
                    const uri = PathUtils.getAssetUri(rel, this.assetPack);
                    if (uri) {
                        const disk = this.resolveDiskPath(rel, path, fs);
                        if (!disk || fs.existsSync(disk)) {
                            return uri;
                        }
                    }
                }
            }
            catch (e) { }
            const disk = this.resolveDiskPath(rel, path, fs);
            if (disk && fs.existsSync(disk)) {
                return 'file://' + disk;
            }
        }
        return '';
    }
    resolveDiskPath(rel, pathMod, fsMod) {
        const cleaned = String(rel).replace(/^\.\//, '');
        const bases = [
            this.rootPath,
            pathMod.join(__dirname),
            pathMod.join(__dirname, '..'),
            pathMod.join(__dirname, '..', '..')
        ];
        for (let i = 0; i < bases.length; i++) {
            if (!bases[i]) {
                continue;
            }
            const full = pathMod.join(bases[i], cleaned);
            try {
                if (fsMod.existsSync(full)) {
                    return full;
                }
            }
            catch (e) { }
        }
        return '';
    }
    showStatus(text) {
        if (!this.status) {
            return;
        }
        this.status.style.display = 'block';
        this.status.textContent = text;
    }
    hideStatus() {
        if (!this.status) {
            return;
        }
        this.status.style.display = 'none';
    }
    applyStyle(el, props) {
        for (const key in props) {
            if (props.hasOwnProperty(key)) {
                el.style[key] = props[key];
            }
        }
    }
}
exports.default = BadAppleView;

}).call(this)}).call(this,"/src/views")

},{"fs":undefined,"jibo":undefined,"path":undefined}]},{},[1])(1)
});

//# sourceMappingURL=index.js.map