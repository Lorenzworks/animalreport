import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, real, integer, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = z.enum(["USER", "VET", "SHOP", "SHELTER", "ADMIN"]);
export const postStatusEnum = z.enum(["NORMAL", "LOST", "FOUND"]);
export const reportReasonEnum = z.enum(["ONLY_PEOPLE", "ABUSE", "SPAM", "OTHER"]);
export const reportStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export type Role = z.infer<typeof roleEnum>;
export type PostStatus = z.infer<typeof postStatusEnum>;
export type ReportReason = z.infer<typeof reportReasonEnum>;
export type ReportStatus = z.infer<typeof reportStatusEnum>;

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("USER"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  locationLat: real("location_lat"),
  locationLng: real("location_lng"),
  radiusKm: integer("radius_km").default(5),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Animals table
export const animals = pgTable("animals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed"),
  sex: text("sex"),
  age: text("age"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Posts table
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id),
  animalId: varchar("animal_id").notNull().references(() => animals.id),
  caption: text("caption"),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(),
  status: text("status").notNull().default("NORMAL"),
  lat: real("lat"),
  lng: real("lng"),
  contact: text("contact"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Likes table
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Follows table
export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").references(() => users.id),
  followeeId: varchar("followee_id").references(() => users.id),
  animalId: varchar("animal_id").references(() => animals.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reports table
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  note: text("note"),
  status: text("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  passwordHash: z.string(),
});

export const insertAnimalSchema = createInsertSchema(animals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Animal = typeof animals.$inferSelect;
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Extended types for API responses
export type PostWithDetails = Post & {
  author: User;
  animal: Animal;
  likes: Like[];
  comments: (Comment & { author: User })[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
};

export type AnimalWithStats = Animal & {
  owner: User;
  posts: Post[];
  followers: Follow[];
  postsCount: number;
  followersCount: number;
  isFollowing: boolean;
};
