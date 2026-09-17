'use strict';

/**
 * Loop / People panel — local Knowledge Base loop roster management.
 *
 * BEacon owns household CRUD (add / rename / remove / profile photo).
 * Phonetic-name edits still go through jibo.kb.loop.setPhoneticName so SSM
 * keeps cloud enrollment in sync. BEefy recognizes people from
 * runtime.loop.users on each speech turn, not from portal CRUD.
 */

const fs = require('fs');
const paths = require('./paths');

const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

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

function isRobotMember (looper) {
    const data = looper.data || {};
    return !!looper.isJibo || !data.firstName || data.type === 'robot';
}

function isOwnerMember (looper) {
    const data = looper.data || {};
    return data.type === 'owner';
}

function canEditMember (looper) {
    return !isRobotMember(looper);
}

function canRemoveMember (looper) {
    return !isRobotMember(looper) && !isOwnerMember(looper);
}

function canSetOwner (looper) {
    return !isRobotMember(looper) && !isOwnerMember(looper);
}

function mapMember (looper) {
    const data = looper.data || {};
    const enrolled = data.enrolled || {};
    const photo = photoPathFor(looper);
    const id = looper.id || looper._id;
    return {
        id: id,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        gender: data.gender || null,
        nickName: data.nickName || data.nickname || null,
        phoneticName: data.phoneticName || null,
        writtenName: typeof looper.getWrittenName === 'function' ? looper.getWrittenName() : (data.nickName || data.firstName || 'Unknown'),
        isJibo: isRobotMember(looper),
        type: data.type || null,
        status: data.status || null,
        accountId: data.accountId || null,
        enrolled: {
            face: !!(enrolled.face),
            voice: !!(enrolled.voice)
        },
        hasPhoto: !!photo,
        photoUrl: photo ? ('/api/people/photo?id=' + encodeURIComponent(id)) : null,
        canEdit: canEditMember(looper),
        canRemove: canRemoveMember(looper),
        canSetOwner: canSetOwner(looper)
    };
}

function loadRootAndLoop (jibo) {
    return Promise.all([
        asPromise((cb) => jibo.kb.loop.loadRoot(cb)),
        asPromise((cb) => jibo.kb.loop.loadLoop(cb))
    ]);
}

function list () {
    const jibo = ensureRobot();
    return jibo.kb.onInit().then(() => {
        return loadRootAndLoop(jibo).then((results) => {
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

function getUserNode (jibo, memberId) {
    return asPromise((cb) => jibo.kb.loop.getUserNodeById(memberId, cb)).then((looper) => {
        if (!looper) throw fail('Loop member not found.', 404);
        return looper;
    });
}

function normalizeName (value) {
    if (value == null) return null;
    const trimmed = String(value).trim();
    return trimmed.length ? trimmed : null;
}

function normalizeGender (value) {
    if (value == null || value === '') return 'unknown';
    const gender = String(value).trim().toLowerCase();
    if (gender === 'male' || gender === 'female' || gender === 'unknown' || gender === 'other') {
        return gender;
    }
    return 'unknown';
}

function addMember (fields) {
    const firstName = normalizeName(fields && fields.firstName);
    if (!firstName) throw fail('firstName is required.', 400);
    const lastName = normalizeName(fields && fields.lastName);
    const gender = normalizeGender(fields && fields.gender);
    const phoneticName = normalizeName(fields && fields.phoneticName);

    const jibo = ensureRobot();
    return jibo.kb.onInit().then(() => {
        return asPromise((cb) => jibo.kb.loop.loadRoot(cb)).then((root) => {
            if (!root) throw fail('Loop root is unavailable.', 503);
            // UserNode.createNode('user', data) treats data as nodeType; create then assign.
            const node = jibo.kb.loop.createNode('user');
            node.type = 'user';
            node.data = {
                firstName: firstName,
                lastName: lastName,
                gender: gender,
                type: 'member',
                status: 'accepted',
                enrolled: { face: false, voice: false }
            };
            if (phoneticName) {
                node.data.phoneticName = phoneticName;
            }
            root.addEdges(node, 'user');
            return asPromise((cb) => node.save(cb)).then(() => {
                return asPromise((cb) => root.save(cb));
            }).then(() => list());
        });
    });
}

function updateMember (memberId, fields) {
    if (!memberId) throw fail('memberId is required.', 400);
    const jibo = ensureRobot();
    return jibo.kb.onInit().then(() => {
        return getUserNode(jibo, memberId).then((looper) => {
            if (!canEditMember(looper)) {
                throw fail('The robot member cannot be edited here.', 400);
            }
            const data = looper.data || (looper.data = {});
            if (fields && Object.prototype.hasOwnProperty.call(fields, 'firstName')) {
                const firstName = normalizeName(fields.firstName);
                if (!firstName) throw fail('firstName cannot be blank.', 400);
                data.firstName = firstName;
            }
            if (fields && Object.prototype.hasOwnProperty.call(fields, 'lastName')) {
                data.lastName = normalizeName(fields.lastName);
            }
            if (fields && Object.prototype.hasOwnProperty.call(fields, 'gender')) {
                data.gender = normalizeGender(fields.gender);
            }
            if (fields && Object.prototype.hasOwnProperty.call(fields, 'phoneticName')) {
                data.phoneticName = normalizeName(fields.phoneticName) || '';
            }
            return asPromise((cb) => looper.save(cb)).then(() => {
                // Mirror phonetic edits through SSM so cloud enrollment stays aligned.
                if (fields && Object.prototype.hasOwnProperty.call(fields, 'phoneticName')) {
                    return asPromise((cb) => {
                        jibo.kb.loop.setPhoneticName(memberId, data.phoneticName || '', cb);
                    }).catch(() => null);
                }
                return null;
            }).then(() => list());
        });
    });
}

function removePhotoAssets (looper) {
    const assets = (looper.getAssets && looper.getAssets('photo')) || [];
    if (!assets.length) {
        return Promise.resolve();
    }
    let chain = Promise.resolve();
    assets.forEach((asset) => {
        chain = chain.then(() => asPromise((cb) => looper.removeAsset(asset, cb)));
    });
    return chain;
}

function removeMember (memberId) {
    if (!memberId) throw fail('memberId is required.', 400);
    const jibo = ensureRobot();
    return jibo.kb.onInit().then(() => {
        return Promise.all([
            asPromise((cb) => jibo.kb.loop.loadRoot(cb)),
            getUserNode(jibo, memberId)
        ]).then((results) => {
            const root = results[0];
            const looper = results[1];
            if (!root) throw fail('Loop root is unavailable.', 503);
            if (!canRemoveMember(looper)) {
                throw fail('Owner and robot members cannot be removed.', 400);
            }
            looper.data = looper.data || {};
            looper.data.status = 'removed';
            return removePhotoAssets(looper).then(() => {
                return asPromise((cb) => looper.save(cb));
            }).then(() => {
                root.removeEdges(looper, 'user');
                return asPromise((cb) => root.save(cb));
            }).then(() => list());
        });
    });
}

function setOwner (memberId) {
    if (!memberId) throw fail('memberId is required.', 400);
    const jibo = ensureRobot();
    return jibo.kb.onInit().then(() => {
        return Promise.all([
            asPromise((cb) => jibo.kb.loop.loadRoot(cb)),
            asPromise((cb) => jibo.kb.loop.loadLoop(cb)),
            getUserNode(jibo, memberId)
        ]).then((results) => {
            const root = results[0];
            const loop = results[1] || [];
            const target = results[2];
            if (!root) throw fail('Loop root is unavailable.', 503);
            if (isRobotMember(target)) {
                throw fail('The robot cannot be the loop owner.', 400);
            }
            const status = (target.data && target.data.status) || '';
            if (status === 'removed' || status === 'declined') {
                throw fail('That member is not an active loop member.', 400);
            }
            if (isOwnerMember(target)) {
                return list();
            }

            const ownerEdgeIds = root.getEdges('owner') || [];
            const demote = [];
            loop.forEach((looper) => {
                if (isOwnerMember(looper) || ownerEdgeIds.indexOf(looper.id || looper._id) !== -1) {
                    if ((looper.id || looper._id) !== (target.id || target._id)) {
                        demote.push(looper);
                    }
                }
            });

            demote.forEach((looper) => {
                looper.data = looper.data || {};
                looper.data.type = 'member';
            });
            target.data = target.data || {};
            target.data.type = 'owner';

            root.clearEdges('owner');
            root.addEdges(target, 'owner');
            if (target.data.accountId) {
                root.data = root.data || {};
                root.data.owner = target.data.accountId;
            }

            let chain = Promise.resolve();
            demote.forEach((looper) => {
                chain = chain.then(() => asPromise((cb) => looper.save(cb)));
            });
            return chain
                .then(() => asPromise((cb) => target.save(cb)))
                .then(() => asPromise((cb) => root.save(cb)))
                .then(() => list());
        });
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
        return getUserNode(jibo, memberId).then((looper) => {
            const filePath = photoPathFor(looper);
            if (!filePath) throw fail('No photo for this member.', 404);
            if (!paths.isFile(filePath) && !fs.existsSync(filePath)) {
                throw fail('Photo file is missing on disk.', 404);
            }
            return filePath;
        });
    });
}

function setPhoto (memberId, buffer) {
    if (!memberId) throw fail('memberId is required.', 400);
    if (!buffer || !buffer.length) throw fail('Photo body is required.', 400);
    if (buffer.length > PHOTO_MAX_BYTES) {
        throw fail('Photo is larger than the 2 MB limit.', 413);
    }
    const jibo = ensureRobot();
    return jibo.kb.onInit().then(() => {
        return getUserNode(jibo, memberId).then((looper) => {
            if (!canEditMember(looper)) {
                throw fail('The robot member cannot have a photo set here.', 400);
            }
            return removePhotoAssets(looper).then(() => {
                // Local file only — do not set data.photoUrl (LoopManager would HTTP-fetch it).
                if (looper.data && looper.data.photoUrl) {
                    delete looper.data.photoUrl;
                }
                const asset = looper.createAsset('photo', 'jpg');
                return asPromise((cb) => asset.save(buffer, cb)).then(() => {
                    return asPromise((cb) => looper.save(cb));
                });
            }).then(() => list());
        });
    });
}

function clearPhoto (memberId) {
    if (!memberId) throw fail('memberId is required.', 400);
    const jibo = ensureRobot();
    return jibo.kb.onInit().then(() => {
        return getUserNode(jibo, memberId).then((looper) => {
            if (!canEditMember(looper)) {
                throw fail('The robot member photo cannot be cleared here.', 400);
            }
            return removePhotoAssets(looper).then(() => {
                if (looper.data && looper.data.photoUrl) {
                    delete looper.data.photoUrl;
                }
                return asPromise((cb) => looper.save(cb));
            }).then(() => list());
        });
    });
}

module.exports = {
    list,
    findMember,
    addMember,
    updateMember,
    removeMember,
    setOwner,
    setPhoneticName,
    resolvePhotoFile,
    setPhoto,
    clearPhoto,
    PHOTO_MAX_BYTES
};
