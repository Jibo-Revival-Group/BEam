'use strict';
const path = require('path');
const fs = require('fs');
const jibo = require('jibo'), BeSkill = require('@be/be-framework').BeSkill;
const bluetooth = require('../../beacon/lib/bluetooth');

const BLUE = [0, 0.51, 0.99]; // Bluetooth blue (#0082FC) on the light ring
// Jibo's own confirm screen (settings skill: red title, text, green Yes and red No buttons) with our words.
const CONFIRM = path.join(__dirname, '../settings/assets/privacy/privacyOnConfirm.json');

function label (id, text, y, size, fill) {
    return { id: id, type: 'Label', text: text, style: { fontSize: size, fontFamily: 'Proxima Nova Light', fill: fill, align: 'center' },
        position: { x: 'CENTER', y: y }, targetAnchor: { x: '0.5', y: '0.0' } };
}
const short = (name) => name.length > 28 ? name.slice(0, 27) + '…' : name;

// Bluetooth mode: opened by beacon/lib/bluetooth.js while a phone is connected. Jibo is only a speaker: the
// Bluetooth badge on screen, a blue light ring, no "Hey Jibo". Tap → "Disconnect?"; it leaves when the phone does.
class BluetoothSkill extends BeSkill {
    open() {
        this.gen = (this.gen || 0) + 1;
        const gen = this.gen, alive = () => this.gen === gen;
        this.device = 'your phone';
        this.hotword = jibo.jetstream.setHotwordMode(jibo.jetstream.types.HotwordListenMode.Disabled);
        jibo.embodied.listen.exitActiveMode();
        jibo.tts.stop();
        this.timer = setInterval(() => {
            jibo.expression.setLEDColor(BLUE); // other parts of Jibo set the ring too: keep it blue
            bluetooth.status().then((s) => {
                if (!alive()) return;
                if (!s.connected) { this.leave(); return; }
                if (s.device && s.device !== 'Phone' && s.device !== this.device) { this.device = s.device; this.rename(); }
            }, () => { if (alive()) this.leave(); });
        }, 1000);
        jibo.expression.setLEDColor(BLUE);
        this.showMain();
    }
    showMain () {
        const views = jibo.face.views;
        const view = this.view = views.createView('View', { viewConfig: { type: 'View', id: 'bluetoothMode', ignoreSwipeDown: true },
            componentConfigs: [
                { id: 'icon', type: 'Clip', assets: [{ id: 'icon', src: path.join(__dirname, 'bluetooth.png'), type: 'texture' }], position: { x: '520', y: '70' } },
                label('device', 'Connected to ' + short(this.device), 450, 50, '#FFFFFF'),
                label('hint', 'Tap to disconnect', 530, 36, '#9A9AB0')
            ] }, false);
        view.addAction(views.ActionData.CALLBACK, { callback: () => this.askDisconnect() }, true, false, views.GESTURE.TAP);
        views.changeView({ removeAll: true, addView: view });
    }
    rename () {
        const device = this.view && this.view.getComponentById && this.view.getComponentById('device');
        if (device) device.text = 'Connected to ' + short(this.device);
    }
    askDisconnect () {
        if (this.asking) return;
        this.asking = true;
        const gen = this.gen;
        const views = jibo.face.views, config = JSON.parse(fs.readFileSync(CONFIRM, 'utf8'));
        const byId = (id) => config.componentConfigs.filter(c => c.id === id)[0];
        config.viewConfig.id = 'bluetoothDisconnect';
        byId('title').text = 'Disconnect?';
        byId('text').text = 'Stop playing from ' + short(this.device) + '\nand turn off Bluetooth mode.';
        const confirm = views.createView('View', config, false);
        let answered = false;
        confirm.on('pressed', () => { // Yes
            answered = true;
            bluetooth.disconnect().catch(() => {}); // the timer sees the phone go and leaves
        });
        confirm.once(views.CLOSED, () => { this.asking = false; if (!answered && this.gen === gen) this.showMain(); }); // No
        this.view = null;
        views.changeView({ removeAll: true, addView: confirm });
    }
    leave () {
        if (this.leaving) return;
        this.leaving = true;
        this.exit({ noElementsOfSurprise: true });
    }
    // Be refuses skills that don't define open and close.
    close (done) {
        this.gen = (this.gen || 0) + 1;
        clearInterval(this.timer); this.timer = null;
        this.leaving = false; this.asking = false; this.view = null;
        jibo.expression.setLEDColor([0, 0, 0]);
        const hotword = this.hotword; this.hotword = null;
        Promise.resolve(hotword && hotword.release()).catch(() => {}).then(() => {
            jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => done(), () => done());
        });
    }
}
module.exports = BluetoothSkill;
