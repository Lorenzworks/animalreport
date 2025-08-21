import path from 'path';
import fs from 'fs/promises';

export interface MediaStorage {
  saveFile(file: Express.Multer.File): Promise<string>;
  deleteFile(url: string): Promise<void>;
  getFileUrl(filename: string): string;
}

class FileSystemStorage implements MediaStorage {
  private uploadDir: string;

  constructor(uploadDir: string = process.env.UPLOAD_DIR || './uploads') {
    this.uploadDir = uploadDir;
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = file.filename;
    return this.getFileUrl(filename);
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const filename = path.basename(url);
      const filepath = path.join(this.uploadDir, filename);
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}

// Could be extended with Cloudinary adapter
class CloudinaryStorage implements MediaStorage {
  async saveFile(file: Express.Multer.File): Promise<string> {
    // TODO: Implement Cloudinary upload
    throw new Error('Cloudinary storage not implemented yet');
  }

  async deleteFile(url: string): Promise<void> {
    // TODO: Implement Cloudinary delete
    throw new Error('Cloudinary storage not implemented yet');
  }

  getFileUrl(filename: string): string {
    // TODO: Return Cloudinary URL
    throw new Error('Cloudinary storage not implemented yet');
  }
}

export const mediaStorage = new FileSystemStorage();
