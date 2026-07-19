import jibo = require('jibo');
import { kbModel as kb } from './KBModel';
import { userModel as user } from './UserModel';

const MODEL_TEMPLATE = require('../../resources/storage/modelTemplate').template;

type Node = jibo.kb.Node;

const PERSISTENT_KEYS = [
  'experience-level',
  'vegetarian-only',
  'allergy-ingredients',
  'favorites',
  'schedule'
];

const SESSION_KEYS = [
  'active-recipe',
  'active-step',
  'recipe-filters',
  'timers',
  'viewed-ingredients'
];

class StateModel {

  private data: Map<string, any>;

  constructor () {

  }

  public toString (): string {
    return JSON.stringify([ ...this.data ]);
  }

  public get (key: string): any {
    return this.data.get(key);
  }

  private set (key: string, value: any): void {
    this.data.set(key, value);
  }

  async init (): Promise<void> {

  }

  async initUser (id): Promise<Node> {
    try {
      return await kb.getUserNode();
    } catch (err) {
      // KB persistence may be unavailable on jibo 14; don't block skill open.
      console.warn('[recipe] initUser failed (KB unavailable):', err);
      return null;
    }
  }

  async saveState (): Promise<void> {
    console.log('saving state', this.toString());
    return await kb.saveState(this.toString());
  }

  async loadState (): Promise<void> {
    // Always end with a populated `data` map so blackboard reads (stateModel.get)
    // don't throw and open() can reach jibo.flow.run, even if the KB is unavailable.
    try {
      const state = await kb.loadState();
      if (!state) { this.createNewModel(); }
      else { this.createModelFromKnowledgeBase(state); }
    } catch (err) {
      console.warn('[recipe] loadState failed, using new model:', err);
      this.createNewModel();
    }
    try {
      await this.saveState();
    } catch (err) {
      console.warn('[recipe] saveState failed (continuing):', err);
    }
  }

  async refreshState (): Promise<void> {
    console.log('refreshing state');
    this.set('active-recipe', null);
    this.set('active-step', null);
    this.set('recipe-filters', {});
    this.set('timers', {});
    this.set('viewed-ingredients', []);
    return await this.saveState();
  }

  private createModelFromKnowledgeBase (data: string) {
    this.data = new Map<string, any>(JSON.parse(data));
  }

  private createNewModel () {
    this.data = new Map<string, any>(MODEL_TEMPLATE);
  }

  // Persistent user variables

  async increaseExperienceLevel (): Promise<void> {
    let exp = this.get('experience-level');
    this.set('experience-level', ++exp);
    return await this.saveState();
  }

  async userIsVegetarian (flag: boolean): Promise<void> {
    this.set('vegetarian-only', flag);
    return await this.saveState();
  }

  async addAllergicIngredient (ingredient: string): Promise<void> {
    if (this.isAllergicIngredient(ingredient)) { return; }
    let list = this.get('allergy-ingredients');
    list.push(ingredient);
    return await this.saveState();
  }

  async removeAllergicIngredient (ingredient: string): Promise<void> {
    let list = this.get('allergy-ingredients');
    list.splice(list.indexOf(ingredient), 1);
    return await this.saveState();
  }

  public isAllergicIngredient (ingredient: string): boolean {
    return this.get('allergy-ingredients').indexOf(ingredient) > -1;
  }

  async addFavoriteRecipe (id: number): Promise<void> {
    if (this.isFavoriteRecipe(id)) { return; }
    let list = this.get('favorites');
    list.push(id);
    return await this.saveState();
  }

  async removeFavoriteRecipe (id: number): Promise<void> {
    let list = this.get('favorites');
    list.splice(list.indexOf(id), 1);
    return await this.saveState();
  }

  public isFavoriteRecipe (id: number): boolean {
    return this.get('favorites').indexOf(id) > -1;
  }

  // Session based user variables

  async setActiveRecipe (id: number): Promise<void> {
    this.set('active-recipe', id);
    await this.saveState();
  }

  async setActiveStep (step: number): Promise<void> {
    console.log('setting active step');
    this.set('active-step', step);
    return await this.saveState();
  }

  async addSelectionFilter (key: string, value: string): Promise<void> {
    let filters = this.get('recipe-filters');
    filters[key] = value;
    return await this.saveState();
  }

  async removeSelectionFilter (key: string): Promise<void> {
    let filters = this.get('recipe-filters');
    delete filters[key];
    return await this.saveState();
  }

  async setTimer (startTime: number, lengthInMinutes: number, recipeOrdinal: number): Promise<void> {
    let timers = this.get('timers');
    timers[recipeOrdinal.toString()] = {
      startTime,
      endTime: lengthInMinutes * 60000 + startTime
    };
    return await this.saveState();
  }

  async removeTimer (recipeOrdinal: number): Promise<void> {
    let timers = this.get('timers');
    delete timers[recipeOrdinal.toString()];
    return await this.saveState();
  }

  async addViewedIngredientList (id: number): Promise<void> {
    if (this.viewedIngredients(id)) { return; }
    this.get('viewed-ingredients').push(id);
    return await this.saveState();
  }

  public viewedIngredients (id: number): boolean {
    return this.get('viewed-ingredients').indexOf(id) > -1;
  }

}

export const stateModel = new StateModel();
