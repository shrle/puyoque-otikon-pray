import * as maps from "@/js/maps";
import PuyoqueStd from "@/js/puyoquestd";
import {
  analysisForRouteDelete,
  analysisForRoutePaint,
} from "@/js/otikon-pray-analysis";

const puyoColor = PuyoqueStd.puyoColor;

const settings = {
  charmyDraco: {
    maps: maps.charmyDraco,
    name: "チャーミードラコ",
    erasePuyoLength: 4,
    chainCorrection: 1,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.red,
    selectRouteBehavior: "delete",
    analysis: analysisForRouteDelete,
  },
  moreSuspiciousKlug: {
    maps: maps.moreSuspiciousKlug,
    name: "もっとあやしいクルーク",
    erasePuyoLength: 4,
    chainCorrection: 1,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.red,
    selectRouteBehavior: "delete",
    analysis: analysisForRouteDelete,
  },
  anndoRingo: {
    maps: maps.anndoRingo,
    name: "あんどうりんご",
    erasePuyoLength: 3,
    chainCorrection: 7,
    eraseAssumedPuyoLength: 2,
    eraseBlankNum: 2,
    color: puyoColor.green,
    selectRouteBehavior: "delete",
    analysis: analysisForRouteDelete,
  },
  spaceEcolo: {
    maps: maps.anndoRingo,
    name: "スペース☆エコロ",
    erasePuyoLength: 3,
    chainCorrection: 7,
    eraseAssumedPuyoLength: 2,
    eraseBlankNum: 2,
    color: puyoColor.purple,
    selectRouteBehavior: "delete",
    analysis: analysisForRouteDelete,
  },
  whiteMarle: {
    maps: maps.whiteMarle,
    name: "しろいマール",
    erasePuyoLength: 4,
    chainCorrection: 10,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.blue,
    selectRouteBehavior: "paint",
    analysis: analysisForRoutePaint,
  },

  midsummerAmanone: {
    maps: maps.midsummerAmanone,
    name: "なつぞらのアマノネ",
    erasePuyoLength: 4,
    chainCorrection: 10.5,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.purple,
    selectRouteBehavior: "paint",
    analysis: analysisForRoutePaint,
  },

  attariPoobo: {
    maps: maps.attariPoobo,
    name: "あたり＆プーボ",
    erasePuyoLength: 4,
    chainCorrection: 10.5,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.yellow,
    selectRouteBehavior: "paint",
    analysis: analysisForRoutePaint,
  },

  cureBloomCureEgrette: {
    maps: maps.cureBloomCureEgrette,
    name: "キュアブルーム＆キュアイーグレット",
    erasePuyoLength: 4,
    chainCorrection: 10.5,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.red,
    selectRouteBehavior: "paint",
    analysis: analysisForRoutePaint,
  },
};

export default settings;
