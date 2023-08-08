import bcrypt from 'bcrypt'
import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import prisma from '@/app/libs/prismadb';

// need authOptions to create session session
export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name:"credentials",
            credentials: {
                email: { label:"이메일", type:"text"},
                password: {label: "비밀번호", type:"password"}
            },
            async authorize (credentials) {
                if(!credentials?.email || !credentials?.password) {
                    throw new Error('모든 필드를 채워주세요');
                }

                const user = await prisma.user.findUnique({
                    where : { email: credentials.email }
                })


                if(!user || !user.hashedPassword) {
                    throw new Error('이메일 혹은 비밀번호가 일치하지 않습니다.');
                }

                const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashedPassword)
                if(!isCorrectPassword) {
                    throw new Error('이메일 혹은 비밀번호가 일치하지 않습니다.');
                }

                return user;
            }
        })
    ],
    debug:process.env.NODE_ENV === 'development',
    session: { strategy: 'jwt'},
    secret:process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }