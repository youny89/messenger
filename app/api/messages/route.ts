import prisma from '@/app/libs/prismadb'
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import { pusherServer } from '@/app/libs/pusher';

export async function POST (request:Request) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const {
            message,
            image,
            conversationId
        } = body;

        if(!currentUser?.email || !currentUser.id) return NextResponse.json('Unauthorized',{ status: 401});


/**
 * {
    "id": "64c88ed63ca0e2999b59ceb5",
    "body": "안녕",
    "image": null,
    "createdAt": "2023-08-01T04:49:25.787Z",
    "seenIds": [
        "64c5fe84b7c32982f7c1c91f"
    ],
    "conversationId": "64c6ff34d1c71f009877f721",
    "senderId": "64c5fe84b7c32982f7c1c91f",
    "sender": {
        "id": "64c5fe84b7c32982f7c1c91f",
        "name": "유니",
        "email": "youny@kakao.com",
        "emailVerified": null,
        "image": null,
        "hashedPassword": "$2b$12$2DWZfGp3ZQufH6EuO.UrSOcw6fnhPS7CU3lgFPGDiBcLPUXYoPV76",
        "createdAt": "2023-07-30T06:09:07.717Z",
        "updatedAt": "2023-07-30T06:09:07.717Z",
        "conversationIds": [
            "64c6ff34d1c71f009877f721",
            "64c8493debc75a09f94705ec"
        ],
        "seenMessageIds": [
            "64c88ed63ca0e2999b59ceb5"
        ]
    },
    "seen": [
        {
            "id": "64c5fe84b7c32982f7c1c91f",
            "name": "유니",
            "email": "youny@kakao.com",
            "emailVerified": null,
            "image": null,
            "hashedPassword": "$2b$12$2DWZfGp3ZQufH6EuO.UrSOcw6fnhPS7CU3lgFPGDiBcLPUXYoPV76",
            "createdAt": "2023-07-30T06:09:07.717Z",
            "updatedAt": "2023-07-30T06:09:07.717Z",
            "conversationIds": [
                "64c6ff34d1c71f009877f721",
                "64c8493debc75a09f94705ec"
            ],
            "seenMessageIds": [
                "64c88ed63ca0e2999b59ceb5"
            ]
        }
    ]
}
*/
        const newMessage = await prisma.message.create({
            data: {
                body:message,
                image,
                conversation: {
                    connect : { id: conversationId }
                },
                sender: {
                    connect: { id: currentUser.id }
                },
                seen: {
                    connect : { id: currentUser.id}
                }
            },
            include: {
                sender: true,
                seen: true
            }
        })


        // update conversation with new message.
        // using  updatedConversation with pusher.
        const updatedConversation = await prisma.conversation.update({
            where : { id: conversationId },
            data : {
                lastMessageAt: new Date(),
                messages: {
                    connect : { id: newMessage.id }
                }
            },
            include: {
                users: true,
                messages : {
                    include : { seen: true}
                }
            }
        });

        // add newmessage in real time.
        // conversationId is channel which we are sending this message a new key called conversationId,
        // so every user which is listening to this channel in our case conversationId is going to get updated
        await pusherServer.trigger(conversationId,'message:new', newMessage)

        const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

        // this is going to serve for sidebar
        // everytime we create a new message, we also send an update to every single user in that conversation
        // we send an update to thier channel email with conversation's updates.

        updatedConversation.users.map((user) => {
            pusherServer.trigger(user.email!, 'conversation:update', {
                id: conversationId,
                messages: [lastMessage]
            })
        })

        return NextResponse.json(newMessage);
    } catch (error) {
        console.log(error,'ERROR_MESSAGES');
        return new NextResponse('InternalError',{ status: 500});
    }


}