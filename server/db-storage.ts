import { db } from "./db";
import { 
  users, animals, posts, comments, likes, follows, reports 
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

import type { IStorage, User, InsertUser, Animal, InsertAnimal, Post, InsertPost, PostWithDetails } from "@shared/schema";

export class DbStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = null; // da implementare se serve
  }

  // Users
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // Per ora lasciamo le altre funzioni come stub
  async getPostWithDetails(id: string, currentUserId?: string): Promise<PostWithDetails | undefined> {
    return undefined;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

    async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  // ... altre funzioni da implementare gradualmente
}

export const storage = new DbStorage();