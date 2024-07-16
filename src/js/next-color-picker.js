import * as PIXI from "pixi.js";
import array2dInit from "./array2d-init";
import convert from "color-convert";
import {
  getCaptureContainer,
  getCursorArea,
  getPointToImageRGB,
} from "./pixi-range-selector";

const fieldWidth = 8;
const fieldHeight = 1;

const captureContainer = getCaptureContainer();
const mapChipAreaContainer = new PIXI.Container();
let app;
const appInit = (pixiApp) => {
  app = pixiApp;
  initMapChipArea();

  app.stage.addChild(mapChipAreaContainer);
};

let colorMap = [];

const getColorMap = () => {
  return colorMap;
};
const initMapChipArea = () => {
  const graphics = new PIXI.Graphics();
  app.ticker.add(drawArea.bind(this, graphics));
  mapChipAreaContainer.addChild(graphics);
};

let isVisibleDrawArea = false;
const drawArea = (graphics) => {
  graphics.clear();
  if (!isVisibleDrawArea) return;
  for (let y = 0; y < fieldHeight; y++) {
    for (let x = 0; x < fieldWidth; x++) {
      const ca = getMapChipArea(x, y, fieldWidth, fieldHeight);
      graphics.lineStyle(2, 0xff0000, 0.3);
      graphics.drawRect(ca.x, ca.y, ca.width, ca.height);

      const p = calcPickPoint(ca.x, ca.y, ca.width, ca.height);
      graphics.lineStyle(2, 0xff0000, 1);
      graphics.drawRect(p.x, p.y, 1, 1);
    }
  }

  graphics.endFill();
  colorMap = extractColorFromMap();
};

const showDrawArea = () => {
  isVisibleDrawArea = true;
};

const hideDrawArea = () => {
  isVisibleDrawArea = false;
};

let colorPickerPoint = { x: 0, y: 0 };
const setColorPickerPoint = (x, y) => {
  colorPickerPoint.x = x;
  colorPickerPoint.y = y;
};

const calcPickPoint = (x, y, width, height) => {
  const sx = colorPickerPoint.x;
  const sy = colorPickerPoint.y;

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

const getCursorAreaImage = () => {
  // 抽出する矩形を定義
  const rect = getCursorArea();
  return app.renderer.extract.image(captureContainer, "image/webp", 1, rect);
};

/**
 * SS上の盤面から指定マス上の特定座標の色を抽出する
 * @returns 抽出したカラーコード
 */
const pickColorCode = (mapX, mapY) => {
  const area = getMapChipArea(mapX, mapY, fieldWidth, fieldHeight);
  const p = calcPickPoint(area.x, area.y, area.width, area.height);

  return getColorCode(p.x, p.y);
};

const pickColor = (mapX, mapY) => {
  const area = getMapChipArea(mapX, mapY, fieldWidth, fieldHeight);
  const p = calcPickPoint(area.x, area.y, area.width, area.height);

  return getPointToImageRGB(p.x, p.y);
};

/**
 * SS上の盤面から各マスの特定座標の色を抽出し、マップに格納する
 * @returns RGBを格納したマップ
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

/**
 * SS上の盤面から各マスの特定座標の色を抽出し、マップに格納する
 * @returns {Number[]}カラーコードを格納したマップ
 */
const extractColorCodeFromMap = () => {
  let map = [];
  for (let x = 0; x < fieldWidth; x++) {
    const colorCode = pickColorCode(x, 0);

    map[x] = colorCode;
  }

  return map;
};

const getColorCode = (x, y) => {
  const { r, g, b } = getPointToImageRGB(x, y);
  return convert.rgb.hex(r, g, b);
};

export {
  appInit,
  showDrawArea,
  hideDrawArea,
  getColorMap,
  getCursorAreaImage,
  setColorPickerPoint,
  extractColorFromMap,
  extractColorCodeFromMap,
};
