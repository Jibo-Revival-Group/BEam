#!/bin/sh

# Packages up diagnostics for buildroot (assumes package.json version is set) and uploads it to repository.jibo.com
# Parameter is package.json version; assumes you have cd'd into diagnostics directory
# $1 === version (e.g. 1.0.1)
# $2 === ldap user for uploading to repository.jibo.com


echo "\nZipping diagnostics...\n"
tar -czf ../jibo-diagnostics-skill-$1.tar.gz  . \
    --exclude='jibo-diagnostics/.git' 

echo "\nSaving shasum to ~/Desktop/diag-sha\n"
cd ../
shasum -a 256 jibo-diagnostics-skill-$1.tar.gz > ~/Desktop/diag-sha

echo "\nUploading to repository.jibo.com...\n"
scp jibo-diagnostics-skill-$1.tar.gz $2@repository.jibo.com:/data001/www/sdk/jibo-diagnostics-skill/

echo "\nDone.\n"