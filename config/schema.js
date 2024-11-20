import {
  boolean,
  integer,
  json,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  imageUrl: varchar("imageUrl"),
  subscription: boolean("subscription").default(false),
  credits: integer("credits").default(30),
});

export const VideoData = pgTable("videoData", {
  id: serial("id").primaryKey(),
  script: json("script").notNull(),
  audioData: varchar("audioData").notNull(),
  caption: json("caption").notNull(),
  imageData: varchar("imageData").array().notNull(),
  createdBy: varchar("createdBy").notNull(),
});
