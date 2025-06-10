import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Outlet } from 'react-router-dom'

export default function TopBarLayout() {
  return (
    <div className="flex h-screen flex-col bg-[#F9FAFB]">
      <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4 bg-white">
        <span className="flex items-center gap-4 text-2xl font-bold">
          <FontAwesomeIcon icon={faDatabase} className="text-primary p-2" />
          <p>Product Database</p>
        </span>
      </div>

      <div className="p-4">
        <Outlet />
      </div>
    </div>
  )
}
