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
    color: puyoColor.red,
    selectRouteBehavior: "delete",
    analysis: analysisForRouteDelete,
  },
  moreSuspiciousKlug: {
    maps: maps.moreSuspiciousKlug,
    name: "もっとあやしいクルーク",
    erasePuyoLength: 4,
    color: puyoColor.red,
    selectRouteBehavior: "delete",
    analysis: analysisForRouteDelete,
  },
  anndoRingo: {
    maps: maps.anndoRingo,
    name: "あんどうりんご",
    erasePuyoLength: 3,
    color: puyoColor.green,
    selectRouteBehavior: "delete",
    analysis: analysisForRouteDelete,
  },
  whiteMarle: {
    maps: maps.whiteMarle,
    name: "しろいマール",
    erasePuyoLength: 4,
    color: puyoColor.blue,
    selectRouteBehavior: "paint",
    analysis: analysisForRoutePaint,
  },
};

export default settings;
