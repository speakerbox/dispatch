'use strict';

// Load our config before anything else
require('./config');

let nconf = require('nconf');
let numCPUs = nconf.get('server:workers') || require('os').cpus().length;
let cluster = require('cluster');
let server = require('./server');

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Exit event is fired whenever a worker process exits.
  cluster.on('exit', function(worker, code, signal) {
    // Restart the worker
    let newWorker = cluster.fork();

    // Log the respawn
    console.log('worker ' + worker.process.pid + ' exited.', code || signal);
    console.log('worker ' + newWorker.process.pid + ' created.');
  });
} else {
  // Start the server
  server.init();
}
