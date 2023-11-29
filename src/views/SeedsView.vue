<template>
  <div class="home">
    <h1 class="text-center h6">ぷよクエ-落ちコンお祈りルート探索くん</h1>
    <div class="col-10 col-md-10 col-xl-6 mx-auto mb-5">
      <!-- ページ一覧 -->
      <select v-model="pageId" v-on:change="changePage">
        <option v-for="page in pageList" :value="page.id" :key="page.id">
          {{ page.name }}
        </option>
      </select>
      <div v-if="!onload">
        データ読込中
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- 表示マップ -->
      <div class="m-0 ml-1 mt-3" id="display_map">
        <template v-for="line in displayMap">
          <img
            :src="imgUrl(imgNum)"
            alt=""
            v-for="(imgNum, x) in line"
            :key="x"
          />
        </template>
      </div>

      <div class="mb-2">
        <label>
          攻撃色
          <select v-model="atackColor">
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
          ネクスト
          <select v-model="nextColor">
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
          ぷよが消える連結数
          <select v-model="erasePuyoLength">
            <option v-for="(item, index) in 48" :value="index + 1" :key="index">
              {{ item }}
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
          なぞり消し数
          <select v-model="selectRouteNum">
            <option v-for="n in selectRouteLengthMax" :value="n" :key="n">
              {{ n + 1 }}
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

      <div>
        <button @click="analysisStart">解析</button>
      </div>

      <!--最終盤面一覧-->
      <div class="d-flex flex-row flex-wrap col-xs-12 col-md-12 mx-auto">
        <div
          v-for="(map, index) in rankingLastMaps"
          class="me-1 mb-3 position-relative"
          :key="index"
          v-on:mouseover="showRankingRouteMap(index)"
          v-on:mouseleave="hideRankingRouteMap()"
        >
          <div
            class="chance_map m-0 ml-1 mt-3"
            v-bind:class="{ invisible: showRankingRouteMapIndex == index }"
          >
            <template v-for="line in map">
              <img
                :src="imgUrl(imgNum)"
                alt=""
                v-for="(imgNum, x) in line"
                :key="x"
              />
            </template>
          </div>
          <div class="m-2 bg-white" v-if="showRankingRouteMapIndex == index">
            <pre class="route_map position-absolute top-0 start-0">{{
              rankingRouteMaps[index]
            }}</pre>
          </div>
        </div>
      </div>

      <!-- 解析ルート一覧 -->
      <!--
      <div class="d-flex flex-row flex-wrap col-xs-12 col-md-12 mx-auto">
        <div v-for="map in rankingRouteMaps" class="m-2 bg-white" :key="map">
          <pre class="route_map">{{ map }}</pre>
        </div>
      </div>
      -->
      <!--連鎖のタネ一覧-->
      <div class="d-flex flex-row flex-wrap col-xs-12 col-md-12 mx-auto">
        <div v-for="(map, index) in maps" class="me-1 mb-3" :key="index">
          <div class="chance_map m-0 ml-1 mt-3" @click="selectMap(index)">
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

#display_map {
  background-color: #000000;
  display: grid;
  grid: 54px 54px 54px 54px 54px 54px/ 60px 60px 60px 60px 60px 60px 60px 60px;
  width: 480px;
  padding: 0px;
}
#display_map img {
  width: 60px;
  height: 54px;
}

.chance_map {
  background-color: #000000;
  display: grid;
  grid: 18px 18px 18px 18px 18px 18px/ 20px 20px 20px 20px 20px 20px 20px 20px;
  width: 160px;
  padding: 0px;
}

.chance_map img {
  width: 20px;
  height: 18px;
}

pre.route_map {
  font-size: 30px;
  line-height: 70%;
  overflow: hidden;
}
</style>

<script>
// @ is an alias to /src
import { loadRouteCode, routeLength } from "@/js/load-route-code";
import PuyoqueStd from "@/js/puyoquestd";
//import * as maps from "@/js/maps";
import array2dInit from "@/js/array2d-init";
import codeToPoint from "@/js/code-to-point.js";
import settings from "@/js/charcter-settings";
import { getLastMap } from "@/js/otikon-pray-analysis";

const puyoColor = PuyoqueStd.puyoColor;

export default {
  name: "SeedsView",
  components: {},
  async mounted() {
    this.routeCodeList = await loadRouteCode();
    this.onload = true;
    this.init(this.$route.params.id);
  },
  data() {
    return {
      onload: false,
      routeCodeList: [],
      analysis: {},
      fieldWidth: 8,
      fieldHeight: 6,
      displayMap: [],
      selectRouteNum: 4,
      selectRouteLengthMax: 9,
      selectRouteBehavior: "",
      history: [],
      historyIndex: 0,
      lastMap: [],
      lastNexts: [],
      doujiCorrection: 1,
      chainCorrection: 5,
      colorMag: [0, 0, 0, 0, 0, 0],
      chainNum: 0,
      erasePuyoLength: 3,
      eraseBlankNum: 3,
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
      atackColor: puyoColor.blue,
      nextColor: puyoColor.blue,
      ranking: [
        {
          totalColorMag: [-1, -1, -1, -1, -1],
          chainNum: -1,
          allClear: false,
          deleteCount: -1,
        },
      ],
      rankingMaxLength: 50,
      rankingRouteMaps: [],
      rankingLastMaps: [],
      showRankingRouteMapIndex: undefined,
      maps: [],
      pageId: "",
      pageList: [
        { id: "charmyDraco", name: "チャーミードラコ" },
        { id: "moreSuspiciousKlug", name: "もっとあやしいクルーク" },
        { id: "anndoRingo", name: "あんどうりんご" },
        { id: "whiteMarle", name: "しろいマール" },
        //{ id: "", name: "" },
      ],
    };
  },
  computed: {},
  watch: {},
  methods: {
    init: function (id) {
      const setting = settings[id];
      if (!setting) {
        this.onload = true;
        return;
      }
      this.pageId = id;
      this.analysis = setting.analysis;
      this.atackColor = setting.color;
      this.nextColor = setting.color;
      this.maps = setting.maps;
      this.erasePuyoLength = setting.erasePuyoLength;
      this.selectRouteBehavior = setting.selectRouteBehavior;
    },
    changePage: function (e) {
      const id = e.target.value;
      this.$router.push({ name: "seeds", params: { id } });
      this.init(id);
    },
    analysisStart: function () {
      console.log("analysis start!");
      const routeCodeLength = routeLength[this.selectRouteNum];
      const map = this.maps[this.selectMapIndex];

      const rankingList = this.analysis(
        this.routeCodeList,
        routeCodeLength,
        map,
        this.nextColor,
        this.atackColor,
        this.erasePuyoLength,
        this.eraseBlankNum,
        this.doujiCorrection,
        this.chainCorrection
      );

      this.rankingToRouteMapping(rankingList);
      this.rankingToLastMapping(rankingList);
    },

    routeCodeToMapText: function (routeCode) {
      let map = array2dInit(this.fieldWidth, this.fieldHeight, false);
      for (const c of routeCode) {
        const p = codeToPoint[c];
        map[p.y][p.x] = true;
      }

      let text = "";
      for (let y = 0; y < this.fieldHeight; y++) {
        for (let x = 0; x < this.fieldWidth; x++) {
          text += map[y][x] ? "■" : "□";
        }
        text += "\n";
      }
      return text;
    },
    rankingToRouteMapping: function (rankingList) {
      this.rankingRouteMaps = [];
      for (let i = 0; i < rankingList.length; i++) {
        const map = this.routeCodeToMapText(rankingList[i].route);
        this.rankingRouteMaps.push(map);
      }
    },

    rankingToLastMapping: function (rankingList) {
      const atackColor =
        this.selectRouteBehavior === "paint" ? this.atackColor : undefined;
      const map = this.maps[this.selectMapIndex];
      this.rankingLastMaps = [];
      for (let i = 0; i < rankingList.length; i++) {
        const lastMap = getLastMap(
          map,
          this.nextColor,
          rankingList[i].route,
          this.erasePuyoLength,
          atackColor
        );
        this.rankingLastMaps.push(lastMap);
      }
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

    selectMap: function (index) {
      this.selectMapIndex = index;
      this.displayMap = this.maps[index];
    },

    //chainEnd: function (chainNum) {},

    imgUrl: function (imgNum) {
      var puyoImg = [
        "../img/red.webp",
        "../img/blue.webp",
        "../img/yellow.webp",
        "../img/green.webp",
        "../img/purple.webp",
        "../img/heart.webp",
        "../img/prism.webp",
      ];

      if (imgNum == -1) return "../img/blank_r.gif";

      return puyoImg[imgNum];
    },

    Round: function (value, base = 0) {
      return Math.round(value * 10 ** base) / 10 ** base;
    },
  },
};
</script>
