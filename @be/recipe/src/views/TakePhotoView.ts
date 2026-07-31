import jibo = require('jibo');
import eases = require('eases');
import Recipe from '../entities/Recipe';
import ButtonUtil from '../utils/ButtonUtil';
import { EventEmitter } from 'events';

export default class TakePhotoView extends EventEmitter {

  public static TYPE: string = 'TakePhotoView';

  public componentType: any;
  public mc: any;
  public heartBtn: any;
  public closeBtn: any;
  public imageContainer: PIXI.Container;
  public retakeBtn: any;
  public saveBtn: any;
  public photoImg: any;
  private recipe: Recipe;

  constructor () {
    super();
  }

  public init (recipe: Recipe): void {
    this.recipe = recipe;

    jibo.face.views.addView('resources/views/TakePhoto.json', (view) => {
      this.componentType = view.getComponentById('takePhotoClip');
      this.mc = this.componentType.movieClip;
      this.closeBtn = this.mc.closeBtn;
      this.retakeBtn = this.mc.retakeBtn;
      this.saveBtn = this.mc.saveBtn;
      this.photoImg = this.mc.photoImg;

      this.imageContainer = new PIXI.Container();
      this.mc.addChildAt(this.imageContainer, 1);

      jibo.face.tween.play(this.closeBtn, { to:{x:1160}, from:{x:1300}, ease:'circInOut',delay:200, duration:350});
      jibo.face.tween.play(this.retakeBtn, { to:{y:600}, from:{y:950}, ease:'circInOut', delay:200, duration:350});
      jibo.face.tween.play(this.saveBtn, { to:{y:600}, from:{y:950}, ease:'circInOut', delay:300, duration:350});

      this.setupButtons([ this.retakeBtn, this.closeBtn, this.saveBtn ]);

      this.setEventHandlers();
      this.emit('ready');
    }, jibo.face.views.UP, jibo.face.views.OUT);
  }

  public cleanup (done: () => any): void {
    jibo.face.views.removeView(done);
  }

  protected setEventHandlers (): void {
    ButtonUtil.once(this.closeBtn, () => {
      this.emit('close');
    });

    ButtonUtil.once(this.saveBtn, () => {
      this.emit('take');
    });

    ButtonUtil.once(this.retakeBtn, () => {
      this.emit('retake');
    });
  }

  protected showError (error): void {
    let errorMessage = "";
    for(var n in error) {
      errorMessage+= n + " : " + error[n];
    }
    console.log("Error:"+ errorMessage)
    this.emit("imageError", error);
  }

  public retakePhoto (): void {
    this.imageContainer.removeChildren();
  }

  public takePhoto (): void {
    // jibo 14: photo API lives on jibo.media. takePhoto(params, cb) returns
    // { id, url }; storePhoto persists it (fixed thumbnails) and accepts the id
    // directly; getPhoto(id, cb) returns a PIXI texture. (PhotoRes/PhotoType.FULL
    // and the old 5-arg lps.takePhoto no longer exist.)
    const media: any = (jibo as any).media;
    if (!media || typeof media.takePhoto !== 'function') {
      this.showError(new Error('jibo.media.takePhoto is unavailable'));
      return;
    }

    const cameraId = media.CameraID && media.CameraID.LEFT;
    media.takePhoto({ camera: cameraId }, (error, data) => {
      if (error != null || !data) {
        this.showError(error || new Error('takePhoto returned no data'));
        return;
      }
      media.storePhoto(data.id, (storeErr, stored) => {
        if (storeErr != null) { this.showError(storeErr); return; }
        const photoId = this.resolveStoredPhotoId(stored, data.id);
        media.getPhoto(photoId, (err, pixiTexture) => {
          if (err != null || !pixiTexture) {
            this.showError(err || new Error('getPhoto returned no texture'));
            return;
          }
          const s = new PIXI.Sprite();
          s.texture = pixiTexture;
          this.imageContainer.addChild(s);
          this.emit("imageCaptured");
        });
      });
    });
  }

  private resolveStoredPhotoId (stored: any, fallbackId: string): string {
    if (stored) {
      const t = stored.thumbnails;
      if (t) {
        // jibo 14 stores 'thumb_robot' (330x330) and 'thumb' (720x405).
        const candidate = t.thumb_robot || t['330x330'] || t.thumb || t['720x405'];
        if (typeof candidate === 'string') { return candidate; }
      }
      if (typeof stored.id === 'string') { return stored.id; }
      if (stored.data && typeof stored.data.id === 'string') { return stored.data.id; }
    }
    return fallbackId;
  }

  protected setupButtons (buttons: any[]): void {
    for (let i = 0, l = buttons.length; i < l; i++) {
      let btn = buttons[i];
      btn.interactive = btn.buttonMode = true;
    }
  }

}
