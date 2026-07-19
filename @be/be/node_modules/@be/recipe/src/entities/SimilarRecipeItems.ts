import Recipe from './Recipe';

export default class SimilarRecipeItems {

  public recipes: Recipe[];
  public metaData: any;
  public links: any;

  constructor (data: any = {}) {
    this.recipes = (data.recipes || []).map(item => new Recipe(item));
    this.metaData = data.metaData;
    this.links = data.links;
  }

}
