<template>
  <div class="nextpuyo-color-picker">
    <div class="picker-container">
      <menu class="header-buttons">
        <div class="left">
          <button class="fieldcap-frame-cancel" @click="prev" disabled>
            <span class="material-symbols-outlined"> arrow_back </span>
          </button>
        </div>
        <div class="center"></div>
        <div class="right">
          <button class="fieldcap-frame-ok" @click="ok" disabled>
            <span class="material-symbols-outlined"> arrow_forward </span>
          </button>
        </div>
      </menu>

      <article class="puyo-color-linking">
        <h3>ぷよと抽出した色を結びつけます</h3>
        <p>まず、ぷよを選択してください</p>
        <section class="puyos">
          <div
            v-for="color in colorTypesNum"
            :class="{ 'picked-puyo': color - 1 === pickedPuyoIndex }"
            :key="color"
          >
            <img
              :src="imgUrl(color - 1)"
              alt="puyo"
              @click="pickPuyo(color - 1)"
            />
          </div>
        </section>
        <section class="puyos-color">
          <div
            v-for="(colorCode, index) in colorForNextPuyos"
            :key="index"
            :style="{
              'background-color':
                colorCode === '' ? '#000000' : '#' + colorCode,
            }"
            @click="pickPuyo(color - 1)"
          ></div>
        </section>

        <p class="mt-3">ぷよの色を選択してください</p>
        <section class="mt-3 display_map">
          <div
            alt=""
            v-for="(color, x) in extractionColorNextPuyos"
            :style="{ 'background-color': '#' + color }"
            :key="x"
            @click="pickColor(color)"
          ></div>
        </section>
      </article>
    </div>
  </div>
</template>

<script>
import array2dInit from "@/js/array2d-init";

export default {
  name: "HomeView",
  components: {},
  props: { extractionColorNextPuyos: Array },
  mounted() {
    this.loadColorForNextPuyos();
  },
  data() {
    return {
      colorTypesNum: 9,
      map: array2dInit(8, 6, -1),
      colorForNextPuyos: ["", "", "", "", "", "", "", "", ""],
      pickedPuyoIndex: 0,
    };
  },
  watch: {
    extractionColorNextPuyos() {
      console.log("watch extractionColorNextPuyos");
      console.dir(this.extractionColorNextPuyos);
    },
  },
  methods: {
    clamp(x) {
      x = x < 0 ? 0 : x;
      x = x > 100 ? 100 : x;
      return x;
    },

    allButtonEnable() {
      document
        .querySelectorAll(".nextpuyo-color-picker button")
        .forEach((button) => {
          button.disabled = false;
        });
    },
    allButtonDisabled() {
      document
        .querySelectorAll(".nextpuyo-color-picker button")
        .forEach((button) => {
          button.disabled = true;
        });
    },
    active() {
      setTimeout(this.allButtonEnable, 1000);
    },
    prev() {
      this.allButtonDisabled();
      this.$emit("prev-step");
    },
    ok: async function () {
      this.allButtonDisabled();
      this.$emit("set-color-for-nextpuyos", this.colorForNextPuyos);
    },
    pickPuyo(index) {
      this.pickedPuyoIndex = index;
    },
    pickColor(color) {
      this.colorForNextPuyos[this.pickedPuyoIndex] = color;
      const str = JSON.stringify(this.colorForNextPuyos);
      localStorage.setItem("colorForNextPuyos", str);
    },
    loadColorForNextPuyos() {
      const str = localStorage.getItem("colorForNextPuyos");
      if (!str) return;
      this.colorForNextPuyos = JSON.parse(str);
    },
    imgUrl(imgNum) {
      var puyoImg = [
        "./img/next-red.webp",
        "./img/next-blue.webp",
        "./img/next-yellow.webp",
        "./img/next-green.webp",
        "./img/next-purple.webp",
        "./img/heart.webp",
        "./img/prism.webp",
        "./img/ojama.webp",
        "./img/katapuyo.webp",
      ];

      if (imgNum == -1) return "./img/blank_r.gif";

      return puyoImg[imgNum];
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

.nextpuyo-color-picker img {
  line-height: 0;
  vertical-align: top;
}

.nextpuyo-color-picker h3 {
  margin-top: 20px;
  font-size: 15px;
}
.nextpuyo-color-picker button {
  width: 40px;
  height: 40px;
  border: 0;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.nextpuyo-color-picker button:hover {
  background-color: #cccccc;
}

.nextpuyo-color-picker button:active {
  background-color: #aaaaaa;
}

.nextpuyo-color-picker .text-button {
  background-color: #000000;
  color: #ffffff;
  width: 120px;
  height: 30px;
  border-radius: 18px;
  border: transparent 2px solid;
}

.nextpuyo-color-picker .text-button:active {
  background-color: #222222;
}

.nextpuyo-color-picker .text-button:focus {
  background-color: #ffffff;
  border: #000000 2px solid;
  color: #000000;
}

.header-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  border: 0px;
}
.header-buttons > left,
.header-buttons > right {
  width: 40px;
  height: 40px;
}
.header-buttons > center {
  flex: auto;
}

.nextpuyo-color-picker {
  display: flex;
  flex-direction: column;
}

.picker-container {
  background-color: rgb(255, 255, 255);
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 1001;

  top: 0;
  left: 0;
}

.nextpuyo-color-picker > * {
  margin-bottom: 10px;
}

.nextpuyo-color-picker h3 {
  margin-top: 20px;
  font-size: 15px;
}
input[type="number"] {
  width: 70px;
  height: 40px;
  border: 0;
  border-bottom: #000000 2px solid;
}

.nextpuyo-color-picker button {
  width: 40px;
  height: 40px;
  border: 0;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.nextpuyo-color-picker button:hover {
  background-color: #cccccc;
}

.nextpuyo-color-picker button:active {
  background-color: #aaaaaa;
}

.nextpuyo-color-picker .text-button {
  background-color: #000000;
  color: #ffffff;
  width: 120px;
  height: 30px;
  border-radius: 18px;
  border: transparent 2px solid;
}

.nextpuyo-color-picker .text-button:active {
  background-color: #222222;
}

.nextpuyo-color-picker .text-button:focus {
  background-color: #ffffff;
  border: #000000 2px solid;
  color: #000000;
}

.puyo-color-linking {
  width: 100%;
  padding: 10px;

  display: flex;
  flex-direction: column;
}

.puyos {
  width: 100%;
  height: 40px;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
}
.puyos > * {
  width: 100%;
  height: 20px;
  margin-top: 20px;
  transition: margin-top 0.25s ease-in-out;
}

.puyos > .picked-puyo {
  margin-top: 0;
}

.puyos img {
  width: 100%;
  height: 20px;
  object-fit: contain;
}

.puyos-color {
  width: 100%;
  height: 20px;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
}
.puyos-color > * {
  width: 100%;
  height: 20px;
}

.input-line {
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
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
  grid-template-columns: repeat(8, 1fr);
  width: 100%;
}
.display_map div {
  aspect-ratio: 97/87;
}
.display_map img {
  width: 100%;
  object-fit: contain;
}
</style>
