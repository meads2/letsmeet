/**
 * CORS Configuration
 *
 * Configures Cross-Origin Resource Sharing for API access
 */

import type { FastifyCorsOptions } from '@fastify/cors';
import { getAllowedOrigins, env } from './env';

export const corsOptions: FastifyCorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // In development, be more permissive
    if (env.NODE_ENV === 'development') {
      // Allow localhost and local network IPs
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.') ||
        origin.startsWith('exp://') // Expo
      ) {
        callback(null, true);
        return;
      }
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
