'use client'

import { User } from "@prisma/client"
import UserBox from "./UserBox"

interface UserListProps {
    items: User[]
}

const UserList:React.FC<UserListProps> = ({items}) => {
  return (
    <aside className="
        fixed inset-0 left-0
        pb-20 border-r border-gray-200
        overflow-y-auto
        lg:pb-0
        lg:left-20
        lg:block
        lg:w-80

        ">
            <div className="px-5">
                <div className="text-2xl font-bold text-neutral-500 py-4">유저 리스트</div>

                {items.map(item => (
                    <UserBox key={item.id} data={item}/>
                ))}
            </div>
    </aside>
  )
}

export default UserList