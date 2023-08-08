import getCurrentUser from "@/app/actions/getCurrentUser"
import DesktopSidebar from "./DesktopSidebar"
import MobileFooter from "./MobileFooter"

const SideBar = async ({children}:{children:React.ReactNode}) => {

  const currentUser = await getCurrentUser();


  return (
    <>
        <DesktopSidebar currentUser={currentUser}/>
        <MobileFooter />
        <main className="h-full lg:pl-20">
            {children}
        </main>
    </>
  )
}

export default SideBar