/**
 * @callback DragCallback
 * @param {PIXI.Sprite} sprite ドラッグ中のスプライト
 */
/**
 * 指定したスプライトにドラッグ機能を追加します。
 *
 * @param {PIXI.Sprite} sprite ドラッグ機能を追加するスプライト
 * @param {Object} callbacks ドラッグイベントのコールバック関数
 * @param {DragCallback} callbacks.start ドラッグ開始時に呼び出される関数
 * @param {DragCallback} callbacks.move ドラッグ中継時に呼び出される関数
 * @param {DragCallback} callbacks.end ドラッグ終了時に呼び出される関数
 */
function addDrag(sprite, callbacks = {}) {
  console.dir(callbacks);
  sprite.eventMode = "static";
  sprite.cursor = "pointer";

  const onDragStart = function () {
    _onDragStart(sprite);

    moveFunc = function (event) {
      _onDragMove(event);
      if (typeof callbacks.move === "function") callbacks.move(sprite);
    };

    endFunc = function () {
      _onDragEnd();
      if (typeof callbacks.end === "function") callbacks.end(sprite);
    };

    if (typeof callbacks.start === "function") callbacks.start(sprite);
  };

  sprite.on("pointerdown", onDragStart, sprite);
}

let dragTarget = null;

/**
 * canvas on drag setting
 * @param {PIXI.Application} app
 */
let init = (app, hitArea) => {
  app.stage.eventMode = "static";
  app.stage.hitArea = hitArea;
  app.stage.on("pointerup", onDragEnd);
  app.stage.on("pointerupoutside", onDragEnd);
  app.stage.on("pointermove", onDragMove);
};

const _onDragStart = function (sprite) {
  dragTarget = sprite;
};

const onDragMove = function (event) {
  moveFunc(event);
};

const _onDragMove = function (event) {
  if (dragTarget) {
    dragTarget.parent.toLocal(event.global, null, dragTarget.position);
  }
};

let moveFunc = function () {};

let onDragEnd = function () {
  endFunc();
};

const _onDragEnd = function () {
  if (dragTarget) {
    //app.stage.off('pointermove', onDragMove);
    moveFunc = function () {};
    endFunc = function () {};
    dragTarget = null;
  }
};
let endFunc = function () {};

export { init, addDrag };
