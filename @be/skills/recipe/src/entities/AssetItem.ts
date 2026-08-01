export default class AssetItem {

  public id: string;
  public type: string;
  public src: string;

  constructor (id: string, src: string = '', type: string = 'timeline') {
    this.id = id;
    this.src = src;
    this.type = type;
  }

  set data (data) {
    this.id = data.id;
    this.type = data.type;
    this.src = data.src;
  }

  get data(): any {
    return {
      id: this.id,
      type: this.type,
      src: this.src
    };
  }
  
}
