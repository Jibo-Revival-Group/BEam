export default class NavigationUtil {

  private history: string[] = [];

  public WhatDoYouWant: string = 'what-do-you-want';
  public LoadData: string  = 'load-data';
  public RecipeSelection: string = 'recipe-selection';
  public GuidedSteps: string = 'guided-steps';
  public Video: string = 'video';
  public Picture: string = 'picture';
  public FollowUp: string = 'follow-up';
  public Ingredients: string = 'ingredients';
  public End: string = 'end';

  constructor () {

  }

  addToHistory (view: string): void {
    this.history.push(view);
  }

  removeFromHistory (index: number): void {
    this.history.splice(index, 1);
  }

  getActiveView (): string {
    return this.history[this.history.length - 1];
  }

  getPreviousView (): string {
    return this.history[this.history.length - 2];
  }

  getViewByIndex (index: number): string {
    return this.history[index];
  }

}
