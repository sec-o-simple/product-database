import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Avatar } from '@heroui/react'
import { Outlet } from 'react-router-dom'

export default function TopBarLayout() {
  return (
    <div className="flex h-screen flex-col bg-[#F9FAFB]">
      <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4 bg-white">
        <span className="flex items-center gap-4 text-2xl font-bold">
          <FontAwesomeIcon icon={faDatabase} className="text-primary" />
          <p>Product Database</p>
        </span>

        <UserAvatar />
      </div>

      <div className="p-4">
        <Outlet />
      </div>
    </div>
  )
}

export function UserAvatar() {
  return <Avatar name="MM" color="primary" />
  // return (
  //   <div className="flex items-center gap-4">
  //     <Popover placement="bottom">
  //       <PopoverTrigger>
  //         <Avatar
  //           name="MM"
  //           color="primary"
  //           className="hover:cursor-pointer"
  //         />
  //       </PopoverTrigger>
  //       <PopoverContent>
  //         <div className="px-1 py-2 cursor-pointer bg-gray-50">
  //           <div className="text-red-500">
  //             <FontAwesomeIcon
  //               icon={faArrowRightFromBracket}
  //               className="mr-2"
  //             />
  //             Logout
  //           </div>
  //         </div>
  //       </PopoverContent>
  //     </Popover>
  //   </div>
  // )
}
