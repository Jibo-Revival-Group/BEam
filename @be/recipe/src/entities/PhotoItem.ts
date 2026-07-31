export default class PhotoItem {

  public rawItemType: number;
  public itemType: string;
  public photoID: number;
  public urls: any[];
  public title: string;
  public description: string;
  public photoDetailUrl: string;
  public recipeTitle: string;

  constructor (data: any = {}) {
    this.rawItemType = data.rawItemType;
    this.itemType = data.itemType;
    this.photoID = data.photoID;
    this.title = data.title;
    this.description = data.description;
    this.photoDetailUrl = data.photoDetailUrl;
    this.recipeTitle = data.recipeTitle;
    this.urls = data.urls;
  }

}
