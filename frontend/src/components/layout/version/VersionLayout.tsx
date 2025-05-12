import IconButton from '@/components/forms/IconButton'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import AddRelationship from '../product/AddRelationship'
import { UserAvatar } from '../TopBarLayout'

export default function VersionLayout() {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col bg-[#F9FAFB]">
      <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4 bg-white">
        <span className="flex items-center gap-2 text-2xl font-bold">
          <IconButton
            icon={faArrowLeft}
            color="primary"
            variant="light"
            isIconOnly={true}
            onPress={() => navigate(-1)}
          />
          <p>Relationships</p>
        </span>

        <div className="flex flex-row gap-4">
          <AddRelationship />

          <UserAvatar />
        </div>
      </div>

      <Outlet />
    </div>
  )
}
