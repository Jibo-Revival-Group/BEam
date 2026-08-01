import { Node } from './KBTools';
export interface CategoryData {
    categoryName: string;
    lastSelectedTime: number;
}
export declare class CategoryKBNode {
    private node;
    /**
     * Retrieves a CategoryKBNode. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getOrCreate(categoryName: string): Promise<CategoryKBNode>;
    constructor(node: Node);
    /**
     * Sets that a particular category has been selected at a certain time
     * @param {Date} [date] The time at which it was selected
     */
    markSelected(date?: Date): Promise<void>;
    /**
     * Get EoSCategory data
     * @return {CategoryData}
     */
    getData(): CategoryData;
    /**
     * Save kb node
     * @return {Promise<void>}
     */
    save(): Promise<{}>;
}
