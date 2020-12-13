import PriorityQueue from "./PriorityQueue.js";
import { createObjectCsvWriter } from "csv-writer";
class CPU {
  #queue;
  #alltimes = [];

  constructor(queue) {
    this.#queue = queue;
  }

  async work(intencity = 0) {
    let currentTask = this.#queue.getHighestPriority();
    let before_exec = Date.now();
    let lastTask = Date.now() - intencity;
    while (currentTask != null) {
      if (Date.now() - lastTask >= intencity) {
        await currentTask.runAndFinish();
        console.log("finished", currentTask.id);
        this.#alltimes.push(Date.now() - before_exec);
        this.#queue.deleteHighestPriority();
        currentTask = this.#queue.getHighestPriority();
        lastTask = Date.now();
        // before_exec = Date.now();
      }
    }
    return (
      this.#alltimes.reduce((a, b) => {
        return a + b;
      }) / this.#alltimes.length
    );
  }
}
class Task {
  constructor(id, WT) {
    this.id = id;
    this.runAndFinish = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, WT * 10);
      });
    };
  }
}
class TaskGenerator {
  queue = new PriorityQueue();
  #maxPriority;
  #maxWT;

  constructor(maxWT, maxPriority) {
    this.#maxWT = maxWT;
    this.#maxPriority = maxPriority;
  }

  generate(number) {
    for (let index = 0; index < number; index++) {
      const task = new Task(index, Math.round(Math.random() * this.#maxWT));
      this.queue.insert(task, Math.round(Math.random() * this.#maxPriority));
    }
  }
}

const generator = new TaskGenerator(128, 32);

const IntelCorei7 = new CPU(generator.queue);

// generator.generate(5);

// await IntelCorei7.work(120);

const csvWriter = createObjectCsvWriter({
  path: "WTtoIntencity.csv",
  header: [
    { id: "intencity", title: "Intencity" },
    { id: "taskWaitTime", title: "Wait_Time" },
  ],
  alwaysQuote: true,
  fieldDelimiter: ";",
});
const data = [];
let index = 32;
while (index >= 2) {
  generator.generate(5);
  data.push({
    intencity: index,
    taskWaitTime: Math.round(await IntelCorei7.work(index)),
  });
  console.log("executed");
  index = index - 1;
}

await csvWriter.writeRecords(data);
