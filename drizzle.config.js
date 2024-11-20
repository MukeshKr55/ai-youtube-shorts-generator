/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./config/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DRIZZLE_DATABASE_URL,
  },
};
