const loadImageSync = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.log("画像読み込みエラー");
      console.dir(e);
      return reject(e);
    };
    img.src = src;
  });
};

export default loadImageSync;
