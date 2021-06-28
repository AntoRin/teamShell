const redisHost =
   process.env.NODE_ENV === "production"
      ? process.env.REDIS_REMOTE_HOST
      : "127.0.0.1";
const redisPort =
   process.env.NODE_ENV === "production" ? Number(process.env.REDIS_REMOTE_PORT) : 6379;
const redisPassword =
   process.env.NODE_ENV === "production"
      ? process.env.REDIS_REMOTE_PASSWORD
      : process.env.REDIS_PASSWORD;

const githubClientId =
   process.env.NODE_ENV === "production"
      ? process.env.GITHUB_CLIENT_ID_PROD
      : process.env.GITHUB_CLIENT_ID_DEV;

const githubClientSecret =
   process.env.NODE_ENV === "production"
      ? process.env.GITHUB_CLIENT_SECRET_PROD
      : process.env.GITHUB_CLIENT_SECRET_DEV;

const googleClientId =
   process.env.NODE_ENV === "production"
      ? process.env.GOOGLE_CLIENT_ID_PROD
      : process.env.GOOGLE_CLIENT_ID_DEV;

const googleClientSecret =
   process.env.NODE_ENV === "production"
      ? process.env.GOOGLE_CLIENT_SECRET_PROD
      : process.env.GOOGLE_CLIENT_SECRET_DEV;

const googleAuthRedirectUri =
   process.env.NODE_ENV === "production"
      ? process.env.GOOGLE_AUTH_REDIRECT_URI_PROD
      : process.env.GOOGLE_AUTH_REDIRECT_URI_DEV;

const googleDriveRedirectUri =
   process.env.NODE_ENV === "production"
      ? process.env.GOOGLE_DRIVE_REDIRECT_URI_PROD
      : process.env.GOOGLE_DRIVE_REDIRECT_URI_DEV;

const config = {
   redisHost,
   redisPort,
   redisPassword,
   githubClientId,
   githubClientSecret,
   googleClientId,
   googleClientSecret,
   googleAuthRedirectUri,
   googleDriveRedirectUri,
};

export default config;
