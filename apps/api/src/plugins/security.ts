/**
 * Security Plugin
 *
 * Adds security headers using @fastify/helmet
 * Configured for mobile API usage
 */

import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';

const securityPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(helmet, {
    // Content Security Policy - relaxed for API
    contentSecurityPolicy: false,

    // Cross-Origin policies
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },

    // DNS prefetch control
    dnsPrefetchControl: { allow: false },

    // Frameguard - prevent clickjacking
    frameguard: { action: 'deny' },

    // Hide X-Powered-By header
    hidePoweredBy: true,

    // HSTS - force HTTPS (only in production)
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },

    // IE no open - prevent IE from executing downloads
    ieNoOpen: true,

    // Don't sniff MIME types
    noSniff: true,

    // Origin agent cluster
    originAgentCluster: true,

    // Referrer policy
    referrerPolicy: { policy: 'no-referrer' },

    // XSS protection
    xssFilter: true,
  });

  fastify.log.info('Security headers configured');
};

export default fp(securityPlugin, {
  name: 'security',
});
