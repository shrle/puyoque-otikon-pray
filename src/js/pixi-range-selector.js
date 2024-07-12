import * as PIXI from "pixi.js";
import * as PixiDragger from "@/js/pixi-add-drag";
//const convert = require("color-convert");

let app;
const captureContainer = new PIXI.Container();
const cursorContainer = new PIXI.Container();

const appInit = (canvasWidth, canvasHeight) => {
  app = new PIXI.Application({
    width: canvasWidth,
    height: canvasHeight,
  });
  PixiDragger.init(app, app.screen);
  //initCursor(leftTopCallBacks, rightBottomCallBacks);
  initCursor();
  initCursorArea();
  //canvasContainer = document.querySelector(canvasContainerSelector);
  //canvasContainer.appendChild(app.view);
  app.stage.addChild(captureContainer);

  app.stage.addChild(cursorContainer);

  return app;
};

const getPixiApp = () => {
  return app;
};

const getCaptureContainer = () => {
  return captureContainer;
};

let frameSizeAdjusted = false;
let spScale;
const setImage = (image) => {
  const baseTexture = PIXI.Texture.from(image);
  const sp = new PIXI.Sprite(baseTexture);

  captureContainer.addChild(sp);

  if (frameSizeAdjusted) {
    sp.scale.x = spScale;
    sp.scale.y = spScale;
    return;
  }

  //let f = canvasContainer;
  //let fSize = { width: f.clientWidth, height: f.clientHeight };
  spScale = pushIn(sp, app.screen);

  sp.scale.x = spScale;
  sp.scale.y = spScale;
  //app.renderer.resize(sp.width, sp.height);
  frameSizeAdjusted = true;
};

const pushIn = (image, canvas) => {
  let scale;
  scale = canvas.width / image.width;
  if (image.height * scale > canvas.height) {
    scale = canvas.height / image.height;
  }
  return scale;
};

const texture = PIXI.Texture.from("img/cursor.png");
const rightBottom = new PIXI.Sprite(texture);
const leftTop = new PIXI.Sprite(texture);

/**
 * カーソルの初期化
 */
const initCursor = () => {
  rightBottom.angle = 180;
  rightBottom.anchor.set(0.5);
  rightBottom.x = 150;
  rightBottom.y = 150;
  PixiDragger.addDrag(rightBottom, rightBottomDragListener);

  rightBottom.eventMode = "static";
  rightBottom.cursor = "pointer";

  leftTop.anchor.set(0.5);
  leftTop.x = 100;
  leftTop.y = 100;
  PixiDragger.addDrag(leftTop, leftTopDragListener);

  leftTop.eventMode = "static";
  leftTop.cursor = "pointer";

  cursorContainer.addChild(rightBottom, leftTop);
};

/**
 * 左上のカーソルの位置を設定
 * @param {Number} x
 * @param {Number} y
 */
const setLeftTopCursorPoint = (x, y) => {
  leftTop.x = x;
  leftTop.y = y;
};

/**
 * 右下のカーソルの位置を設定
 * @param {Number} x
 * @param {Number} y
 */
const setRightBottomCursorPoint = (x, y) => {
  rightBottom.x = x;
  rightBottom.y = y;
};

let leftTopDragCallbacks = { start: () => {}, move: () => {}, end: () => {} };
let rightBottomDragCallbacks = {
  start: () => {},
  move: () => {},
  end: () => {},
};

let leftTopDragListener = {
  start: (sprite) => {
    if (typeof leftTopDragCallbacks.start === "function")
      leftTopDragCallbacks.start(sprite);
  },
  move: (sprite) => {
    if (typeof leftTopDragCallbacks.move === "function")
      leftTopDragCallbacks.move(sprite);
  },
  end: (sprite) => {
    console.dir(leftTopDragCallbacks);
    if (typeof leftTopDragCallbacks.end === "function")
      leftTopDragCallbacks.end(sprite);
  },
};
let rightBottomDragListener = {
  start: (sprite) => {
    if (typeof rightBottomDragCallbacks.start === "function")
      rightBottomDragCallbacks.start(sprite);
  },
  move: (sprite) => {
    if (typeof rightBottomDragCallbacks.move === "function")
      rightBottomDragCallbacks.move(sprite);
  },
  end: (sprite) => {
    if (typeof rightBottomDragCallbacks.end === "function")
      rightBottomDragCallbacks.end(sprite);
  },
};

/**
 * @callback DragCallback
 * @param {PIXI.Sprite} sprite ドラッグ中のスプライト
 */

/**
 * 左上のカーソルがドラッグされたときに呼び出されるコールバックを設定する
 *
 * @param {Object} callBacks ドラッグイベントのコールバック関数群
 * @param {DragCallback} callBacks.start ドラッグ開始時に呼び出される関数
 * @param {DragCallback} callBacks.move ドラッグ中継時に呼び出される関数
 * @param {DragCallback} callBacks.end ドラッグ終了時に呼び出される関数
 */
const setLeftTopDragListener = (callbacks) => {
  console.log("setLeftTopDragListener");
  console.dir(callbacks);
  const c = callbacks;
  leftTopDragCallbacks = { start: c.start, move: c.move, end: c.end };
};

/**
 * 右下のカーソルがドラッグされたときに呼び出されるコールバックを設定する
 *
 * @param {Object} callBacks ドラッグイベントのコールバック関数群
 * @param {DragCallback} callBacks.start ドラッグ開始時に呼び出される関数
 * @param {DragCallback} callBacks.move ドラッグ中継時に呼び出される関数
 * @param {DragCallback} callBacks.end ドラッグ終了時に呼び出される関数
 */
const setRightBottomDragListener = (callbacks) => {
  const c = callbacks;
  rightBottomDragCallbacks = { start: c.start, move: c.move, end: c.end };
};

/**
 * 指定範囲を表す枠の描画設定の初期化
 */
const initCursorArea = () => {
  const graphics = new PIXI.Graphics();
  app.ticker.add(() => {
    const area = getCursorArea();
    graphics.clear();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.drawRect(area.x, area.y, area.width, area.height);
    graphics.endFill();
  });

  cursorContainer.addChild(graphics);
};

/**
 * カーソルによって指定された範囲の位置情報を取得する
 * @returns {PIXI.Rectangle} 位置情報
 */
const getCursorArea = () => {
  const anchor = leftTop.width / 2;
  const x = parseInt(leftTop.x - anchor);
  const y = parseInt(leftTop.y - anchor);
  const width = parseInt(rightBottom.x - x + anchor);
  const height = parseInt(rightBottom.y - y + anchor);

  return new PIXI.Rectangle(x, y, width, height);
};

const getCursorAreaImage = () => {
  // 抽出する矩形を定義
  const rect = getCursorArea();
  return app.renderer.extract.image(captureContainer, "image/webp", 1, rect);
};

export {
  appInit,
  setLeftTopDragListener,
  setRightBottomDragListener,
  getPixiApp,
  getCaptureContainer,
  setImage,
  setLeftTopCursorPoint,
  setRightBottomCursorPoint,
  getCursorArea,
  getCursorAreaImage,
};