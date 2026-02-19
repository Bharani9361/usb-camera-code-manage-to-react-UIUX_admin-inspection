
// to find node memory allocated for your project
const v8 = require('v8');
console.log(`Max heap size (in MB): ${v8.getHeapStatistics().heap_size_limit / 1024 / 1024}`);