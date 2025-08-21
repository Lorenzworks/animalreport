export interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export class MediaStorageService {
  private static instance: MediaStorageService;
  
  static getInstance(): MediaStorageService {
    if (!MediaStorageService.instance) {
      MediaStorageService.instance = new MediaStorageService();
    }
    return MediaStorageService.instance;
  }

  /**
   * Create a preview URL for a file
   */
  createPreview(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke a preview URL to free memory
   */
  revokePreview(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Validate file type and size
   */
  validateFile(file: File, maxSizeMB: number = 50): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return { valid: false, error: 'Only images and videos are allowed' };
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    return { valid: true };
  }

  /**
   * Get file type from file
   */
  getFileType(file: File): 'image' | 'video' {
    return file.type.startsWith('video/') ? 'video' : 'image';
  }

  /**
   * Compress image file (basic implementation)
   */
  async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload file to server
   */
  async uploadFile(file: File, endpoint: string = '/api/upload'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Upload failed');
    }

    const result = await response.json();
    return result.url;
  }

  /**
   * Create a MediaFile object with preview
   */
  createMediaFile(file: File): MediaFile {
    return {
      file,
      preview: this.createPreview(file),
      type: this.getFileType(file),
    };
  }

  /**
   * Cleanup MediaFile previews
   */
  cleanupMediaFiles(mediaFiles: MediaFile[]): void {
    mediaFiles.forEach((mediaFile) => {
      this.revokePreview(mediaFile.preview);
    });
  }

  /**
   * Get media file info
   */
  getFileInfo(file: File): {
    name: string;
    size: string;
    type: string;
    lastModified: Date;
  } {
    return {
      name: file.name,
      size: this.formatFileSize(file.size),
      type: file.type,
      lastModified: new Date(file.lastModified),
    };
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const mediaStorage = MediaStorageService.getInstance();
