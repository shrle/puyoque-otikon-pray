export default class Queue {
  constructor() {
    this.root = null;
    this.head = null;
    this._size = 0;
  }

  push(value) {
    if (this._size > 0) {
      this.head.next = { value, next: null };
      this.head = this.head.next;
    } else {
      // this._size === 0
      this.root = { value, next: null };
      this.head = this.root;
    }

    this._size++;
  }

  pop() {
    if (this._size === 0) return null;
    const r = this.root.value;
    this.root = this.root.next;
    this._size--;

    return r;
  }

  get size() {
    return this._size;
  }
}
