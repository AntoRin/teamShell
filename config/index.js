const redisHost =
   process.env.NODE_ENV === "production"
      ? process.env.REDIS_REMOTE_HOST
      : "127.0.0.1";
const redisPort =
   process.env.NODE_ENV === "production" ? process.env.REDIS_REMOTE_PORT : 6379;
const redisPassword =
   process.env.NODE_ENV === "production"
      ? process.env.REDIS_REMOTE_PASSWORD
      : process.env.REDIS_PASSWORD;

const githubClientId =
   process.env.NODE_ENV === "production"
      ? process.env.GITHUB_CLIENT_ID
      : process.env.GITHUB_CLIENT_ID_DEV;

const githubClientSecret =
   process.env.NODE_ENV === "production"
      ? process.env.GITHUB_CLIENT_SECRET
      : process.env.GITHUB_CLIENT_SECRET_DEV;

const config = {
   redisHost,
   redisPort,
   redisPassword,
   githubClientId,
   githubClientSecret,
};

module.exports = config;
