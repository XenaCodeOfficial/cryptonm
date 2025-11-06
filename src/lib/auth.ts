import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const userType = credentials.userType || 'client'

        if (userType === 'admin') {
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email },
          })

          if (!admin) {
            return null
          }

          const isValid = await compare(credentials.password, admin.password)

          if (!isValid) {
            return null
          }

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            image: admin.avatar,
            role: 'admin',
          }
        } else {
          const client = await prisma.client.findUnique({
            where: { email: credentials.email },
          })

          if (!client || !client.password) {
            return null
          }

          const isValid = await compare(credentials.password, client.password)

          if (!isValid) {
            return null
          }

          return {
            id: client.id,
            email: client.email,
            name: `${client.firstName} ${client.lastName}`,
            image: client.avatar,
            role: 'client',
          }
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
