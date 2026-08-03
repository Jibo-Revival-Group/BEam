import AssetItem from './AssetItem';

export default class ItemData {

  public id: string;
  public type: string;
  public assets: any[];
  public position: any;
  public action: any;
  public style: any;
  public text:any;

  constructor (id: string, type: string = 'Button', assets: any = [], position: any = { x: 0, y: 0 }, action: any = null) {
    this.id = id;
    this.type = type;
    this.assets = assets;
    this.position = position;
    this.action = action;
    this.style = {
        fontSize: 75,
        fontFamily: "Proxima Nova Soft",
        fontStyle: "bold",
        fill: "#FEAA26"
    }
    this.text = "";
  }

  set data (data) {
    this.id = data.id;
    this.type = data.type;
    this.assets = data.assets;
    this.position = data.position;
    this.action = data.action;
    this.style = data.style;
    this.position = data.pos;
    this.text = data.txt;
  }

  get data (): any {
    return {
      id: this.id,
      type: this.type,
      assets: this.assets,
      position: this.position,
      action: this.action,
      style: this.style,
      text: this.text
    };
  }

}
