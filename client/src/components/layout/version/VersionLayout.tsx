import IconButton from '@/components/forms/IconButton'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Chip } from '@heroui/chip'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import AddRelationship from '../product/AddRelationship'
import { Attribute } from '../vendor/VendorLayout'
import client from '@/client'

export default function VersionLayout() {
  const navigate = useNavigate()
  const { versionId } = useParams()

  const { data: version } = client.useQuery(
    'get',
    `/api/v1/product-versions/{id}`,
    {
      params: {
        path: {
          id: versionId || '',
        }
      }
    }
  )

  if (!version) {
    return null
  }

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
          <p>Product {version.full_name || ''} - Relationships</p>

          <Chip variant="flat" className="rounded-md ml-2">
            Version: {version.name}
          </Chip>
        </span>

        <div className="flex flex-row gap-4">
          <AddRelationship />
        </div>
      </div>

      <div className="flex flex-row h-full">
        <div className="flex w-1/3 max-w-64 flex-col gap-4 border-r bg-white p-4">
          <Attribute label="Version" value={version.name} />
          <Attribute label="Description" value="Version Description" />
          <Attribute label="Relationships" value={`0`} />
        </div>
        <div className="p-4 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
