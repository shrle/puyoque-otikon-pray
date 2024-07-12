<template>
  <div class="test">
    <!--
    <div class="mb-2">
      <input type="checkbox" v-model="areaSkip" id="area-skip" class="me-2" />
      <label for="area-skip">前回と同じ選択範囲を使う</label>
    </div>
    -->

    <div class="container">
      <h1>ぷよクエ-落ちコンお祈りルート探索くん</h1>
      <h2>読み込む画像を選択してください</h2>

      <div class="controlls" v-if="onload">
        <div>
          <InputImage @load-image="loadImage"></InputImage>
        </div>

        <div v-if="image">
          <button class="text-button" @click="step = 1">範囲選択</button>
        </div>
      </div>

      <div v-if="!onload">
        データ読込中
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <div class="mt-5 display_map nextpuyo">
      <img
        v-for="(puyo, i) in nextPuyos"
        :src="nextPuyoImgUrl(puyo)"
        :key="i"
      />
    </div>
    <div class="display_map">
      <template v-for="line in puyoMap">
        <img
          :src="puyoImgUrl(puyo)"
          alt=""
          v-for="(puyo, x) in line"
          :key="x"
        />
      </template>
    </div>

    <article class="container mt-2" v-if="puyoMap">
      <div class="mb-3">
        <button @click="analysisStart" class="text-button">解析</button>
        <div v-if="isAnalyzing">
          解析中
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>

      <div class="mb-2">
        <label>
          攻撃色
          <select v-model="atackColor">
            <template v-for="(item, index) in colorName" :key="index">
              <option :value="index - 1" v-if="index > 0">
                {{ item }}
              </option>
            </template>
          </select>
        </label>
      </div>

      <div class="mb-2">
        <label>
          ぷよが消える連結数
          <select v-model="erasePuyoLength">
            <option v-for="(item, index) in 47" :value="index + 2" :key="index">
              {{ item + 1 }}
            </option>
          </select>
        </label>
      </div>

      <div class="mb-2">
        <label>
          落ちコンに求める空のマスの数
          <select v-model="eraseBlankNum">
            <option v-for="(item, index) in 6" :value="index + 1" :key="index">
              {{ item }}
            </option>
          </select>
        </label>
      </div>

      <div class="mb-2">
        <label>
          落ちコンすると仮定するぷよの連結数
          <select v-model="eraseAssumedPuyoLength">
            <option v-for="(item, index) in 3" :value="index + 1" :key="index">
              {{ item }}
            </option>
          </select>
        </label>
      </div>

      <div class="mb-2">
        <label>
          なぞり消し数
          <select v-model="selectRouteNum">
            <option v-for="n in selectRouteLengthMax" :value="n - 1" :key="n">
              {{ n }}
            </option>
          </select>
        </label>
      </div>

      <div class="mb-2">
        <label>
          同時消し係数
          <select v-model="doujiCorrection">
            <option
              v-for="(item, index) in 48 * 2"
              :value="index / 2 + 1"
              :key="index"
            >
              {{ index / 2 + 1 }}
            </option>
          </select>
        </label>
      </div>

      <div class="mb-2">
        <label>
          連鎖倍率
          <select v-model="chainCorrection">
            <option
              v-for="(item, index) in 48 * 2"
              :value="index / 2 + 1"
              :key="index"
            >
              {{ index / 2 + 1 }}
            </option>
          </select>
        </label>
      </div>
    </article>

    <!--最終盤面一覧-->
    <article class="result-maps" v-if="showResult">
      <div
        v-for="(map, index) in rankingLastMaps"
        :key="index"
        v-on:mouseover="showRankingRouteMap(index)"
        v-on:mouseleave="hideRankingRouteMap()"
        class="map-container"
      >
        <div
          class="map"
          v-bind:class="{ invisible: showRankingRouteMapIndex == index }"
        >
          <template v-for="line in map">
            <img
              :src="puyoImgUrl(imgNum)"
              alt=""
              v-for="(imgNum, x) in line"
              :key="x"
            />
          </template>
        </div>

        <!-- ルート表示 -->
        <div class="map route-map" v-if="showRankingRouteMapIndex == index">
          <template v-for="(line, y) in puyoMap">
            <img
              :src="puyoImgUrl(imgNum)"
              v-for="(imgNum, x) in line"
              :class="{
                'route-chip': isRoute(x, y),
                'not-route-chip': !isRoute(x, y),
              }"
              :key="x"
            />
          </template>
          <!--

            <pre class="route_map position-absolute top-0 start-0">{{
              rankingRouteMaps[index]
            }}</pre>
            -->
        </div>
      </div>
    </article>

    <FieldRangeSelector
      :canvasImage="image"
      @prev-step="prevStep"
      @set-extract-color-map="setExtractColorMap"
      v-show="step === 1"
      ref="FieldRangeSelector"
    ></FieldRangeSelector>

    <PuyoColorPicker
      @prev-step="prevStep"
      @set-color-for-puyo="setColorForPuyos"
      :extractionColorMap="extractionColorMap"
      v-show="step === 2"
    ></PuyoColorPicker>

    <NextRangeSelector
      @prev-step="prevStep"
      @set-extract-color-nextpuyo="setExtractColorNextPuyos"
      v-show="step === 3"
      ref="NextRangeSelector"
    ></NextRangeSelector>

    <NextPuyoColorPicker
      @prev-step="prevStep"
      @set-color-for-nextpuyos="setColorForNextPuyos"
      :extractionColorNextPuyos="extractionColorNextPuyos"
      v-show="step === 4"
    ></NextPuyoColorPicker>
  </div>
</template>

<script>
import array2dInit from "@/js/array2d-init";
import convert from "color-convert";
import InputImage from "@/components/InputImage.vue";
import FieldRangeSelector from "@/components/FieldRangeSelector.vue";
import PuyoColorPicker from "../components/PuyoColorPicker.vue";
import NextRangeSelector from "@/components/NextRangeSelector.vue";
import NextPuyoColorPicker from "../components/NextPuyoColorPicker.vue";

import { loadRouteCode, routeLength } from "@/js/load-route-code";
import PuyoqueStd from "@/js/puyoquestd";
import codeToPoint from "@/js/code-to-point.js";
import { analysisForRouteDelete, getLastMap } from "@/js/otikon-pray-analysis";

const fieldWidth = 8;
const fieldHeight = 6;
const puyoColor = PuyoqueStd.puyoColor;

export default {
  name: "HomeView",
  components: {
    InputImage,
    FieldRangeSelector,
    PuyoColorPicker,
    NextRangeSelector,
    NextPuyoColorPicker,
  },
  async mounted() {
    this.routeCodeList = await loadRouteCode();

    this.onload = true;
  },
  data() {
    return {
      step: 0,
      image: null,
      /** SSのフィールドから抽出したの各色 */
      extractionColorMap: [],
      /** SSのネクストぷよから抽出した各色 */
      extractionColorNextPuyos: [],
      /** フィールドの場合のぷよ番号ごとに関連付けられたカラーコード */
      colorForPuyos: [],
      /** ネクストぷよの場合のぷよ番号ごとに関連付けられたカラーコード */
      colorForNextPuyos: [],

      puyoMap: null,
      nextPuyos: null,

      colorName: ["無", "赤", "青", "黄", "緑", "紫"],
      atackColor: puyoColor.blue,
      ranking: [
        {
          totalColorMag: [-1, -1, -1, -1, -1],
          chainNum: -1,
          allClear: false,
          deleteCount: -1,
        },
      ],
      rankingList: [],
      rankingMaxLength: 50,
      rankingRouteMaps: [],
      rankingLastMaps: [],
      showRankingRouteMapIndex: undefined,

      onload: false,
      analysis: {},
      isAnalyzing: false,
      routeCodeList: [],
      doujiCorrection: 1,
      chainCorrection: 1,
      colorMag: [0, 0, 0, 0, 0, 0],
      chainNum: 0,
      selectRouteNum: 4,
      selectRouteLengthMax: 12,

      erasePuyoLength: 4,
      eraseAssumedPuyoLength: 3, // 落ちコンするであろうと仮定するぷよの個数
      eraseBlankNum: 3,
      showResult: false,
    };
  },
  watch: {
    step() {
      if (this.step === 1) {
        this.$refs.FieldRangeSelector.showCanvas();
      } else if (this.step === 3) {
        this.$refs.NextRangeSelector.showCanvas();
      } else if (this.step === 5) {
        this.convertColorMapToPuyoMap();
        this.convertColorNextPuyosToNextPuyos();
      }
    },
  },
  methods: {
    loadImage: function (image) {
      this.image = image;
      this.step = 1;
    },
    setExtractColorMap: function (map) {
      this.extractionColorMap = map;
      this.nextStep();
    },
    setExtractColorNextPuyos: function (map) {
      this.extractionColorNextPuyos = map;
      this.nextStep();
    },
    setColorForPuyos(colors) {
      this.colorForPuyos = colors;
      this.nextStep();
    },
    setColorForNextPuyos(colors) {
      this.colorForNextPuyos = colors;
      this.nextStep();
    },
    prevStep() {
      if (this.step === 0) return;
      this.step--;
    },
    nextStep() {
      this.step++;
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

      // すべての差が閾値以下であれば、近い色と判定
      return (
        hueDiff <= hueThreshold &&
        saturationDiff <= saturationThreshold &&
        valueDiff <= valueThreshold
      );
    },
    /**
     * 指定色がぷよの色に近ければそのぷよ番号を返す
     * @param {Number} colorCode
     * @param {Number[]} puyosToColorCodes
     *
     * @returns {Number} puyo index
     */
    colorCodeToPuyo(colorCode, puyosToColorCodes) {
      for (let i = 0; i < puyosToColorCodes.length; i++) {
        const cc = puyosToColorCodes[i];
        if (this.isNearColor(colorCode, cc)) return i;
      }
      return -1;
    },

    convertColorMapToPuyoMap() {
      let map = [];
      for (let y = 0; y < fieldHeight; y++) {
        map[y] = [];
        for (let x = 0; x < fieldWidth; x++) {
          map[y][x] = this.colorCodeToPuyo(
            this.extractionColorMap[y][x],
            this.colorForPuyos
          );
        }
      }
      this.puyoMap = map;
    },
    convertColorNextPuyosToNextPuyos() {
      this.nextPuyos = [];
      for (let x = 0; x < fieldWidth; x++) {
        this.nextPuyos[x] = this.colorCodeToPuyo(
          this.extractionColorNextPuyos[x],
          this.colorForNextPuyos
        );
      }
    },

    analysisStart: function () {
      if (this.isAnalyzing) return;
      this.isAnalyzing = true;
      setTimeout(() => {
        console.log("selectRouteNum: " + this.selectRouteNum);

        console.log("analysis start!");
        const routeCodeLength = routeLength[this.selectRouteNum];

        const rankingList = analysisForRouteDelete(
          this.routeCodeList,
          routeCodeLength,
          this.puyoMap,
          this.nextPuyos,
          this.atackColor,
          this.erasePuyoLength,
          this.eraseAssumedPuyoLength,
          this.eraseBlankNum,
          this.doujiCorrection,
          this.chainCorrection
        );
        console.log("rankingList");
        console.dir(rankingList);

        this.rankingToRouteMapping(rankingList);
        this.rankingToLastMapping(rankingList);
        this.rankingList = rankingList;
        this.isAnalyzing = false;
        this.showResult = true;
      }, 10);
    },
    isRoute: function (x, y) {
      const routeCode =
        this.rankingList[this.showRankingRouteMapIndex].routeCode;
      for (const c of routeCode) {
        const p = codeToPoint[c];
        if (p.x === x && p.y === y) return true;
      }
      return false;
    },
    routeCodeToMapText: function (routeCode) {
      let map = array2dInit(fieldWidth, fieldHeight, false);
      for (const c of routeCode) {
        const p = codeToPoint[c];
        map[p.y][p.x] = true;
      }

      let text = "";
      for (let y = 0; y < fieldHeight; y++) {
        for (let x = 0; x < fieldWidth; x++) {
          text += map[y][x] ? "■" : "□";
        }
        text += "\n";
      }
      return text;
    },
    rankingToRouteMapping: function (rankingList) {
      this.rankingRouteMaps = [];
      for (let i = 0; i < rankingList.length; i++) {
        const map = this.routeCodeToMapText(rankingList[i].routeCode);
        this.rankingRouteMaps.push(map);
      }
    },

    rankingToLastMapping: function (rankingList) {
      this.rankingLastMaps = [];
      for (let i = 0; i < rankingList.length; i++) {
        const lastMap = getLastMap(
          this.puyoMap,
          this.nextPuyos,
          rankingList[i].routeCode,
          this.erasePuyoLength,
          null
        );
        this.rankingLastMaps.push(lastMap);
      }
      console.dir(this.rankingLastMaps[0]);
    },

    showRankingRouteMap: function (index) {
      this.showRankingRouteMapIndex = index;
    },

    hideRankingRouteMap: function () {
      this.showRankingRouteMapIndex = undefined;
    },

    getSelectRoute: function (selectRoute) {
      this.selectRoute = selectRoute;
    },
    puyoImgUrl(puyoIndex) {
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

      if (puyoIndex == -1) return "./img/blank_r.gif";

      return puyoImg[puyoIndex];
    },
    nextPuyoImgUrl(nextPuyoIndex) {
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

      if (nextPuyoIndex == -1) return "./img/blank_r.gif";

      return puyoImg[nextPuyoIndex];
    },
  },
};
</script>

<style scoped>
[v-cloak] {
  display: none;
}

.test {
  display: flex;
  flex-direction: column;
}

.test * {
  margin: 0;
  padding: 0;
}

.test img {
  line-height: 0;
  vertical-align: top;
}

.test .container {
  width: 100%;
  padding: 10px;
}

.test h1 {
  font-size: 15px;
  margin-bottom: 10px;
}
.test h2 {
  font-size: 15px;
  margin-bottom: 10px;
}
.test button {
  width: 40px;
  height: 40px;
  border: 0;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.test button:hover {
  background-color: #cccccc;
}

.test button:active {
  background-color: #aaaaaa;
}

.test .text-button {
  background-color: #000000;
  color: #ffffff;
  width: 120px;
  height: 30px;
  border-radius: 18px;
  border: transparent 2px solid;
}

.test .text-button:active {
  background-color: #222222;
}

.test .text-button:focus {
  background-color: #ffffff;
  border: #000000 2px solid;
  color: #000000;
}

.test select {
  width: 60px;
  height: 30px;
  border: #aaaaaa 1px solid;
  border-radius: 10px;
  padding: 0;
  padding-left: 10px;
}

.controlls {
  display: flex;
  flex-direction: row;
}
.controlls > *:not(:first-child) {
  margin-left: 20px;
}

.display_map {
  background-color: #aaaaaa;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  width: 100%;
}
.display_map.nextpuyo {
  height: 20px;
}
.display_map.nextpuyo img {
  height: 20px;
}

.display_map div {
  aspect-ratio: 97/87;
}
.display_map img {
  width: 100%;
  object-fit: contain;
}

.result-maps {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px 10px;
  width: 100%;
}

.result-maps .map-container {
  width: 180px;
  position: relative;
}
.result-maps .map {
  background-color: #222244;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  width: 180px;
}

.result-maps .map.route-map {
  position: absolute;
  left: 0;
  top: 0;

  background-color: #222244;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  width: 180px;
}

.result-maps .map img {
  width: 100%;
  aspect-ratio: 97/87;
}

.result-maps .map .route-chip {
  background-color: #ffffff;
}

.result-maps .map .not-route-chip {
  background-color: transparent;
}

.result-maps .map img.route-chip {
  opacity: 0.5;
}
</style>
