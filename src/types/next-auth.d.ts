import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      imageUrl?: string | null;
      roles?: string[];
      employee?: {
        id: string;
        employeeNumber: string;
        firstName: string;
        lastName: string;
        currentDesignation: string;
      } | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    roles?: string[];
    employee?: {
      id: string;
      employeeNumber: string;
      firstName: string;
      lastName: string;
      currentDesignation: string;
    } | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    roles?: string[];
    employee?: {
      id: string;
      employeeNumber: string;
      firstName: string;
      lastName: string;
      currentDesignation: string;
    } | null;
  }
}
