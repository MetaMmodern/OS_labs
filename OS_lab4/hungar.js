const transpose = (m) => m[0].map((x, i) => m.map((x) => x[i]));

const shredCols = (arr, deletedCols) => {
  let resulting = [];
  for (let i = 0; i < arr.length; i++) {
    if (!deletedCols.includes(i)) {
      resulting.push(JSON.parse(JSON.stringify(arr[i])));
    }
  }
  return resulting;
};
const shredRows = (transposed, deletedRows, newRes) => {
  for (let i = 0; i < transposed.length; i++) {
    if (transposed[i].includes(0)) {
      deletedRows.push(i);
      continue;
    } else {
      newRes.push(transposed[i]);
    }
  }
};
function shredder(arr, deletedCols) {
  let resulting = shredCols(arr, deletedCols);
  const deletedRows = [];
  let newRes = [];
  shredRows(transpose(resulting), deletedRows, newRes);
  const minimum = Math.min(...newRes.flat());
  // console.log("deletedRows:", deletedRows);
  // console.log("deletedCols:", deletedCols);
  // console.log("shredded:", newRes, "; minimum: ", minimum);
  // console.log("original:", arr);
  const nowWorkWith = transpose(arr);
  for (let i = 0; i < nowWorkWith.length; i++) {
    const subArray = nowWorkWith[i];
    for (let j = 0; j < subArray.length; j++) {
      if (deletedCols.includes(i) && deletedRows.includes(j)) {
        nowWorkWith[j][i] += minimum;
      } else if (!deletedCols.includes(i) && !deletedRows.includes(j)) {
        nowWorkWith[j][i] -= minimum;
      }
    }
  }
  return nowWorkWith;
}

const createReadyMatrix = (size, indexes) => {
  const readyMtx = new Array(size);
  for (let i = 0; i < readyMtx.length; i++) {
    readyMtx[i] = new Array(size).fill(0);
  }
  for (let i = 0; i < indexes.length; i++) {
    const coordinates = indexes[i];
    readyMtx[coordinates.x][coordinates.y] = 1;
  }
  return readyMtx;
};

function findUniqueZeros(arr) {
  const uniqs = [];

  const testForUniqueZeros = (el, index) => {
    if (el === 0) {
      if (!uniqs.find((item) => item.x === index)) {
        return true;
      }
    }
  };
  const forCols = transpose(arr);
  for (let index = 0; index < forCols.length; index++) {
    const element = forCols[index];
    const firstZeroIndex = element.findIndex(testForUniqueZeros);
    if (firstZeroIndex !== -1) {
      uniqs.push({ x: firstZeroIndex, y: index });
    }
  }
  if (uniqs.length === arr.length) {
    return createReadyMatrix(arr.length, uniqs);
  } else {
    return findUniqueZeros(
      shredder(
        forCols,
        uniqs.map((el) => el.y)
      )
    );
  }
}

function reduction(arr) {
  for (let i = 0; i < arr.length; i++) {
    const subArray = arr[i];
    const localMin = Math.min(...subArray);
    for (let j = 0; j < subArray.length; j++) {
      subArray[j] -= localMin;
    }
  }
}

export default function hugar(array) {
  let ArrToWork = array.map((el) => el.slice());
  reduction(ArrToWork);
  ArrToWork = transpose(ArrToWork);
  reduction(ArrToWork);
  ArrToWork = transpose(ArrToWork);
  console.log(ArrToWork);
  return findUniqueZeros(ArrToWork);

  // console.log(ArrToWork);
}
