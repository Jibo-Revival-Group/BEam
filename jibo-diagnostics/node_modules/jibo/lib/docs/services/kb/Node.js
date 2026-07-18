/** Knowledge Base document store object. This is where data lives.
 * Nodes have edges which point to other nodes in any KB slice
 * (possibly even slices not in your current model). Edges have names
 * to group them into layers.
 *
 * All user specified data goes into `node.data`.
 *
 * `model.createNode()` is typically used to create new nodes so the
 * nodes will be bound to a KB slice for saving.
 *
 * @class Node
 * @memberof jibo.kb
 * @param {string} [nodeType] Type of node. Defaults to 'node'.
 * @param {Object} [data] Initial data.
 * @param {Object} [cloneFrom] Object or node to clone from.
 */

    /** Save the node into KB slice it is bound to.
     * Also sets the `node.updated` timestamp.
     *
     * @method jibo.kb.Node#save
     * @param {Function} [callback] Called when node is finished
     * saving. If callback is omitted a promise is returned instead.
     * @returns {Promise} A promise if the callback is omitted.
     */

    /** Remove the node from KB slice it is bound to.
     *
     * @method jibo.kb.Node#remove
     * @param {Function} [callback] Called when node is finished being
     * removed. If callback is omitted a promise is returned instead.
     * @returns {Promise} A promise if the callback is omitted.
     */

    /** Add edges to this node. Edges will have the name given by
     * layer, or will be taken from the node types (but nodes must be
     * given in that case, no id strings).
     *
     * @method jibo.kb.Node#addEdges
     * @param {string|jibo.kb.Node|string[]|jibo.kb.Node[]} idsOrNodes Ids of edges to
     * add to this node. Ids will be gotten from any nodes provided.
     * @param {string} [layer] Added edges will have this name. If
     * Nodes are given and layer is not specified, the edge name will
     * be taken from the node type.
     */

    /** Remove edges of the given layer name from this node. Layer can
     * be omitted if nodes are given and the node types match the
     * layer names of the edges to be removed.
     *
     * @method jibo.kb.Node#removeEdges
     * @param {string|jibo.kb.Node|string[]|jibo.kb.Node[]} idsOrNodes Ids of edges to
     * remove from this node. Ids will be gotten from any nodes
     * provided.
     * @param {string} [layer] Remove edges with this name. If Nodes
     * are given and layer is not specified, the edge name will be
     * taken from the node type for each node id.
     */

    /** Remove all edges of a given name.
     *
     * @method jibo.kb.Node#clearEdges
     * @param {string|string[]} layers The layer names (edge names) to remove.
     */

    /** Get edges of given layer names.  Duplicates are removed (this
     * may change). Order of edges are preserved for a single layer
     * name (except for duplicate removal). Order gets even messier for
     * multiple layers (because of duplicate removal).
     *
     * @method jibo.kb.Node#getEdges
     * @param {string|string[]} layers Nmes of layers to return edges for.
     * @returns {string[]} Array of IDs.
     */

    /** All layers (edge names) on this node
     * @method jibo.kb.Node#getLayers
     * @returns {string[]} Array of layer names.
     */

    /** Create a new asset object and add it to the list of assets on
     * this node.
     *
     * @method jibo.kb.Node#createAsset
     * @param {string} [subtype] Subtype name for this asset.
     * @param {string} [ext] Optional filename extension.
     * @returns {jibo.kb.Asset} New asset object.
     */

    /** Add existing asset objects to the list of assets on this
     * node. The asset objects root directory needs to match this node
     * object.
     *
     * @method jibo.kb.Node#addAssets
     * @param {jibo.kb.Asset|jibo.kb.Asset[]} assets Asset objects to add to node.
     * @param {string} [subtype] Subtype string to force assets to be
     * added as. Subtype comes from each asset object unless this is
     * specified.
     */

    /** Get all asset objects of given subtype from the assets listed
     * on this node.
     *
     * @method jibo.kb.Node#getAssets
     * @param {string} [subtype] Asset subtype to get. Defaults to `asset`.
     * @returns {jibo.kb.Asset[]} Array of asset objects.
     */

    /** Get all asset objects from the assets listed on this node,
     * regardless of subtype.
     *
     * @method jibo.kb.Node#getAllAssets
     * @returns {jibo.kb.Asset[]} Array of asset objects.
     */

    /** List of all asset subtypes on this node.
     *
     * @method jibo.kb.Node#getAssetSubtypes
     * @returns {string[]} Array of subtype name strings.
     */

    /** Delete an asset from disk and remove it from this node.
     *
     * @method jibo.kb.Node#removeAsset
     * @param {jibo.kb.Asset} asset Asset object to remove.
     * @param {Function} [callback] Called when done. If callback is
     * omitted a promise is returned instead.
     * @returns {Promise} A promise if the callback is omitted.
     */

    /** Delete from disk and remove all assets from the node.
     *
     * @method jibo.kb.Node#removeAllAssets
     * @param {Function} [callback] Called when done. If callback is
     * omitted a promise is returned instead.
     * @returns {Promise} A promise if the callback is omitted.
     */

    /** Set the 'updated' timestamp on this node.
     *
     * @method jibo.kb.Node#setUpdated
     * @param {number} [timestamp] Milliseconds since 1 January 1970
     * 00:00:00 UTC. Defaults to now.
     */

    /** Convert a single item to an array for arguments that may be a
     * single thing or an array of things
     *
     * @method jibo.kb.Node#_toArray
     * @private
     */