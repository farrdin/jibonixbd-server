export type UserRole = 'VICTIM' | 'VOLUNTEER' | 'DONOR' | 'MODERATOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  photo?: string;
  role: UserRole;
  is_verified: boolean;
  nid_number?: string;
  address?: string;
  division?: string;
  district?: string;
  upazila?: string;
  created_at: string;
  updated_at: string;
}
