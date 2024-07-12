<template>
  <div class="hello">
    <div class="mb-2">
      <input type="checkbox" v-model="areaSkip" id="area-skip" class="me-2" />
      <label for="area-skip">前回と同じ選択範囲を使う</label>
    </div>
    <InputImage @load-image="loadImage"></InputImage>

    <div
      id="fieldcap-frame"
      :class="{ 'd-none': !isVisible, flex: isVisible, 'opacity-0': areaSkip }"
    >
      <div id="fieldcap-frame-buttons">
        <button id="fieldcap-frame-ok" @click="ok">OK</button>
        <button id="fieldcap-frame-cancel" @click="isVisible = false">x</button>
      </div>
      <div id="fieldcap-frame-ss"></div>
      <div>
        <span>左上</span>
        <label for="lefttop-x">x: </label
        ><input type="number" name="lefttop-x" v-model="leftTopX" />
        <label for="lefttop-y">y: </label
        ><input type="number" name="lefttop-y" v-model="leftTopY" />
      </div>
      <div>
        <span>右下</span>
        <label for="rightbottom-x">x: </label
        ><input type="number" name="rightbottom-x" v-model="rightBottomX" />
        <label for="rightbottom-y">y: </label
        ><input type="number" name="rightbottom-y" v-model="rightBottomY" />
      </div>
    </div>

    <div v-if="image">
      <button @click="isVisible = true">範囲選択</button>
    </div>

    <div>
      <img
        :src="'./img/' + img"
        alt=""
        v-for="(img, x) in puyoImgName"
        :style="{ 'background-color': pickPuyo == x ? '#ff0000' : '#ffffff' }"
        @click="pickPuyo = x"
        :key="img"
        width="50"
      />
    </div>
    <div class="d-flex">
      <div
        v-for="(color, x) in puyoToColorCode"
        :style="{ 'background-color': '#' + color }"
        style="width: 50px; height: 50px"
        :key="x"
      ></div>
    </div>

    <div class="m-0 ml-1 mt-3 mb-2 display_map">
      <template v-for="(line, y) in ssExtractionMap">
        <div
          alt=""
          v-for="(color, x) in line"
          :style="{ 'background-color': '#' + color }"
          :key="x"
          @click="setPuyoToColorCode(x, y)"
        ></div>
      </template>
    </div>
    <div>
      <img :src="areaImage.src" v-if="areaImage" />
    </div>

    <div>
      <button @click="ssExtractionMapToPuyoMap">抽出色を下に盤面生成</button>
    </div>
    <div class="m-0 ml-1 mt-3 mb-3 display_map">
      <template v-for="line in map">
        <img
          :src="imgUrl(imgNum)"
          alt=""
          v-for="(imgNum, x) in line"
          :key="x"
        />
      </template>
    </div>
  </div>
</template>

<script>
import InputImage from "./InputImage.vue";
import {
  appInit,
  setImage,
  getColorMap,
  setLeftTopPoint,
  setRightBottomPoint,
  getCursorAreaImage,
} from "@/js/pixi-field-capture";
import array2dInit from "@/js/array2d-init";
import convert from "color-convert";

const fieldWidth = 8;
const fieldHeight = 6;

export default {
  name: "FieldCapture",
  components: { InputImage },
  props: {},
  mounted() {
    this.loadCursorArea();
    this.loadPuyoToColorCode();
    appInit({ end: this.setLeftTop }, { end: this.setRightBottom });
  },
  data: function () {
    return {
      image: null,
      isVisible: false,
      areaSkip: false,
      areaImage: null,
      ssExtractionMap: array2dInit(8, 6, "00ff00"),
      map: array2dInit(8, 6, -1),
      leftTopX: 0,
      leftTopY: 0,
      rightBottomX: 0,
      rightBottomY: 0,
      leftTop: { x: 0, y: 0 },
      rightBottom: { x: 0, y: 0 },
      puyoImgName: [
        "red.webp",
        "blue.webp",
        "yellow.webp",
        "green.webp",
        "purple.webp",
        "heart.webp",
        "prism.webp",
        "ojama.webp",
        "katapuyo.webp",
      ],
      puyoToColorCode: [
        "000000",
        "000000",
        "000000",
        "000000",
        "000000",
        "000000",
        "000000",
        "000000",
        "000000",
      ],
      pickPuyo: 0,
    };
  },
  watch: {
    leftTopX: function () {
      setLeftTopPoint(this.leftTopX, this.leftTopY);
    },
    leftTopY: function () {
      setLeftTopPoint(this.leftTopX, this.leftTopY);
    },
    rightBottomX: function () {
      setRightBottomPoint(this.rightBottomX, this.rightBottomY);
    },
    rightBottomY: function () {
      setRightBottomPoint(this.rightBottomX, this.rightBottomY);
    },
  },
  methods: {
    loadImage: function (image) {
      this.image = image;
      this.setImageCanvas();
    },
    setImageCanvas: function () {
      this.isVisible = true;
      setTimeout(() => {
        setImage(this.image);
        setLeftTopPoint(this.leftTopX, this.leftTopY);
        setRightBottomPoint(this.rightBottomX, this.rightBottomY);
      }, 500);

      if (this.areaSkip) {
        setTimeout(() => {
          this.ok();
        }, 1000);
      }
    },
    ok: async function () {
      const map = getColorMap();
      for (let y = 0; y < fieldHeight; y++) {
        for (let x = 0; x < fieldWidth; x++) {
          const { r, g, b } = map[y][x];
          this.ssExtractionMap[y][x] = convert.rgb.hex(r, g, b);
        }
      }
      this.isVisible = false;
      this.saveCursorArea();

      this.areaImage = await getCursorAreaImage();
    },
    loadCursorArea: function () {
      const ltx = localStorage.getItem("leftTopX");
      const lty = localStorage.getItem("leftTopY");
      const rbx = localStorage.getItem("rightBottomX");
      const rby = localStorage.getItem("rightBottomY");

      this.leftTopX = ltx ? parseInt(ltx) : 100;
      this.leftTopY = lty ? parseInt(lty) : 100;
      this.rightBottomX = rbx ? parseInt(rbx) : 200;
      this.rightBottomY = rby ? parseInt(rby) : 200;

      if (ltx) {
        this.areaSkip = true;
      }

      return { ltx, lty, rbx, rby };
    },
    saveCursorArea: function () {
      localStorage.setItem("leftTopX", this.leftTopX);
      localStorage.setItem("leftTopY", this.leftTopY);
      localStorage.setItem("rightBottomX", this.rightBottomX);
      localStorage.setItem("rightBottomY", this.rightBottomY);
    },
    setLeftTop: function (sprite) {
      this.leftTopX = parseInt(sprite.x);
      this.leftTopY = parseInt(sprite.y);
    },
    setRightBottom: function (sprite) {
      this.rightBottomX = parseInt(sprite.x);
      this.rightBottomY = parseInt(sprite.y);
    },
    setPuyoToColorCode: function (x, y) {
      this.puyoToColorCode[this.pickPuyo] = this.ssExtractionMap[y][x];

      const str = JSON.stringify(this.puyoToColorCode);
      localStorage.setItem("puyoToColorCode", str);
    },
    loadPuyoToColorCode: function () {
      const str = localStorage.getItem("puyoToColorCode");
      if (!str) return;
      this.puyoToColorCode = JSON.parse(str);
      console.dir(this.puyoToColorCode);
    },
    colorCodeToPuyo: function (colorCode) {
      for (let i = 0; i < this.puyoToColorCode.length; i++) {
        const cc = this.puyoToColorCode[i];
        if (this.isNearColor(colorCode, cc)) return i;
      }
      return -1;
    },
    isNearColor: function (colorCode1, colorCode2) {
      // HSV値をそれぞれ取得
      const hsv1 = convert.hex.hsv(colorCode1);
      const hsv2 = convert.hex.hsv(colorCode2);

      // 色相の差を計算
      const hueDiff = Math.min(
        Math.abs(hsv1[0] - hsv2[0]),
        360 - Math.abs(hsv1[0] - hsv2[0])
      );

      // 彩度の差を計算
      const saturationDiff = Math.abs(hsv1[1] - hsv2[1]);

      // 明度の差を計算
      const valueDiff = Math.abs(hsv1[2] - hsv2[2]);

      // 各差の閾値を設定
      const hueThreshold = 10;
      const saturationThreshold = 20;
      const valueThreshold = 30;

      /*
      console.log(
        "-----------------------------------------------------------------------"
      );
      console.dir(hueDiff);
      console.dir(saturationDiff);
      console.dir(valueDiff);
      */
      // すべての差が閾値以下であれば、近い色と判定
      return (
        hueDiff <= hueThreshold &&
        saturationDiff <= saturationThreshold &&
        valueDiff <= valueThreshold
      );
    },
    ssExtractionMapToPuyoMap: function () {
      for (let y = 0; y < fieldHeight; y++) {
        for (let x = 0; x < fieldWidth; x++) {
          const puyo = this.colorCodeToPuyo(this.ssExtractionMap[y][x]);
          this.map[y][x] = puyo;
        }
      }
    },
    imgUrl: function (imgNum) {
      var puyoImg = [
        "./img/red.webp",
        "./img/blue.webp",
        "./img/yellow.webp",
        "./img/green.webp",
        "./img/purple.webp",
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#fieldcap-frame {
  /*display: none;*/
  flex-direction: column;
  border: 3px rgb(9, 95, 255) solid;
  background-color: rgb(255, 255, 255);
  width: 80vw;
  height: 80vh;
  position: fixed;
  z-index: 1001;

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);

  margin: 0px;
  padding: 0px;
}

#fieldcap-frame-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  border: 0px;
  border-bottom: 1px #dbdbdb solid;
  margin: 0px;
  padding: 0px;
}

#fieldcap-frame-ss {
  overflow: hidden;
  background-color: rgb(0, 255, 0);
  flex: 1;
  width: 100%;
  height: auto;
  border: 0px;
  margin: 0px;
  padding: 0px;
  text-align: center;
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
