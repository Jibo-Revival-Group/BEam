export default class ListData {

  public id: string;
  public type: string;
  public dynamic: boolean;
  public elementsPerPage: number;
  public elementType: string;
  public elementBuffer: number;
  public position: any;
  public elementDimensions: any;
  public defaultElement: any;
  public componentConfigs: any[];

  constructor (id: string, type: string, dynamic: boolean = true,
    elementsPerPage: number = 1, elementBuffer: number = 0,
    position: any = { x: 0, y: 0 }, elementDimensions: any = { x: 0, y: 0 }, defaultElement: any = { type: 'Clip' }, componentConfigs: any[] = []) {

    this.id = id;
    this.type = type;
    this.dynamic = dynamic;
    this.elementsPerPage = elementsPerPage;
    this.elementBuffer = elementBuffer;
    this.position = position;
    this.elementDimensions = elementDimensions;
    this.defaultElement = defaultElement;
    this.componentConfigs = componentConfigs;
  }

  set data (data) {
    this.id = data.id;
    this.type = data.type;
    this.dynamic = data.dynamic;
    this.elementsPerPage = data.elementsPerPage;
    this.elementBuffer = data.elementBuffer;
    this.position = data.position;
    this.elementDimensions = data.elementDimensions;
    this.defaultElement = data.defaultElement;
    this.componentConfigs = data.componentConfigs;
  }

  get data (): any {
    return {
      id: this.id,
      type: this.type,
      dynamic: this.dynamic,
      elementsPerPage: this.elementsPerPage,
      elementBuffer: this.elementBuffer,
      position: this.position,
      elementDimensions: this.elementDimensions,
      defaultElement: this.defaultElement,
      componentConfigs: this.componentConfigs
    };
  }

}
