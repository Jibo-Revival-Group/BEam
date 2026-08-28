#!/bin/sh
set -e
clear

CREDS_FILE="/var/jibo/credentials.json"
OTA_ENDPOINT="http://joap.5x1.com:80"

echo "=========================================="
echo "  BEam OTA setup"
echo "=========================================="
echo ""
echo "OTA/loop endpoint: $OTA_ENDPOINT"
echo "Also patches SSM to skip pre-OTA cloud backup."
echo "Safe to re-run (idempotent)."
echo ""

echo "=== Remount filesystem read-write ==="
jibo-mount --rw
echo "Done."
echo ""

echo "=== Point OTA/loop at $OTA_ENDPOINT ==="
if [ ! -f "$CREDS_FILE" ]; then
    echo "WARNING: $CREDS_FILE missing — skipping OTA endpoint (create credentials first)."
else
    python -c "
import json, sys

path = '$CREDS_FILE'
endpoint = '$OTA_ENDPOINT'

with open(path, 'r') as f:
    data = json.load(f)

if not data.get('accessKeyId') or not data.get('secretAccessKey'):
    sys.stderr.write('WARNING: credentials missing keys; refusing to rewrite\n')
    sys.exit(0)

next = {
    'secretAccessKey': data['secretAccessKey'],
    'region': 'api',
    'endpoint': endpoint,
    'accessKeyId': data['accessKeyId']
}

with open(path, 'w') as f:
    json.dump(next, f)
    f.write('\n')
print('endpoint -> ' + endpoint)
"
fi
echo ""

echo "=== Patch SSM to skip pre-OTA backup ==="
python << 'PY'
import os, sys

roots = [
    '/usr/local/bin/jibo-ssm',
    '/opt/jibo/Jibo/jibo-ssm',
]
needle = 'this._backupHelper((bkError, maxError) => {'
marker = "this._doLog('Skipping pre-OTA backup');"
replacement = (
    marker + '\n'
    '            return callback();\n'
    '            ' + needle
)
skip_dirs = set(['node_modules'])
patched = 0
already = 0
searched = []

for root in roots:
    if not os.path.isdir(root):
        continue
    searched.append(root)
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
    sys.stderr.write(
        'WARNING: no SSM _backupIfOTA site found.\n'
        '  looked in: %s\n' % (', '.join(searched) if searched else '(none exist)')
    )
else:
    print('SSM backup skip: patched %d, already %d' % (patched, already))
PY
echo ""

echo "=== Restart SSM ==="
kill -9 $(pgrep -f jibo-ssm) || true
echo "Done."
echo ""
echo "OTA/loop endpoint: $OTA_ENDPOINT"
echo "Watchdog will bring SSM back up in a few seconds."
