'use strict';

/**
 * News topics per person (Personal Reports tab). Every topic is on until someone turns it off;
 * the cloud keeps the turned-off ones per robot, like calendar feeds, and the news briefing
 * uses the speaker's remaining topics.
 */

const calendars = require('./calendars');
const people = require('./people');

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 500;
    return err;
}

// Adds snapshot.newsTopics (null when the cloud is unreachable) and member.disabledNewsTopics.
function attach (snapshot) {
    if (!snapshot) { return Promise.resolve(snapshot); }
    return Promise.resolve().then(function () {
        return calendars.callCloud('GetNewsTopics', {}, calendars.robotIdFrom(snapshot));
    }).then(function (result) {
        const byId = {};
        (result.people || []).forEach(function (item) { byId[String(item.memberId)] = item.disabledTopics || []; });
        snapshot.newsTopics = result.topics || [];
        (snapshot.members || []).forEach(function (member) {
            if (!member.isJibo) { member.disabledNewsTopics = byId[String(member.id)] || []; }
        });
        return snapshot;
    }).catch(function () {
        snapshot.newsTopics = null;
        return snapshot;
    });
}

function set (memberId, disabledTopics) {
    if (!memberId) { return Promise.reject(fail('memberId is required.', 400)); }
    if (!Array.isArray(disabledTopics) || disabledTopics.some(function (topic) { return typeof topic !== 'string'; })) {
        return Promise.reject(fail('disabledTopics must be a list of topics.', 400));
    }
    return people.findMember(memberId).then(function (found) {
        const member = found.member;
        if (member.isJibo) { throw fail('The robot does not have news topics.', 400); }
        return calendars.callCloud('SetNewsTopics', {
            memberId: String(memberId),
            memberName: [member.firstName, member.lastName].filter(Boolean).join(' ') || member.writtenName || null,
            disabledTopics: disabledTopics
        }, calendars.robotIdFrom(found.snapshot));
    }).then(function () { return people.list(); });
}

module.exports = { attach: attach, set: set };
