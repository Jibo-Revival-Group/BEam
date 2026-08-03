export declare type Callback = (error?: Error | string) => void;
export interface Edge {
}
export interface Node {
    data: any;
    getEdges(name: string): Edge[];
    addEdges(node: Node): void;
    save(cb: Callback): void;
}
export interface Model {
    loadRoot(cb: Callback): void;
    load(edge: Edge, cb: Callback): void;
    createNode(name: string): Node;
}
export interface KBNodeData {
    lastEoSDelivery: number;
}
export declare type DateProvider = () => Date;
export declare class KBTools {
    private static _kbModel;
    static dateProvider: DateProvider;
    /**
     * Gets the kb model or creates it if it doesn't exist
     * @return {Model}
     */
    static getOrCreateModel(): Promise<Model>;
    /**
     * Retrieves the KB root node. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getRoot(): Promise<Node>;
    /**
     * Retrieves categories node. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getCategoriesNode(): Promise<Node>;
    /**
     * Retrieves users node. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getUsersNode(): Promise<Node>;
    /**
     * Gets an edge node by name (and creates it if needed)
     * @param {string} edgeName
     * @param {Node} [node] Node to create edge on, if omitted then root node is used
     * @param {function} [dataInitializer] A function to initialize data in new node
     * If not provided, then a new node won't be created
     * @return {Node}
     */
    static getOrCreateEdge(edgeName: string, node?: Node, dataInitializer?: (edgeName: string) => any): Promise<Node>;
}
