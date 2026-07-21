#!/bin/sh

CONFIG_FILE="/usr/local/etc/jibo-jetstream-service.json"

echo "--- Jibo Jetstream Server Configurator ---"
echo "Recommended servers:"
echo "- api.openjibo.com (Recommended) (Paid/Redirects to free)"
echo "- api.5x1.com (Free)"
echo "------------------------------------------"

# 1. Remount filesystem
echo "Remounting as Read-Write..."
jibo-mount --rw

# 2. Get User Input
read -p "Enter Server IP or Domain (e.g., api.5x1.com): " HUB_HOST
read -p "Enter Port (e.g., 443): " HUB_PORT

# 3. Update the JSON file using Python
# We use Python to inject the specific values into the template
echo "Updating $CONFIG_FILE..."

python -c "
import json
import sys

host = '$HUB_HOST'
port = int('$HUB_PORT')

with open('$CONFIG_FILE', 'r') as f:
    data = json.load(f)

# Update the override section
data['HubClient']['override'] = {
    'hub_port': port,
    'hub_hostname': host,
    'entrypoint_hostname': host
}

with open('$CONFIG_FILE', 'w') as f:
    json.dump(data, f, indent=4)
"

# 4. Finalize
echo "Configuration complete."
echo "Restarting jetstream service to apply changes..."
kill -9 $(pgrep -f jibo-jetstream-service)

echo "Done! Jibo is now pointing to $HUB_HOST:$HUB_PORT"
