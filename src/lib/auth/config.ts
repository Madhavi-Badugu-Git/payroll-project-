import { PrismaClient } from '@/generated/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcryptjs from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            employee: true,
            userRoles: {
              where: { isActive: true },
              include: {
                role: true,
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password,
          user.hashedPassword || ''
        );

        if (!isPasswordValid) {
          return null;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { updatedAt: new Date() }, // Use updatedAt instead of lastLoginAt
        });

        // Extract roles from userRoles
        const roles = user.userRoles.filter(ur => ur.isActive).map(ur => ur.role.name);

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          roles,
          employee: user.employee
            ? {
                id: user.employee.id,
                employeeNumber: user.employee.employeeNumber,
                firstName: user.employee.firstName,
                lastName: user.employee.lastName,
                currentDesignation: user.employee.currentDesignation,
              }
            : null,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.employee = user.employee;
        console.log('🔍 DEBUG: JWT callback - storing employee and roles in token:', {
          userId: user.id,
          hasEmployee: !!user.employee,
          roles: user.roles,
          employee: user.employee,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.roles = token.roles || [];
        session.user.employee = token.employee || null;
        console.log('🔍 DEBUG: Session callback - setting employee and roles in session:', {
          userId: token.id,
          hasEmployee: !!token.employee,
          roles: token.roles,
          employee: token.employee,
        });
      }
      return session;
    },
  },
  pages: {
    signIn: process.env.NODE_ENV === 'production' ? '/payroll/auth/signin' : '/auth/signin',
    error: process.env.NODE_ENV === 'production' ? '/payroll/auth/error' : '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
