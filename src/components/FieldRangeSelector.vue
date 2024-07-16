<template>
  <div class="field-range-selector">
    <div class="fieldcap-frame">
      <div class="fieldcap-frame-controlls">
        <menu class="fieldcap-frame-buttons">
          <div class="left">
            <button class="fieldcap-frame-cancel" @click="prev" disabled>
              <span class="material-symbols-outlined"> close </span>
            </button>
          </div>
          <div class="center"></div>
          <div class="right">
            <button class="fieldcap-frame-ok" @click="ok" disabled>
              <span class="material-symbols-outlined"> arrow_forward </span>
            </button>
          </div>
        </menu>

        <article class="area-controllers">
          <h3>ドラッグと入力で盤面の範囲を指定してください</h3>
          <section class="input-line">
            <div>左上</div>

            <div class="input-number">
              <label for="lefttop-x"> </label>
              <button class="" @click="downLeftTopX" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_left
                </span>
              </button>
              <input type="number" name="lefttop-x" v-model="leftTopX" />
              <button class="" @click="upLeftTopX" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_right
                </span>
              </button>
            </div>

            <div class="input-number">
              <label for="lefttop-y"> </label>
              <button class="" @click="downLeftTopY" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_down
                </span>
              </button>
              <input type="number" name="lefttop-y" v-model="leftTopY" />
              <button class="" @click="upLeftTopY" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_up
                </span>
              </button>
            </div>
          </section>

          <section class="input-line">
            <div>右下</div>

            <div class="input-number">
              <label for="rightbottom-x"> </label>
              <button class="" @click="downRightBottomX" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_left
                </span>
              </button>
              <input
                type="number"
                name="rightbottom-x"
                v-model="rightBottomX"
              />
              <button class="" @click="upRightBottomX" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_right
                </span>
              </button>
            </div>

            <div class="input-number">
              <label for="rightbottom-y"> </label>
              <button class="" @click="downRightBottomY" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_down
                </span>
              </button>

              <input
                type="number"
                name="rightbottom-y"
                v-model="rightBottomY"
              />
              <button class="" @click="upRightBottomY" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_up
                </span>
              </button>
            </div>
          </section>

          <h3>色を抽出する座標を入力してください</h3>
          <section class="input-line">
            <div>
              <span class="material-symbols-outlined"> colorize </span>
            </div>

            <div class="input-number">
              <label for="rightbottom-x"> </label>
              <button class="" @click="downColorPickerX" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_left
                </span>
              </button>
              <input
                type="number"
                max="100"
                min="0"
                name="color-pick-x"
                v-model="colorPickerX"
              />
              <button class="" @click="upColorPickerX" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_right
                </span>
              </button>
            </div>

            <div class="input-number">
              <label for="rightbottom-y"> </label>

              <button class="" @click="downColorPickerY" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_down
                </span>
              </button>
              <input
                type="number"
                max="100"
                min="0"
                name="color-pick-y"
                v-model="colorPickerY"
              />
              <button class="" @click="upColorPickerY" disabled>
                <span class="material-symbols-outlined">
                  keyboard_arrow_up
                </span>
              </button>
            </div>
          </section>
        </article>
      </div>

      <div class="field-canvas-container"></div>
    </div>
  </div>
</template>

<script>
import {
  appInit,
  setLeftTopDragListener,
  setRightBottomDragListener,
  setImage,
  setLeftTopCursorPoint,
  setRightBottomCursorPoint,
  //getCursorAreaImage,
} from "@/js/pixi-range-selector";
import * as FieldColorPicker from "@/js/field-color-picker";
import array2dInit from "@/js/array2d-init";

export default {
  name: "FieldRangeSelector",
  components: {},
  props: { canvasImage: Image },
  mounted() {
    this.pixiApp = appInit(screen.width, screen.height);
    this.ssCanvas = this.pixiApp.view;
    this.loadCursorArea();
    this.loadColorPickerPoint();

    FieldColorPicker.appInit(this.pixiApp);
  },
  data() {
    return {
      pixiApp: null,
      ssCanvas: null,
      settingSkip: false,
      areaImage: null,
      ssExtractionMap: array2dInit(8, 6, "00ff00"),
      map: array2dInit(8, 6, -1),
      leftTopX: 0,
      leftTopY: 0,
      rightBottomX: 0,
      rightBottomY: 0,
      colorPickerX: 0,
      colorPickerY: 0,
      leftTop: { x: 0, y: 0 },
      rightBottom: { x: 0, y: 0 },
      pickPuyo: 0,
    };
  },
  watch: {
    canvasImage() {
      this.setCanvasImage();
    },
    leftTopX() {
      setLeftTopCursorPoint(this.leftTopX, this.leftTopY);
    },
    leftTopY() {
      setLeftTopCursorPoint(this.leftTopX, this.leftTopY);
    },
    rightBottomX() {
      setRightBottomCursorPoint(this.rightBottomX, this.rightBottomY);
    },
    rightBottomY() {
      setRightBottomCursorPoint(this.rightBottomX, this.rightBottomY);
    },
    colorPickerX(x) {
      this.colorPickerX = this.clamp(x);
      this.setColorPickerPoint();
    },
    colorPickerY(y) {
      this.colorPickerY = this.clamp(y);
      this.setColorPickerPoint();
    },
  },
  methods: {
    clamp(x) {
      x = x < 0 ? 0 : x;
      x = x > 100 ? 100 : x;
      return x;
    },

    removeCanvas() {
      if (this.ssCanvas.parentNode) {
        this.ssCanvas.parentNode.removeChild(this.ssCanvas);
      }
    },
    allButtonEnable() {
      document
        .querySelectorAll(".field-range-selector button")
        .forEach((button) => {
          button.disabled = false;
        });
    },
    allButtonDisabled() {
      document
        .querySelectorAll(".field-range-selector button")
        .forEach((button) => {
          button.disabled = true;
        });
    },
    active() {
      document.documentElement.requestFullscreen({ navigationUI: "hide" });
      this.showCanvas();
      setTimeout(this.allButtonEnable, 1000);
    },
    showCanvas() {
      this.removeCanvas();
      document
        .querySelector(".field-canvas-container")
        .appendChild(this.ssCanvas);

      this.setDragListener();
      this.setCursorPoint();
      this.setColorPickerPoint();
      FieldColorPicker.showDrawArea();
    },
    setDragListener() {
      setLeftTopDragListener({ end: this.setLeftTop });
      setRightBottomDragListener({ end: this.setRightBottom });
    },

    setCursorPoint() {
      setLeftTopCursorPoint(this.leftTopX, this.leftTopY);
      setRightBottomCursorPoint(this.rightBottomX, this.rightBottomY);
    },
    setColorPickerPoint() {
      FieldColorPicker.setColorPickerPoint(
        this.colorPickerX,
        this.colorPickerY
      );
    },
    setCanvasImage() {
      //setTimeout(() => {
      setImage(this.canvasImage);
      setLeftTopCursorPoint(this.leftTopX, this.leftTopY);
      setRightBottomCursorPoint(this.rightBottomX, this.rightBottomY);
      //}, 500);

      if (this.settingSkip) {
        setTimeout(() => {
          this.ok();
        }, 1000);
      }
    },
    setLeftTop(sprite) {
      this.leftTopX = parseInt(sprite.x);
      this.leftTopY = parseInt(sprite.y);
    },
    setRightBottom(sprite) {
      this.rightBottomX = parseInt(sprite.x);
      this.rightBottomY = parseInt(sprite.y);
    },

    prev() {
      this.allButtonDisabled();
      FieldColorPicker.hideDrawArea();
      this.$emit("prev-step");
    },
    ok: async function () {
      this.allButtonDisabled();
      //this.areaImage = await getCursorAreaImage();
      const map = await FieldColorPicker.extractColorCodeFromMap();

      this.saveCursorArea();
      this.saveColorPickerPoint();
      FieldColorPicker.hideDrawArea();
      this.$emit("set-extract-color-map", map);
    },
    initCursorArea() {
      const h = screen.height;
      const w = screen.width;

      this.leftTopX = 100;
      this.leftTopY = h / 2 + 100;
      this.rightBottomX = w - 100;
      this.rightBottomY = h - 100;
    },
    loadCursorArea() {
      const ltx = localStorage.getItem("field-leftTopX");
      const lty = localStorage.getItem("field-leftTopY");
      const rbx = localStorage.getItem("field-rightBottomX");
      const rby = localStorage.getItem("field-rightBottomY");

      if (ltx) {
        this.leftTopX = ltx;
        this.leftTopY = lty;
        this.rightBottomX = rbx;
        this.rightBottomY = rby;
      } else {
        this.initCursorArea();
      }

      return { ltx, lty, rbx, rby };
    },
    saveCursorArea() {
      localStorage.setItem("field-leftTopX", this.leftTopX);
      localStorage.setItem("field-leftTopY", this.leftTopY);
      localStorage.setItem("field-rightBottomX", this.rightBottomX);
      localStorage.setItem("field-rightBottomY", this.rightBottomY);
    },
    loadColorPickerPoint() {
      const x = localStorage.getItem("field-colorPickerX");
      const y = localStorage.getItem("field-colorPickerY");

      if (x) {
        this.colorPickerX = x;
        this.colorPickerY = y;
      } else {
        this.colorPickerX = 49;
        this.colorPickerY = 91;
      }
    },
    saveColorPickerPoint() {
      localStorage.setItem("field-colorPickerX", this.colorPickerX);
      localStorage.setItem("field-colorPickerY", this.colorPickerY);
    },

    upLeftTopX() {
      this.leftTopX++;
    },
    downLeftTopX() {
      this.leftTopX--;
    },
    upLeftTopY() {
      this.leftTopY++;
    },
    downLeftTopY() {
      this.leftTopY--;
    },
    upRightBottomX() {
      this.rightBottomX++;
    },
    downRightBottomX() {
      this.rightBottomX--;
    },
    upRightBottomY() {
      this.rightBottomY++;
    },
    downRightBottomY() {
      this.rightBottomY--;
    },
    upColorPickerX() {
      this.colorPickerX++;
    },
    downColorPickerX() {
      this.colorPickerX--;
    },
    upColorPickerY() {
      this.colorPickerY++;
    },
    downColorPickerY() {
      this.colorPickerY--;
    },
  },
};
</script>

<style scoped>
[v-cloak] {
  display: none;
}
* {
  margin: 0px;
  padding: 0px;
}

img {
  line-height: 0;
}
.field-range-selector {
  display: flex;
  flex-direction: column;
}

.field-range-selector > * {
  margin-bottom: 10px;
}

.field-range-selector h3 {
  margin-top: 20px;
  font-size: 15px;
}
input[type="number"] {
  width: 50px;
  height: 40px;
  border: 0;
  border-bottom: #000000 2px solid;
  text-align: center;
}

.field-range-selector button {
  width: 40px;
  height: 40px;
  border: 0;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.field-range-selector button:hover {
  background-color: #cccccc;
}

.field-range-selector button:active {
  background-color: #aaaaaa;
}

.field-range-selector .text-button {
  background-color: #000000;
  color: #ffffff;
  width: 120px;
  height: 30px;
  border-radius: 18px;
  border: transparent 2px solid;
}

.field-range-selector .text-button:active {
  background-color: #222222;
}

.field-range-selector .text-button:focus {
  background-color: #ffffff;
  border: #000000 2px solid;
  color: #000000;
}

.fieldcap-frame {
  background-color: rgb(255, 255, 255);
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 1001;

  top: 0;
  left: 0;
}

.fieldcap-frame-controlls {
  background-color: rgb(255, 255, 255);
  width: 100vw;
  height: 50vh;
  position: fixed;
  z-index: 1001;

  top: 0;
  left: 0;

  overflow: auto;

  box-shadow: 0 0 50px 15px rgba(100, 100, 100, 0.1);
}

.fieldcap-frame-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  border: 0px;
}
.fieldcap-frame-buttons > left,
.fieldcap-frame-buttons > right {
  width: 40px;
  height: 40px;
}
.fieldcap-frame-buttons > center {
  flex: auto;
}

.field-canvas-container {
  overflow: hidden;
  width: 100%;
  height: 100%;
  border: 0px;
  text-align: center;
}

.area-controllers {
  width: 100%;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
}

.input-line {
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
}

.input-line .input-number {
  display: flex;
  flex-direction: row;
  row-gap: 10px;
}

.input-line > * {
  margin-right: 20px;
}
.input-line > * > label {
  margin-right: 20px;
}

.display_map {
  background-color: #000000;
  display: grid;
  grid: 54px 54px 54px 54px 54px 54px/ 60px 60px 60px 60px 60px 60px 60px 60px;
  width: 480px;
  height: 324px;
  padding: 0px;
}
.display_map div {
  width: 60px;
  height: 54px;
  margin: 0px;
  padding: 0px;
}
.display_map img {
  width: 60px;
  height: 54px;
}
</style>
