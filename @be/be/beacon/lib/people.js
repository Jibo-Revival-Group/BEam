'use strict';

/**
 * Loop / People panel — reads the robot's local Knowledge Base loop roster.
 *
 * Profile photos are read-only here (already synced by LoopManager._syncLoopPhotos).
 * Nickname / phonetic-name edits go through jibo.kb.loop.setPhoneticName which
 * writes through to cloud UpdatePhoneticName.
 */

const fs = require('fs');
const paths = require('./paths');

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 500;
    return err;
}

function ensureRobot () {
    let jibo;
    try {
        jibo = require('jibo');
    } catch (err) {
        throw fail('BEacon is not running inside Be on the robot.', 503);
    }
    if (!jibo.kb || typeof jibo.kb.onInit !== 'function' || typeof jibo.kb.loop !== 'object') {
        throw fail('The local Knowledge Base is unavailable.', 503);
    }
    return jibo;
}

function asPromise (fn) {
    return new Promise((resolve, reject) => {
        try {
            const result = fn((err, value) => {
                if (err) reject(err);
                else resolve(value);
            });
            // Some KB methods return a Promise when no callback is used.
            if (result && typeof result.then === 'function') {
                result.then(resolve, reject);
            }
        } catch (err) {
            reject(err);
        }
    });
}

function photoPathFor (looper) {
    try {
        const assets = looper.getAssets && looper.getAssets('photo');
        if (!assets || !assets.length) return null;
        const url = assets[0].fullFilenameOrURL && assets[0].fullFilenameOrURL();
        if (!url || url.indexOf('http') === 0) return url || null;
        return url;
    } catch (err) {
        return null;
    }
}

function mapMember (looper) {
    const data = looper.data || {};
    const enrolled = data.enrolled || {};
    const photo = photoPathFor(looper);
    return {
        id: looper.id || looper._id,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        nickName: data.nickName || data.nickname || null,
        phoneticName: data.phoneticName || null,
        writtenName: typeof looper.getWrittenName === 'function' ? looper.getWrittenName() : (data.nickName || data.firstName || 'Unknown'),
        isJibo: !!looper.isJibo || !data.firstName,
        type: data.type || null,
        status: data.status || null,
        accountId: data.accountId || null,
        enrolled: {
            face: !!(enrolled.face),
            voice: !!(enrolled.voice)
        },
        hasPhoto: !!photo,
        photoUrl: photo ? ('/api/people/photo?id=' + encodeURIComponent(looper.id || looper._id)) : null
    };
}

function list () {
    const jibo = ensureRobot();
    return jibo.kb.onInit().then(() => {
        return Promise.all([
            asPromise((cb) => jibo.kb.loop.loadRoot(cb)),
            asPromise((cb) => jibo.kb.loop.loadLoop(cb))
        ]).then((results) => {
            const root = results[0];
            const loop = results[1] || [];
            const rootData = (root && root.data) || {};
            return {
                loopId: rootData.id || rootData.loopId || null,
                owner: rootData.owner || null,
                robot: rootData.robot || null,
                lastFullSyncTimestamp: rootData.lastFullSyncTimestamp || null,
                lastFullSyncCredentialsHash: rootData.lastFullSyncCredentialsHash || null,
                lastSyncAttemptTimestamp: rootData.lastSyncAttemptTimestamp || null,
                lastSyncErrorMessage: rootData.lastSyncErrorMessage || null,
                lastCloudMemberCount: (typeof rootData.lastCloudMemberCount === 'number')
                    ? rootData.lastCloudMemberCount
                    : null,
                members: loop.map(mapMember)
            };
        });
    }).catch((err) => {
        if (err && err.status) throw err;
        throw fail(err && err.message ? err.message : 'Could not load the loop.', 503);
    });
}

function findMember (memberId) {
    return list().then((snapshot) => {
        const member = (snapshot.members || []).find((item) => item.id === memberId);
        if (!member) throw fail('Loop member not found.', 404);
        return { snapshot, member };
    });
}

function setPhoneticName (memberId, phoneticName) {
    if (!memberId) throw fail('memberId is required.', 400);
    const value = phoneticName == null ? '' : String(phoneticName);
    const jibo = ensureRobot();
    return jibo.kb.onInit().then(() => {
        return asPromise((cb) => jibo.kb.loop.setPhoneticName(memberId, value, cb));
    }).then(() => list());
}

function resolvePhotoFile (memberId) {
    const jibo = ensureRobot();
    return jibo.kb.onInit().then(() => {
        return asPromise((cb) => jibo.kb.loop.getUserNodeById(memberId, cb));
    }).then((looper) => {
        if (!looper) throw fail('Loop member not found.', 404);
        const filePath = photoPathFor(looper);
        if (!filePath) throw fail('No photo for this member.', 404);
        if (!paths.isFile(filePath) && !fs.existsSync(filePath)) {
            throw fail('Photo file is missing on disk.', 404);
        }
        return filePath;
    });
}

module.exports = {
    list,
    findMember,
    setPhoneticName,
    resolvePhotoFile
};
