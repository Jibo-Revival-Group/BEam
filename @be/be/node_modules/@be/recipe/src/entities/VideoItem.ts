import PhotoItem from './PhotoItem';

export default class VideoItem {

  public videoID: number;
  public sourceID: string;
  public url: string;
  public photos: PhotoItem;

  constructor (data: any = {}, url: string = '') {
    this.videoID = data.videoID;
    this.sourceID = data.sourceID;
    this.url = url;
    this.photos = new PhotoItem(data.photos);
  }

}
