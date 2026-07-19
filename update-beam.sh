#!/bin/sh

# 0. Go to skills directory
echo "Going to skills directory..."
cd /opt/jibo/Jibo/Skills/

# 1. Clean up previous attempt artifacts
echo "Cleaning up old temporary files..."
rm -rf Beam-master master.zip

# 2. Reset backup directory
echo "Preparing backup directory..."
rm -rf old-BEer
mkdir old-BEer

# 3. Move existing folders to backup (Excludes the script itself and the backup dir)
echo "Backing up current skills to old-BEer..."
for dir in */; do
    if [ "$dir" != "old-BEer/" ]; then
        mv "$dir" old-BEer/
    fi
done

# 4. Download new repository
echo "Downloading BEam repository..."
wget -q --show-progress https://github.com/Jibo-Revival-Group/Beam/archive/refs/heads/master.zip

# 5. Iterative extraction (Compatible with Python 2.7+)
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

# 6. Move contents to current directory
echo "Deploying new BEam skills..."
mv Beam-master/* .
rm -rf Beam-master master.zip

# 7. Fix permissions (it's ALWAYS THE PERMS!!!!!)
echo "Fixing permissions..."
chmod 777 -R /opt/jibo/Jibo/Skills/

echo "Update complete!"

# 8. Restart the BEam service via SSM
echo "Restarting BEam service via SSM..."

# Terminate the current instance
curl -s -X POST http://localhost:8779/terminate \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-raw '{"command":"@be/be"}'

# Wait a brief moment to ensure process cleanup
sleep 2

# Launch the new instance
curl -s -X POST http://localhost:8779/launch-dev \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-raw '{"command":"@be/be"}'

echo ""
echo "Restart command sent. BEam should be starting now."