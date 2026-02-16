/**
 * API Client
 *
 * HTTP client for communicating with the Fastify backend
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import type { API } from '@letsmeet/shared';

// Get API URL from environment
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api/v1';

/**
 * Create axios instance
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API Client Class
 */
class ApiClient {
  private instance: AxiosInstance;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
    this.setupInterceptors();
  }

  /**
   * Set token getter function (called from React context)
   */
  setTokenGetter(getter: () => Promise<string | null>) {
    this.getToken = getter;
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - add auth token
    this.instance.interceptors.request.use(
      async (config) => {
        if (this.getToken) {
          const token = await this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - unwrap data and handle errors
    this.instance.interceptors.response.use(
      (response) => {
        // Unwrap the 'data' field from our API response format
        return response.data?.data !== undefined ? response.data.data : response.data;
      },
      (error: AxiosError<{ success: boolean; error?: { message: string; code: string } }>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - trigger re-authentication
          console.warn('Authentication failed, please sign in again');
        }

        // Extract error message from API response
        const message = error.response?.data?.error?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
      }
    );
  }

  /**
   * Profile endpoints
   */
  profiles = {
    getMe: () => this.instance.get<API.Profiles.GetMeResponse>('/profiles/me'),

    create: (data: API.Profiles.CreateRequest) =>
      this.instance.post<API.Profiles.CreateResponse>('/profiles', data),

    update: (data: API.Profiles.UpdateRequest) =>
      this.instance.patch<API.Profiles.UpdateResponse>('/profiles/me', data),

    delete: () => this.instance.delete<API.Profiles.DeleteResponse>('/profiles/me'),
  };

  /**
   * Swipe endpoints
   */
  swipes = {
    create: (data: API.Swipes.CreateRequest) =>
      this.instance.post<API.Swipes.CreateResponse>('/swipes', data),

    getCount: () => this.instance.get<API.Swipes.GetCountResponse>('/swipes/count'),
  };

  /**
   * Match endpoints
   */
  matches = {
    getAll: () => this.instance.get<API.Matches.GetAllResponse>('/matches'),

    delete: (matchId: string) =>
      this.instance.delete<API.Matches.DeleteResponse>(`/matches/${matchId}`),
  };

  /**
   * Message endpoints
   */
  messages = {
    get: (matchId: string, params?: { limit?: number; offset?: number }) =>
      this.instance.get<API.Messages.GetResponse>(`/messages/${matchId}`, { params }),

    create: (data: API.Messages.CreateRequest) =>
      this.instance.post<API.Messages.CreateResponse>('/messages', data),

    markRead: (matchId: string) =>
      this.instance.patch<API.Messages.MarkReadResponse>(`/messages/${matchId}/read`),
  };

  /**
   * Feed endpoints
   */
  feed = {
    get: (params?: { limit?: number }) =>
      this.instance.get<API.Feed.GetResponse>('/feed', { params }),

    getCount: () => this.instance.get<API.Feed.GetCountResponse>('/feed/count'),
  };

  /**
   * Payment endpoints
   */
  payments = {
    createCheckout: (data: API.Payments.CreateCheckoutRequest) =>
      this.instance.post<API.Payments.CreateCheckoutResponse>('/payments/create-checkout', data),

    getSubscription: () =>
      this.instance.get<API.Payments.GetSubscriptionResponse>('/payments/subscription'),
  };
}

/**
 * Export singleton instance
 */
export const api = new ApiClient(axiosInstance);

/**
 * Hook to setup API client with Clerk token
 */
export function useApiClient() {
  const { getToken } = useAuth();

  // Set token getter on mount
  React.useEffect(() => {
    api.setTokenGetter(() => getToken());
  }, [getToken]);

  return api;
}

import React from 'react';
