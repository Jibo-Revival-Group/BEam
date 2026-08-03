import jibo = require('jibo');
import eases = require('eases');

import Recipe from '../entities/Recipe';
import ListData from '../entities/ListData';
import DirectionItem from '../entities/DirectionItem';
import ItemData from '../entities/ItemData';
import ActionItem from '../entities/ActionItem';
import AssetItem from '../entities/AssetItem';
import ViewItemData from '../entities/ViewItemData';
import StepMenuItem from '../components/buttons/StepMenuItem';

export default class StepView extends jibo.rendering.gui.components.Element {

  public static TYPE: string = 'StepView';

  public index: number;

  // Number of page changes triggered programmatically (via stepTo). The List emits
  // a 'paged' event for these too; without this guard each button press would emit a
  // second 'nav' (press -> Navigate -> stepTo -> paged -> nav) and fight the flow.
  private programmaticPages: number = 0;

  private recipe: Recipe;
  private label: jibo.rendering.gui.components.Label;
  private view: any;
  private list: jibo.rendering.gui.components.List;

  private prevBtn: jibo.rendering.gui.components.Button;
  private videoBtn: jibo.rendering.gui.components.Button;
  private nextBtn: jibo.rendering.gui.components.Button;

  constructor () {
    super();
  }

  public init (recipe: Recipe): void {
    this.recipe = recipe;
    this.index = 0;

    let listData: any = this.getListData();
    let componentConfigsList = this.getComponentConfigsList();

    componentConfigsList.push(listData);
    let viewData = new ViewItemData('StepList', 'View', componentConfigsList);
    this.view = jibo.face.views.createView('stepSelection', viewData, true, view => {
      this.list = this.view.getComponentById('stepList') as jibo.rendering.gui.components.List;
      this.label = this.view.getComponentById('step_lbl') as jibo.rendering.gui.components.Label;
      this.prevBtn = this.view.getComponentById('previous_btn') as jibo.rendering.gui.components.Button;
      this.videoBtn = this.view.getComponentById('playStep_btn') as jibo.rendering.gui.components.Button;
      this.nextBtn = this.view.getComponentById('next_btn') as jibo.rendering.gui.components.Button;
      this.updateDisplay();
      this.setEventHandlers();
      this.emit('ready');
      this.showButtons([ this.prevBtn, this.videoBtn, this.nextBtn ]);
    });

    /*let list: jibo.rendering.gui.components.List = new jibo.rendering.gui.components.List();
    let button: jibo.rendering.gui.components.Button = new jibo.rendering.gui.components.Button();
    let config: any = {
      id:'previous_btn',
      type:'Button',
      assets:[
        {
          id:'icon_previous',
          type:'texture',
          src:'resources/buttons/previous_btn.png'
        }
      ]
    };
    // button.createFromConfig(config);
    list.addComponent(button);*/
  }

  public cleanup (done: () => any): void {
    jibo.face.views.changeView({ removeAll: true }, done);
  }

  public stepTo (step: number): void {
    if (step < 1 || step > this.recipe.numDirections) { return; }
    let dir = step > this.index + 1; // true = forward, false = backward
    let count = Math.abs(step - (this.index + 1));
    for (let i = 0; i < count; i++) {
      this.programmaticPages++;
      this.list.changePage(dir);
    }
  }

  public updateDisplay (): void {
    this.label = this.view.getComponentById('step_lbl') as jibo.rendering.gui.components.Label;
    this.label.text = `Step ${this.index + 1} of ${this.recipe.numDirections}`;
  }

  protected showButtons (components: jibo.rendering.gui.components.Button[]): void {
    let l = components.length;
    for (let i = 0; i < l; i++) {
      let component = components[i];
      jibo.face.tween.play(component.display, { to:{y:603}, from:{y:1000},ease:'backOut', delay:(0.14+i)*l*50, duration:500});
    }
  }

  private setEventHandlers (): void {
    this.view = jibo.face.views.currentView;
    this.view.on('paged', event => {
      let direction = this.index > this.list.pageIndex ? 'previous' : 'next';
      this.index = this.list.pageIndex;
      this.updateDisplay();
      // Only user-initiated swipes should drive the flow. A page change we triggered
      // programmatically (from Navigate -> stepTo) must not emit another 'nav'.
      if (this.programmaticPages > 0) {
        this.programmaticPages--;
        return;
      }
      console.log('[recipe] StepView swipe nav:', direction);
      this.emit('nav', direction);
    });

    this.view.on('press', event => {
      console.log('[recipe] StepView press:', event && event.choice);
      switch (event.choice) {
        case 'previous':
        case 'next':
          this.emit('nav', event.choice);
          break;
        case 'playstep':
          this.emit('video');
          break;
      }
    });
  }

  protected getComponentConfigsList (): ItemData[] {
    let titleItem = new ItemData('step_lbl', 'Label');
    let itemData = titleItem.data;
    itemData.pos = {x:80, y:40};
    itemData.txt = 'Step - of -';
    titleItem.data = itemData;
    return [
      titleItem,
      new ItemData('previous_btn', 'Button',
        new AssetItem('icon_previous', 'resources/buttons/previous_btn.png', 'texture'),
        { x: 170, y: 1000 }, new ActionItem('event', { event: 'press', choice: 'previous' })),
      new ItemData('playStep_btn', 'Button',
        new AssetItem('icon_playStep', 'resources/buttons/playStep_btn.png', 'texture'),
        { x: 490, y: 1000 }, new ActionItem('event', { event: 'press', choice: 'playstep' })),
      new ItemData('next_btn', 'Button',
        new AssetItem('icon_next', 'resources/buttons/next_btn.png', 'texture'),
        { x: 810, y: 1000 }, new ActionItem('event', { event: 'press', choice: 'next' })),
    ];
  }


  protected getListData (): ListData {
    let list = new ListData('stepList', 'List');
    let data = list.data;
    let style =  {
      fontSize: '75',
      fontFamily: 'Proxima Nova Light',
      align: 'left',
      fill: '#FFFFFF',
      wordWrap :true,
      breakWords: true,
      wordWrapWidth: 1120
    };
    let components = []
    for (let i = 0, l = this.recipe.numDirections; i < l; i++) {
      components.push({
        id: `step${i}`,
        /*assets: [{
          id: 'step',
          src: 'timelines/StepItem/StepItem.js',
          type: 'timeline',
          index: i,
          data: recipe
        }]*/
        type: 'Label',
        text: this.recipe.getTextDirectionAtIndex(i),
        style: style
        //SD: Produces Error TypeError: element_1.targetPosition.clone is not a function
        //position: {x:0, y:0}
      })
    }
    data.componentConfigs = components;
    data.elementBuffer = 0;
    //SD:X value does nothing.
    data.position = { x: 1000, y: 380 };
    //SD: x is width, y is height for some reason?
    data.elementDimensions = { x: 1162, y: 512 };
    //data.defaultElement.type = StepMenuItem.TYPE;
    list.data = data;
    return list;
  }

}
