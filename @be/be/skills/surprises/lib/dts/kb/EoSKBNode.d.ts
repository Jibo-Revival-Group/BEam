import { Node } from './KBTools';
export interface EoSData {
    lastEoSDelivery: number;
}
export declare class EoSKBNode {
    private node;
    /**
     * Retrieves an EoSKBNode. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getOrCreate(): Promise<EoSKBNode>;
    constructor(node: Node);
    /**
     * Sets that any EoS category was delivered
     * @param {Date} [date] The time at which it was selected
     */
    markDelivered(date?: Date): Promise<void>;
    /**
     * Get data
     * @return {CategoryData}
     */
    getData(): EoSData;
    /**
     * Save kb node
     * @return {Promise<void>}
     */
    save(): Promise<void>;
}
