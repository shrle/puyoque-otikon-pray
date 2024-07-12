import * as PIXI from "pixi.js";
import * as PixiDragger from "@/js/pixi-add-drag";
//const convert = require("color-convert");
import array2dInit from "./array2d-init";

const fieldWidth = 8;
const fieldHeight = 6;

const app = new PIXI.Application({
  width: 800,
  height: 600,
});

const captureContainer = new PIXI.Container();
const cursorContainer = new PIXI.Container();
const mapChipAreaContainer = new PIXI.Container();
const appInit = (leftTopCallBacks, rightBottomCallBacks) => {
  PixiDragger.init(app, app.screen);
  initCursor(leftTopCallBacks, rightBottomCallBacks);
  initCursorArea();
  initMapChipArea();
  document.querySelector("#fieldcap-frame-ss").appendChild(app.view);
  app.stage.addChild(captureContainer);
  app.stage.addChild(mapChipAreaContainer);
  app.stage.addChild(cursorContainer);
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

  let f = document.querySelector("#fieldcap-frame-ss");
  let fSize = { width: f.clientWidth, height: f.clientHeight };
  spScale = pushIn(sp, fSize);

  sp.scale.x = spScale;
  sp.scale.y = spScale;
  app.renderer.resize(sp.width, sp.height);
  frameSizeAdjusted = true;
};

const pushIn = (bigSize, smallSize) => {
  let scale;
  scale = smallSize.width / bigSize.width;
  if (bigSize.height * scale > smallSize.height) {
    scale = smallSize.height / bigSize.height;
  }
  return scale;
};

const texture = PIXI.Texture.from("img/cursor.png");
const rightBottom = new PIXI.Sprite(texture);
const leftTop = new PIXI.Sprite(texture);

const initCursor = (leftTopCallBacks, rightBottomCallBacks) => {
  rightBottom.angle = 180;
  rightBottom.anchor.set(0.5);
  rightBottom.x = 150;
  rightBottom.y = 150;
  PixiDragger.addDrag(rightBottom, rightBottomCallBacks);

  rightBottom.eventMode = "static";
  rightBottom.cursor = "pointer";

  leftTop.anchor.set(0.5);
  leftTop.x = 100;
  leftTop.y = 100;
  PixiDragger.addDrag(leftTop, leftTopCallBacks);

  cursorContainer.addChild(rightBottom, leftTop);
};

const setLeftTopPoint = (x, y) => {
  leftTop.x = x;
  leftTop.y = y;
};
const setRightBottomPoint = (x, y) => {
  rightBottom.x = x;
  rightBottom.y = y;
};

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

const getCursorArea = () => {
  const anchor = leftTop.width / 2;
  const x = parseInt(leftTop.x - anchor);
  const y = parseInt(leftTop.y - anchor);
  const width = parseInt(rightBottom.x - x + anchor);
  const height = parseInt(rightBottom.y - y + anchor);

  return new PIXI.Rectangle(x, y, width, height);
};

let colorMap = [];

const getColorMap = () => {
  return colorMap;
};
const initMapChipArea = () => {
  const graphics = new PIXI.Graphics();

  app.ticker.add(() => {
    graphics.clear();
    graphics.lineStyle(2, 0xff0000, 1);
    for (let y = 0; y < fieldHeight; y++) {
      for (let x = 0; x < fieldWidth; x++) {
        const ca = getMapChipArea(x, y, fieldWidth, fieldHeight);
        graphics.drawRect(ca.x, ca.y, ca.width, ca.height);

        const p = calcPickPoint(ca.x, ca.y, ca.width, ca.height);
        graphics.drawRect(p.x, p.y, 1, 1);
      }
    }

    graphics.endFill();
    colorMap = extractColorFromMap();
  });

  mapChipAreaContainer.addChild(graphics);
};

const calcPickPoint = (x, y, width, height) => {
  const sx = 50;
  const sy = 90;

  const cx = (width / 100) * sx;
  const cy = (height / 100) * sy;

  return { x: cx + x, y: cy + y };
};

const getMapChipArea = (x, y, wChip, hChip) => {
  const area = getCursorArea();
  const chipWidth = area.width / wChip;
  const chipHeight = area.height / hChip;
  return {
    x: chipWidth * x + area.x,
    y: chipHeight * y + area.y,
    width: chipWidth,
    height: chipHeight,
  };
};

const getRGB = (x, y) => {
  // 抽出する矩形を定義
  const rect = getCursorArea();

  // ピクセルデータを抽出
  const data = app.renderer.extract.pixels(captureContainer, rect);

  x = parseInt(x) - rect.x;
  y = parseInt(y) - rect.y;
  // 特定座標のRGB値を取得
  const r = data[(y * rect.width + x) * 4];
  const g = data[(y * rect.width + x) * 4 + 1];
  const b = data[(y * rect.width + x) * 4 + 2];

  return { r, g, b };
};

const getCursorAreaImage = () => {
  // 抽出する矩形を定義
  const rect = getCursorArea();
  return app.renderer.extract.image(captureContainer, "image/webp", 1, rect);
};

/**
 * SS上の盤面から指定マス上の特定座標の色を抽出する
 * @returns 抽出したカラーコード
const pickColorCode = (mapX, mapY) => {
  const area = getMapChipArea(mapX, mapY, fieldWidth, fieldHeight);
  const p = calcPickPoint(area.x, area.y, area.width, area.height);

  return getColorCode(p.x, p.y);
};

 */

const pickColor = (mapX, mapY) => {
  const area = getMapChipArea(mapX, mapY, fieldWidth, fieldHeight);
  const p = calcPickPoint(area.x, area.y, area.width, area.height);

  return getRGB(p.x, p.y);
};

/**
 * SS上の盤面から各マスの特定座標の色を抽出し、マップに格納する
 * @returns 色を格納したマップ
 */
const extractColorFromMap = () => {
  let map = array2dInit(fieldWidth, fieldHeight, "000000");
  for (let y = 0; y < fieldHeight; y++) {
    for (let x = 0; x < fieldWidth; x++) {
      const colorCode = pickColor(x, y);

      map[y][x] = colorCode;
    }
  }

  return map;
};
/*
const getColorCode = (x, y) => {
  const { r, g, b } = getRGB(x, y);
  return convert.rgb.hex(r, g, b);
};
*/

//let mapColor = array2dInit(fieldWidth, fieldHeight, "000000");
/*
const setMapColor = (x, y, color) => {
  mapColor[y][x] = color;
};

const getMapColor = (x, y) => {
  return mapColor[y][x];
};
*/

export {
  appInit,
  setImage,
  getColorMap,
  setRightBottomPoint,
  setLeftTopPoint,
  getCursorAreaImage,
};
