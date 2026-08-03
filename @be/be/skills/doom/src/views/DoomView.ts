import jibo = require('jibo');

type Zone = 'left' | 'right' | 'shoot' | 'forward' | 'none';

interface ActivePointer {
  id: number;
  zone: Zone;
  startedAt: number;
  pulseTimer: any;
}

export type DoomProgress = (message?: string, detail?: string) => void;

const FACE_W = 1280;
const FACE_H = 720;
const SIDE_W = 320;
const TAP_MS = 200;
const PULSE_MS = 120;
const FIRST_FRAME_TIMEOUT_MS = 12000;
const POLL_MS = 250;
/** Target display/tick rate for the JS main-loop pump (Doom's sim is still 35Hz). */
const TARGET_FPS = 20;
const FRAME_MS = 1000 / TARGET_FPS;

const KEY = {
  forward: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
  left: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
  right: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
  fire: { key: 'Control', code: 'ControlLeft', keyCode: 17 }
};

/**
 * Full-screen Doom canvas + transparent touch overlay that injects keyboard events.
 */
export default class DoomView {

  private assetPack: string;
  private rootPath: string;
  private root: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private overlay: HTMLDivElement;
  private fpsHud: HTMLDivElement;
  private cleaned: boolean = false;
  private movingForward: boolean = false;
  private keysDown: { [code: string]: boolean } = {};
  private pointers: { [id: number]: ActivePointer } = {};
  private boundPointerDown: any;
  private boundPointerMove: any;
  private boundPointerUp: any;
  private boundPointerCancel: any;
  private originalProcessExit: any = null;
  private engineLog: string[] = [];
  private progress: DoomProgress = () => { /* no-op */ };
  private pollTimer: any = null;
  private loopPumpTimer: any = null;
  private fpsFrames: number = 0;
  private fpsWindowStart: number = 0;
  private pumpBusy: boolean = false;
  private lastBlitCount: number = 0;

  constructor (assetPack: string, rootPath: string, progress?: DoomProgress) {
    this.assetPack = assetPack;
    this.rootPath = rootPath || '';
    if (progress) { this.progress = progress; }

    this.root = document.createElement('div');
    this.root.id = 'doom-root';
    this.applyStyle(this.root, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: FACE_W + 'px',
      height: FACE_H + 'px',
      background: '#101010',
      zIndex: '99999',
      overflow: 'hidden',
      webkitUserSelect: 'none',
      userSelect: 'none',
      touchAction: 'none'
    });

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'canvas';
    this.canvas.className = 'doom-frame';
    this.canvas.tabIndex = -1;
    this.canvas.setAttribute('oncontextmenu', 'event.preventDefault()');
    // Native Doom framebuffer is 320x200 — keep the canvas there so SDL
    // doesn't software-scale up to 640x400 before putImageData.
    this.canvas.width = 320;
    this.canvas.height = 200;
    this.applyStyle(this.canvas, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: FACE_W + 'px',
      height: FACE_H + 'px',
      background: '#000',
      imageRendering: 'pixelated'
    } as any);
    // Opaque 2d context — skips per-pixel alpha fills in the SDL blit path.
    try {
      this.canvas.getContext('2d', { alpha: false } as any);
    } catch (e) {
      try { this.canvas.getContext('2d'); } catch (e2) { /* no-op */ }
    }

    // Visible placeholder under the status panel.
    this.drawPlaceholder('Starting Doom…');

    this.overlay = document.createElement('div');
    this.overlay.id = 'doom-touch';
    this.applyStyle(this.overlay, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: FACE_W + 'px',
      height: FACE_H + 'px',
      zIndex: '2',
      background: 'transparent',
      touchAction: 'none',
      webkitUserSelect: 'none',
      userSelect: 'none'
    });

    this.fpsHud = document.createElement('div');
    this.fpsHud.id = 'doom-fps';
    this.applyStyle(this.fpsHud, {
      position: 'absolute',
      right: '16px',
      top: '12px',
      zIndex: '5',
      padding: '6px 12px',
      background: 'rgba(0,0,0,0.55)',
      color: '#7CFF6B',
      fontFamily: 'Menlo, Consolas, monospace',
      fontSize: '22px',
      fontWeight: '700',
      letterSpacing: '1px',
      pointerEvents: 'none',
      webkitUserSelect: 'none',
      userSelect: 'none'
    });
    this.fpsHud.textContent = '-- FPS';

    this.root.appendChild(this.canvas);
    this.root.appendChild(this.overlay);
    this.root.appendChild(this.fpsHud);

    // Mount on document.body with position:fixed. This is the ONLY mount that has
    // been confirmed visible on the robot (it produced the full-screen black layer).
    // Mounting inside #face showed nothing. We do NOT touch the face WebGL canvas
    // (hiding/removing it can brick the display for the rest of the session).
    const host = document.body || document.documentElement;
    if (!host) {
      throw new Error('No DOM host (body) to mount Doom');
    }
    host.appendChild(this.root);

    this.boundPointerDown = (e: any) => this.onPointerDown(e);
    this.boundPointerMove = (e: any) => this.onPointerMove(e);
    this.boundPointerUp = (e: any) => this.onPointerUp(e);
    this.boundPointerCancel = (e: any) => this.onPointerUp(e);

    this.overlay.addEventListener('pointerdown', this.boundPointerDown, false);
    this.overlay.addEventListener('pointermove', this.boundPointerMove, false);
    this.overlay.addEventListener('pointerup', this.boundPointerUp, false);
    this.overlay.addEventListener('pointercancel', this.boundPointerCancel, false);
    this.overlay.addEventListener('contextmenu', (e) => e.preventDefault(), false);
  }

  public start (done: (err?: any) => void): void {
    const self = this;
    let settled = false;
    const finish = (err?: any) => {
      if (settled) { return; }
      settled = true;
      if (self.pollTimer) {
        clearInterval(self.pollTimer);
        self.pollTimer = null;
      }
      done(err);
    };

    try {
      this.progress('Reading game files…');
      const fs = require('fs');
      const wadPath = this.resolveAssetPath('resources/doom1.wad');
      const cfgPath = this.resolveAssetPath('resources/default.cfg');
      const engineJsPath = this.resolveAssetPath('resources/engine/websockets-doom.js');
      const engineWasmPath = this.resolveAssetPath('resources/engine/websockets-doom.wasm');
      const engineAsmPath = this.resolveAssetPath('resources/engine/websockets-doom.wasm2js.js');

      // Jibo's Electron has no WebAssembly — use the asm.js (wasm2js) build.
      const WA: any = (typeof window !== 'undefined' ? (window as any).WebAssembly : null) ||
        (typeof global !== 'undefined' ? (global as any).WebAssembly : null);
      const hasNativeWasm = !!(WA && typeof WA === 'object' && typeof WA.instantiate === 'function');
      const useAsmJs = !hasNativeWasm;
      this.logLine('WebAssembly=' + (hasNativeWasm ? 'yes' : 'NO') +
        ' → ' + (useAsmJs ? 'asm.js fallback' : 'native wasm'));

      const paths = [
        ['WAD', wadPath],
        ['config', cfgPath],
        ['engine JS', engineJsPath]
      ];
      if (useAsmJs) {
        paths.push(['engine asm.js', engineAsmPath]);
      } else {
        paths.push(['engine WASM', engineWasmPath]);
      }
      const missing: string[] = [];
      for (let i = 0; i < paths.length; i++) {
        const label = paths[i][0];
        const p = paths[i][1];
        let ok = false;
        try { ok = !!(p && fs.existsSync(p)); } catch (e) { ok = false; }
        if (!ok) { missing.push(label + ': ' + p); }
      }
      if (missing.length) {
        finish(new Error('Missing Doom files on robot:\n' + missing.join('\n')));
        return;
      }

      const wadData = new Uint8Array(fs.readFileSync(wadPath));
      const cfgData = new Uint8Array(fs.readFileSync(cfgPath));
      const engineSource = fs.readFileSync(engineJsPath, 'utf8');
      let wasmData: any = null;
      let asmInstantiate: any = null;

      if (useAsmJs) {
        this.progress('Loading asm.js engine…\n(Jibo has no WebAssembly)', engineAsmPath);
        let asmSource: string | null = fs.readFileSync(engineAsmPath, 'utf8');
        if (asmSource.indexOf('emscripten_get_sbrk_ptr() | 0) >> 2] | 0) >>> 0 < ($0') !== -1) {
          finish(new Error(
            'Doom asm.js still has SAFE_HEAP checks.\n' +
            'Copy the patched websockets-doom.wasm2js.js to the robot.'
          ));
          return;
        }
        // Either fully inlined, or regenerated via wasm-opt (direct HEAP*, no SAFE_HEAP_* calls).
        const hasSafeCalls = asmSource.indexOf('SAFE_HEAP_LOAD_i32_4_4(') !== -1;
        const markedFast = asmSource.indexOf('__DOOM_SAFE_HEAP_INLINED__') !== -1;
        if (hasSafeCalls && !markedFast) {
          finish(new Error(
            'Doom asm.js still uses SAFE_HEAP_* calls.\n' +
            'Copy the fast websockets-doom.wasm2js.js to the robot\n' +
            '(must contain __DOOM_SAFE_HEAP_INLINED__).'
          ));
          return;
        }
        if (asmSource.indexOf('__doomRSkip') === -1) {
          finish(new Error(
            'Doom asm.js missing render-skip patch.\n' +
            'Copy the patched websockets-doom.wasm2js.js (with __doomRSkip).'
          ));
          return;
        }
        this.logLine(hasSafeCalls
          ? 'asm.js SAFE_HEAP inlined OK'
          : 'asm.js direct HEAP (wasm-opt) OK');
        // Last expression returns the instantiate(info) function from wasm2js --emscripten.
        asmInstantiate = (0, eval)(asmSource + '\n;instantiate');
        // Drop the 13MB source ASAP — keeping it around has OOM'd / restarted Be.
        asmSource = null;
        if (typeof asmInstantiate !== 'function') {
          finish(new Error('asm.js engine did not export instantiate()'));
          return;
        }
        this.logLine('asm.js instantiate() ready');
      } else {
        wasmData = fs.readFileSync(engineWasmPath);
      }

      this.progress(
        'Files loaded.\nStarting engine…',
        'wad ' + Math.round(wadData.byteLength / 1024) + ' KB\n' +
        (useAsmJs ? 'mode asm.js (no native wasm)' : ('wasm ' + Math.round(wasmData.length / 1024) + ' KB')) + '\n' +
        wadPath
      );

      this.blockProcessExit();
      this.ensureBrowserGlobals();

      // Polyfill just enough WebAssembly for the glue's typeof/RuntimeError checks.
      if (useAsmJs) {
        const gPoly: any = (typeof window !== 'undefined') ? window : global;
        if (typeof gPoly.WebAssembly !== 'object' || !gPoly.WebAssembly) {
          gPoly.WebAssembly = { RuntimeError: Error };
        } else if (!gPoly.WebAssembly.RuntimeError) {
          gPoly.WebAssembly.RuntimeError = Error;
        }
      }

      const commonArgs = [
        '-iwad', 'doom1.wad',
        '-window',
        '-width', '320',
        '-height', '200',
        '-nogui',
        '-nomusic',
        '-nosound',
        '-nograbmouse',
        '-config', 'default.cfg',
        '-warp', '1', '1',
        '-skill', '3'
      ];

      let aborted: any = null;
      const moduleConfig: any = {
        arguments: commonArgs,
        thisProgram: 'doom',
        canvas: this.canvas,
        locateFile: (p: string) => p,
        // Prevent Node-path process.exit from killing Be.
        quit: (status: number) => {
          self.logLine('Module.quit(' + status + ')');
        },
        preRun: [
          () => {
            try {
              self.progress('Loading WAD into engine…', self.recentLog());
              const FS = (global as any).Module.FS;
              FS.createPreloadedFile('', 'doom1.wad', wadData, true, true);
              FS.createPreloadedFile('', 'default.cfg', cfgData, true, true);
            } catch (err) {
              self.logLine('FS preload failed: ' + err);
              self.progress('FS preload failed', String(err));
            }
          }
        ],
        onRuntimeInitialized: () => {
          self.progress('Engine ready.\nBooting shareware episode…', self.recentLog());
        },
        postRun: [
          () => {
            // postRun can fire even after abort — do NOT treat it as success.
            self.logLine('postRun');
            try { self.canvas.focus(); } catch (e) { /* no-op */ }
            self.progress(
              'Waiting for first frame…\n(overlay will go clear — swipe down to exit)',
              self.recentLog()
            );
            self.waitForFirstFrame(finish, () => aborted);
          }
        ],
        print: (text: string) => {
          self.logLine(String(text));
          self.progress(undefined, self.recentLog());
        },
        printErr: (text: string) => {
          self.logLine('ERR: ' + text);
          self.progress('Engine message…', self.recentLog());
        },
        setStatus: (text: string) => {
          if (text) {
            self.logLine('status: ' + text);
            self.progress(String(text), self.recentLog());
          }
        },
        // Count real engine frames for the FPS HUD.
        postMainLoop: () => {
          self.noteFrame();
        },
        onAbort: (reason: any) => {
          aborted = reason;
          self.logLine('ABORT: ' + reason);
          // Do not throw / finish aggressively mid-frame — that has restarted Be.
          try {
            self.progress('Doom aborted (Be kept alive)', String(reason));
          } catch (e) { /* no-op */ }
          try {
            finish(new Error('Doom aborted:\n' + reason + '\n\n' + self.recentLog()));
          } catch (e2) { /* no-op */ }
        },
        totalDependencies: 0,
        monitorRunDependencies: function (left: number) {
          this.totalDependencies = Math.max(this.totalDependencies, left);
          self.progress('Engine deps… (' + left + ' left)', self.recentLog());
        }
      };

      if (useAsmJs) {
        moduleConfig.instantiateWasm = (info: any, receiveInstance: any) => {
          self.progress('Instantiating asm.js engine…', self.recentLog());
          const exports = asmInstantiate(info);
          // Glue expects a WASM Instance-like object with .exports
          receiveInstance({ exports: exports });
          return exports;
        };
      } else {
        moduleConfig.wasmBinary = wasmData;
      }

      const g: any = (typeof window !== 'undefined') ? window : global;
      g.Module = moduleConfig;
      (global as any).Module = moduleConfig;

      this.progress('Running engine script…', useAsmJs ? 'asm.js mode' : 'wasm mode');
      // Clear the placeholder so "first frame" detection isn't a false positive.
      try {
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
      } catch (e) { /* no-op */ }

      // Electron has both `window` and `process`, so the stock Emscripten build
      // picks ENVIRONMENT_IS_NODE. That path expects __dirname, overwrites
      // quit with process.exit, and breaks canvas startup. Force WEB.
      let patchedSource = engineSource;
      patchedSource = patchedSource.replace(
        'ENVIRONMENT_IS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";',
        'ENVIRONMENT_IS_NODE = false; /* forced WEB for Jibo/Electron */'
      );
      if (patchedSource === engineSource) {
        self.logLine('WARN: failed to patch ENVIRONMENT_IS_NODE');
      } else {
        self.logLine('patched ENVIRONMENT_IS_NODE=false');
      }

      // Skip hard-abort when WebAssembly is missing (asm.js path provides instantiateWasm).
      const beforeWasmCheck = patchedSource;
      patchedSource = patchedSource.replace(
        'if (typeof WebAssembly !== "object") {\n abort("no native wasm support detected");\n}',
        'if (typeof WebAssembly !== "object") { WebAssembly = { RuntimeError: Error }; }'
      );
      if (patchedSource === beforeWasmCheck) {
        // Minification-tolerant fallback
        patchedSource = patchedSource.replace(
          'abort("no native wasm support detected")',
          '/* wasm optional */ (WebAssembly = WebAssembly || { RuntimeError: Error })'
        );
      }
      self.logLine('patched wasm support check');

      // abort() throws WebAssembly.RuntimeError — uncaught in the face loop can
      // tear down Be's renderer. Report via onAbort but do not throw.
      const beforeAbort = patchedSource;
      patchedSource = patchedSource.replace(
        'function abort(what) {\n' +
        ' if (Module["onAbort"]) {\n' +
        '  Module["onAbort"](what);\n' +
        ' }\n' +
        ' what += "";\n' +
        ' err(what);\n' +
        ' ABORT = true;\n' +
        ' EXITSTATUS = 1;\n' +
        ' what = "abort(" + what + "). Build with -s ASSERTIONS=1 for more info.";\n' +
        ' var e = new WebAssembly.RuntimeError(what);\n' +
        ' throw e;\n' +
        '}',
        'function abort(what) {\n' +
        ' if (Module["onAbort"]) {\n' +
        '  try { Module["onAbort"](what); } catch (e0) {}\n' +
        ' }\n' +
        ' what += "";\n' +
        ' try { err(what); } catch (e1) {}\n' +
        ' ABORT = true;\n' +
        ' EXITSTATUS = 1;\n' +
        ' /* no throw — protect Be from renderer restart */\n' +
        '}'
      );
      if (patchedSource !== beforeAbort) {
        self.logLine('patched abort() → no throw');
      } else {
        self.logLine('WARN: abort() patch missed');
      }

      // Without real WebAssembly.Module, convertJsFunctionToWasm must return the JS fn.
      patchedSource = patchedSource.replace(
        'function convertJsFunctionToWasm(func, sig) {\n if (typeof WebAssembly.Function === "function") {',
        'function convertJsFunctionToWasm(func, sig) {\n' +
        ' if (typeof WebAssembly.Module !== "function") { return func; }\n' +
        ' if (typeof WebAssembly.Function === "function") {'
      );

      // Jibo's Electron often has rAF that fires once (or never) for offscreen/face
      // canvases — game draws one frame then freezes. Always use setTimeout.
      const beforeRaf = patchedSource;
      patchedSource = patchedSource.replace(
        'requestAnimationFrame: function(func) {\n  if (typeof requestAnimationFrame === "function") {\n   requestAnimationFrame(func);\n   return;\n  }\n  var RAF = Browser.fakeRequestAnimationFrame;\n  RAF(func);\n },',
        'requestAnimationFrame: function(func) {\n  setTimeout(func, ' + FRAME_MS + ');\n },'
      );
      if (patchedSource !== beforeRaf) {
        self.logLine('patched rAF → setTimeout(' + TARGET_FPS + 'fps)');
      } else {
        self.logLine('WARN: failed to patch requestAnimationFrame');
      }

      // Default main-loop timing is rAF (mode 1). Force setTimeout (mode 0) at TARGET_FPS.
      const beforeTiming = patchedSource;
      patchedSource = patchedSource.replace(
        'if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps); else _emscripten_set_main_loop_timing(1, 1);',
        'if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps); else _emscripten_set_main_loop_timing(0, ' + FRAME_MS + ');'
      );
      if (patchedSource !== beforeTiming) {
        self.logLine('patched main loop timing → setTimeout ' + TARGET_FPS + 'fps');
      }

      // SAFE_HEAP calls _sbrk() on EVERY load/store — that alone can lock Doom
      // at 2–3 FPS under asm.js. Replace with direct heap access.
      const beforeSafeStore = patchedSource;
      patchedSource = patchedSource.replace(
        'function SAFE_HEAP_STORE(dest, value, bytes, isFloat) {\n' +
        ' if (dest <= 0) abort("segmentation fault storing " + bytes + " bytes to address " + dest);\n' +
        ' if (dest % bytes !== 0) abort("alignment error storing to address " + dest + ", which was expected to be aligned to a multiple of " + bytes);\n' +
        ' if (runtimeInitialized) {\n' +
        '  var brk = _sbrk() >>> 0;\n' +
        '  if (dest + bytes > brk) abort("segmentation fault, exceeded the top of the available dynamic heap when storing " + bytes + " bytes to address " + dest + ". DYNAMICTOP=" + brk);\n' +
        '  assert(brk >= _emscripten_stack_get_base());\n' +
        '  assert(brk <= HEAP8.length);\n' +
        ' }\n' +
        ' setValue(dest, value, getSafeHeapType(bytes, isFloat), 1);\n' +
        ' return value;\n' +
        '}',
        'function SAFE_HEAP_STORE(dest, value, bytes, isFloat) {\n' +
        ' setValue(dest, value, getSafeHeapType(bytes, isFloat), 1);\n' +
        ' return value;\n' +
        '}'
      );
      patchedSource = patchedSource.replace(
        'function SAFE_HEAP_LOAD(dest, bytes, unsigned, isFloat) {\n' +
        ' if (dest <= 0) abort("segmentation fault loading " + bytes + " bytes from address " + dest);\n' +
        ' if (dest % bytes !== 0) abort("alignment error loading from address " + dest + ", which was expected to be aligned to a multiple of " + bytes);\n' +
        ' if (runtimeInitialized) {\n' +
        '  var brk = _sbrk() >>> 0;\n' +
        '  if (dest + bytes > brk) abort("segmentation fault, exceeded the top of the available dynamic heap when loading " + bytes + " bytes from address " + dest + ". DYNAMICTOP=" + brk);\n' +
        '  assert(brk >= _emscripten_stack_get_base());\n' +
        '  assert(brk <= HEAP8.length);\n' +
        ' }\n' +
        ' var type = getSafeHeapType(bytes, isFloat);\n' +
        ' var ret = getValue(dest, type, 1);\n' +
        ' if (unsigned) ret = unSign(ret, parseInt(type.substr(1), 10));\n' +
        ' return ret;\n' +
        '}',
        'function SAFE_HEAP_LOAD(dest, bytes, unsigned, isFloat) {\n' +
        ' var type = getSafeHeapType(bytes, isFloat);\n' +
        ' var ret = getValue(dest, type, 1);\n' +
        ' if (unsigned) ret = unSign(ret, parseInt(type.substr(1), 10));\n' +
        ' return ret;\n' +
        '}'
      );
      if (patchedSource !== beforeSafeStore) {
        self.logLine('patched SAFE_HEAP → fast (no _sbrk)');
      } else {
        self.logLine('WARN: SAFE_HEAP patch missed');
      }

      // Per-frame stack cookie + assert checks are pure overhead in release play.
      patchedSource = patchedSource.replace(
        'function checkStackCookie() {\n if (ABORT) return;',
        'function checkStackCookie() { return; }\n function __disabled_checkStackCookie() {\n if (ABORT) return;'
      );
      patchedSource = patchedSource.replace(
        'function assert(condition, text) {\n if (!condition) {\n  abort("Assertion failed: " + text);\n }\n}',
        'function assert(condition, text) {}'
      );

      // Skip Asyncify export wrapping — REMOVED: caused black screen while loop still ran.
      // Keep SAFE_HEAP/assert/cookie fast-paths only.

      // Give Asyncify more stack — 4KB is tight and can stall after first frame.
      patchedSource = patchedSource.replace(
        'StackSize: 4096,',
        'StackSize: 65536,'
      );

      // Export wrappers push/pop + assert on EVERY asm export call — expensive on
      // old V8. Keep stack tracking (needed for sleep unwind) but drop assert.
      patchedSource = patchedSource.replace(
        'var y = Asyncify.exportCallStack.pop();\n' +
        '       assert(y === x);\n' +
        '       Asyncify.maybeStopUnwind();',
        'Asyncify.exportCallStack.pop();\n' +
        '       Asyncify.maybeStopUnwind();'
      );

      // Opaque 2d contexts (skip alpha channel work in SDL blit).
      patchedSource = patchedSource.replace(
        'ctx = canvas.getContext("2d");',
        'ctx = canvas.getContext("2d", { alpha: false });'
      );

      // The stock blit never sets SDL2.data32Data, so it rebuilt typed views
      // EVERY frame + filled alpha on every pixel. Both are killers on Jibo.
      const beforeBlit = patchedSource;
      patchedSource = patchedSource.replace(
        'if (SDL2.data32Data !== data) {\n' +
        '    SDL2.data32 = new Int32Array(data.buffer);\n' +
        '    SDL2.data8 = new Uint8Array(data.buffer);\n' +
        '   }\n' +
        '   var data32 = SDL2.data32;\n' +
        '   num = data32.length;\n' +
        '   data32.set(HEAP32.subarray(src, src + num));\n' +
        '   var data8 = SDL2.data8;\n' +
        '   var i = 3;\n' +
        '   var j = i + 4 * num;\n' +
        '   if (num % 8 == 0) {\n' +
        '    while (i < j) {\n' +
        '     data8[i] = 255;\n' +
        '     i = i + 4 | 0;\n' +
        '     data8[i] = 255;\n' +
        '     i = i + 4 | 0;\n' +
        '     data8[i] = 255;\n' +
        '     i = i + 4 | 0;\n' +
        '     data8[i] = 255;\n' +
        '     i = i + 4 | 0;\n' +
        '     data8[i] = 255;\n' +
        '     i = i + 4 | 0;\n' +
        '     data8[i] = 255;\n' +
        '     i = i + 4 | 0;\n' +
        '     data8[i] = 255;\n' +
        '     i = i + 4 | 0;\n' +
        '     data8[i] = 255;\n' +
        '     i = i + 4 | 0;\n' +
        '    }\n' +
        '   } else {\n' +
        '    while (i < j) {\n' +
        '     data8[i] = 255;\n' +
        '     i = i + 4 | 0;\n' +
        '    }\n' +
        '   }\n' +
        '  }\n' +
        '  SDL2.ctx.putImageData(SDL2.image, 0, 0);\n' +
        '  return 0;',
        'if (SDL2.data32Data !== data) {\n' +
        '    SDL2.data32 = new Int32Array(data.buffer);\n' +
        '    SDL2.data32Data = data;\n' +
        '    SDL2.__doomHeapSrc = null;\n' +
        '   }\n' +
        '   var data32 = SDL2.data32;\n' +
        '   num = data32.length;\n' +
        '   if (SDL2.__doomHeapSrc !== src) {\n' +
        '    SDL2.__doomHeapView = HEAP32.subarray(src, src + num);\n' +
        '    SDL2.__doomHeapSrc = src;\n' +
        '   }\n' +
        '   // Bulk typed-array copy; opaque 2d context — skip per-pixel alpha.\n' +
        '   data32.set(SDL2.__doomHeapView);\n' +
        '  }\n' +
        '  var __t0 = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();\n' +
        '  SDL2.ctx.putImageData(SDL2.image, 0, 0);\n' +
        '  var __t1 = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();\n' +
        '  Module.__doomBlitCount = (Module.__doomBlitCount|0) + 1;\n' +
        '  Module.__doomLastBlitMs = (__t1 - __t0) | 0;\n' +
        '  return 0;'
      );
      if (patchedSource !== beforeBlit) {
        self.logLine('patched SDL blit → cached views, no alpha fill');
      } else {
        self.logLine('WARN: SDL blit patch missed');
      }

      // Cap virtual time so a slow asm.js frame cannot spiral (TryRunTics
      // catching up many 28ms tics when wall-clock already advanced 300ms+).
      const beforeClock = patchedSource;
      patchedSource = patchedSource.replace(
        '} else _emscripten_get_now = function() {\n return performance.now();\n};',
        '} else _emscripten_get_now = function() {\n' +
        '  return (typeof Module !== "undefined" && Module.__doomNow)\n' +
        '    ? Module.__doomNow() : performance.now();\n' +
        '};'
      );
      patchedSource = patchedSource.replace(
        'function _gettimeofday(ptr) {\n var now = Date.now();',
        'function _gettimeofday(ptr) {\n' +
        ' var now = (typeof Module !== "undefined" && Module.__doomWall)\n' +
        '  ? Module.__doomWall() : Date.now();'
      );
      patchedSource = patchedSource.replace(
        'function _clock_gettime(clk_id, tp) {\n var now;\n if (clk_id === 0) {\n  now = Date.now();',
        'function _clock_gettime(clk_id, tp) {\n var now;\n if (clk_id === 0) {\n' +
        '  now = (typeof Module !== "undefined" && Module.__doomWall)\n' +
        '   ? Module.__doomWall() : Date.now();'
      );
      if (patchedSource !== beforeClock) {
        self.logLine('patched clocks → capped virtual time');
      } else {
        self.logLine('WARN: clock cap patch missed');
      }

      // Right before run(): timeout rAF + kick helper (used only if the engine
      // scheduler stalls — continuous external pumping caused black frames).
      const beforeRun = patchedSource;
      patchedSource = patchedSource.replace(
        /\nrun\(\);\s*$/,
        '\n' +
        'Browser.requestAnimationFrame = function(func) { setTimeout(func, ' + FRAME_MS + '); };\n' +
        'Module.__doomBlitCount = 0;\n' +
        'Module.__doomInlined = true;\n' +
        '(function() {\n' +
        '  var virt = 0;\n' +
        '  var last = (typeof performance !== "undefined" && performance.now)\n' +
        '    ? performance.now() : Date.now();\n' +
        '  var origin = Date.now();\n' +
        '  var maxStep = 28;\n' + // one Doom tic @ 35Hz
        '  Module.__doomNow = function() {\n' +
        '    var wall = (typeof performance !== "undefined" && performance.now)\n' +
        '      ? performance.now() : Date.now();\n' +
        '    var dt = wall - last;\n' +
        '    last = wall;\n' +
        '    if (dt < 0) dt = 0;\n' +
        '    if (dt > maxStep) dt = maxStep;\n' +
        '    virt += dt;\n' +
        '    return virt;\n' +
        '  };\n' +
        '  Module.__doomWall = function() { return origin + Module.__doomNow(); };\n' +
        '})();\n' +
        'Module.__doomKick = function() {\n' +
        '  try {\n' +
        '    if (ABORT) return;\n' +
        '    if (Browser && Browser.mainLoop && typeof Browser.mainLoop.runner === "function") {\n' +
        '      Browser.mainLoop.runner();\n' +
        '    }\n' +
        '  } catch (e) { try { console.log("doom kick error", e); } catch (e2) {} }\n' +
        '};\n' +
        'run();\n'
      );
      if (patchedSource !== beforeRun) {
        self.logLine('injected ' + TARGET_FPS + 'fps kick before run()');
      } else {
        self.logLine('WARN: could not inject before run()');
      }

      // Global eval so `var Module` reuses our config (require() would shadow it).
      try {
        (0, eval)(patchedSource);
      } catch (evalErr) {
        finish(new Error(
          'Engine script crashed:\n' +
          (evalErr && (evalErr as any).stack ? (evalErr as any).stack : String(evalErr)) +
          '\n\n' + self.recentLog()
        ));
        return;
      }
      // Release patched glue source (can be large after string copies).
      patchedSource = '';

      try { self.startMainLoopPump(); } catch (e) { /* no-op */ }

      setTimeout(() => {
        if (!settled && !self.cleaned) {
          finish(new Error(
            'Timed out starting Doom.\n\nLast engine output:\n' + self.recentLog()
          ));
        }
      }, FIRST_FRAME_TIMEOUT_MS + (useAsmJs ? 15000 : 5000));
    } catch (err) {
      finish(err);
    }
  }

  public cleanup (): void {
    if (this.cleaned) { return; }
    this.cleaned = true;

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.loopPumpTimer) {
      clearInterval(this.loopPumpTimer);
      this.loopPumpTimer = null;
    }

    this.releaseAllKeys();
    this.restoreProcessExit();

    if (this.overlay) {
      this.overlay.removeEventListener('pointerdown', this.boundPointerDown, false);
      this.overlay.removeEventListener('pointermove', this.boundPointerMove, false);
      this.overlay.removeEventListener('pointerup', this.boundPointerUp, false);
      this.overlay.removeEventListener('pointercancel', this.boundPointerCancel, false);
    }

    for (const id in this.pointers) {
      if (this.pointers.hasOwnProperty(id) && this.pointers[id].pulseTimer) {
        clearTimeout(this.pointers[id].pulseTimer);
      }
    }
    this.pointers = {};

    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
    this.canvas = null;
    this.overlay = null;
    this.fpsHud = null;

    try {
      const g: any = (typeof window !== 'undefined') ? window : global;
      g.Module = null;
      try { (global as any).Module = null; } catch (e2) { /* no-op */ }
    } catch (e) { /* no-op */ }
  }

  /**
   * Let the engine's own setTimeout scheduler drive frames.
   * Only kick if SDL blits stall (keeps us from fighting the engine).
   */
  private startMainLoopPump (): void {
    const self = this;
    let lastBlit = 0;

    // A few nudges in case the first schedule was lost.
    const nudge = () => {
      if (self.cleaned) { return; }
      try {
        const g: any = (typeof window !== 'undefined') ? window : global;
        const mod = g.Module || (global as any).Module;
        if (mod && typeof mod.__doomKick === 'function') {
          mod.__doomKick();
        }
      } catch (e) { /* no-op */ }
    };
    setTimeout(nudge, 0);
    setTimeout(nudge, 50);
    setTimeout(nudge, 200);

    this.loopPumpTimer = setInterval(() => {
      if (self.cleaned || self.pumpBusy) { return; }
      try {
        const g: any = (typeof window !== 'undefined') ? window : global;
        const mod = g.Module || (global as any).Module;
        const blitCount = mod && mod.__doomBlitCount ? (mod.__doomBlitCount | 0) : 0;
        if (blitCount !== lastBlit) {
          lastBlit = blitCount;
          return; // engine is painting on its own
        }
        // Stalled — kick once.
        self.pumpBusy = true;
        if (mod && typeof mod.__doomKick === 'function') {
          mod.__doomKick();
        }
        self.pumpBusy = false;
      } catch (e) {
        self.pumpBusy = false;
      }
    }, 100);
    this.logLine('main loop watchdog (engine-driven, kick on stall)');
  }

  private noteFrame (): void {
    this.fpsFrames++;
    const now = Date.now();
    if (!this.fpsWindowStart) {
      this.fpsWindowStart = now;
      return;
    }
    const elapsed = now - this.fpsWindowStart;
    if (elapsed >= 500) {
      const fps = Math.round((this.fpsFrames * 1000) / elapsed);
      let blitDelta = 0;
      let inl = '';
      let blitMs = '';
      try {
        const g: any = (typeof window !== 'undefined') ? window : global;
        const mod = g.Module || (global as any).Module;
        const blitCount = mod && mod.__doomBlitCount ? (mod.__doomBlitCount | 0) : 0;
        blitDelta = blitCount - this.lastBlitCount;
        this.lastBlitCount = blitCount;
        if (mod && mod.__doomInlined) { inl = ' inl'; }
        if (mod && mod.__doomLastBlitMs != null) { blitMs = ' ' + (mod.__doomLastBlitMs | 0) + 'ms'; }
        if (mod && mod.__doomRSkip != null) { inl += ' rs' + (mod.__doomRSkip | 0); }
      } catch (e) { /* no-op */ }
      // Do NOT call getImageData here — it syncs the canvas and tanks FPS.
      const px = blitDelta > 0 ? 'OK' : 'BLK';
      if (this.fpsHud) {
        this.fpsHud.textContent = fps + ' FPS  blit:' + blitDelta + blitMs + inl + '  px:' + px;
        this.fpsHud.style.color = px === 'OK'
          ? (fps >= 20 ? '#7CFF6B' : (fps >= 10 ? '#FFE66B' : '#FF6B6B'))
          : '#FF6B6B';
      }
      this.fpsFrames = 0;
      this.fpsWindowStart = now;
    }
  }

  private waitForFirstFrame (finish: (err?: any) => void, getAbort: () => any): void {
    const self = this;
    const started = Date.now();
    let madeClear = false;

    this.pollTimer = setInterval(() => {
      if (self.cleaned) {
        clearInterval(self.pollTimer);
        self.pollTimer = null;
        return;
      }

      const aborted = getAbort();
      if (aborted) {
        clearInterval(self.pollTimer);
        self.pollTimer = null;
        finish(new Error('Doom aborted:\n' + aborted + '\n\n' + self.recentLog()));
        return;
      }

      // After a couple seconds, make the loading overlay translucent so we can
      // see whether the game is actually drawing underneath.
      if (!madeClear && Date.now() - started > 2000) {
        madeClear = true;
        try {
          const el = document.getElementById('doom-status');
          if (el) {
            el.style.background = 'rgba(10,10,10,0.45)';
          }
        } catch (e) { /* no-op */ }
        self.progress(
          'Waiting for first frame…\n(you should see the game through this)',
          self.recentLog()
        );
      }

      if (self.canvasHasContent()) {
        clearInterval(self.pollTimer);
        self.pollTimer = null;
        finish();
        return;
      }

      // Do NOT treat empty SDL ImageData / main-loop-alive as success — that
      // dismissed the overlay onto a black canvas while the loop still ticked.

      if (Date.now() - started > FIRST_FRAME_TIMEOUT_MS) {
        clearInterval(self.pollTimer);
        self.pollTimer = null;
        finish(new Error(
          'Doom stayed black — no frames rendered.\n\nLast engine output:\n' +
          self.recentLog()
        ));
      }
    }, POLL_MS);
  }

  private sdlHasBlit (): boolean {
    try {
      const g: any = (typeof window !== 'undefined') ? window : global;
      const mod = g.Module || (global as any).Module;
      return !!(mod && mod.SDL2 && mod.SDL2.ctx && mod.SDL2.image);
    } catch (e) {
      return false;
    }
  }

  private mainLoopLooksAlive (): boolean {
    try {
      const g: any = (typeof window !== 'undefined') ? window : global;
      const mod = g.Module || (global as any).Module;
      // Emscripten Browser.mainLoop.running is not always exported; SDL2 image is a good proxy.
      if (mod && mod.SDL2 && mod.SDL2.ctx) { return true; }
      return false;
    } catch (e) {
      return false;
    }
  }

  private canvasHasContent (): boolean {
    try {
      // SDL blits via a 2D context. Sampling mid-frame avoids the letterbox bars.
      const ctx = this.canvas.getContext('2d');
      if (!ctx) { return false; }
      const w = this.canvas.width;
      const h = this.canvas.height;
      const sample = ctx.getImageData((w / 2) | 0, (h / 2) | 0, 8, 8).data;
      let colored = 0;
      for (let i = 0; i < sample.length; i += 4) {
        const r = sample[i];
        const g = sample[i + 1];
        const b = sample[i + 2];
        // Placeholder text is light gray; real doom pixels vary a lot.
        if (r > 20 || g > 20 || b > 20) { colored++; }
      }
      return colored >= 8;
    } catch (err) {
      // WebGL canvas can throw on getImageData — treat as "not ready".
      return false;
    }
  }

  private drawPlaceholder (text: string): void {
    try {
      const ctx = this.canvas.getContext('2d');
      if (!ctx) { return; }
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#e23b2f';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('DOOM', 24, 48);
      ctx.fillStyle = '#cccccc';
      ctx.font = '18px sans-serif';
      ctx.fillText(text, 24, 88);
      ctx.fillText('Swipe down to exit', 24, 120);
    } catch (e) { /* no-op */ }
  }

  private logLine (line: string): void {
    const trimmed = String(line || '').trim();
    if (!trimmed) { return; }
    this.engineLog.push(trimmed);
    if (this.engineLog.length > 80) {
      this.engineLog = this.engineLog.slice(-80);
    }
  }

  private recentLog (): string {
    return this.engineLog.slice(-18).join('\n');
  }

  private onPointerDown (e: any): void {
    if (this.cleaned) { return; }
    e.preventDefault();
    e.stopPropagation();
    const id = e.pointerId != null ? e.pointerId : 1;
    const zone = this.hitZone(e);
    if (zone === 'none') { return; }

    try {
      if (this.overlay.setPointerCapture) {
        this.overlay.setPointerCapture(id);
      }
    } catch (err) { /* no-op */ }

    const pointer: ActivePointer = {
      id: id,
      zone: zone,
      startedAt: Date.now(),
      pulseTimer: null
    };
    this.pointers[id] = pointer;

    if (zone === 'forward') {
      this.toggleForward();
      return;
    }

    if (zone === 'shoot') {
      this.keyDown(KEY.fire);
      return;
    }

    if (zone === 'left' || zone === 'right') {
      const key = zone === 'left' ? KEY.left : KEY.right;
      pointer.pulseTimer = setTimeout(() => {
        pointer.pulseTimer = null;
        if (this.pointers[id] && this.pointers[id].zone === zone) {
          this.keyDown(key);
        }
      }, TAP_MS);
    }
  }

  private onPointerMove (e: any): void {
    e.preventDefault();
  }

  private onPointerUp (e: any): void {
    if (this.cleaned) { return; }
    e.preventDefault();
    const id = e.pointerId != null ? e.pointerId : 1;
    const pointer = this.pointers[id];
    if (!pointer) { return; }

    const heldMs = Date.now() - pointer.startedAt;
    if (pointer.pulseTimer) {
      clearTimeout(pointer.pulseTimer);
      pointer.pulseTimer = null;
    }

    if (pointer.zone === 'shoot') {
      this.keyUp(KEY.fire);
    } else if (pointer.zone === 'left' || pointer.zone === 'right') {
      const key = pointer.zone === 'left' ? KEY.left : KEY.right;
      if (heldMs < TAP_MS) {
        this.keyDown(key);
        setTimeout(() => { this.keyUp(key); }, PULSE_MS);
      } else {
        this.keyUp(key);
      }
    }

    delete this.pointers[id];
  }

  private toggleForward (): void {
    this.movingForward = !this.movingForward;
    if (this.movingForward) {
      this.keyDown(KEY.forward);
    } else {
      this.keyUp(KEY.forward);
    }
  }

  private hitZone (e: any): Zone {
    const rect = this.overlay.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * FACE_W;
    const y = ((e.clientY - rect.top) / rect.height) * FACE_H;

    if (x < SIDE_W) { return 'left'; }
    if (x >= FACE_W - SIDE_W) { return 'right'; }
    if (y < FACE_H / 2) { return 'shoot'; }
    return 'forward';
  }

  private keyDown (spec: { key: string; code: string; keyCode: number }): void {
    if (this.keysDown[spec.code]) { return; }
    this.keysDown[spec.code] = true;
    this.dispatchKey('keydown', spec);
  }

  private keyUp (spec: { key: string; code: string; keyCode: number }): void {
    if (!this.keysDown[spec.code]) { return; }
    this.keysDown[spec.code] = false;
    this.dispatchKey('keyup', spec);
  }

  private releaseAllKeys (): void {
    const specs = [KEY.forward, KEY.left, KEY.right, KEY.fire];
    for (let i = 0; i < specs.length; i++) {
      if (this.keysDown[specs[i].code]) {
        this.keyUp(specs[i]);
      }
    }
    this.movingForward = false;
  }

  private dispatchKey (type: string, spec: { key: string; code: string; keyCode: number }): void {
    const target: any = this.canvas || window;
    const init: any = {
      key: spec.key,
      code: spec.code,
      keyCode: spec.keyCode,
      which: spec.keyCode,
      bubbles: true,
      cancelable: true,
      view: window
    };
    let ev: any;
    try {
      ev = new KeyboardEvent(type, init);
      try {
        Object.defineProperty(ev, 'keyCode', { get: () => spec.keyCode });
        Object.defineProperty(ev, 'which', { get: () => spec.keyCode });
      } catch (e) { /* no-op */ }
    } catch (err) {
      ev = document.createEvent('Event');
      ev.initEvent(type, true, true);
      ev.keyCode = spec.keyCode;
      ev.which = spec.keyCode;
      ev.key = spec.key;
      ev.code = spec.code;
    }
    try {
      target.dispatchEvent(ev);
    } catch (e) { /* no-op */ }
    if (target !== window) {
      try { window.dispatchEvent(ev); } catch (e2) { /* no-op */ }
    }
  }

  private resolveAssetPath (relPath: string): string {
    try {
      const PathUtils: any = (jibo as any).utils && (jibo as any).utils.PathUtils;
      if (PathUtils && typeof PathUtils.getAssetUri === 'function') {
        const uri = PathUtils.getAssetUri(relPath, this.assetPack);
        if (uri) {
          return String(uri).replace(/^file:\/\//, '');
        }
      }
    } catch (err) { /* no-op */ }

    try {
      const path = require('path');
      const base = this.rootPath || path.join(__dirname, '..');
      return path.join(base, relPath);
    } catch (err) {
      return relPath;
    }
  }

  private ensureBrowserGlobals (): void {
    try {
      const g0: any = (typeof window !== 'undefined') ? window : global;
      if (typeof (g0 as any).screen === 'undefined') {
        (g0 as any).screen = { width: FACE_W, height: FACE_H, availWidth: FACE_W, availHeight: FACE_H };
      }
      if (typeof g0.innerWidth === 'undefined') { g0.innerWidth = FACE_W; }
      if (typeof g0.innerHeight === 'undefined') { g0.innerHeight = FACE_H; }
    } catch (e) { /* no-op */ }
  }



  private blockProcessExit (): void {
    try {
      if (typeof process === 'undefined' || typeof process.exit !== 'function') { return; }
      if (this.originalProcessExit) { return; }
      this.originalProcessExit = process.exit;
      process.exit = ((code?: number) => {
        this.logLine('blocked process.exit(' + code + ')');
      }) as any;
    } catch (err) { /* no-op */ }
  }

  private restoreProcessExit (): void {
    try {
      if (this.originalProcessExit && typeof process !== 'undefined') {
        process.exit = this.originalProcessExit;
      }
    } catch (e) { /* no-op */ }
    this.originalProcessExit = null;
  }

  private applyStyle (el: HTMLElement, props: { [k: string]: string }): void {
    for (const key in props) {
      if (props.hasOwnProperty(key)) {
        (el.style as any)[key] = props[key];
      }
    }
  }
}
