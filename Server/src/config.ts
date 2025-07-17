import dotenv from "dotenv";

// Load correct .env file depending on NODE_ENV (development, production)
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const config = {
  // Server
  port: process.env.PORT || 4000,

  // MongoDB
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/Loadex",

  // JWT
  jwtAccessToken: process.env.JWT_ACESSTOKEN as string,
  jwtRefreshToken: process.env.JWT_REFRESHTOKEN as string,

  // Nodemailer
  nodemailerEmail: process.env.NODEMAILER_EMAIL as string,
  nodemailerPassword: process.env.NODEMAILER_PASSWORD as string,

  // AWS S3
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  awsRegion: process.env.AWS_REGION as string,
  awsBucketName: process.env.AWS_BUCKET_NAME as string,

  // Admin
  adminEmail: process.env.ADMIN_EMAIL as string,
  adminPassword: process.env.ADMIN_PASSWORD as string,

  // Frontend
  frontEndUrl: process.env.FRONT_END_URL as string,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY as string,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
};

export default config;
