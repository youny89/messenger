import { NextResponse } from "next/server";
import bcrypt from 'bcrypt'
import prisma from '@/app/libs/prismadb';

export async function POST (request:Request) {
    try {
        const body  = await request.json();
        const { email, name, password } = body;

        if(!email || !name || !password) {
            return new NextResponse('모든 필드를 채워주세요',{ status:400})
        }

        const emailExist = await prisma.user.findUnique({ where: { email }});

        if(emailExist) return new NextResponse('이미 존재하는 이메일 입니다.', { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma?.user.create({
            data: { email, name, hashedPassword}
        }) 

        return NextResponse.json(user);
    } catch (error) {
        console.log(error, 'REGISTRATION_ERROR');
        return new NextResponse('Internal Error',{ status: 500 });
    }
}