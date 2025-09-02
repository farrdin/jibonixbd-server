export interface Donor {
  id: string;
  user_id: string;
  location: string;
  organization_name?: string;
  donation_history?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateDonorInput {
  email: string;
  password: string;
  name: string;
  phone: string;
  photo?: string;
  nid_number?: string;
  address?: string;
  division?: string;
  district?: string;
  upazila?: string;

  // Donor-specific fields
  location: string;
  organization_name?: string;
  donation_history?: string[];
  // Add verification method
  verification_method: 'email' | 'phone';
}
