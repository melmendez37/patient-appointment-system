import { redisClient, DEFAULT_EXPIRATION } from "../redis.js";

export async function getOrSetCache(key, cb) {
  const cached = await redisClient.get(key);

  if (cached) return JSON.parse(cached);

  const freshData = await cb();

  await redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
  return freshData;
}