const redis = require("redis");
const { promisify } = require("util");
const config = require("./config");

const redisClient = redis.createClient({
   host: config.redisHost,
   port: config.redisPort,
   password: config.redisPassword,
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
