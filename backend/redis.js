const Redis = require("redis");
const redisClient = Redis.createClient();
const DEFAULT_EXPIRATION = 3600;

redisClient
  .connect()
  .then(() => console.log("Connected to Redis."))
  .catch((err) => console.error("Not connected to Redis: ", err));

module.exports = { redisClient, DEFAULT_EXPIRATION };
