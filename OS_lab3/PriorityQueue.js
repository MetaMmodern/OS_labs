class Item {
  value;
  priority;
  constructor(value, priority) {
    this.value = value;
    this.priority = priority;
  }
}
export default class PriorityQueue {
  queue;
  constructor() {
    this.queue = [];
  }
  insert(item, priority = 0) {
    const readyItem = new Item(item, priority);
    this.queue.push(readyItem);
  }
  #sortQueue() {
    this.queue.sort((a, b) => {
      return a.priority - b.priority;
    });
  }
  getHighestPriority() {
    this.#sortQueue();
    return this.queue[0]?.value || null;
  }
  deleteHighestPriority() {
    this.#sortQueue();
    this.queue.shift();
  }
}
