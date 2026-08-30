#!/bin/sh
set -eu

CA_URL="https://letsencrypt.org/certs/isrgrootx1.pem"
CA="/opt/jibo/openjibo-ca.crt"
CONFIG_FILE="/usr/local/etc/jibo-jetstream-service.json"
CREDS_FILE="/var/jibo/credentials.json"
OTA_ENDPOINT="http://joap.5x1.com:80"

HUB_HOST="api.5x1.com"
HUB_PORT="443"

echo "--- Jibo OpenJibo CA & Server Configurator ---"
echo "Target Hub: $HUB_HOST:$HUB_PORT"
echo "OTA/loop endpoint: $OTA_ENDPOINT"
echo "---------------------------------------------"

# 1. Remount filesystems as Read-Write
mount -o remount,rw / 2>/dev/null || true
mount -o remount,rw /usr/local 2>/dev/null || true
if command -v jibo-mount >/dev/null 2>&1; then
    jibo-mount --rw 2>/dev/null || true
fi

mkdir -p /opt/jibo /etc/ssl/certs

# 2. Setup TLS Certificate & Patch Node Modules
echo "Downloading and installing ISRG Root X1 certificate..."
curl -k -fsSL "$CA_URL" -o /tmp/isrg-root-x1.pem
grep -q "BEGIN CERTIFICATE" /tmp/isrg-root-x1.pem

cp /tmp/isrg-root-x1.pem "$CA"
chmod 644 "$CA"

# Legacy OpenSSL hash used by Jibo
ln -sf "$CA" /etc/ssl/certs/4042bcee.0

# Add the CA to the system bundle
cat "$CA" >> /etc/ssl/certs/ca-certificates.crt

echo "Patching rejectUnauthorized in node modules..."
for f in \
  /opt/jibo/Jibo/Skills/@be/be/node_modules/@jibo/jibo-server-client/lib/http/node.js \
  /opt/jibo/Jibo/Skills/oobe-config/node_modules/@jibo/jibo-server-client/lib/http/node.js \
  /usr/local/bin/jibo-ssm/node_modules/@jibo/jibo-server-client/lib/http/node.js \
  /usr/lib/node_modules/@jibo/jibo-server-client/lib/http/node.js
do
    if [ -f "$f" ]; then
        if python - "$f" <<'PY'
import sys

path = sys.argv[1]
with open(path, 'r+') as f:
    text = f.read()
    patched = text.replace(
        'rejectUnauthorized: true',
        'rejectUnauthorized: false'
    )
    if patched == text:
        if 'rejectUnauthorized: false' in text:
            raise SystemExit(0)
        raise SystemExit('target text not found')
    f.seek(0)
    f.write(patched)
    f.truncate()
PY
        then
            echo "Patched: $f"
        else
            echo "ERROR: could not patch $f." >&2
            exit 1
        fi
    fi
done

# 3. Update Jetstream Service Configuration
echo "Updating $CONFIG_FILE to point to $HUB_HOST:$HUB_PORT..."
python -c "
import json
import sys

host = '$HUB_HOST'
port = int('$HUB_PORT')

try:
    with open('$CONFIG_FILE', 'r') as f:
        data = json.load(f)

    if 'HubClient' not in data:
        data['HubClient'] = {}

    data['HubClient']['override'] = {
        'hub_port': port,
        'hub_hostname': host,
        'entrypoint_hostname': host
    }

    with open('$CONFIG_FILE', 'w') as f:
        json.dump(data, f, indent=4)
    print('Jetstream config updated successfully.')
except Exception as e:
    sys.stderr.write('ERROR updating config file: ' + str(e) + '\n')
    sys.exit(1)
"

chmod 777 "$CONFIG_FILE" 2>/dev/null || true

# 4. Point OTA/loop credentials at JOAP
echo "Pointing OTA/loop at $OTA_ENDPOINT..."
if [ ! -f "$CREDS_FILE" ]; then
    echo "WARNING: $CREDS_FILE missing — skipping OTA endpoint adjustment."
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

next_creds = {
    'secretAccessKey': data['secretAccessKey'],
    'region': 'api',
    'endpoint': endpoint,
    'accessKeyId': data['accessKeyId']
}

with open(path, 'w') as f:
    json.dump(next_creds, f)
    f.write('\n')
print('endpoint -> ' + endpoint)
"
fi

# 5. Skip SSM pre-OTA cloud backup
echo "Patching SSM to skip pre-OTA backup..."
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

# 6. Finalize & Restart Services
echo "Restarting services to apply changes..."
kill -9 $(pgrep -f jibo-jetstream-service) 2>/dev/null || true
kill -9 $(pgrep -f jibo-ssm) 2>/dev/null || true

echo "All configurations complete! Jibo is pointed to $HUB_HOST:$HUB_PORT."