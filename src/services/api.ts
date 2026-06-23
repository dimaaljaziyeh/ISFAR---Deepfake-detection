const API_BASE_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  access_token?: string;
  user?: any;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  roles?: string[];
}

export interface Detection {
  id: string;
  fileName: string;
  mediaType: 'IMAGE' | 'VIDEO';
  result: 'REAL' | 'FAKE';
  confidence: number;
  createdAt: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async signup(email: string, password: string) {
    const response = await this.request<{ access_token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  async createDetection(data: {
    fileName: string;
    mediaType: 'IMAGE' | 'VIDEO';
  }): Promise<Detection> {
    return this.request<Detection>('/detections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDetections(): Promise<Detection[]> {
    return this.request<Detection[]>('/detections');
  }

  async deleteDetection(id: string): Promise<void> {
    return this.request<void>(`/detections/${id}`, {
      method: 'DELETE',
    });
  }

  async submitContact(data: {
    name: string;
    email: string;
    message: string;
  }): Promise<void> {
    return this.request<void>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  logout() {
    this.setToken(null);
  }


  
  async uploadImage(file: File) {
    const formData = new FormData();
  formData.append("image", file);

    const response = await fetch(
      `${API_BASE_URL}/detections`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Backend Error:", errorText);

      throw new Error(errorText);
    }

    return response.json();
  }


}


export const api = new ApiClient();
