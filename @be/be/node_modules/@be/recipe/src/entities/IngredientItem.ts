export default class IngredientItem {
  
  public ingredientID: number;
  public displayValue: string;
  public grams: number;
  public displayType: string;

  constructor (data: any = {}) {
    this.ingredientID = data.ingredientID;
    this.displayValue = data.displayValue;
    this.grams = data.grams;
    this.displayType = data.displayType;
  }

}
