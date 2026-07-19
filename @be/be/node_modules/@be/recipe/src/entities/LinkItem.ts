export default class LinkItem {

  public self: any;
  public recipeUrl: any;
  public parent: any;
  public incrementalHelpfulCount: any;

  constructor (data: any = {}) {
    this.self = data.self;
    this.recipeUrl = data.recipeUrl;
    this.incrementalHelpfulCount = data.incrementalHelpfulCount;
    this.parent = data.parent;
  }

}
