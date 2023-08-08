import getConversation from "@/app/actions/getConversation";
import getMessages from "@/app/actions/getMessages";
import EmptyState from "@/app/components/EmptyState";
import Header from "./components/Header";
import Body from "./components/Body";
import Form from "./components/Form";

interface IParams {
    conversationId: string;
}

const ConversationId = async ({params}: {params: IParams}) => {
    const conversation = await getConversation(params.conversationId);
    const  messages = await getMessages(params.conversationId)

    if(!conversation) return (
        <div className="lg:pl-80 h-full">
            <div className="h-full flex flex-col">
                <EmptyState />
            </div>
        </div>
    )

    return (
        <div className="lg:pl-80 h-full">
            <div className="h-full flex flex-col">
                <Header conversation={conversation}/>
                {/* initialMessage will only serve to load when user loads the page.
                    but every additional message is actually going to be dynamically added using pusher,
                */}
                <Body initialMessages={messages}/>
                <Form />
            </div>
        </div>
    )
}

export default ConversationId