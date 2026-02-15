/**
 * Image Preloader Utility
 *
 * Preload images for better performance
 */

import { Image } from 'react-native';

/**
 * Preload a single image
 */
export const preloadImage = (uri: string): Promise<boolean> => {
  return new Promise((resolve) => {
    Image.prefetch(uri)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = async (uris: string[]): Promise<void> => {
  const promises = uris.map((uri) => preloadImage(uri));
  await Promise.all(promises);
};

/**
 * Preload images with progress callback
 */
export const preloadImagesWithProgress = (
  uris: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    let loaded = 0;
    const total = uris.length;

    const promises = uris.map((uri) =>
      preloadImage(uri).then((success) => {
        loaded++;
        if (onProgress) {
          onProgress(loaded, total);
        }
        return success;
      })
    );

    Promise.all(promises).then(() => resolve());
  });
};

/**
 * Preload profile feed images
 * Preload first 3 cards fully, next 2 partially
 */
export const preloadFeedImages = async (
  profiles: Array<{ photos: string[] }>
): Promise<void> => {
  if (!profiles || profiles.length === 0) return;

  const imagesToPreload: string[] = [];

  // First 3 profiles: preload all photos
  profiles.slice(0, 3).forEach((profile) => {
    imagesToPreload.push(...profile.photos);
  });

  // Next 2 profiles: preload only first photo
  profiles.slice(3, 5).forEach((profile) => {
    if (profile.photos[0]) {
      imagesToPreload.push(profile.photos[0]);
    }
  });

  await preloadImages(imagesToPreload);
};
