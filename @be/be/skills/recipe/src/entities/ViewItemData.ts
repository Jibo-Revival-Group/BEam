export default class ViewItemData {

  public id: string;
  public type: string;
  public viewConfig: any;
  public componentConfigs: any[];

  constructor(id: string, type: string = 'View', componentConfigs: any[] = []) {
    this.componentConfigs = componentConfigs;
    this.viewConfig = { type, id };
  }

  set data (data) {
    this.componentConfigs = data.componentConfigs;
    this.viewConfig = {
      type: data.type,
      id: data.id
    };
  }

  get data (): any {
    return {
      componentConfigs: this.componentConfigs,
      viewConfig: this.viewConfig
    };
  }

}
