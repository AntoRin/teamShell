declare namespace NodeJS {
    export interface ProcessEnv {
        GITHUB_CLIENT_ID_DEV: string;
        GITHUB_CLIENT_SECRET_DEV: string;
        GOOGLE_CLIENT_ID_DEV: string;
        GOOGLE_CLIENT_SECRET_DEV: string;
        GOOGLE_AUTH_REDIRECT_URI_DEV: string;
        GOOGLE_DRIVE_REDIRECT_URI_DEV: string;
        REDIS_PASSWORD: string;
        MONGO_URI: string;
        JWT_SECRET: string;
        ORG_JWT_SECRET: string;
        ROOM_JWT_SECRET: string;
    }
  }