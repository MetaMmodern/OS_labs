function timeOut(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

function resultOfSum(a, b) {
  return a + b;
}

async function func2(a, b) {
  let res = 0;
  for (let i = 0; i < 100000; i++) {
    await timeOut(1);
    if (i > 8) res = resultOfSum(a, b);
    if (res > 0) return res;
  }
}
async function func1(a, b) {
  const res = 0;
  for (let i = 0; i < 100000; i++) {
    const res = await func2(a, b);
    if (res > 0) return res;
  }
  return 0;
}

async function main() {
  await func1(5, 10);
  return 0;
}

main().then(() => {
  console.log("finished");
});
