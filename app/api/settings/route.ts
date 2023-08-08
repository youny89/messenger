import getCurrentUser from '@/app/actions/getCurrentUser'
import prisma from '@/app/libs/prismadb'
import { NextResponse } from 'next/server';

export async function POST (
    request:Request
) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const {name, image} = body;

        if(!currentUser?.id || !currentUser?.email) return new NextResponse('Unauthorized',{ status: 401});
        if(!name || !image) return new NextResponse('Bad Request',{status: 400});

        const updatedUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                image,
                name
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.log(error, 'ERROR_SETTINGS')
        return new NextResponse('Error',{ status: 500})       
    }
}