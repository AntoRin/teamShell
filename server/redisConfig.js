const redis = require("redis");
const { promisify } = require("util");

const redisClient = redis.createClient({
   password: process.env.REDIS_PASSWORD,
});

const redisGetAsync = promisify(redisClient.get).bind(redisClient);
const redisSetAsync = promisify(redisClient.set).bind(redisClient);
const redisHmgetAsync = promisify(redisClient.hmget).bind(redisClient);
const redisHmsetAsync = promisify(redisClient.hmset).bind(redisClient);
const redisDelAsync = promisify(redisClient.del).bind(redisClient);

redisClient.on("connect", () =>
   console.log("[server] Redis connection established")
);

module.exports = {
   redisClient,
   redisGetAsync,
   redisSetAsync,
   redisHmgetAsync,
   redisHmsetAsync,
   redisDelAsync,
};
