import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from '@/app/libs/prismadb';
import { pusherServer } from "@/app/libs/pusher";

// 1:1 -> need userId
// 1:n -> need userId, members, name( room name )

export async function POST (request:Request) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const {
            userId,
            isGroup,
            members,
            name
        } = body;

        if(!currentUser || !currentUser?.email){
            return new NextResponse('Unauthorized', {status: 401 });
        }

        if(isGroup && (!members || members.length < 2 || !name)) {
            return new NextResponse('Invalid data', { status:400})
        }

        //그룹채팅
        if(isGroup) {
            const newConversation = await prisma.conversation.create({
                data : {
                    name,
                    isGroup,
                    users : {
                        connect: [
                            ...members.map((member:{value: string})=> ({ id: member.value })),
                            { id: currentUser.id }
                        ]
                    }
                },
                include : { users: true }
            });

            newConversation.users.forEach(user=>{
                if(user?.email) {
                    // channel which we are subscribing to this user' individual email, it's unique.
                    // because we have it in the session which we are going to to use in the client
                    // the key we are sending is conversation:new and client  is going to be listening to this key on this channel and it's going to update our sidebar of conversation with new conversation
                    pusherServer.trigger(user.email,'conversation:new',newConversation)
                }
            })

            return NextResponse.json(newConversation);
        }

        const existingConversation = await prisma.conversation.findMany({
            where : {
                OR: [
                    {
                        userIds: { equals: [currentUser.id, userId] }
                    },
                    {
                        userIds: { equals: [userId, currentUser.id] }
                    },
                ]
            }
        })

        const singleConversation = existingConversation[0];
        if(singleConversation) {
            return NextResponse.json(singleConversation);
        }

        const newConversation = await prisma.conversation.create({
            data : {
                users : {
                    connect: [
                        { id: currentUser.id },
                        { id: userId }
                    ]
                },
            },
            include: { users: true }
        });

        newConversation.users.map(user=>{
            if(user.email) {
                pusherServer.trigger(user.email,'conversation:new', newConversation);
            }
        })

        return NextResponse.json(newConversation);
    } catch (error) {
        console.log(error,'ERROR_CREATE_CONVERSATION')
        return new NextResponse('Internal Error',{ status: 500})
    }
}