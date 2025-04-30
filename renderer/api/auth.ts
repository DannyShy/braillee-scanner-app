import { LoginToken, User } from 'types/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090/api';
const IS_DEV = process.env.NODE_ENV === 'development';

const fetchApi = async <ResponseType = unknown, BodyType = unknown>(
  endpoint: string,
  method: string = 'GET',
  body?: BodyType,
): Promise<ResponseType> => {
  const url = `${BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
};

export const getCurrentUser = async () => {
  if (IS_DEV) {
    return {
      id: 123,
      name: 'Dev User',
      email: 'dev@hotovo.com',
      licenses: [
        {
          active: true,
          product: 'dotsight',
        },
      ],
    } as User;
  }
  return fetchApi<User>('/user');
};

export const login = async (email: string, language: string): Promise<LoginToken> => {
  if (IS_DEV) {
    return {
      email: 'dev@hotovo.com',
      token: '1234567890abcdef1234567890abcdef',
    };
  }

  return fetchApi('/user/login', 'POST', { email, language, dotsight: true });
};

export const logout = async (): Promise<void> => await fetchApi('/user/logout', 'POST');

export const checkToken = async (email: string, token: string): Promise<boolean> => {
  if (IS_DEV) {
    return true;
  }

  return fetchApi('/auth/token', 'POST', { email, token });
};
