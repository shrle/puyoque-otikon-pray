import Point from "./point.js";
import Queue from "./queue.js";
import codeToPoint from "./code-to-point.js";

class Puyo {
  constructor(color, chance) {
    this.color = color;
    this.chance = chance;
  }

  clone() {
    return new Puyo(this.color, this.chance);
  }
}

class FloatingPuyo {
  /**
   * 浮遊しているぷよの情報
   * @param {number} x
   * @param {number} y
   * @param {PuyoqueStd.puyoColor} color
   * @param {boolean} chance
   * @param {number} dropStep 落下する段数
   */
  constructor(x, y, color, chance, dropStep) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.chance = chance;
    this.dropStep = dropStep;
  }
}

export default class PuyoqueStd {
  constructor() {}

  static puyoColor = {
    blank: -1,
    red: 0,
    blue: 1,
    yellow: 2,
    green: 3,
    purple: 4,
    heart: 5,
    prism: 6,
    ojama: 7,
    kataPuyo: 8,
    ojamaChanging: 9,
  };

  /**
   *
   * @param {nuber} width
   * @param {nuber} height
   *
   * @returns {Field}
   */
  static createField(width, height) {
    return new Field(width, height);
  }

  static array2dInit(width, height, value) {
    let array = [];

    for (let y = 0; y < height; y++) {
      array[y] = [];
      for (let x = 0; x < width; x++) {
        array[y][x] = value;
      }
    }
    return array;
  }

  /**
   * 同時消し倍率の取得
   *
   * @param {number} deletePuyoNum 同時消し数
   * @param {number} doujiCorrection 同時消し係数の補正
   * @param {number} erasePuyoLength ぷよの消える最小数
   * @returns {number}
   */
  static getDoujiMag(deletePuyoNum, doujiCorrection, erasePuyoLength) {
    return 1 + (deletePuyoNum - erasePuyoLength) * (0.15 * doujiCorrection);
  }

  /**
   * 連鎖倍率の取得
   *
   * @param {number} chainNum 連鎖数
   * @param {number} chainCorrection 連鎖係数の補正
   * @returns {number}
   */
  // 連鎖係数のテーブル 50連鎖分
  static chainCoefficientTable = [
    0.0, 0.4, 0.7, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.2,
    3.4, 3.6, 3.8, 4.0, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
    4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
    4.2, 4.2, 4.2, 4.2, 4.2,
  ];
  static getChainMag(chainNum, chainCorrection) {
    return PuyoqueStd.chainCoefficientTable[chainNum] * chainCorrection + 1;
  }

  /**
   * 色ぷよの攻撃倍率計算
   * プリズムボールや分離消しボーナスなどは含まない
   * @param {number} deletePuyoNum   消えたぷよの数
   * @param {number} chainNum        連鎖数
   * @param {number} doujiCorrection 同時消し係数
   * @param {number} chainCorrection 連鎖倍率
   * @param {number} erasePuyoLength ぷよが消える長さ
   */
  static puyoMagCalc(
    deletePuyoNum,
    chainNum,
    doujiCorrection,
    chainCorrection,
    erasePuyoLength
  ) {
    let doujiMag = PuyoqueStd.getDoujiMag(
      deletePuyoNum,
      doujiCorrection,
      erasePuyoLength
    ); // 同時消し倍率
    let chainMag = PuyoqueStd.getChainMag(chainNum, chainCorrection); // 連鎖倍率
    return doujiMag * chainMag;
  }

  /**
   * 色の種類を数える
   *
   * @param {PuyoqueStd.puyoColor[]} colorList 色の種類のリスト 同じ色が格納されていても良い
   * @returns {number} 重複を含まない色の種類の数
   */
  static countColor(colorList) {
    let count = 0;
    let colorFlag = 0;
    for (let i = 0; i < colorList.length; i++) {
      if (colorList[i] < 0) continue;
      let bit = 1 << colorList[i];
      if ((colorFlag ^ bit) > 0) count++;
      colorFlag = colorFlag | bit;
    }

    return count;
  }
}

class Field {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.map = [];
    this.next = [];
    this.mapRecord = [];
    this.mapClear();
    this.nextClear();
    this.floatingPuyo = [];

    /**
     * マップの各マスの隣接する座標が格納される
     * adjacentPoints[0][0] = [[0,1],[1,0]]
     */
    this.adjacentPoints = [];

    {
      const adjacentPoint = [
        //new Point(-1, -1),
        new Point(0, -1),
        //new Point(1, -1),
        new Point(1, 0),
        //new Point(1, 1),
        new Point(0, 1),
        //new Point(-1, 1),
        new Point(-1, 0),
      ];
      for (let y = 0; y < this.height; y++) {
        let line = [];
        for (let x = 0; x < this.width; x++) {
          let adjacent = [];
          for (const ap of adjacentPoint) {
            const point = new Point(x + ap.x, y + ap.y);
            if (!this.isRangeField(point.x, point.y)) continue;
            adjacent.push(point);
          }
          line.push(adjacent);
        }
        this.adjacentPoints.push(line);
      }
    }
  }

  mapClear() {
    this.map = [];

    for (let y = 0; y < this.height; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.map[y][x] = new Puyo(PuyoqueStd.puyoColor.blank, false);
      }
    }
  }

  nextClear() {
    this.next = [];
    for (let x = 0; x < this.width; x++) {
      this.next[x] = new Puyo(PuyoqueStd.puyoColor.blank, false);
    }
  }

  clear() {
    this.mapClear();
    this.nextClear();

    this.mapRecord = [];
  }

  getAdjacentPoints(x, y) {
    return this.adjacentPoints[y][x];
  }

  mapClone() {
    let clone = [];

    for (let y = 0; y < this.height; y++) {
      clone[y] = [];
      for (let x = 0; x < this.width; x++) {
        clone[y][x] = this.puyoClone(x, y);
      }
    }
    return clone;
  }

  nextsClone() {
    let clone = [];

    for (let x = 0; x < this.width; x++) {
      clone[x] = this.nextClone(x);
    }

    return clone;
  }

  recordMap() {
    this.mapRecord.push({
      map: this.mapClone(),
      next: this.nextsClone(),
    });
  }

  undoMap() {
    if (this.mapRecord.length === 0) return;
    let record = this.mapRecord.pop();
    this.map = record.map;
    this.next = record.next;
  }

  /**
   * 座標がフィールド範囲内か調べる
   * @param {number} x
   * @param {number} y
   */
  isRangeField(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  setColor(x, y, color) {
    if (!this.isRangeField(x, y)) return;
    this.map[y][x].color = color;
  }
  getColor(x, y) {
    if (!this.isRangeField(x, y)) return PuyoqueStd.puyoColor.blank;
    return this.map[y][x].color;
  }

  getChance(x, y) {
    if (!this.isRangeField(x, y)) return PuyoqueStd.puyoColor.blank;
    return this.map[y][x].chance;
  }

  setPuyo(x, y, color, isChance) {
    if (!this.isRangeField(x, y)) return;
    this.map[y][x].color = color;
    this.map[y][x].chance = isChance;
  }

  setNextColor(x, color) {
    if (!this.isRangeField(x, 0)) return;
    this.next[x].color = color;
  }
  setNextPuyo(x, color, isChance) {
    if (!this.isRangeField(x, 0)) return;
    this.next[x].color = color;
    this.next[x].chance = isChance;
  }
  getNextColor(x) {
    if (!this.isRangeField(x, 0)) return PuyoqueStd.puyoColor.blank;
    return this.next[x].color;
  }

  getNextChance(x) {
    if (!this.isRangeField(x, 0)) return PuyoqueStd.puyoColor.blank;
    return this.next[x].chance;
  }

  setAllNextColor(color) {
    for (let i = 0; i < this.width; i++) {
      this.next[i].color = color;
    }
  }

  setChance(x, y) {
    if (!this.isRangeField(x, y)) return;
    this.map[y][x].chance = true;
  }
  deleteChance(x, y) {
    if (!this.isRangeField(x, y)) return PuyoqueStd.puyoColor.blank;
    this.map[y][x].chance = false;
  }

  deletePuyo(x, y) {
    this.deleteChance(x, y);
    this.setColor(x, y, PuyoqueStd.puyoColor.blank);
  }

  deletePuyos(pointList) {
    pointList.forEach((point) => {
      this.deletePuyo(point.x, point.y);
    });
  }

  deletePuyosFromCode(code) {
    for (const c of code) {
      const p = codeToPoint[c];
      this.deletePuyo(p.x, p.y);
    }
  }

  setPuyosColorFromCode(code, color) {
    for (const c of code) {
      const p = codeToPoint[c];
      this.setColor(p.x, p.y, color);
    }
  }

  deleteNext(x) {
    this.setNextColor(x, PuyoqueStd.puyoColor.blank);
  }

  puyoClone(x, y) {
    let color = this.getColor(x, y);
    let chance = this.getChance(x, y);
    return new Puyo(color, chance);
  }

  nextClone(x) {
    let color = this.getNextColor(x);
    let chance = false;
    return new Puyo(color, chance);
  }

  setMapColor(map) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setPuyo(x, y, map[y][x], false);
      }
    }
  }

  setMapPuyo(map) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setPuyo(x, y, map[y][x].color, map[y][x].chance);
      }
    }
  }

  setNexts(nexts) {
    for (let x = 0; x < this.width; x++) {
      this.setNextPuyo(x, nexts[x].color, nexts[x].chance);
    }
  }

  /**
   *
   * @param {Number[]} Number is puyo index
   */
  setNextColors(colors) {
    for (let x = 0; x < this.width; x++) {
      this.setNextPuyo(x, colors[x], false);
    }
  }

  getMap() {
    let cloneMap = [];

    for (let y = 0; y < this.height; y++) {
      cloneMap[y] = [];
      for (let x = 0; x < this.width; x++) {
        cloneMap[y][x] = this.getColor(x, y);
      }
    }
    return cloneMap;
  }

  output() {
    let text = "";
    for (let x = 0; x < this.width; x++) {
      let color = this.getNextColor(x);
      let chance = this.getNextChance(x);
      if (0 <= color && color < 10) {
        text += chance ? "*" : " ";
      }
      text += color;
      text += x < this.width - 1 ? "," : "";
    }

    text += "\n------------------------\n";

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let color = this.getColor(x, y);
        let chance = this.getChance(x, y);
        if (0 <= color && color < 10) {
          text += chance ? "*" : " ";
        }
        text += color;
        text += x < this.width - 1 ? "," : "";
      }
      text += "\n";
    }

    console.log(text);
  }

  shiftColor(x, y) {
    if (this.isBlank(x, y)) return false;
    let puyoColor = PuyoqueStd.puyoColor;
    let changedColor = [
      puyoColor.blue,
      puyoColor.yellow,
      puyoColor.green,
      puyoColor.purple,
      puyoColor.red,
    ];
    let color = this.getColor(x, y);
    this.setColor(x, y, changedColor[color]);
  }

  shuffleMap() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.shiftColor(x, y);
      }
    }
  }

  /**
   * 指定座標の上下左右の色を調べる
   * フィールド外は呼び出さない
   */
  targetAround(x, y, callback) {
    let color = this.getColor(x - 1, y);
    if (this.isRangeField(x - 1, y)) callback(x - 1, y, color);

    color = this.getColor(x, y - 1);
    if (this.isRangeField(x, y - 1)) callback(x, y - 1, color);

    color = this.getColor(x + 1, y);
    if (this.isRangeField(x + 1, y)) callback(x + 1, y, color);

    color = this.getColor(x, y + 1);
    if (this.isRangeField(x, y + 1)) callback(x, y + 1, color);
  }

  /**
   * 複数の指定座標の上下左右の色を調べる
   * フィールド外は呼び出さない
   */
  targetsAround(points, callback) {
    for (const p of points) {
      this.targetAround(p.x, p.y, callback);
    }
  }

  /**
   * 指定座標に対する上下左右それぞれの色を引数に呼び出される
   * @callback targetAround
   *
   * @param {Point} x, y
   * @param {PuyoqueStd.puyoColor} color
   */

  /**
   * 指定座標が色ぷよかどうか判定
   * @returns \{boolean\}
   */
  isPuyo(x, y) {
    let color = this.getColor(x, y);
    return (
      color >= PuyoqueStd.puyoColor.red && color <= PuyoqueStd.puyoColor.purple
    );
  }

  /**
   * 指定座標がなぞり消し可能か調べる
   */
  canTracePuyo(x, y) {
    let color = this.getColor(x, y);
    return (
      color >= PuyoqueStd.puyoColor.red && color <= PuyoqueStd.puyoColor.prism
    );
  }

  /**
   * 指定座標リストが全てなぞり消し可能か調べる
   */
  canTraceRoute(points) {
    for (const point of points) {
      if (!this.canTracePuyo(point.x, point.y)) return false;
    }
    return true;
  }

  isChancePuyo(x, y) {
    if (!this.isRangeField(x, y)) return false;
    return this.map[y][x].chance;
  }

  isBlank(x, y) {
    return this.getColor(x, y) === PuyoqueStd.puyoColor.blank;
  }

  isBlanks(points) {
    for (const point of points) {
      if (this.getColor(point.x, point.y) !== PuyoqueStd.puyoColor.blank)
        return false;
    }
    return true;
  }

  isNextBlank(x) {
    return this.getNextColor(x) === PuyoqueStd.puyoColor.blank;
  }

  /**
   * 指定列が埋まっているか調べる
   *
   * @param {number} x 列
   * @returns {boolean} 埋まっていたらtrue
   */
  isFull(x) {
    return !this.isBlank(x, 0);
  }

  isAllClear() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.isBlank(x, y)) return false;
      }
    }
    return true;
  }

  /**
   *  指定座標のぷよと指定色が一致しているか
   * @param {number} x
   * @param {number} y
   * @param {PuyoqueStd.puyoColor} color
   */
  colorComp(x, y, color) {
    return this.getColor(x, y) === color;
  }
  /**
   * 指定座標のぷよと複数の指定色のいずれかでも一致しているか
   * @param {number} x
   * @param {number} y
   * @param {PuyoqueStd.puyoColor} colors
   */
  colorMultComp(x, y, colors) {
    for (const color of colors) {
      if (this.colorComp(x, y, color)) return true;
    }
    return false;
  }

  twoPointColorComp(aX, aY, bX, bY) {
    return this.getColor(aX, aY) === this.getColor(bX, bY);
  }

  /**
   * 指定列に指定色を落とす
   * @param {number} x
   * @param {PuyoqueStd.puyoColor} color
   */
  dropPuyo(x, color) {
    if (!this.isRangeField(x, 0)) return;
    let y;
    for (y = this.height; y >= 0; y--) {
      if (this.isBlank(x, y)) break;
    }
    if (y >= 0) this.setColor(x, y, color);
  }

  /**
   * 浮いているぷよの情報を返す
   * @returns {FloatingPuyo[]}
   */
  getFloatingPuyo() {
    let puyos = [];
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
        else if (blankNum > 0) {
          let puyo = this.puyoClone(x, y);
          puyos.push(new FloatingPuyo(x, y, puyo.color, puyo.chance, blankNum));
        }
      }
    }
    return puyos;
  }

  /**
   * 浮遊ぷよの情報を保存
   */
  holdFloatingPuyo() {
    this.floatingPuyo = this.getFloatingPuyo();
  }

  /**
   * 盤面上の浮遊ぷよを削除
   */
  deleteFoatingPuyo() {
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
        else if (blankNum > 0) {
          this.deletePuyo(x, y);
        }
      }
    }
  }

  /**
   * 各座標のぷよが浮いているか真偽値
   * true = 浮いている, false = 浮いていない
   * @returns {boolean[][]}
   */
  getIsFloatingPuyoMap() {
    let map = PuyoqueStd.array2dInit(this.width, this.height, false);
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) {
          blankNum++;
        } else if (blankNum > 0) {
          map[y][x] = true;
        }
      }
    }
    return map;
  }

  /**
   * 浮いているネクストぷよの情報を返す
   * @returns {FloatingPuyo[]}
   */
  getFloatingNext() {
    let puyos = [];
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
      }
      if (blankNum === 0) continue;
      let color = this.getNextColor(x);
      if (!this.isNextBlank(x)) {
        puyos.push(new FloatingPuyo(x, -1, color, false, blankNum));
      }
    }
    return puyos;
  }

  holdFoatingNexts() {
    this.floatingPuyo = this.getFloatingNext();
  }

  deleteFoatingNexts() {
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
      }
      if (blankNum === 0) continue;
      //let color = this.getNextColor(x);
      if (!this.isNextBlank(x)) {
        this.deleteNext(x);
      }
    }
  }

  /**
   * 各座標のネクストぷよが浮いているか真偽値
   * true = 浮いている, false = 浮いていない
   * @returns {boolean[][]}
   */
  getIsFloatingNexts() {
    let nexts = [];
    //let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      //blankNum = 0;
      nexts[x] = false;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) {
          nexts[x] = true;
          break;
        }
      }
    }
  }

  /**
   * 浮いているぷよを落とす
   */
  dropFloatingPuyo() {
    let blankQueue = [];
    for (let x = 0; x < this.width; x++) {
      blankQueue = [];
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankQueue.push(new Point(x, y));
        else if (blankQueue.length > 0) {
          let blankPoint = blankQueue.shift();
          let color = this.getColor(x, y);
          this.setColor(blankPoint.x, blankPoint.y, color);
          this.deletePuyo(x, y);
          blankQueue.push(new Point(x, y));
        }
      }
    }
  }

  /**
   * 浮いているネクストぷよを落とす
   */
  dropFloatingNext() {
    let blankNum = 0;
    for (let x = 0; x < this.width; x++) {
      blankNum = 0;
      for (let y = this.height - 1; y >= 0; y--) {
        if (this.isBlank(x, y)) blankNum++;
      }
      if (blankNum === 0) continue;
      let color = this.getNextColor(x);
      this.setPuyo(x, blankNum - 1, color, false);
      this.deleteNext(x);
    }
  }

  /**
   * 保存した浮遊ぷよを落下させる
   */
  dropHoldFoatingPuyo() {
    for (const puyo of this.floatingPuyo) {
      const x = puyo.x;
      const y = puyo.y + puyo.dropStep;
      const color = puyo.color;
      const chance = puyo.chance;
      this.setPuyo(x, y, color, chance);
    }
  }

  /**
   * フィールド上のぷよの連結状態を調べるメソッド
   * 指定数以上のぷよの連結を見つけたら連結箇所ごとに座標リストとその色をコールバック関数にわたす
   *
   * @param {targetLink} callback
   * @param {Number} targetLinkNum 指定数
   */
  searchLinkPuyos(targetLinkNum, callback) {
    let checkedMap = PuyoqueStd.array2dInit(this.width, this.height, false);

    const height = this.height;
    const width = this.width;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!this.isPuyo(x, y)) continue;

        const pointList = this.countLinkPuyos(x, y, checkedMap);

        if (pointList.length >= targetLinkNum) {
          const color = this.getColor(x, y);
          if (callback(pointList, color) === false) return;
        }
      }
    }
  }
  /*
  searchLinkPuyos(targetLinkNum, callback) {
    let checkedMap = PuyoqueStd.array2dInit(this.width, this.height, false);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.isPuyo(x, y)) continue;

        let pointList = [];
        let color = this.getColor(x, y);
        let linkNum = this.countLinkPuyos(
          x,
          y,
          color,
          0,
          checkedMap,
          pointList
        );

        if (linkNum >= targetLinkNum) {
          if (callback(pointList, color) === false) return;
        }
      }
    }
  }
  */

  /**
   * 指定数以上のぷよの連結を見つけた場合に呼び出される
   * 連結箇所ごとに座標リストとその色を渡されるので目的に応じて処理を行う
   * @callback targetLink
   *
   * @param {Point[]} pointList
   * @param {PuyoStd.puyoColor} color
   *
   * @returns {Boolean} falseが帰ってきた場合searchLinkPuyosメソッドを途中終了させる
   */

  /**
   * フィールド上のぷよの連結数を再起的に調べる
   *
   * @param {number} x 現在座標x
   * @param {number} y 現在座標y
   * @param {bool[][]} checkedMap trueであれば探査済みのマップ
   *
   * @returns {number} 連結座標リスト
   */
  countLinkPuyos(x, y, checkedMap) {
    const queue = new Queue();
    queue.push(new Point(x, y));
    let pointList = [];
    const color = this.getColor(x, y);

    while (queue.size != 0) {
      const p = queue.pop();
      if (checkedMap[p.y][p.x] || !this.colorComp(p.x, p.y, color)) continue;

      pointList.push(new Point(p.x, p.y));
      checkedMap[p.y][p.x] = true;
      for (const ap of this.adjacentPoints[p.y][p.x]) {
        queue.push(ap);
      }
    }

    return pointList;
  }
  /*
  countLinkPuyos(x, y, color, linkNum, checkedMap, pointList) {
    if (
      !this.isRangeField(x, y) ||
      checkedMap[y][x] ||
      !this.colorComp(x, y, color)
    )
      return linkNum;

    linkNum++;
    checkedMap[y][x] = true;
    pointList.push(new Point(x, y));

    linkNum = this.countLinkPuyos(
      x,
      y - 1,
      color,
      linkNum,
      checkedMap,
      pointList
    ); // top
    linkNum = this.countLinkPuyos(
      x + 1,
      y,
      color,
      linkNum,
      checkedMap,
      pointList
    ); // right
    linkNum = this.countLinkPuyos(
      x,
      y + 1,
      color,
      linkNum,
      checkedMap,
      pointList
    ); // bottom
    linkNum = this.countLinkPuyos(
      x - 1,
      y,
      color,
      linkNum,
      checkedMap,
      pointList
    ); // left

    return linkNum;
  }
*/
  /**
   * 指定数以上のぷよの連結を見つけた場合にtrueを返す
   *
   * @param {Number} targetLinkNum 指定数
   * @returns {boolean}
   */
  isChain(targetLinkNum) {
    let chained = false;
    this.searchLinkPuyos(targetLinkNum, () => {
      chained = true;
      return false; // searchLinkPuyosを終了させる
    });
    return chained;
  }

  /**
   * 指定座標のぷよの上下左右の連結状態をビットフラグで返す
   * 最上段(y=0)は同色であってもつながらない
   *
   * @returns {bitflag}
   */
  puyoLinkState(x, y) {
    let linkState = 0;
    let top = 1 << 0,
      right = 1 << 1,
      bottom = 1 << 2,
      left = 1 << 3;

    if (y == 0) return 0;
    if (this.twoPointColorComp(x, y, x, y - 1) && y - 1 > 0)
      linkState = linkState | top;
    if (this.twoPointColorComp(x, y, x + 1, y)) linkState = linkState | right;
    if (this.twoPointColorComp(x, y, x, y + 1)) linkState = linkState | bottom;
    if (this.twoPointColorComp(x, y, x - 1, y)) linkState = linkState | left;

    return linkState;
  }

  /**
   * 指定座標のぷよの上下左右の連結状態を番号で返す
   *
   * @returns {number}
   *
   */
  puyoLinkStateNumber(x, y) {
    let linkState = 0;
    let top = 1 << 0,
      right = 1 << 1,
      bottom = 1 << 2,
      left = 1 << 3;

    linkState = this.puyoLinkState(x, y);

    let linkNum = 0;
    if (linkState === 0) linkNum = 0;
    else if (linkState == top) linkNum = 1;
    else if (linkState == right) linkNum = 2;
    else if (linkState == bottom) linkNum = 3;
    else if (linkState == left) linkNum = 4;
    else if (linkState == (top | right)) linkNum = 5;
    else if (linkState == (top | bottom)) linkNum = 6;
    else if (linkState == (top | left)) linkNum = 7;
    else if (linkState == (bottom | right)) linkNum = 8;
    else if (linkState == (bottom | left)) linkNum = 9;
    else if (linkState == (bottom | top | right)) linkNum = 10;
    else if (linkState == (bottom | top | left)) linkNum = 11;
    else if (linkState == (right | left)) linkNum = 12;
    else if (linkState == (right | left | top)) linkNum = 13;
    else if (linkState == (right | left | bottom)) linkNum = 14;
    else if (linkState == (right | left | bottom | top)) linkNum = 15;

    return linkNum;
  }
}
