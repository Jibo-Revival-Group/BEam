"use strict";
const jibo = require("jibo");
const testQueries = require('./res/anim-query-list.json');
describe('remote', function() {

    describe("Check AnimDB Queries", function () {

        function checkQuery(query) {
            let typeFilter;
            switch(query.type) {
                case "anim":
                    typeFilter = ['ssa-only', 'sfx-only'];
                    break;
                case "ssa":
                    typeFilter = ['ssa-only'];
                    break;
                case "sfx":
                    typeFilter = ['sfx-only'];
                    break;
            }
            if (query.type === 'anim') {
                if (query.excludeMeta) {
                    query.excludeMeta.push(...typeFilter);
                } else {
                    query.excludeMeta = typeFilter;
                }
            } else {
                if (query.includeMeta) {
                    query.includeMeta.push(...typeFilter);
                } else {
                    query.includeMeta = typeFilter;
                }
            }
            const result = jibo.animDB.query(query);
            if (result.matching.length === 0) {
                console.log(`Unable to find animation that satisfies query: `, query);
            }
            expect(result.matching.length).to.not.be.empty;
        }

        it('Should find all standard animations', () => {
            testQueries.anims.forEach(query => {
                checkQuery(query);
            });
        });

        it('Should find all emojis', () => {
            testQueries.emojis.forEach(query => {
                checkQuery(query);
            });
        });

        it('Should find all dances', () => {
            testQueries.dances.forEach(query => {
                checkQuery(query);
            });
        });

        it('Should find all ssa', () => {
            testQueries.ssa.forEach(query => {
                checkQuery(query);
            });
        });

        it('Should find all sfx', () => {
            testQueries.sfx.forEach(query => {
                checkQuery(query);
            });
        });

    });
});
