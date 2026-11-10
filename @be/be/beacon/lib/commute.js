'use strict';

/**
 * Commute addresses (Personal Reports tab): each person's home and work or school.
 * The cloud geocodes them with TomTom and keeps them per robot, like calendar feeds.
 * The household home (cloud member "home") is what commutes use for people without
 * their own home, and it also sets Jibo's local home location (town and coordinates).
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

// Adds snapshot.commuteAvailable, member.workAddress and member.homeAddress to a People snapshot; never fails the page.
function attach (snapshot) {
    if (!snapshot) { return Promise.resolve(snapshot); }
    return Promise.resolve().then(function () {
        return calendars.callCloud('GetCommuteAddresses', {}, calendars.robotIdFrom(snapshot));
    }).then(function (result) {
        const byId = {};
        (result.addresses || []).forEach(function (item) { byId[String(item.memberId)] = item.address; });
        snapshot.commuteAvailable = result.available === true;
        (snapshot.members || []).forEach(function (member) {
            if (member.isJibo) { return; }
            member.workAddress = byId[String(member.id)] || null;
            member.homeAddress = byId[homeKey(member.id)] || null;
        });
        return snapshot;
    }).catch(function () {
        snapshot.commuteAvailable = false;
        return snapshot;
    });
}

// The cloud keeps a person's own home under "home:<member id>" (BEefy CommuteAddressRecord.HomeOf).
function homeKey (memberId) { return 'home:' + String(memberId); }

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

// A person's home; it also becomes the household home (and Jibo's location) for the owner,
// or when the household has none yet, so one person's dorm doesn't move Jibo's weather.
function setPersonHome (memberId, address) {
    const text = addressText(address);
    if (!memberId) { return Promise.reject(fail('memberId is required.', 400)); }
    return people.findMember(memberId).then(function (found) {
        const member = found.member;
        if (member.isJibo) { throw fail('The robot does not have a home address of its own.', 400); }
        const robot = calendars.robotIdFrom(found.snapshot);
        return calendars.callCloud('GetCommuteAddresses', {}, robot).then(function (result) {
            const hasHousehold = (result.addresses || []).some(function (item) { return item.memberId === 'home'; });
            return calendars.callCloud('SetCommuteAddress', {
                memberId: homeKey(memberId),
                address: text,
                memberName: [member.firstName, member.lastName].filter(Boolean).join(' ') || member.writtenName || null
            }, robot).then(function (saved) {
                return member.type === 'owner' || !hasHousehold ? setHome(saved.address) : null;
            });
        });
    }).then(function () { return people.list(); });
}

function clearPersonHome (memberId) {
    if (!memberId) { return Promise.reject(fail('memberId is required.', 400)); }
    return people.list().then(function (snapshot) {
        return calendars.callCloud('ClearCommuteAddress', { memberId: homeKey(memberId) }, calendars.robotIdFrom(snapshot));
    }).then(function () { return people.list(); });
}

function clearWork (memberId) {
    if (!memberId) { return Promise.reject(fail('memberId is required.', 400)); }
    return people.list().then(function (snapshot) {
        return calendars.callCloud('ClearCommuteAddress', { memberId: String(memberId) }, calendars.robotIdFrom(snapshot));
    }).then(function () { return people.list(); });
}

module.exports = {
    attach: attach, homeAddress: homeAddress, setHome: setHome, setWork: setWork, clearWork: clearWork,
    setPersonHome: setPersonHome, clearPersonHome: clearPersonHome
};
