import Submitter from './Submitter';
import NutritionItem from './NutritionItem';
import DirectionItem from './DirectionItem';
import IngredientItem from './IngredientItem';
import TopReviewItem from './TopReviewItem';
import FootNoteItem from './FootNoteItem';
import PhotoItem from './PhotoItem';
import VideoItem from './VideoItem';
import AdUnit from './AdUnit';
import LinkItem from './LinkItem';
import SimilarRecipeItems from './SimilarRecipeItems';

import StringUtils from '../utils/StringUtils';

export default class Recipe {

  public recipeID: number;
  public sourceID: number;
  public isSponsored: boolean;
  public type: string;
  public title: string;
  public submitter: Submitter;
  public description: string;
  public directions: DirectionItem[];
  public ingredients: IngredientItem[];
  public servings: number;
  public nutrition: NutritionItem[];
  public topReviews: TopReviewItem[];
  public prepMinutes: number;
  public cookMinutes: number;
  public readyInMinutes: number;
  public photo: PhotoItem;
  public video: VideoItem;
  public similarRecipes: SimilarRecipeItems;
  public ratingAverage: number;
  public ratingCount: number;
  public reviewCount: number;
  public adUnit: AdUnit;
  public links: LinkItem;
  public footnotes: FootNoteItem[];

  constructor (data) {
    this.recipeID = data.recipeID;
    this.sourceID = data.sourceID;
    this.isSponsored = data.isSponsored;
    this.type = data.type;
    this.title = data.title;
    this.description = data.description;
    this.servings = data.servings;
    this.prepMinutes = data.prepMinutes;
    this.cookMinutes = data.cookMinutes;
    this.readyInMinutes = data.readyInMinutes;
    this.ratingAverage = data.ratingAverage;
    this.ratingCount = data.ratingCount;
    this.reviewCount = data.reviewCount;

    let arr = [];
    this.directions = (data.directions || arr).map(item => new DirectionItem(item));
    this.ingredients = (data.ingredients || arr).map(item => new IngredientItem(item));
    this.topReviews = (data.topReviews || arr).map(item => new TopReviewItem(item));
    this.footnotes = (data.footnotes || arr).map(item => new FootNoteItem(item));
    this.nutrition = Object.keys(data.nutrition || {}).map(item => new NutritionItem(data.nutrition[item]));

    this.submitter = new Submitter(data.submitter);
    this.photo = new PhotoItem(data.photo);
    this.video = new VideoItem(data.video, (data.videoOnlineURL != null) ?data.videoOnlineURL : data.videoURL);
    this.similarRecipes = new SimilarRecipeItems(data.similarRecipes);
    this.adUnit = new AdUnit(data.adUnit);
    this.links = new LinkItem(data.links);
  }

  public get numDirections (): number {
    return this.directions.length;
  }

  public get numIngredients (): number {
    return this.ingredients.length;
  }

  public hasVideo (): boolean {
    // TODO: Verify that this will actually work for recipes with no video.
    return this.video.videoID !== undefined;
  }

  public hasIngredient (ingredient: string): boolean {
    return this.getIngredientData(ingredient) !== null;
  }

  public getSSADirectionAtIndex (index: number): string {
    return this.directions[index].displayValue;
  }

  public getTextDirectionAtIndex (index: number): string {
    return StringUtils.stripSSA(this.getSSADirectionAtIndex(index));
  }

  public getIngredientData (ingredient: string): IngredientItem {
    const regex = new RegExp(ingredient, 'i');
    for (let i = 0, l = this.numIngredients; i < l; i++) {
      let item = this.ingredients[i];
      if (regex.test(item.displayValue)) { return item; }
    }
    return null;
  }

  public getNutritionData (name: string): NutritionItem {
    const regex = new RegExp(name, 'i');
    const items = this.nutrition;
    for (let i = 0, l = items.length; i < l; i++) {
      let item = items[i];
      if (regex.test(item.name)) { return item; }
    }
    return null;
  }

}
