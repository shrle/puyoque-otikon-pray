/**
 *
 * @typedef {Object} Score
 *
 * @property {string} routeCode なぞり消しルート
 * @property {number[]} totalColorMag 各色の攻撃力倍率
 * @property {number} chainNum 連鎖数
 * @property {number} allClear 全消しであればtrue
 * @property {number} deleteCount 消したぷよの数
 */

class Ranking {
  constructor(listMaxLength, atackColor) {
    /** @type {Score[]}  */
    this._list = [
      {
        routeCode: "A",
        totalColorMag: [-1, -1, -1, -1, -1],
        chainNum: -1,
        allClear: -1,
        deleteCount: -1,
      },
    ];
    this._listMaxLength = listMaxLength;
    this.atackColor = atackColor;
  }

  /**
   *
   * @param {Score} score
   */
  add(score) {
    if (this._list.length >= this._listMaxLength) {
      this._list[this._listMaxLength] = score;
    } else {
      this._list.push(score);
    }

    this._list.sort((a, b) => {
      if (a.totalColorMag[this.atackColor] < b.totalColorMag[this.atackColor]) {
        return 1;
      } else {
        return -1;
      }
    });

    if (this._list.length >= this._listMaxLength) {
      this._list.length = this._listMaxLength;
    }
  }

  get list() {
    return this._list;
  }
}

export default Ranking;
