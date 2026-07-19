export default class DirectionItem {

  public ordinal: number;
  public displayValue: string;
  public videoTimestamp: number;
  public timerLength: number;

  constructor (data: any = {}) {
    this.ordinal = data.ordinal;
    this.displayValue = data.displayValue;
    this.videoTimestamp = data.videoTimestamp;
    this.timerLength = data.timerLength
  }

}
