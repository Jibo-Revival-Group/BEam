export default class FootNoteItem {

  public text: string;
  public ordinal: number;

  constructor (data: any = {}) {
    this.text = data.text;
    this.ordinal = data.ordinal;
  }

}
