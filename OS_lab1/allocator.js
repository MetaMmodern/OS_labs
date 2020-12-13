module.exports = class Allocator {
  #buffer;
  #size;
  #headersize;
  constructor(size) {
    this.#buffer = Buffer.alloc(size);
    this.#size = size;
    this.#headersize = 5;

    this.write_header(0);
  }

  mem_alloc(string) {
    const freeHeaderIndex = this.recursive_find_empty(0, string.length);
    const header = this.#buffer.slice(
      freeHeaderIndex,
      freeHeaderIndex + this.#headersize
    );
    const isTaken = header.readIntBE(0, 1);
    const size = header.readIntBE(3, 2);
    if (!isTaken && size >= string.length) {
      this.#buffer.write(string, freeHeaderIndex + this.#headersize);
      if (size - this.#headersize > string.length) {
        //write next header
        this.write_header(
          freeHeaderIndex + this.#headersize + string.length,
          string.length
        );
      }
      //update current header
      this.update_header({
        index: freeHeaderIndex,
        newState: 1,
        newSize: string.length,
      });
    }
    return freeHeaderIndex + this.#headersize;
  }

  write_header(offset, prevSize) {
    const leftSize = this.#buffer.length - offset - 5;
    this.#buffer.writeIntBE(0, offset, 1);
    this.#buffer.writeIntBE(prevSize, offset + 1, this.#headersize - 3);
    this.#buffer.writeIntBE(leftSize, offset + 3, this.#headersize - 3);
  }

  update_header({ index, newState, newPrevSize, newSize }) {
    if (!Number.isNaN(newState)) {
      this.#buffer.writeIntBE(newState, index, 1);
    }
    if (newSize) {
      this.#buffer.writeIntBE(newSize, index + 3, this.#headersize - 3);
    }
    if (newPrevSize) {
      this.#buffer.writeIntBE(newPrevSize, index + 1, this.#headersize - 3);
    }
  }

  recursive_find_empty(headerIndex, sizeToFill) {
    if (headerIndex >= this.#size - this.#headersize) {
      return null;
    }
    const header = this.#buffer.slice(
      headerIndex,
      headerIndex + this.#headersize
    );

    const isTaken = header.readIntBE(0, 1);
    const areaSize = header.readIntBE(3, 2);
    if (!isTaken && areaSize >= sizeToFill) {
      return headerIndex;
    }
    return this.recursive_find_empty(
      headerIndex + this.#headersize + areaSize,
      sizeToFill
    );
  }
  getData(index) {
    if (index < 0 || index > this.#size) {
      return null;
    }
    const headerIndex = this.recursive_find_header(0, index);
    if (headerIndex === null) {
      return null;
    }
    const size = this.#buffer
      .slice(headerIndex, headerIndex + this.#headersize)
      .readIntBE(3, 2);
    const result = this.#buffer.slice(index, index + size);
    return result.toString();
  }

  recursive_find_header(headerIndex, dataIndex) {
    const header = this.#buffer.slice(
      headerIndex,
      headerIndex + this.#headersize
    );
    const isTaken = header.readIntBE(0, 1);
    const areaSize = header.readIntBE(3, 2);
    if (!isTaken) {
      return this.recursive_find_header(
        headerIndex + this.#headersize + areaSize,
        dataIndex
      );
    } else {
      if (headerIndex + this.#headersize === dataIndex) {
        return headerIndex;
      } else {
        return this.recursive_find_header(
          headerIndex + this.#headersize + areaSize,
          dataIndex
        );
      }
    }
  }

  mem_free(index) {
    const headerIndex = this.recursive_find_header(0, index);
    const header = this.#buffer.slice(
      headerIndex,
      headerIndex + this.#headersize
    );
    const areaSize = header.readIntBE(3, 2);
    this.#buffer.fill(
      "",
      headerIndex + this.#headersize,
      headerIndex + this.#headersize + areaSize
    );
    this.update_header({ index: headerIndex, newState: 0 });
    this.recursive_free({ header, headerIndex });
  }

  recursive_free({ header, headerIndex }) {
    const prevSize = header.readIntBE(1, 2);
    const areaSize = header.readIntBE(3, 2);
    if (prevSize !== 0) {
      const prevHeader = this.#buffer.slice(
        headerIndex - prevSize - this.#headersize,
        headerIndex - prevSize - this.#headersize + this.#headersize
      );
      const prevIsTaken = prevHeader.readIntBE(0, 1);
      const prevAreaSize = prevHeader.readIntBE(3, 2);
      if (!prevIsTaken) {
        this.#buffer.fill(0, headerIndex, headerIndex + this.#headersize);
        this.update_header({
          index: headerIndex - prevSize - this.#headersize,
          newState: 0,
          newSize: areaSize + this.#headersize + prevAreaSize,
        });

        this.update_header({
          index: headerIndex + areaSize + this.#headersize,
          newPrevSize: areaSize + this.#headersize + prevAreaSize,
        });

        this.recursive_free({
          header: prevHeader,
          headerIndex: headerIndex - prevSize - this.#headersize,
        });
      } else {
        const nextIndex = headerIndex + this.#headersize + areaSize;
        if (nextIndex >= this.#size) return;
        const nextHeader = this.#buffer.slice(
          nextIndex,
          nextIndex + this.#headersize
        );

        const nextIsTaken = nextHeader.readIntBE(0, 1);
        const nextAreaSize = nextHeader.readIntBE(3, 2);
        if (!nextIsTaken) {
          this.#buffer.fill(0, nextIndex, nextIndex + this.#headersize);
          this.update_header({
            index: headerIndex,
            newState: 0,
            newSize: areaSize + this.#headersize + nextAreaSize,
          });
          this.recursive_free({ header, headerIndex });
        }
      }
    } else {
      const nextIndex = headerIndex + this.#headersize + areaSize;
      if (nextIndex >= this.#size) return;
      const nextHeader = this.#buffer.slice(
        nextIndex,
        nextIndex + this.#headersize
      );

      const nextIsTaken = nextHeader.readIntBE(0, 1);
      const nextAreaSize = nextHeader.readIntBE(3, 2);
      if (!nextIsTaken) {
        this.#buffer.fill(0, nextIndex, nextIndex + this.#headersize);
        this.update_header({
          index: headerIndex,
          newState: 0,
          newSize: areaSize + this.#headersize + nextAreaSize,
        });
        this.recursive_free({ header, headerIndex });
      }
    }
  }

  mem_realloc(index, string) {
    if (index === null) {
      return this.mem_alloc(string);
    }
    if (index < 0 || index > this.#size) {
      return null;
    }
    const headerIndex = this.recursive_find_header(0, index);
    if (headerIndex === null) {
      return null;
    }
    const size = this.#buffer
      .slice(headerIndex, headerIndex + this.#headersize)
      .readIntBE(3, 2);
    if (string.length > size) {
      return null;
    }
    if (string.length === size) {
      this.#buffer.write(string, headerIndex + this.#headersize);
      return headerIndex;
    }
    if (string.length < size) {
      const firstPart = this.#buffer.slice(
        0,
        headerIndex + this.#headersize + string.length
      );
      const secondPart = this.#buffer.slice(
        headerIndex + this.#headersize + size,
        this.#size
      );
      const emptyPartLength = this.#buffer.slice(
        headerIndex + this.#headersize + string.length,
        headerIndex + this.#headersize + size
      ).length;

      const emptyHeader = this.recursive_find_empty(0, 0);
      if (emptyHeader === null) {
        return null;
      }
      this.#buffer.write(string, headerIndex + this.#headersize);
      this.update_header({
        index: headerIndex + this.#headersize + string.length,
        newPrevSize: string.length,
      });
      this.update_header({
        index: headerIndex,
        newState: 1,
        newSize: string.length,
      });
      const emptySize = this.#buffer
        .slice(emptyHeader, emptyHeader + this.#headersize)
        .readIntBE(3, 2);

      if (
        emptyHeader + this.#headersize + emptySize <
        this.#size - this.#headersize
      )
        this.update_header({
          index: emptyHeader + this.#headersize + emptySize,
          newPrevSize: emptySize + emptyPartLength,
        });
      this.update_header({
        index: emptyHeader,
        newSize: emptySize + emptyPartLength,
      });

      this.#buffer = Buffer.concat([firstPart, secondPart]);
      this.#buffer = Buffer.concat([
        this.#buffer.slice(0, emptyPartLength + this.#headersize + emptySize),
        Buffer.alloc(emptyPartLength),
        this.#buffer.slice(
          emptyPartLength + this.#headersize + emptySize,
          this.#size
        ),
      ]);
    }
  }

  mem_dump() {
    console.log(this.#buffer);
  }
};
