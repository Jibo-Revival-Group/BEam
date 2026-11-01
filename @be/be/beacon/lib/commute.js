'use strict';

/**
 * Commute addresses: the home address (Etc tab) and each person's job (People tab).
 * The cloud geocodes them with TomTom and keeps them per robot, like calendar feeds;
 * the home address also updates Jibo's local home location (town and coordinates).
 */

const calendars = require('./calendars');
const location = require('./location');
const people = require('./people');

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 500;
    return err;
}

function addressText (value) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text || text.length > 300) { throw fail('Enter an address.', 400); }
    return text;
}

function list () {
    return people.list().then(function (snapshot) {
        return calendars.callCloud('GetCommuteAddresses', {}, calendars.robotIdFrom(snapshot));
    });
}

// Adds snapshot.commuteAvailable and member.workAddress to a People snapshot; never fails the page.
function attach (snapshot) {
    if (!snapshot) { return Promise.resolve(snapshot); }
    return Promise.resolve().then(function () {
        return calendars.callCloud('GetCommuteAddresses', {}, calendars.robotIdFrom(snapshot));
    }).then(function (result) {
        const byId = {};
        (result.addresses || []).forEach(function (item) { byId[String(item.memberId)] = item.address; });
        snapshot.commuteAvailable = result.available === true;
        (snapshot.members || []).forEach(function (member) {
            if (!member.isJibo) { member.workAddress = byId[String(member.id)] || null; }
        });
        return snapshot;
    }).catch(function () {
        snapshot.commuteAvailable = false;
        return snapshot;
    });
}

function homeAddress () {
    return list().then(function (result) {
        const home = (result.addresses || []).filter(function (item) { return item.memberId === 'home'; })[0];
        return { available: result.available === true, address: home ? home.address : null };
    }).catch(function () { return { available: false, address: null }; });
}

function setHome (address) {
    const text = addressText(address);
    return people.list().then(function (snapshot) {
        return calendars.callCloud('SetCommuteAddress', {
            address: text,
            timeZone: calendars.homeTimeZone()
        }, calendars.robotIdFrom(snapshot));
    }).then(function (found) {
        return location.applyAddress(found).then(function (saved) {
            return { address: found.address, location: saved.location };
        });
    });
}

function setWork (memberId, address) {
    const text = addressText(address);
    if (!memberId) { return Promise.reject(fail('memberId is required.', 400)); }
    return people.findMember(memberId).then(function (found) {
        const member = found.member;
        if (member.isJibo) { throw fail('The robot does not have a job.', 400); }
        return calendars.callCloud('SetCommuteAddress', {
            memberId: String(memberId),
            address: text,
            memberName: [member.firstName, member.lastName].filter(Boolean).join(' ') || member.writtenName || null
        }, calendars.robotIdFrom(found.snapshot));
    }).then(function () { return people.list(); });
}

function clearWork (memberId) {
    if (!memberId) { return Promise.reject(fail('memberId is required.', 400)); }
    return people.list().then(function (snapshot) {
        return calendars.callCloud('ClearCommuteAddress', { memberId: String(memberId) }, calendars.robotIdFrom(snapshot));
    }).then(function () { return people.list(); });
}

module.exports = { attach: attach, homeAddress: homeAddress, setHome: setHome, setWork: setWork, clearWork: clearWork };
