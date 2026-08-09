const getApiBaseUrl = (): string => {
  let envUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api').trim();
  envUrl = envUrl.replace(/\/+$/, '');
  if (!envUrl.endsWith('/api')) {
    envUrl = `${envUrl}/api`;
  }
  return envUrl;
};

const API_BASE_URL = getApiBaseUrl();

export class ApiClient {
  private static getHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('clerk_session_token') || localStorage.getItem('devforge_auth_token') || 'user_2N0000000000000000000000001'
      : 'user_2N0000000000000000000000001';

    const email = typeof window !== 'undefined' ? localStorage.getItem('devforge_user_email') || 'engineer@devforge.ai' : 'engineer@devforge.ai';
    const name = typeof window !== 'undefined' ? localStorage.getItem('devforge_user_name') || 'DevForge Engineer' : 'DevForge Engineer';

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-user-email': email,
      'x-user-name': name,
      ...customHeaders,
    };
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
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getHeaders(),
      });
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
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
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
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
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
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
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
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('clerk_session_token') || localStorage.getItem('devforge_auth_token') || 'user_2N0000000000000000000000001'
      : 'user_2N0000000000000000000000001';

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
