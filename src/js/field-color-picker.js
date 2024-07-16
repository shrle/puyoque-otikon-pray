import * as PIXI from "pixi.js";
import array2dInit from "./array2d-init";
import convert from "color-convert";
import {
  //getPixiApp,
  getCaptureContainer,
  getCursorArea,
  getPointToImageRGB,
} from "./pixi-range-selector";

const fieldWidth = 8;
const fieldHeight = 6;

const captureContainer = getCaptureContainer();
const mapChipAreaContainer = new PIXI.Container();
let app;
const appInit = (pixiApp) => {
  app = pixiApp;
  initMapChipArea();

  app.stage.addChild(mapChipAreaContainer);
};

const getColorMap = () => {
  return extractColorFromMap();
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

/**
 * 指定のマスの色を抽出するポイントを取得する
 * @param {Number} x マスの左上の座標
 * @param {Number} y マスの左上の座標
 * @param {Number} width マスの幅
 * @param {Number} height マスの高さ
 *
 * @returns キャンバス全体からの指定マスの抽出位置の座標
 */
const calcPickPoint = (x, y, width, height) => {
  const sx = colorPickerPoint.x;
  const sy = colorPickerPoint.y;

  const cx = (width / 100) * sx;
  const cy = (height / 100) * sy;

  return { x: cx + x, y: cy + y };
};

/**
 * フィールド上の指定マスのエリアを取得する
 * @param {Number} x マスの行番号
 * @param {Number} y マスの列番号
 * @param {Number} wChip 行のマス数
 * @param {Number} hChip 列のマス数
 *
 * @returns マスのエリア
 */
const getMapChipArea = (x, y, wChip, hChip) => {
  const area = getCursorArea();
  const chipWidth = area.width / wChip;
  const chipHeight = area.height / hChip;
  return new PIXI.Rectangle(
    chipWidth * x + area.x,
    chipHeight * y + area.y,
    chipWidth,
    chipHeight
  );
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
const extractColorFromMap = async () => {
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
 * @returns {Number[][]}カラーコードを格納したマップ
 */
const extractColorCodeFromMap = async () => {
  let map = array2dInit(fieldWidth, fieldHeight, "000000");
  for (let y = 0; y < fieldHeight; y++) {
    for (let x = 0; x < fieldWidth; x++) {
      const colorCode = pickColorCode(x, y);

      map[y][x] = colorCode;
    }
  }

  return map;
};

const getColorCode = (x, y) => {
  x = parseInt(x);
  y = parseInt(y);

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
