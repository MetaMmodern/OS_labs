import hungar from "./hungar.js";
import matrix_generator from "./matrix_generator.js";
const main = () => {
  const arr = [
    [0, 0, 2, 0, 0],
    [3, 0, 0, 3, 1],
    [0, 2, 0, 3, 1],
    [4, 5, 0, 1, 3],
    [3, 3, 0, 3, 4],
  ];
  console.log(hungar(arr));
};
main();
