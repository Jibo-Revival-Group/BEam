import { Node } from './KBTools';
export declare enum UserLikesEoS {
    TRUE,
    FALSE,
    UNKNOWN,
}
export interface UserData {
    userID: string;
    likesEoS: UserLikesEoS;
}
export declare class UserKBNode {
    private node;
    /**
     * Retrieves an UserKBNode. Initializes it if needed
     * @return {Promise<Node>}
     */
    static getOrCreate(userID: string): Promise<UserKBNode>;
    constructor(node: Node);
    /**
     * Get User data
     * @return {UserData}
     */
    getData(): UserData;
    /**
     * Save kb node
     * @return {Promise<void>}
     */
    save(): Promise<{}>;
}
