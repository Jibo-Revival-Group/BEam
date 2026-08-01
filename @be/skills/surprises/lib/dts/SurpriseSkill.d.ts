import { BeSkill } from '@be/be-framework';
import { SurpriseElement } from './SurpriseElement';
import { SelectionPolicy } from "./policies";
import { EoSControl } from './EoSControl';
export declare type AsyncCallback = (err?: any) => void;
export declare class SurpriseSkill extends BeSkill {
    static OPEN_WAIT_TIME_MS: number;
    categories: SurpriseElement[];
    selectionPolicy: SelectionPolicy;
    eosControl: EoSControl;
    openPromise: Promise<void>;
    isActive: boolean;
    constructor(assetPack: any);
    postInit(done: AsyncCallback): void;
    _postInit(): Promise<void>;
    /**
     * Provide categories. This is either called from Be during setup or
     * the constructor in standalone mode
     * @param {SurpriseElement[]} categories
     */
    supplyCategories(categories: SurpriseElement[]): void;
    /**
     * Called just before skill starts
     * @param done
     */
    preload(done: (err?: any) => void): void;
    open(result?: any): void;
    /**
     * Called when skill is closing
     * @param {function} done
     */
    close(done: Function): void;
    /**
     * Selects what category to run
     * Selects what category to run
     * @param {LaunchContext} context
     */
    private _selectCategory(context);
}
