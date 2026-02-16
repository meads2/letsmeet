/**
 * API Response Types
 *
 * Standard response formats for all API endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * API Endpoint Request/Response Types
 */
export namespace API {
  // Profile endpoints
  export namespace Profiles {
    export type GetMeResponse = ApiResponse<import('./profile').ProfileModel>;
    export type CreateRequest = import('./profile').CreateProfileInput;
    export type CreateResponse = ApiResponse<import('./profile').ProfileModel>;
    export type UpdateRequest = import('./profile').UpdateProfileInput;
    export type UpdateResponse = ApiResponse<import('./profile').ProfileModel>;
    export type DeleteResponse = ApiResponse<{ success: boolean }>;
  }

  // Swipe endpoints
  export namespace Swipes {
    export type CreateRequest = import('./swipe').CreateSwipeInput;
    export type CreateResponse = ApiResponse<import('./swipe').MatchResult>;
    export type GetCountResponse = ApiResponse<{ count: number; limit: number }>;
  }

  // Match endpoints
  export namespace Matches {
    export type GetAllResponse = ApiResponse<import('./match').MatchWithProfile[]>;
    export type DeleteResponse = ApiResponse<{ success: boolean }>;
  }

  // Message endpoints
  export namespace Messages {
    export type GetResponse = ApiResponse<import('./message').MessageWithSender[]>;
    export type CreateRequest = import('./message').CreateMessageInput;
    export type CreateResponse = ApiResponse<import('./message').MessageModel>;
    export type MarkReadResponse = ApiResponse<{ success: boolean }>;
  }

  // Feed endpoints
  export namespace Feed {
    export type GetResponse = ApiResponse<import('./profile').ProfileModel[]>;
    export type GetCountResponse = ApiResponse<{ count: number }>;
  }

  // Payment endpoints
  export namespace Payments {
    export type CreateCheckoutRequest = {
      tier: 'premium' | 'premium_plus';
      successUrl: string;
      cancelUrl: string;
    };
    export type CreateCheckoutResponse = ApiResponse<{
      sessionId: string;
      url: string;
    }>;
    export type GetSubscriptionResponse = ApiResponse<{
      tier: 'free' | 'premium' | 'premium_plus';
      status: 'active' | 'cancelled' | 'past_due' | 'none';
      currentPeriodEnd?: Date;
    }>;
  }
}
