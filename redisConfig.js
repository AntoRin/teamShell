const redis = require("redis");
const { promisify } = require("util");

const host =
   process.env.NODE_ENV === "production"
      ? process.env.REDIS_REMOTE_HOST
      : "127.0.0.1";
const port =
   process.env.NODE_ENV === "production" ? process.env.REDIS_REMOTE_PORT : 6379;
const password =
   process.env.NODE_ENV === "production"
      ? process.env.REDIS_REMOTE_PASSWORD
      : process.env.REDIS_PASSWORD;

const redisClient = redis.createClient({
   host,
   port,
   password,
});

const redisGetAsync = promisify(redisClient.get).bind(redisClient);
const redisSetAsync = promisify(redisClient.set).bind(redisClient);
const redisHmgetAsync = promisify(redisClient.hmget).bind(redisClient);
const redisHmsetAsync = promisify(redisClient.hmset).bind(redisClient);
const redisLpushAsync = promisify(redisClient.lpush).bind(redisClient);
const redisLpopAsync = promisify(redisClient.lpop).bind(redisClient);
const redisLRangeAsync = promisify(redisClient.lrange).bind(redisClient);
const redisExpireAsync = promisify(redisClient.expire).bind(redisClient);
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
   redisLpushAsync,
   redisLpopAsync,
   redisLRangeAsync,
   redisExpireAsync,
   redisDelAsync,
};
