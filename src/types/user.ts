// User-related type definitions

export interface UserMetadata {
  empId?: string;
  role?: string[];
}

export interface UserEmailAddress {
  emailAddress: string;
}

export interface User {
  publicMetadata?: UserMetadata;
  privateMetadata?: UserMetadata;
  emailAddresses?: UserEmailAddress[];
}

export interface UserSession {
  userId: string;
  sessionId: string;
  createdAt: string;
  expiresAt: string;
}
