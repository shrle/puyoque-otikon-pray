export default class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  comp(x, y) {
    return this.x === x && this.y === y;
  }
  clone() {
    return new Point(this.x, this.y);
  }
}
