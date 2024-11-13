export interface License {
  active: boolean;
  product: 'braillee' | 'dotsight';
}

export interface User {
  id: number;
  name: string;
  email: string;
  licenses: License[];
}

export interface LoginToken {
  email: string;
  token: string;
}
