// --- Just for typings, not runtime dependency ---
import JiboImport = require('jibo');
export type Animation = JiboImport.animDB.Animation;
export type AnimQuery = JiboImport.animDB.AnimQuery;
// ------------------------------------------------


export class Utils {

    /**
     * Chooses an item from a list at random
     *
     * @param {string[]}
     * @returns {string}
     */
    static sample(arr: string[]) {
        const min = 0;
        const max = arr.length;
        const choice = Math.floor(Math.random() * (max - min)) + min;
        return arr[choice];
    }

    /**
     * Load animation(s) into cache
     *
     * @param {jibo} jibo Jibo runtime instance
     * @param {string|AnimQuery} query Name of animation or AnimQuery
     * @param {string} cacheName Name of cache to load animation into
     * @return {Promise} The promise resolved when animation(s) have been cached
     */
    static async loadAnimationIntoCache(jibo: typeof JiboImport, query: string | AnimQuery, cacheName: string): Promise<any> {
        let assets: Animation[] = [];
        if (typeof query === 'string') {
            const asset = jibo.animDB.getAnimByName(query);
            if (!asset) {
                return Promise.reject(`No animation of name  '${query}'  found in animDB`);
            } else {
                assets.push(asset);
            }
        } else {
            const results = jibo.animDB.query(query);
            if (!results.matching.length) {
                return Promise.reject(`No animation of  ${query}  found in animDB`);
            } else {
                assets.push(...results.matching);
            }
        }
        assets.forEach(async asset => {
            await asset.createFromConfig({
                cache: cacheName
            });
        });
    }
}