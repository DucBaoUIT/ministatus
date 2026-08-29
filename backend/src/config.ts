export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  appVersion: process.env.APP_VERSION ?? "0.0.0-dev",
  appName: "ministatus",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};
