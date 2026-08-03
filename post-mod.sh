#!/bin/sh
set -e
clear

JUKEBOX_MUSIC="/opt/jibo/Jibo/Skills/@be/Skills/Jukebox/Music"
JUKEBOX_MUSIC_IN_BE="/opt/jibo/Jibo/Skills/@be/be/skills/jukebox/music"
JUKEBOX_MUSIC_LOWER="/opt/jibo/Jibo/Skills/@be/skills/jukebox/music"
JUKEBOX_MUSIC_LEGACY_NESTED="/opt/jibo/Jibo/Skills/@be/be/node_modules/@be/jukebox/music"
JUKEBOX_MUSIC_LEGACY_SIBLING="/opt/jibo/Jibo/Skills/@be/jukebox/music"
JUKEBOX_MUSIC_LEGACY_ROOT="/opt/jibo/Jibo/Skills/skills/jukebox/music"
JUKEBOX_MUSIC_STASH="/opt/tmp/jukebox-music"
CONFIG_FILE="/usr/local/etc/jibo-jetstream-service.json"
HUB_HOST="api.5x1.com"
HUB_PORT="80"

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
echo "=== Step 3: Clear /opt/tmp ==="
rm -rf /opt/tmp/
# Recreate so BEacon can persist custom eyes across Skills updates.
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

# Stash jukebox library so the update does not wipe user music.
# Prefer a directory that actually has audio — an empty Skills/Jukebox/Music
# must not win over a populated legacy library.
jukebox_has_audio() {
    dir="$1"
    [ -d "$dir" ] || return 1
    find "$dir" -maxdepth 3 -type f \( \
        -iname '*.mp3' -o -iname '*.opus' -o -iname '*.ogg' -o -iname '*.oga' \
    \) 2>/dev/null | head -n 1 | grep -q .
}

JUKEBOX_STASH_FROM=""
for candidate in \
    "$JUKEBOX_MUSIC" \
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

if [ -d "$JUKEBOX_MUSIC_STASH" ]; then
    echo "Restoring jukebox music library..."
    mkdir -p "$(dirname "$JUKEBOX_MUSIC")"
    rm -rf "$JUKEBOX_MUSIC"
    mv "$JUKEBOX_MUSIC_STASH" "$JUKEBOX_MUSIC"
else
    echo "No stashed jukebox music library to restore."
fi

echo "Fixing permissions..."
chmod 777 -R /opt/jibo/Jibo/Skills/
# Jetstream needs to be public
chmod 777 /usr/local/etc/jibo-jetstream-service.json

# BEacon stores custom eyes here so they survive Skills replacement; Be must be able to write.
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
echo "=== Step 6: Set mode to normal ==="
jibo-setmode normal
echo "Done."
echo ""

# ---------------------------------------------------------------------------
echo "=== Step 7: Reboot ==="
echo "Mode change requires a reboot. Rebooting now..."
echo ""
echo ""
echo ""
echo "Wait like 2 minutes while the robot reboots... I'm done here."
reboot
