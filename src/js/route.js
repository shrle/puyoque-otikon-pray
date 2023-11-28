export default class Route {
  constructor() {
    this._points = [];
  }

  get points() {
    return this._points;
  }
  get length() {
    return this._points.length;
  }

  push(point) {
    this._points.push(point.clone());
  }
  comp(routeB) {
    if (this.length != routeB.length) return false;

    let registered = false;
    for (let an = 0; an < this.length; an++) {
      registered = false;
      for (let bn = 0; bn < routeB.length; bn++) {
        if (this._points[an].comp(routeB.x(bn), routeB.y(bn)))
          registered = true;
      }
      if (!registered) return false;
    }
    return true;
  }
  x(index) {
    return this._points[index].x;
  }
  y(index) {
    return this._points[index].y;
  }
  isRegistered(x, y) {
    for (const point of this._points) {
      if (point.comp(x, y)) return true;
    }
    return false;
  }
  clone() {
    let route = new Route();
    for (const point of this._points) {
      route.push(point);
    }
    return route;
  }
}
