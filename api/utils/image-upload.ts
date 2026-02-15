/**
 * Image Upload Utility
 *
 * Cloudinary integration for photo uploads
 */

/**
 * Cloudinary configuration
 * Add these to your .env file:
 * EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 * EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
 */

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'demo_preset';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Upload image to Cloudinary
 */
export const uploadImage = async (uri: string): Promise<UploadResult> => {
  const formData = new FormData();

  // Extract file from URI
  const filename = uri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri,
    name: filename,
    type,
  } as any);

  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'dating_profiles');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  // Note: Deletion requires server-side signature
  // This is a placeholder - implement server-side deletion endpoint
  console.warn('Image deletion not implemented - requires server-side endpoint');
};

/**
 * Get optimized image URL with transformations
 */
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
    quality?: number;
  } = {}
): string => {
  const { width = 800, height, crop = 'fill', quality = 80 } = options;

  // Extract public ID from Cloudinary URL
  const match = url.match(/\/v\d+\/(.+)/);
  if (!match) return url;

  const publicId = match[1];
  const transformations = [
    `w_${width}`,
    height ? `h_${height}` : null,
    `c_${crop}`,
    `q_${quality}`,
    'f_auto', // Auto format
  ]
    .filter(Boolean)
    .join(',');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};

/**
 * Get thumbnail URL
 */
export const getThumbnailUrl = (url: string): string => {
  return getOptimizedImageUrl(url, {
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 70,
  });
};
