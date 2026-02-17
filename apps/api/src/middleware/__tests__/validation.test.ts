/**
 * Validation Middleware Tests
 *
 * Tests for request validation using Zod schemas
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { validateQuery, validateParams, validateBody } from '../validation';
import { z } from 'zod';
import { ValidationError } from '../../errors';

describe('Validation Middleware', () => {
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    mockRequest = {
      query: {},
      params: {},
      body: {},
    };
    mockReply = {};
  });

  describe('validateQuery', () => {
    const schema = z.object({
      limit: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0 && val <= 100, {
          message: 'Limit must be between 1 and 100',
        }),
      offset: z.string().optional().default('0'),
    });

    it('should validate and transform valid query params', async () => {
      mockRequest.query = { limit: '50', offset: '10' };

      const middleware = validateQuery(schema);
      await middleware(mockRequest, mockReply);

      expect(mockRequest.query).toEqual({
        limit: 50,
        offset: '10',
      });
    });

    it('should apply defaults for missing optional params', async () => {
      mockRequest.query = { limit: '25' };

      const middleware = validateQuery(schema);
      await middleware(mockRequest, mockReply);

      expect(mockRequest.query).toEqual({
        limit: 25,
        offset: '0',
      });
    });

    it('should throw ValidationError for invalid params', async () => {
      mockRequest.query = { limit: '200' }; // Exceeds max of 100

      const middleware = validateQuery(schema);

      await expect(
        middleware(mockRequest, mockReply)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing required params', async () => {
      mockRequest.query = {}; // Missing 'limit'

      const middleware = validateQuery(schema);

      await expect(
        middleware(mockRequest, mockReply)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('validateParams', () => {
    const schema = z.object({
      matchId: z.string().uuid(),
    });

    it('should validate valid UUID params', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      mockRequest.params = { matchId: validUuid };

      const middleware = validateParams(schema);
      await middleware(mockRequest, mockReply);

      expect(mockRequest.params.matchId).toBe(validUuid);
    });

    it('should throw ValidationError for invalid UUID', async () => {
      mockRequest.params = { matchId: 'not-a-uuid' };

      const middleware = validateParams(schema);

      await expect(
        middleware(mockRequest, mockReply)
      ).rejects.toThrow(ValidationError);
    });

    it('should provide helpful error message', async () => {
      mockRequest.params = { matchId: 'invalid' };

      const middleware = validateParams(schema);

      try {
        await middleware(mockRequest, mockReply);
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('matchId');
        expect(error.message).toContain('Invalid');
      }
    });
  });

  describe('validateBody', () => {
    const schema = z.object({
      content: z.string().min(1).max(500),
      matchId: z.string().uuid(),
    });

    it('should validate valid request body', async () => {
      mockRequest.body = {
        content: 'Hello, world!',
        matchId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const middleware = validateBody(schema);
      await middleware(mockRequest, mockReply);

      expect(mockRequest.body).toEqual({
        content: 'Hello, world!',
        matchId: '550e8400-e29b-41d4-a716-446655440000',
      });
    });

    it('should throw ValidationError for empty required field', async () => {
      mockRequest.body = {
        content: '', // Empty, violates min(1)
        matchId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const middleware = validateBody(schema);

      await expect(
        middleware(mockRequest, mockReply)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for field exceeding max length', async () => {
      mockRequest.body = {
        content: 'x'.repeat(501), // Exceeds max(500)
        matchId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const middleware = validateBody(schema);

      await expect(
        middleware(mockRequest, mockReply)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing required field', async () => {
      mockRequest.body = {
        content: 'Hello',
        // Missing matchId
      };

      const middleware = validateBody(schema);

      await expect(
        middleware(mockRequest, mockReply)
      ).rejects.toThrow(ValidationError);
    });

    it('should include field path in error message', async () => {
      mockRequest.body = {
        content: 'Valid content',
        matchId: 'not-a-uuid',
      };

      const middleware = validateBody(schema);

      try {
        await middleware(mockRequest, mockReply);
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('matchId');
      }
    });
  });

  describe('Complex Schema Validation', () => {
    const profileSchema = z.object({
      name: z.string().min(1).max(100),
      age: z.number().int().min(18).max(100),
      location: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      }),
      preferences: z.object({
        minAge: z.number().int().min(18),
        maxAge: z.number().int().max(100),
      }),
    });

    it('should validate nested objects', async () => {
      mockRequest.body = {
        name: 'Alice',
        age: 25,
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
        preferences: {
          minAge: 21,
          maxAge: 35,
        },
      };

      const middleware = validateBody(profileSchema);
      await middleware(mockRequest, mockReply);

      expect(mockRequest.body.name).toBe('Alice');
      expect(mockRequest.body.location.latitude).toBe(37.7749);
    });

    it('should validate nested field constraints', async () => {
      mockRequest.body = {
        name: 'Bob',
        age: 30,
        location: {
          latitude: 95, // Invalid: exceeds max(90)
          longitude: -122.4194,
        },
        preferences: {
          minAge: 25,
          maxAge: 40,
        },
      };

      const middleware = validateBody(profileSchema);

      await expect(
        middleware(mockRequest, mockReply)
      ).rejects.toThrow(ValidationError);
    });
  });
});
