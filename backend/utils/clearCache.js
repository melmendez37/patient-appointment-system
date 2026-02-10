import { redisClient } from "../redis.js";

export const clearCache = async (keys = []) => {
    if(!Array.isArray(keys)){
        throw new Error("clearCache expects an array of keys")
    }

    if(keys.length === 0) return;

    await redisClient.del(keys);
}