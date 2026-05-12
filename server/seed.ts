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

    // Create users only if they don't exist
    let user1 = await storage.getUserByEmail('sarah@example.com');
    if (!user1) {
      user1 = await storage.createUser({
        email: 'sarah@example.com',
        passwordHash: await hashPassword('password123'),
        displayName: 'Sarah Johnson',
        bio: 'Pet lover & veterinarian',
        role: 'VET'
      });
    }

    let user2 = await storage.getUserByEmail('mike@example.com');
    if (!user2) {
      user2 = await storage.createUser({
        email: 'mike@example.com',
        passwordHash: await hashPassword('password123'),
        displayName: 'Mike Chen',
        bio: 'Dog trainer and enthusiast'
      });
    }

    let admin = await storage.getUserByEmail('admin@example.com');
    if (!admin) {
      admin = await storage.createUser({
        email: 'admin@example.com',
        passwordHash: await hashPassword('admin123'),
        displayName: 'Admin User',
        role: 'ADMIN'
      });
    }

    // Create animals only if user1 has no animals yet
    const existingAnimals = await storage.getUserAnimals(user1.id);
    if (existingAnimals.length === 0) {
      await storage.createAnimal({
        ownerId: user1.id,
        name: 'Max',
        species: 'Dog',
        breed: 'Golden Retriever',
        sex: 'Male',
        age: '3 years',
        bio: 'Friendly and energetic golden retriever who loves playing fetch!'
      });

      await storage.createAnimal({
        ownerId: user1.id,
        name: 'Luna',
        species: 'Cat',
        breed: 'Orange Tabby',
        sex: 'Female',
        age: '2 years',
        bio: 'Loves sunbathing by the window'
      });

      await storage.createAnimal({
        ownerId: user2.id,
        name: 'Whiskers',
        species: 'Cat',
        breed: 'Persian',
        sex: 'Male',
        age: '4 years',
        bio: 'Fluffy and loves attention'
      });
    }

    console.log('✅ Users and animals seeded successfully (posts skipped for now)');
    console.log('Database seeded successfully!');
    console.log('Users created/verified:');
    console.log('- sarah@example.com / password123 (VET)');
    console.log('- mike@example.com / password123');  
    console.log('- admin@example.com / admin123 (ADMIN)');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}