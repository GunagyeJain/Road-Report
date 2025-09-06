export class ImageUtils {
  static compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => resolve(file); // Fallback to original
      img.src = URL.createObjectURL(file);
    });
  }

  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please select a valid image file (JPEG, PNG, or WebP)',
      };
    }
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 10MB',
      };
    }
    
    return { valid: true };
  }

  static createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to create image preview'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }
}
