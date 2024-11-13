import { LoginToken, User } from 'types/auth';

const BASE_URL = 'http://localhost:8090/api';

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

export const getCurrentUser = async () => await fetchApi<User>('/user');

export const login = async (email: string, language: string): Promise<LoginToken> =>
  await fetchApi('/user/login', 'POST', { email, language, dotsight: true });

export const logout = async (): Promise<void> => await fetchApi('/user/logout', 'POST');

export const checkToken = async (email: string, token: string): Promise<boolean> =>
  await fetchApi('/auth/token', 'POST', { email, token });
