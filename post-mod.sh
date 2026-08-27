#!/bin/sh
set -e
clear

JUKEBOX_MUSIC="/opt/jibo/Knowledge/jukebox/music"
KNOWLEDGE_BEACON="/opt/jibo/Knowledge/beacon"
CONFIG_FILE="/usr/local/etc/jibo-jetstream-service.json"
HUB_HOST="api.5x1.com"
HUB_PORT="80"
CREDS_FILE="/var/jibo/credentials.json"
OTA_ENDPOINT="http://joap.5x1.com:80"

echo "=========================================="
echo "  BEam post-mod bring-up"
echo "=========================================="
echo ""

# ---------------------------------------------------------------------------
echo "=== Step 1: Remount filesystem read-write ==="
jibo-mount --rw
echo "Done."
echo ""

# ---------------------------------------------------------------------------
echo "=== Step 2: Remove firewall init script ==="
rm -f /etc/init.d/S21firewall
echo "Done."
echo ""

# ---------------------------------------------------------------------------
echo "=== Step 3: Persist user data, then clear /opt/tmp ==="
# Custom eyes + music live under Knowledge (survives Skills OTA and tmp wipes).
# Copy legacy /opt/tmp data into Knowledge before clearing tmp.
mkdir -p /opt/jibo/Knowledge/jukebox/music /opt/jibo/Knowledge/beacon
chmod 777 /opt/jibo/Knowledge /opt/jibo/Knowledge/jukebox \
  /opt/jibo/Knowledge/jukebox/music /opt/jibo/Knowledge/beacon 2>/dev/null || true
if [ -d /opt/tmp/beacon ] && [ ! -f /opt/jibo/Knowledge/beacon/eye/custom.png ]; then
    echo "Migrating custom eye from /opt/tmp/beacon to Knowledge..."
    mkdir -p /opt/jibo/Knowledge/beacon
    cp -a /opt/tmp/beacon/. /opt/jibo/Knowledge/beacon/ 2>/dev/null || true
fi
if [ -d /opt/tmp/jukebox-music ] && \
   ! find /opt/jibo/Knowledge/jukebox/music -maxdepth 3 -type f \( \
       -iname '*.mp3' -o -iname '*.opus' -o -iname '*.ogg' -o -iname '*.oga' \
     \) 2>/dev/null | head -n 1 | grep -q .
then
    echo "Migrating jukebox music from /opt/tmp/jukebox-music to Knowledge..."
    rm -rf /opt/jibo/Knowledge/jukebox/music
    mv /opt/tmp/jukebox-music /opt/jibo/Knowledge/jukebox/music
fi
rm -rf /opt/tmp/
mkdir -p /opt/tmp/beacon
chmod 777 /opt/tmp /opt/tmp/beacon
echo "Done."
echo ""

# ---------------------------------------------------------------------------
echo "=== Step 4: Install BEam ==="

echo "Going to skills directory..."
cd /opt/jibo/Jibo/Skills/

echo "Terminate Be via SSM..."
curl -s -X POST http://localhost:8779/terminate \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-raw '{"command":"@be/be"}'

# Durable library under Knowledge — only stash Skills-tree leftovers.
JUKEBOX_MUSIC="/opt/jibo/Knowledge/jukebox/music"
KNOWLEDGE_BEACON="/opt/jibo/Knowledge/beacon"
JUKEBOX_MUSIC_SKILLS="/opt/jibo/Jibo/Skills/@be/Skills/Jukebox/Music"
JUKEBOX_MUSIC_IN_BE="/opt/jibo/Jibo/Skills/@be/be/skills/jukebox/music"
JUKEBOX_MUSIC_LOWER="/opt/jibo/Jibo/Skills/@be/skills/jukebox/music"
JUKEBOX_MUSIC_LEGACY_NESTED="/opt/jibo/Jibo/Skills/@be/be/node_modules/@be/jukebox/music"
JUKEBOX_MUSIC_LEGACY_SIBLING="/opt/jibo/Jibo/Skills/@be/jukebox/music"
JUKEBOX_MUSIC_LEGACY_ROOT="/opt/jibo/Jibo/Skills/skills/jukebox/music"
JUKEBOX_MUSIC_STASH="/opt/tmp/jukebox-music"

jukebox_has_audio() {
    dir="$1"
    [ -d "$dir" ] || return 1
    find "$dir" -maxdepth 3 -type f \( \
        -iname '*.mp3' -o -iname '*.opus' -o -iname '*.ogg' -o -iname '*.oga' \
    \) 2>/dev/null | head -n 1 | grep -q .
}

JUKEBOX_STASH_FROM=""
if jukebox_has_audio "$JUKEBOX_MUSIC"; then
    echo "Jukebox music already in Knowledge ($JUKEBOX_MUSIC); leaving it alone."
else
    for candidate in \
        "$JUKEBOX_MUSIC_SKILLS" \
        "$JUKEBOX_MUSIC_IN_BE" \
        "$JUKEBOX_MUSIC_LOWER" \
        "$JUKEBOX_MUSIC_LEGACY_ROOT" \
        "$JUKEBOX_MUSIC_LEGACY_SIBLING" \
        "$JUKEBOX_MUSIC_LEGACY_NESTED"
    do
        if jukebox_has_audio "$candidate"; then
            JUKEBOX_STASH_FROM="$candidate"
            break
        fi
    done

    if [ -n "$JUKEBOX_STASH_FROM" ]; then
        echo "Stashing jukebox music library from $JUKEBOX_STASH_FROM to $JUKEBOX_MUSIC_STASH..."
        mkdir -p /opt/tmp
        rm -rf "$JUKEBOX_MUSIC_STASH"
        mv "$JUKEBOX_STASH_FROM" "$JUKEBOX_MUSIC_STASH"
    else
        echo "No existing jukebox music library to stash."
    fi
fi

echo "Cleaning up old temporary files..."
rm -rf Beam-master BEam-master master.zip

echo "Preparing backup directory..."
rm -rf old-BEer
mkdir old-BEer

echo "Backing up current skills to old-BEer..."
for dir in */; do
    if [ "$dir" != "old-BEer/" ]; then
        mv "$dir" old-BEer/
    fi
done

echo "Downloading BEam repository..."
wget -q --show-progress https://github.com/Jibo-Revival-Group/Beam/archive/refs/heads/master.zip

echo "Extracting files (this may take a moment)..."
python -c "
import zipfile, sys
z = zipfile.ZipFile('master.zip')
namelist = z.namelist()
total = float(len(namelist))
for i, name in enumerate(namelist):
    z.extract(name)
    percent = ((i + 1) / total) * 100
    sys.stdout.write('\rProgress: %.1f%%' % percent)
    sys.stdout.flush()
print('\nExtraction complete.')
"

echo "Deploying new BEam skills..."
EXTRACT_DIR=""
if [ -d BEam-master ]; then
    EXTRACT_DIR=BEam-master
elif [ -d Beam-master ]; then
    EXTRACT_DIR=Beam-master
else
    echo "ERROR: extracted BEam directory not found after unzip"
    ls -la
    exit 1
fi
# BusyBox ash leaves unmatched globs literal; move items one by one
for item in "$EXTRACT_DIR"/*; do
    [ -e "$item" ] || continue
    mv "$item" .
done
rm -rf "$EXTRACT_DIR" master.zip

if [ -d "$JUKEBOX_MUSIC_STASH" ] && ! jukebox_has_audio "$JUKEBOX_MUSIC"; then
    echo "Restoring jukebox music library to $JUKEBOX_MUSIC..."
    mkdir -p "$(dirname "$JUKEBOX_MUSIC")"
    rm -rf "$JUKEBOX_MUSIC"
    mv "$JUKEBOX_MUSIC_STASH" "$JUKEBOX_MUSIC"
elif jukebox_has_audio "$JUKEBOX_MUSIC"; then
    echo "Jukebox music already in Knowledge; skipping restore."
    rm -rf "$JUKEBOX_MUSIC_STASH" 2>/dev/null || true
else
    echo "No stashed jukebox music library to restore."
fi

echo "Fixing permissions..."
chmod 777 -R /opt/jibo/Jibo/Skills/
# Jetstream needs to be public
chmod 777 /usr/local/etc/jibo-jetstream-service.json

# Durable user data (music + custom eyes) under Knowledge
mkdir -p "$JUKEBOX_MUSIC" "$KNOWLEDGE_BEACON"
chmod 777 /opt/jibo/Knowledge /opt/jibo/Knowledge/jukebox "$JUKEBOX_MUSIC" "$KNOWLEDGE_BEACON" 2>/dev/null || true
mkdir -p /opt/tmp/beacon
chmod 777 /opt/tmp /opt/tmp/beacon

echo ""
echo "BEam install complete."
echo ""

# ---------------------------------------------------------------------------
echo "=== Step 5: Point jetstream at $HUB_HOST:$HUB_PORT ==="
echo "Updating $CONFIG_FILE..."

python -c "
import json

host = '$HUB_HOST'
port = int('$HUB_PORT')

with open('$CONFIG_FILE', 'r') as f:
    data = json.load(f)

data['HubClient']['override'] = {
    'hub_port': port,
    'hub_hostname': host,
    'entrypoint_hostname': host
}

with open('$CONFIG_FILE', 'w') as f:
    json.dump(data, f, indent=4)
"

echo "Restarting jetstream service to apply changes..."
kill -9 $(pgrep -f jibo-jetstream-service) || true

echo "Jetstream now pointing to $HUB_HOST:$HUB_PORT"
echo ""

# ---------------------------------------------------------------------------
echo "=== Step 6: Point OTA credentials at $OTA_ENDPOINT ==="
if [ ! -f "$CREDS_FILE" ]; then
    echo "WARNING: $CREDS_FILE missing — skipping OTA endpoint (create credentials first)."
else
    echo "Updating endpoint in $CREDS_FILE (keys preserved)..."
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

# ---------------------------------------------------------------------------
echo "=== Step 7: Skip SSM pre-OTA backup (so /ota-update is not gated) ==="
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
else:
    print('SSM backup skip: patched %d, already %d' % (patched, already))
PY
echo ""
echo ""

# ---------------------------------------------------------------------------
echo "=== Step 8: Set mode to normal ==="
jibo-setmode normal
echo "Done."
echo ""

# ---------------------------------------------------------------------------
echo "=== Step 9: Reboot ==="
echo "Mode change requires a reboot. Rebooting now..."
echo ""
echo ""
echo ""
echo "Wait like 2 minutes while the robot reboots... I'm done here."
reboot
