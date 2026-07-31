export default class NutritionItem {

  public name: string;
	public amount: number;
  public unit: string;
	public displayValue: string;
	public percentDailyValue: string;
	public hasCompleteData: boolean;

  constructor (data: any = {}) {
    this.name = data.name;
    this.amount = data.amount;
    this.unit = data.unit;
    this.displayValue = data.displayValue;
    this.percentDailyValue = data.percentDailyValue;
    this.hasCompleteData = data.hasCompleteData;
  }

}
