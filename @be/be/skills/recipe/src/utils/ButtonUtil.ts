export default class ButtonUtil {

  constructor () {
    throw 'ButtonUtil is static and cannot be instantiated';
  }

  /**
   * Prevent button mousedown events from being triggered twice for a single click.
   * This method does not off the event after it has been fired, only debounces the second event.
   */
  public static once (btn: any, mousedown?: (event?: any) => any, mouseup?: (event?: any) => any): void {
    let isDown = false;
    btn.on('mousedown', event => {
      if (!isDown) {
        isDown = true;
        mousedown !== undefined && mousedown(event);
      }
    });
    btn.on('mouseup', event => {
      if (isDown) {
        isDown = false;
        mouseup !== undefined && mouseup(event);
      }
    });
    btn.on('mouseupoutside', event => {
      if (isDown) {
        isDown = false;
        mouseup !== undefined && mouseup(event);
      }
    });
  }

}
