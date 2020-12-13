# Allocator Implementation

## About

This is a JavaScript implementation of a basic memory allocator algorithm. It uses Buffer as Data structure for storing data. You can find out more about buffer from [here](https://nodejs.org/en/knowledge/advanced/buffers/how-to-use-buffers/) and [here](https://nodejs.org/api/buffer.html). Using this allocator you can store strings, reallocate strings and delete strings from memory. The benefits of this realization is that in is safe for your memory, you won't be able to erase or rewrite the blocks that are used by other programs, you won't shoot yourself in the leg😁.

## Documentation

The allocator contains following methods:

### Main methods

- `mem_alloc(string)`
- `mem_realloc(index, string)`
- `mem_free(index)`
- `mem_dump()`

### Helper methods

- `write_header(offset, prevSize)`
- `update_header({ index, newState, newPrevSize, newSize })`
- `recursive_find_empty(headerIndex, sizeToFill)`
- `getData(index)`
- `recursive_find_header(headerIndex, dataIndex)`
- `recursive_free({ header, headerIndex })`

Main methods are supposed to be public and helper methods are supposed to be private, but due to javascript limitations this functionality is in Stage 3 of test and (maybe) is available using Babel. Anyway, all usable methods are listed below.

## How to test

1. Install Node.js(if wasn't installed)
2. copy this repository
3. open any shell in root directory of this project
4. run `npm start`
5. Edit `main` function as you want.
