import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { requireAuth } from "./middleware/auth";
import { upload } from "./middleware/upload";
import { mediaStorage } from "./services/media-storage";
import { insertAnimalSchema, insertPostSchema, insertCommentSchema } from "@shared/schema";
import express from "express";
import path from "path";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

  // Animals routes
  app.post('/api/animals', requireAuth, async (req, res, next) => {
    try {
      const data = insertAnimalSchema.parse({ ...req.body, ownerId: req.user!.id });
      const animal = await storage.createAnimal(data);
      res.status(201).json(animal);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/animals/:id', async (req, res, next) => {
    try {
      const animal = await storage.getAnimalWithStats(req.params.id, req.user?.id);
      if (!animal) {
        return res.status(404).json({ message: 'Animal not found' });
      }
      res.json(animal);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/animals/:id', requireAuth, upload.single('avatar'), async (req, res, next) => {
    try {
      const animal = await storage.getAnimal(req.params.id);
      if (!animal || animal.ownerId !== req.user!.id) {
        return res.status(404).json({ message: 'Animal not found' });
      }

      let avatarUrl = req.body.avatarUrl;
      if (req.file) {
        avatarUrl = await mediaStorage.saveFile(req.file);
      }

      const updatedAnimal = await storage.updateAnimal(req.params.id, {
        ...req.body,
        avatarUrl
      });
      res.json(updatedAnimal);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/animals/:id', requireAuth, async (req, res, next) => {
    try {
      const animal = await storage.getAnimal(req.params.id);
      if (!animal || animal.ownerId !== req.user!.id) {
        return res.status(404).json({ message: 'Animal not found' });
      }

      await storage.deleteAnimal(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/me/animals', requireAuth, async (req, res, next) => {
    try {
      const animals = await storage.getUserAnimals(req.user!.id);
      res.json(animals);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/search/animals', async (req, res, next) => {
    try {
      const { q, species, breed } = req.query;
      const animals = await storage.searchAnimals(
        q as string,
        species as string,
        breed as string
      );
      res.json(animals);
    } catch (error) {
      next(error);
    }
  });

  // Posts routes
  app.post('/api/posts', requireAuth, upload.single('media'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Media file is required' });
      }

      const mediaUrl = await mediaStorage.saveFile(req.file);
      const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

      const data = insertPostSchema.parse({
        ...req.body,
        authorId: req.user!.id,
        mediaUrl,
        mediaType,
        lat: req.body.lat ? parseFloat(req.body.lat) : undefined,
        lng: req.body.lng ? parseFloat(req.body.lng) : undefined,
      });

      const post = await storage.createPost(data);
      const postWithDetails = await storage.getPostWithDetails(post.id, req.user!.id);
      res.status(201).json(postWithDetails);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/feed', async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getFeedPosts(limit, offset, req.user?.id);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/lost-found', async (req, res, next) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const radius = req.query.radius ? parseInt(req.query.radius as string) : 10;
      
      const posts = await storage.getLostFoundPosts(lat, lng, radius);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/posts/:id', async (req, res, next) => {
    try {
      const post = await storage.getPostWithDetails(req.params.id, req.user?.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/posts/:id', requireAuth, async (req, res, next) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post || post.authorId !== req.user!.id) {
        return res.status(404).json({ message: 'Post not found' });
      }

      await storage.deletePost(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Likes routes
  app.post('/api/posts/:id/like', requireAuth, async (req, res, next) => {
    try {
      const existingLike = await storage.getLike(req.params.id, req.user!.id);
      if (existingLike) {
        await storage.deleteLike(req.params.id, req.user!.id);
        res.json({ liked: false });
      } else {
        await storage.createLike({
          postId: req.params.id,
          userId: req.user!.id,
        });
        res.json({ liked: true });
      }
    } catch (error) {
      next(error);
    }
  });

  // Comments routes
  app.post('/api/posts/:id/comments', requireAuth, async (req, res, next) => {
    try {
      const data = insertCommentSchema.parse({
        ...req.body,
        postId: req.params.id,
        authorId: req.user!.id,
      });

      const comment = await storage.createComment(data);
      const comments = await storage.getPostComments(req.params.id);
      res.status(201).json(comments);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/posts/:id/comments', async (req, res, next) => {
    try {
      const comments = await storage.getPostComments(req.params.id);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  });

  // Follow routes
  app.post('/api/follow', requireAuth, async (req, res, next) => {
    try {
      const { followeeId, animalId } = req.body;
      const followerId = req.user!.id;

      const existingFollow = await storage.getFollow(followerId, followeeId, animalId);
      if (existingFollow) {
        await storage.deleteFollow(followerId, followeeId, animalId);
        res.json({ following: false });
      } else {
        await storage.createFollow({
          followerId,
          followeeId,
          animalId,
        });
        res.json({ following: true });
      }
    } catch (error) {
      next(error);
    }
  });

  // Reports routes
  app.post('/api/posts/:id/report', requireAuth, async (req, res, next) => {
    try {
      const report = await storage.createReport({
        postId: req.params.id,
        reporterId: req.user!.id,
        reason: req.body.reason,
        note: req.body.note,
      });
      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  });

  // User profile routes
  app.get('/api/me', requireAuth, async (req, res, next) => {
    try {
      const user = req.user!;
      const animals = await storage.getUserAnimals(user.id);
      const posts = await storage.getUserPosts(user.id);
      const followers = await storage.getUserFollowers(user.id);
      
      res.json({
        ...user,
        animals,
        postsCount: posts.length,
        followersCount: followers.length,
      });
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/me', requireAuth, upload.single('avatar'), async (req, res, next) => {
    try {
      let avatarUrl = req.body.avatarUrl;
      if (req.file) {
        avatarUrl = await mediaStorage.saveFile(req.file);
      }

      const updatedUser = await storage.updateUser(req.user!.id, {
        ...req.body,
        avatarUrl
      });
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
