import { NextResponse } from "next/server"
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from '@/app/libs/prismadb'
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
    conversationId?:string;
}

export async function DELETE (
    request:Request,
    { params }: { params: IParams }
) {

    try {
        const currnetUser = await getCurrentUser();
        const { conversationId } = params;
        if(!currnetUser?.id) return NextResponse.json(null)

        const existingConversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include : { users : true }         
        })

        if(!existingConversation) return NextResponse.json('Invalid ID', { status: 400});

        const deletedConversation = await prisma.conversation.deleteMany({
            where: { 
                id: conversationId,
                userIds : { hasSome: [currnetUser.id]}
            }
        })

        existingConversation.users.forEach(user=>{
            if(user.email) {
                pusherServer.trigger(user.email,'conversation:remove',existingConversation);
            }
        })

        return NextResponse.json(deletedConversation);

    } catch (error) {
        console.log(error,'ERROR_CONVERSATION_DELETE'); 
        return NextResponse.json(null)
    }

}