import { db } from "./db";
import { 
  users, animals, posts, comments, likes, follows, reports 
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

import type { 
  IStorage, 
  User, InsertUser, 
  Animal, InsertAnimal, 
  Post, InsertPost, 
  Comment, InsertComment,
  Like, InsertLike,
  Follow, InsertFollow,
  Report, InsertReport 
} from "@shared/schema";

export class DbStorage implements IStorage {
  sessionStore: any = null;

  // ==================== USERS ====================
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  // ==================== ANIMALS ====================
  async createAnimal(insertAnimal: InsertAnimal): Promise<Animal> {
    const [animal] = await db.insert(animals).values(insertAnimal).returning();
    return animal;
  }

  async getAnimal(id: string): Promise<Animal | undefined> {
    const [animal] = await db.select().from(animals).where(eq(animals.id, id));
    return animal;
  }

  async getUserAnimals(userId: string): Promise<Animal[]> {
    return await db.select().from(animals).where(eq(animals.ownerId, userId));
  }

  // ==================== POSTS ====================
  async createPost(insertPost: any): Promise<Post> {
    const [post] = await db.insert(posts).values({
      ...insertPost,
      id: randomUUID(),
      createdAt: new Date()
    }).returning();
    return post;
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getLostFoundPosts(): Promise<Post[]> {
    try {
      const result = await db.select({
        id: posts.id,
        authorId: posts.authorId,
        animalName: posts.animalName,
        species: posts.species,
        details: posts.details,
        location: posts.location,     // ← aggiunto
        mediaUrl: posts.mediaUrl,
        mediaType: posts.mediaType,
        status: posts.status,
        lat: posts.lat,               // ← aggiunto
        lng: posts.lng,               // ← aggiunto
        contact: posts.contact,
        isPublic: posts.isPublic,
        createdAt: posts.createdAt,
      }).from(posts)
        .where(sql`${posts.status} IN ('LOST', 'FOUND')`)
        .orderBy(desc(posts.createdAt));

      console.log(`📍 Restituiti ${result.length} post con coordinate per la mappa`);
      return result;
    } catch (error) {
      console.error("Errore in getLostFoundPosts:", error);
      return [];
    }
  }

  // ==================== STUBS (funzioni non ancora implementate) ====================
  async getPostWithDetails(id: string, currentUserId?: string) { return undefined; }
  async getFeedPosts(limit = 20, offset = 0, currentUserId?: string) { return []; }
  async getUserPosts(userId: string) { return []; }
  async getAnimalPosts(animalId: string) { return []; }
  async updatePost(id: string, updates: Partial<Post>) { throw new Error("Not implemented"); }
  async getAnimalWithStats(id: string, currentUserId?: string) { return undefined; }
  async updateAnimal(id: string, updates: Partial<Animal>) { throw new Error("Not implemented"); }
  async deleteAnimal(id: string) {}
  async searchAnimals(query: string, species?: string, breed?: string) { return []; }

  async createComment(comment: InsertComment) { throw new Error("Not implemented"); }
  async getPostComments(postId: string) { return []; }
  async deleteComment(id: string) {}

  async createLike(like: InsertLike) { throw new Error("Not implemented"); }
  async getLike(postId: string, userId: string) { return undefined; }
  async deleteLike(postId: string, userId: string) {}

  async createFollow(follow: InsertFollow) { throw new Error("Not implemented"); }
  async getFollow(followerId: string, followeeId?: string, animalId?: string) { return undefined; }
  async deleteFollow(followerId: string, followeeId?: string, animalId?: string) {}
  async getUserFollowers(userId: string) { return []; }
  async getUserFollowing(userId: string) { return []; }
  async getAnimalFollowers(animalId: string) { return []; }

  async createReport(report: InsertReport) { throw new Error("Not implemented"); }
  async getReports(status?: string) { return []; }
  async updateReport(id: string, status: string) { throw new Error("Not implemented"); }
}

export const storage = new DbStorage();