import PuyoqueStd from "@/js/puyoquestd.js";
import Ranking from "@/js/ranking.js";

const fieldWidth = 8;
const fieldHeight = 6;
const puyoColor = PuyoqueStd.puyoColor;
const c = puyoColor;

const nonPuyos = [puyoColor.heart, puyoColor.prism, puyoColor.ojama];
/**
 * @typedef {Object} DeleteCount
 *
 * @property {boolean} chained
 * @property {number[]} deleteCount 各色の消えた数
 * @property {number[]} deleteAreaCount 消えた色ぷよの連結箇所の数
 */

/**
 * 連結されている色ぷよを探し、その色ぷよと周囲の色ぷよ以外を消去する
 *
 * @param {number} erasePuyoLength 消去対象の最小連結数
 *
 * @returns {DeleteCount}
 */
const deletePuyos = function (field, erasePuyoLength) {
  const c = puyoColor;
  let chained = false;
  let deleteCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  let deleteAreaCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  // 連結箇所を探す
  field.searchLinkPuyos(erasePuyoLength, (points, color) => {
    chained = true;
    deleteCount[color] += points.length;
    deleteAreaCount[color]++;

    // 連結箇所の周囲に対する処理
    field.targetsAround(points, (x, y, color) => {
      if (field.colorMultComp(x, y, nonPuyos)) {
        deleteCount[color]++;
        field.deletePuyo(x, y);
      } else if (field.colorComp(x, y, c.kataPuyo)) {
        field.setColor(x, y, c.ojamaChanging);
      }
    });

    field.deletePuyos(points); // 連結部分を消す
  });

  return {
    chained,
    deleteCount,
    deleteAreaCount,
  };
};

/**
 * 連結されている色ぷよを探し、その色ぷよと周囲の色ぷよ以外を消去する
 * このメソッドはネクストぷよが降る最終連鎖のときに呼び出される
 *
 * @param {number} erasePuyoLength 消去対象の最小連結数
 *
 * @returns {DeleteCount}
 */
const lastDeletePuyos = function (
  field,
  erasePuyoLength,
  eraseAssumedPuyoLength,
  eraseBlankNum,
  atackColor
) {
  const c = puyoColor;
  let chained = false;
  let deleteCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  let deleteAreaCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  /**
   * 連結箇所を探す
   *
   * <>eraseAssumedPuyoLength
   * 攻撃色でなおかつ消える数よりも小さい連結を落ちコン要因として探している
   * さらにそれに隣接している空欄の数も調べる
   */
  field.searchLinkPuyos(eraseAssumedPuyoLength, (points, color) => {
    if (
      color === atackColor &&
      eraseAssumedPuyoLength >= points.length &&
      points.length < erasePuyoLength
    ) {
      let blankNum = 0;
      field.targetsAround(points, (x, y) => {
        if (field.isBlank(x, y)) {
          blankNum++;
        }
      });

      if (blankNum >= eraseBlankNum) {
        deleteCount[color] += points.length;
        deleteAreaCount[color]++;
      }
    } else if (points.length >= erasePuyoLength) {
      chained = true;
      deleteCount[color] += points.length;
      deleteAreaCount[color]++;
      // 連結箇所の周囲に対する処理
      field.targetsAround(points, (x, y, color) => {
        if (field.colorMultComp(x, y, nonPuyos)) {
          deleteCount[color]++;
        } else if (field.colorComp(x, y, c.kataPuyo)) {
          field.setColor(x, y, c.ojamaChanging);
        }
      });
    }
  });

  return {
    chained,
    deleteCount,
    deleteAreaCount,
  };
};
const chainForRouteDelete = function (
  field,
  map,
  nextColor,
  atackColor,
  routeCode,
  erasePuyoLength,
  eraseAssumedPuyoLength,
  eraseBlankNum,
  doujiCorrection,
  chainCorrection
) {
  field.setMapColor(map);
  field.setAllNextColor(nextColor);
  field.deletePuyosFromCode(routeCode);

  let deleteCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  //let deleteAreaCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  let totalColorMag = [0, 0, 0, 0, 0]; // 各色の威力倍率
  let chainNum = -1;
  let chained = true;

  while (chained) {
    chained = false;
    chainNum++;

    field.dropFloatingPuyo(); // 浮遊ぷよの落下処理

    let ret;
    //連鎖が発生しない場合、ネクストぷよを落下させる
    if (!field.isChain(erasePuyoLength)) {
      field.dropFloatingNext();

      ret = lastDeletePuyos(
        field,
        erasePuyoLength,
        eraseAssumedPuyoLength,
        eraseBlankNum,
        atackColor
      );

      /**
       * 確定連鎖が存在しない場合は落ちコン発生率が落ちるので除外する
       */
      if (!ret.chained) break;

      /*
       * ネクストぷよの落下を一度のみとしこの連鎖で処理を終了させるため
       * chained は false のままにする
       */
      // chained = false;
    } else {
      ret = deletePuyos(field, erasePuyoLength);
      chained = ret.chained;
    }

    let colorMag = colorMagCalc(
      ret.deleteCount,
      ret.deleteAreaCount,
      chainNum,
      doujiCorrection,
      chainCorrection,
      erasePuyoLength
    );
    for (const color in totalColorMag) {
      totalColorMag[color] += colorMag[color];
    }

    deleteCount = arraysSum(deleteCount, ret.deleteCount);
  }

  let allClear = field.isAllClear();

  return {
    totalColorMag,
    chainNum,
    allClear,
    deleteCount,
  };
};
const chainForRoutePaint = function (
  field,
  map,
  nextColor,
  atackColor,
  paintColor,
  routeCode,
  erasePuyoLength,
  eraseAssumedPuyoLength,
  eraseBlankNum,
  doujiCorrection,
  chainCorrection
) {
  field.setMapColor(map);
  field.setAllNextColor(nextColor);
  //field.deletePuyos(route);
  //field.deletePuyosFromCode(routeCode);
  field.setPuyosColorFromCode(routeCode, paintColor);

  let deleteCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  //let deleteAreaCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  let totalColorMag = [0, 0, 0, 0, 0]; // 各色の威力倍率
  let chainNum = -1;
  let chained = true;

  while (chained) {
    chained = false;
    chainNum++;

    field.dropFloatingPuyo(); // 浮遊ぷよの落下処理

    let ret;
    //連鎖が発生しない場合、ネクストぷよを落下させる
    if (!field.isChain(erasePuyoLength)) {
      field.dropFloatingNext();

      ret = lastDeletePuyos(
        field,
        erasePuyoLength,
        eraseAssumedPuyoLength,
        eraseBlankNum,
        atackColor
      );

      /**
       * 確定連鎖が存在しない場合は落ちコン発生率が落ちるので除外する
       */
      if (!ret.chained) break;

      /*
       * ネクストぷよの落下を一度のみとしこの連鎖で処理を終了させるため
       * chained は false のままにする
       */
      // chained = false;
    } else {
      ret = deletePuyos(field, erasePuyoLength);
      chained = ret.chained;
    }

    let colorMag = colorMagCalc(
      ret.deleteCount,
      ret.deleteAreaCount,
      chainNum,
      doujiCorrection,
      chainCorrection,
      erasePuyoLength
    );
    for (const color in totalColorMag) {
      totalColorMag[color] += colorMag[color];
    }

    deleteCount = arraysSum(deleteCount, ret.deleteCount);
  }

  let allClear = field.isAllClear();

  return {
    totalColorMag,
    chainNum,
    allClear,
    deleteCount,
  };
};

/**
 * 各色の威力倍率
 *
 */
const colorMagCalc = function (
  deleteCount,
  deleteAreaCount,
  chainNum,
  doujiCorrection,
  chainCorrection,
  erasePuyoLength
) {
  const deletePuyoNum = doujiTotal(deleteCount);
  let colorMag = [0, 0, 0, 0, 0]; // colorMag[puyoColor] = 倍率;
  const puyoMag = PuyoqueStd.puyoMagCalc(
    deletePuyoNum,
    chainNum,
    doujiCorrection,
    chainCorrection,
    erasePuyoLength
  );

  for (const color in colorMag) {
    colorMag[color] =
      puyoMag * deleteAreaCount[color] + deleteCount[puyoColor.prism] * 3;
  }

  //colorMag = colorMag.map((x) => x + deleteCount[puyoColor.prism] * 3);

  return colorMag;
};

const doujiTotal = function (deleteCount) {
  const targetColor = [
    c.red,
    c.blue,
    c.yellow,
    c.green,
    c.purple,
    c.prism,
    c.ojama,
  ];
  let sum = 0;

  for (const color of targetColor) {
    sum += deleteCount[color];
  }

  return sum;
};

const arraysSum = function (arrayA, arrayB) {
  let sumArray = [];

  for (let i in arrayA) {
    if (i >= arrayB.length) break;
    sumArray.push(arrayA[i] + arrayB[i]);
  }

  return sumArray;
};

/*
const outputRankingRoute = () => {
  const routeBox = document.querySelector("#route");
  let html = "";
  for (let i = 0; i < ranking.length - 1; i++) {
    const mapText = outputRouteCode(ranking[i].route);
    html += "<pre style='margin:20px;'>" + mapText + "</pre>";
  }

  routeBox.innerHTML = html;
};
*/

/**
 *
 * @typedef {Object} Score
 *
 * @property {string} routeCode なぞり消しルート
 * @property {puyoColor[][]} lastMap 最終盤面
 * @property {number[]} totalColorMag 各色の攻撃力倍率
 * @property {number} chainNum 連鎖数
 * @property {number} allClear 全消しであればtrue
 * @property {number} deleteCount 消したぷよの数
 */

/**
 * 落ちコンお祈りルート解析
 *
 * @param {string[]} routeCodeList なぞり消しルート一覧
 * @param {puyoColor[][]} map ぷよのマップ
 * @param {puyoColor} nextColor ネクストの色
 * @param {puyoColor} atackColor 攻撃色
 * @param {number} erasePuyoLength ぷよが消える連結数
 * @param {number} eraseBlankNum 落ちコンに求める空欄の数
 * @param {number} doujiCorrection 同時消し係数
 * @param {number} chainCorrection 連鎖係数
 *
 * @returns {Score[]} atackColorの降順リスト
 */
const analysisForRouteDelete = function (
  routeCodeList,
  routeCodeLength,
  map,
  nextColor,
  atackColor,
  erasePuyoLength,
  eraseAssumedPuyoLength,
  eraseBlankNum,
  doujiCorrection,
  chainCorrection
) {
  console.log("analysisForRouteDelete");
  console.dir({
    routeCodeList,
    routeCodeLength,
    map,
    nextColor,
    atackColor,
    erasePuyoLength,
    eraseAssumedPuyoLength,
    eraseBlankNum,
    doujiCorrection,
    chainCorrection,
  });
  let ranking = new Ranking(50, atackColor);
  const field = PuyoqueStd.createField(fieldWidth, fieldHeight);

  const start = Date.now();
  for (let i = 0; i < routeCodeLength; i++) {
    const route = routeCodeList[i];
    let result = chainForRouteDelete(
      field,
      map,
      nextColor,
      atackColor,
      route,
      erasePuyoLength,
      eraseAssumedPuyoLength,
      eraseBlankNum,
      doujiCorrection,
      chainCorrection
    );

    result.route = route;
    ranking.add(result);
  }

  const end = Date.now() - start;
  console.log(end);
  return ranking.list;
};

const analysisForRoutePaint = function (
  routeCodeList,
  routeCodeLength,
  map,
  nextColor,
  atackColor,
  paintColor,
  erasePuyoLength,
  eraseAssumedPuyoLength,
  eraseBlankNum,
  doujiCorrection,
  chainCorrection
) {
  console.log("analysisForRoutePaint");
  console.dir({
    routeCodeList,
    routeCodeLength,
    map,
    nextColor,
    atackColor,
    paintColor,
    erasePuyoLength,
    eraseAssumedPuyoLength,
    eraseBlankNum,
    doujiCorrection,
    chainCorrection,
  });
  const field = PuyoqueStd.createField(fieldWidth, fieldHeight);
  let ranking = new Ranking(50, atackColor);

  const start = Date.now();
  for (let i = 0; i < routeCodeLength; i++) {
    const route = routeCodeList[i];

    let result = chainForRoutePaint(
      field,
      map,
      nextColor,
      atackColor,
      paintColor,
      route,
      erasePuyoLength,
      eraseAssumedPuyoLength,
      eraseBlankNum,
      doujiCorrection,
      chainCorrection
    );

    result.route = route;
    ranking.add(result);
  }

  const end = Date.now() - start;
  console.log(end);
  return ranking.list;
};

const getLastMap = function (
  map,
  nextColor,
  routeCode,
  erasePuyoLength,
  paintColor
) {
  let field = PuyoqueStd.createField(fieldWidth, fieldHeight);

  field.setMapColor(map);
  field.setAllNextColor(nextColor);
  if (paintColor) {
    field.setPuyosColorFromCode(routeCode, paintColor);
  } else {
    field.deletePuyosFromCode(routeCode);
  }

  let chained = true;

  while (chained) {
    chained = false;

    field.dropFloatingPuyo(); // 浮遊ぷよの落下処理

    let ret;
    //連鎖が発生しない場合、ネクストぷよを落下させる
    if (!field.isChain(erasePuyoLength)) {
      field.dropFloatingNext();
      break;
    } else {
      ret = deletePuyos(field, erasePuyoLength);
      chained = ret.chained;
    }
  }

  return field.getMap();
};

export { analysisForRouteDelete, analysisForRoutePaint, getLastMap };
