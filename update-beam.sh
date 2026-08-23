#!/bin/sh
set -e
clear

# OTA update for Skills-root packs via jibo-*-update tools.
# Catalog = credentials.endpoint (public: http://joap.5x1.com:80).
# Usage:
#   ./update-beam.sh                  # check+apply every Skills-root pack with an offer
#   ./update-beam.sh @be/be           # one subsystem
#   ./update-beam.sh --check          # check only (no download/apply)
#   ./update-beam.sh --check jibo-tbd
#
# UPDATE_NOT_FOUND means that pack is already up to date (not an error).
# Music + custom eyes live under /opt/jibo/Knowledge and are not replaced.

FILTER="fcs"
CREDS="/var/jibo/credentials.json"
SKILLS="/opt/jibo/Jibo/Skills"
OTA_DIR="/opt/ota"
KNOWLEDGE_MUSIC="/opt/jibo/Knowledge/jukebox/music"
KNOWLEDGE_BEACON="/opt/jibo/Knowledge/beacon"

CHECK_ONLY=0
SUBSYSTEMS=""

for arg in "$@"; do
    if [ "$arg" = "--check" ] || [ "$arg" = "-n" ]; then
        CHECK_ONLY=1
    else
        SUBSYSTEMS="$SUBSYSTEMS $arg"
    fi
done

echo "=========================================="
echo "  BEam OTA"
echo "=========================================="
echo ""

if [ ! -f "$CREDS" ]; then
    echo "ERROR: credentials missing at $CREDS"
    exit 1
fi

if [ ! -d "$SKILLS" ]; then
    echo "ERROR: $SKILLS not found"
    exit 1
fi

for cmd in jibo-mount jibo-get-update jibo-download-update jibo-apply-update; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "ERROR: $cmd not found on PATH"
        exit 1
    fi
done

echo "=== Remount filesystem read-write ==="
jibo-mount --rw
echo "Done."
echo ""

mkdir -p "$OTA_DIR" "$KNOWLEDGE_MUSIC" "$KNOWLEDGE_BEACON"
chmod 777 /opt/jibo/Knowledge /opt/jibo/Knowledge/jukebox \
  "$KNOWLEDGE_MUSIC" "$KNOWLEDGE_BEACON" 2>/dev/null || true

LIST_FILE="$OTA_DIR/beam-ota-packages.json"
python -c "
import json, os, sys

skills = '$SKILLS'
skip = set(['old-BEer', 'Beam-master', 'BEam-master', 'node_modules'])
wanted ='''$SUBSYSTEMS'''.split()
found = []

def add(dest, fallback_name):
    pkg_path = os.path.join(dest, 'package.json')
    if not os.path.isfile(pkg_path):
        return
    try:
        pkg = json.load(open(pkg_path))
    except Exception:
        return
    subsystem = pkg.get('name') or fallback_name
    found.append({
        'subsystem': subsystem,
        'version': pkg.get('version') or '0.0.0',
        'destination': dest
    })

for name in sorted(os.listdir(skills)):
    if not name or name[0] == '.' or name in skip:
        continue
    full = os.path.join(skills, name)
    if not os.path.isdir(full):
        continue
    if name.startswith('@'):
        try:
            children = os.listdir(full)
        except Exception:
            continue
        for child in sorted(children):
            if not child or child[0] == '.' or child in skip:
                continue
            add(os.path.join(full, child), name + '/' + child)
    else:
        add(full, name)

if wanted:
    found = [p for p in found if p['subsystem'] in wanted]
    missing = [s for s in wanted if s not in [p['subsystem'] for p in found]]
    if missing:
        sys.stderr.write('ERROR: not found under Skills: %s\n' % ', '.join(missing))
        sys.exit(1)

found.sort(key=lambda p: (0 if p['subsystem'] == '@be/be' else 1, p['subsystem']))
json.dump(found, open('$LIST_FILE', 'w'))
print('Discovered %d pack(s)' % len(found))
for p in found:
    print('  %s  v%s' % (p['subsystem'], p['version']))
"

echo ""
echo "Credentials: $CREDS"
echo "Filter:      $FILTER"
if [ "$CHECK_ONLY" = "1" ]; then
    echo "Mode:        check only"
fi
echo ""

python -c "
import json, os, subprocess, sys, re

FILTER = '$FILTER'
CREDS = '$CREDS'
OTA_DIR = '$OTA_DIR'
CHECK_ONLY = '$CHECK_ONLY' == '1'
packages = json.load(open('$LIST_FILE'))

def parse_json(text):
    text = (text or '').strip()
    if not text:
        return None
    try:
        return json.loads(text)
    except Exception:
        for line in reversed(text.splitlines()):
            line = line.strip()
            if line.startswith('{'):
                try:
                    return json.loads(line)
                except Exception:
                    pass
    return None

def is_not_found(blob, combined):
    if blob and isinstance(blob.get('error'), dict):
        err = blob['error']
        if err.get('code') == 'UPDATE_NOT_FOUND' or err.get('statusCode') == 404:
            return True
        if re.search(r'update not found', str(err.get('message') or ''), re.I):
            return True
    if 'UPDATE_NOT_FOUND' in combined:
        return True
    if 'Update not found' in combined and '404' in combined:
        return True
    return False

def safe_tar(subsystem):
    name = subsystem.lstrip('@').replace('/', '-')
    name = re.sub(r'[^A-Za-z0-9._-]+', '-', name)
    return os.path.join(OTA_DIR, name + '.tar')

applied = 0
current = 0
failed = 0

for pkg in packages:
    subsystem = pkg['subsystem']
    version = pkg['version']
    dest = pkg['destination']
    print('=== Check %s (v%s) ===' % (subsystem, version))
    proc = subprocess.Popen(
        ['jibo-get-update',
         '--credentials', CREDS,
         '--subsystem', subsystem,
         '--version', version,
         '--filter', FILTER],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    out, err = proc.communicate()
    def as_text(data):
        if data is None:
            return ''
        if isinstance(data, bytes):
            return data.decode('utf-8', 'replace')
        return data
    out = as_text(out)
    err = as_text(err)
    combined = out + '\n' + err
    blob = parse_json(out) or parse_json(err)

    if is_not_found(blob, combined):
        print('Up to date (UPDATE_NOT_FOUND).')
        print('')
        current += 1
        continue

    if proc.returncode != 0 or not blob or not blob.get('url'):
        print('ERROR: get-update failed for %s' % subsystem)
        sys.stderr.write(combined.strip() + '\n')
        failed += 1
        print('')
        continue

    offer_id = blob.get('_id') or blob.get('id')
    url = blob['url']
    sha = blob['shaHash']
    frm = blob['fromVersion']
    to = blob['toVersion']
    print('Update: %s -> %s' % (frm, to))
    print('Id:     %s' % offer_id)
    print('URL:    %s' % url)

    if CHECK_ONLY:
        print('(check only — not downloading)')
        print('')
        applied += 1  # count as available
        continue

    tar = safe_tar(subsystem)
    print('=== Download %s ===' % tar)
    rc = subprocess.call([
        'jibo-download-update',
        '--id', str(offer_id),
        '--url', url,
        '--destination', tar,
        '--shasum', sha
    ])
    if rc != 0:
        print('ERROR: download failed for %s' % subsystem)
        failed += 1
        print('')
        continue

    print('=== Apply %s -> %s ===' % (subsystem, dest))
    rc = subprocess.call([
        'jibo-apply-update',
        '--source', tar,
        '--subsystem', subsystem,
        '--from', str(frm),
        '--to', str(to),
        '--destination', dest,
        '--filter', FILTER
    ])
    if rc != 0:
        print('ERROR: apply failed for %s' % subsystem)
        failed += 1
        print('')
        continue

    print('Applied %s %s -> %s' % (subsystem, frm, to))
    print('')
    applied += 1

print('------------------------------------------')
if CHECK_ONLY:
    print('Available: %d  Up to date: %d  Failed: %d' % (applied, current, failed))
else:
    print('Applied: %d  Up to date: %d  Failed: %d' % (applied, current, failed))

if failed:
    sys.exit(1)
"

mkdir -p "$KNOWLEDGE_MUSIC" "$KNOWLEDGE_BEACON"
chmod 777 /opt/jibo/Knowledge /opt/jibo/Knowledge/jukebox \
  "$KNOWLEDGE_MUSIC" "$KNOWLEDGE_BEACON" 2>/dev/null || true

echo ""
echo "Done. Knowledge music/eyes were left alone."
if [ "$CHECK_ONLY" != "1" ]; then
    echo "Reboot the robot to finish applying updates."
fi
