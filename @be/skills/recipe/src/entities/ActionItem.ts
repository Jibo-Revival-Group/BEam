export default class ActionItem {

  public type: string;
  public data: any;

  constructor (type: string, data: any = { event: 'press' }) {
    this.type = type;
    this.data = data;
  }

  set actionData (data) {
    this.type = data.type;
    this.data = data.data;
  }

  get actionData (): any {
    return {
      type: this.type,
      data: this.data
    };
  }

}
