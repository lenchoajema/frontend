const redis = require("redis");

const redisClient = redis.createClient({
  url: "redis://127.0.0.1:6379", // Update with your Redis server URL if necessary
});

redisClient.connect().catch((err) => {
  console.error("Redis connection error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = redisClient;
