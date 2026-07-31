import PhotoItem from './PhotoItem';

export default class Submitter {

  public rawItemType: number;
  public itemType: string;
  public userID: number;
  public name: string;
  public isPro: boolean;
  public followersCount: number;
  public followingCount: number;
  public madeRecipesCount: number;
  public favoritesCount: number;
  public recipesCount: number;
  public reviewsCount: number;
  public ratingsCount: number;
  public personalRecipeSharedCount: number;
  public photo: PhotoItem;
  public city: string;
  public region: string;
  public country: string;
  public promotedBrandPixelTrackingUrl: string;
  public brandedSourceID: number;
  public handle: string;
  public profileUrl: string;

  constructor (data: any = {}) {
    this.rawItemType = data.rawItemType;
    this.itemType = data.itemType;
    this.userID = data.userID;
    this.name = data.name;
    this.isPro = data.isPro;
    this.followersCount = data.followersCount;
    this.followingCount = data.followingCount;
    this.madeRecipesCount = data.madeRecipesCount;
    this.favoritesCount = data.favoritesCount;
    this.recipesCount = data.reciepesCount;
    this.reviewsCount = data.reviewsCount;
    this.ratingsCount = data.ratingsCount;
    this.personalRecipeSharedCount = data.personalRecipeSharedCount;
    this.photo = new PhotoItem(data.photo);
    this.city = data.city;
    this.region = data.region;
    this.country = data.country;
    this.promotedBrandPixelTrackingUrl = data.promotedBrandPixelTrackingUrl;
    this.brandedSourceID = data.brandedSourceID;
    this.handle = data.handle;
    this.profileUrl = data.profileUrl
  }

}
