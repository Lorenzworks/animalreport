import { storage } from './storage';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Create users
    const user1 = await storage.createUser({
      email: 'sarah@example.com',
      passwordHash: await hashPassword('password123'),
      displayName: 'Sarah Johnson',
      bio: 'Pet lover & veterinarian',
      role: 'VET'
    });

    const user2 = await storage.createUser({
      email: 'mike@example.com',
      passwordHash: await hashPassword('password123'),
      displayName: 'Mike Chen',
      bio: 'Dog trainer and enthusiast'
    });

    const admin = await storage.createUser({
      email: 'admin@example.com',
      passwordHash: await hashPassword('admin123'),
      displayName: 'Admin User',
      role: 'ADMIN'
    });

    // Create animals
    const max = await storage.createAnimal({
      ownerId: user1.id,
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever',
      sex: 'Male',
      age: '3 years',
      bio: 'Friendly and energetic golden retriever who loves playing fetch!'
    });

    const luna = await storage.createAnimal({
      ownerId: user1.id,
      name: 'Luna',
      species: 'Cat',
      breed: 'Orange Tabby',
      sex: 'Female',
      age: '2 years',
      bio: 'Loves sunbathing by the window'
    });

    const whiskers = await storage.createAnimal({
      ownerId: user2.id,
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Persian',
      sex: 'Male',
      age: '4 years',
      bio: 'Fluffy and loves attention'
    });

    // Create posts
    const post1 = await storage.createPost({
      authorId: user1.id,
      animalId: max.id,
      caption: 'Max had the best day at the park today! He made so many new friends and even learned a new trick. 🐕 #happydog #parklife',
      mediaUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      mediaType: 'image',
      status: 'NORMAL',
      isPublic: true
    });

    const post2 = await storage.createPost({
      authorId: user2.id,
      animalId: whiskers.id,
      caption: '🚨 URGENT: Whiskers has been missing since this morning. Last seen near Central Park. He is very friendly but might be scared. Please contact me if you see him! Reward offered. #lostcat #centralpark',
      mediaUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      mediaType: 'image',
      status: 'LOST',
      lat: 40.7829,
      lng: -73.9654,
      contact: '(555) 123-4567',
      isPublic: true
    });

    const post3 = await storage.createPost({
      authorId: user1.id,
      animalId: luna.id,
      caption: 'Luna found the perfect sunny spot for her afternoon nap ☀️ #catsofinstagram #sunbathing',
      mediaUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      mediaType: 'image',
      status: 'NORMAL',
      isPublic: true
    });

    // Create some interactions
    await storage.createLike({ postId: post1.id, userId: user2.id });
    await storage.createComment({
      postId: post1.id,
      authorId: user2.id,
      content: 'Max is such a good boy! 🐾'
    });

    await storage.createFollow({ followerId: user2.id, animalId: max.id });
    await storage.createFollow({ followerId: user1.id, followeeId: user2.id });

    console.log('Database seeded successfully!');
    console.log('Users created:');
    console.log('- sarah@example.com / password123 (VET)');
    console.log('- mike@example.com / password123');  
    console.log('- admin@example.com / admin123 (ADMIN)');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
