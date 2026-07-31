import Submitter from './Submitter';
import LinkItem from './LinkItem';

export default class TopReviewItem {

  public rawItemType: number;
  public itemType: string;
  public reviewID: number;
  public rating: number;
  public text: string;
  public dateLastModified: string;
  public helpfulCount: number;
  public submitter: Submitter;
  public links: LinkItem;

  constructor (data: any = {}) {
    this.rawItemType = data.rawItemType;
    this.itemType = data.itemType;
    this.reviewID = data.reviewID;
    this.rating = data.rating;
    this.text = data.text;
    this.dateLastModified = data.dateLastModified;
    this.helpfulCount = data.helpfulCount;
    this.submitter = new Submitter(data.submitter);
    this.links = new LinkItem(data.links);
  }

}
