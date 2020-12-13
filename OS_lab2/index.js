const Allocator = require("./allocator");

function main() {
  const al = new Allocator();
  al.mem_dump();
  al.alloc("hello");
  al.alloc("hello");
  const hi = al.alloc("hello");
  const hi2 = al.alloc("hello");
  al.mem_dump();
  al.realloc("99999", hi2);
  al.mem_dump();
  const long = al.alloc("11111111111111111");
  al.mem_dump();
  al.dealloc(hi);
  al.dealloc(hi2);
  al.mem_dump();
  al.dealloc(long);
  al.mem_dump();
  al.alloc("55555");
  al.mem_dump();

  al.alloc("88888");
  al.mem_dump();
}

main();
