'use client';

import useConversation from "@/app/hooks/useConversations";
import useRoutes from "@/app/hooks/useRoutes"
import MobileItem from "./MobileItem";

const MobileFooter = () => {
    const routes = useRoutes();
    const { isOpen } = useConversation();

    // Only want the user to have the message form not mobile footer.
    if(isOpen) return null;


    return (
        <div
            className="fixed justify-between w-full bottom-0 z-40 flex items-center border-t-[1px] bg-white lg:hidden"
        >
            {routes.map(route=>(<MobileItem
                key={route.label}
                href={route.href}
                active={route.active}
                icon={route.icon}
                onClick={route.onClick}
            />))}
        </div>
    )
}

export default MobileFooter