export default class AdUnit {

  public networkCode: string;
  public site: string;
  public contentProviderId: string;
  public adZone: string;
  public adKeys: number[] = [];

  constructor (data: any = {}) {
    this.networkCode = data.networkCode;
    this.site = data.site;
    this.contentProviderId = data.contentProviderId;
    this.adZone = data.adZone;
    this.adKeys = data.adKeys;
  }

}
