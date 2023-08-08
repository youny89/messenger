import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { HiChat } from  "react-icons/hi";
import { HiArrowLeftOnRectangle, HiUsers} from "react-icons/hi2"
import { signOut } from "next-auth/react";
import useConversation from "./useConversations";

// i wanto to dynamically change their active status depending on the current route or if conversation's id is open or not.
const useRoutes = () => {
    const pathname = usePathname();
    const { conversationId } = useConversation()

    const routes = useMemo(()=>[
        {
            label:'대화',
            href:"/conversations",
            icon: HiChat,
            active: pathname === '/conversations'|| !!conversationId 
        },
        {
            label:'유저',
            href:"/users",
            icon: HiUsers,
            active: pathname === '/users'
        },
        {
            label:'로그아웃',
            href:"#",
            icon: HiArrowLeftOnRectangle,
            onClick : () => signOut({redirect:true,callbackUrl:"/"})
        },

    ],[pathname, conversationId]);


    return routes;
}

export default useRoutes;
