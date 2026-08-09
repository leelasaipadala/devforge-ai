const getApiBaseUrl = (): string => {
  let envUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api').trim();
  envUrl = envUrl.replace(/\/+$/, '');
  if (!envUrl.endsWith('/api')) {
    envUrl = `${envUrl}/api`;
  }
  return envUrl;
};

const API_BASE_URL = getApiBaseUrl();

type TokenGetter = () => Promise<string | null> | string | null;

export class ApiClient {
  private static customTokenGetter: TokenGetter | null = null;
  private static cachedToken: { value: string | null; expiry: number } | null = null;

  public static setTokenGetter(getter: TokenGetter | null) {
    this.customTokenGetter = getter;
    this.cachedToken = null; // Clear cached token on getter change
  }

  private static async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    // Fast path: Return cached token if valid (15 seconds cache)
    if (this.cachedToken && Date.now() < this.cachedToken.expiry) {
      return this.cachedToken.value;
    }

    let token: string | null = null;

    // 1. PRIMARY: Clerk session token via AuthContext-provided getter
    if (this.customTokenGetter) {
      try {
        token = await this.customTokenGetter();
      } catch {
        // Clerk token retrieval failed — do NOT fall back to demo
      }
    }

    // 2. SECONDARY: Direct Clerk window object (backup for when getter not yet set)
    if (!token) {
      const clerkWindow = (window as any).Clerk;
      if (clerkWindow && clerkWindow.session) {
        try {
          token = await clerkWindow.session.getToken();
        } catch {
          // ignore error
        }
      }
    }

    // 3. DEMO ONLY: If an explicit demo session exists in localStorage
    if (!token) {
      const demoSession = localStorage.getItem('devforge_demo_session');
      if (demoSession) {
        try {
          const parsed = JSON.parse(demoSession);
          if (parsed && parsed.token) {
            token = parsed.token;
          }
        } catch {
          localStorage.removeItem('devforge_demo_session');
        }
      }
    }

    // Cache valid token for 15 seconds for ultra-fast subsequent requests
    this.cachedToken = {
      value: token,
      expiry: Date.now() + 15000,
    };

    return token;
  }

  private static async getHeaders(customHeaders?: Record<string, string>): Promise<HeadersInit> {
    const token = await this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private static async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let serverMessage = '';
      try {
        const text = await res.text();
        if (text) {
          const parsed = JSON.parse(text);
          serverMessage = parsed.message || parsed.error?.message || parsed.error || '';
        }
      } catch {
        // Response was not JSON
      }

      const statusMessages: Record<number, string> = {
        401: 'Authentication required. Please sign in.',
        403: 'Access forbidden. You do not have permission.',
        404: 'The requested resource was not found.',
        500: 'Internal server error occurred. Please try again.',
      };

      const finalMsg = serverMessage || statusMessages[res.status] || `API Error ${res.status}: ${res.statusText}`;
      throw new Error(finalMsg);
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    return {} as T;
  }

  public static async get<T>(endpoint: string): Promise<T> {
    try {
      const headers = await this.getHeaders();
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
      return await this.handleResponse<T>(res);
    } catch (err: any) {
      if (err?.name === 'TypeError' && err?.message === 'Failed to fetch') {
        throw new Error('Unable to connect to DevForge backend server. Please verify backend service status.');
      }
      throw err;
    }
  }

  public static async post<T>(endpoint: string, body?: any): Promise<T> {
    try {
      const headers = await this.getHeaders();
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      return await this.handleResponse<T>(res);
    } catch (err: any) {
      if (err?.name === 'TypeError' && err?.message === 'Failed to fetch') {
        throw new Error('Unable to connect to DevForge backend server.');
      }
      throw err;
    }
  }

  public static async put<T>(endpoint: string, body?: any): Promise<T> {
    try {
      const headers = await this.getHeaders();
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      return await this.handleResponse<T>(res);
    } catch (err: any) {
      if (err?.name === 'TypeError' && err?.message === 'Failed to fetch') {
        throw new Error('Unable to connect to DevForge backend server.');
      }
      throw err;
    }
  }

  public static async delete<T>(endpoint: string): Promise<T> {
    try {
      const headers = await this.getHeaders();
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });
      return await this.handleResponse<T>(res);
    } catch (err: any) {
      if (err?.name === 'TypeError' && err?.message === 'Failed to fetch') {
        throw new Error('Unable to connect to DevForge backend server.');
      }
      throw err;
    }
  }

  public static async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = await this.getToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return await this.handleResponse<T>(res);
    } catch (err: any) {
      if (err?.name === 'TypeError' && err?.message === 'Failed to fetch') {
        throw new Error('Unable to upload file to DevForge backend server.');
      }
      throw err;
    }
  }
}
