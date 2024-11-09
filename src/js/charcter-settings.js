import * as maps from "@/js/maps";
import PuyoqueStd from "@/js/puyoquestd";
import {
  analysisForRouteDelete,
  analysisForRoutePaint,
} from "@/js/otikon-pray-analysis";

const puyoColor = PuyoqueStd.puyoColor;

const settings = {
  normal: {
    maps: maps.normal,
    name: "チャーミードラコ",
    erasePuyoLength: 4,
    chainCorrection: 1,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.red,
    selectRouteBehavior: "delete",
    analysis: analysisForRouteDelete,
  },
  deleteThree: {
    maps: maps.deleteThree,
    name: "あんどうりんご",
    erasePuyoLength: 3,
    chainCorrection: 7,
    eraseAssumedPuyoLength: 2,
    eraseBlankNum: 2,
    color: puyoColor.green,
    selectRouteBehavior: "delete",
    analysis: analysisForRouteDelete,
  },
  paintBlue: {
    maps: maps.paintBlue,
    name: "しろいマール",
    erasePuyoLength: 4,
    chainCorrection: 10,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.blue,
    selectRouteBehavior: "paint",
    analysis: analysisForRoutePaint,
  },

  paintPurple: {
    maps: maps.paintPurple,
    name: "なつぞらのアマノネ",
    erasePuyoLength: 4,
    chainCorrection: 10.5,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.purple,
    selectRouteBehavior: "paint",
    analysis: analysisForRoutePaint,
  },

  paintYellow: {
    maps: maps.paintYellow,
    name: "あたり＆プーボ",
    erasePuyoLength: 4,
    chainCorrection: 10.5,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.yellow,
    selectRouteBehavior: "paint",
    analysis: analysisForRoutePaint,
  },

  paintRed: {
    maps: maps.paintRed,
    name: "キュアブルーム＆キュアイーグレット",
    erasePuyoLength: 4,
    chainCorrection: 10.5,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.red,
    selectRouteBehavior: "paint",
    analysis: analysisForRoutePaint,
  },

  paintGreen: {
    maps: maps.paintGreen,
    name: "黄昏",
    erasePuyoLength: 4,
    chainCorrection: 10.5,
    eraseAssumedPuyoLength: 3,
    eraseBlankNum: 3,
    color: puyoColor.green,
    selectRouteBehavior: "paint",
    analysis: analysisForRoutePaint,
  },
};

export default settings;
