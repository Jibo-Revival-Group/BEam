#!/bin/sh
set -e
clear

echo "=========================================="
echo "  Skip SSM pre-OTA backup"
echo "=========================================="
echo ""
echo "Patches jibo-ssm so POST /ota-update does not"
echo "run systemManager.backup() before download."
echo "Safe to re-run (idempotent)."
echo ""

echo "=== Remount filesystem read-write ==="
jibo-mount --rw
echo "Done."
echo ""

echo "=== Patch SSM ==="
python << 'PY'
import os, sys

root = '/opt/jibo'
needle = 'this._backupHelper((bkError, maxError) => {'
marker = "this._doLog('Skipping pre-OTA backup');"
replacement = (
    marker + '\n'
    '            return callback();\n'
    '            ' + needle
)
skip_dirs = set([
    'Skills', 'Knowledge', 'old-BEer', 'BEam-master', 'Beam-master', 'node_modules'
])
patched = 0
already = 0

for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d not in skip_dirs]
    for name in filenames:
        if not name.endswith('.js'):
            continue
        path = os.path.join(dirpath, name)
        try:
            with open(path, 'r') as f:
                text = f.read()
        except Exception:
            continue
        if needle not in text:
            continue
        if marker in text:
            already += 1
            print('already patched: ' + path)
            continue
        text = text.replace(needle, replacement)
        try:
            with open(path, 'w') as f:
                f.write(text)
        except Exception as e:
            sys.stderr.write('WARNING: could not write ' + path + ': ' + str(e) + '\n')
            continue
        patched += 1
        print('patched ' + path)

if patched == 0 and already == 0:
    sys.stderr.write('WARNING: no SSM _backupIfOTA site found under /opt/jibo\n')
    sys.exit(1)
print('SSM backup skip: patched %d, already %d' % (patched, already))
PY
echo ""

echo "=== Restart SSM so the patch takes effect ==="
kill -9 $(pgrep -f jibo-ssm) || true
echo "Done."
echo ""
echo "Settings / sleep /ota-update will skip the cloud backup stage."
echo "Watchdog will bring SSM back up in a few seconds."
