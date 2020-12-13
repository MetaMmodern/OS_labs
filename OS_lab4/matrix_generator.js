export default function matrix_generator(size) {
  const array = new Array(size);
  for (let i = 0; i < array.length; i++) {
    array[i] = new Array(size);
    for (let j = 0; j < array[i].length; j++) {
      array[i][j] = Math.floor(Math.random() * 6);
    }
  }
  return array;
}
