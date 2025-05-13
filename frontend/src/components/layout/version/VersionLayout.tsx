import IconButton from '@/components/forms/IconButton'
import { faArrowLeft, faDatabase } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Chip } from '@heroui/chip'
import { Outlet, useNavigate } from 'react-router-dom'
import AddRelationship from '../product/AddRelationship'
import { UserAvatar } from '../TopBarLayout'
import { Attribute } from '../vendor/VendorLayout'

export default function VersionLayout() {
  const navigate = useNavigate()
  const { versionId } = {
    versionId: '1.2.1',
  }

  return (
    <div className="flex h-screen flex-col bg-[#F9FAFB]">
      <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4 bg-white">
        <span className="flex items-center gap-2 text-2xl font-bold">
          <FontAwesomeIcon
            icon={faDatabase}
            className="cursor-pointer text-primary"
            onClick={() => navigate('/vendors')}
          />

          <IconButton
            icon={faArrowLeft}
            color="primary"
            variant="light"
            isIconOnly={true}
            onPress={() => navigate(-1)}
          />
          <p>Product X - Relationships</p>

          <Chip variant="flat" className="rounded-md ml-2">
            Version: {versionId}
          </Chip>
        </span>

        <div className="flex flex-row gap-4">
          <AddRelationship />

          <UserAvatar />
        </div>
      </div>

      <div className="flex flex-row h-full">
        <div className="flex w-1/3 max-w-64 flex-col gap-4 border-r bg-white p-4">
          <Attribute label="Version" value={versionId} />
          <Attribute label="Relationships" value="2" />
          <Attribute label="Description" value="Version Description" />
        </div>
        <div className="p-4 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
