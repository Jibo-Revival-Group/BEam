'use strict';
// Settings › Storage: one bar over the robot's partitions, from the system manager's storage API.
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const storage = require('../@be/be/beacon/lib/storage');

const GB = 1024 * 1024 * 1024, MB = 1024 * 1024;
const mounts = [
    { name: 'rootfs', path: '/', type: 'rootfs', size: 1 * GB, free: 0.2 * GB, used: 0.7 * GB },
    { name: '/dev/root', path: '/', type: 'ext4', size: 1 * GB, free: 0.2 * GB, used: 0.7 * GB },
    { name: 'devtmpfs', path: '/dev', type: 'devtmpfs', size: 1 * GB, free: 1 * GB, used: 0 },
    { name: 'tmpfs', path: '/tmp', type: 'tmpfs', size: 64 * MB, free: 0, used: 64 * MB },
    { name: '/dev/mmcblk0p4', path: '/usr/local', type: 'ext4', size: 2 * GB, free: 1 * GB, used: 0.8 * GB },
    { name: '/dev/mmcblk0p5', path: '/var', type: 'ext4', size: 0.5 * GB, free: 0.4 * GB, used: 0.1 * GB },
    { name: '/dev/mmcblk0p6', path: '/opt', type: 'ext4', size: 10 * GB, free: 1 * GB, used: 8.5 * GB }
];
const semantic = [
    { type: 'jibo', path: '/opt/jibo/Jibo', size: 2.5 * GB },
    { type: 'knowledge', path: '/opt/jibo/Knowledge', size: 2.7 * GB },
    { type: 'photos', path: '/opt/jibo/Photos', size: 2 * MB },
    { type: 'recordings', path: '/opt/jibo/Recordings', size: 1024 }
];
const s = storage.categorize(mounts, semantic, 25 * MB);
assert.strictEqual(s.used, (0.7 + 0.8 + 0.1 + 8.5) * GB, 'ext4 partitions only, the root filesystem counted once');
assert.strictEqual(s.free, (0.2 + 1 + 0.4 + 1) * GB);
assert.strictEqual(s.total, s.used + s.free, 'reserved ext4 space is not shown as used');
assert.strictEqual(s.photos, 2 * MB + 1024);
assert.strictEqual(s.skills, 25 * MB);
assert.strictEqual(s.knowledge, 2.7 * GB - 25 * MB, 'Knowledge Base excludes custom skills and themes');
assert.strictEqual(s.system + s.photos + s.skills + s.knowledge, s.used, 'the four parts add up to what is used');
assert.strictEqual(storage.categorize(mounts, null, 0).knowledge, 0, 'missing folder sizes leave everything in System');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'storage-'));
try {
    fs.mkdirSync(path.join(dir, 'pack'));
    fs.writeFileSync(path.join(dir, 'pack', 'big.bin'), Buffer.alloc(200 * 1024, 1));
    const bytes = storage.folderBytes(dir);
    assert(bytes >= 200 * 1024 && bytes < 300 * 1024, 'folder size counts allocated blocks: ' + bytes);
    assert.strictEqual(storage.folderBytes(path.join(dir, 'missing')), 0);
} finally { fs.unlinkSync(path.join(dir, 'pack', 'big.bin')); fs.rmdirSync(path.join(dir, 'pack')); fs.rmdirSync(dir); }

assert.strictEqual(storage.formatBytes(1.1 * GB), '1.1 GB');
assert.strictEqual(storage.formatBytes(1.7 * MB), '1.7 MB');
assert.strictEqual(storage.formatBytes(14 * GB), '14 GB');
console.log('Storage breakdown adds up from the system manager API and keeps custom skills and themes out of the Knowledge Base');
