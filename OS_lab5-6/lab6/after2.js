function resultOfSum(a, b) {
  return a + b;
}

function func2(a, b) {
  return resultOfSum(a, b);
}
function func1(a, b) {
  const res = func2(a, b);
  if (res > 0) return res;
}

async function main() {
  console.log(func1(5, 10));
  return 0;
}

main();
