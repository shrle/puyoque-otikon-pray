const array2dInit = (width, height, value) => {
  let array = [];

  for (let y = 0; y < height; y++) {
    array[y] = [];
    for (let x = 0; x < width; x++) {
      array[y][x] = value;
    }
  }
  return array;
};

export default array2dInit;
