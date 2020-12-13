const Allocator = require("./allocator");

function main() {
  const allocator = new Allocator(40);
  allocator.mem_dump();
  const index1 = allocator.mem_alloc("hell");
  allocator.mem_dump();

  const index2 = allocator.mem_alloc("world");
  allocator.mem_dump();
  allocator.mem_realloc(index2, "hhh");

  allocator.mem_dump();

  allocator.mem_free(index1);
  allocator.mem_dump();
  allocator.mem_free(index2);
  allocator.mem_dump();
}

main();
