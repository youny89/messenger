import getUsers from "../actions/getUsers"
import SideBar from "../components/sidebar/SideBar"
import UserList from "./components/UserList";

const UserLayout = async ({children}:{children:React.ReactNode}) => {

  const users = await getUsers();

  return (
    <SideBar>
        <main className="h-full">
            <UserList items={users} />
            {children}
        </main>
    </SideBar>
  )
}

export default UserLayout