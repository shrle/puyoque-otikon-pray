//var decompress = require("brotli/decompress");
import decompress from "brotli/decompress";
var Buffer = require("buffer/").Buffer;
//import zlib from "zlib";

//const routeLength = [ 48, 152, 604, 2631, 11924, 54788, 249964, 1118224, 4862356, 20401322,82033864, 314006172,];
const routeLength = [
  48, 200, 804, 3435, 15359, 70147, 320111, 1438335, 6300691, 26702013,
  108735877, 422742049,
];

let routeCode;
/*
(async () => {
  const response = await fetch("./route_1-9r.txt.br");
  const buffer = response.arrayBuffer();
  const pipeline = zlib.brotliDecompressSync(buffer);
  let text = "";
  for await (let chunk of pipeline) {
    text += chunk;
  }
  routeCode = text;
})();
*/

const loadRouteCode = async () => {
  const start = Date.now();
  const response = await fetch("/data/route_1-9r.txt.br");
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uint8Array = decompress(buffer);
  const end = Date.now() - start;
  console.log("route load time: " + end);

  let text = new TextDecoder().decode(uint8Array);

  routeCode = text.split(",");
  return routeCode;
};

export { loadRouteCode, routeLength };
