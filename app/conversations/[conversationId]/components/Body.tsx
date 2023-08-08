'use client'

import useConversation from "@/app/hooks/useConversations"
import { FullMessageType } from "@/app/types"
import { useEffect, useRef, useState } from "react"
import MessageBox from "./MessageBox"
import axios from "axios"
import { pusherClient } from "@/app/libs/pusher"
import { find } from "lodash"

interface BodyProps {
  initialMessages: FullMessageType[]
}

const Body:React.FC<BodyProps> = ({
  initialMessages
}) => {
    const [messages, setMessages] = useState(initialMessages)
    const bottomRef = useRef<HTMLDivElement>(null);

    const {conversationId} = useConversation();

    // everytime we open this body component or when this exact page loads, 
    // we are going to send a post route to seen last message
    useEffect(()=>{
      axios.post(`/api/conversations/${conversationId}/seen`)
    },[conversationId])


    //we're going to subscribe to our pusher 
    useEffect(()=>{
      //when we receive a new message, we're gonna alert everyone that we can seen that message.
      axios.post(`/api/conversations/${conversationId}/seen`)

      // server and client connected.
      pusherClient.subscribe(conversationId)

      // every time we join a conversation, what we have to do is we have to scroll all the way down to the latest message. 
      bottomRef?.current?.scrollIntoView();

      const messageHandler = (newMessage: FullMessageType) => {
        setMessages(prevMessages=>{
          // search if there is any message in our prevMessage array which already has id of this new message that is coming in.
          // so we just want to ensure that we don't accidentally make duplicate message when doing this function.
          if(find(prevMessages, {id: newMessage.id})) {
            return prevMessages
          }

          return [...prevMessages, newMessage];
        })

        bottomRef?.current?.scrollIntoView();

      }

      // in orter to update the message in real time and what exactly do we update real time in a message 
      // well we update its seen array so when i am in group chat i want to see real time updates if someone logged in has seen my messages so i wnat that to appear below this message here
      const updateMessageHandler = (newMessage:FullMessageType) => {
        setMessages(current=> current.map(currnetMessage=>{
          if(currnetMessage.id === newMessage.id) {
            return newMessage;
          }
          
          return currnetMessage;
        }))
      };

      // now we have to do is binding to our pusher client to expect message key in our case 'message:new'
      pusherClient.bind('message:new', messageHandler)

      pusherClient.bind('message:update', updateMessageHandler)

      return () => {
        pusherClient.unsubscribe(conversationId);
        pusherClient.unbind('message:new',messageHandler);
        pusherClient.unbind('message:update',updateMessageHandler)
      }
    },[conversationId])

    return (
      <div className="h-full overflow-y-auto">
        {messages.map((message, i)=>(
          <MessageBox 
            isLast={i === messages.length - 1}
            key={message.id}
            data={message}
          />
        ))}

        <div ref={bottomRef} className="pt-24"/>
      </div>
  )
}

export default Body