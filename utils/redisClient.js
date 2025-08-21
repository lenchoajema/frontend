// Simple singleton accessor for shared Redis client initialized in server.js
let client = null;
function setRedis(c) { client = c; }
function getRedis() { return client; }
module.exports = { setRedis, getRedis };
