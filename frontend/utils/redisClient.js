const redis = require("redis");

const redisUrl = process.env.REDIS_URI || "redis://127.0.0.1:6379";

const redisClient = redis.createClient({
  url: redisUrl,
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
