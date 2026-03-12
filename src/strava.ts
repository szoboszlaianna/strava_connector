
import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";
import { promises as fs } from "fs";
import path from "path";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET", "STRAVA_ACCESS_TOKEN", "STRAVA_REFRESH_TOKEN"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;

// Token storage interface
export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export class StravaTokenManager {
  private tokens: StravaTokens;
  private tokenFile: string;

  constructor() {
    this.tokenFile = path.join(process.cwd(), '.strava_tokens.json');
    this.tokens = {
      access_token: process.env.STRAVA_ACCESS_TOKEN!,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN!,
      expires_at: undefined // Will be set after first refresh
    };

    // Try to load existing tokens
    this.loadTokens();
  }

  private async loadTokens(): Promise<void> {
    try {
      const data = await fs.readFile(this.tokenFile, 'utf8');
      const storedTokens = JSON.parse(data);
      if (storedTokens.access_token && storedTokens.refresh_token) {
        this.tokens = storedTokens;
        console.error('Loaded existing tokens from file');
      }
    } catch (error) {
      console.error('No existing token file found, using environment variables');
    }
  }

  private async saveTokens(): Promise<void> {
    try {
      await fs.writeFile(this.tokenFile, JSON.stringify(this.tokens, null, 2));
      console.error('Saved updated tokens to file');
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokens.expires_at) {
      return false; // Assume valid if we don't have expiry info
    }
    // Check if token expires in the next 5 minutes
    return Date.now() / 1000 > (this.tokens.expires_at - 300);
  }

  async refreshTokens(): Promise<void> {
    try {
      console.error('Refreshing Strava tokens...');

      const response = await axios.post('https://www.strava.com/oauth/token', {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        refresh_token: this.tokens.refresh_token,
        grant_type: 'refresh_token'
      });

      const { access_token, refresh_token, expires_at } = response.data;

      this.tokens = {
        access_token,
        refresh_token,
        expires_at
      };

      await this.saveTokens();
      console.error('Successfully refreshed Strava tokens');
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      throw new Error('Failed to refresh Strava tokens. Please re-authorize the application.');
    }
  }

  async getValidAccessToken(): Promise<string> {
    if (this.isTokenExpired()) {
      await this.refreshTokens();
    }
    return this.tokens.access_token;
  }
}

// Create token manager instance
export const tokenManager = new StravaTokenManager();

// Strava API client with automatic token refresh
export const createStravaApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: "https://www.strava.com/api/v3",
  });

  // Add request interceptor to include fresh token
  client.interceptors.request.use(async (config) => {
    const token = await tokenManager.getValidAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Add response interceptor to handle 401 errors
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        console.error('Received 401, attempting token refresh...');
        try {
          await tokenManager.refreshTokens();
          // Retry the original request with new token
          const token = await tokenManager.getValidAccessToken();
          error.config.headers.Authorization = `Bearer ${token}`;
          return axios.request(error.config);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Authentication failed. Please re-authorize the application.');
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Error handling function
export function handleStravaError(error: any): Error {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    const statusCode = error.response?.status;

    if (statusCode === 401) {
      return new Error(
        "Strava authentication failed. Please check your access token.",
      );
    } else if (statusCode === 403) {
      return new Error(
        "Strava access forbidden. Your token might not have the required permissions.",
      );
    } else if (statusCode === 404) {
      return new Error("Strava resource not found. Please check your request.");
    } else {
      return new Error(`Strava API error: ${errorMessage} (status code: ${statusCode})`);
    }
  } else {
    return new Error(`Unexpected error: ${error.message}`);
  }
}

// Export configured Strava API client
export const stravaApi = createStravaApiClient();
