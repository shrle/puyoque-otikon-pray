/* eslint-disable */
import * as PIXI from "pixi.js";
import { Loader } from "@pixi/loaders";
import PuyoqueStd from "@/js/puyoquestd.js";
import Point from "@/js/point.js";
import Route from "@/js/route.js";

export default class PuyoqueCanvas {
  static origPuyoWidth = 97;
  static origPuyoHeight = 89;
  static origNextWidth = 100;
  static origNextHeight = 100;

  static imgNames = [
    "red.png",
    "blue.png",
    "yellow.png",
    "green.png",
    "purple.png",
    "heart.png",
    "prism.png",
    "ojama.png",
    "katapuyo.png",
    "next-red.png",
    "next-blue.png",
    "next-yellow.png",
    "next-green.png",
    "next-purple.png",
  ];

  constructor(selecter, canvasWidth, canvasHeigth, field) {
    this.canvasWidth = canvasWidth;
    this.canvasHeigth = canvasHeigth;
    this.field = field;

    this.app = new PIXI.Application({
      width: this.canvasWidth,
      height: this.canvasHeigth,
      backgroundColor: 0xc8c8c8,
      resolution: window.devicePixelRatio || 1,
      autoResize: true,
    });
    document.querySelector(selecter).appendChild(this.app.view);
    this.container = new PIXI.Container();
    this.touchContainer = new PIXI.Container();
    this.selectGraph = new PIXI.Graphics();
    this.puyoTextures = [];
    this.puyoSprites = [];
    this.floatingPuyoSprites = [];
    this.nextPuyoSprites = [];
    this.selectRoute = new Route();
    this.selectedField = [];
    this.selectRouteLengthMax = 5;
    /**
     * callback
     */
    this.passSelectRouteLengthMax = function () {
      //return vm.selectRouteLengthMax;
      return this.selectRouteLengthMax;
    };

    this.puyoWidth = 0;
    this.puyoHeight = 0;
    this.nextHeight = 0;
    this.puyoScale = 1;

    this.isPush = false;
    this.isChain = false; // 連鎖中かのフラグ
    this.chainNum = 0;

    this.selectRouteListeners = [];
    this.chainStartListeners = [];
    this.chainListeners = [];
    this.chainEndListeners = [];

    /**
     * 外部クラスに連鎖情報を渡すコールバック
     * @param {number} deletePuyoNum
     * @param {number} deleteColorList
     * @param {number} deletePrismNum
     * @param {number} chainNum
     */
    this.colorMagCalc = function (
      deletePuyoNum,
      deleteColorList,
      deletePrismNum,
      chainNum
    ) {};

    this.dropSpeed = 5;
    this.chainWait = 2;
    PIXI.Assets.load("/img/puyos.json").then(() => {
      this.onAssetsLoaded();
    });
  }

  array2dInit(width, height, value) {
    var array = [];

    for (var y = 0; y < height; y++) {
      array[y] = [];
      for (var x = 0; x < width; x++) {
        array[y][x] = value;
      }
    }
    return array;
  }

  resetSelect() {
    this.selectedField = this.array2dInit(
      this.field.width,
      this.field.height,
      false
    );
    for (let y = 0; y < this.field.height; y++) {
      for (let x = 0; x < this.field.width; x++) {
        let puyo = this.getPuyoSprite(x, y);
      }
    }
    this.selectRoute = new Route();
  }

  onAssetsLoaded() {
    for (const name of PuyoqueCanvas.imgNames) {
      this.puyoTextures.push(PIXI.Texture.from(name));
    }
    let squareWidth = this.canvasWidth / this.field.width;
    let puyoScale = squareWidth / PuyoqueCanvas.origPuyoWidth;
    this.puyoWidth = PuyoqueCanvas.origPuyoWidth * puyoScale;
    this.puyoHeight = PuyoqueCanvas.origPuyoHeight * puyoScale;

    let nextFieldHeight =
      this.canvasHeigth - this.puyoHeight * this.field.height;
    let nextScale = nextFieldHeight / PuyoqueCanvas.origNextHeight;
    let nextWidth = PuyoqueCanvas.origNextWidth * nextScale;
    this.nextHeight = PuyoqueCanvas.origNextHeight * nextScale;
    let nextCenter = (squareWidth - nextWidth) / 2;

    for (let y = 0; y < this.field.height; y++) {
      let lineSprites = [];
      for (let x = 0; x < this.field.width; x++) {
        let sprite = new PIXI.Sprite(
          this.puyoTextures[this.field.getColor(x, y)]
        );
        sprite.scale.x = puyoScale;
        sprite.scale.y = puyoScale;
        sprite.x = this.puyoWidth * x;
        sprite.y = this.puyoHeight * y + this.nextHeight;

        sprite.interactive = true;
        sprite.buttonMode = true;

        let hitAreaScale = 0.8;
        let width = sprite.width * hitAreaScale;
        let height = sprite.height * hitAreaScale;
        let hitX = (sprite.width - width) / 2;
        let hitY = (sprite.height - height) / 2;
        sprite.hitArea = new PIXI.Rectangle(
          sprite.x + hitX,
          sprite.y + hitY,
          width,
          height
        );

        lineSprites.push(sprite);
        this.container.addChild(sprite);
      }

      this.puyoSprites.push(lineSprites);
    }

    if (nextFieldHeight > 0) {
      for (let x = 0; x < this.field.width; x++) {
        let sprite = new PIXI.Sprite(
          this.puyoTextures[this.field.getNextColor(x)]
        );
        sprite.scale.x = nextScale;
        sprite.scale.y = nextScale;
        sprite.x = squareWidth * x + nextCenter;
        sprite.y = 0;

        this.nextPuyoSprites.push(sprite);
        this.container.addChild(sprite);
      }
    }

    this.puyoScale = puyoScale;

    let self = this;
    this.touchContainer.x = 0;
    this.touchContainer.y = 0;
    this.touchContainer.width = this.canvasWidth;
    this.touchContainer.height = this.canvasWidth;
    this.touchContainer.hitArea = new PIXI.Rectangle(
      0,
      0,
      this.canvasWidth,
      this.canvasWidth
    );
    this.touchContainer.interactive = true;
    this.touchContainer.buttonMode = true;
    this.touchContainer
      .on("pointerdown", function (event) {
        self.pointerDown(event);
      })
      .on("pointermove", function (event) {
        self.pointerMove(event);
      })
      .on("pointerup", function (event) {
        self.pointerUp(event);
      });

    this.container.addChild(this.selectGraph);
    this.app.stage.addChild(this.container, this.touchContainer);
    this.app.ticker.add((delta) => {
      this.animate(delta);
    });

    this.resetSelect();
  }
  pointerDown(event) {
    if (this.isChain) return;
    this.isPush = true;
    this.selectRoute = new Route();
    this.selectRouteLengthMax = this.passSelectRouteLengthMax();
  }

  pointerLeave(event) {
    this.isPush = false;
    this.resetSelect();
  }

  pointerMove(event) {
    if (!this.isPush) return;

    const point = event.data.getLocalPosition(this.container);
    if (!this.isRangeCanvas(point.x, point.y)) {
      this.pointerLeave(event);
      return;
    }

    if (this.selectRoute.length >= this.selectRouteLengthMax) return;

    let fp = this.toFieldPoint(point.x, point.y);
    if (fp && !this.isSelected(fp.x, fp.y) && !this.field.isBlank(fp.x, fp.y)) {
      if (this.selectRoute.length > 0 && !this.isAdjacentSelected(fp.x, fp.y))
        return;
      let puyo = this.getPuyoSprite(fp.x, fp.y);
      this.selectRoute.push(fp);
      this.select(fp.x, fp.y);
      for (const func of this.selectRouteListeners) {
        func(this.selectRoute.clone());
      }
    }
  }
  pointerUp(event) {
    if (!this.isPush) return;

    this.isPush = false;
    this.fire();
  }

  fire() {
    if (this.selectRoute.length > 0) {
      if (!this.field.canTraceRoute(this.selectRoute.points)) return;
      this.chainStart();
    }
    this.resetSelect();
  }

  /**
   * 浮遊ぷよがすべて接地したかチェック
   * @returns {boolean}
   */
  isAllLanding() {
    for (const puyo of this.floatingPuyoSprites) {
      if (puyo.distance > 0) return false;
    }
    return true;
  }

  /**
   * 浮遊しているぷよをフィールドに反映させる
   * おそらく使わない
   */
  landing() {
    for (const puyo of this.floatingPuyoSprites) {
      let x = puyo.landingX;
      let y = puyo.landingY;
      puyo.destroy();
    }
    this.floatingPuyoSprites = [];
    if (this.field.getFloatingPuyo().length > 0) {
      this.field.dropFloatingPuyo();
    } else {
      this.field.dropFloatingNext();
    }
  }

  addSelectRouteListeners(func) {
    this.selectRouteListeners.push(func);
  }
  addChainStartListener(func) {
    this.chainStartListeners.push(func);
  }
  addChainListener(func) {
    this.chainListeners.push(func);
  }
  addChainEndListener(func) {
    this.chainEndListeners.push(func);
  }

  chainStart() {
    for (const func of this.chainStartListeners) {
      func(this.selectRoute.clone());
    }

    this.isChain = true;
    this.deleteSelectPuyo();
    this.selectRoute = new Route();
    this.chainNum = 0;

    this.setFloatingPuyo();
    this.field.holdFloatingPuyo();
    this.field.deleteFoatingPuyo();
    if (this.floatingPuyoSprites.length > 0) return;

    this.setFloatingNext();
    this.field.holdFoatingNexts();
    this.field.deleteFoatingNexts();
    if (this.floatingPuyoSprites.length > 0) return;

    this.chainEnd();
  }
  chainEnd() {
    this.isChain = false;

    for (const func of this.chainEndListeners) {
      func(this.chainNum);
    }
  }

  chain() {
    //浮遊しているぷよが合ってなおかつ全て接地していた場合のみ
    if (!(this.floatingPuyoSprites.length > 0 && this.isAllLanding())) return;
    this.field.dropHoldFoatingPuyo();
    this.deleteFloatingPuyoSprites();

    for (const func of this.chainListeners) {
      func();
    }

    let puyoColor = PuyoqueStd.puyoColor;
    let targetLength = 3;
    let chained = false;

    let deleteHeartNum = 0;
    let deletePrismNum = 0;
    let deletePuyoNum = 0;
    let deleteColorList = [];

    this.field.searchLinkPuyos(targetLength, (points, color) => {
      chained = true;
      for (const point of points) {
        this.field.targetAround(point.x, point.y, (x, y, color) => {
          if (color === puyoColor.heart) {
            deleteHeartNum++;
            this.field.deletePuyo(x, y);
          } else if (color === puyoColor.prism) {
            deletePuyoNum++;
            deletePrismNum++;
            this.field.deletePuyo(x, y);
          } else if (color === puyoColor.ojama) {
            deletePuyoNum++;
            this.field.deletePuyo(x, y);
          } else if (color === puyoColor.kataPuyo) {
            //TODO: 固ぷよ処理
          }
        });
      }
      deleteColorList.push(color);
      deletePuyoNum += points.length;
      this.field.deletePuyos(points);
    });

    if (chained) {
      this.colorMagCalc(
        deletePuyoNum,
        deleteColorList,
        deletePrismNum,
        this.chainNum
      );
      this.chainNum++;
      this.setFloatingPuyo();
      this.field.holdFloatingPuyo();
      this.field.deleteFoatingPuyo();
      if (this.floatingPuyoSprites.length === 0) {
        this.setFloatingNext();
        this.field.holdFoatingNexts();
        this.field.deleteFoatingNexts();
      }
    } else {
      this.setFloatingNext();
      this.field.holdFoatingNexts();
      this.field.deleteFoatingNexts();
    }

    if (this.floatingPuyoSprites.length === 0) {
      this.chainEnd();
    }
  }

  setFloatingPuyo() {
    let puyos = this.field.getFloatingPuyo();

    if (puyos.length === 0) {
      return;
    }

    for (const puyo of puyos) {
      let floatingPuyo = new PIXI.Sprite(this.puyoTextures[puyo.color]);
      floatingPuyo.puyoColor = puyo.color;
      floatingPuyo.puyoChance = puyo.chance;

      floatingPuyo.scale.x = this.puyoScale;
      floatingPuyo.scale.y = this.puyoScale;
      floatingPuyo.x = this.puyoWidth * puyo.x;
      floatingPuyo.y = this.puyoHeight * puyo.y + this.nextHeight;
      floatingPuyo.landingX = puyo.x;
      floatingPuyo.landingY = puyo.y + puyo.dropStep;
      floatingPuyo.distance = this.puyoHeight * puyo.dropStep;
      this.container.addChild(floatingPuyo);
      this.floatingPuyoSprites.push(floatingPuyo);
    }
  }

  setFloatingNext() {
    let puyos = this.field.getFloatingNext();
    if (puyos.length === 0) {
      return;
    }
    for (const puyo of puyos) {
      let floatingPuyo = new PIXI.Sprite(this.puyoTextures[puyo.color]);
      floatingPuyo.puyoColor = puyo.color;
      floatingPuyo.puyoChance = puyo.chance;

      floatingPuyo.scale.x = this.puyoScale;
      floatingPuyo.scale.y = this.puyoScale;
      floatingPuyo.x = this.puyoWidth * puyo.x;
      floatingPuyo.y = this.puyoHeight * puyo.y;
      floatingPuyo.landingX = puyo.x;
      floatingPuyo.landingY = puyo.dropStep - 1;
      floatingPuyo.distance = this.puyoHeight * puyo.dropStep + this.nextHeight;
      this.container.addChild(floatingPuyo);
      this.floatingPuyoSprites.push(floatingPuyo);
    }
  }

  deleteFloatingPuyoSprites() {
    for (let sprite of this.floatingPuyoSprites) {
      sprite.destroy();
    }
    this.floatingPuyoSprites = [];
  }

  drawFloatingPuyo() {
    for (const puyo of this.floatingPuyoSprites) {
      if (puyo.distance <= 0) continue;
      puyo.y += this.dropSpeed;
      puyo.distance -= this.dropSpeed;
      if (puyo.distance <= 0) {
        puyo.y += puyo.distance;
        puyo.distance = 0;
      }
    }
  }

  drawField() {
    for (let y = 0; y < this.field.height; y++) {
      for (let x = 0; x < this.field.width; x++) {
        if (this.field.isBlank(x, y)) {
          this.setInvisiblePuyo(x, y);
        } else {
          let color = this.field.getColor(x, y);
          this.setPuyoColor(x, y, color);
          this.setVisiblePuyo(x, y);
        }
      }
    }

    for (let x = 0; x < this.field.width; x++) {
      if (this.field.isNextBlank(x)) {
        this.setInvisibleNext(x);
      } else {
        let color = this.field.getNextColor(x);
        this.setNextPuyoColor(x, color);
        this.setVisibleNext(x);
      }
    }
  }
  /*
    drawSelect() {
        this.selectGraph.clear();
        this.selectGraph.beginFill(0x000000);
        this.selectGraph.alpha = 0.5;
        for (let y = 0; y < this.field.height; y++) {
            for (let x = 0; x < this.field.width; x++) {
                if (!this.isSelected(x, y)) continue;
                this.selectGraph.drawRect(x * this.puyoWidth, y * this.puyoHeight + this.nextHeight, this.puyoWidth, this.puyoHeight);
            }
        }
        this.selectGraph.endFill();
    }
    */

  drawSelect() {
    this.selectGraph.clear();
    this.selectGraph.beginFill(0x000000);
    this.selectGraph.alpha = 0.5;
    for (const p of this.selectRoute.points) {
      this.selectGraph.drawRect(
        p.x * this.puyoWidth,
        p.y * this.puyoHeight + this.nextHeight,
        this.puyoWidth,
        this.puyoHeight
      );
    }

    this.selectGraph.endFill();
  }

  animate(delta) {
    this.chain();
    this.drawSelect();
    this.drawField();
    this.drawFloatingPuyo();
  }

  isRangeCanvas(x, y) {
    return 0 <= x && x < this.canvasWidth && 0 <= y && y < this.canvasHeigth;
  }

  /**
   * 指定座標がぷよスプライト上であればそのフィールド座標を返す
   * @param {number} canvasX
   * @param {number} canvasY
   * @returns {Point | undefined} フィールド上の座標
   */
  toFieldPoint(canvasX, canvasY) {
    for (let y = 0; y < this.field.height; y++) {
      for (let x = 0; x < this.field.width; x++) {
        let puyo = this.getPuyoSprite(x, y);
        if (puyo.hitArea.contains(canvasX, canvasY)) {
          return new Point(x, y);
        }
      }
    }
    return null;
  }

  setPuyoColor(x, y, color) {
    this.puyoSprites[y][x].texture = this.puyoTextures[color];
  }
  setNextPuyoColor(x, color) {
    this.nextPuyoSprites[x].texture = this.puyoTextures[color + 9];
  }
  setVisiblePuyo(x, y) {
    this.puyoSprites[y][x].visible = true;
  }

  setInvisiblePuyo(x, y) {
    this.puyoSprites[y][x].visible = false;
  }

  setInvisiblePuyos(points) {
    for (const p of points) {
      this.puyoSprites[p.y][p.x].visible = false;
    }
  }

  setVisibleNext(x) {
    this.nextPuyoSprites[x].visible = true;
  }
  setInvisibleNext(x) {
    this.nextPuyoSprites[x].visible = false;
  }
  setInvisibleNexts(list) {
    for (const x of list) {
      this.nextPuyoSprites[x].visible = false;
    }
  }

  allPuyoVisible() {
    for (let y = 0; y < this.field.height; y++) {
      for (let x = 0; x < this.field.width; x++) {
        this.setVisiblePuyo(x, y);
      }
    }
  }

  allNextVisible() {
    for (let x = 0; x < this.field.width; x++) {
      this.setVisibleNext(x);
    }
  }

  allVisible() {
    this.allPuyoVisible();
    this.allNextVisible();
  }

  getPuyoSprite(x, y) {
    return this.puyoSprites[y][x];
  }

  isSelected(x, y) {
    return this.selectedField[y][x];
  }

  select(x, y) {
    this.selectedField[y][x] = true;
  }

  deleteSelectPuyo() {
    this.field.deletePuyos(this.selectRoute.points);
  }

  setRoute(route) {
    this.selectRoute = route.clone();
  }

  resetRoute() {
    this.selectRoute = new Route();
  }

  /**
   * 指定座標に隣接している座標が選択済みか調べる
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isAdjacentSelected(x, y) {
    let ap = this.field.getAdjacentPoints(x, y);
    for (const point of ap) {
      if (this.isSelected(point.x, point.y)) return true;
    }
    return false;
  }
}
