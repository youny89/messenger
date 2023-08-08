'use client'

import Avatar from "@/app/components/Avatar"
import useOtherUser from "@/app/hooks/useOtherUser"
import { Conversation, User } from "@prisma/client"
import Link from "next/link"
import { useMemo, useState } from "react"
import { HiChevronLeft } from "react-icons/hi"
import { HiEllipsisHorizontal } from "react-icons/hi2"
import ProfileDrawer from "../ProfileDrawer"
import AvatarGroup from "@/app/components/AvatarGroup"
import useActiveList from "@/app/hooks/useActiveList"

interface HeaderProps {
    conversation: Conversation & {
        users: User[]
    }
}

const Header:React.FC<HeaderProps> =  ({conversation}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const otherUser =  useOtherUser(conversation)
  const {members} = useActiveList();
  const isActive = members.indexOf(otherUser?.email!) !== -1
  const statusText = useMemo(()=>{
    if(conversation.isGroup) return `${conversation.name} - ${conversation.userIds.length}명`
    return isActive ? '온라인':'오프라인'
  },[conversation, isActive])
  return (
    <>
      <ProfileDrawer 
        data={conversation}
        isOpen={drawerOpen}
        onClose={()=> setDrawerOpen(false)}
      />
      <div className="flex justify-between border-b items-center px-3 py-1">
          <div className="flex items-center gap-3">
              <Link href="/conversations">
                  <HiChevronLeft
                      size={32}
                      className="text-sky-500 hover:text-sky-600 lg:hidden"/>
              </Link>
              {conversation?.isGroup ? <AvatarGroup users={conversation.users} />: <Avatar />}
              <div className="flex flex-col gap-1">
                  <span className="">{conversation.name || otherUser.name}</span>
                  <span className="text-sm font-light text-neutral-500">{statusText}</span>
              </div>
          </div>
          <HiEllipsisHorizontal
              size={32}
              onClick={()=> setDrawerOpen(true)}
              className="text-sky-500 cursor-pointer hover:text-sky-600 transition"
              />
      </div>
    </>
  )
}

export default Header