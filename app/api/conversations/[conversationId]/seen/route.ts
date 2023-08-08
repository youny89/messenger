import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from '@/app/libs/prismadb'
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
    conversationId?:string;
}

export async function POST (
    request:Request,
    { params }: {params: IParams}
) {
    try {
        const currentUser = await getCurrentUser();
        const {
            conversationId
        } = params;

        if(!currentUser?.email || !currentUser?.id) return new NextResponse('Unauthorized',{ status:401})

        // Find the existing conversation
        const conversation = await prisma.conversation.findUnique({
            where : { id: conversationId },
            include : {
                messages: {
                    include : { seen: true}
                },
                users: true
            }
        })

        if(!conversation) return new NextResponse('Invalid ID',{ status: 400})

        // find the last message
        const lastMessage = conversation.messages[conversation.messages.length - 1];

        if(!lastMessage) return NextResponse.json(conversation);

        // Update seen of last message
        const updateMessage = await prisma.message.update({
            where: { id: lastMessage.id },
            include: {
                sender:true,
                seen: true
            },
            data: {
                seen: {
                    connect: { id: currentUser.id}
                }
            }
        })

        await pusherServer.trigger(currentUser.email ,'conversation:update',{
            id:conversationId,
            messages:[updateMessage]
        });
        
        // checking if we already have seen this message or not 
        if(lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
            return NextResponse.json(conversation)
        }

        //if we did not see the last message that means that we are not in the array seen, that means that we can go ahead and alert every new user that we have seen that message.
        await pusherServer.trigger(conversationId!,'message:update', updateMessage)

        return NextResponse.json(updateMessage);
    } catch (error) {
        console.log(error,'ERROR_MESSAGES_SEEN')
        return new NextResponse('Internal Error',{ status: 500})
    }
}