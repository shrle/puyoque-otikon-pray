<template>
  <div class="home">
    <h1 class="text-center h6">ぷよクエ-落ちコンお祈りルート探索くん</h1>
    <div class="col-10 col-md-10 col-xl-6 mx-auto mb-5">
      <div>連鎖数:{{ chainNum }}</div>
      <div class="d-flex flex-row mb-2">
        <div
          v-for="(item, index) in colorMag"
          :class="colorClassName[index]"
          style="width: 60px"
          :key="index"
          class="p-1 ps-2"
        >
          {{ item }}
        </div>
      </div>
      <div class="mb-2">
        <button @click="undo">元に戻す</button>
      </div>

      <div class="mb-2">のこりなぞり消し:{{ selectRouteSurplusLength }}</div>

      <!-- キャンバス -->
      <div id="canvas-box"></div>

      <div class="mt-3 mb-3">
        <!--リプレイ ボタン-->
        <button @click="replayFirst" class="me-2">&lt;&lt;</button>
        <button @click="replayPrev" class="me-2">&lt;-</button>
        <button @click="replayNext" class="me-2">-&gt;</button>
        <button @click="replayLast">&gt;&gt;</button>
      </div>

      <div class="mb-2">
        <label>
          ネクスト
          <select v-model="selectNextColor">
            <option
              v-for="(item, index) in colorName"
              :value="index - 1"
              :key="index"
            >
              {{ item }}
            </option>
          </select>
        </label>
      </div>

      <div class="mb-2">
        <label>
          なぞり消し数
          <select v-model="selectRouteLengthMax">
            <option
              v-for="(item, index) in squareLength"
              :value="index + 1"
              :key="index"
            >
              {{ index + 1 }}
            </option>
          </select>
        </label>
      </div>

      <div class="mb-2">
        <label>
          同時消し係数
          <select v-model="doujiCorrection">
            <option
              v-for="(item, index) in squareLength * 2"
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
              v-for="(item, index) in squareLength * 2"
              :value="index / 2 + 1"
              :key="index"
            >
              {{ index / 2 + 1 }}
            </option>
          </select>
        </label>
      </div>

      <div>
        <label>
          履歴
          <select v-model="historyIndex" class="me-2">
            <option
              v-for="(item, index) in history"
              :value="index"
              :key="index"
            >
              連鎖:{{ item.chainNum }},{{ item.colorMag }}
            </option>
          </select>
        </label>
        <button @click="historyRouteShow" class="me-2">表示</button>
        <button @click="historyRouteFire">発火</button>
      </div>

      <!--連鎖のタネ一覧-->
      <div class="d-flex flex-row flex-wrap col-xs-12 col-md-12 mx-auto">
        <div v-for="(map, index) in maps" class="me-1 mb-3" :key="index">
          <div class="chance_map m-0 ml-1 mt-3" @click="selectMap(index)">
            <template v-for="(line, y) in map">
              <img
                :src="imgUrl(imgNum, index, x, y)"
                alt=""
                v-for="(imgNum, x) in line"
                :key="x"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
[v-cloak] {
  display: none;
}

.atackRatePurple {
  background-color: #cc99ff;
}

.atackRateYellow {
  background-color: #ffff99;
}

.atackRateRed {
  background-color: #ff9999;
}

.atackRateGreen {
  background-color: #99ff99;
}

.atackRateBlue {
  background-color: #66ccff;
}

.heart_rate {
  background-color: #ffe0fa;
}

.chance_map {
  display: grid;
  grid: 18px 18px 18px 18px 18px 18px/ 20px 20px 20px 20px 20px 20px 20px 20px;
  width: 160px;
  padding: 0px;
}

.chance_map img {
  width: 20px;
  height: 18px;
}
</style>

<script>
// @ is an alias to /src
import PuyoqueStd from "@/js/puyoquestd.js";
import PuyoqueCanvas from "@/js/puyoquecanvas.js";

class History {
  constructor(map, lastNexts, selectRoute, colorMag, chainNum) {
    this.map = map;
    this.lastNexts = lastNexts;
    this.selectRoute = selectRoute;
    this.colorMag = colorMag;
    this.chainNum = chainNum;
  }
}

export default {
  name: "HomeView",
  components: {},
  mounted() {
    this.field = PuyoqueStd.createField(this.fieldWidth, this.fieldHeight);
    this.field.setMapColor(this.maps[0]);
    this.field.setAllNextColor(this.selectNextColor);
    this.canvas = new PuyoqueCanvas(
      "#canvas-box",
      this.canvasWidth,
      this.canvasHeight,
      this.field
    );
    this.canvas.colorMagCalc = this.colorMagCalc;
    this.canvas.addSelectRouteListeners(this.getSelectRoute);
    this.canvas.addChainStartListener(this.chainStart);
    this.canvas.addChainListener(this.chain);
    this.canvas.addChainEndListener(this.chainEnd);
    this.selectRoute = this.canvas.selectRoute;
    this.canvas.passSelectRouteLengthMax = this.passSelectRouteLengthMax;
  },
  data() {
    return {
      canvasWidth: 400,
      canvasHeight: 295,
      fieldWidth: 8,
      fieldHeight: 6,
      field: {},
      canvas: {},
      selectRoute: [], // readonly
      selectRouteLengthMax: 10,
      history: [],
      historyIndex: 0,
      lastMap: [],
      lastNexts: [],
      doujiCorrection: 1,
      chainCorrection: 5,
      colorMag: [0, 0, 0, 0, 0, 0],
      chainNum: 0,
      erasePuyoLength: 3,
      selectMapIndex: 0,
      replay: [],
      replayIndex: 0,
      colorName: ["無", "赤", "青", "黄", "緑", "紫"],
      colorClassName: [
        "atackRateRed",
        "atackRateBlue",
        "atackRateYellow",
        "atackRateGreen",
        "atackRatePurple",
      ],
      selectNextColor: -1,

      maps: [
        [
          [0, 4, 5, 4, 2, 3, 2, 2],
          [0, 2, 4, 5, 2, 3, 4, 3],
          [1, 2, 3, 1, 5, 2, 3, 4],
          [1, 0, 1, 0, 4, 1, 0, 4],
          [2, 3, 4, 4, 0, 1, 3, 3],
          [1, 3, 1, 0, 1, 2, 0, 0],
        ],
        [
          [2, 4, 0, 1, 0, 2, 3, 1],
          [4, 3, 1, 4, 2, 1, 3, 1],
          [4, 2, 0, 1, 0, 2, 2, 0],
          [5, 5, 4, 3, 1, 4, 0, 2],
          [2, 3, 4, 3, 1, 4, 0, 5],
          [3, 0, 3, 0, 4, 3, 1, 2],
        ],
        [
          [3, 0, 1, 2, 4, 0, 4, 5],
          [1, 2, 4, 0, 1, 3, 2, 3],
          [1, 2, 4, 0, 1, 3, 2, 3],
          [2, 4, 0, 1, 3, 2, 3, 5],
          [1, 0, 1, 2, 4, 0, 4, 5],
          [3, 3, 0, 1, 2, 4, 0, 4],
        ],
        [
          [0, 4, 2, 4, 5, 3, 5, 0],
          [4, 0, 3, 0, 2, 4, 1, 5],
          [3, 3, 2, 2, 1, 1, 0, 0],
          [4, 1, 4, 4, 3, 3, 2, 4],
          [4, 1, 0, 1, 0, 0, 4, 2],
          [0, 0, 1, 0, 1, 1, 3, 2],
        ],
        [
          [1, 5, 3, 4, 0, 1, 2, 1],
          [5, 3, 0, 3, 4, 0, 2, 3],
          [2, 0, 2, 2, 3, 4, 1, 3],
          [4, 2, 3, 3, 2, 2, 0, 2],
          [0, 1, 0, 2, 3, 4, 4, 3],
          [1, 5, 1, 0, 0, 3, 3, 4],
        ],
        [
          [2, 3, 4, 0, 2, 1, 5, 2],
          [3, 0, 0, 1, 1, 5, 5, 1],
          [3, 1, 4, 3, 2, 0, 4, 2],
          [2, 2, 1, 4, 3, 2, 0, 4],
          [4, 1, 0, 3, 1, 0, 3, 4],
          [0, 0, 1, 1, 3, 3, 2, 2],
        ],
        [
          [4, 1, 2, 2, 5, 2, 3, 3],
          [2, 5, 1, 4, 2, 4, 0, 0],
          [1, 3, 2, 1, 4, 0, 3, 1],
          [3, 0, 3, 0, 1, 3, 1, 5],
          [0, 2, 4, 0, 1, 4, 1, 3],
          [0, 2, 0, 4, 4, 3, 0, 3],
        ],
        [
          [0, 3, 1, 0, 4, 1, 5, 1],
          [4, 2, 1, 0, 2, 4, 2, 4],
          [5, 4, 4, 1, 0, 0, 2, 4],
          [2, 3, 2, 3, 4, 3, 0, 1],
          [2, 3, 2, 3, 0, 2, 1, 5],
          [3, 2, 3, 4, 3, 3, 4, 1],
        ],
      ],
    };
  },
  computed: {
    selectRouteSurplusLength: function () {
      return this.selectRouteLengthMax - this.selectRoute.length;
    },
    squareLength: function () {
      return this.fieldWidth * this.fieldHeight;
    },
  },
  watch: {
    selectNextColor: function () {
      console.log("change", this.selectNextColor);
      this.field.setAllNextColor(this.selectNextColor);
      //this.canvas.allNextVisible();
    },
  },
  methods: {
    getSelectRoute: function (selectRoute) {
      this.selectRoute = selectRoute;
    },

    passSelectRouteLengthMax: function () {
      return this.selectRouteLengthMax;
    },

    historyRouteShow: function () {
      if (this.history.length === 0) return;
      let history = this.history[this.historyIndex];
      this.field.setMapPuyo(history.map);
      this.field.setNexts(history.lastNexts);
      this.selectRoute = history.selectRoute.clone();
      this.canvas.setRoute(this.selectRoute);
      // this.canvas.allVisible();
    },

    historyRouteFire: function () {
      if (this.history.length === 0) return;
      let history = this.history[this.historyIndex];
      this.field.setMapPuyo(history.map);
      this.field.setNexts(history.lastNexts);
      this.selectRoute = history.selectRoute.clone();
      this.canvas.setRoute(this.selectRoute);
      // this.canvas.allVisible();
      this.canvas.fire();
    },
    selectMap: function (index) {
      this.selectMapIndex = index;
      this.field.setMapColor(this.maps[index]);
      this.field.setAllNextColor(this.selectNextColor);
      // this.canvas.allVisible();
    },

    chainStart: function (selectRoute) {
      this.colorMag = [0, 0, 0, 0, 0, 0];
      this.lastMap = this.field.mapClone();
      this.lastNexts = this.field.nextsClone();
      this.replay = [];
      this.replay.push({
        map: this.field.mapClone(),
        nexts: this.field.nextsClone(),
      });
      this.selectRoute = selectRoute.clone();

      this.field.recordMap();
    },

    chain: function () {
      this.replay.push({
        map: this.field.mapClone(),
        nexts: this.field.nextsClone(),
      });
    },

    chainEnd: function (chainNum) {
      this.chainNum = chainNum;
      this.replay.push({
        map: this.field.mapClone(),
        nexts: this.field.nextsClone(),
      });
      let wild = this.colorMag.reduce((sum, element) => sum + element, 0);
      let wildNum = 5;
      this.colorMag[wildNum] = wild;
      this.colorMag.map((m) => this.Round(m, 2));
      this.history.push(
        new History(
          this.lastMap,
          this.lastNexts,
          this.selectRoute,
          this.colorMag,
          this.chainNum
        )
      );
    },

    colorMagCalc: function (
      deletePuyoNum,
      deleteColorList,
      deletePrismNum,
      chainNum
    ) {
      var colorMag = [0, 0, 0, 0, 0]; // colorMag[puyoColor] = 倍率;
      var puyoMag = PuyoqueStd.puyoMagCalc(
        deletePuyoNum,
        chainNum,
        this.doujiCorrection,
        this.chainCorrection,
        this.erasePuyoLength
      );

      for (const color of deleteColorList) {
        colorMag[color] += puyoMag;
      }
      for (const color in colorMag) {
        colorMag[color] += deletePrismNum * 3;
      }

      for (let i = 0; i < colorMag.length; i++) {
        this.colorMag[i] += colorMag[i];
      }
    },

    undo: function () {
      this.field.setMapColor(this.maps[this.selectMapIndex]);
      this.field.setAllNextColor(this.selectNextColor);
      //this.canvas.allVisible();
    },

    showReplay: function () {
      this.field.setMapPuyo(this.replay[this.replayIndex].map);
      this.field.setNexts(this.replay[this.replayIndex].nexts);
      // this.canvas.allVisible();
      if (this.replayIndex === 0) {
        this.canvas.setRoute(this.selectRoute);
      } else {
        this.canvas.resetRoute();
      }
    },

    replayFirst: function () {
      this.replayIndex = 0;
      this.showReplay();
    },

    replayPrev: function () {
      if (this.replayIndex === 0) return;
      this.replayIndex--;
      this.showReplay();
    },

    replayNext: function () {
      if (this.replayIndex === this.replay.length - 1) return;
      this.replayIndex++;
      this.showReplay();
    },

    replayLast: function () {
      this.replayIndex = this.replay.length - 1;
      this.showReplay();
    },

    imgUrl: function (imgNum) {
      var puyoImg = [
        "./img/red_r.gif",
        "./img/blue_r.gif",
        "./img/yellow_r.gif",
        "./img/green_r.gif",
        "./img/purple_r.gif",
        "./img/heart.gif",
      ];

      if (imgNum == -1) return "./img/blank_r.gif";

      return puyoImg[imgNum];
    },

    Round: function (value, base = 0) {
      return Math.round(value * 10 ** base) / 10 ** base;
    },
  },
};
</script>
