import { 
  User, InsertUser, 
  Animal, InsertAnimal,
  Post, InsertPost, PostWithDetails,
  Comment, InsertComment,
  Like, InsertLike,
  Follow, InsertFollow,
  Report, InsertReport,
  AnimalWithStats
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store
  sessionStore: any;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Animals
  getAnimal(id: string): Promise<Animal | undefined>;
  getAnimalWithStats(id: string, currentUserId?: string): Promise<AnimalWithStats | undefined>;
  getUserAnimals(userId: string): Promise<Animal[]>;
  createAnimal(animal: InsertAnimal): Promise<Animal>;
  updateAnimal(id: string, updates: Partial<Animal>): Promise<Animal>;
  deleteAnimal(id: string): Promise<void>;
  searchAnimals(query: string, species?: string, breed?: string): Promise<Animal[]>;
  
  // Posts
  getPost(id: string): Promise<Post | undefined>;
  getPostWithDetails(id: string, currentUserId?: string): Promise<PostWithDetails | undefined>;
  getUserPosts(userId: string): Promise<Post[]>;
  getAnimalPosts(animalId: string): Promise<Post[]>;
  getFeedPosts(limit?: number, offset?: number, currentUserId?: string): Promise<PostWithDetails[]>;
  getLostFoundPosts(lat?: number, lng?: number, radius?: number): Promise<PostWithDetails[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post>;
  deletePost(id: string): Promise<void>;
  
  // Comments
  getPostComments(postId: string): Promise<(Comment & { author: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  
  // Likes
  getLike(postId: string, userId: string): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(postId: string, userId: string): Promise<void>;
  
  // Follows
  getFollow(followerId: string, followeeId?: string, animalId?: string): Promise<Follow | undefined>;
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: string, followeeId?: string, animalId?: string): Promise<void>;
  getUserFollowers(userId: string): Promise<Follow[]>;
  getUserFollowing(userId: string): Promise<Follow[]>;
  getAnimalFollowers(animalId: string): Promise<Follow[]>;
  
  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReports(status?: string): Promise<(Report & { post: Post; reporter: User })[]>;
  updateReport(id: string, status: string): Promise<Report>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private animals: Map<string, Animal>;
  private posts: Map<string, Post>;
  private comments: Map<string, Comment>;
  private likes: Map<string, Like>;
  private follows: Map<string, Follow>;
  private reports: Map<string, Report>;
  public sessionStore: any;

  constructor() {
    this.users = new Map();
    this.animals = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.follows = new Map();
    this.reports = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      id, 
      email: insertUser.email,
      passwordHash: insertUser.passwordHash,
      displayName: insertUser.displayName,
      role: insertUser.role || "USER",
      bio: insertUser.bio || null,
      avatarUrl: insertUser.avatarUrl || null,
      locationLat: insertUser.locationLat || null,
      locationLng: insertUser.locationLng || null,
      radiusKm: insertUser.radiusKm || 5,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Animals
  async getAnimal(id: string): Promise<Animal | undefined> {
    return this.animals.get(id);
  }

  async getAnimalWithStats(id: string, currentUserId?: string): Promise<AnimalWithStats | undefined> {
    const animal = this.animals.get(id);
    if (!animal) return undefined;

    const owner = await this.getUser(animal.ownerId);
    if (!owner) return undefined;

    const posts = Array.from(this.posts.values()).filter(p => p.animalId === id);
    const followers = Array.from(this.follows.values()).filter(f => f.animalId === id);
    
    let isFollowing = false;
    if (currentUserId) {
      isFollowing = !!followers.find(f => f.followerId === currentUserId);
    }

    return {
      ...animal,
      owner,
      posts,
      followers,
      postsCount: posts.length,
      followersCount: followers.length,
      isFollowing
    };
  }

  async getUserAnimals(userId: string): Promise<Animal[]> {
    return Array.from(this.animals.values()).filter(animal => animal.ownerId === userId);
  }

  async createAnimal(insertAnimal: InsertAnimal): Promise<Animal> {
    const id = randomUUID();
    const now = new Date();
    const animal: Animal = { 
      ...insertAnimal, 
      id, 
      createdAt: now,
      updatedAt: now 
    };
    this.animals.set(id, animal);
    return animal;
  }

  async updateAnimal(id: string, updates: Partial<Animal>): Promise<Animal> {
    const animal = this.animals.get(id);
    if (!animal) throw new Error("Animal not found");
    const updatedAnimal = { ...animal, ...updates, updatedAt: new Date() };
    this.animals.set(id, updatedAnimal);
    return updatedAnimal;
  }

  async deleteAnimal(id: string): Promise<void> {
    this.animals.delete(id);
    // Also delete related posts
    const animalPosts = Array.from(this.posts.entries()).filter(([_, post]) => post.animalId === id);
    animalPosts.forEach(([postId]) => this.posts.delete(postId));
  }

  async searchAnimals(query: string, species?: string, breed?: string): Promise<Animal[]> {
    const animals = Array.from(this.animals.values());
    return animals.filter(animal => {
      const matchesQuery = !query || animal.name.toLowerCase().includes(query.toLowerCase());
      const matchesSpecies = !species || animal.species.toLowerCase().includes(species.toLowerCase());
      const matchesBreed = !breed || (animal.breed && animal.breed.toLowerCase().includes(breed.toLowerCase()));
      return matchesQuery && matchesSpecies && matchesBreed;
    });
  }

  // Posts
  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostWithDetails(id: string, currentUserId?: string): Promise<PostWithDetails | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;

    const author = await this.getUser(post.authorId);
    const animal = await this.getAnimal(post.animalId);
    if (!author || !animal) return undefined;

    const likes = Array.from(this.likes.values()).filter(like => like.postId === id);
    const comments = await this.getPostComments(id);

    let isLiked = false;
    if (currentUserId) {
      isLiked = !!likes.find(like => like.userId === currentUserId);
    }

    return {
      ...post,
      author,
      animal,
      likes,
      comments,
      likesCount: likes.length,
      commentsCount: comments.length,
      isLiked
    };
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.authorId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getAnimalPosts(animalId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.animalId === animalId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getFeedPosts(limit = 20, offset = 0, currentUserId?: string): Promise<PostWithDetails[]> {
    const allPosts = Array.from(this.posts.values())
      .filter(post => post.isPublic)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(offset, offset + limit);

    const postsWithDetails = await Promise.all(
      allPosts.map(async (post) => {
        const details = await this.getPostWithDetails(post.id, currentUserId);
        return details!;
      })
    );

    return postsWithDetails.filter(Boolean);
  }

  async getLostFoundPosts(lat?: number, lng?: number, radius = 10): Promise<PostWithDetails[]> {
    let filteredPosts = Array.from(this.posts.values())
      .filter(post => post.status === "LOST" || post.status === "FOUND");

    // If location provided, filter by distance
    if (lat && lng) {
      filteredPosts = filteredPosts.filter(post => {
        if (!post.lat || !post.lng) return false;
        const distance = this.calculateDistance(lat, lng, post.lat, post.lng);
        return distance <= radius;
      });
    }

    const postsWithDetails = await Promise.all(
      filteredPosts.map(async (post) => {
        const details = await this.getPostWithDetails(post.id);
        return details!;
      })
    );

    return postsWithDetails.filter(Boolean);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = { 
      ...insertPost, 
      id, 
      createdAt: new Date() 
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const post = this.posts.get(id);
    if (!post) throw new Error("Post not found");
    const updatedPost = { ...post, ...updates };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: string): Promise<void> {
    this.posts.delete(id);
    // Delete related comments and likes
    const postComments = Array.from(this.comments.entries()).filter(([_, comment]) => comment.postId === id);
    postComments.forEach(([commentId]) => this.comments.delete(commentId));
    
    const postLikes = Array.from(this.likes.entries()).filter(([_, like]) => like.postId === id);
    postLikes.forEach(([likeId]) => this.likes.delete(likeId));
  }

  // Comments
  async getPostComments(postId: string): Promise<(Comment & { author: User })[]> {
    const comments = Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await this.getUser(comment.authorId);
        return { ...comment, author: author! };
      })
    );

    return commentsWithAuthors.filter(c => c.author);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      createdAt: new Date() 
    };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: string): Promise<void> {
    this.comments.delete(id);
  }

  // Likes
  async getLike(postId: string, userId: string): Promise<Like | undefined> {
    return Array.from(this.likes.values())
      .find(like => like.postId === postId && like.userId === userId);
  }

  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = randomUUID();
    const like: Like = { 
      ...insertLike, 
      id, 
      createdAt: new Date() 
    };
    this.likes.set(id, like);
    return like;
  }

  async deleteLike(postId: string, userId: string): Promise<void> {
    const like = await this.getLike(postId, userId);
    if (like) {
      this.likes.delete(like.id);
    }
  }

  // Follows
  async getFollow(followerId: string, followeeId?: string, animalId?: string): Promise<Follow | undefined> {
    return Array.from(this.follows.values())
      .find(follow => 
        follow.followerId === followerId &&
        follow.followeeId === followeeId &&
        follow.animalId === animalId
      );
  }

  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const id = randomUUID();
    const follow: Follow = { 
      ...insertFollow, 
      id, 
      createdAt: new Date() 
    };
    this.follows.set(id, follow);
    return follow;
  }

  async deleteFollow(followerId: string, followeeId?: string, animalId?: string): Promise<void> {
    const follow = await this.getFollow(followerId, followeeId, animalId);
    if (follow) {
      this.follows.delete(follow.id);
    }
  }

  async getUserFollowers(userId: string): Promise<Follow[]> {
    return Array.from(this.follows.values())
      .filter(follow => follow.followeeId === userId);
  }

  async getUserFollowing(userId: string): Promise<Follow[]> {
    return Array.from(this.follows.values())
      .filter(follow => follow.followerId === userId);
  }

  async getAnimalFollowers(animalId: string): Promise<Follow[]> {
    return Array.from(this.follows.values())
      .filter(follow => follow.animalId === animalId);
  }

  // Reports
  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = { 
      ...insertReport, 
      id, 
      createdAt: new Date() 
    };
    this.reports.set(id, report);
    return report;
  }

  async getReports(status?: string): Promise<(Report & { post: Post; reporter: User })[]> {
    let reports = Array.from(this.reports.values());
    
    if (status) {
      reports = reports.filter(report => report.status === status);
    }

    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const post = await this.getPost(report.postId);
        const reporter = await this.getUser(report.reporterId);
        return { ...report, post: post!, reporter: reporter! };
      })
    );

    return reportsWithDetails.filter(r => r.post && r.reporter);
  }

  async updateReport(id: string, status: string): Promise<Report> {
    const report = this.reports.get(id);
    if (!report) throw new Error("Report not found");
    const updatedReport = { ...report, status };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }
}

export const storage = new MemStorage();
