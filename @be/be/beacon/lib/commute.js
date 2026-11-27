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
const localFirst = require('./local-first');

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

// Local-first robots keep the addresses here; the cloud only says whether address lookup is set up.
function getAddresses (robot) {
    if (!localFirst.enabled()) { return calendars.callCloud('GetCommuteAddresses', {}, robot); }
    return calendars.callCloud('GetCommuteAddresses', { localFirst: true }, robot).then(function (result) {
        return { available: result.available, addresses: localFirst.read().commuteAddresses };
    });
}

// Local-first: the cloud only geocodes; the result is saved here. A mode-only change (same address) needs no lookup.
function setAddress (body, robot) {
    if (!localFirst.enabled()) { return calendars.callCloud('SetCommuteAddress', body, robot); }
    const memberId = body.memberId || 'home';
    const saved = localFirst.find('commuteAddresses', memberId);
    const modeOnly = body.mode != null && saved && String(saved.address).toLowerCase() === body.address.toLowerCase();
    const lookup = modeOnly ? Promise.resolve(saved) : calendars.callCloud('SetCommuteAddress', Object.assign({}, body, { localFirst: true }), robot);
    return lookup.then(function (found) {
        localFirst.put('commuteAddresses', memberId, {
            memberId: memberId, address: found.address, lat: found.lat, lng: found.lng, city: found.city,
            mode: body.mode != null ? body.mode : (saved && saved.mode) || null,
            memberName: body.memberName || null, timeZone: body.timeZone || null
        });
        return found;
    });
}

function clearAddress (memberId, robot) {
    if (localFirst.enabled()) { return localFirst.put('commuteAddresses', memberId, null); }
    return calendars.callCloud('ClearCommuteAddress', { memberId: memberId }, robot);
}

function list () {
    return people.list().then(function (snapshot) {
        return getAddresses(calendars.robotIdFrom(snapshot));
    });
}

// Adds snapshot.commuteAvailable, member.workAddress and member.homeAddress to a People snapshot; never fails the page.
function attach (snapshot) {
    if (!snapshot) { return Promise.resolve(snapshot); }
    return Promise.resolve().then(function () {
        return getAddresses(calendars.robotIdFrom(snapshot));
    }).then(function (result) {
        const byId = {}, modes = {};
        (result.addresses || []).forEach(function (item) { byId[String(item.memberId)] = item.address; modes[String(item.memberId)] = item.mode; });
        snapshot.commuteAvailable = result.available === true;
        (snapshot.members || []).forEach(function (member) {
            if (member.isJibo) { return; }
            member.workAddress = byId[String(member.id)] || null;
            member.commuteMode = modes[String(member.id)] || 'driving';
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
        return setAddress({
            address: text,
            timeZone: calendars.homeTimeZone()
        }, calendars.robotIdFrom(snapshot));
    }).then(function (found) {
        return location.applyAddress(found).then(function (saved) {
            return { address: found.address, location: saved.location };
        });
    });
}

const MODES = ['driving', 'bicycling', 'walking'];

// mode: how the person gets there (driving, bicycling or walking); omitted keeps the saved one.
function setWork (memberId, address, mode) {
    const text = addressText(address);
    if (mode != null && MODES.indexOf(mode) < 0) { return Promise.reject(fail('Pick Car, Bike or Walk.', 400)); }
    if (!memberId) { return Promise.reject(fail('memberId is required.', 400)); }
    return people.findMember(memberId).then(function (found) {
        const member = found.member;
        if (member.isJibo) { throw fail('The robot does not have a job.', 400); }
        const body = {
            memberId: String(memberId),
            address: text,
            memberName: [member.firstName, member.lastName].filter(Boolean).join(' ') || member.writtenName || null
        };
        if (mode != null) { body.mode = mode; }
        return setAddress(body, calendars.robotIdFrom(found.snapshot));
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
        return getAddresses(robot).then(function (result) {
            const hasHousehold = (result.addresses || []).some(function (item) { return item.memberId === 'home'; });
            return setAddress({
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
        return clearAddress(homeKey(memberId), calendars.robotIdFrom(snapshot));
    }).then(function () { return people.list(); });
}

function clearWork (memberId) {
    if (!memberId) { return Promise.reject(fail('memberId is required.', 400)); }
    return people.list().then(function (snapshot) {
        return clearAddress(String(memberId), calendars.robotIdFrom(snapshot));
    }).then(function () { return people.list(); });
}

module.exports = {
    attach: attach, homeAddress: homeAddress, setHome: setHome, setWork: setWork, clearWork: clearWork,
    setPersonHome: setPersonHome, clearPersonHome: clearPersonHome
};
