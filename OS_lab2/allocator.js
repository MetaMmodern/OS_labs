function round_degree(number) {
  let result = number;
  while (!!(result & (result - 1))) {
    result++;
  }
  result = result === 1 ? 2 : result;
  return result;
}

class PageDescriptor {
  #startIndex;
  block_size;
  counter;
  first_empty;
  constructor(block_size, counter, start) {
    this.block_size = block_size;
    this.first_empty = block_size;
    this.counter = counter;
    this.#startIndex = start;
  }
  write() {
    this.first_empty += this.block_size;
    this.counter--;
  }
  getStart() {
    return this.#startIndex;
  }
  clear(index) {
    if (this.first_empty > index) {
      this.first_empty = index;
    }
    this.counter++;
  }
}

module.exports = class Allocator {
  #buffer;
  #pages = 3;
  #page_size = 32;
  #descriptors = [];
  #free = new Map();
  constructor() {
    this.#buffer = Buffer.alloc(this.#page_size * this.#pages);
  }
  getIndexWhereToWrite(end) {
    let padding = 0;
    for (let index = 0; index < this.#descriptors.length; index++) {
      const descriptor = this.#descriptors[index];
      if (descriptor.getStart() === end) {
        padding += descriptor.first_empty;
        break;
      } else {
        padding += this.#page_size;
      }
    }
    return padding;
  }

  alloc(string) {
    let size = round_degree(string.length);
    if (size <= this.#page_size / 2) {
      if (this.#free[size] ? !!this.#free[size].length > 0 : false) {
        const index = this.#free[size][0];
        let toWrite = this.getIndexWhereToWrite(index);
        toWrite =
          this.#buffer.readIntBE(toWrite, 1) ===
          toWrite + this.#descriptors[index].block_size
            ? toWrite
            : this.#buffer.readIntBE(toWrite, 1);
        this.#buffer.write(string, toWrite);
        this.#descriptors[index / 32].write();
        if (this.#descriptors[index / 32].counter === 0) {
          this.#free[size].shift();
        }
        return toWrite;
      } else {
        if (this.#descriptors.length < this.#pages) {
          const newPage = new PageDescriptor(
            size,
            this.#page_size / size - 1,
            this.#descriptors.length * this.#page_size
          );
          this.#descriptors.push(newPage);
          this.#free[size] = [(this.#descriptors.length - 1) * this.#page_size];

          let block = size;
          while (block < this.#page_size) {
            this.#buffer.writeIntBE(
              this.#page_size * (this.#descriptors.length - 1) + block + size,
              this.#page_size * (this.#descriptors.length - 1) + block,
              1
            );
            block += size;
          }
          this.#buffer.write(
            string,
            this.#page_size * (this.#descriptors.length - 1)
          );
          return this.#page_size * (this.#descriptors.length - 1);
        } else {
          throw new Error("no pages left to write");
        }
      }
    } else {
      while (size % 2 !== 0) {
        size++;
      }
      if (this.#descriptors.length + size / this.#page_size >= this.#pages) {
        throw new Error("no pages left to write");
      }

      for (let i = 0; i < size / this.#page_size; i++) {
        if (i > 0) {
          const newPage = new PageDescriptor(
            this.#page_size,
            0,
            this.#descriptors.length * this.#page_size
          );
          this.#descriptors.push(newPage);
        } else {
          const newPage = new PageDescriptor(
            size,
            0,
            this.#descriptors.length * this.#page_size
          );
          this.#descriptors.push(newPage);
        }
      }
      this.#free[size] = [];
      this.#buffer.write(
        string,
        this.#page_size * (this.#descriptors.length - size / 32)
      );
      return this.#page_size * (this.#descriptors.length - size / 32);
    }
  }
  dealloc(index) {
    let pageIndex = index;
    while (pageIndex % this.#page_size != 0) {
      pageIndex--;
    }
    const size = this.#descriptors[pageIndex / this.#page_size].block_size;
    this.#buffer.fill("", index, index + size);
    this.#buffer.writeIntBE(index + size, index, 1);
    console.log(index);
    this.#descriptors[pageIndex / this.#page_size].clear(index);
    if (
      this.#descriptors[pageIndex / this.#page_size].counter > 0 &&
      !this.#free[size].includes(pageIndex)
    ) {
      this.#free[size].push(pageIndex);
    }
  }
  realloc(string, index) {
    let pageIndex = index;
    while (pageIndex % this.#page_size != 0) {
      pageIndex--;
    }
    const size = this.#descriptors[pageIndex / this.#page_size].block_size;
    if (string.length > size) {
      return;
    } else {
      this.#buffer.write(string, index);
    }
  }
  mem_dump() {
    console.log(this.#descriptors);
    console.log(this.#free);
    console.log(
      "<" + this.#buffer.toString("hex").match(/../g).join(" ") + ">"
    );
    console.log("=".repeat(process.stdout.columns));
  }
  read(index) {
    let pageIndex = index;
    while (pageIndex % this.#page_size != 0) {
      pageIndex--;
    }
    const size = this.#descriptors[pageIndex / this.#page_size].block_size;
    return this.#buffer.toString("utf8", index, index + size);
  }
};
