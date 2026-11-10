'use strict';
// BEacon Personal Reports: news topics per person; every topic is on until someone turns it off.
const assert = require('assert'), fs = require('fs'), path = require('path');
const file = path.resolve(__dirname, '../@be/be/beacon/lib/news-topics.js');
const calls = []; let cloudDown = false;
const stubs = {
    './calendars': {
        robotIdFrom: () => 'Auburn-Motor-Salad-Angora',
        callCloud: (op, body, robot) => {
            if (cloudDown) return Promise.reject(new Error('no credentials'));
            calls.push({ op, body, robot });
            return Promise.resolve(op === 'GetNewsTopics'
                ? { topics: ['general', 'sports', 'health'], people: [{ memberId: 'zoe', disabledTopics: ['sports'] }] }
                : { memberId: body.memberId, disabledTopics: body.disabledTopics });
        }
    },
    './people': {
        list: () => Promise.resolve({ members: [] }),
        findMember: id => Promise.resolve({ member: id === 'robot' ? { id, isJibo: true } : { id, firstName: 'Zoe', lastName: 'Vincent' }, snapshot: {} })
    }
};
const mod = { exports: {} };
new Function('require', 'module', 'exports', fs.readFileSync(file, 'utf8'))(name => stubs[name] || require(name), mod, mod.exports);
const topics = mod.exports;

(async () => {
    const snapshot = await topics.attach({ members: [{ id: 'zoe' }, { id: 'zane' }, { id: 'robot', isJibo: true }] });
    assert.deepStrictEqual(snapshot.newsTopics, ['general', 'sports', 'health']);
    assert.deepStrictEqual(snapshot.members.map(m => m.disabledNewsTopics), [['sports'], [], undefined], 'everyone else has every topic on');

    await topics.set('zoe', ['health']);
    assert.deepStrictEqual(calls[1], { op: 'SetNewsTopics', body: { memberId: 'zoe', memberName: 'Zoe Vincent', disabledTopics: ['health'] }, robot: 'Auburn-Motor-Salad-Angora' });
    await assert.rejects(topics.set('zoe', 'sports'), /list of topics/);
    await assert.rejects(topics.set('robot', []), /robot/);

    cloudDown = true;
    assert.strictEqual((await topics.attach({ members: [] })).newsTopics, null, 'the page still loads without the cloud');
    console.log('News topics: listed per person (all on by default), saved with the person\'s name, page survives cloud errors');
})().catch(err => { console.error(err); process.exitCode = 1; });
